import { NextResponse } from "next/server";

import { ensureActiveCustomer } from "@/lib/customer-access";
import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/server-session";
import { processPendingResponseRewardsForUser } from "@/lib/tokenRewards";

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
    const user = await ensureActiveCustomer(session);

    await processPendingResponseRewardsForUser(user.id);

    const responses = await prisma.prayerResponse.findMany({
      where: {
        responderId: user.id,
        homeCardId: { not: null },
      },
      orderBy: { createdAt: "desc" },
      select: RESPONSE_SELECT,
    });

    const wallet = await prisma.user.findUnique({
      where: { id: user.id },
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
    if (error?.code === "ACCOUNT_BLOCKED") {
      return NextResponse.json({ message: "Your account is blocked." }, { status: 403 });
    }

    console.error("GET /api/customer/responses error:", error);
    return NextResponse.json(
      { message: "Failed to load responses." },
      { status: 500 },
    );
  }
}

