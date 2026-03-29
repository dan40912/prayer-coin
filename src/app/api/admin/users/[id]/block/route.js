import { NextResponse } from "next/server";

import { readAdminSessionFromRequest } from "@/lib/admin-session";
import { logAdminAction, logSystemError } from "@/lib/logger";
import prisma from "@/lib/prisma";

const ADMIN_ROLES = new Set(["SUPER", "ADMIN"]);

export async function PATCH(request, { params }) {
  try {
    const session = readAdminSessionFromRequest(request);
    if (!session || !ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));

    const user = await prisma.user.findUnique({
      where: { id },
      select: { isBlocked: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const nextBlockedState = typeof body.block === "boolean" ? body.block : !user.isBlocked;

    const updated = await prisma.user.update({
      where: { id },
      data: { isBlocked: nextBlockedState },
      select: { id: true, name: true, email: true, isBlocked: true },
    });

    await logAdminAction({
      action: updated.isBlocked ? "user.block" : "user.unblock",
      message: `Updated user ${id} status to ${updated.isBlocked ? "Blocked" : "Active"}`,
      actorId: session.adminId,
      actorEmail: session.username,
      targetType: "User",
      targetId: id,
      requestPath: request.url,
      metadata: {
        previousState: user.isBlocked,
        nextState: updated.isBlocked,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    await logSystemError({
      message: `Failed to update user status: ${params?.id ?? ""}`,
      error: err,
      requestPath: request.url,
      metadata: { userId: params?.id },
    });

    return NextResponse.json(
      { message: "Failed to update user status", error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}

