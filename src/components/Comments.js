"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { useAuthSession } from "@/hooks/useAuthSession";
import { PRAYER_RESPONSE_CREATED } from "@/lib/events";

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

// ===== 主元件 =====
export default function Comments({ requestId }) {
  const authUser = useAuthSession();

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [text, setText] = useState("");
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      <header className="comments__header">
        <h3>社群禱告牆</h3>
        <p className="comments__subtitle">留下你的文字或語音，成為他們的力量。</p>
      </header>

      <div className="comments__list" aria-live="polite">
        {loading ? (
          <p>載入回應中…</p>
        ) : error ? (
          <p className="cp-alert cp-alert--error">{error}</p>
        ) : responses.length === 0 ? (
          <p className="cp-helper">成為第一個回應的朋友吧！</p>
        ) : (
          responses.map((response) => {
            const name = getDisplayName(response);
            const avatarUrl = getAvatarUrl(response);
            const avatarFallback = getAvatarFallback(name);
            return (
              <article key={response.id} className="comment-item">
                <div className="comment-item__header">
                  <div className="comment-item__identity">
                    <div className="comment-item__avatar" aria-hidden>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={name} loading="lazy" />
                      ) : (
                        <span>{avatarFallback}</span>
                      )}
                    </div>
                    <strong>{name}</strong>
                  </div>
                  <div className="comment-item__actions">
                    <button type="button" className="btn-small" disabled>
                      按讚
                    </button>
                    <button type="button" className="btn-small" disabled>
                      檢舉
                    </button>
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
              disabled={!authUser}
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

        <button type="submit" className="cp-button" disabled={recording || !authUser}>
          送出回應
        </button>
      </form>
    </section>
  );
}
