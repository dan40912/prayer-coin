"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import HeroPlayButton from "@/components/HeroPlayButton";

function clampIndex(index, length) {
  if (!length) return 0;
  const normalized = ((index % length) + length) % length;
  return normalized;
}

export default function LegacyHeroSlider({
  slides = [],
  commentsTargetId = "story",
  scrollTargetId = "pray-audio",
}) {
  const initialIndex = useMemo(() => {
    const current = slides.findIndex((slide) => slide?.isCurrent);
    return current >= 0 ? current : 0;
  }, [slides]);

  const [index, setIndex] = useState(initialIndex);
  const touchStartRef = useRef(null);
  const galleryTrackRef = useRef(null);

  const hasSlides = slides.length > 0;
  const resolvedSlide = hasSlides ? slides[clampIndex(index, slides.length)] : null;
  const galleryItems = resolvedSlide?.gallery?.length ? resolvedSlide.gallery : [];
  const metaItems = resolvedSlide?.meta?.length ? resolvedSlide.meta.slice(0, 3) : [];

  const goTo = (delta) => {
    if (!slides.length) return;
    setIndex((prev) => clampIndex(prev + delta, slides.length));
  };

  const handleTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    if (!touchStartRef.current) return;
    const touch = event.changedTouches?.[0];
    if (!touch) {
      touchStartRef.current = null;
      return;
    }
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      goTo(deltaX > 0 ? -1 : 1);
    }
  };

  const scrollGallery = (direction) => {
    const track = galleryTrackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * 200, behavior: "smooth" });
  };

  if (!resolvedSlide) {
    return null;
  }

  const primaryLabel = resolvedSlide.primary || (resolvedSlide.isCurrent ? "立即播放" : "查看祈禱");
  const secondaryLabel = resolvedSlide.secondary || (resolvedSlide.isCurrent ? "加入收藏" : "分享給朋友");
  const sectionHref = `#${commentsTargetId}`;

  return (
    <article
      className="legacy-hero-card"
      data-hero-index={index}
      style={resolvedSlide.image ? { "--hero-image": `url('${resolvedSlide.image}')` } : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.length > 1 ? (
        <div className="legacy-hero-slider-nav">
          <button
            type="button"
            className="legacy-hero-slider-nav__btn"
            aria-label="上一則祈禱"
            onClick={() => goTo(-1)}
          >
            &#10094;
          </button>
          <button
            type="button"
            className="legacy-hero-slider-nav__btn"
            aria-label="下一則祈禱"
            onClick={() => goTo(1)}
          >
            &#10095;
          </button>
        </div>
      ) : null}

      <div className="legacy-hero-media" aria-hidden="true" />

      <div className="legacy-hero-card__content">
        {resolvedSlide.tag ? <span className="legacy-pill">{resolvedSlide.tag}</span> : null}
        <h1>{resolvedSlide.title}</h1>
        {resolvedSlide.summary ? <p className="legacy-hero-summary">{resolvedSlide.summary}</p> : null}

        {metaItems.length ? (
          <ul className="legacy-meta-list">
            {metaItems.map((item) => (
              <li key={`${resolvedSlide.key}-${item}`}>{item}</li>
            ))}
          </ul>
        ) : null}

        <div className="legacy-hero-actions">
          {resolvedSlide.isCurrent ? (
            <HeroPlayButton
              requestId={resolvedSlide.id}
              className="legacy-btn"
              scrollTargetId={scrollTargetId}
            >
              {primaryLabel}
            </HeroPlayButton>
          ) : resolvedSlide.href ? (
            <Link href={resolvedSlide.href} prefetch={false} className="legacy-btn">
              {primaryLabel}
            </Link>
          ) : (
            <button type="button" className="legacy-btn" onClick={() => goTo(1)}>
              {primaryLabel}
            </button>
          )}

          {resolvedSlide.isCurrent ? (
            <a className="legacy-btn legacy-btn--ghost" href={sectionHref}>
              {secondaryLabel}
            </a>
          ) : resolvedSlide.href ? (
            <Link href={resolvedSlide.href} prefetch={false} className="legacy-btn legacy-btn--ghost">
              {secondaryLabel}
            </Link>
          ) : (
            <button type="button" className="legacy-btn legacy-btn--ghost" onClick={() => goTo(1)}>
              {secondaryLabel}
            </button>
          )}
        </div>
      </div>

      {galleryItems.length ? (
        <div className="legacy-hero-gallery" aria-hidden="true">
          <div className="legacy-hero-gallery__track" ref={galleryTrackRef}>
            {galleryItems.map((image, galleryIndex) => (
              <div
                key={`${resolvedSlide.key}-gallery-${galleryIndex}`}
                className="legacy-hero-gallery__item"
                style={{ backgroundImage: `url('${image}')` }}
              />
            ))}
          </div>
          {galleryItems.length > 1 ? (
            <div className="legacy-hero-gallery__controls">
              <button type="button" data-direction="prev" onClick={() => scrollGallery(-1)} aria-label="上一張照片">
                ‹
              </button>
              <button type="button" data-direction="next" onClick={() => scrollGallery(1)} aria-label="下一張照片">
                ›
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
