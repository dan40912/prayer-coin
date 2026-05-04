import { GlobalPrayerRoomPageExperience } from "@/components/GlobalPrayerRoom";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import prisma from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

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

export const metadata = buildPageMetadata({
  title: "全球禱告室",
  description: "在真實地球上看見各城市正在被守望的代禱。",
  path: "/global-prayer-room",
});

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
      createdAt: true,
      locationCity: true,
      locationCountry: true,
      locationLat: true,
      locationLng: true,
      category: { select: { name: true, slug: true } },
      owner: { select: { name: true, username: true } },
      _count: { select: { responses: true } },
    },
  });

  const prayers = cards.map(toGlobalPrayerPayload);

  return (
    <>
      <SiteHeader activePath="/global-prayer-room" />
      <main>
        <GlobalPrayerRoomPageExperience prayers={prayers} />
      </main>
      <SiteFooter />
    </>
  );
}