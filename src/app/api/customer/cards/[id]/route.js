import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/server-session";

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeMeta(value) {
  if (Array.isArray(value)) {
    return value.map((line) => String(line).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

function sanitizeUpdatePayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Please provide the fields to update.");
  }

  const title = body.title?.trim();
  const description = body.description?.trim();
  const image = body.image?.trim();
  const alt = body.alt?.trim();
  const slug = body.slug?.trim();
  const detailsHref = body.detailsHref?.trim();
  const voiceHref = body.voiceHref?.trim();

  const rawCategoryId = body.categoryId ?? body.category?.id;
  const categoryId = rawCategoryId != null ? Number(rawCategoryId) : null;

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!categoryId) {
    throw new Error("Category is required.");
  }

  return {
    title,
    description: description ?? "",
    image: image ?? "",
    alt: alt ?? "",
    slug: slug ?? null,
    detailsHref: detailsHref ?? null,
    voiceHref: voiceHref ?? null,
    tags: normalizeTags(body.tags),
    meta: normalizeMeta(body.meta),
    categoryId,
  };
}

async function getOwnedCard(cardId, userId) {
  const card = await prisma.homePrayerCard.findUnique({
    where: { id: cardId },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { responses: true } },
    },
  });

  if (!card) {
    return {
      response: NextResponse.json({ message: "Prayer card not found." }, { status: 404 }),
    };
  }

  if (card.ownerId !== userId) {
    return {
      response: NextResponse.json({ message: "You do not have permission to manage this prayer card." }, { status: 403 }),
    };
  }

  return { card };
}

export async function GET(request, { params }) {
  const cardId = Number.parseInt(params?.id ?? "", 10);
  if (!Number.isFinite(cardId)) {
    return NextResponse.json({ message: "Invalid prayer card id." }, { status: 400 });
  }

  try {
    const session = requireSessionUser();
    const { response, card } = await getOwnedCard(cardId, session.id);
    if (response) return response;

    return NextResponse.json(card);
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Please sign in." }, { status: 401 });
    }

    console.error("GET /api/customer/cards/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to load prayer card." },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  const cardId = Number.parseInt(params?.id ?? "", 10);
  if (!Number.isFinite(cardId)) {
    return NextResponse.json({ message: "Invalid prayer card id." }, { status: 400 });
  }

  try {
    const session = requireSessionUser();
    const payload = await request.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ message: "Please provide the fields to update." }, { status: 400 });
    }

    const { response } = await getOwnedCard(cardId, session.id);
    if (response) return response;

    const data = {};
    if (Object.prototype.hasOwnProperty.call(payload, "isBlocked")) {
      data.isBlocked = Boolean(payload.isBlocked);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: "Only visibility can be updated via PATCH." }, { status: 400 });
    }

    const updated = await prisma.homePrayerCard.update({
      where: { id: cardId },
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { responses: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Please sign in." }, { status: 401 });
    }

    console.error("PATCH /api/customer/cards/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update prayer card." },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  const cardId = Number.parseInt(params?.id ?? "", 10);
  if (!Number.isFinite(cardId)) {
    return NextResponse.json({ message: "Invalid prayer card id." }, { status: 400 });
  }

  try {
    const session = requireSessionUser();
    const body = await request.json().catch(() => null);
    const updates = sanitizeUpdatePayload(body);

    const { response } = await getOwnedCard(cardId, session.id);
    if (response) return response;

    const updated = await prisma.homePrayerCard.update({
      where: { id: cardId },
      data: {
        title: updates.title,
        description: updates.description,
        image: updates.image,
        alt: updates.alt,
        slug: updates.slug,
        detailsHref: updates.detailsHref,
        voiceHref: updates.voiceHref,
        tags: updates.tags,
        meta: updates.meta,
        categoryId: updates.categoryId,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { responses: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Please sign in." }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Failed to update prayer card.";
    const status = /required|invalid|provide|title|category/i.test(message) ? 400 : 500;

    console.error("PUT /api/customer/cards/[id] error:", error);
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(request, { params }) {
  const cardId = Number.parseInt(params?.id ?? "", 10);
  if (!Number.isFinite(cardId)) {
    return NextResponse.json({ message: "Invalid prayer card id." }, { status: 400 });
  }

  try {
    const session = requireSessionUser();
    const { response } = await getOwnedCard(cardId, session.id);
    if (response) return response;

    await prisma.homePrayerCard.delete({ where: { id: cardId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Please sign in." }, { status: 401 });
    }

    console.error("DELETE /api/customer/cards/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete prayer card." },
      { status: 500 },
    );
  }
}
