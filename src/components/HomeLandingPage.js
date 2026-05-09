import Link from "next/link";

import HomeGlobeHero from "@/components/HomeGlobeHero";
import HomePrayerExplorer from "@/components/HomePrayerExplorer";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { readActiveCategories } from "@/lib/homeCategories";
import { readHomeCards } from "@/lib/homeCards";
import { readHomeStats } from "@/lib/homeStats";
import prisma from "@/lib/prisma";
import { SITE_URL, absoluteUrl, buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const PAGE_TEXT = {
  trustTitle: "更多認識 Start Pray",
  aboutTitle: "關於 Start Pray",
  aboutCopy: "Start Pray 讓禱告需要被看見，也讓每一次回應成為彼此扶持的見證。",
  howtoTitle: "如何參與",
  howtoCopy: "建立代禱事項、留下文字或語音禱告，讓你的守望加入全球地圖。",
  policyTitle: "信任與安全",
  policyCopy: "我們保留匿名守望與檢舉機制，讓代禱空間保持溫暖、安靜與可信任。",
  learnMore: "了解更多",
  guide: "查看指南",
  whitepaper: "閱讀白皮書",
};

function toGlobalPrayerPayload(card) {
  const isPrivate = Boolean(card.isPrivate);

  return {
    id: card.id,
    isPrivate,
    title: isPrivate ? "匿名代禱" : card.title,
    description: isPrivate ? "這個城市有人需要被守望。" : card.description,
    createdAt: card.createdAt?.toISOString?.() ?? null,
    voiceHref: isPrivate ? null : card.voiceHref,
    locationCity: card.locationCity,
    locationCountry: card.locationCountry,
    locationLat: Number(card.locationLat),
    locationLng: Number(card.locationLng),
    category: isPrivate ? null : card.category,
    owner: isPrivate ? null : card.owner,
    responseCount: isPrivate ? 0 : card._count?.responses ?? 0,
    audioCount: isPrivate
      ? 0
      : (card.responses || []).filter((response) => Boolean(response.voiceUrl)).length,
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
  const audioPrayers = globalPrayers.filter(
    (prayer) => prayer.voiceHref || Number(prayer.audioCount || 0) > 0
  ).length;

  return {
    totalPrayers: stats.totalPrayerCards.toLocaleString("zh-TW"),
    locationLights: locationLights.toLocaleString("zh-TW"),
    todayNew: todayNew.toLocaleString("zh-TW"),
    audioPrayers: audioPrayers.toLocaleString("zh-TW"),
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
  title: "Start Pray 一起禱告吧",
  description:
    "Start Pray 讓你看見全球正在被守望的禱告需要，建立代禱事項，並透過文字與語音禱告彼此陪伴。",
  path: "/",
  image: "/img/categories/popular.jpg",
  keywords: ["Start Pray", "一起禱告", "代禱平台", "語音禱告", "全球禱告地圖", "基督徒禱告"],
});

function HomeStructuredData({ stats, globalPrayerCount }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#home`,
    url: SITE_URL,
    name: "Start Pray 一起禱告吧",
    description:
      "看見全球正在被守望的禱告需要，建立代禱事項，並透過文字與語音禱告彼此陪伴。",
    inLanguage: "zh-Hant-TW",
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    about: [
      "禱告",
      "代禱",
      "語音禱告",
      "全球禱告地圖",
      "基督信仰社群",
    ],
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl("/img/categories/popular.jpg"),
    },
    mainEntity: {
      "@type": "ItemList",
      name: "全球代禱摘要",
      numberOfItems: Number(globalPrayerCount || 0),
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "全球代禱數",
          description: String(stats?.totalPrayers || "0"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "地圖光點",
          description: String(stats?.locationLights || "0"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "24 小時新增",
          description: String(stats?.todayNew || "0"),
        },
      ],
    },
    potentialAction: {
      "@type": "ViewAction",
      target: `${SITE_URL}/global-prayer-room`,
      name: "進入全球禱告室",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

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
      take: 100,
      select: {
        id: true,
        isPrivate: true,
        title: true,
        description: true,
        voiceHref: true,
        createdAt: true,
        locationCity: true,
        locationCountry: true,
        locationLat: true,
        locationLng: true,
        category: { select: { name: true, slug: true } },
        owner: { select: { name: true, username: true } },
        responses: {
          where: {
            isBlocked: false,
            reportCount: 0,
            voiceUrl: { not: null },
          },
          select: { voiceUrl: true },
        },
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
        <HomeStructuredData stats={heroStats} globalPrayerCount={globalPrayers.length} />
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
