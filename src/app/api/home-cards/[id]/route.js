import { NextResponse } from "next/server";
import { updateHomeCard } from "@/lib/homeCards";

function sanitizeUpdatePayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid payload");
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.map((tag) => tag.trim()).filter(Boolean)
    : [];

  const meta = Array.isArray(body.meta)
    ? body.meta.map((line) => line.trim()).filter(Boolean)
    : [];

  return {
  
    slug: body.slug?.trim(),
    image: body.image?.trim() || "",
    alt: body.alt?.trim() || "",
    title: body.title?.trim() || "",
    description: body.description?.trim() || "",
    tags,
    meta,
    detailsHref: body.detailsHref?.trim(),
    voiceHref: payload.voiceHref?.trim() || "TEMP_VOICE_URL"
  };
}

export async function PUT(request, { params }) {
  try {
    const id = Number.parseInt(params.id, 10);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: "Invalid card id" }, { status: 400 });
    }

    const body = await request.json();
    const payload = sanitizeUpdatePayload(body);

    const updated = await updateHomeCard(id, payload);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update card" },
      { status: 400 }
    );
  }
}