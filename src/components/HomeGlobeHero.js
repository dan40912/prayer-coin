"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { GlobalPrayerRoomEmbed } from "@/components/GlobalPrayerRoom";

const TEXT = {
  eyebrow: "GLOBAL PRAYER ROOM",
  headline: "看見世界正在被守望",
  subheadline: "每一個光點，都是正在被代禱的需要。",
  primaryCta: "進入全球禱告室",
  secondaryCta: "新增代禱",
  totalPrayers: "全球代禱數",
  locationLights: "城市光點數",
  todayNew: "今日新增",
  privateTitle: "匿名代禱",
  privateExcerpt: "這個城市有人需要被守望。",
};

function formatLocation(prayer) {
  if (!prayer?.locationCity) return "大致位置";
  return prayer.locationCountry ? `${prayer.locationCity}, ${prayer.locationCountry}` : prayer.locationCity;
}

function formatRelativeTime(value) {
  const time = value ? new Date(value).getTime() : 0;
  if (!Number.isFinite(time) || time <= 0) return "剛剛";

  const diff = Date.now() - time;
  if (diff < 60_000) return "剛剛";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分鐘前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小時前`;
  return `${Math.floor(diff / 86_400_000)} 天前`;
}

function toText(value) {
  if (!value) return "";
  return String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}

function getPrayerTitle(prayer) {
  if (!prayer) return TEXT.privateTitle;
  return prayer.isPrivate ? TEXT.privateTitle : prayer.title || TEXT.privateTitle;
}

function getPrayerExcerpt(prayer) {
  if (!prayer) return "";
  if (prayer.isPrivate) return TEXT.privateExcerpt;
  return toText(prayer.description);
}

function getPrayerStatus(prayer) {
  if (prayer?.isPrivate) return "匿名";
  if (Number(prayer?.responseCount || 0) > 0) return "已回應";
  return "需要關注";
}

function getPrayerHref(prayer) {
  return prayer?.id ? `/prayfor/${prayer.id}` : "/global-prayer-room";
}

function buildLatestPrayers(prayers) {
  return [...prayers]
    .filter((prayer) => Number.isFinite(Number(prayer.locationLat)) && Number.isFinite(Number(prayer.locationLng)))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);
}

export function GlobeSkeleton({ hidden = false }) {
  return (
    <div className={`home-map-skeleton${hidden ? " is-hidden" : ""}`} aria-hidden="true">
      <div className="home-map-skeleton__earth">
        <span />
        <i />
        <b />
      </div>
      <p>正在載入代禱光點</p>

      <style jsx>{`
        .home-map-skeleton {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at 68% 48%, rgba(14, 165, 233, 0.2), transparent 32%),
            #020817;
          opacity: 1;
          transition: opacity 520ms ease;
          pointer-events: none;
        }

        .home-map-skeleton.is-hidden {
          opacity: 0;
        }

        .home-map-skeleton__earth {
          position: absolute;
          right: min(4vw, 4rem);
          width: min(72vw, 880px);
          aspect-ratio: 1;
          border-radius: 50%;
          background:
            radial-gradient(circle at 32% 26%, rgba(226, 232, 240, 0.22), transparent 18%),
            radial-gradient(circle at 52% 50%, rgba(14, 165, 233, 0.34), rgba(8, 47, 73, 0.72) 46%, #020817 72%);
          box-shadow: 0 0 90px rgba(14, 165, 233, 0.22);
          animation: skeleton-float 4.8s ease-in-out infinite;
        }

        .home-map-skeleton__earth span,
        .home-map-skeleton__earth i,
        .home-map-skeleton__earth b {
          position: absolute;
          border-radius: 999px;
          background: #fef08a;
          box-shadow: 0 0 24px rgba(250, 204, 21, 0.58);
        }

        .home-map-skeleton__earth span {
          left: 58%;
          top: 38%;
          width: 12px;
          height: 12px;
        }

        .home-map-skeleton__earth i {
          left: 46%;
          top: 54%;
          width: 9px;
          height: 9px;
        }

        .home-map-skeleton__earth b {
          left: 67%;
          top: 59%;
          width: 8px;
          height: 8px;
        }

        .home-map-skeleton p {
          position: absolute;
          left: 1rem;
          bottom: 1rem;
          margin: 0;
          color: rgba(226, 232, 240, 0.72);
          font-size: 0.82rem;
          font-weight: 800;
        }

        @keyframes skeleton-float {
          50% {
            transform: translateY(-12px) scale(1.015);
          }
        }
      `}</style>
    </div>
  );
}

function PrayerPopup({ cluster, onClose }) {
  const router = useRouter();
  if (!cluster) return null;

  const prayers = cluster.prayers || [];
  const primaryPrayer = prayers[0] || null;
  const isCluster = Number(cluster.totalCount || prayers.length) > 1;
  const visiblePrayers = prayers.slice(0, 5);

  return (
    <aside className="home-map-popup" aria-live="polite">
      <button className="home-map-popup__close" type="button" onClick={onClose} aria-label="關閉代禱摘要">
        關閉
      </button>

      {isCluster ? (
        <>
          <span>此區域的代禱</span>
          <h2>{cluster.fullLabel} · {cluster.totalCount || prayers.length} 筆</h2>
          <div className="home-map-popup__list">
            {visiblePrayers.map((prayer) => (
              <button key={prayer.id} type="button" onClick={() => router.push(getPrayerHref(prayer))}>
                <strong>{getPrayerTitle(prayer)}</strong>
                <small>
                  {formatLocation(prayer)} · {formatRelativeTime(prayer.createdAt)}
                </small>
                <em>{getPrayerStatus(prayer)}</em>
              </button>
            ))}
          </div>
          {(cluster.totalCount || prayers.length) > 5 ? (
            <button
              className="home-map-popup__all"
              type="button"
              onClick={() =>
                router.push(
                  `/global-prayer-room?city=${encodeURIComponent(cluster.locationCity || "")}&country=${encodeURIComponent(
                    cluster.locationCountry || ""
                  )}`
                )
              }
            >
              查看全部 {cluster.totalCount || prayers.length} 筆
            </button>
          ) : null}
        </>
      ) : (
        <>
          <span>{cluster.fullLabel} · {formatRelativeTime(primaryPrayer?.createdAt || cluster.latestCreatedAt)}</span>
          <h2>{getPrayerTitle(primaryPrayer)}</h2>
          <p>{getPrayerExcerpt(primaryPrayer) || TEXT.privateExcerpt}</p>
          <div className="home-map-popup__meta">
            <em>{getPrayerStatus(primaryPrayer)}</em>
            <em>{Number(primaryPrayer?.responseCount || 0)} 個回應</em>
          </div>
          <button className="home-map-popup__cta" type="button" onClick={() => router.push(getPrayerHref(primaryPrayer))}>
            查看代禱
          </button>
        </>
      )}

      <style jsx>{`
        .home-map-popup {
          position: absolute;
          right: clamp(1rem, 4vw, 3rem);
          bottom: 6.4rem;
          z-index: 30;
          display: grid;
          gap: 0.65rem;
          width: min(340px, calc(100vw - 2rem));
          border: 1px solid rgba(125, 211, 252, 0.24);
          border-radius: 14px;
          background: rgba(2, 6, 23, 0.72);
          color: #f8fafc;
          padding: 1rem;
          box-shadow: 0 28px 80px rgba(2, 6, 23, 0.55);
          backdrop-filter: blur(18px);
          pointer-events: auto;
          animation: popup-in 200ms ease-out both;
        }

        .home-map-popup__close {
          justify-self: end;
          min-height: 34px;
          border: 1px solid rgba(226, 232, 240, 0.2);
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.68);
          color: #dbeafe;
          cursor: pointer;
          font-weight: 800;
          padding: 0 0.7rem;
        }

        .home-map-popup span {
          color: #7dd3fc;
          font-size: 0.78rem;
          font-weight: 900;
        }

        .home-map-popup h2,
        .home-map-popup p {
          margin: 0;
        }

        .home-map-popup h2 {
          font-size: 1.08rem;
          line-height: 1.35;
        }

        .home-map-popup p {
          display: -webkit-box;
          overflow: hidden;
          color: rgba(226, 232, 240, 0.78);
          line-height: 1.58;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }

        .home-map-popup__meta,
        .home-map-popup__list {
          display: grid;
          gap: 0.5rem;
        }

        .home-map-popup__meta {
          display: flex;
          flex-wrap: wrap;
        }

        .home-map-popup em {
          width: max-content;
          border-radius: 999px;
          padding: 0.28rem 0.55rem;
          color: #bae6fd;
          font-size: 0.72rem;
          font-style: normal;
          font-weight: 900;
          background: rgba(14, 165, 233, 0.14);
        }

        .home-map-popup__list button {
          display: grid;
          gap: 0.25rem;
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.48);
          color: inherit;
          cursor: pointer;
          padding: 0.7rem;
          text-align: left;
        }

        .home-map-popup__list button:hover,
        .home-map-popup__list button:focus-visible {
          border-color: rgba(56, 189, 248, 0.42);
          outline: none;
        }

        .home-map-popup__list strong {
          font-size: 0.9rem;
          line-height: 1.35;
        }

        .home-map-popup__list small {
          color: rgba(226, 232, 240, 0.64);
          font-weight: 800;
        }

        .home-map-popup__cta,
        .home-map-popup__all {
          min-height: 44px;
          border: 1px solid #38bdf8;
          border-radius: 10px;
          background: #38bdf8;
          color: #031525;
          cursor: pointer;
          font-weight: 900;
        }

        @keyframes popup-in {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 767px) {
          .home-map-popup {
            position: fixed;
            left: 0.75rem;
            right: 0.75rem;
            bottom: 0.75rem;
            width: auto;
            max-height: 60svh;
            overflow: auto;
            padding-bottom: calc(1rem + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </aside>
  );
}

function MapControls({ onShowTaiwan, onResetTaipei, onZoomIn, onZoomOut, onShowAll }) {
  return (
    <div className="home-map-controls" aria-label="地圖控制">
      <button type="button" onClick={onShowTaiwan} aria-label="回到台灣">
        回到台灣
      </button>
      <button type="button" onClick={onResetTaipei} aria-label="回到台北">
        回到台北
      </button>
      <button type="button" onClick={onZoomIn} aria-label="放大">
        +
      </button>
      <button type="button" onClick={onZoomOut} aria-label="縮小">
        -
      </button>
      <button type="button" onClick={onShowAll} aria-label="全部光點">
        全部光點
      </button>

      <style jsx>{`
        .home-map-controls {
          position: absolute;
          right: clamp(1rem, 4vw, 3rem);
          bottom: 1.5rem;
          z-index: 25;
          display: flex;
          gap: 0.45rem;
          flex-wrap: wrap;
          justify-content: end;
          pointer-events: auto;
        }

        .home-map-controls button {
          min-height: 44px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.72);
          color: #e0f2fe;
          cursor: pointer;
          font-weight: 900;
          padding: 0 0.85rem;
          box-shadow: 0 18px 48px rgba(2, 6, 23, 0.32);
          backdrop-filter: blur(18px);
        }

        .home-map-controls button:hover,
        .home-map-controls button:focus-visible {
          border-color: rgba(34, 211, 238, 0.48);
          outline: none;
        }

        @media (max-width: 767px) {
          .home-map-controls {
            left: 0.75rem;
            right: 0.75rem;
            bottom: 0.75rem;
          }

          .home-map-controls button {
            flex: 1;
            padding-inline: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
export function HeroGlobe({ prayers, focusPrayerId, activeClusterId, onClusterSelect, onBlankClick, onReady, globeRef }) {
  return (
    <GlobalPrayerRoomEmbed
      prayers={prayers}
      title={TEXT.eyebrow}
      isHero
      fullscreen
      heroMap
      focusPrayerId={focusPrayerId}
      activeClusterId={activeClusterId}
      externalGlobeRef={globeRef}
      onHeroClusterSelect={onClusterSelect}
      onHeroBlankClick={onBlankClick}
      onHeroReady={onReady}
    />
  );
}

export default function HomeGlobeHero({
  prayers = [],
  primaryHref = "/global-prayer-room",
  secondaryHref = "/customer-portal/create",
  stats,
}) {
  const globeRef = useRef(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [activePrayerId, setActivePrayerId] = useState(null);
  const [globeReady, setGlobeReady] = useState(false);

  const latestPrayers = useMemo(() => buildLatestPrayers(prayers), [prayers]);
  const activeClusterId = selectedCluster?.id || null;
  const hasMarkers = prayers.some(
    (prayer) => Number.isFinite(Number(prayer.locationLat)) && Number.isFinite(Number(prayer.locationLng))
  );

  const closePopup = useCallback(() => {
    setSelectedCluster(null);
    setActivePrayerId(null);
    globeRef.current?.clearActiveCluster?.();
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closePopup]);

  const handleClusterSelect = useCallback((cluster) => {
    if (!cluster) {
      closePopup();
      return;
    }
    setSelectedCluster(cluster);
    setActivePrayerId(cluster.prayers?.[0]?.id || null);
  }, [closePopup]);

  const focusLatestPrayer = useCallback((prayer) => {
    setActivePrayerId(prayer.id);
  }, []);

  return (
    <section className="home-map-hero" aria-labelledby="home-map-title">
      <div className="home-map-hero__globe" aria-label="互動式全球代禱地圖">
        <GlobeSkeleton hidden={globeReady} />
        <HeroGlobe
          prayers={prayers}
          focusPrayerId={activePrayerId}
          activeClusterId={activeClusterId}
          globeRef={globeRef}
          onClusterSelect={handleClusterSelect}
          onBlankClick={closePopup}
          onReady={() => {
            setGlobeReady(true);
            globeRef.current?.showTaiwan?.();
          }}
        />
      </div>

      <div className="home-map-hero__shade" aria-hidden="true" />

      <div className="home-map-hero__copy">
        <p>{TEXT.eyebrow}</p>
        <h1 id="home-map-title">{TEXT.headline}</h1>
        <span>{TEXT.subheadline}</span>
        <div className="home-map-hero__actions">
          <Link href={primaryHref} className="button button--primary" prefetch={false}>
            {TEXT.primaryCta}
          </Link>
          <Link href={secondaryHref} className="button button--ghost" prefetch={false}>
            {TEXT.secondaryCta}
          </Link>
        </div>
        <div className="home-map-hero__stats" aria-label="首頁即時摘要">
          <article>
            <strong>{stats.totalPrayers}</strong>
            <small>{TEXT.totalPrayers}</small>
          </article>
          <article>
            <strong>{stats.locationLights}</strong>
            <small>{TEXT.locationLights}</small>
          </article>
          <article>
            <strong>{stats.todayNew}</strong>
            <small>{TEXT.todayNew}</small>
          </article>
        </div>
      </div>

      <div className="home-map-hero__hint" aria-hidden="true">
        左右拖曳旋轉地球 · 點擊光點查看代禱
      </div>

      {!hasMarkers ? (
        <div className="home-map-hero__empty">
          <strong>目前尚無公開代禱</strong>
          <span>成為第一個點亮城市的人</span>
          <Link href={secondaryHref}>新增代禱</Link>
        </div>
      ) : null}

      <PrayerPopup cluster={selectedCluster} onClose={closePopup} />

      <MapControls
        onShowTaiwan={() => globeRef.current?.showTaiwan?.()}
        onResetTaipei={() => globeRef.current?.resetTaipei?.()}
        onZoomIn={() => globeRef.current?.zoomIn?.()}
        onZoomOut={() => globeRef.current?.zoomOut?.()}
        onShowAll={() => globeRef.current?.showAllMarkers?.()}
      />

      {latestPrayers.length ? (
        <div className="home-map-hero__quick-list" aria-label="最新代禱快速定位">
          <span>最新光點</span>
          {latestPrayers.slice(0, 3).map((prayer) => (
            <button key={prayer.id} type="button" onClick={() => focusLatestPrayer(prayer)}>
              {formatLocation(prayer)}
            </button>
          ))}
        </div>
      ) : null}

      <style jsx>{`
        .home-map-hero {
          position: relative;
          left: 50%;
          right: 50%;
          width: 100vw;
          min-height: calc(100svh - var(--site-header-height, 64px));
          margin-left: -50vw;
          margin-right: -50vw;
          overflow: hidden;
          color: #f8fafc;
          background: #020617;
          isolation: isolate;
        }

        .home-map-hero__globe {
          position: absolute;
          inset: 0;
          z-index: 0;
          touch-action: pan-y;
        }

        .home-map-hero__globe :global(.global-room-embed),
        .home-map-hero__globe :global(.global-room-embed--hero),
        .home-map-hero__globe :global(.global-room__canvas),
        .home-map-hero__globe :global(.cesium-viewer),
        .home-map-hero__globe :global(.cesium-viewer-cesiumWidgetContainer),
        .home-map-hero__globe :global(.cesium-widget),
        .home-map-hero__globe :global(.cesium-widget canvas) {
          width: 100% !important;
          height: 100% !important;
          pointer-events: auto !important;
          touch-action: pan-y !important;
        }

        .home-map-hero__shade {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          background:
            linear-gradient(90deg, rgba(2, 6, 23, 0.86) 0%, rgba(2, 6, 23, 0.58) 31%, rgba(2, 6, 23, 0.12) 62%),
            linear-gradient(0deg, rgba(2, 6, 23, 0.42), transparent 32%, rgba(2, 6, 23, 0.18));
        }

        .home-map-hero__copy {
          position: relative;
          z-index: 20;
          width: min(520px, calc(100% - 2rem));
          padding: clamp(4rem, 12vh, 8rem) 0 8rem clamp(1rem, 5vw, 4rem);
          pointer-events: auto;
        }

        .home-map-hero__copy p,
        .home-map-hero__copy h1,
        .home-map-hero__copy span {
          margin: 0;
        }

        .home-map-hero__copy p {
          color: #7dd3fc;
          font-size: 0.78rem;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        .home-map-hero__copy h1 {
          margin-top: 0.85rem;
          color: rgba(255, 255, 255, 0.98);
          font-size: clamp(2.6rem, 5.2vw, 5.2rem);
          line-height: 1.04;
          letter-spacing: 0;
          text-shadow: 0 24px 60px rgba(2, 6, 23, 0.72);
        }

        .home-map-hero__copy > span {
          display: block;
          max-width: 34rem;
          margin-top: 1rem;
          color: rgba(226, 232, 240, 0.78);
          font-size: 1.05rem;
          line-height: 1.75;
        }

        .home-map-hero__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.35rem;
        }

        .home-map-hero__actions :global(.button) {
          min-height: 48px;
          border-radius: 10px;
          font-weight: 900;
        }

        .home-map-hero__actions :global(.button--primary) {
          background: #38bdf8;
          border-color: #38bdf8;
          color: #031525;
          box-shadow: 0 18px 44px rgba(56, 189, 248, 0.24);
        }

        .home-map-hero__actions :global(.button--ghost) {
          border-color: rgba(226, 232, 240, 0.34);
          background: rgba(2, 6, 23, 0.18);
          color: rgba(248, 250, 252, 0.9);
          backdrop-filter: blur(12px);
        }

        .home-map-hero__stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.55rem;
          margin-top: 1.25rem;
        }

        .home-map-hero__stats article {
          display: grid;
          gap: 0.18rem;
          min-height: 62px;
          border: 1px solid rgba(125, 211, 252, 0.16);
          border-radius: 999px;
          background: rgba(2, 6, 23, 0.34);
          padding: 0.62rem 0.78rem;
          backdrop-filter: blur(14px);
        }

        .home-map-hero__stats strong {
          color: #fef08a;
          font-size: 1.2rem;
          line-height: 1;
        }

        .home-map-hero__stats small {
          color: rgba(226, 232, 240, 0.62);
          font-size: 0.72rem;
          font-weight: 800;
        }

        .home-map-hero__hint,
        .home-map-hero__empty,
        .home-map-hero__quick-list {
          position: absolute;
          z-index: 24;
          border: 1px solid rgba(125, 211, 252, 0.18);
          border-radius: 999px;
          background: rgba(2, 6, 23, 0.56);
          color: rgba(226, 232, 240, 0.82);
          font-size: 0.82rem;
          font-weight: 900;
          backdrop-filter: blur(16px);
          pointer-events: none;
        }

        .home-map-hero__hint {
          left: clamp(1rem, 5vw, 4rem);
          bottom: 1.5rem;
          padding: 0.68rem 0.9rem;
        }

        .home-map-hero__empty {
          left: 50%;
          top: 50%;
          display: grid;
          gap: 0.35rem;
          min-width: 280px;
          border-radius: 14px;
          padding: 1rem;
          text-align: center;
          transform: translate(-50%, -50%);
          pointer-events: auto;
        }

        .home-map-hero__empty a {
          color: #7dd3fc;
          font-weight: 900;
        }

        .home-map-hero__quick-list {
          right: clamp(1rem, 4vw, 3rem);
          top: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          border-radius: 14px;
          padding: 0.5rem;
          pointer-events: auto;
        }

        .home-map-hero__quick-list span {
          padding: 0 0.45rem;
          color: #7dd3fc;
        }

        .home-map-hero__quick-list button {
          min-height: 36px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.72);
          color: #e0f2fe;
          cursor: pointer;
          font-weight: 900;
          padding: 0 0.7rem;
        }

        @media (max-width: 860px) {
          .home-map-hero__copy {
            width: min(460px, calc(100% - 1.5rem));
            padding: 2rem 0 9rem 0.75rem;
          }

          .home-map-hero__copy h1 {
            font-size: clamp(2.1rem, 10vw, 3.35rem);
          }

          .home-map-hero__copy > span {
            font-size: 0.95rem;
          }

          .home-map-hero__stats article {
            border-radius: 12px;
            min-height: 58px;
          }

          .home-map-hero__hint {
            left: 0.75rem;
            right: 0.75rem;
            bottom: 4.75rem;
            text-align: center;
          }

          .home-map-hero__quick-list {
            display: none;
          }

          .home-map-hero__shade {
            background:
              linear-gradient(180deg, rgba(2, 6, 23, 0.84) 0%, rgba(2, 6, 23, 0.28) 45%, rgba(2, 6, 23, 0.72) 100%);
          }
        }
      `}</style>
    </section>
  );
}
