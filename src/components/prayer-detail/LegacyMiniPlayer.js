"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import HeroPlayButton from "@/components/HeroPlayButton";

function clampIndex(index, length) {
  if (!length) return 0;
  const normalized = ((index % length) + length) % length;
  return normalized;
}

export default function LegacyMiniPlayer({
  slides = [],
  scrollTargetId = "pray-audio",
}) {
  const initialIndex = useMemo(() => {
    const current = slides.findIndex((slide) => slide?.isCurrent);
    return current >= 0 ? current : 0;
  }, [slides]);

  const [index, setIndex] = useState(initialIndex);
  const touchStartRef = useRef(null);

  const goTo = (delta) => {
    if (!slides.length) return;
    setIndex((prev) => clampIndex(prev + delta, slides.length));
  };

  const handleTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const resolvedSlide = slides.length ? slides[clampIndex(index, slides.length)] : null;

  const handleTouchEndSafe = (event) => {
    if (!touchStartRef.current) return;
    const touch = event.changedTouches?.[0];
    if (!touch) {
      touchStartRef.current = null;
      return;
    }
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      goTo(deltaX > 0 ? -1 : 1);
    }
  };

  if (!resolvedSlide) {
    return null;
  }

  const metaText = resolvedSlide.meta || "";
  const ctaLabel = resolvedSlide.ctaLabel || (resolvedSlide.isCurrent ? "播放" : "前往");

  return (
    <footer
      className="legacy-mini-player legacy-card legacy-card--dark"
      data-player-index={index}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEndSafe}
    >
      <div
        className="legacy-mini-player__art"
        style={resolvedSlide.image ? { backgroundImage: `url('${resolvedSlide.image}')` } : undefined}
        aria-hidden="true"
      />
      <div className="legacy-mini-player__info">
        <strong>{resolvedSlide.title}</strong>
        {metaText ? <span>{metaText}</span> : null}
      </div>
      <div className="legacy-mini-player__actions">
        <button
          className="legacy-icon-button"
          type="button"
          aria-label="上一則禱告"
          onClick={() => goTo(-1)}
        >
          &#10094;
        </button>
        {resolvedSlide.isCurrent ? (
          <HeroPlayButton
            requestId={resolvedSlide.id}
            className="legacy-icon-button legacy-icon-button--primary"
            scrollTargetId={scrollTargetId}
          >
            {ctaLabel}
          </HeroPlayButton>
        ) : resolvedSlide.href ? (
          <Link
            href={resolvedSlide.href}
            prefetch={false}
            className="legacy-icon-button legacy-icon-button--primary"
          >
            {ctaLabel}
          </Link>
        ) : (
          <button
            className="legacy-icon-button legacy-icon-button--primary"
            type="button"
            onClick={() => goTo(1)}
          >
            {ctaLabel}
          </button>
        )}
        <button
          className="legacy-icon-button"
          type="button"
          aria-label="下一則禱告"
          onClick={() => goTo(1)}
        >
          &#10095;
        </button>
      </div>
    </footer>
  );
}
