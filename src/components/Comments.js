"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function Comments({ requestId }) {
  const authUser = useAuthSession();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [responses, setResponses] = useState([]);     // ← 從 API 取得
  const mediaRecorderRef = useRef(null);
  const audioBlobRef = useRef(null);

  // 初始化：只撈這張卡的回應
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/responses/${requestId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        setResponses(data);
      } catch (e) {
        console.error("fetchResponses error:", e);
      }
    })();
  }, [requestId]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    const chunks = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/mpeg" });
      audioBlobRef.current = blob;
      setAudioUrl(URL.createObjectURL(blob));
    };
    mediaRecorderRef.current = rec;
    rec.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const resetRecording = () => {
    audioBlobRef.current = null;
    setAudioUrl(null);
    setRecording(false);
  };

  // 送出（仍為 multipart，會把 mp3 寫入 /public/voices）
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (recording) return; // 必須先停止錄音
    if (!text.trim() && !audioBlobRef.current) return;

    const fd = new FormData();
    fd.append("requestId", String(requestId));
    fd.append("message", text.trim());
    fd.append("isAnonymous", String(isAnonymous));
    fd.append("responderId", authUser?.id || "");
    if (audioBlobRef.current) {
      fd.append("audio", new File([audioBlobRef.current], "recording.mp3", { type: "audio/mpeg" }));
    }

    const res = await fetch("/api/responses", { method: "POST", body: fd });
    if (!res.ok) {
      console.error("submit failed");
      return;
    }
    const saved = await res.json();
    setResponses((prev) => [saved, ...prev]); // 只更新本卡的清單
    setText("");
    resetRecording();
    setIsAnonymous(false);
  };

  return (
    <section className="comments card">
      {!authUser && (
        <div className="alert alert-warning">
          請先 <Link href="/login">登入</Link> 才能留言。
        </div>
      )}

      <h3 className="section-title">留言區</h3>
      <ul className="comment-list">
        {responses.map((r) => (
          <li key={r.id} className="comment-item">
            <div className="comment-header">
              <strong>{r.isAnonymous ? "匿名" : (r.responder?.name || r.responder?.email || "未命名用戶")}</strong>
              <div className="comment-actions">
                <button className="btn-small">👍</button>
                <button className="btn-small">⚠️ 檢舉</button>
              </div>
            </div>
            {r.message ? <p>{r.message}</p> : null}
            {r.voiceUrl ? (
              <div className="audio-box">
                <audio src={r.voiceUrl} controls />
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <h3 className="section-title">立即回應</h3>
      <form className="comment-form" onSubmit={handleSubmit}>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          匿名發表
        </label>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="寫下你的回應..."
          rows={4}
        />

        <div className="record-section">
          {!recording && !audioUrl && (
            <button type="button" onClick={startRecording} className="button button--primary">
              🎤 開始錄音
            </button>
          )}

          {recording && (
            <button type="button" onClick={stopRecording} className="button button--danger">
              ⏹ 停止錄音
            </button>
          )}

          {audioUrl && !recording && (
            <div className="audio-preview">
              <p>錄音預覽：</p>
              <audio src={audioUrl} controls />
              <div className="audio-buttons">
                <button type="button" className="button button--secondary" onClick={resetRecording}>
                  🔄 重錄
                </button>
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="button button--primary" disabled={recording}>
          送出回應
        </button>
      </form>
    </section>
  );
}
