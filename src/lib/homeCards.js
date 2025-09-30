// lib/homeCards.js
import prisma from "./prisma";

// 讀取所有卡片
export async function readHomeCards() {
  console.log("[homeCards] readHomeCards");
  return prisma.homePrayerCard.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true }
  });
}

// 讀取單一卡片
export async function readHomeCard(id) {
  console.log("[homeCards] readHomeCard", { id });
  return prisma.homePrayerCard.findUnique({
    where: { id: Number(id) },
    include: {
      category: true,
      owner: { select: { id: true, name: true, avatarUrl: true, bio: true } }
    }
  });
}

// 建立新卡片
export async function createHomeCard(payload = {}) {
  return prisma.homePrayerCard.create({
    data: {
      slug: payload.slug || crypto.randomUUID(),
      image: payload.image || "/legacy/img/sample1.jpg",
      alt: payload.alt || "",
      title: payload.title || "Untitled",
      description: payload.description || "",
      tags: payload.tags || [],
      meta: payload.meta || [],
      detailsHref: payload.detailsHref || "",
      voiceHref: payload.voiceHref || "",
      categoryId: Number(payload.categoryId),
    },
    include: { category: true }
  });
}

export async function readRelatedHomeCards(id, limit = 3) {
  console.log("[homeCards] readRelatedHomeCards", { id, limit });
  return prisma.homePrayerCard.findMany({
    where: { id: { not: Number(id) } },
    orderBy: { createdAt: "desc" },
    take: Math.max(0, Number(limit) || 0),
    include: { category: true }
  });
}

