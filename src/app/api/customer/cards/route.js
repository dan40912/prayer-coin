import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readAuthSession } from "@/lib/auth-storage"; // 或者改用 JWT

export async function GET(req) {
  try {
    // 假設已經有登入系統，這裡應該能讀取 user id
    // 我先寫死 session 模擬，等你後續替換
    const userId = "mock-user-id"; 

    const cards = await prisma.homePrayerCard.findMany({
      where: {
        // 如果 HomePrayerCard 跟 User 關聯了，這裡過濾
        // ownerId: userId
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(cards);
  } catch (err) {
    console.error("❌ Failed to fetch cards:", err);
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
  }
}
