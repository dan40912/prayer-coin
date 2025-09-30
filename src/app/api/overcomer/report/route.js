import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/server-session";

const VALID_REASONS = new Set([
  "spam_promotion",
  "hate_speech_harassment",
  "sexual_explicit",
  "violence_threat",
  "false_info",
  "privacy_violation",
  "other",
]);

export async function POST(request) {
  try {
    const session = requireSessionUser();

    const payload = await request.json().catch(() => null);
    const reason = payload?.reason;
    const remarks = payload?.remarks ?? "";
    const targetUserId = payload?.targetUserId ? String(payload.targetUserId) : null;
    const targetUsername = payload?.targetUsername ? String(payload.targetUsername) : null;

    if (!VALID_REASONS.has(reason)) {
      return NextResponse.json({ message: "檢舉原因不正確。" }, { status: 400 });
    }

    if (!targetUserId && !targetUsername) {
      return NextResponse.json({ message: "缺少被檢舉使用者資訊。" }, { status: 400 });
    }

    const metadata = {
      reason,
      remarks,
      targetUserId,
      targetUsername,
    };

    await prisma.$transaction(async (tx) => {
      await tx.adminLog.create({
        data: {
          category: "ACTION",
          level: "WARNING",
          message: `使用者檢舉 ${targetUsername || targetUserId || "未知使用者"}`,
          action: "overcomer/report",
          actorId: session.id ?? null,
          actorEmail: session.email ?? null,
          targetType: "user",
          targetId: targetUserId,
          requestPath: "/api/overcomer/report",
          metadata,
        },
      });

      if (targetUserId) {
        try {
          await tx.user.update({
            where: { id: targetUserId },
            data: { reportCount: { increment: 1 } },
          });
        } catch (err) {
          console.warn("[overcomer] report user update skipped", err?.message);
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "請先登入後再檢舉。" }, { status: 401 });
    }

    console.error("POST /api/overcomer/report error", error);
    return NextResponse.json({ message: "檢舉失敗，請稍後再試。" }, { status: 500 });
  }
}
