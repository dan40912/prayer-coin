"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { useAuthSession } from "@/hooks/useAuthSession";
import { PRAYER_RESPONSE_CREATED } from "@/lib/events";
import { buildOvercomerSlug } from "@/lib/overcomer";

import { REPORT_REASONS } from "@/constants/reportReasons";

// ===== 可切換的簡易 Debug（預設關閉） =====
const DEBUG = false;
const DEBUG_TAG = "[Recorder]";
function logDebug(...args) {
  if (!DEBUG) return;
  const ts = new Date().toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
  // eslint-disable-next-line no-console
  console.log(DEBUG_TAG, `[${ts}]`, ...args);
}

// ===== 錄音參數 =====
const MAX_RECORD_SECONDS = 120;
const COUNTDOWN_START = 3;
const DEFAULT_SAMPLE_RATE = 16000;
const DEFAULT_BITRATE = 128000;

// 錄音格式（優先 WebM/Opus，最通用）
const RECORDING_FORMATS = [
  { mimeType: "audio/webm;codecs=opus", extension: "webm" },
  { mimeType: "audio/webm", extension: "webm" },
  { mimeType: "audio/ogg;codecs=opus", extension: "ogg" },
  { mimeType: "audio/mp4;codecs=mp4a.40.2", extension: "m4a" },
  { mimeType: "audio/mpeg", extension: "mp3" },
  { mimeType: "", extension: "webm" },
];

function resolveRecordingFormat() {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return RECORDING_FORMATS[0];
  }
  for (const format of RECORDING_FORMATS) {
    if (!format.mimeType || MediaRecorder.isTypeSupported(format.mimeType)) {
      return format;
    }
  }
  return { mimeType: "", extension: "webm" };
}

function getExtensionFromMime(mime = "") {
  const value = mime.toLowerCase();
  if (value.includes("mpeg")) return "mp3";
  if (value.includes("mp4")) return "m4a";
  if (value.includes("ogg")) return "ogg";
  if (value.includes("webm")) return "webm";
  const parts = value.split("/");
  return parts[1]?.split(";")[0] || "webm";
}

function createMediaRecorderWithFallback(stream) {
  const format = resolveRecordingFormat();
  const options = format.mimeType
    ? { mimeType: format.mimeType, audioBitsPerSecond: DEFAULT_BITRATE }
    : {};

  let recorder;
  try {
    recorder = new MediaRecorder(stream, options);
  } catch (e) {
    // 若不支援指定 mime，直接用瀏覽器預設
    recorder = new MediaRecorder(stream);
    // 同步實際使用的格式，方便檔名副檔名/上傳
    format.mimeType = recorder.mimeType;
    format.extension = getExtensionFromMime(recorder.mimeType);
  }

  logDebug("MediaRecorder created with options:", options, "->", format);
  return { recorder, format, options };
}

// ===== 小工具 =====
function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
function getDisplayName(response) {
  if (response.isAnonymous) return "匿名代禱者";
  return response.responder?.name || response.responder?.email || "未命名";
  console.log("handleSubmit -> authUser:", authUser);
}
function getAvatarUrl(response) {
  return response.responder?.avatarUrl || null;
  console.log("handleSubmit -> authUser:", authUser);
}
function getAvatarFallback(name) {
  const initial = name?.trim()?.charAt(0) || "祈";
  return initial.toUpperCase();
}

function getResponderProfileHref(response) {
  if (!response || response.isAnonymous) return null;
  const responder = response.responder;
  const slug = buildOvercomerSlug(responder);
  if (slug) {
    console.log("[overcomer] profileHref slug", slug);
  }
  if (!slug) return null;
  return `/overcomer/${encodeURIComponent(slug)}`;
}

// ===== 主元件 =====
export default function Comments({ requestId, ownerId = null }) {
  const authUser = useAuthSession();

  const ownerIdValue = ownerId ? String(ownerId) : null;

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [text, setText] = useState("");
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef(new Map());
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportRemarks, setReportRemarks] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportFeedback, setReportFeedback] = useState("");
  const [reportError, setReportError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [actionNoticeType, setActionNoticeType] = useState("success");

  const reportTargetName = reportTarget ? getDisplayName(reportTarget) : "";
  const reportPreviewMessage = reportTarget?.message
    ? `${reportTarget.message.slice(0, 200)}${reportTarget.message.length > 200 ? '...' : ''}`
    : "";

  const setMenuRef = useCallback((id, node) => {
    if (!menuRefs.current) {
      menuRefs.current = new Map();
    }
    if (node) {
      menuRefs.current.set(id, node);
    } else {
      menuRefs.current.delete(id);
    }
  }, []);

  const toggleMenu = useCallback((id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  const closeReportModal = useCallback(() => {
    if (reportSubmitting) return;
    setReportTarget(null);
    setReportReason("");
    setReportRemarks("");
    setReportError("");
    setReportFeedback("");
  }, [reportSubmitting]);

  const openReportModal = useCallback((response) => {
    if (!authUser) {
      setActionNotice("請先登入後再進行檢舉");
      setActionNoticeType("error");
      return;
    }
    setOpenMenuId(null);
    setReportTarget(response);
    setReportReason("");
    setReportRemarks("");
    setReportError("");
    setReportFeedback("");
  }, [authUser]);

  const handleShareResponse = useCallback(async (response) => {
    if (typeof window === "undefined") return;
    setOpenMenuId(null);
    const baseUrl = window.location.href.split("#")[0];
    const shareUrl = `${baseUrl}#prayer-response-${response.id}`;
    const shareText = response.message
      ? response.message.slice(0, 120)
      : "邀請你一起關心這則禱告回應";
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          text: shareText,
          url: shareUrl,
        });
        setActionNotice("已開啟分享功能");
        setActionNoticeType("success");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setActionNotice("已複製分享連結");
        setActionNoticeType("success");
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          setActionNotice("已複製分享連結");
          setActionNoticeType("success");
        } catch (copyErr) {
          throw new Error("無法使用分享功能");
        } finally {
          document.body.removeChild(textarea);
        }
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      setActionNotice(err?.message || "分享失敗，請稍後再試");
      setActionNoticeType("error");
    }
  }, []);

  const handleReportSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (!reportTarget) {
      setReportError("找不到要檢舉的資料");
      return;
    }
    if (!reportReason) {
      setReportError("請選擇檢舉理由");
      return;
    }
    setReportSubmitting(true);
    setReportError("");
    setReportFeedback("");

    try {
      const response = await fetch("/api/prayer-response/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseId: reportTarget.id,
          reason: reportReason,
          remarks: reportRemarks,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || "檢舉失敗，請稍後再試");
      }

      const ownerReporting = ownerIdValue && authUser?.id && String(authUser.id) === ownerIdValue;

      setResponses((prev) =>
        prev.map((item) =>
          item.id === reportTarget.id
            ? { ...item, reportCount: (item.reportCount || 0) + 1, isBlocked: ownerReporting ? true : item.isBlocked }
            : item
        )
      );
      setReportFeedback("已收到您的檢舉，我們會儘速處理。");
      window.setTimeout(() => {
        closeReportModal();
      }, 1500);
    } catch (err) {
      setReportError(err?.message || "檢舉失敗，請稍後再試");
    } finally {
      setReportSubmitting(false);
    }
  }, [reportTarget, reportReason, reportRemarks, closeReportModal, ownerIdValue, authUser]);

  // 錄音狀態
  const [audioUrl, setAudioUrl] = useState(null);
  const audioBlobRef = useRef(null);
  const recordingFormatRef = useRef(resolveRecordingFormat());

  const [isRecorderModalOpen, setIsRecorderModalOpen] = useState(false);
  const [recorderStep, setRecorderStep] = useState("idle"); // idle | countdown | recording
  const [countdownValue, setCountdownValue] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordError, setRecordError] = useState("");

  // 媒體資源
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const recordChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  // 讀取回應列表
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/responses/${requestId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("無法載入回應");
        const data = await res.json();
        if (!cancelled) {
          setResponses(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "無法載入回應");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      // 元件卸載時釋放資源/計時器/URL
      cleanupRecording();
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  useEffect(() => {
    if (!openMenuId) return;
    const handlePointerDown = (event) => {
      const menuNode = menuRefs.current?.get(openMenuId);
      if (!menuNode || menuNode.contains(event.target)) {
        return;
      }
      setOpenMenuId(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openMenuId]);

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        setOpenMenuId(null);
        if (reportTarget && !reportSubmitting) {
          closeReportModal();
        }
      }
    };
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [reportTarget, reportSubmitting, closeReportModal]);

  useEffect(() => {
    if (!actionNotice) return;
    const timer = window.setTimeout(() => setActionNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [actionNotice]);

  // 上限秒數自動停止
  useEffect(() => {
    if (!recording) return;
    if (recordSeconds >= MAX_RECORD_SECONDS) {
      logDebug(`Max ${MAX_RECORD_SECONDS}s reached -> stopRecording`);
      stopRecording();
    }
  }, [recordSeconds, recording]);

  // 倒數計時
  useEffect(() => {
    if (!isRecorderModalOpen || recorderStep !== "countdown") return;
    if (countdownValue === null) return;

    if (countdownValue === 0) {
      setCountdownValue(null);
      window.setTimeout(() => beginRecording(), 500);
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdownValue((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdownValue, isRecorderModalOpen, recorderStep]);

  // 統一清理，fromStop=true 表示來自 onstop，不再呼叫 recorder.stop()
  const cleanupRecording = useCallback((fromStop = false) => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    if (!fromStop) {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch (_) {}
      }
    }

    mediaRecorderRef.current = null;

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }

    recordChunksRef.current = [];
    setRecording(false);
    setRecordSeconds(0);
  }, []);

  // 開啟錄音（要求麥克風權限→倒數）
  const openRecorder = async () => {
    setRecordError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: DEFAULT_SAMPLE_RATE,
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: false,
        },
      });
      mediaStreamRef.current = stream;

      setRecorderStep("countdown");
      setCountdownValue(COUNTDOWN_START);
      setIsRecorderModalOpen(true);
    } catch (err) {
      console.error("access microphone failed", err);
      setRecordError("需要麥克風權限才能錄音");
      setIsRecorderModalOpen(false);
      cleanupRecording();
    }
  };

  // 手動關閉 Modal（取消/錯誤）
  const closeRecorderModal = () => {
    setIsRecorderModalOpen(false);
    setRecorderStep("idle");
    setCountdownValue(null);
    cleanupRecording();
  };

  // 開始錄音
  const beginRecording = () => {
    if (!mediaStreamRef.current) {
      setRecorderStep("idle");
      setRecordError("無法取得麥克風串流。");
      return;
    }

    try {
      let audioContext;
      try {
        audioContext = new AudioContext({ sampleRate: DEFAULT_SAMPLE_RATE });
      } catch {
        audioContext = new AudioContext();
      }
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(mediaStreamRef.current);
      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 15;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      const gain = audioContext.createGain();
      gain.gain.value = 1.15;

      const destination = audioContext.createMediaStreamDestination();
      source.connect(compressor);
      compressor.connect(gain);
      gain.connect(destination);

      const { recorder, format, options } = createMediaRecorderWithFallback(destination.stream);
      recordingFormatRef.current = format;
      recordChunksRef.current = [];

      recorder.addEventListener("error", (event) => {
        const err = event?.error;
        setRecordError(`錄音發生錯誤${err?.name ? `: ${err.name}` : ""}`);
      });

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size > 0) recordChunksRef.current.push(event.data);
      });

      recorder.addEventListener("stop", () => {
        const selectedFormat = recordingFormatRef.current || {};
        const mimeType = selectedFormat.mimeType || options?.mimeType || "audio/webm";
        const blob = new Blob(recordChunksRef.current, { type: mimeType });

        if (audioUrl) URL.revokeObjectURL(audioUrl);
        audioBlobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));

        // 這裡屬於錄音正常結束 → 清資源、關 Modal（維持第一版 UI 體驗）
        cleanupRecording(true);
        setRecorderStep("idle");
        setIsRecorderModalOpen(false);
      });

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = window.setInterval(() => setRecordSeconds((s) => s + 1), 1000);
      setRecorderStep("recording");
    } catch (error) {
      console.error("begin recording failed", error);
      setRecordError("錄音啟動失敗，請重試或更換瀏覽器。");
      cleanupRecording();
      setRecorderStep("idle");
      setCountdownValue(null);
    }
  };

  // 停止錄音（使用者按鈕）
  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
    } else {
      // 如果 recorder 已不在 recording 狀態，就直接關閉
      closeRecorderModal();
    }
  };

  // 清除預覽音檔（表單中的「重錄」）
  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioBlobRef.current = null;
    setAudioUrl(null);
    setRecorderStep("idle");
    setRecordSeconds(0);
    setRecording(false);
  };

  // 送出表單
  const handleSubmit = async (event) => {
  event.preventDefault();
  if (recording) return;
  if (!text.trim() && !audioBlobRef.current) return;

  console.log("handleSubmit -> authUser:", authUser);

  const formData = new FormData();
  formData.append("requestId", String(requestId));
  formData.append("message", text.trim());
  formData.append("isAnonymous", String(isAnonymous));
  formData.append("responderId", authUser?.id || "");

  if (audioBlobRef.current) {
    const format = recordingFormatRef.current || {};
    const type =
      audioBlobRef.current.type ||
      format.mimeType ||
      resolveRecordingFormat().mimeType ||
      "audio/webm";
    const extension = format.extension || getExtensionFromMime(type);
    formData.append(
      "audio",
      new File([audioBlobRef.current], `prayer-recording.${extension}`, { type })
    );
  }

  for (const [key, value] of formData.entries()) {
    console.log("FormData entry:", key, value);
  }

  const res = await fetch("/api/responses", { method: "POST", body: formData });
  if (!res.ok) {
    console.error("submit response failed");
    return;
  }

  const saved = await res.json();
  console.log("API saved response:", saved);

  setResponses((prev) => [saved, ...prev]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PRAYER_RESPONSE_CREATED, { detail: saved }));
  }
  setText("");
  setIsAnonymous(false);
  resetRecording();
};

  // Modal（保留第一版 UI 的 class 命名）
  const renderRecorderModal = () => {
    if (!isRecorderModalOpen) return null;

    return (
      <div className="record-modal" role="dialog" aria-modal="true">
        <div className="record-modal__backdrop" onClick={closeRecorderModal} />
        <div className="record-modal__card">
          {recordError ? (
            <>
              <h4>錄音錯誤</h4>
              <p className="cp-alert cp-alert--error">{recordError}</p>
              <button type="button" className="cp-button cp-button--ghost" onClick={closeRecorderModal}>
                關閉
              </button>
            </>
          ) : recorderStep === "countdown" ? (
            <>
              <h4>準備開始錄音</h4>
              <p>請在安靜環境下對著麥克風說話。</p>
              <div className="record-modal__count">{countdownValue}</div>
              <button type="button" className="cp-button cp-button--ghost" onClick={closeRecorderModal}>
                取消
              </button>
            </>
          ) : recorderStep === "recording" ? (
            <>
              <h4>正在錄音</h4>
              <p>錄音時間上限 {MAX_RECORD_SECONDS} 秒。</p>
              <div className="record-modal__timer">{formatSeconds(recordSeconds)}</div>
              <div className="record-modal__actions">
                <button type="button" className="cp-button cp-button--danger" onClick={stopRecording}>
                  停止錄音
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  };

  const hasAudio = Boolean(audioUrl);

  const visibleResponses = responses.filter((response) => !response.isBlocked);

  return (
    <section className="comments card">
      {renderRecorderModal()}

      {recordError && !isRecorderModalOpen ? (
        <p className="cp-alert cp-alert--error">{recordError}</p>
      ) : null}

      {!authUser && (
        <div className="alert alert-warning">
          請先 <Link href="/login">登入</Link> 後才能留言或錄音。
        </div>
      )}

      <div className="comments__header">
        <h3>社群禱告牆</h3>
        <p className="comments__subtitle">留下你的文字或語音，成為他們的力量。</p>
      </div>

      {actionNotice ? (
        <p className={`cp-alert ${actionNoticeType === "error" ? "cp-alert--error" : "cp-alert--success"} comments__notice`}>
          {actionNotice}
        </p>
      ) : null}

      <div className="comments__list" aria-live="polite">
          {loading ? (
            <p>載入回應中…</p>
          ) : error ? (
            <p className="cp-alert cp-alert--error">{error}</p>
          ) : visibleResponses.length === 0 ? (
            <p className="cp-helper">成為第一個回應的朋友吧！</p>
          ) : (
            visibleResponses.map((response) => {
                const name = getDisplayName(response);
                const avatarUrl = getAvatarUrl(response);
                const avatarFallback = getAvatarFallback(name);
                const profileHref = getResponderProfileHref(response);
                return (
                  <article
                    key={response.id}
                    id={`prayer-response-${response.id}`}
                    className={`comment-item${response.reportCount > 0 ? " has-reports" : ""}`}
                  >
                    <div className="comment-item__header">
                        <div className="comment-item__identity">
                          {profileHref ? (
                            <Link href={profileHref} prefetch={false} className="comment-item__avatar-link">
                                <div className="comment-item__avatar" aria-hidden>
                                  {avatarUrl ? (
                                    <img src={avatarUrl} alt={name} loading="lazy" />
                                  ) : (
                                    <span>{avatarFallback}</span>
                                  )}
                                </div>
                            </Link>
                          ) : (
                            <div className="comment-item__avatar" aria-hidden>
                                {avatarUrl ? (
                                  <img src={avatarUrl} alt={name} loading="lazy" />
                                ) : (
                                  <span>{avatarFallback}</span>
                                )}
                            </div>
                          )}
                          {profileHref ? (
                            <Link href={profileHref} prefetch={false} className="comment-item__name">
                                {name}
                            </Link>
                          ) : (
                            <strong>{name}</strong>
                          )}
                        </div>
                        <div className="comment-item__actions">
                          {response.reportCount > 0 ? (
                            <span
                                className="comment-item__report-badge"
                                title={`被檢舉 ${response.reportCount} 次`}
                            >
                                檢舉 × {response.reportCount}
                            </span>
                          ) : null}
                          <div
                            className={`comment-item__action-menu${openMenuId === response.id ? " is-open" : ""}`}
                            ref={(node) => setMenuRef(response.id, node)}
                          >
                            <button
                                type="button"
                                className="comment-item__menu-trigger"
                                aria-haspopup="true"
                                aria-expanded={openMenuId === response.id}
                                aria-controls={`comment-action-menu-${response.id}`}
                                onClick={() => toggleMenu(response.id)}
                            >
                                ⋯
                            </button>
                            {openMenuId === response.id ? (
                                <div className="comment-item__menu" id={`comment-action-menu-${response.id}`} role="menu">
                                  <button type="button" role="menuitem" onClick={() => handleShareResponse(response)}>
                                    分享
                                  </button>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="danger"
                                    onClick={() => openReportModal(response)}
                                  >
                                    檢舉
                                  </button>
                                </div>
                            ) : null}
                          </div>
                        </div>
                    </div>
                    {response.message ? <p>{response.message}</p> : null}
                    {response.voiceUrl ? (
                        <div className="comment-item__audio">
                          <audio src={response.voiceUrl} controls preload="metadata" />
                        </div>
                    ) : null}
                  </article>
                );
            })
          )}
        </div>
      {authUser ? (
        <>
          <h3 className="comments__composer-title">立即回應</h3>
          <form className="comment-form" onSubmit={handleSubmit}>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(event) => setIsAnonymous(event.target.checked)}
              />
              匿名發表
            </label>

            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="和他們說說話，或分享你的代禱內容。"
              rows={4}
            />

            <div className="record-toolbar">
              {!recording && !hasAudio ? (
                <button
                  type="button"
                  className="cp-button"
                  onClick={async () => {
                    resetRecording();
                    await openRecorder();
                  }}
                >
                  開始錄音
                </button>
              ) : null}

              {hasAudio ? (
                <div className="audio-preview">
                  <p>語音預覽</p>
                  <audio src={audioUrl} controls preload="metadata" />
                  <div className="audio-preview__actions">
                    <button type="button" className="cp-button cp-button--ghost" onClick={resetRecording}>
                      重錄
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <button type="submit" className="cp-button" disabled={recording}>
              送出回應
            </button>
          </form>
        </>
      ) : null}


        {reportTarget ? (
        <div className="comment-report-modal" role="dialog" aria-modal="true">
          <div className="comment-report-modal__backdrop" onClick={closeReportModal} />
          <div className="comment-report-modal__card">
            <button
              type="button"
              className="comment-report-modal__close"
              onClick={closeReportModal}
              disabled={reportSubmitting}
              aria-label="關閉檢舉視窗"
            >
              ×
            </button>
            <h4>檢舉禱告回應</h4>
            <p className="comment-report-modal__hint">
              請選擇檢舉原因並留下必要的補充說明，我們會盡快安排管理員審核。
            </p>
            <div className="comment-report-modal__preview">
              <p className="comment-report-modal__preview-label">檢舉對象</p>
              <strong>{reportTargetName || "未知使用者"}</strong>
              {reportPreviewMessage ? (
                <p className="comment-report-modal__preview-message">{reportPreviewMessage}</p>
              ) : (
                <p className="comment-report-modal__preview-message muted">這則回應沒有文字內容</p>
              )}
            </div>
            <form onSubmit={handleReportSubmit} className="comment-report-modal__form">
              <fieldset className="comment-report-modal__fieldset">
                <legend>檢舉原因</legend>
                {REPORT_REASONS.map((reason) => (
                  <label key={reason.value} className="comment-report-modal__reason">
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason.value}
                      checked={reportReason === reason.value}
                      onChange={(event) => setReportReason(event.target.value)}
                      disabled={reportSubmitting}
                    />
                    <span>{reason.label}</span>
                  </label>
                ))}
              </fieldset>

              <label className="comment-report-modal__remarks">
                <span>備註說明</span>
                <textarea
                  value={reportRemarks}
                  onChange={(event) => setReportRemarks(event.target.value)}
                  rows={4}
                  placeholder="若需要補充說明，請在此留言。"
                  disabled={reportSubmitting}
                />
              </label>

              {reportError ? <p className="cp-alert cp-alert--error">{reportError}</p> : null}
              {reportFeedback ? <p className="cp-alert cp-alert--success">{reportFeedback}</p> : null}

              <div className="comment-report-modal__actions">
                <button
                  type="button"
                  className="cp-button cp-button--ghost"
                  onClick={closeReportModal}
                  disabled={reportSubmitting}
                >
                  取消
                </button>
                <button type="submit" className="cp-button" disabled={reportSubmitting}>
                  {reportSubmitting ? "送出中..." : "送出檢舉"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

    </section>
  );
}
