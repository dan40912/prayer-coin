"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PRAYER_RESPONSE_CREATED } from "@/lib/events";

const FALLBACK_SPEAKER = "匿名祈禱者";

const DEBUG_TAG = "[PrayerAudioPlayer]";
function logDebug(...args) {
  if (typeof console !== "undefined") {
    console.debug(DEBUG_TAG, ...args);
  }
}

function normalizeTracks(items = []) {
  return items
    .filter((item) => item?.voiceUrl)
    .map((item, index) => ({
      id: item.id ?? index,
      voiceUrl: item.voiceUrl,
      speaker: item.speaker || FALLBACK_SPEAKER,
      message: item.message || "",
      avatarUrl: item.avatarUrl || "",
      responderId: item.responderId ?? null,
      isInitial: Boolean(item.isInitial),
    }));
}

function resolveUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window === "undefined") return url;
  const origin = window.location.origin;
  if (url.startsWith("/")) return `${origin}${url}`;
  return `${origin}/${url}`;
}

function isNotSupportedError(error) {
  return error?.name === "NotSupportedError" || /not supported/i.test(error?.message || "");
}

function isPlayableScheme(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (lower.startsWith("blob:")) return false;
  if (lower.startsWith("data:")) return false;
  return true;
}

function getAvatarFallback(name) {
  const first = name?.trim()?.charAt(0);
  return first ? first.toUpperCase() : "匿名";
}

export default function PrayerAudioPlayer({ requestId, initialTrack }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState("setup");
  const [mode, setMode] = useState("once");
  const [prefetchedTracks, setPrefetchedTracks] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);
  const [isPrefetching, setIsPrefetching] = useState(true);
  const [isStartingPlayback, setIsStartingPlayback] = useState(false);
  const [error, setError] = useState("");

  const audioRef = useRef(null);
  const endedHandlerRef = useRef(null);
  const errorHandlerRef = useRef(null);
  const playlistRef = useRef([]);
  const prefetchedRef = useRef([]);
  const modeRef = useRef(mode);
  const currentIndexRef = useRef(currentIndex);
  const speakerKeyRef = useRef(0);

  const cleanupAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (endedHandlerRef.current) {
      audio.removeEventListener("ended", endedHandlerRef.current);
      endedHandlerRef.current = null;
    }

    if (errorHandlerRef.current) {
      audio.removeEventListener("error", errorHandlerRef.current);
      errorHandlerRef.current = null;
    }

    audio.pause();
    audio.src = "";
    audioRef.current = null;
  };

  const resetPlaybackState = ({ closeModal = true, resetMode = false } = {}) => {
    cleanupAudio();

    setPlaylist([]);
    playlistRef.current = [];

    setCurrentIndex(-1);
    currentIndexRef.current = -1;

    setIsPaused(false);

    if (closeModal) {
      setIsModalOpen(false);
      setModalView("setup");
    } else {
      setModalView("setup");
    }

    if (resetMode) {
      setMode("once");
      modeRef.current = "once";
    }
  };

  useEffect(() => {
    return () => {
      resetPlaybackState({ closeModal: false });
    };
  }, []);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const describeFailure = (err) => {
    if (typeof err === "string") return err;
    if (isNotSupportedError(err)) return "這個音訊格式目前不被支援，已略過";
    return "音訊無法載入，已略過";
  };

  const replaceActiveTracks = (tracks) => {
    logDebug('replaceActiveTracks', { count: tracks.length, ids: tracks.map((item) => item.id ?? 'unknown') });
    playlistRef.current = tracks;
    setPlaylist(tracks);
    prefetchedRef.current = tracks;
    setPrefetchedTracks(tracks);
  };

  const handleTrackFailure = (failedIndex, err) => {
    const message = describeFailure(err);

    cleanupAudio();

    const tracks = playlistRef.current || [];
    logDebug('handleTrackFailure', { failedIndex, playlistSize: tracks.length, track: tracks[failedIndex], error: err });
    if (!tracks.length || failedIndex < 0 || failedIndex >= tracks.length) {
      setError(message);
      resetPlaybackState({ closeModal: false });
      return false;
    }

    const remaining = tracks.filter((_, index) => index !== failedIndex);

    if (!remaining.length) {
      setError(message || "目前沒有可播放的音訊");
      resetPlaybackState({ closeModal: false });
      return false;
    }

    replaceActiveTracks(remaining);

    setError(message);
    setCurrentIndex(-1);
    currentIndexRef.current = -1;
    setIsPaused(false);

    setTimeout(() => {
      void playTrackAt(Math.min(failedIndex, remaining.length - 1), { autoplay: true, isRetry: true });
    }, 0);

    return true;
  };

  const playTrackAt = useCallback(
    async (index, { autoplay = true } = {}) => {
      const tracks = playlistRef.current;
      if (index < 0 || index >= tracks.length) {
        return false;
      }

      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio();
        audio.preload = "auto";
        audioRef.current = audio;
      }

      if (endedHandlerRef.current) {
        audio.removeEventListener("ended", endedHandlerRef.current);
        endedHandlerRef.current = null;
      }
      if (errorHandlerRef.current) {
        audio.removeEventListener("error", errorHandlerRef.current);
        errorHandlerRef.current = null;
      }

      const handleEnded = () => {
        const snapshot = playlistRef.current;
        if (!snapshot.length) {
          resetPlaybackState();
          return;
        }

        const nextIndex = currentIndexRef.current + 1;
        if (nextIndex < snapshot.length) {
          void playTrackAt(nextIndex, { autoplay: true });
        } else if (modeRef.current === "loop" && snapshot.length > 0) {
          void playTrackAt(0, { autoplay: true });
        } else {
          resetPlaybackState();
        }
      };

      const handleError = (event) => {
        logDebug('audio element error', { index, trackId: tracks[index]?.id, event });
        console.error("audio element error", event);
        handleTrackFailure(index, new Error("音訊無法載入，已略過"));
      };

      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);
      endedHandlerRef.current = handleEnded;
      errorHandlerRef.current = handleError;

      const track = tracks[index];
      logDebug('playTrackAt', { index, autoplay, track });
      const sourceUrl = resolveUrl(track.voiceUrl);
      audio.crossOrigin = "anonymous";
      audio.src = sourceUrl;
      audio.currentTime = 0;
      audio.load();

      currentIndexRef.current = index;
      setCurrentIndex(index);
      setIsPaused(false);
      speakerKeyRef.current += 1;

      if (!autoplay) {
        return true;
      }

      try {
        await audio.play();
        logDebug('audio play succeeded', { index, trackId: track.id });
        setError("");
        return true;
      } catch (err) {
        logDebug('audio play failed', { index, trackId: track.id, error: err });
        console.error("audio play failed", err);
        return handleTrackFailure(index, err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fetchPlayableTracks = useCallback(async () => {
    setIsPrefetching(true);
    setError("");
    logDebug('fetchPlayableTracks:start', { requestId });

    try {
      const res = await fetch(`/api/responses/${requestId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("無法載入回應列表");
      const data = await res.json();
      logDebug('fetch responses ok', { total: Array.isArray(data) ? data.length : 'unknown' });

      const tracks = normalizeTracks([
        ...(initialTrack?.voiceUrl
          ? [
              {
                id: "initial",
                voiceUrl: initialTrack.voiceUrl,
                speaker: initialTrack.speaker || "祈禱錄音",
                message: initialTrack.message || "",
                avatarUrl: initialTrack.avatarUrl || "",
                isInitial: true,
              },
            ]
          : []),
        ...data.map((item) => ({
          id: item.id,
          voiceUrl: item.voiceUrl,
          speaker: item.isAnonymous
            ? "匿名回應"
            : item.responder?.name || item.responder?.email || FALLBACK_SPEAKER,
          message: item.message || "",
          avatarUrl: item.responder?.avatarUrl || "",
          responderId: item.responderId ?? null,
        })),
      ]);

      if (!tracks.length) {
        logDebug('fetchPlayableTracks:no-tracks-after-normalize');
        setPrefetchedTracks([]);
        prefetchedRef.current = [];
        return;
      }

      const playable = await filterPlayable(tracks);
      logDebug('fetchPlayableTracks:playable-result', { requested: tracks.length, playable: playable.length });
      replaceActiveTracks(playable);
    } catch (err) {
      logDebug('fetchPlayableTracks:error', { error: err });
      console.error("prefetch tracks failed", err);
      setError(err.message || "無法載入回應列表");
      setPrefetchedTracks([]);
      prefetchedRef.current = [];
    } finally {
      logDebug('fetchPlayableTracks:completed');
      setIsPrefetching(false);
    }
  }, [initialTrack, requestId]);

  useEffect(() => {
    void fetchPlayableTracks();
  }, [fetchPlayableTracks]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleResponseCreated = (event) => {
      const detail = event?.detail || {};
      if (detail.homeCardId && Number(detail.homeCardId) !== Number(requestId)) {
        return;
      }
      logDebug('event:response-created', { detail });
      void fetchPlayableTracks();
    };

    window.addEventListener(PRAYER_RESPONSE_CREATED, handleResponseCreated);
    return () => {
      window.removeEventListener(PRAYER_RESPONSE_CREATED, handleResponseCreated);
    };
  }, [fetchPlayableTracks, requestId]);

  const openSetupModal = () => {
    setIsModalOpen(true);
    setModalView("setup");
    setError("");
    void fetchPlayableTracks();
  };

  const handleBackdropClick = () => {
    resetPlaybackState();
  };

  const stopPlayback = () => {
    resetPlaybackState();
  };

  const togglePause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPaused(false);
        setError("");
      } catch (err) {
        console.error("resume failed", err);
        setError(isNotSupportedError(err) ? "瀏覽器不支援這個音訊格式" : "無法繼續播放");
      }
    } else {
      audio.pause();
      setIsPaused(true);
    }
  };

  const playNext = () => {
    const tracks = playlistRef.current;
    if (!tracks.length) return;

    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex < tracks.length) {
      void playTrackAt(nextIndex, { autoplay: true });
    } else if (modeRef.current === "loop" && tracks.length > 0) {
      void playTrackAt(0, { autoplay: true });
    } else {
      resetPlaybackState();
    }
  };

  const startPlayback = async () => {
    setIsStartingPlayback(true);
    setError("");
    logDebug('startPlayback', { available: prefetchedRef.current.length, mode: modeRef.current });

    try {
      const tracksToPlay = prefetchedRef.current;
      if (!tracksToPlay.length) {
        logDebug('startPlayback:no-tracks-to-play');
        setError("目前沒有可播放的音訊");
        setModalView("setup");
        return;
      }

      playlistRef.current = tracksToPlay;
      setPlaylist(tracksToPlay);
      setModalView("player");

      const started = await playTrackAt(0, { autoplay: true });
      logDebug('startPlayback:first-track', { started });
      if (!started) {
        setModalView("setup");
      }
    } catch (err) {
      logDebug('startPlayback:error', { error: err });
      console.error("start playback failed", err);
      setError(err.message || "無法啟動播放");
      setModalView("setup");
    } finally {
      logDebug('startPlayback:completed');
      setIsStartingPlayback(false);
    }
  };

  const currentTrack = currentIndex >= 0 ? playlist[currentIndex] : null;
  const hasTracks = prefetchedTracks.length > 0;

  async function filterPlayable(tracks) {
    const results = await Promise.all(
      tracks.map(async (track) => {
        const { voiceUrl } = track;
        if (!isPlayableScheme(voiceUrl)) {
          logDebug('filterPlayable:skip-scheme', { voiceUrl });
          console.warn("skipping unsupported audio scheme", voiceUrl);
          return null;
        }

        const url = resolveUrl(voiceUrl);
        if (!url) {
          logDebug('filterPlayable:missing-url', { voiceUrl });
          return null;
        }

        const maxAttempts = 3;

        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
          try {
            logDebug('filterPlayable:checking', { voiceUrl: url, attempt });
            const response = await fetch(url, { method: "HEAD", cache: "no-store" });
            if (!response.ok) {
              const statusError = new Error(`status ${response.status}`);
              statusError.status = response.status;
              throw statusError;
            }
            return track;
          } catch (err) {
            if (attempt >= maxAttempts) {
              logDebug('filterPlayable:head-failed', { voiceUrl, error: err });
              console.warn("skipping unreachable audio track", voiceUrl, err);
              return null;
            }

            logDebug('filterPlayable:retry', { voiceUrl, attempt, error: err });
            await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
          }
        }

        return null;
      })
    );

    return results.filter(Boolean);
  }

  return (
    <div className="pray-audio">
      <button type="button" className="cp-button" onClick={openSetupModal}>
        祈禱音訊
      </button>

      {error ? <p className="cp-alert cp-alert--error pray-audio__error">{error}</p> : null}

      {isModalOpen ? (
        <div className="pray-audio-modal" role="dialog" aria-modal="true">
          <div className="pray-audio-modal__backdrop" onClick={handleBackdropClick} />
          <div
            className={`pray-audio-modal__card ${
              modalView === "player" ? "pray-audio-modal__card--player" : ""
            }`}
          >
            {modalView === "setup" ? (
              <>
                <h4>選擇播放模式</h4>
                <p>播放前先挑選是否循環播放，以免干擾其他頁面操作。</p>

                <div className="pray-audio-modal__summary" aria-live="polite">
                  {isPrefetching ? (
                    <span className="muted small">音訊載入中…</span>
                  ) : hasTracks ? (
                    <span className="small">可播放音訊 {prefetchedTracks.length} 則</span>
                  ) : (
                    <span className="muted small">目前沒有可播放的音訊</span>
                  )}
                </div>

                <div className="pray-audio-modal__options">
                  <label>
                    <input
                      type="radio"
                      value="once"
                      checked={mode === "once"}
                      onChange={(event) => setMode(event.target.value)}
                    />
                    播放一次
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="loop"
                      checked={mode === "loop"}
                      onChange={(event) => setMode(event.target.value)}
                    />
                    連續播放
                  </label>
                </div>

                <div className="pray-audio-modal__actions">
                  <button type="button" className="cp-button cp-button--ghost" onClick={handleBackdropClick}>
                    取消
                  </button>
                  <button
                    type="button"
                    className="cp-button"
                    onClick={startPlayback}
                    disabled={isPrefetching || isStartingPlayback || !hasTracks}
                  >
                    {isStartingPlayback ? "啟動中…" : "開始播放"}
                  </button>
                </div>
              </>
            ) : (
              <div className="pray-audio-modal__player">
                <button type="button" className="pray-audio-modal__close" onClick={stopPlayback} aria-label="關閉播放器">
                  ×
                </button>

                {currentTrack ? (
                  <>
                    <div key={speakerKeyRef.current} className="pray-audio-player__speaker" aria-live="polite">
                      <span>目前播放</span>
                      <div className="pray-audio-player__identity">
                        <div className="pray-audio-player__avatar" aria-hidden>
                          {currentTrack.avatarUrl ? (
                            <img src={currentTrack.avatarUrl} alt="" />
                          ) : (
                            <span>{getAvatarFallback(currentTrack.speaker)}</span>
                          )}
                        </div>
                        <div className="pray-audio-player__meta">
                          <strong>{currentTrack.speaker}</strong>
                          {currentTrack.message ? <p>{currentTrack.message}</p> : null}
                        </div>
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
                    </div>

                    <div className="pray-audio-modal__playlist">
                      <h5>播放清單</h5>
                      <ul>
                        {playlist.map((track, index) => (
                          <li
                            key={track.id ?? index}
                            className={index === currentIndex ? "active" : undefined}
                          >
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
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
