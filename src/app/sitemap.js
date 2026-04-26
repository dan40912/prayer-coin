import prisma from "@/lib/prisma";
import { buildOvercomerSlug } from "@/lib/overcomer";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

function route(path, lastModified = new Date(), priority = 0.7, changeFrequency = "weekly") {
  return {
    url: new URL(path, SITE_URL).toString(),
    lastModified,
    changeFrequency,
    priority,
  };
}

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    route("/", now, 1, "daily"),
    route("/prayfor", now, 0.95, "daily"),
    route("/overcomer", now, 0.85, "daily"),
    route("/about", now, 0.65, "monthly"),
    route("/howto", now, 0.65, "monthly"),
    route("/whitepaper", now, 0.45, "monthly"),
    route("/disclaimer", now, 0.35, "yearly"),
  ];

  const [cards, users] = await Promise.all([
    prisma.homePrayerCard.findMany({
      where: { isBlocked: false },
      orderBy: { updatedAt: "desc" },
      take: 5000,
      select: {
        id: true,
        updatedAt: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      where: {
        publicProfileEnabled: true,
        username: { not: null },
      },
      orderBy: { updatedAt: "desc" },
      take: 5000,
      select: {
        username: true,
        updatedAt: true,
        createdAt: true,
      },
    }),
  ]);

  const cardRoutes = cards.map((card) =>
    route(`/prayfor/${card.id}`, card.updatedAt || card.createdAt || now, 0.8, "weekly")
  );

  const overcomerRoutes = users
    .map((user) => {
      const slug = buildOvercomerSlug(user);
      if (!slug) return null;
      return route(`/overcomer/${encodeURIComponent(slug)}`, user.updatedAt || user.createdAt || now, 0.75, "weekly");
    })
    .filter(Boolean);

  return [...staticRoutes, ...cardRoutes, ...overcomerRoutes];
}
