// app/api/home-cards/route.js
import { NextResponse } from "next/server";
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
    categoryId: Number(body.categoryId)
  };
}

export async function GET() {
  const cards = await readHomeCards();
  return NextResponse.json(cards, { status: 200 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const payload = sanitizeCreatePayload(body);
    const created = await createHomeCard(payload);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to create card" },
      { status: 400 }
    );
  }
}