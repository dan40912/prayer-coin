﻿// ./src/app/api/admin/prayfor/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAdminAction, logSystemError } from "@/lib/logger";

// 取得禱告卡片列表，支援搜尋、狀態篩選與排序
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // all | active | blocked
    const sort = searchParams.get("sort") || "createdAt"; // createdAt | reportCount
    const order = searchParams.get("order") || "desc"; // asc | desc
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        status === "blocked"
          ? { isBlocked: true }
          : status === "active"
          ? { isBlocked: false }
          : {},
      ],
    };

    const [cards, total] = await Promise.all([
      prisma.homePrayerCard.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.homePrayerCard.count({ where }),
    ]);

    return NextResponse.json({
      data: cards,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    await logSystemError({
      message: "取得禱告項目列表失敗",
      error,
      requestPath: request.url,
      metadata: {
        query: Object.fromEntries(new URL(request.url).searchParams.entries()),
      },
    });

    console.error("❌ GET /api/admin/prayfor error:", error);
    return NextResponse.json({ message: "無法取得禱告項目列表" }, { status: 500 });
  }
}

// 更新禱告項目狀態
export async function PATCH(request) {
  try {
    const { id, block } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "缺少 ID" }, { status: 400 });
    }

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
  } catch (error) {
    await logSystemError({
      message: "更新禱告項目狀態失敗",
      error,
      requestPath: request.url,
    });

    console.error("❌ PATCH /api/admin/prayfor error:", error);
    return NextResponse.json({ message: "更新禱告項目狀態失敗" }, { status: 500 });
  }
}
