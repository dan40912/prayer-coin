import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAdminAction } from "@/lib/logger";

const SESSION_HEADER = "x-admin-role";
const ALLOWED_ROLES = new Set(["SUPER", "ADMIN"]);

function ensureSuperRole(request) {
  const role = request.headers.get(SESSION_HEADER) ?? "";
  return role === "SUPER";
}

function sanitizeUsername(username) {
  return username?.trim().toLowerCase();
}

export async function GET(request) {
  if (!ensureSuperRole(request)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const accounts = await prisma.adminAccount.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("❌ GET /api/admin/accounts error:", error);
    return NextResponse.json({ message: "無法取得管理員帳號" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!ensureSuperRole(request)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const username = sanitizeUsername(body.username);
    const password = body.password ?? "";
    const role = body.role ?? "ADMIN";

    if (!username || !password) {
      return NextResponse.json({ message: "請填寫帳號與密碼" }, { status: 400 });
    }

    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ message: "不支援的角色" }, { status: 400 });
    }

    const existing = await prisma.adminAccount.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ message: "帳號已存在" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const account = await prisma.adminAccount.create({
      data: {
        username,
        passwordHash,
        role,
      },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await logAdminAction({
      action: "admin.create",
      message: `新增管理員 ${account.username}`,
      targetType: "AdminAccount",
      targetId: account.id,
      metadata: { role: account.role },
      requestPath: request.url,
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/admin/accounts error:", error);
    return NextResponse.json({ message: "新增管理員失敗" }, { status: 500 });
  }
}
