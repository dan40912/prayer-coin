// app/api/home-cards/route.js
import { NextResponse } from "next/server";

import fallbackCards from "@/data/homeCards.json";
import { createHomeCard, readHomeCards } from "@/lib/homeCards";

function sanitizeCreatePayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid payload");
  }

  if (!body.title || typeof body.title !== "string") {
    throw new Error("Title is required");
  }

  if (!body.categoryId) {
    throw new Error("categoryId is required");
  }
    if (!body.ownerId) { 
    throw new Error("Owner ID is required");
  }

  return {
    title: body.title.trim(),
    slug: body.slug?.trim(),
    image: body.image?.trim(),
    alt: body.alt?.trim(),
    description: body.description?.trim(),
    tags: Array.isArray(body.tags) ? body.tags : [],
    meta: Array.isArray(body.meta) ? body.meta : [],
    detailsHref: body.detailsHref?.trim(),
    voiceHref: body.voiceHref?.trim(),
    categoryId: Number(body.categoryId),
    ownerId: body.ownerId, 
  };
}

function toLowerSafe(value) {
  return typeof value === "string" ? value.toLowerCase() : "";
}

function parseLimit(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return undefined;
  return Math.floor(numeric);
}

function filterFallbackCards(options = {}) {
  const {
    search,
    sort,
    limit,
    categoryId,
    categorySlug,
    skip,
  } = options;

  const limitValue = parseLimit(limit);
  const query = toLowerSafe(search?.trim?.());
  const slugFilter = categorySlug?.trim?.().toLowerCase?.() || null;
  const categoryIdFilter = categoryId != null ? String(categoryId).trim() : null;

  let results = Array.isArray(fallbackCards) ? [...fallbackCards] : [];

  if (slugFilter) {
    results = results.filter((card) => toLowerSafe(card?.category?.slug) === slugFilter);
  }

  if (categoryIdFilter) {
    results = results.filter((card) => {
      const cardCategoryId = card?.categoryId ?? card?.category?.id;
      return cardCategoryId != null && String(cardCategoryId) === categoryIdFilter;
    });
  }

  if (query) {
    results = results.filter((card) => {
      const haystack = [
        card?.title,
        card?.description,
        Array.isArray(card?.meta) ? card.meta.join(" ") : "",
        Array.isArray(card?.tags) ? card.tags.join(" ") : "",
        card?.category?.name,
      ]
        .map(toLowerSafe)
        .join(" ");

      return haystack.includes(query);
    });
  }

  if (sort === "responses") {
    results.sort((a, b) => {
      const aCount = a?._count?.responses ?? a?.responsesCount ?? 0;
      const bCount = b?._count?.responses ?? b?.responsesCount ?? 0;
      return bCount - aCount;
    });
  } else if (sort === "recent" || sort === "created") {
    results.sort((a, b) => {
      const aDate = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });
  }

  const skipValue = Number(skip);
  const start = Number.isFinite(skipValue) && skipValue > 0 ? Math.floor(skipValue) : 0;
  if (start > 0) {
    results = results.slice(start);
  }

  if (limitValue) {
    results = results.slice(0, limitValue);
  }

  return results;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const options = {};

  const sort = searchParams.get("sort");
  if (sort) {
    options.sort = sort;
  }

  const limit = searchParams.get("limit");
  if (limit) {
    options.limit = limit;
  }

  const skip = searchParams.get("skip");
  if (skip) {
    options.skip = Number(skip);
  }

  const categorySlug = searchParams.get("category");
  if (categorySlug && categorySlug !== "popular" && categorySlug !== "all") {
    options.categorySlug = categorySlug;
  }

  const categoryId = searchParams.get("categoryId");
  if (categoryId) {
    options.categoryId = categoryId;
  }

  const search = searchParams.get("search") || searchParams.get("q");
  if (search) {
    options.search = search;
  }

  if (!options.sort && categorySlug === "popular") {
    options.sort = "responses";
  }

  try {
    const cards = await readHomeCards(options);
    return NextResponse.json(cards, { status: 200 });
  } catch (error) {
    console.error("[GET /api/home-cards] database error", error);
    const fallback = filterFallbackCards(options);
    return NextResponse.json(fallback, {
      status: 200,
      headers: { "x-fallback-data": "static-home-cards" },
    });
  }
}

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const payload = sanitizeCreatePayload(body);
//     const created = await createHomeCard(payload);
//     return NextResponse.json(created, { status: 201 });
//   } catch (error) {
//     return NextResponse.json(
//       { message: error.message || "Failed to create card" },
//       { status: 400 }
//     );
//   }
// }
export async function POST(request) {
  try {
    const body = await request.json();
    
    // 💡 為了捕捉底層錯誤，暫時跳過 sanitizeCreatePayload
    //    我們直接使用 body 作為 payload
    const payload = body; 
    
    // 💥 讓錯誤在資料庫層拋出
    const created = await createHomeCard(payload); 
    
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    // ⚠️ 關鍵步驟：將錯誤輸出到伺服器終端機
    console.error("--- PRISMA CREATE CARD ERROR ---");
    console.error(error);
    console.error("------------------------------");
    
    // 返回泛用 400 錯誤
    return NextResponse.json(
      { message: error.message || "Failed to create card, check server console for full error details." },
      { status: 400 }
    );
  }
}
