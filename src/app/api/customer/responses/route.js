import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/server-session";

const RESPONSE_SELECT = {
  id: true,
  message: true,
  voiceUrl: true,
  isBlocked: true,
  reportCount: true,
  createdAt: true,
  homeCard: {
    select: {
      id: true,
      title: true,
      image: true,
      alt: true,
      slug: true,
      detailsHref: true,
    },
  },
};

export async function GET() {
  try {
    const session = requireSessionUser();

    const responses = await prisma.prayerResponse.findMany({
      where: {
        responderId: session.id,
        homeCardId: { not: null },
      },
      orderBy: { createdAt: "desc" },
      select: RESPONSE_SELECT,
    });

    return NextResponse.json(responses);
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Please sign in." }, { status: 401 });
    }

    console.error("GET /api/customer/responses error:", error);
    return NextResponse.json(
      { message: "Failed to load responses." },
      { status: 500 },
    );
  }
}

