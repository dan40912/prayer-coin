"use client";

import { useState } from "react";

function resolveShareUrl(canonical = "") {
  if (typeof window === "undefined") {
    return canonical;
  }
  if (!canonical) {
    return window.location.href;
  }
  if (canonical.startsWith("http")) {
    return canonical;
  }
  if (canonical.startsWith("/")) {
    return `${window.location.origin}${canonical}`;
  }
  return canonical;
}

export default function ShareButton({ canonical = "", variant = "default" }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const shareUrl = resolveShareUrl(canonical);
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: shareUrl,
        });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("❌ 分享失敗:", err);
    }
  };

  const isIconVariant = variant === "icon";

  return (
    <div className={`share-wrapper${isIconVariant ? " share-wrapper--icon" : ""}`}>
      <button
        type="button"
        className={isIconVariant ? "btn-icon" : "button button--primary"}
        onClick={handleShare}
        aria-label="分享這則禱告"
        title={isIconVariant ? "分享這則禱告" : undefined}
      >
        {isIconVariant ? (
          <>
            <i className="fa-solid fa-share-nodes" aria-hidden="true"></i>
            <span className="sr-only">分享</span>
          </>
        ) : (
          "🔗 分享"
        )}
      </button>
      {copied && (
        <div className="toast">
          ✅ 連結已複製！
        </div>
      )}
    </div>
  );
}
