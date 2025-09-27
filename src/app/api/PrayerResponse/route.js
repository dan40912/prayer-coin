import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { requestId, message, voiceUrl, isAnonymous, responderId } = body;

    if (!requestId || !message) {
      return NextResponse.json({ error: "缺少必要欄位" }, { status: 400 });
    }

    const newResponse = await prisma.prayerResponse.create({
      data: {
        requestId,
        message,
        voiceUrl: voiceUrl || null,
        isAnonymous: Boolean(isAnonymous),
        responderId: responderId || null
      }
    });

    return NextResponse.json(newResponse, { status: 201 });
  } catch (error) {
    console.error("建立 PrayerResponse 失敗:", error);
    return NextResponse.json({ error: "建立失敗" }, { status: 500 });
  }
}
