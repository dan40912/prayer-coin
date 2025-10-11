import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

const SESSION_HEADER = "x-admin-role";
const ALLOWED_ROLES = new Set(["SUPER", "ADMIN"]);
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function hasAccess(request) {
  const role = request.headers.get(SESSION_HEADER) ?? "";
  return ALLOWED_ROLES.has(role);
}

function clampPage(value) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

function clampLimit(value) {
  const parsed = Number.parseInt(value ?? `${DEFAULT_LIMIT}`, 10);
  if (Number.isNaN(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(request) {
  if (!hasAccess(request)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const { searchParams } = url;
  const page = clampPage(searchParams.get("page"));
  const limit = clampLimit(searchParams.get("limit"));
  const search = (searchParams.get("search") ?? "").trim();
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { id: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { walletBalance: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          walletBalance: true,
          createdAt: true,
          _count: { select: { prayerResponses: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const data = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      walletBalance: Number(user.walletBalance ?? 0),
      responsesCount: user._count?.prayerResponses ?? 0,
      createdAt: user.createdAt,
    }));

    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/token-balances error:", error);
    return NextResponse.json({ message: "Failed to load token balances" }, { status: 500 });
  }
}
