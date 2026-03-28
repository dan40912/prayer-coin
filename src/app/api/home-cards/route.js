import { NextResponse } from "next/server";

import fallbackCards from "@/data/homeCards.json";
import { ensureActiveCustomer } from "@/lib/customer-access";
import { createHomeCard, readHomeCards } from "@/lib/homeCards";
import { requireSessionUser } from "@/lib/server-session";

const GALLERY_PREFIX = "gallery::";
const UPLOADS_PREFIX = "/uploads/";

function isInternalUploadUrl(value) {
  return typeof value === "string" && value.startsWith(UPLOADS_PREFIX);
}

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

  const image = typeof body.image === "string" ? body.image.trim() : "";
  if (!image || !isInternalUploadUrl(image)) {
    throw new Error("Image must be uploaded from this site");
  }

  const normalizedMeta = Array.isArray(body.meta)
    ? body.meta
        .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
        .filter(Boolean)
        .map((entry) => {
          if (!entry.startsWith(GALLERY_PREFIX)) return entry;
          const url = entry.slice(GALLERY_PREFIX.length).trim();
          if (!isInternalUploadUrl(url)) {
            throw new Error("Gallery images must use uploaded files");
          }
          return `${GALLERY_PREFIX}${url}`;
        })
    : [];

  return {
    title: body.title.trim(),
    slug: body.slug?.trim(),
    image,
    alt: body.alt?.trim(),
    description: body.description?.trim(),
    tags: Array.isArray(body.tags) ? body.tags : [],
    meta: normalizedMeta,
    detailsHref: body.detailsHref?.trim(),
    voiceHref: body.voiceHref?.trim(),
    categoryId: Number(body.categoryId),
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
  const { search, sort, limit, categoryId, categorySlug, skip } = options;

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
      const haystack = [card?.title, card?.description, Array.isArray(card?.meta) ? card.meta.join(" ") : "", Array.isArray(card?.tags) ? card.tags.join(" ") : "", card?.category?.name]
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
  if (sort) options.sort = sort;

  const limit = searchParams.get("limit");
  if (limit) options.limit = limit;

  const skip = searchParams.get("skip");
  if (skip) options.skip = Number(skip);

  const categorySlug = searchParams.get("category");
  if (categorySlug && categorySlug !== "popular" && categorySlug !== "all") {
    options.categorySlug = categorySlug;
  }

  const categoryId = searchParams.get("categoryId");
  if (categoryId) options.categoryId = categoryId;

  const search = searchParams.get("search") || searchParams.get("q");
  if (search) options.search = search;

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

export async function POST(request) {
  try {
    const session = requireSessionUser();
    const user = await ensureActiveCustomer(session.userId);
    const body = await request.json();
    const payload = sanitizeCreatePayload(body);
    const created = await createHomeCard({
      ...payload,
      ownerId: user.id,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Please sign in." }, { status: 401 });
    }
    if (error?.code === "ACCOUNT_BLOCKED") {
      return NextResponse.json({ message: "Your account is blocked." }, { status: 403 });
    }

    console.error("--- CREATE CARD ERROR ---");
    console.error(error);
    console.error("-------------------------");
    return NextResponse.json(
      { message: error.message || "Failed to create card" },
      { status: 400 },
    );
  }
}
