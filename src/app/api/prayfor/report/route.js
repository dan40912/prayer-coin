import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/server-session";
import { REPORT_REASON_SET } from "@/constants/reportReasons";

function normalizeRemarks(value) {
  if (!value) return "";
  return String(value).trim().slice(0, 600);
}

export async function POST(request) {
  try {
    const session = requireSessionUser();

    const payload = await request.json().catch(() => null);
    const cardIdRaw = payload?.cardId;
    const reasonRaw = payload?.reason;
    const remarksRaw = payload?.remarks;

    const cardId = Number(cardIdRaw);
    const reason = typeof reasonRaw === "string" ? reasonRaw : "";
    const remarks = normalizeRemarks(remarksRaw);

    if (!Number.isInteger(cardId) || cardId <= 0) {
      return NextResponse.json({ message: "缺少正確的禱告事項資訊" }, { status: 400 });
    }

    if (!REPORT_REASON_SET.has(reason)) {
      return NextResponse.json({ message: "檢舉原因不正確" }, { status: 400 });
    }

    const card = await prisma.homePrayerCard.findUnique({
      where: { id: cardId },
      select: { id: true, reportCount: true, title: true },
    });

    if (!card) {
      return NextResponse.json({ message: "找不到這則禱告事項" }, { status: 404 });
    }

    const reporterId = session.id;

    await prisma.$transaction(async (tx) => {
      const existing = await tx.homePrayerCardReport.findUnique({
        where: {
          cardId_reporterId: {
            cardId,
            reporterId,
          },
        },
      });

      if (existing) {
        await tx.homePrayerCardReport.update({
          where: { id: existing.id },
          data: {
            reason,
            remarks: remarks || null,
          },
        });
      } else {
        await tx.homePrayerCardReport.create({
          data: {
            cardId,
            reporterId,
            reason,
            remarks: remarks || null,
          },
        });

        await tx.homePrayerCard.update({
          where: { id: cardId },
          data: { reportCount: { increment: 1 } },
        });
      }

      await tx.adminLog.create({
        data: {
          category: "ACTION",
          level: "WARNING",
          message: `使用者檢舉禱告事項 ${cardId}`,
          action: "prayfor/report",
          actorId: reporterId,
          actorEmail: session.email ?? null,
          targetType: "home_prayer_card",
          targetId: String(cardId),
          requestPath: "/api/prayfor/report",
          metadata: {
            reason,
            remarks,
            cardTitle: card.title ?? null,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "請先登入後再檢舉" }, { status: 401 });
    }

    console.error("POST /api/prayfor/report error", error);
    return NextResponse.json({ message: "檢舉失敗，請稍後再試" }, { status: 500 });
  }
}
