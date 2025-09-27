import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  console.log("📥 /api/admin/users 收到請求:", request.method);

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("✅ 查到用戶數:", users.length);
    return NextResponse.json(users);
  } catch (err) {
    console.error("❌ /api/admin/users 發生錯誤:", err);
    return NextResponse.json(
      { message: "取得用戶失敗", error: err.message },
      { status: 500 }
    );
  }
}
