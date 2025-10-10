import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function resolveVoiceFolder(requestId) {
  const normalized = typeof requestId === "string" ? requestId.trim() : "";
  return /^\d+$/.test(normalized) ? normalized : "misc";
}

function sanitizeFileName(input) {
  const base = path.basename(input ?? "").replace(/[^\w.-]+/g, "-");
  return base || "voice.webm";
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const requestId = form.get("requestId");
    const message = form.get("message");
    const isAnonymous = form.get("isAnonymous") === "true";
    const responderId = form.get("responderId") || null;

    let voiceUrl = null;
    const audio = form.get("audio");

    if (audio && audio.name) {
      const bytes = Buffer.from(await audio.arrayBuffer());
      const folderName = resolveVoiceFolder(requestId);
      const sanitizedOriginal = sanitizeFileName(audio.name);
      const filename = `${Date.now()}-${sanitizedOriginal}`;
      const folderPath = path.join(process.cwd(), "public", "voices", folderName);
      const filePath = path.join(folderPath, filename);

      // Ensure the destination folder exists
      fs.mkdirSync(folderPath, { recursive: true });
      fs.writeFileSync(filePath, bytes);

      voiceUrl = `/voices/${folderName}/${filename}`; // URL stored in the database
    }

    const response = await prisma.prayerResponse.create({
      data: {
        message,
        voiceUrl,
        isAnonymous,
        responderId: isAnonymous ? null : responderId,
        homeCardId: Number(requestId),
      },
      include: {
        responder: true, // include responder for immediate list refresh
      },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("Failed to create response:", err);
    return NextResponse.json({ error: "Failed to create response" }, { status: 500 });
  }
}
