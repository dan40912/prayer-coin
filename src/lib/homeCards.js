import prisma from "./prisma";

const CARD_DEFAULT_INCLUDE = {
  category: true,
  _count: {
    select: {
      responses: true
    }
  }
};

function parseLimit(limit) {
  const value = Number(limit);
  if (!Number.isFinite(value) || value <= 0) {
    return undefined;
  }
  return Math.floor(value);
}

function buildWhereClause({ categorySlug, categoryId, search }) {
  const where = {
    isBlocked: false
  };
  const and = [];

  if (categoryId) {
    and.push({ categoryId: Number(categoryId) });
  } else if (categorySlug) {
    and.push({ category: { slug: categorySlug } });
  }

  const normalizedQuery = search?.trim();
  if (normalizedQuery) {
    and.push({
      OR: [
        { title: { contains: normalizedQuery, mode: "insensitive" } },
        { description: { contains: normalizedQuery, mode: "insensitive" } },
        { category: { name: { contains: normalizedQuery, mode: "insensitive" } } }
      ]
    });
  }

  if (and.length > 0) {
    where.AND = and;
  }

  return where;
}

function buildOrder(sort) {
  if (sort === "responses") {
    return [
      { responses: { _count: "desc" } },
      { createdAt: "desc" }
    ];
  }
  if (sort === "recent" || sort === "created") {
    return [{ createdAt: "desc" }];
  }
  if (sort === "updated") {
    return [{ updatedAt: "desc" }];
  }

  return [{ sortOrder: "asc" }, { createdAt: "desc" }];
}

export async function readHomeCards(options = {}) {
  const { sort = "recent", limit, skip, categorySlug, categoryId, search, include } = options;

  const orderBy = buildOrder(sort);
  const where = buildWhereClause({ categorySlug, categoryId, search });

  return prisma.homePrayerCard.findMany({
    where,
    include: include ?? CARD_DEFAULT_INCLUDE,
    orderBy,
    take: parseLimit(limit),
    skip: Number.isFinite(skip) && skip > 0 ? Math.floor(skip) : undefined
  });
}

export async function readHomeCard(id) {
  console.log("[homeCards] readHomeCard", { id });
  return prisma.homePrayerCard.findUnique({
    where: { id: Number(id) },
    include: {
      category: true,
      owner: { select: { id: true, name: true, avatarUrl: true, bio: true } },
      _count: { select: { responses: true } }
    }
  });
}

export async function createHomeCard(payload = {}) {

  const cardOwnerId = payload.ownerId; 

   if (!cardOwnerId || typeof cardOwnerId !== 'string') {
      // 根據您的 Prisma Schema，ownerId 是 String?，允許 NULL
      // 但您的 POST 路由強制要求它必須存在，所以這裡應該是防禦性檢查。
      // 建議: 如果您信任 sanitizeCreatePayload，這裡可以簡化。
      console.warn("Owner ID missing or invalid in payload for DB creation.");
      // 為了修復目前的 ReferenceError，我們將其設為 undefined/null 以匹配 Schema
      // 但實際上，它應該在 sanitizeCreatePayload 中就已經檢查過。
  }

  return prisma.homePrayerCard.create({
    data: {
      slug: payload.slug || crypto.randomUUID(),
      image: payload.image || "/img/personal.jpg",
      alt: payload.alt || "",
      title: payload.title || "Untitled",
      description: payload.description || "",
      tags: payload.tags || [],
      meta: payload.meta || [],
      detailsHref: payload.detailsHref || "",
      voiceHref: payload.voiceHref || "", // 確保這裡不再使用 TEMP_VOICE_URL
      categoryId: Number(payload.categoryId),
      
      // ✅ 修正：使用 payload.ownerId，或上面定義的 cardOwnerId 變數
      ownerId: cardOwnerId, 
    },
    include: CARD_DEFAULT_INCLUDE
  });
}

export async function readRelatedHomeCards(id, limit = 3) {
  console.log("[homeCards] readRelatedHomeCards", { id, limit });
  return prisma.homePrayerCard.findMany({
    where: { id: { not: Number(id) }, isBlocked: false },
    orderBy: [{ createdAt: "desc" }],
    take: Math.max(0, Number(limit) || 0),
    include: CARD_DEFAULT_INCLUDE
  });
}
