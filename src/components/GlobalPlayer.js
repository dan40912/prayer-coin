"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { useAudio } from "@/context/AudioContext";

const FALLBACK_SPEAKER = "Anonymous";
const FALLBACK_TITLE = "Prayer Audio";
const FALLBACK_EMPTY_HINT = "No playable audio yet. Upload text or voice response first.";
const FALLBACK_TEXT_MESSAGE = "No text message from this uploader yet.";
const FALLBACK_VOICE_MESSAGE = "Voice message";

const GLOBAL_PLAYER_BODY_CLASS = "has-global-player";
const COMPANION_ACTIVE_CLASS = "is-companion-active";
const COMPANION_BODY_CLASS = "companion-mode-active";
const COMPANION_OVERLAY_CLASS = "companion-overlay-open";
const GLOBAL_PLAYER_DEBUG_TAG = "[GlobalPlayer]";

function logGlobalPlayer(event, details = {}) {
  console.log(`${GLOBAL_PLAYER_DEBUG_TAG} ${event}`, details);
}

function getSpeakerInitial(name) {
  return name?.charAt(0)?.toUpperCase() || "?";
}

function parsePrayerId(pathname = "") {
  const match = pathname.match(/^\/prayfor\/(\d+)/);
  if (!match) return null;
  return match[1];
}

function formatTime(value) {
  if (!value) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function isSameTrack(left, right) {
  if (!left || !right) return false;
  if (left.id !== undefined && right.id !== undefined) {
    return String(left.id) === String(right.id);
  }
  if (left.voiceUrl && right.voiceUrl) {
    return String(left.voiceUrl) === String(right.voiceUrl);
  }
  return false;
}

export default function GlobalPlayer() {
  const pathname = usePathname() || "";
  const prayerId = useMemo(() => parsePrayerId(pathname), [pathname]);
  const isPrayerDetailPage = Boolean(prayerId);

  const {
    currentTrack,
    playlist,
    isPlaying,
    isLoop,
    isQueueEnded,
    isExpanded,
    setIsExpanded,
    togglePlay,
    pause,
    duration,
    queueProgress,
    queueDuration,
    seekQueue,
    playNext,
    playPrev,
    restartQueue,
    setIsLoop,
    selectTrack,
    removeTrack,
  } = useAudio();

  const progressBarRef = useRef(null);
  const [isOverlayDismissed, setIsOverlayDismissed] = useState(false);
  const [overlayBackground, setOverlayBackground] = useState("");

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.classList.add(GLOBAL_PLAYER_BODY_CLASS);
    return () => {
      document.body.classList.remove(GLOBAL_PLAYER_BODY_CLASS);
    };
  }, []);

  const hasTrack = Boolean(currentTrack);
  const hasQueue = playlist.length > 0;
  const canPlay = hasQueue;
  const hasStartedPlayback = hasTrack;

  useEffect(() => {
    if (isPlaying && hasStartedPlayback) {
      setIsOverlayDismissed(false);
    }
  }, [isPlaying, hasStartedPlayback]);

  const displayTrack = hasStartedPlayback
    ? currentTrack
    : hasQueue
      ? playlist[0]
      : {
          id: "placeholder",
          speaker: FALLBACK_SPEAKER,
          requestTitle: FALLBACK_TITLE,
          message: "",
          avatarUrl: "",
          voiceUrl: "",
        };

  const trackSpeaker = displayTrack.speaker || FALLBACK_SPEAKER;
  const hasVoiceTrack = Boolean(displayTrack.voiceUrl);
  const overlayMessage =
    currentTrack?.message?.trim() || displayTrack.message?.trim() || FALLBACK_TEXT_MESSAGE;

  const activeQueueIndex = useMemo(() => {
    if (!hasQueue || !currentTrack) return -1;
    return playlist.findIndex((track) => isSameTrack(track, currentTrack));
  }, [currentTrack, hasQueue, playlist]);

  const queuePositionText =
    activeQueueIndex >= 0 ? `${activeQueueIndex + 1}/${playlist.length}` : `1/${playlist.length || 1}`;

  const nowMetaPrimary = displayTrack.requestTitle || FALLBACK_TITLE;
  const nowMetaSecondary = hasVoiceTrack
    ? FALLBACK_VOICE_MESSAGE
    : displayTrack.message?.trim() || FALLBACK_TEXT_MESSAGE;

  const effectiveProgress = hasQueue ? queueProgress : 0;
  const effectiveDuration = hasQueue
    ? Math.max(queueDuration, queueProgress, hasTrack ? duration : 0)
    : 0;
  const safeDuration = effectiveDuration > 0 ? effectiveDuration : 1;
  const progressPercent = Math.min(Math.max((effectiveProgress / safeDuration) * 100, 0), 100);

  const showCompanionOverlay =
    isPrayerDetailPage && hasStartedPlayback && isPlaying && !isQueueEnded && !isOverlayDismissed;

  useEffect(() => {
    if (!isPrayerDetailPage) {
      setOverlayBackground("");
      return;
    }

    if (currentTrack?.coverImage) {
      setOverlayBackground(currentTrack.coverImage);
      return;
    }

    const firstCover = playlist.find((track) => track?.coverImage)?.coverImage;
    if (firstCover) {
      setOverlayBackground(firstCover);
      return;
    }

    if (typeof document === "undefined") return;
    const heroImage = document.querySelector(".pdv2-hero-image-wrap img");
    const fallbackImage =
      heroImage?.currentSrc?.trim() || heroImage?.getAttribute?.("src")?.trim() || "";
    setOverlayBackground(fallbackImage);
  }, [currentTrack?.coverImage, isPrayerDetailPage, playlist]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const previous = document.querySelectorAll(`.comment-item.${COMPANION_ACTIVE_CLASS}`);
    previous.forEach((node) => node.classList.remove(COMPANION_ACTIVE_CLASS));

    if (!showCompanionOverlay) return undefined;
    const responseId = String(currentTrack?.id ?? "").trim();
    if (!responseId || responseId === "primary-track") return undefined;

    const target = document.getElementById(`prayer-response-${responseId}`);
    if (!target) return undefined;

    target.classList.add(COMPANION_ACTIVE_CLASS);

    return () => {
      target.classList.remove(COMPANION_ACTIVE_CLASS);
    };
  }, [currentTrack?.id, showCompanionOverlay]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    document.body.classList.toggle(COMPANION_BODY_CLASS, showCompanionOverlay);
    document.body.classList.toggle(COMPANION_OVERLAY_CLASS, showCompanionOverlay);

    return () => {
      document.body.classList.remove(COMPANION_BODY_CLASS);
      document.body.classList.remove(COMPANION_OVERLAY_CLASS);
    };
  }, [showCompanionOverlay]);

  const handleProgressClick = (event) => {
    if (!hasQueue || !progressBarRef.current || effectiveDuration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    seekQueue(percent * effectiveDuration);
  };

  const handleTogglePlay = useCallback(
    (event) => {
      event?.stopPropagation?.();
      if (!hasQueue) {
        logGlobalPlayer("play-click-blocked:no-queue", {
          hasTrack,
          isQueueEnded,
          activeQueueIndex,
          queueSize: playlist.length,
        });
        return;
      }
      if (!hasTrack || isQueueEnded || activeQueueIndex < 0) {
        logGlobalPlayer("play-click:restart-queue", {
          hasTrack,
          isQueueEnded,
          activeQueueIndex,
          queueSize: playlist.length,
          currentTrackId: currentTrack?.id ?? null,
        });
        restartQueue();
        return;
      }
      logGlobalPlayer("play-click:toggle-play", {
        currentTrackId: currentTrack?.id ?? null,
        isPlaying,
        queueSize: playlist.length,
      });
      togglePlay();
    },
    [
      activeQueueIndex,
      currentTrack?.id,
      hasQueue,
      hasTrack,
      isPlaying,
      isQueueEnded,
      playlist.length,
      restartQueue,
      togglePlay,
    ]
  );

  const handleOverlayClose = useCallback(
    (event) => {
      event?.stopPropagation?.();
      setIsOverlayDismissed(true);
      pause();
    },
    [pause]
  );

  const handleLoopToggle = useCallback(
    (event) => {
      event?.stopPropagation?.();
      if (!hasQueue) {
        logGlobalPlayer("loop-click-blocked:no-queue", {
          isLoop,
          isQueueEnded,
          queueSize: playlist.length,
        });
        return;
      }
      const nextLoop = !isLoop;
      setIsLoop(nextLoop);
      logGlobalPlayer("loop-click:toggled", {
        previousLoop: isLoop,
        nextLoop,
        isQueueEnded,
        queueSize: playlist.length,
        currentTrackId: currentTrack?.id ?? null,
      });
      if (nextLoop && isQueueEnded) {
        logGlobalPlayer("loop-click:restart-queue-because-ended", {
          queueSize: playlist.length,
          currentTrackId: currentTrack?.id ?? null,
        });
        restartQueue();
      }
    },
    [currentTrack?.id, hasQueue, isLoop, isQueueEnded, playlist.length, restartQueue, setIsLoop]
  );
  const handleQueueToggle = () => setIsExpanded(!isExpanded);

  const handleRestartFromBeginning = () => {
    if (!hasQueue) return;
    setIsLoop(false);
    restartQueue();
  };

  const handleEnableLoopFromBeginning = () => {
    if (!hasQueue) return;
    setIsLoop(true);
    restartQueue();
  };

  if (pathname?.startsWith("/customer-portal/create")) {
    return null;
  }

  const overlayBackgroundStyle = overlayBackground
    ? { backgroundImage: `url(${overlayBackground})` }
    : undefined;

  return (
    <>
      {showCompanionOverlay ? (
        <section className="companion-overlay" aria-live="polite">
          <div className="companion-overlay__bg" style={overlayBackgroundStyle} aria-hidden="true" />
          <div className="companion-overlay__scrim" aria-hidden="true" />

          <div className="companion-overlay__content">
            <header className="companion-overlay__header">
              <button
                type="button"
                className="companion-overlay__close btn-danger"
                onClick={handleOverlayClose}
                aria-label="Close companion mode"
              >
                Close
              </button>
            </header>

            <div className="companion-overlay__stage">
              <article className={`companion-overlay__card${hasVoiceTrack ? " is-voice" : ""}`}>
                <div className="companion-overlay__identity">
                  <div className={`companion-overlay__avatar ${isPlaying ? "is-speaking" : ""}`} aria-hidden="true">
                    {displayTrack.avatarUrl ? (
                      <img src={displayTrack.avatarUrl} alt={trackSpeaker} />
                    ) : (
                      <span>{getSpeakerInitial(trackSpeaker)}</span>
                    )}
                  </div>
                  <div className="companion-overlay__text">
                    <div className="companion-overlay__speaker-row">
                      <strong className="companion-overlay__speaker">{trackSpeaker}</strong>
                      <span className={`player-now__chip ${isPlaying ? "is-playing" : "is-paused"}`}>
                        {isPlaying ? "PLAYING" : "PAUSED"}
                      </span>
                      {hasVoiceTrack ? (
                        <span
                          className="companion-overlay__voice-indicator"
                          aria-label={FALLBACK_VOICE_MESSAGE}
                          title={FALLBACK_VOICE_MESSAGE}
                        >
                          <i className="fa-solid fa-wave-square" aria-hidden="true" />
                        </span>
                      ) : null}
                    </div>
                    <p className="companion-overlay__message">{overlayMessage}</p>
                  </div>
                </div>

                <div className="companion-overlay__actions">
                  <button
                    type="button"
                    className="companion-overlay__btn companion-overlay__btn--play btn-primary"
                    onClick={handleTogglePlay}
                    aria-label={isPlaying ? "Pause playback" : "Start playback"}
                  >
                    <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"}`} aria-hidden="true" />
                    <span className="companion-overlay__btn-text" aria-hidden="true">
                      {isPlaying ? "Pause" : "Play"}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="companion-overlay__btn companion-overlay__btn--close btn-danger"
                    onClick={handleOverlayClose}
                    aria-label="Close companion mode"
                  >
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>
      ) : null}

      <div
        className={`global-player glass-panel${isPrayerDetailPage ? " is-prayer-detail" : ""}${
          showCompanionOverlay ? " is-overlay-active" : ""
        }`}
      >
        {!showCompanionOverlay ? (
          <div className="player-progress">
            <div
              className="progress-bar"
              onClick={handleProgressClick}
              ref={progressBarRef}
              role="presentation"
            >
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="player-times">
              <span>{formatTime(effectiveProgress)}</span>
              <span>{formatTime(effectiveDuration)}</span>
            </div>
          </div>
        ) : null}

        <div className={`player-controls-container ${hasStartedPlayback ? "" : "is-idle"}`}>
          {hasStartedPlayback && !showCompanionOverlay ? (
            <section className="player-now" aria-live="polite">
              {displayTrack.avatarUrl ? (
                <img
                  src={displayTrack.avatarUrl}
                  alt={trackSpeaker}
                  className={`track-avatar ${hasTrack && isPlaying ? "pulse" : ""}`}
                />
              ) : (
                <div className={`track-avatar ${hasTrack && isPlaying ? "pulse" : ""}`} aria-hidden="true">
                  {getSpeakerInitial(trackSpeaker)}
                </div>
              )}
              <div className="player-now__body">
                <div className="player-now__title-row">
                  <strong className="player-now__name">{trackSpeaker}</strong>
                  <span className={`player-now__chip ${isPlaying ? "is-playing" : "is-paused"}`}>
                    {isPlaying ? "PLAYING" : "PAUSED"}
                  </span>
                  <span className="player-now__chip is-secondary">{queuePositionText}</span>
                </div>
                <p className="player-now__meta">{nowMetaPrimary}</p>
                <p className="player-now__sub">{nowMetaSecondary}</p>
              </div>
            </section>
          ) : null}

          <div className="player-core">
            <div className={`player-controls ${hasStartedPlayback ? "" : "is-idle"}`}>
              <button
                className="control-btn btn-secondary"
                title="Previous"
                onClick={() => hasQueue && playPrev()}
                disabled={!hasQueue || playlist.length <= 1}
              >
                <i className="fa-solid fa-backward-step" aria-hidden="true" />
              </button>
              <button
                className="control-btn play-pause-btn btn-primary"
                onClick={handleTogglePlay}
                disabled={!canPlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                <i className={`fa-solid ${hasTrack && isPlaying ? "fa-pause" : "fa-play"}`} aria-hidden="true" />
              </button>
              <button
                className="control-btn btn-secondary"
                title="Next"
                onClick={() => hasQueue && playNext()}
                disabled={!hasQueue || playlist.length <= 1}
              >
                <i className="fa-solid fa-forward-step" aria-hidden="true" />
              </button>
            </div>

            {hasStartedPlayback ? (
              <div className="player-actions">
                <button
                  className={`control-btn control-btn--loop btn-secondary ${isLoop ? "is-active" : ""}`}
                  title={isLoop ? "Disable repeat" : "Enable repeat"}
                  onClick={handleLoopToggle}
                  aria-label={isLoop ? "Disable repeat" : "Enable repeat"}
                >
                  <i className="fa-solid fa-repeat" aria-hidden="true" />
                </button>
                {playlist.length ? (
                  <button
                    className={`control-btn btn-secondary ${isExpanded ? "is-active" : ""}`}
                    title={isExpanded ? "Hide queue" : "Show queue"}
                    onClick={handleQueueToggle}
                  >
                    <i className="fa-solid fa-list" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {isQueueEnded && hasQueue ? (
          <div className="player-ended-cta" role="status" aria-live="polite">
            <p className="player-ended-cta__title">Playback ended. Start from beginning?</p>
            <div className="player-ended-cta__actions">
              <button
                type="button"
                className="player-ended-cta__btn btn-secondary"
                onClick={handleRestartFromBeginning}
              >
                Restart
              </button>
              <button
                type="button"
                className="player-ended-cta__btn player-ended-cta__btn--primary btn-primary"
                onClick={handleEnableLoopFromBeginning}
              >
                Loop play
              </button>
            </div>
          </div>
        ) : null}

        {!hasTrack && !hasQueue ? <div className="player-empty-hint">{FALLBACK_EMPTY_HINT}</div> : null}

        {hasStartedPlayback && playlist.length ? (
          <div className={`player-queue-panel ${isExpanded ? "is-open" : ""}`}>
            <div className="player-queue-header">
              <div>
                <p className="eyebrow">Queue</p>
                <strong>{playlist.length} tracks</strong>
              </div>
              <button type="button" className="queue-toggle btn-secondary" onClick={handleQueueToggle}>
                {isExpanded ? "Hide" : "Show"}
              </button>
            </div>
            {isExpanded ? (
              <ul className="player-queue-list">
                {playlist.map((track, index) => {
                  const isActive = currentTrack ? isSameTrack(currentTrack, track) : false;
                  return (
                    <li key={track.id ?? index} className={`player-queue-item${isActive ? " is-active" : ""}`}>
                      <button
                        type="button"
                        className="queue-track"
                        onClick={() => selectTrack(index)}
                        aria-current={isActive ? "true" : "false"}
                      >
                        <span className="queue-track__speaker">{track.speaker || FALLBACK_SPEAKER}</span>
                        <span className="queue-track__title">
                          {track.message || track.requestTitle || FALLBACK_TITLE}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="queue-track__delete"
                        aria-label="Remove track"
                        onClick={() => removeTrack(track.id)}
                      >
                        <i className="fa-solid fa-xmark" aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}

