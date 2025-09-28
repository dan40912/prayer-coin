// /src/app/api/admin/prayfor/[id]/block/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAdminAction, logSystemError } from "@/lib/logger";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { block } = await request.json();

    const numericId = Number(id);
    const updated = await prisma.homePrayerCard.update({
      where: { id: numericId },
      data: { isBlocked: block },
    });

    await logAdminAction({
      action: block ? "prayer.block" : "prayer.unblock",
      message: `更新禱告項目 ${numericId} 狀態為 ${block ? "Blocked" : "Active"}`,
      targetType: "HomePrayerCard",
      targetId: String(numericId),
      requestPath: request.url,
      metadata: { block },
    });

    return NextResponse.json(updated);
  } catch (err) {
    await logSystemError({
      message: `更新禱告項目 ${params?.id ?? ""} 狀態失敗`,
      error: err,
      requestPath: request.url,
    });

    console.error("❌ 更新/解除禱告封鎖失敗:", err);
    return NextResponse.json({ message: "操作失敗" }, { status: 500 });
  }
}
