"use client";

import { useAudio } from "@/context/AudioContext";
import { usePathname } from "next/navigation";
import { useRef } from "react";

const FALLBACK_SPEAKER = "匿名代禱者";
const FALLBACK_TITLE = "禱告留言";
const FALLBACK_EMPTY_HINT = "尚未選擇播放項目，點擊留言或錄音即可開始收聽。";

function getSpeakerInitial(name) {
  return name?.charAt(0)?.toUpperCase() || "祈";
}

export default function GlobalPlayer() {
  const pathname = usePathname();
  const {
    currentTrack,
    playlist,
    isPlaying,
    isLoop,
    isExpanded,
    setIsExpanded,
    togglePlay,
    duration,
    queueProgress,
    queueDuration,
    seekQueue,
    playNext,
    playPrev,
    setIsLoop,
    selectTrack,
    removeTrack,
  } = useAudio();

  const progressBarRef = useRef(null);

  const hasTrack = Boolean(currentTrack);
  const hasQueue = playlist.length > 0;
  const canPlay = hasQueue;

  const displayTrack = hasTrack
    ? currentTrack
    : hasQueue
      ? playlist[0]
      : {
          id: "placeholder",
          speaker: FALLBACK_SPEAKER,
          requestTitle: FALLBACK_TITLE,
          message: "",
          avatarUrl: "",
        };

  const trackSpeaker = displayTrack.speaker || FALLBACK_SPEAKER;
  const marqueeText = (displayTrack.message || displayTrack.requestTitle || FALLBACK_TITLE).trim();
  const showSpeakerBubble = hasQueue && Boolean(marqueeText);

  const effectiveProgress = hasQueue ? queueProgress : 0;
  const effectiveDuration = hasQueue
    ? Math.max(queueDuration, queueProgress, hasTrack ? duration : 0)
    : 0;
  const safeDuration = effectiveDuration > 0 ? effectiveDuration : 1;
  const progressPercent = Math.min(Math.max((effectiveProgress / safeDuration) * 100, 0), 100);

  const handleProgressClick = (event) => {
    if (!hasQueue || !progressBarRef.current || effectiveDuration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    seekQueue(percent * effectiveDuration);
  };

  const handleTogglePlay = (event) => {
    event?.stopPropagation?.();
    if (!hasTrack) {
      if (hasQueue) {
        selectTrack(0);
      }
      return;
    }
    togglePlay();
  };

  const formatTime = (value) => {
    if (!value) return "0:00";
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleLoopToggle = () => setIsLoop(!isLoop);
  const handleQueueToggle = () => setIsExpanded(!isExpanded);

  if (pathname?.startsWith("/customer-portal/create")) {
    return null;
  }

  return (
    <div className="global-player glass-panel">
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

      <div className="player-controls-container">
        <div className="track-info">
          {displayTrack.avatarUrl ? (
            <img
              src={displayTrack.avatarUrl}
              alt={trackSpeaker}
              className={`track-avatar ${hasTrack && isPlaying ? "pulse" : ""}`}
            />
          ) : (
            <div
              className={`track-avatar ${hasTrack && isPlaying ? "pulse" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--accent-gold)",
              }}
              aria-hidden="true"
            >
              {getSpeakerInitial(trackSpeaker)}
            </div>
          )}
          <div className="track-details">
            <div className="track-title">{trackSpeaker}</div>
            <div className="track-origin">{displayTrack.requestTitle || FALLBACK_TITLE}</div>
          </div>
        </div>

        <div className="player-controls">
          <button
            className="control-btn"
            title="播放上一則"
            onClick={() => hasQueue && playPrev()}
            disabled={!hasQueue || playlist.length <= 1}
          >
            <i className="fa-solid fa-backward-step" aria-hidden="true" />
          </button>
          <button className="control-btn play-pause-btn" onClick={handleTogglePlay} disabled={!canPlay}>
            <i className={`fa-solid ${hasTrack && isPlaying ? "fa-pause" : "fa-play"}`} aria-hidden="true" />
          </button>
          <button
            className="control-btn"
            title="播放下一則"
            onClick={() => hasQueue && playNext()}
            disabled={!hasQueue || playlist.length <= 1}
          >
            <i className="fa-solid fa-forward-step" aria-hidden="true" />
          </button>
        </div>

        <div className="player-actions">
          <button
            className={`control-btn ${isLoop ? "is-active" : ""}`}
            title={isLoop ? "取消循環播放" : "循環播放"}
            onClick={handleLoopToggle}
          >
            <i className="fa-solid fa-repeat" aria-hidden="true" />
          </button>
          {playlist.length ? (
            <button
              className={`control-btn ${isExpanded ? "is-active" : ""}`}
              title={isExpanded ? "收合播放清單" : "展開播放清單"}
              onClick={handleQueueToggle}
            >
              <i className="fa-solid fa-list" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {showSpeakerBubble ? (
        <div className="pray-audio-modal__card pray-audio-modal__card--player" aria-live="polite">
          <div className="pray-audio-modal__speaker">
            {displayTrack.avatarUrl ? (
              <img
                src={displayTrack.avatarUrl}
                alt={trackSpeaker}
                className={`pray-audio-modal__avatar ${isPlaying ? "is-speaking" : ""}`}
              />
            ) : (
              <div className={`pray-audio-modal__avatar ${isPlaying ? "is-speaking" : ""}`} aria-hidden="true">
                {getSpeakerInitial(trackSpeaker)}
              </div>
            )}
            <div className="pray-audio-modal__bubble">
              <strong className="pray-audio-modal__speaker-name">{trackSpeaker}</strong>
              <div className="pray-audio-modal__marquee">
                <div
                  className={`pray-audio-modal__marquee-track ${
                    isPlaying ? "is-playing" : ""
                  }`}
                >
                  <span>{marqueeText}</span>
                  <span aria-hidden="true">{marqueeText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!hasTrack && !hasQueue ? (
        <div className="player-empty-hint">{FALLBACK_EMPTY_HINT}</div>
      ) : null}

      {playlist.length ? (
        <div className={`player-queue-panel ${isExpanded ? "is-open" : ""}`}>
          <div className="player-queue-header">
            <div>
              <p className="eyebrow">播放清單</p>
              <strong>{playlist.length} 則留言</strong>
            </div>
            <button type="button" className="queue-toggle" onClick={handleQueueToggle}>
              {isExpanded ? "收合" : "展開"}
            </button>
          </div>
          {isExpanded ? (
            <ul className="player-queue-list">
              {playlist.map((track, index) => {
                const isActive = currentTrack?.id === track.id;
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
                      aria-label="移除這則錄音"
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
  );
}

