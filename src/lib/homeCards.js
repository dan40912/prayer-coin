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
    const makeContainsFilter = () => ({ contains: normalizedQuery });
    and.push({
      OR: [
        { title: makeContainsFilter() },
        { description: makeContainsFilter() },
        { category: { name: makeContainsFilter() } }
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
      // ?寞??函? Prisma Schema嚗wnerId ??String?嚗?閮?NULL
      // 雿??POST 頝舐撘瑕閬?摰????剁??隞仿ㄐ?府?舫蝳行扳炎?乓?
      // 撱箄降: 憒??其縑隞?sanitizeCreatePayload嚗ㄐ?臭誑蝪∪???
      console.warn("Owner ID missing or invalid in payload for DB creation.");
      // ?箔?靽桀儔?桀???ReferenceError嚗????嗉身??undefined/null 隞亙??Schema
      // 雿祕??嚗??府??sanitizeCreatePayload 銝剖停撌脩?瑼Ｘ??
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
      voiceHref: payload.voiceHref || "", // 蝣箔??ㄐ銝?雿輻 TEMP_VOICE_URL
      categoryId: Number(payload.categoryId),
      
      // ??靽格迤嚗蝙??payload.ownerId嚗?銝摰儔??cardOwnerId 霈
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


