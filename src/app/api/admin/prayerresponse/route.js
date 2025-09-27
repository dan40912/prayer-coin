// ./src/app/api/admin/prayerresponse/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // all | active | blocked
    const sort = searchParams.get("sort") || "createdAt"; // createdAt | reportCount
    const order = searchParams.get("order") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { message: { contains: search, mode: "insensitive" } },
                { responder: { name: { contains: search, mode: "insensitive" } } },
                { responder: { email: { contains: search, mode: "insensitive" } } },
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

    const [responses, total] = await Promise.all([
      prisma.prayerResponse.findMany({
        where,
        include: {
          responder: { select: { id: true, name: true, email: true } },
          homeCard: { select: { id: true, title: true } },
        },
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.prayerResponse.count({ where }),
    ]);

    return NextResponse.json({
      data: responses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ GET /api/admin/prayerresponse error:", error);
    return NextResponse.json({ message: "無法取得留言" }, { status: 500 });
  }
}
