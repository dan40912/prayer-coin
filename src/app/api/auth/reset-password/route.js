import crypto from "node:crypto";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const payload = await request.json();
    const token = typeof payload?.token === "string" ? payload.token.trim() : "";
    const password = typeof payload?.password === "string" ? payload.password : "";
    const confirmPassword = typeof payload?.confirmPassword === "string" ? payload.confirmPassword : "";

    if (!token) {
      return NextResponse.json({ message: "重設連結無效，請重新申請。" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "密碼至少需要 8 碼" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ message: "兩次輸入密碼不一致" }, { status: 400 });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const now = new Date();

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: now,
        },
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "重設連結已失效，請重新申請。" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: "密碼已更新，請使用新密碼重新登入。" });
  } catch (error) {
    console.error("POST /api/auth/reset-password 發生錯誤", error);
    return NextResponse.json({ message: "重設密碼時發生錯誤" }, { status: 500 });
  }
}
