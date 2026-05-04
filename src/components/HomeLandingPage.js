import Link from "next/link";

import HomeGlobeHero from "@/components/HomeGlobeHero";
import HomePrayerExplorer from "@/components/HomePrayerExplorer";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { readActiveCategories } from "@/lib/homeCategories";
import { readHomeCards } from "@/lib/homeCards";
import { readHomeStats } from "@/lib/homeStats";
import prisma from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const PAGE_TEXT = {
  trustTitle: "平台資訊",
  aboutTitle: "關於 Start Pray",
  aboutCopy: "了解我們如何把代禱需要整理成更容易被看見與回應的空間。",
  howtoTitle: "使用方式",
  howtoCopy: "快速了解如何發布代禱、回應他人，以及在全球禱告室中看見位置光點。",
  policyTitle: "資料與說明",
  policyCopy: "閱讀平台治理、資料隱私與使用邊界，讓分享與代禱更安心。",
  learnMore: "了解更多",
  guide: "查看教學",
  whitepaper: "查看說明",
};

function toGlobalPrayerPayload(card) {
  const isPrivate = Boolean(card.isPrivate);

  return {
    id: card.id,
    isPrivate,
    title: isPrivate ? "匿名代禱" : card.title,
    description: isPrivate ? "這是一個匿名代禱需要，請一起守望。" : card.description,
    createdAt: card.createdAt?.toISOString?.() ?? null,
    locationCity: card.locationCity,
    locationCountry: card.locationCountry,
    locationLat: Number(card.locationLat),
    locationLng: Number(card.locationLng),
    category: isPrivate ? null : card.category,
    owner: isPrivate ? null : card.owner,
    responseCount: isPrivate ? 0 : card._count?.responses ?? 0,
  };
}

function buildHeroStats(stats, globalPrayers) {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const locationLights = new Set(
    globalPrayers.map((prayer) => {
      const lat = Number(prayer.locationLat);
      const lng = Number(prayer.locationLng);
      return `${prayer.locationCity || "approx"}::${lat.toFixed(3)}::${lng.toFixed(3)}`;
    })
  ).size;
  const todayNew = globalPrayers.filter((prayer) => {
    const time = prayer.createdAt ? new Date(prayer.createdAt).getTime() : 0;
    return Number.isFinite(time) && time >= oneDayAgo;
  }).length;

  return {
    totalPrayers: stats.totalPrayerCards.toLocaleString("zh-TW"),
    locationLights: locationLights.toLocaleString("zh-TW"),
    todayNew: todayNew.toLocaleString("zh-TW"),
  };
}

function toClientValue(value) {
  if (value == null) return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "object") return value;
  if (typeof value.toNumber === "function") return value.toNumber();
  if (Array.isArray(value)) return value.map(toClientValue);

  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, toClientValue(entry)]));
}

export const metadata = buildPageMetadata({
  title: "Start Pray",
  description: "在全球禱告室中看見代禱需要，一起為世界各地守望。",
  path: "/",
  image: "/img/categories/popular.jpg",
});

export default async function HomeLandingPage() {
  const [categories, topCards, stats, globalPrayerCards] = await Promise.all([
    readActiveCategories(),
    readHomeCards({ sort: "responses", limit: 12 }),
    readHomeStats(),
    prisma.homePrayerCard.findMany({
      where: {
        isBlocked: false,
        locationCity: { not: null },
        locationLat: { not: null },
        locationLng: { not: null },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 80,
      select: {
        id: true,
        isPrivate: true,
        title: true,
        description: true,
        createdAt: true,
        locationCity: true,
        locationCountry: true,
        locationLat: true,
        locationLng: true,
        category: { select: { name: true, slug: true } },
        owner: { select: { name: true, username: true } },
        _count: { select: { responses: true } },
      },
    }),
  ]);

  const globalPrayers = globalPrayerCards.map(toGlobalPrayerPayload);
  const heroStats = buildHeroStats(stats, globalPrayers);
  const clientCategories = toClientValue(categories);
  const clientTopCards = toClientValue(topCards);

  return (
    <>
      <SiteHeader activePath="/" />

      <main className="home-page">
        <HomeGlobeHero
          prayers={globalPrayers}
          primaryHref="/global-prayer-room"
          secondaryHref="/customer-portal/create"
          stats={heroStats}
        />

        <section>
          <HomePrayerExplorer initialCategories={clientCategories} initialCards={clientTopCards} />
        </section>

        <section className="section bg-legal-links" id="trust-links">
          <div className="section__container">
            <h2>{PAGE_TEXT.trustTitle}</h2>
            <div className="info-links-grid">
              <div className="info-link-group">
                <h3>{PAGE_TEXT.aboutTitle}</h3>
                <p>{PAGE_TEXT.aboutCopy}</p>
                <Link href="/about" className="link-arrow" prefetch={false}>
                  {PAGE_TEXT.learnMore}
                </Link>
              </div>
              <div className="info-link-group">
                <h3>{PAGE_TEXT.howtoTitle}</h3>
                <p>{PAGE_TEXT.howtoCopy}</p>
                <Link href="/howto" className="link-arrow" prefetch={false}>
                  {PAGE_TEXT.guide}
                </Link>
              </div>
              <div className="info-link-group">
                <h3>{PAGE_TEXT.policyTitle}</h3>
                <p>{PAGE_TEXT.policyCopy}</p>
                <Link href="/whitepaper" className="link-arrow" prefetch={false}>
                  {PAGE_TEXT.whitepaper}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
