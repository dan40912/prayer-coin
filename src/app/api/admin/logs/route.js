import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const CATEGORY_MAP = {
  system: "SYSTEM",
  action: "ACTION",
};

const LEVEL_SET = new Set(["INFO", "WARNING", "ERROR", "CRITICAL"]);
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function clampPage(value) {
  const numeric = Number.parseInt(value, 10);
  return Number.isNaN(numeric) || numeric < 1 ? 1 : numeric;
}

function clampLimit(value) {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric) || numeric < 1) {
    return DEFAULT_LIMIT;
  }
  return Math.min(numeric, MAX_LIMIT);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category")?.toLowerCase() ?? "all";
    const levelParam = searchParams.get("level")?.toUpperCase();
    const search = searchParams.get("search")?.trim() ?? "";
    const page = clampPage(searchParams.get("page") ?? "1");
    const limit = clampLimit(searchParams.get("limit") ?? String(DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    const whereFilters = [];
    const categoryValue = CATEGORY_MAP[categoryParam];
    if (categoryValue) {
      whereFilters.push({ category: categoryValue });
    }

    if (levelParam && LEVEL_SET.has(levelParam)) {
      whereFilters.push({ level: levelParam });
    }

    if (search) {
      whereFilters.push({
        OR: [
          { message: { contains: search, mode: "insensitive" } },
          { action: { contains: search, mode: "insensitive" } },
          { actorEmail: { contains: search, mode: "insensitive" } },
          { actorId: { contains: search, mode: "insensitive" } },
          { targetType: { contains: search, mode: "insensitive" } },
          { targetId: { contains: search, mode: "insensitive" } },
          { requestPath: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const where = whereFilters.length ? { AND: whereFilters } : {};

    const [entries, total, categoryCounts] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.adminLog.count({ where }),
      prisma.adminLog.groupBy({
        by: ["category"],
        _count: { _all: true },
      }),
    ]);

    const summary = categoryCounts.reduce(
      (acc, item) => {
        acc[item.category.toLowerCase()] = item._count._all;
        acc.total += item._count._all;
        return acc;
      },
      { total: 0 }
    );

    return NextResponse.json({
      data: entries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
      summary,
    });
  } catch (error) {
    console.error("❌ GET /api/admin/logs error:", error);
    return NextResponse.json({ message: "無法取得系統紀錄" }, { status: 500 });
  }
}
