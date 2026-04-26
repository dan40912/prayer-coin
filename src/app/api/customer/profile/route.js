import { NextResponse } from "next/server";

import { ensureActiveCustomer } from "@/lib/customer-access";
import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/server-session";
import { normalizeYoutubeUrl } from "@/lib/youtube";

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
    storyAudioUrl: true,
    storyYoutubeUrl: true,
    storyUpdatedAt: true,
    bscAddress: true,
    isAddressVerified: true,
    publicProfileEnabled: true,
    walletBalance: true,
    isBlocked: true,
    createdAt: true,
    updatedAt: true,
  };
}

function sanitizeProfilePayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("請提供要更新的欄位。");
  }

  const result = {};

  if (Object.prototype.hasOwnProperty.call(body, "bio")) {
    if (body.bio === null || body.bio === undefined) {
      result.bio = null;
    } else if (typeof body.bio === "string") {
      const trimmed = body.bio.trim();
      if (trimmed.length > MAX_BIO_LENGTH) {
        throw new Error(`個人簡介不可超過 ${MAX_BIO_LENGTH} 個字。`);
      }
      result.bio = trimmed || null;
    } else {
      throw new Error("個人簡介必須是文字。");
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
        throw new Error("頭像網址必須是完整網址，或以 '/' 開頭。");
      }
    } else {
      throw new Error("頭像網址必須是文字。");
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    if (body.name === null || body.name === undefined) {
      result.name = null;
    } else if (typeof body.name === "string") {
      result.name = body.name.trim() || null;
    } else {
      throw new Error("暱稱必須是文字。");
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "publicProfileEnabled")) {
    if (typeof body.publicProfileEnabled !== "boolean") {
      throw new Error("公開個人頁設定必須是布林值。");
    }
    result.publicProfileEnabled = body.publicProfileEnabled;
  }

  if (Object.prototype.hasOwnProperty.call(body, "storyAudioUrl")) {
    if (body.storyAudioUrl === null || body.storyAudioUrl === undefined || body.storyAudioUrl === "") {
      result.storyAudioUrl = null;
    } else if (typeof body.storyAudioUrl === "string") {
      const trimmed = body.storyAudioUrl.trim();
      if (!trimmed) {
        result.storyAudioUrl = null;
      } else if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/voices/")) {
        result.storyAudioUrl = trimmed;
      } else {
        throw new Error("故事音訊網址必須是有效網址或 /voices 路徑");
      }
    } else {
      throw new Error("故事音訊欄位格式錯誤");
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "storyYoutubeUrl")) {
    if (body.storyYoutubeUrl === null || body.storyYoutubeUrl === undefined || body.storyYoutubeUrl === "") {
      result.storyYoutubeUrl = null;
    } else if (typeof body.storyYoutubeUrl === "string") {
      result.storyYoutubeUrl = normalizeYoutubeUrl(body.storyYoutubeUrl);
    } else {
      throw new Error("YouTube 連結欄位格式錯誤");
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
        throw new Error("BSC 地址格式不正確，請輸入有效的 0x 錢包地址。");
      }
    } else {
      throw new Error("BSC 地址必須是文字。");
    }
  }

  if (Object.keys(result).length === 0) {
    throw new Error("沒有可更新的內容。");
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
    const user = await ensureActiveCustomer(session);

    const profile = await findUserById(user.id);
    if (!profile) {
      return NextResponse.json({ message: "找不到使用者。" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "請先登入。" }, { status: 401 });
    }
    if (error?.code === "ACCOUNT_BLOCKED") {
      return NextResponse.json({ message: "帳號已被停用。" }, { status: 403 });
    }

    console.error("GET /api/customer/profile error:", error);
    return NextResponse.json({ message: "載入個人資料失敗。" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = requireSessionUser();
    const user = await ensureActiveCustomer(session);

    const payload = await request.json().catch(() => null);
    const updates = sanitizeProfilePayload(payload);

    const targetUser = await findUserById(user.id);
    if (!targetUser) {
      return NextResponse.json({ message: "找不到使用者。" }, { status: 404 });
    }

    if (Object.prototype.hasOwnProperty.call(updates, "bscAddress")) {
      const nextAddress = updates.bscAddress?.trim() || null;
      const currentAddress = targetUser.bscAddress?.trim() || null;
      if (nextAddress !== currentAddress) {
        updates.isAddressVerified = false;
      }
    }

    if (
      Object.prototype.hasOwnProperty.call(updates, "storyAudioUrl") ||
      Object.prototype.hasOwnProperty.call(updates, "storyYoutubeUrl")
    ) {
      updates.storyUpdatedAt = new Date();
    }

    const updated = await prisma.user.update({
      where: { id: targetUser.id },
      data: updates,
      select: buildSelectFields(),
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "請先登入。" }, { status: 401 });
    }
    if (error?.code === "ACCOUNT_BLOCKED") {
      return NextResponse.json({ message: "帳號已被停用。" }, { status: 403 });
    }

    const message = error instanceof Error ? error.message : "更新個人資料失敗。";
    const status = /請提供|不可超過|必須|格式|沒有可更新/.test(message) ? 400 : 500;

    console.error("PATCH /api/customer/profile error:", error);
    return NextResponse.json({ message }, { status });
  }
}
