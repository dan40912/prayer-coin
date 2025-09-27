// ./src/app/api/admin/prayfor/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 取得禱告事項列表（含搜尋、分頁、排序、篩選）
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
    console.error("❌ GET /api/admin/prayfor error:", error);
    return NextResponse.json({ message: "無法取得禱告事項" }, { status: 500 });
  }
}

// 更新封鎖狀態
export async function PATCH(request) {
  try {
    const { id, block } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "缺少 ID" }, { status: 400 });
    }

    const updated = await prisma.homePrayerCard.update({
      where: { id: Number(id) }, // ⚠️ homePrayerCard.id 是 Int
      data: { isBlocked: block },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("❌ PATCH /api/admin/prayfor error:", error);
    return NextResponse.json({ message: "更新失敗" }, { status: 500 });
  }
}
