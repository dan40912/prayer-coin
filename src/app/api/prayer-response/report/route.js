﻿import { NextResponse } from "next/server";

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
    const responseId = payload?.responseId ? String(payload.responseId) : "";
    const reason = payload?.reason ? String(payload.reason) : "";
    const remarks = normalizeRemarks(payload?.remarks ?? "");

    if (!responseId) {
      return NextResponse.json({ message: "缺少檢舉目標" }, { status: 400 });
    }

    if (!REPORT_REASON_SET.has(reason)) {
      return NextResponse.json({ message: "檢舉原因不正確" }, { status: 400 });
    }

    const response = await prisma.prayerResponse.findUnique({
      where: { id: responseId },
      select: { id: true, reportCount: true, homeCardId: true, homeCard: { select: { ownerId: true } } },
    });

    if (!response) {
      return NextResponse.json({ message: "找不到禱告回應" }, { status: 404 });
    }

    const reporterId = session.id;
    const shouldBlock = Boolean(response.homeCard?.ownerId) && response.homeCard.ownerId === reporterId;

    await prisma.$transaction(async (tx) => {
      const existing = await tx.prayerResponseReport.findUnique({
        where: {
          responseId_reporterId: {
            responseId,
            reporterId,
          },
        },
      });

      if (existing) {
        await tx.prayerResponseReport.update({
          where: { id: existing.id },
          data: {
            reason,
            remarks: remarks || null,
          },
        });

        if (shouldBlock) {
          await tx.prayerResponse.update({
            where: { id: responseId },
            data: { isBlocked: true },
          });
        }
      } else {
        await tx.prayerResponseReport.create({
          data: {
            responseId,
            reporterId,
            reason,
            remarks: remarks || null,
          },
        });

        await tx.prayerResponse.update({
          where: { id: responseId },
          data: {
            reportCount: { increment: 1 },
            ...(shouldBlock ? { isBlocked: true } : {}),
          },
        });
      }

      await tx.adminLog.create({
        data: {
          category: "ACTION",
          level: "WARNING",
          message: `使用者檢舉禱告回應 ${responseId}`,
          action: "prayer-response/report",
          actorId: reporterId,
          actorEmail: session.email ?? null,
          targetType: "prayer_response",
          targetId: responseId,
          requestPath: "/api/prayer-response/report",
          metadata: {
            reason,
            remarks,
            homeCardId: response.homeCardId ?? null,
            autoBlocked: shouldBlock,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "請先登入後再檢舉" }, { status: 401 });
    }

    console.error("POST /api/prayer-response/report error", error);
    return NextResponse.json({ message: "檢舉失敗，請稍後再試" }, { status: 500 });
  }
}
