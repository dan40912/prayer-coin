import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
      const filename = `${Date.now()}-${audio.name}`;
      const filePath = path.join(process.cwd(), "public", "voices", filename);

      // ✅ 確保目錄存在
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, bytes);

      voiceUrl = `/voices/${filename}`; // 存在 DB 的 URL
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
          responder: true, // 放在這裡才會正確 join 出來
        },
      });

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("❌ Failed to create response:", err);
    return NextResponse.json({ error: "Failed to create response" }, { status: 500 });
  }
}