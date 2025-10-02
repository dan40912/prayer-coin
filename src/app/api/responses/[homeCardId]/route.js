import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { homeCardId } = params;

  try {
    const responses = await prisma.prayerResponse.findMany({
      where: { homeCardId: Number(homeCardId),isBlocked: false, },
      orderBy: { createdAt: "desc" },
      include: { responder: true }, // 把使用者帶出來 (如果不是匿名)
    });
    return NextResponse.json(responses, { status: 200 });
  } catch (err) {
    console.error("❌ Failed to fetch responses:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}