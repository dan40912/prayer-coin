import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { processPendingResponseRewardsForUser } from "@/lib/tokenRewards";
import { requireSessionUser } from "@/lib/server-session";

const RESPONSE_SELECT = {
  id: true,
  message: true,
  voiceUrl: true,
  isBlocked: true,
  reportCount: true,
  rewardStatus: true,
  rewardEligibleAt: true,
  rewardEvaluatedAt: true,
  tokensAwarded: true,
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

    await processPendingResponseRewardsForUser(session.id);

    const responses = await prisma.prayerResponse.findMany({
      where: {
        responderId: session.id,
        homeCardId: { not: null },
      },
      orderBy: { createdAt: "desc" },
      select: RESPONSE_SELECT,
    });

    const wallet = await prisma.user.findUnique({
      where: { id: session.id },
      select: { walletBalance: true },
    });

    return NextResponse.json({
      responses,
      walletBalance: Number(wallet?.walletBalance ?? 0),
    });
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
