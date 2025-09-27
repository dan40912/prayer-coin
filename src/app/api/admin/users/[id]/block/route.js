// src/app/api/admin/users/[id]/block/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;

    // 取得當前用戶狀態
    const user = await prisma.user.findUnique({
      where: { id },
      select: { isBlocked: true }
    });

    if (!user) {
      return NextResponse.json({ message: "用戶不存在" }, { status: 404 });
    }

    // 切換封鎖狀態
    const updated = await prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked },
      select: { id: true, name: true, email: true, isBlocked: true }
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("❌ 切換封鎖狀態失敗:", err);
    return NextResponse.json(
      { message: "更新用戶狀態失敗", error: err.message },
      { status: 500 }
    );
  }
}
