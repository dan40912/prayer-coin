import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/server-session";

export async function GET() {
  try {
    const session = requireSessionUser();

    const cards = await prisma.homePrayerCard.findMany({
      where: { ownerId: session.id },
      orderBy: { updatedAt: "desc" },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { responses: true },
        },
      },
    });

    return NextResponse.json(cards);
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Please sign in." }, { status: 401 });
    }

    console.error("GET /api/customer/cards error:", error);
    return NextResponse.json(
      { message: "Failed to load prayer cards." },
      { status: 500 },
    );
  }
}
