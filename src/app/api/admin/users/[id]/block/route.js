// src/app/api/admin/users/[id]/block/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAdminAction, logSystemError } from "@/lib/logger";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const actorId = request.headers.get("x-admin-id") || null;
    const actorEmail = request.headers.get("x-admin-email") || null;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { isBlocked: true }
    });

    if (!user) {
      return NextResponse.json({ message: "使用者不存在" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked },
      select: { id: true, name: true, email: true, isBlocked: true }
    });

    const toggledState = updated.isBlocked;

    await logAdminAction({
      action: toggledState ? "user.block" : "user.unblock",
      message: `調整用戶 ${id} 狀態為 ${toggledState ? "Blocked" : "Active"}`,
      actorId,
      actorEmail,
      targetType: "User",
      targetId: id,
      requestPath: request.url,
      metadata: {
        previousState: user.isBlocked,
        nextState: toggledState,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    await logSystemError({
      message: `切換用戶 ${params?.id ?? ""} 狀態失敗`,
      error: err,
      requestPath: request.url,
      metadata: { userId: params?.id }
    });

    console.error("❌ 切換使用者狀態失敗:", err);
    return NextResponse.json(
      { message: "更新使用者狀態失敗", error: err.message },
      { status: 500 }
    );
  }
}
