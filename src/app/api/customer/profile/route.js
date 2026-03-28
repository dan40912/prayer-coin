import { NextResponse } from "next/server";

import { ensureActiveCustomer } from "@/lib/customer-access";
import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/server-session";

const MAX_BIO_LENGTH = 360;
const BSC_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

function buildSelectFields() {
  return {
    id: true,
    email: true,
    name: true,
    username: true,
    bio: true,
    avatarUrl: true,
    bscAddress: true,
    isAddressVerified: true,
    walletBalance: true,
    isBlocked: true,
    createdAt: true,
    updatedAt: true,
  };
}

function sanitizeProfilePayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Please provide the fields to update.");
  }

  const result = {};

  if (Object.prototype.hasOwnProperty.call(body, "bio")) {
    if (body.bio === null || body.bio === undefined) {
      result.bio = null;
    } else if (typeof body.bio === "string") {
      const trimmed = body.bio.trim();
      if (trimmed.length > MAX_BIO_LENGTH) {
        throw new Error(`Bio must be shorter than ${MAX_BIO_LENGTH} characters.`);
      }
      result.bio = trimmed || null;
    } else {
      throw new Error("Bio must be a string value.");
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "avatarUrl")) {
    if (body.avatarUrl === null || body.avatarUrl === undefined || body.avatarUrl === "") {
      result.avatarUrl = null;
    } else if (typeof body.avatarUrl === "string") {
      const trimmed = body.avatarUrl.trim();
      if (!trimmed) {
        result.avatarUrl = null;
      } else if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
        result.avatarUrl = trimmed;
      } else {
        throw new Error("Avatar URL must be an absolute URL or start with '/'.");
      }
    } else {
      throw new Error("Avatar URL must be a string value.");
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    if (body.name === null || body.name === undefined) {
      result.name = null;
    } else if (typeof body.name === "string") {
      result.name = body.name.trim() || null;
    } else {
      throw new Error("Name must be a string value.");
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "bscAddress")) {
    if (body.bscAddress === null || body.bscAddress === undefined) {
      result.bscAddress = null;
    } else if (typeof body.bscAddress === "string") {
      const normalized = body.bscAddress.trim();
      if (!normalized) {
        result.bscAddress = null;
      } else if (BSC_ADDRESS_REGEX.test(normalized)) {
        result.bscAddress = normalized;
      } else {
        throw new Error("BSC address must be a valid 0x wallet address.");
      }
    } else {
      throw new Error("BSC address must be a string value.");
    }
  }

  if (Object.keys(result).length === 0) {
    throw new Error("Nothing to update.");
  }

  return result;
}

async function findUserById(userId) {
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: buildSelectFields(),
  });
}

export async function GET() {
  try {
    const session = requireSessionUser();
    const user = await ensureActiveCustomer(session.userId);

    const profile = await findUserById(user.id);
    if (!profile) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Please sign in." }, { status: 401 });
    }
    if (error?.code === "ACCOUNT_BLOCKED") {
      return NextResponse.json({ message: "Your account is blocked." }, { status: 403 });
    }

    console.error("GET /api/customer/profile error:", error);
    return NextResponse.json({ message: "Failed to load profile." }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = requireSessionUser();
    const user = await ensureActiveCustomer(session.userId);

    const payload = await request.json().catch(() => null);
    const updates = sanitizeProfilePayload(payload);

    const targetUser = await findUserById(user.id);
    if (!targetUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: targetUser.id },
      data: updates,
      select: buildSelectFields(),
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Please sign in." }, { status: 401 });
    }
    if (error?.code === "ACCOUNT_BLOCKED") {
      return NextResponse.json({ message: "Your account is blocked." }, { status: 403 });
    }

    const message = error instanceof Error ? error.message : "Failed to update profile.";
    const status = /provide|string|shorter|Nothing|BSC/i.test(message) ? 400 : 500;

    console.error("PATCH /api/customer/profile error:", error);
    return NextResponse.json({ message }, { status });
  }
}
