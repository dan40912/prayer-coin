"use client";

import { useEffect, useRef, useState } from "react";

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export default function LegacyFullpageNav({
  sectionIds = [],
  labels = [],
  containerId = "legacy-fullpage",
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isAnimatingRef = useRef(false);
  const scrollFnRef = useRef(() => {});
  const sectionsRef = useRef([]);
  const activeRef = useRef(0);
  const syncTimerRef = useRef(null);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container || !sectionIds.length) {
      return undefined;
    }

    sectionsRef.current = sectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter(Boolean);

    const maxIndex = sectionsRef.current.length - 1;

    const updateActive = (nextIndex) => {
      if (nextIndex === activeRef.current) return;
      activeRef.current = nextIndex;
      setActiveIndex(nextIndex);
    };

    const scrollToIndex = (targetIndex) => {
      if (!sectionsRef.current.length) return;
      const resolved = clamp(targetIndex, 0, maxIndex);
      if (!sectionsRef.current[resolved]) return;
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      sectionsRef.current[resolved].scrollIntoView({ behavior: "smooth", block: "start" });
      updateActive(resolved);
      window.setTimeout(() => {
        isAnimatingRef.current = false;
      }, 900);
    };

    scrollFnRef.current = scrollToIndex;

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) < 12) return;
      event.preventDefault();
      if (isAnimatingRef.current) return;
      const direction = event.deltaY > 0 ? 1 : -1;
      scrollToIndex(activeRef.current + direction);
    };

    const handleKeydown = (event) => {
      if (isAnimatingRef.current) return;
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        scrollToIndex(activeRef.current + 1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        scrollToIndex(activeRef.current - 1);
      }
    };

    const syncIndex = () => {
      const viewportMiddle = window.innerHeight / 2;
      const withDistance = sectionsRef.current.map((section, index) => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - viewportMiddle);
        return { index, distance };
      });
      withDistance.sort((a, b) => a.distance - b.distance);
      const closest = withDistance[0];
      if (closest) {
        updateActive(closest.index);
      }
    };

    const handleScroll = () => {
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
      syncTimerRef.current = window.setTimeout(syncIndex, 120);
    };

    const wheelOptions = { passive: false };
    const scrollOptions = { passive: true };

    container.addEventListener("wheel", handleWheel, wheelOptions);
    container.addEventListener("scroll", handleScroll, scrollOptions);
    window.addEventListener("keydown", handleKeydown, wheelOptions);
    syncIndex();

    return () => {
      container.removeEventListener("wheel", handleWheel, wheelOptions);
      container.removeEventListener("scroll", handleScroll, scrollOptions);
      window.removeEventListener("keydown", handleKeydown, wheelOptions);
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, [containerId, sectionIds]);

  const handleNavClick = (targetIndex) => {
    scrollFnRef.current(targetIndex);
  };

  if (!sectionIds.length) {
    return null;
  }

  return (
    <div className="legacy-fp-nav" aria-label="Section navigation">
      {sectionIds.map((sectionId, idx) => (
        <button
          key={sectionId}
          type="button"
          data-index={idx}
          className={idx === activeIndex ? "is-active" : undefined}
          aria-label={labels[idx] || `Section ${idx + 1}`}
          aria-current={idx === activeIndex ? "true" : undefined}
          onClick={() => handleNavClick(idx)}
        />
      ))}
    </div>
  );
}
