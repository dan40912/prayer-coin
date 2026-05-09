import { GlobalPrayerRoomPageExperience } from "@/components/GlobalPrayerRoom";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import prisma from "@/lib/prisma";
import { SITE_URL, absoluteUrl, buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

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
    prayerCount: 1,
  };
}

export const metadata = buildPageMetadata({
  title: "全球禱告室",
  description:
    "在 Start Pray 全球禱告室查看世界各地的代禱光點、最新禱告需求與語音禱告，為城市、家庭、教會與急迫事件一起守望。",
  path: "/global-prayer-room",
  image: "/img/categories/world.jpg",
  keywords: ["全球禱告室", "全球代禱", "禱告地圖", "語音禱告", "城市代禱", "Start Pray"],
});

function GlobalPrayerRoomStructuredData({ prayers }) {
  const publicPrayers = prayers.filter((prayer) => !prayer.isPrivate).slice(0, 12);
  const locations = new Set(
    prayers
      .map((prayer) => `${prayer.locationCity || ""}, ${prayer.locationCountry || ""}`.trim())
      .filter(Boolean)
  );
  const audioCount = prayers.filter(
    (prayer) => prayer.voiceHref || Number(prayer.audioCount || 0) > 0
  ).length;

  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/global-prayer-room#collection`,
    url: `${SITE_URL}/global-prayer-room`,
    name: "全球禱告室",
    description:
      "查看世界各地的代禱光點、最新禱告需求與語音禱告，為城市、家庭、教會與急迫事件一起守望。",
    inLanguage: "zh-Hant-TW",
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl("/img/categories/world.jpg"),
    },
    about: ["全球代禱", "禱告地圖", "語音禱告", "城市守望"],
    mainEntity: {
      "@type": "ItemList",
      name: "最新全球代禱",
      numberOfItems: prayers.length,
      itemListElement: publicPrayers.map((prayer, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/prayfor/${prayer.id}`,
        name: prayer.title || "城市代禱",
      })),
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "代禱地點數",
        value: locations.size,
      },
      {
        "@type": "PropertyValue",
        name: "語音禱告數",
        value: audioCount,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function GlobalPrayerRoomPage() {
  const cards = await prisma.homePrayerCard.findMany({
    where: {
      isBlocked: false,
      locationCity: { not: null },
      locationLat: { not: null },
      locationLng: { not: null },
    },
    orderBy: [{ createdAt: "desc" }],
    take: 200,
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
  });

  const prayers = cards.map(toGlobalPrayerPayload);

  return (
    <>
      <SiteHeader activePath="/global-prayer-room" />
      <main>
        <GlobalPrayerRoomStructuredData prayers={prayers} />
        <GlobalPrayerRoomPageExperience prayers={prayers} />
      </main>
      <SiteFooter />
    </>
  );
}
