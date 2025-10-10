"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PRAYER_RESPONSE_CREATED } from "@/lib/events";

const FALLBACK_SPEAKER = "匿名祈禱者";
const PRAYER_AUDIO_START_EVENT = "prayer-audio:start";

function resolveUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window === "undefined") return url;
  const origin = window.location.origin;
  if (url.startsWith("/")) return `${origin}${url}`;
  return `${origin}/${url}`;
}

function getAvatarFallback(name) {
  const first = name?.trim()?.charAt(0);
  return first ? first.toUpperCase() : "匿名";
}

export default function PrayerAudioPlayer({ requestId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState("");
  const [isLoop, setIsLoop] = useState(false);

  const audioRef = useRef(null);
  const playlistRef = useRef([]);
  const currentIndexRef = useRef(currentIndex);
  const speakerKeyRef = useRef(0);

  const cleanupAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = "";
    audioRef.current = null;
  };

  const resetPlaybackState = () => {
    cleanupAudio();
    setCurrentIndex(-1);
    currentIndexRef.current = -1;
    setIsPaused(false);
    setIsModalOpen(false);
  };

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const playTrackAt = useCallback(
    async (index) => {
      const tracks = playlistRef.current;
      if (index < 0 || index >= tracks.length) {
        if (isLoop && tracks.length > 0) {
          return playTrackAt(0); // 循環回到第一首
        }
        resetPlaybackState();
        return false;
      }

      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio();
        audio.preload = "auto";
        audioRef.current = audio;
      }

      const track = tracks[index];
      const sourceUrl = resolveUrl(track.voiceUrl);
      audio.src = sourceUrl;
      audio.currentTime = 0;

      const advanceToNext = () => {
        const tracks = playlistRef.current;
        const nextIndex = index + 1;

        if (isLoop && tracks.length > 0) {
          void playTrackAt(nextIndex % tracks.length);
          return;
        }

        if (nextIndex >= tracks.length) {
          const endedAudio = audioRef.current;
          if (endedAudio) {
            endedAudio.pause();
            try {
              endedAudio.currentTime = 0;
            } catch (setTimeError) {
              console.warn("無法重設音訊時間", setTimeError);
            }
          }
          setIsPaused(true);
          return;
        }

        void playTrackAt(nextIndex);
      };

      audio.onloadedmetadata = () => {
        if (!audio.duration || audio.duration === Infinity || audio.duration === 0) {
          console.warn("略過 duration=0 的音訊", { track });
          advanceToNext();
        }
      };

      audio.onended = advanceToNext;
      audio.onerror = () => {
        console.warn("音訊播放失敗，略過", { track });
        advanceToNext();
      };

      currentIndexRef.current = index;
      setCurrentIndex(index);
      setIsPaused(false);
      speakerKeyRef.current += 1;

      try {
        await audio.play();
        setError("");
        return true;
      } catch (err) {
        console.warn("播放失敗，嘗試播放下一則", { error: err });
        advanceToNext();
        return false;
      }
    },
    [isLoop]
  );

  const fetchTracks = useCallback(async () => {
    try {
      const res = await fetch(`/api/responses/${requestId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("無法載入回應列表");
      const data = await res.json();

      const tracks = data
        .filter((item) => item?.voiceUrl)
        .map((item, index) => ({
          id: item.id ?? index,
          voiceUrl: item.voiceUrl,
          speaker: item.isAnonymous
            ? "匿名回應"
            : item.responder?.name || item.responder?.email || FALLBACK_SPEAKER,
          message: item.message || "",
          avatarUrl: item.responder?.avatarUrl || "",
          responderId: item.responderId ?? null,
        }));

      setPlaylist(tracks);
      playlistRef.current = tracks;
    } catch (err) {
      console.error("fetch tracks failed", err);
      setError(err.message || "無法載入回應列表");
      setPlaylist([]);
      playlistRef.current = [];
    }
  }, [requestId]);

  useEffect(() => {
    void fetchTracks();
  }, [fetchTracks]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResponseCreated = () => {
      void fetchTracks();
    };
    window.addEventListener(PRAYER_RESPONSE_CREATED, handleResponseCreated);
    return () => {
      window.removeEventListener(PRAYER_RESPONSE_CREATED, handleResponseCreated);
    };
  }, [fetchTracks]);

  const startPlayback = useCallback(async () => {
    if (!playlistRef.current.length) {
      setError("目前沒有可播放的音訊");
      return;
    }
    if (audioRef.current && !isModalOpen) {
      setIsModalOpen(true);
      return;
    }
    setIsModalOpen(true);
    await playTrackAt(0);
  }, [isModalOpen, playTrackAt]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleExternalStart = (event) => {
      const targetId = String(event?.detail?.requestId ?? "");
      if (!targetId) return;
      if (targetId !== String(requestId)) return;
      void startPlayback();
    };

    window.addEventListener(PRAYER_AUDIO_START_EVENT, handleExternalStart);
    return () => {
      window.removeEventListener(PRAYER_AUDIO_START_EVENT, handleExternalStart);
    };
  }, [requestId, startPlayback]);

  const togglePause = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await audio.play();
      setIsPaused(false);
    } else {
      audio.pause();
      setIsPaused(true);
    }
  };

  const closeModal = () => {
    resetPlaybackState();
  };

  const stopPlayback = () => {
    resetPlaybackState();
  };

  const playNext = () => {
    playTrackAt(currentIndexRef.current + 1);
  };

  const toggleLoop = () => {
    setIsLoop((prev) => !prev);
  };

  const currentTrack = currentIndex >= 0 ? playlist[currentIndex] : null;

  return (
    <div className="pray-audio">
      <button type="button" className="cp-button" onClick={startPlayback}>
        收聽禱告
      </button>

      {error ? <p className="cp-alert cp-alert--error pray-audio__error">{error}</p> : null}

      {isModalOpen ? (
        <div className="pray-audio-modal" role="dialog" aria-modal="true">
          <div className="pray-audio-modal__backdrop" onClick={closeModal} />
          <div className="pray-audio-modal__card pray-audio-modal__card--player">
            <div className="pray-audio-modal__player">
              <button
                type="button"
                className="pray-audio-modal__close"
                onClick={closeModal}
                aria-label="關閉播放視窗"
              >
                ×
              </button>

              {currentTrack ? (
                <>
                  <div key={speakerKeyRef.current} className="pray-audio-player__speaker-large">
                    <div className="pray-audio-player__avatar-large" aria-hidden>
                      {currentTrack.avatarUrl ? (
                        <img src={currentTrack.avatarUrl} alt="" />
                      ) : (
                        <span>{getAvatarFallback(currentTrack.speaker)}</span>
                      )}
                    </div>
                    <div className="pray-audio-player__meta-large">
                      <strong className="pray-audio-player__name">{currentTrack.speaker}</strong>
                      {currentTrack.message ? (
                        <p className="pray-audio-player__message">{currentTrack.message}</p>
                      ) : (
                        <p className="pray-audio-player__message muted">（沒有文字訊息）</p>
                      )}
                    </div>
                  </div>

                  <div className="pray-audio-player__controls">
                    <button type="button" className="cp-button cp-button--ghost" onClick={togglePause}>
                      {isPaused ? "繼續播放" : "暫停"}
                    </button>
                    <button type="button" className="cp-button cp-button--ghost" onClick={playNext}>
                      下一則
                    </button>
                    <button type="button" className="cp-button cp-button--ghost" onClick={stopPlayback}>
                      停止播放
                    </button>
                    <button
                      type="button"
                      className={`cp-button ${isLoop ? "active" : "cp-button--ghost"}`}
                      onClick={toggleLoop}
                    >
                      {isLoop ? "循環播放：開" : "循環播放：關"}
                    </button>
                  </div>

                  <div className="pray-audio-modal__playlist">
                    <h5>播放清單</h5>
                    <ul>
                      {playlist.map((track, index) => (
                        <li key={track.id ?? index} className={index === currentIndex ? "active" : undefined}>
                          {index === currentIndex ? "▶ " : null}
                          {track.speaker}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="cp-helper">目前沒有可播放的音訊。</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

