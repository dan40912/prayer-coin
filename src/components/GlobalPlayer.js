"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { PRAYER_RESPONSE_CREATED } from "@/lib/events";
import { useAudio } from "@/context/AudioContext";

const FALLBACK_SPEAKER = "匿名代禱者";
const FALLBACK_TITLE = "代禱音訊";
const FALLBACK_EMPTY_HINT = "目前尚未加入播放音訊，點選播放清單中的內容開始收聽。";
const COMPANION_ACTIVE_CLASS = "is-companion-active";
const COMPANION_BODY_CLASS = "companion-mode-active";
const COMPANION_OVERLAY_CLASS = "companion-overlay-open";
const GLOBAL_PLAYER_BODY_CLASS = "has-global-player";
const COMPANION_JUMP_EVENT = "companion:jump";

const COMPANION_BADGES = ["正在為你代禱", "給你鼓勵", "送上祝福"];
const COMPANION_SWITCH_MS = 5000;
const COMPANION_FIRST_SHOW_MS = 800;
const COMPANION_TRANSITION_MS = 360;
const COMPANION_ENTER_MS = 520;
const COMPANION_NOTICE_MS = 2600;

const COMPANION_MOCK_ENTRIES = [
  {
    id: "mock-1",
    userName: "Grace Lin",
    avatar: "",
    type: "text",
    message: "你並不孤單，我正在為你禱告，願神親自加添力量。",
    badge: "正在為你代禱",
    voiceUrl: "",
  },
  {
    id: "mock-2",
    userName: "Daniel Wu",
    avatar: "",
    type: "voice",
    message: "",
    badge: "語音鼓勵",
    voiceUrl: "/voice-1.mp3",
  },
];

function getSpeakerInitial(name) {
  return name?.charAt(0)?.toUpperCase() || "?";
}

function parsePrayerId(pathname = "") {
  const match = pathname.match(/^\/prayfor\/(\d+)/);
  if (!match) return null;
  return match[1];
}

function resolveCompanionEntry(item, index) {
  if (!item || item.isBlocked) return null;

  const id = item.id !== undefined && item.id !== null ? String(item.id) : `entry-${index}`;
  const isAnonymous = Boolean(item.isAnonymous);
  const userName = isAnonymous
    ? "匿名代禱者"
    : item.responder?.name?.trim() || item.responder?.email?.trim() || FALLBACK_SPEAKER;

  const message = item.message?.trim() || "";
  const hasVoice = Boolean(item.voiceUrl);
  const type = hasVoice ? "voice" : "text";

  return {
    id,
    userName,
    avatar: item.responder?.avatarUrl?.trim() || "",
    type,
    message,
    voiceUrl: hasVoice ? item.voiceUrl : "",
    badge: hasVoice ? "語音鼓勵" : COMPANION_BADGES[index % COMPANION_BADGES.length],
  };
}

async function fetchCompanionEntries(prayerId) {
  const response = await fetch(`/api/responses/${prayerId}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch responses (${response.status})`);
  }
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map(resolveCompanionEntry).filter(Boolean);
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
    isExpanded,
    setIsExpanded,
    togglePlay,
    duration,
    queueProgress,
    queueDuration,
    seekQueue,
    playNext,
    playPrev,
    playByIndex,
    setIsLoop,
    selectTrack,
    removeTrack,
  } = useAudio();

  const progressBarRef = useRef(null);
  const rotateTimerRef = useRef(null);
  const firstShowTimerRef = useRef(null);
  const phaseTimerRef = useRef(null);
  const noticeTimerRef = useRef(null);

  const [companionEnabled, setCompanionEnabled] = useState(true);
  const [companionEntries, setCompanionEntries] = useState([]);
  const [activeCompanionIndex, setActiveCompanionIndex] = useState(-1);
  const [companionPhase, setCompanionPhase] = useState("idle");
  const [companionNotice, setCompanionNotice] = useState("");

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.classList.add(GLOBAL_PLAYER_BODY_CLASS);
    return () => {
      document.body.classList.remove(GLOBAL_PLAYER_BODY_CLASS);
    };
  }, []);
  const [companionLoading, setCompanionLoading] = useState(false);
  const [overlayBackground, setOverlayBackground] = useState("");

  const hasTrack = Boolean(currentTrack);
  const hasQueue = playlist.length > 0;
  const canPlay = hasQueue;
  const hasStartedPlayback = hasTrack;

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
        };

  const trackSpeaker = displayTrack.speaker || FALLBACK_SPEAKER;
  const marqueeText = (displayTrack.message || displayTrack.requestTitle || FALLBACK_TITLE).trim();
  const showSpeakerBubble = hasStartedPlayback && Boolean(marqueeText);

  const effectiveProgress = hasQueue ? queueProgress : 0;
  const effectiveDuration = hasQueue
    ? Math.max(queueDuration, queueProgress, hasTrack ? duration : 0)
    : 0;
  const safeDuration = effectiveDuration > 0 ? effectiveDuration : 1;
  const progressPercent = Math.min(Math.max((effectiveProgress / safeDuration) * 100, 0), 100);

  const activeCompanion =
    activeCompanionIndex >= 0 && activeCompanionIndex < companionEntries.length
      ? companionEntries[activeCompanionIndex]
      : null;
  const queueCoverImage = useMemo(() => {
    if (currentTrack?.coverImage) return currentTrack.coverImage;
    const firstCover = playlist.find((track) => track?.coverImage)?.coverImage;
    return firstCover || "";
  }, [currentTrack?.coverImage, playlist]);

  const clearCompanionTimers = useCallback(() => {
    if (rotateTimerRef.current) {
      window.clearTimeout(rotateTimerRef.current);
      rotateTimerRef.current = null;
    }
    if (firstShowTimerRef.current) {
      window.clearTimeout(firstShowTimerRef.current);
      firstShowTimerRef.current = null;
    }
    if (phaseTimerRef.current) {
      window.clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
  }, []);

  const moveToCompanionIndex = useCallback(
    (nextIndex, { immediate = false } = {}) => {
      if (nextIndex < 0 || nextIndex >= companionEntries.length) return;
      clearCompanionTimers();

      if (immediate || activeCompanionIndex < 0) {
        setActiveCompanionIndex(nextIndex);
        setCompanionPhase("is-enter");
        phaseTimerRef.current = window.setTimeout(() => {
          setCompanionPhase("idle");
          phaseTimerRef.current = null;
        }, COMPANION_ENTER_MS);
        return;
      }

      setCompanionPhase("is-exit");
      phaseTimerRef.current = window.setTimeout(() => {
        setActiveCompanionIndex(nextIndex);
        setCompanionPhase("is-enter");
        phaseTimerRef.current = window.setTimeout(() => {
          setCompanionPhase("idle");
          phaseTimerRef.current = null;
        }, COMPANION_ENTER_MS);
      }, COMPANION_TRANSITION_MS);
    },
    [activeCompanionIndex, clearCompanionTimers, companionEntries.length]
  );

  const jumpToCompanionById = useCallback(
    (responseId) => {
      if (!responseId) return false;
      const index = companionEntries.findIndex((entry) => String(entry.id) === String(responseId));
      if (index < 0) return false;
      moveToCompanionIndex(index, { immediate: true });
      return true;
    },
    [companionEntries, moveToCompanionIndex]
  );

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
        playByIndex(0);
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

  const showCompanionPanel = isPrayerDetailPage;
  const showCompanionOverlay = showCompanionPanel && companionEnabled && isPlaying;

  const loadCompanion = useCallback(async () => {
    if (!prayerId) {
      setCompanionEntries([]);
      setActiveCompanionIndex(-1);
      setCompanionLoading(false);
      return;
    }

    setCompanionLoading(true);
    try {
      const entries = await fetchCompanionEntries(prayerId);
      if (entries.length > 0) {
        setCompanionEntries(entries);
      } else if (process.env.NODE_ENV !== "production") {
        setCompanionEntries(COMPANION_MOCK_ENTRIES);
      } else {
        setCompanionEntries([]);
      }
    } catch (error) {
      console.warn("[CompanionMode] fetch responses failed:", error);
      if (process.env.NODE_ENV !== "production") {
        setCompanionEntries(COMPANION_MOCK_ENTRIES);
      } else {
        setCompanionEntries([]);
      }
    } finally {
      setCompanionLoading(false);
    }
  }, [prayerId]);

  useEffect(() => {
    void loadCompanion();
  }, [loadCompanion]);

  useEffect(() => {
    if (!isPrayerDetailPage) {
      setOverlayBackground("");
      return;
    }

    if (queueCoverImage) {
      setOverlayBackground(queueCoverImage);
      return;
    }

    if (typeof document === "undefined") return;
    const heroImage = document.querySelector(".pdv2-hero-image-wrap img");
    const nextImage =
      heroImage?.currentSrc?.trim() || heroImage?.getAttribute?.("src")?.trim() || "";
    if (nextImage) {
      setOverlayBackground(nextImage);
    }
  }, [isPrayerDetailPage, queueCoverImage]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onCreated = () => {
      void loadCompanion();
    };
    window.addEventListener(PRAYER_RESPONSE_CREATED, onCreated);
    return () => window.removeEventListener(PRAYER_RESPONSE_CREATED, onCreated);
  }, [loadCompanion]);

  useEffect(() => {
    if (!companionEntries.length) {
      setActiveCompanionIndex(-1);
      return;
    }
    if (activeCompanionIndex < companionEntries.length) return;
    setActiveCompanionIndex(0);
  }, [activeCompanionIndex, companionEntries]);

  useEffect(() => {
    if (!showCompanionOverlay) {
      if (rotateTimerRef.current) {
        window.clearTimeout(rotateTimerRef.current);
        rotateTimerRef.current = null;
      }
      if (firstShowTimerRef.current) {
        window.clearTimeout(firstShowTimerRef.current);
        firstShowTimerRef.current = null;
      }
      return undefined;
    }

    if (!companionEntries.length) return undefined;

    if (activeCompanionIndex < 0) {
      firstShowTimerRef.current = window.setTimeout(() => {
        moveToCompanionIndex(0, { immediate: true });
        firstShowTimerRef.current = null;
      }, COMPANION_FIRST_SHOW_MS);
      return () => {
        if (firstShowTimerRef.current) {
          window.clearTimeout(firstShowTimerRef.current);
          firstShowTimerRef.current = null;
        }
      };
    }

    if (companionEntries.length <= 1) return undefined;

    rotateTimerRef.current = window.setTimeout(() => {
      const nextIndex = (activeCompanionIndex + 1) % companionEntries.length;
      moveToCompanionIndex(nextIndex);
      rotateTimerRef.current = null;
    }, COMPANION_SWITCH_MS);

    return () => {
      if (rotateTimerRef.current) {
        window.clearTimeout(rotateTimerRef.current);
        rotateTimerRef.current = null;
      }
    };
  }, [
    activeCompanionIndex,
    companionEntries,
    moveToCompanionIndex,
    showCompanionOverlay,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onJump = (event) => {
      const responseId = String(event?.detail?.responseId ?? "").trim();
      if (!responseId) return;
      if (!showCompanionPanel) return;
      setCompanionEnabled(true);
      jumpToCompanionById(responseId);
    };
    window.addEventListener(COMPANION_JUMP_EVENT, onJump);
    return () => window.removeEventListener(COMPANION_JUMP_EVENT, onJump);
  }, [jumpToCompanionById, showCompanionPanel]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const previous = document.querySelectorAll(`.comment-item.${COMPANION_ACTIVE_CLASS}`);
    previous.forEach((node) => node.classList.remove(COMPANION_ACTIVE_CLASS));

    if (!showCompanionPanel || !companionEnabled || !activeCompanion?.id) return undefined;

    const target = document.getElementById(`prayer-response-${activeCompanion.id}`);
    if (target) {
      target.classList.add(COMPANION_ACTIVE_CLASS);
    }

    return () => {
      const current = document.querySelectorAll(`.comment-item.${COMPANION_ACTIVE_CLASS}`);
      current.forEach((node) => node.classList.remove(COMPANION_ACTIVE_CLASS));
    };
  }, [activeCompanion?.id, companionEnabled, showCompanionPanel]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const shouldEnableBodyClass = showCompanionOverlay;
    document.body.classList.toggle(COMPANION_BODY_CLASS, shouldEnableBodyClass);
    document.body.classList.toggle(COMPANION_OVERLAY_CLASS, shouldEnableBodyClass);

    return () => {
      document.body.classList.remove(COMPANION_BODY_CLASS);
      document.body.classList.remove(COMPANION_OVERLAY_CLASS);
    };
  }, [showCompanionOverlay]);

  useEffect(() => {
    if (typeof document === "undefined" || !showCompanionPanel || !companionEnabled) return undefined;

    const handleClick = (event) => {
      const article = event.target?.closest?.('[id^="prayer-response-"]');
      if (!article) return;
      if (
        event.target?.closest?.(
          "button, a, input, textarea, label, audio, .comment-item__action-menu, .comment-item__menu"
        )
      ) {
        return;
      }

      const responseId = article.id.replace("prayer-response-", "").trim();
      if (!responseId) return;
      jumpToCompanionById(responseId);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [companionEnabled, jumpToCompanionById, showCompanionPanel]);

  useEffect(() => {
    return () => {
      clearCompanionTimers();
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = null;
      }
      if (typeof document !== "undefined") {
        document.body.classList.remove(COMPANION_BODY_CLASS);
        document.body.classList.remove(COMPANION_OVERLAY_CLASS);
      }
    };
  }, [clearCompanionTimers]);

  const handleCompanionToggle = () => {
    setCompanionEnabled((prev) => !prev);
  };

  const handleCloseOverlay = () => {
    setCompanionEnabled(false);
    setCompanionNotice("");
  };

  const handleCompanionVoiceLater = () => {
    if (!activeCompanion) return;
    const message = `${activeCompanion.userName} 的語音鼓勵已標記，主音訊結束後可收聽。`;
    setCompanionNotice(message);
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setCompanionNotice("");
      noticeTimerRef.current = null;
    }, COMPANION_NOTICE_MS);
  };

  if (pathname?.startsWith("/customer-portal/create")) {
    return null;
  }

  const overlayBackgroundStyle = overlayBackground ? { backgroundImage: `url(${overlayBackground})` } : undefined;
  const currentCompanionOrder =
    companionEntries.length > 0 && activeCompanionIndex >= 0 ? activeCompanionIndex + 1 : 0;

  return (
    <>
      {showCompanionOverlay ? (
        <section className="companion-overlay" aria-live="polite">
          <div className="companion-overlay__bg" style={overlayBackgroundStyle} aria-hidden="true" />
          <div className="companion-overlay__scrim" aria-hidden="true" />

          <div className="companion-overlay__content">
            <header className="companion-overlay__header">
              <button type="button" className="companion-overlay__close" onClick={handleCloseOverlay}>
                關閉
              </button>

            </header>

            <div className="companion-overlay__stage">
              {companionLoading ? (
                <p className="companion-overlay__hint">正在整理鼓勵留言...</p>
              ) : !companionEntries.length ? (
                <p className="companion-overlay__hint">目前還沒有鼓勵留言，成為第一位為他代禱的人。</p>
              ) : activeCompanion ? (
                <article className={`companion-overlay__card ${companionPhase}`}>
                  <div className="companion-overlay__meta">
                    <div className="companion-overlay__avatar" aria-hidden="true">
                      {activeCompanion.avatar ? (
                        <img src={activeCompanion.avatar} alt={activeCompanion.userName} />
                      ) : (
                        <span>{getSpeakerInitial(activeCompanion.userName)}</span>
                      )}
                    </div>
                    <div className="companion-overlay__author">
                      <strong>{activeCompanion.userName}</strong>
                      <span className="companion-overlay__badge">{activeCompanion.badge}</span>
                    </div>
                  </div>

                  {activeCompanion.type === "voice" ? (
                    <div className="companion-overlay__voice">
                      <p>{`${activeCompanion.userName} 為你留下了一段語音鼓勵。`}</p>
                      <small>可在主音訊播放完後收聽。</small>
                      <button
                        type="button"
                        className="companion-overlay__voice-btn"
                        onClick={handleCompanionVoiceLater}
                      >
                        播放後收聽
                      </button>
                    </div>
                  ) : (
                    <p className="companion-overlay__message">
                      {activeCompanion.message || "願你在安靜中被神的話語扶持。"}
                    </p>
                  )}
                </article>
              ) : (
                <p className="companion-overlay__hint">正在準備第一則陪伴留言...</p>
              )}
            </div>

            <div className="companion-overlay__counter">
              {currentCompanionOrder}/{companionEntries.length || 0}
            </div>
            {companionNotice ? <p className="companion-overlay__notice">{companionNotice}</p> : null}
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

        <div
          className={`player-controls-container ${hasStartedPlayback ? "" : "is-idle"}${
            showCompanionOverlay ? " is-overlay" : ""
          }`}
        >
          {hasStartedPlayback && !showCompanionOverlay ? (
            <div className="track-info">
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
              <div className="track-details">
                <div className="track-title">{trackSpeaker}</div>
                <div className="track-origin">{displayTrack.requestTitle || FALLBACK_TITLE}</div>
              </div>
            </div>
          ) : null}

          <div className={`player-controls ${hasStartedPlayback ? "" : "is-idle"}${showCompanionOverlay ? " is-overlay" : ""}`}>
            <button
              className="control-btn"
              title="上一段"
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
              title="下一段"
              onClick={() => hasQueue && playNext()}
              disabled={!hasQueue || playlist.length <= 1}
            >
              <i className="fa-solid fa-forward-step" aria-hidden="true" />
            </button>
          </div>

          {hasStartedPlayback && !showCompanionOverlay ? (
            <div className="player-actions">
              <button
                className={`control-btn ${isLoop ? "is-active" : ""}`}
                title={isLoop ? "已開啟循環播放" : "循環播放"}
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
          ) : null}
        </div>

        {!showCompanionOverlay && showSpeakerBubble ? (
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
                  <div className={`pray-audio-modal__marquee-track ${isPlaying ? "is-playing" : ""}`}>
                    <span>{marqueeText}</span>
                    <span aria-hidden="true">{marqueeText}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {!hasTrack && !hasQueue ? <div className="player-empty-hint">{FALLBACK_EMPTY_HINT}</div> : null}

        {hasStartedPlayback && playlist.length && !showCompanionOverlay ? (
          <div className={`player-queue-panel ${isExpanded ? "is-open" : ""}`}>
            <div className="player-queue-header">
              <div>
                <p className="eyebrow">播放清單</p>
                <strong>{playlist.length} 段音訊</strong>
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
                        aria-label="移除音訊"
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
