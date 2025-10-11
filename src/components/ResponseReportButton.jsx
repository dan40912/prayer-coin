"use client";

import { useState } from "react";

import { REPORT_REASONS } from "@/constants/reportReasons";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function ResponseReportButton({
  responseId,
  className = "",
  triggerLabel = "檢舉回應",
}) {
  const authUser = useAuthSession();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  if (!authUser || !responseId) {
    return null;
  }

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
      setError("請選擇檢舉理由");
      return;
    }

    setSubmitting(true);
    setError("");
    setFeedback("");

    try {
      const res = await fetch("/api/prayer-response/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseId,
          reason: selectedReason,
          remarks,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "檢舉失敗，請稍後再試");
      }

      setFeedback("已收到您的檢舉，我們會盡快處理。");
      setSelectedReason("");
      setRemarks("");
      window.setTimeout(() => {
        setFeedback("");
        closeModal();
      }, 1600);
    } catch (err) {
      setError(err?.message || "檢舉失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`response-report ${className}`.trim()}>
      <button type="button" className="cp-link cp-link--danger" onClick={openModal}>
        {triggerLabel}
      </button>

      {isOpen ? (
        <div className="response-report__modal" role="dialog" aria-modal="true">
          <div className="response-report__backdrop" onClick={closeModal} />
          <div className="response-report__card">
            <h4>檢舉回應</h4>
            <p className="cp-helper">請描述您要檢舉的原因，以協助我們快速評估。</p>

            <form className="response-report__form" onSubmit={handleSubmit}>
              <fieldset className="response-report__reasons">
                <legend>檢舉理由</legend>
                {REPORT_REASONS.map((reason) => (
                  <label key={reason.value}>
                    <input
                      type="radio"
                      name="responseReportReason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(event) => setSelectedReason(event.target.value)}
                      disabled={submitting}
                    />
                    <span>{reason.label}</span>
                  </label>
                ))}
              </fieldset>

              <label className="response-report__remarks">
                <span>補充說明（選填）</span>
                <textarea
                  rows={4}
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="請提供讓管理員判斷的其他資訊。"
                  disabled={submitting}
                />
              </label>

              {error ? <p className="cp-alert cp-alert--error">{error}</p> : null}
              {feedback ? <p className="cp-alert cp-alert--success">{feedback}</p> : null}

              <div className="response-report__actions">
                <button
                  type="button"
                  className="cp-button cp-button--ghost"
                  onClick={closeModal}
                  disabled={submitting}
                >
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

