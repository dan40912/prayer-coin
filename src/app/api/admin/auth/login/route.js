import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";

import { createAdminSessionToken, setAdminSessionCookie } from "@/lib/admin-session";
import { logAdminAction } from "@/lib/logger";
import prisma from "@/lib/prisma";

function sanitizeUsername(input) {
  return typeof input === "string" ? input.trim().toLowerCase() : "";
}

function verifyOtpCode(code) {
  const otp = typeof code === "string" ? code.trim() : "";
  if (!otp) return false;

  const totpSecret = process.env.ADMIN_TOTP_SECRET?.trim();
  if (totpSecret) {
    return authenticator.check(otp, totpSecret);
  }

  const staticOtp = process.env.ADMIN_LOGIN_OTP?.trim();
  if (!staticOtp) {
    return false;
  }

  return otp === staticOtp;
}

function hasOtpConfig() {
  return Boolean(process.env.ADMIN_TOTP_SECRET?.trim() || process.env.ADMIN_LOGIN_OTP?.trim());
}

export async function POST(request) {
  try {
    const body = await request.json();
    const username = sanitizeUsername(body.username);
    const password = typeof body.password === "string" ? body.password : "";
    const otp = typeof body.otp === "string" ? body.otp : "";

    if (!username || !password || !otp) {
      return NextResponse.json({ message: "請輸入帳號、密碼與 2FA 驗證碼" }, { status: 400 });
    }

    if (!hasOtpConfig()) {
      return NextResponse.json({ message: "後台登入尚未完成 2FA 設定，請聯絡管理員" }, { status: 503 });
    }

    if (!verifyOtpCode(otp)) {
      return NextResponse.json({ message: "驗證碼錯誤" }, { status: 401 });
    }

    const account = await prisma.adminAccount.findUnique({ where: { username } });
    if (!account || !account.isActive) {
      return NextResponse.json({ message: "帳號不存在或已停用" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, account.passwordHash);
    if (!isValid) {
      return NextResponse.json({ message: "帳號或密碼錯誤" }, { status: 401 });
    }

    await prisma.adminAccount.update({
      where: { id: account.id },
      data: { lastLoginAt: new Date() },
    });

    await logAdminAction({
      action: "admin.login",
      message: `管理員 ${account.username} 登入後台`,
      targetType: "AdminAccount",
      targetId: account.id,
      metadata: { username: account.username, role: account.role },
    });

    const response = NextResponse.json({
      username: account.username,
      role: account.role,
    });

    const sessionToken = createAdminSessionToken(account);
    setAdminSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    console.error("POST /api/admin/auth/login error:", error);
    return NextResponse.json({ message: "登入失敗，請稍後再試" }, { status: 500 });
  }
}
