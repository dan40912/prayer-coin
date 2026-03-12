"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";

const AudioContext = createContext(null);
const hasOwn = Object.prototype.hasOwnProperty;

function getTrackKey(track) {
  if (!track) return null;
  if (track.id !== undefined && track.id !== null) return `id:${track.id}`;
  if (track.voiceUrl) return `url:${track.voiceUrl}`;
  return null;
}

function normalizeDuration(value) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

export function AudioProvider({ children }) {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoop, setIsLoop] = useState(false);
  const [trackDurations, setTrackDurations] = useState({});

  const audioRef = useRef(null);
  const playlistRef = useRef([]);
  const currentIndexRef = useRef(-1);
  const isLoopRef = useRef(false);
  const trackDurationsRef = useRef({});
  const pendingSeekRef = useRef(null);
  const probingKeysRef = useRef(new Set());

  const setDurationForTrack = useCallback((track, seconds) => {
    const key = getTrackKey(track);
    if (!key) return;
    const normalized = normalizeDuration(seconds);
    setTrackDurations((prev) => {
      if (hasOwn.call(prev, key) && prev[key] === normalized) return prev;
      return { ...prev, [key]: normalized };
    });
  }, []);

  const stopAndResetAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
  }, []);

  // Initialize Audio element
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();

      const audio = audioRef.current;

      const updateProgress = () => {
        setProgress(audio.currentTime);
        const nextDuration = normalizeDuration(audio.duration);
        setDuration(nextDuration);
        const track = playlistRef.current[currentIndexRef.current];
        if (track && nextDuration > 0) {
          setDurationForTrack(track, nextDuration);
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentIndex((prevIndex) => {
          const total = playlistRef.current.length;
          if (total === 0) return -1;
          if (prevIndex < total - 1) return prevIndex + 1;
          if (isLoopRef.current) return 0;
          return prevIndex;
        });
      };

      const handleLoadedMetadata = () => {
        updateProgress();
        if (pendingSeekRef.current === null) return;
        const target = Math.max(0, pendingSeekRef.current);
        const maxTime = normalizeDuration(audio.duration);
        const nextTime = maxTime > 0 ? Math.min(target, maxTime) : target;
        audio.currentTime = nextTime;
        setProgress(nextTime);
        pendingSeekRef.current = null;
      };

      audio.addEventListener("timeupdate", updateProgress);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        audio.pause();
        audio.removeEventListener("timeupdate", updateProgress);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [setDurationForTrack]);

  const playTrack = useCallback((track) => {
    if (!track?.voiceUrl) return;

    setPlaylist((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          (track.id && item.id === track.id) ||
          (item.voiceUrl && item.voiceUrl === track.voiceUrl)
      );

      if (existingIndex >= 0) {
        setCurrentIndex(existingIndex);
        return prev;
      }

      const deduped = prev.filter(
        (item) =>
          (track.id ? item.id !== track.id : true) &&
          (item.voiceUrl ? item.voiceUrl !== track.voiceUrl : true)
      );
      setCurrentIndex(0);
      return [track, ...deduped];
    });
    setIsExpanded(true);
  }, []);

  const setQueue = useCallback((tracks, startIndex = 0) => {
    const normalized = Array.isArray(tracks)
      ? tracks.filter((track) => track?.voiceUrl)
      : [];

    setPlaylist(normalized);

    if (!normalized.length) {
      stopAndResetAudio();
      setCurrentIndex(-1);
      return;
    }

    if (startIndex < 0) {
      stopAndResetAudio();
      setCurrentIndex(-1);
      return;
    }

    const safeIndex = Math.min(Math.max(startIndex, 0), normalized.length - 1);
    setCurrentIndex(safeIndex);
    setIsExpanded(true);
  }, [stopAndResetAudio]);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Play failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const seekQueue = useCallback((time) => {
    const audio = audioRef.current;
    const tracks = playlistRef.current;
    if (!audio || !tracks.length) return;

    const durations = tracks.map((track) => {
      const key = getTrackKey(track);
      return key ? normalizeDuration(trackDurationsRef.current[key]) : 0;
    });
    const knownTotal = durations.reduce((sum, value) => sum + value, 0);
    if (knownTotal <= 0) return;

    const target = Math.min(Math.max(time, 0), knownTotal);
    let accumulated = 0;
    let targetIndex = -1;
    let targetOffset = 0;

    for (let index = 0; index < tracks.length; index += 1) {
      const trackDuration = durations[index];
      if (trackDuration <= 0) continue;
      const nextAccumulated = accumulated + trackDuration;
      if (target <= nextAccumulated || index === tracks.length - 1) {
        targetIndex = index;
        targetOffset = Math.min(Math.max(target - accumulated, 0), trackDuration);
        break;
      }
      accumulated = nextAccumulated;
    }

    if (targetIndex < 0) return;

    if (targetIndex !== currentIndexRef.current) {
      pendingSeekRef.current = targetOffset;
      setCurrentIndex(targetIndex);
      return;
    }

    audio.currentTime = targetOffset;
    setProgress(targetOffset);
  }, []);

  const playNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const total = playlistRef.current.length;
      if (total === 0) return -1;
      if (prevIndex < total - 1) return prevIndex + 1;
      if (isLoop) return 0;
      setIsPlaying(false);
      return prevIndex;
    });
  }, [isLoop]);

  const playPrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  }, []);

  const selectTrack = useCallback((index) => {
    setCurrentIndex((prevIndex) => {
      if (index < 0 || index >= playlistRef.current.length) {
        return prevIndex;
      }
      return index;
    });
    setIsExpanded(true);
  }, []);

  const removeTrack = useCallback((trackId) => {
    setPlaylist((prev) => {
      const index = prev.findIndex((track) => track.id === trackId);
      if (index === -1) return prev;
      const next = prev.filter((track) => track.id !== trackId);

      setCurrentIndex((prevIndex) => {
        if (next.length === 0) {
          stopAndResetAudio();
          return -1;
        }
        if (index < prevIndex) {
          return Math.max(prevIndex - 1, 0);
        }
        if (index === prevIndex) {
          return Math.min(prevIndex, next.length - 1);
        }
        return prevIndex;
      });

      return next;
    });
  }, [stopAndResetAudio]);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    isLoopRef.current = isLoop;
  }, [isLoop]);

  useEffect(() => {
    trackDurationsRef.current = trackDurations;
  }, [trackDurations]);

  useEffect(() => {
    if (typeof window === "undefined" || !playlist.length) return undefined;

    const cleaners = [];

    playlist.forEach((track) => {
      const key = getTrackKey(track);
      if (!key || !track.voiceUrl) return;
      if (hasOwn.call(trackDurationsRef.current, key)) return;
      if (probingKeysRef.current.has(key)) return;

      probingKeysRef.current.add(key);
      const probe = new Audio();
      probe.preload = "metadata";

      const finalize = (seconds) => {
        setTrackDurations((prev) => {
          if (hasOwn.call(prev, key)) return prev;
          return { ...prev, [key]: normalizeDuration(seconds) };
        });
        probingKeysRef.current.delete(key);
        probe.removeEventListener("loadedmetadata", onMetadata);
        probe.removeEventListener("error", onError);
      };

      const onMetadata = () => finalize(probe.duration);
      const onError = () => finalize(0);

      probe.addEventListener("loadedmetadata", onMetadata);
      probe.addEventListener("error", onError);
      probe.src = track.voiceUrl;
      probe.load();

      cleaners.push(() => {
        probingKeysRef.current.delete(key);
        probe.removeEventListener("loadedmetadata", onMetadata);
        probe.removeEventListener("error", onError);
      });
    });

    return () => {
      cleaners.forEach((clean) => clean());
    };
  }, [playlist]);

  // Handle track changes
  useEffect(() => {
    if (currentIndex >= 0 && playlist[currentIndex] && audioRef.current) {
      const track = playlist[currentIndex];
      const audio = audioRef.current;

      audio.src = track.voiceUrl;
      const knownDuration = normalizeDuration(trackDurationsRef.current[getTrackKey(track)]);
      setDuration(knownDuration);
      setProgress(0);
      audio.play().then(() => setIsPlaying(true)).catch((e) => console.error("Play error", e));
      return;
    }
    setIsPlaying(false);
  }, [currentIndex, playlist]);

  const currentTrack = currentIndex >= 0 ? playlist[currentIndex] : null;
  const queueDuration = useMemo(
    () =>
      playlist.reduce((sum, track) => {
        const key = getTrackKey(track);
        if (!key) return sum;
        return sum + normalizeDuration(trackDurations[key]);
      }, 0),
    [playlist, trackDurations]
  );
  const queueProgress = useMemo(() => {
    if (currentIndex < 0 || !playlist.length) return 0;

    let elapsed = 0;
    for (let index = 0; index < playlist.length; index += 1) {
      const track = playlist[index];
      const trackDuration = normalizeDuration(trackDurations[getTrackKey(track)]);
      if (index < currentIndex) {
        elapsed += trackDuration;
        continue;
      }
      if (index === currentIndex) {
        elapsed += trackDuration > 0 ? Math.min(progress, trackDuration) : Math.max(progress, 0);
      }
      break;
    }
    return elapsed;
  }, [currentIndex, playlist, progress, trackDurations]);

  const value = {
    currentTrack,
    playlist,
    isPlaying,
    isExpanded,
    progress,
    duration,
    queueProgress,
    queueDuration,
    isLoop,
    setIsExpanded,
    playTrack,
    setQueue,
    togglePlay,
    seek,
    seekQueue,
    playNext,
    playPrev,
    setIsLoop,
    selectTrack,
    removeTrack,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
