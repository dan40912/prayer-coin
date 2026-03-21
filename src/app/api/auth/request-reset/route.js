import crypto from "node:crypto";

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

const RESET_TOKEN_EXPIRES_MINUTES = 30;

function isValidEmail(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return NextResponse.json({ message: "請輸入有效的電子信箱" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, passwordHash: true },
    });

    if (user?.passwordHash) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry: expiresAt,
        },
      });

      const appOrigin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
      const resetUrl = `${appOrigin}/reset-password?token=${rawToken}`;

      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json({
          message: "已建立重設密碼連結（開發模式可直接使用連結）。",
          resetUrl,
          expiresAt: expiresAt.toISOString(),
        });
      }
    }

    return NextResponse.json({
      message: "如果此信箱已註冊，我們已寄出重設密碼連結。",
    });
  } catch (error) {
    console.error("POST /api/auth/request-reset 發生錯誤", error);
    return NextResponse.json({ message: "寄送重設密碼連結時發生錯誤" }, { status: 500 });
  }
}
