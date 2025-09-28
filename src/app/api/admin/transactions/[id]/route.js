import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAdminAction, logSystemError } from "@/lib/logger";

const VALID_STATUS = new Set(["PENDING", "PROCESSING_CHAIN", "COMPLETED", "FAILED"]);

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "object") {
    if (typeof value.toNumber === "function") return value.toNumber();
    if (typeof value.valueOf === "function") {
      const nextValue = value.valueOf();
      if (typeof nextValue === "number") return nextValue;
      if (typeof nextValue === "string") return Number(nextValue);
    }
  }
  return Number(value);
}

export async function PATCH(request, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: "Missing transaction id" }, { status: 400 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
  }

  const nextStatus = payload.status;
  const txHash = payload.txHash?.trim();

  if (!nextStatus || !VALID_STATUS.has(nextStatus)) {
    return NextResponse.json({ message: "Unsupported status" }, { status: 400 });
  }

  try {
    const existing = await prisma.tokenTransaction.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    if (
      (existing.status === "COMPLETED" || existing.status === "FAILED") &&
      existing.status !== nextStatus
    ) {
      return NextResponse.json(
        { message: "Completed or failed transaction cannot be updated" },
        { status: 400 }
      );
    }

    if (existing.status === nextStatus && (!txHash || txHash === existing.txHash)) {
      return NextResponse.json(existing);
    }

    const updateData = {
      status: nextStatus,
      updatedAt: new Date(),
    };

    if (txHash) {
      updateData.txHash = txHash;
    }

    if (existing.type === "WITHDRAW" && nextStatus === "FAILED" && existing.status !== "FAILED") {
      await prisma.$transaction(async (tx) => {
        await tx.tokenTransaction.update({
          where: { id },
          data: updateData,
        });

        await tx.user.update({
          where: { id: existing.userId },
          data: {
            walletBalance: {
              increment: existing.amount,
            },
          },
        });
      });
    } else {
      await prisma.tokenTransaction.update({
        where: { id },
        data: updateData,
      });
    }

    await logAdminAction({
      action: "transaction.update",
      message: `Updated transaction ${id} status to ${nextStatus}`,
      targetType: "TokenTransaction",
      targetId: id,
      requestPath: request.url,
      metadata: {
        previousStatus: existing.status,
        nextStatus,
        txHash: txHash ?? null,
        type: existing.type,
        userId: existing.userId,
      },
    });

    const refreshed = await prisma.tokenTransaction.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        relatedHomeCard: {
          select: { id: true, title: true, slug: true },
        },
        relatedResponse: {
          select: { id: true, message: true, homeCardId: true },
        },
      },
    });

    return NextResponse.json({
      ...refreshed,
      amount: toNumber(refreshed.amount),
      gasFee: refreshed.gasFee !== null ? toNumber(refreshed.gasFee) : null,
    });
  } catch (error) {
    await logSystemError({
      message: `Failed to update transaction ${id}`,
      error,
      requestPath: request.url,
      metadata: { id, body: payload },
    });

    console.error("❌ PATCH /api/admin/transactions/[id] error:", error);
    return NextResponse.json({ message: "Failed to update transaction" }, { status: 500 });
  }
}
