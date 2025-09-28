import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { readSessionUser, requireSessionUser } from "@/lib/server-session";

const MAX_BIO_LENGTH = 360;

function buildSelectFields() {
  return {
    id: true,
    email: true,
    name: true,
    username: true,
    bio: true,
    avatarUrl: true,
    isBlocked: true,
    createdAt: true,
    updatedAt: true,
  };
}

function sanitizeProfilePayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("請提供有效的資料");
  }

  const result = {};

  if (Object.prototype.hasOwnProperty.call(body, "bio")) {
    if (body.bio === null || body.bio === undefined) {
      result.bio = null;
    } else if (typeof body.bio === "string") {
      const trimmed = body.bio.trim();
      if (trimmed.length > MAX_BIO_LENGTH) {
        throw new Error(`自我介紹最多 ${MAX_BIO_LENGTH} 個字元`);
      }
      result.bio = trimmed || null;
    } else {
      throw new Error("自我介紹格式不正確");
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "avatarUrl")) {
    if (body.avatarUrl === null || body.avatarUrl === undefined || body.avatarUrl === "") {
      result.avatarUrl = null;
    } else if (typeof body.avatarUrl === "string") {
      const trimmed = body.avatarUrl.trim();
      if (!trimmed) {
        result.avatarUrl = null;
      } else {
        try {
          new URL(trimmed);
        } catch {
          throw new Error("請提供有效的圖片網址");
        }
        result.avatarUrl = trimmed;
      }
    } else {
      throw new Error("圖片網址格式不正確");
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    if (body.name === null || body.name === undefined) {
      result.name = null;
    } else if (typeof body.name === "string") {
      result.name = body.name.trim() || null;
    } else {
      throw new Error("名稱格式不正確");
    }
  }

  if (Object.keys(result).length === 0) {
    throw new Error("沒有可更新的欄位");
  }

  return result;
}

async function findUserForSession(session) {
  if (!session?.id && !session?.email) {
    return null;
  }

  const select = buildSelectFields();

  if (session.id) {
    const userById = await prisma.user.findUnique({ where: { id: session.id }, select });
    if (userById) {
      return userById;
    }
  }

  if (session.email) {
    const userByEmail = await prisma.user.findUnique({ where: { email: session.email }, select });
    if (userByEmail) {
      return userByEmail;
    }
  }

  return null;
}

export async function GET() {
  try {
    const session = readSessionUser();
    if (!session?.id && !session?.email) {
      return NextResponse.json({ message: "請先登入" }, { status: 401 });
    }

    const user = await findUserForSession(session);

    if (!user) {
      return NextResponse.json({ message: "找不到使用者資料" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/customer/profile 發生錯誤:", error);
    return NextResponse.json(
      { message: "讀取個人檔案時發生錯誤" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = requireSessionUser();
    const payload = await request.json().catch(() => null);
    const updates = sanitizeProfilePayload(payload);

    const targetUser = await findUserForSession(session);
    if (!targetUser) {
      return NextResponse.json({ message: "找不到使用者資料" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: targetUser.id },
      data: updates,
      select: buildSelectFields(),
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "請先登入" }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "更新個人檔案時發生錯誤";
    const status = /格式|欄位|字元|資料/.test(message) ? 400 : 500;

    console.error("PATCH /api/customer/profile 發生錯誤:", error);
    return NextResponse.json({ message }, { status });
  }
}
