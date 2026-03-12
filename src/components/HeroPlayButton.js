"use client";

import { useCallback } from "react";
import { PRAYER_AUDIO_START_EVENT } from "@/lib/events";

export default function HeroPlayButton({
  requestId,
  children,
  className,
  scrollTargetId = "pray-audio",
}) {
  const handleClick = useCallback(() => {
    if (typeof window === "undefined") return;

    if (scrollTargetId) {
      const target = document.getElementById(scrollTargetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    const detail = { requestId: String(requestId ?? "") };
    window.dispatchEvent(new CustomEvent(PRAYER_AUDIO_START_EVENT, { detail }));
  }, [requestId, scrollTargetId]);

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
