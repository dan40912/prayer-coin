"use client";

import { useState } from "react";

import { useAuthSession } from "@/hooks/useAuthSession";
import { REPORT_REASONS } from "@/constants/reportReasons";


export default function OvercomerReportButton({ targetUserId, targetUsername, targetDisplayName }) {
  const authUser = useAuthSession();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  if (!authUser) return null;

  const openModal = () => {
    setIsOpen(true);
    setFeedback("");
    setError("");
  };

  const closeModal = () => {
    if (submitting) return;
    setIsOpen(false);
    setSelectedReason("");
    setRemarks("");
    setFeedback("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedReason) {
      setError("請選擇檢舉原因。");
      return;
    }
    setSubmitting(true);
    setError("");
    setFeedback("");

    try {
      const response = await fetch("/api/overcomer/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          targetUsername,
          reason: selectedReason,
          remarks,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: "檢舉失敗，請稍後再試。" }));
        throw new Error(data?.message || "檢舉失敗，請稍後再試。");
      }

      setFeedback("已送出檢舉，我們會盡快審核。");
      setSelectedReason("");
      setRemarks("");
      window.setTimeout(() => {
        setFeedback("");
        closeModal();
      }, 1600);
    } catch (err) {
      setError(err.message || "檢舉失敗，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overcomer-report">
      <button type="button" className="cp-button cp-button--ghost" onClick={openModal}>
        檢舉此使用者
      </button>

      {isOpen ? (
        <div className="overcomer-report__modal" role="dialog" aria-modal="true">
          <div className="overcomer-report__backdrop" onClick={closeModal} />
          <div className="overcomer-report__card">
            <h4>檢舉 {targetDisplayName || targetUsername}</h4>
            <p className="cp-helper">請選擇檢舉原因並補充必要說明，我們會儘快處理。</p>
            <form onSubmit={handleSubmit} className="overcomer-report__form">
              <fieldset className="overcomer-report__reasons">
                <legend>檢舉原因</legend>
                {REPORT_REASONS.map((reason) => (
                  <label key={reason.value}>
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(event) => setSelectedReason(event.target.value)}
                      disabled={submitting}
                    />
                    <span>{reason.label}</span>
                  </label>
                ))}
              </fieldset>

              <label className="overcomer-report__remarks">
                <span>補充說明（選填）</span>
                <textarea
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  rows={4}
                  placeholder="請告訴我們更多細節，以利審查。"
                  disabled={submitting}
                />
              </label>

              {error ? <p className="cp-alert cp-alert--error">{error}</p> : null}
              {feedback ? <p className="cp-alert cp-alert--success">{feedback}</p> : null}

              <div className="overcomer-report__actions">
                <button type="button" className="cp-button cp-button--ghost" onClick={closeModal} disabled={submitting}>
                  取消
                </button>
                <button type="submit" className="cp-button" disabled={submitting}>
                  {submitting ? "送出中…" : "送出檢舉"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
