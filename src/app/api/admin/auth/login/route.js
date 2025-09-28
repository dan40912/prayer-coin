import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAdminAction } from "@/lib/logger";

function sanitizeUsername(input) {
  return input?.trim().toLowerCase();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const username = sanitizeUsername(body.username);
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json({ message: "請輸入帳號與密碼" }, { status: 400 });
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

    return NextResponse.json({
      username: account.username,
      role: account.role,
    });
  } catch (error) {
    console.error("❌ POST /api/admin/auth/login error:", error);
    return NextResponse.json({ message: "登入失敗，請稍後再試" }, { status: 500 });
  }
}
