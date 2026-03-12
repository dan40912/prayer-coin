"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

function isFieldActive(element) {
  if (!element) return false;
  const tagName = element.tagName?.toLowerCase();
  if (!tagName) return false;
  return (
    element.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
}

function findNearestSectionIndex(sections) {
  if (!sections.length) return -1;
  let closestIndex = 0;
  let smallestDistance = Number.POSITIVE_INFINITY;
  sections.forEach((section, index) => {
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const distance = Math.abs(rect.top);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestIndex = index;
    }
  });
  return closestIndex;
}

export default function PrayerDetailNavigator({
  sectionIds = [],
  sectionLabels = [],
  commentSectionId = "",
  prevHref = "",
  nextHref = "",
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const resolveSections = useCallback(() => {
    if (typeof document === "undefined") return [];
    return sectionIds
      .map((id) => document.getElementById(id))
      .filter((element) => element);
  }, [sectionIds]);

  useEffect(() => {
    if (!sectionIds.length) return undefined;

    const handleKeyDown = (event) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (isFieldActive(event.target)) return;

      const sections = resolveSections();
      if (!sections.length) return;
      const currentIndex = findNearestSectionIndex(sections);

      if (event.key === "ArrowDown") {
        if (currentIndex >= sections.length - 1) return;
        event.preventDefault();
        sections[currentIndex + 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      if (event.key === "ArrowUp") {
        if (currentIndex <= 0) return;
        event.preventDefault();
        sections[currentIndex - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const commentSection = commentSectionId ? document.getElementById(commentSectionId) : null;
        if (!commentSection) return;
        const rect = commentSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight || 0;
        const isInFocus =
          rect.top <= viewportHeight * 0.6 && rect.bottom >= viewportHeight * 0.4;
        if (!isInFocus) return;

        event.preventDefault();
        const direction = event.key === "ArrowRight" ? "next" : "prev";
        window.dispatchEvent(
          new CustomEvent("prayer-comments:navigate", {
            detail: { direction },
          })
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sectionIds, commentSectionId, resolveSections]);

  useEffect(() => {
    if (typeof window === "undefined" || !sectionIds.length) return undefined;
    const sections = resolveSections();
    if (!sections.length) return undefined;

    if (!("IntersectionObserver" in window)) {
      setActiveIndex(Math.max(findNearestSectionIndex(sections), 0));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!visible.length) return;
        const topTarget = visible[0].target;
        const index = sections.findIndex((section) => section === topTarget);
        if (index >= 0) {
          setActiveIndex(index);
        }
      },
      {
        threshold: [0.35, 0.55, 0.75],
        rootMargin: "-15% 0px -15% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [sectionIds, resolveSections]);

  const sectionMeta = useMemo(() => {
    return sectionIds.map((id, index) => ({
      id,
      label: sectionLabels[index] ?? `Section ${index + 1}`,
    }));
  }, [sectionIds, sectionLabels]);

  const scrollToSection = useCallback(
    (index) => {
      const id = sectionIds[index];
      if (!id) return;
      const target = typeof document !== "undefined" ? document.getElementById(id) : null;
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveIndex(index);
    },
    [sectionIds]
  );

  return (
    <>
      {prevHref || nextHref ? (
        <div className="pray-floating-nav" aria-label="Prayer navigation">
          {prevHref ? (
            <Link
              href={prevHref}
              prefetch={false}
              className="pray-floating-nav__btn"
              data-direction="prev"
            >
              <span aria-hidden="true">‹</span>
              <span className="sr-only">上一個禱告</span>
            </Link>
          ) : (
            <span className="pray-floating-nav__spacer" aria-hidden="true" />
          )}
          {nextHref ? (
            <Link
              href={nextHref}
              prefetch={false}
              className="pray-floating-nav__btn"
              data-direction="next"
            >
              <span aria-hidden="true">›</span>
              <span className="sr-only">下一個禱告</span>
            </Link>
          ) : (
            <span className="pray-floating-nav__spacer" aria-hidden="true" />
          )}
        </div>
      ) : null}

      {sectionMeta.length > 1 ? (
        <div className="pray-progress" role="tablist" aria-label="Prayer sections">
          {sectionMeta.map((meta, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={meta.id}
                type="button"
                className={`pray-progress__dot${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "true" : undefined}
                aria-label={meta.label}
                onClick={() => scrollToSection(index)}
              >
                <span className="sr-only">
                  {isActive ? `${meta.label}（目前所在頁面）` : `前往 ${meta.label}`}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
