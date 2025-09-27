"use client";

import { useState } from "react";

export default function ShareButton({ canonical }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(canonical);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2 秒後消失
    } catch (err) {
      console.error("❌ 複製失敗:", err);
    }
  };

  return (
    <div className="share-wrapper">
      <button
        type="button"
        className="button button--primary"
        onClick={handleShare}
      >
        🔗 分享
      </button>
      {copied && (
        <div className="toast">
          ✅ 連結已複製！
        </div>
      )}
    </div>
  );
}
