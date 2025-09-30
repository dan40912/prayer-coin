"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuthSession } from "@/hooks/useAuthSession";
import { REPORT_REASONS } from "@/constants/reportReasons";

function truncate(text, length = 200) {
  if (!text) return "";
  const value = String(text).trim();
  if (value.length <= length) return value;
  return `${value.slice(0, length)}...`;
}

export default function PrayerRequestActions({
  cardId,
  canonicalUrl,
  title,
  description,
  reportCount: initialReportCount = 0,
}) {
  const authUser = useAuthSession();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportRemarks, setReportRemarks] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportFeedback, setReportFeedback] = useState("");
  const [reportCount, setReportCount] = useState(initialReportCount ?? 0);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");

  const menuRef = useRef(null);

  const previewDescription = useMemo(() => truncate(description, 200), [description]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target)) return;
      setIsMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const closeReportModal = useCallback(() => {
    if (reportSubmitting) return;
    setIsModalOpen(false);
    setReportReason("");
    setReportRemarks("");
    setReportError("");
    setReportFeedback("");
  }, [reportSubmitting]);

  const openReportModal = useCallback(() => {
    if (!authUser) {
      setNotice("請先登入後再進行操作");
      setNoticeType("error");
      return;
    }
    setIsMenuOpen(false);
    setIsModalOpen(true);
    setReportReason("");
    setReportRemarks("");
    setReportError("");
    setReportFeedback("");
  }, [authUser]);

  const handleShare = useCallback(async () => {
    if (typeof window === "undefined") return;
    setIsMenuOpen(false);
    const shareUrl = canonicalUrl ? `${window.location.origin}${canonicalUrl}` : window.location.href;
    const shareText = title || "邀請你一起關心這份禱告";

    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title || title,
          text: shareText,
          url: shareUrl,
        });
        setNotice("已開啟分享功能");
        setNoticeType("success");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setNotice("已複製分享連結");
        setNoticeType("success");
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
          setNotice("已複製分享連結");
          setNoticeType("success");
        } catch (copyErr) {
          throw new Error("無法使用分享功能");
        } finally {
          document.body.removeChild(textarea);
        }
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      setNotice(err?.message || "分享失敗，請稍後再試");
      setNoticeType("error");
    }
  }, [canonicalUrl, title]);

  const handleReportSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!reportReason) {
        setReportError("請選擇檢舉理由");
        return;
      }
      setReportSubmitting(true);
      setReportError("");
      setReportFeedback("");

      try {
        const response = await fetch("/api/prayfor/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardId,
            reason: reportReason,
            remarks: reportRemarks,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.message || "檢舉失敗，請稍後再試");
        }

        setReportCount((prev) => prev + 1);
        setReportFeedback("已收到您的檢舉，我們會儘速處理。");
        window.setTimeout(() => {
          closeReportModal();
        }, 1500);
      } catch (err) {
        setReportError(err?.message || "檢舉失敗，請稍後再試");
      } finally {
        setReportSubmitting(false);
      }
    },
    [cardId, closeReportModal, reportReason, reportRemarks],
  );

  return (
    <div className="pray-actions">
      {notice ? (
        <p className={`cp-alert ${noticeType === "error" ? "cp-alert--error" : "cp-alert--success"} comments__notice`}>
          {notice}
        </p>
      ) : null}

      <div className="pray-actions__menu comment-item__action-menu" ref={menuRef}>
        {reportCount > 0 ? (
          <span className="comment-item__report-badge" title={`被檢舉 ${reportCount} 次`}>
            檢舉 × {reportCount}
          </span>
        ) : null}
        <button
          type="button"
          className={`comment-item__menu-trigger${isMenuOpen ? " is-open" : ""}`}
          aria-haspopup="true"
          aria-expanded={isMenuOpen}
          aria-controls="pray-actions-menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          ⋯
        </button>
        {isMenuOpen ? (
          <div className="comment-item__menu" id="pray-actions-menu" role="menu">
            <button type="button" role="menuitem" onClick={handleShare}>
              分享這則禱告
            </button>
            <button type="button" role="menuitem" className="danger" onClick={openReportModal}>
              檢舉禱告內容
            </button>
          </div>
        ) : null}
      </div>

      {isModalOpen ? (
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
            <h4>檢舉禱告事項</h4>
            <p className="comment-report-modal__hint">
              請選擇檢舉原因並留下必要的補充說明，我們會盡快安排管理員審核。
            </p>
            <div className="comment-report-modal__preview">
              <p className="comment-report-modal__preview-label">檢舉對象</p>
              <strong>{title || "未命名的禱告"}</strong>
              {previewDescription ? (
                <p className="comment-report-modal__preview-message">{previewDescription}</p>
              ) : (
                <p className="comment-report-modal__preview-message muted">沒有額外的說明內容</p>
              )}
            </div>
            <form onSubmit={handleReportSubmit} className="comment-report-modal__form">
              <fieldset className="comment-report-modal__fieldset">
                <legend>檢舉原因</legend>
                {REPORT_REASONS.map((reason) => (
                  <label key={reason.value} className="comment-report-modal__reason">
                    <input
                      type="radio"
                      name="prayReportReason"
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
    </div>
  );
}
