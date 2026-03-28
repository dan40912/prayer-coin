import { NextResponse } from "next/server";

import { ensureActiveCustomer } from "@/lib/customer-access";
import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/server-session";
import { WITHDRAW_BLOCKING_STATUSES, WITHDRAW_CHAIN, WITHDRAW_MIN_AMOUNT } from "@/lib/withdrawals";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "object" && typeof value.toString === "function") {
    return Number(value.toString());
  }
  return Number(value);
}

function clampLimit(value) {
  const parsed = Number.parseInt(value ?? `${DEFAULT_LIMIT}`, 10);
  if (Number.isNaN(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(request) {
  try {
    const session = requireSessionUser();
    const user = await ensureActiveCustomer(session.userId);
    const { searchParams } = new URL(request.url);
    const limit = clampLimit(searchParams.get("limit"));

    const records = await prisma.tokenTransaction.findMany({
      where: {
        userId: user.id,
        type: "WITHDRAW",
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        amount: true,
        status: true,
        txHash: true,
        targetAddress: true,
        createdAt: true,
        updatedAt: true,
        metadata: true,
      },
    });

    return NextResponse.json({
      minAmount: WITHDRAW_MIN_AMOUNT,
      chain: WITHDRAW_CHAIN,
      records: records.map((item) => ({
        ...item,
        amount: toNumber(item.amount),
      })),
    });
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Please sign in." }, { status: 401 });
    }
    if (error?.code === "ACCOUNT_BLOCKED") {
      return NextResponse.json({ message: "Your account is blocked." }, { status: 403 });
    }

    console.error("GET /api/customer/withdrawals error", error);
    return NextResponse.json({ message: "Failed to load withdrawals." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = requireSessionUser();
    const activeUser = await ensureActiveCustomer(session.userId);

    const payload = await request.json().catch(() => null);
    const amount = Number(payload?.amount);

    if (!Number.isFinite(amount) || amount < WITHDRAW_MIN_AMOUNT) {
      return NextResponse.json(
        { message: `Withdraw amount must be at least ${WITHDRAW_MIN_AMOUNT}.` },
        { status: 422 },
      );
    }

    const [user, pendingOrder] = await Promise.all([
      prisma.user.findUnique({
        where: { id: activeUser.id },
        select: {
          id: true,
          walletBalance: true,
          bscAddress: true,
        },
      }),
      prisma.tokenTransaction.findFirst({
        where: {
          userId: activeUser.id,
          type: "WITHDRAW",
          status: { in: WITHDRAW_BLOCKING_STATUSES },
        },
        select: { id: true, status: true, createdAt: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const targetAddress = user.bscAddress?.trim();
    if (!targetAddress) {
      return NextResponse.json({ message: "Please set your BSC address before withdrawing." }, { status: 422 });
    }

    if (pendingOrder) {
      return NextResponse.json(
        { message: "You already have a pending withdrawal request." },
        { status: 409 },
      );
    }

    if (toNumber(user.walletBalance) < amount) {
      return NextResponse.json({ message: "Insufficient wallet balance." }, { status: 422 });
    }

    const created = await prisma.tokenTransaction.create({
      data: {
        userId: activeUser.id,
        type: "WITHDRAW",
        status: "PENDING",
        amount,
        targetAddress,
        metadata: {
          chain: WITHDRAW_CHAIN,
          requestSource: "customer_portal",
        },
      },
      select: {
        id: true,
        amount: true,
        status: true,
        targetAddress: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ...created,
        amount: toNumber(created.amount),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Please sign in." }, { status: 401 });
    }
    if (error?.code === "ACCOUNT_BLOCKED") {
      return NextResponse.json({ message: "Your account is blocked." }, { status: 403 });
    }

    console.error("POST /api/customer/withdrawals error", error);
    return NextResponse.json({ message: "Failed to create withdrawal request." }, { status: 500 });
  }
}
