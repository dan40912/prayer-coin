import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAdminAction } from "@/lib/logger";
import { requireAdmin, roleSet } from "@/lib/admin-route-auth";

const SUPER_ONLY = roleSet("SUPER");
const ALLOWED_ROLES = new Set(["SUPER", "ADMIN"]);

export async function PATCH(request, { params }) {
  const { error, session } = requireAdmin(request, SUPER_ONLY);
  if (error) return error;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "Missing id" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const updateData = {};
    const metadata = {};

    const existing = await prisma.adminAccount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "帳號不存在" }, { status: 404 });
    }

    if (typeof body.isActive === "boolean") {
      if (!body.isActive && existing.role === "SUPER") {
        const otherSuper = await prisma.adminAccount.count({
          where: {
            role: "SUPER",
            isActive: true,
            NOT: { id },
          },
        });
        if (otherSuper === 0) {
          return NextResponse.json({ message: "至少需要一位啟用的超級管理員" }, { status: 400 });
        }
      }
      updateData.isActive = body.isActive;
      metadata.isActive = body.isActive;
    }

    if (body.role && ALLOWED_ROLES.has(body.role)) {
      if (existing.role === "SUPER" && body.role !== "SUPER") {
        const otherSuper = await prisma.adminAccount.count({
          where: {
            role: "SUPER",
            isActive: true,
            NOT: { id },
          },
        });
        if (otherSuper === 0) {
          return NextResponse.json({ message: "至少需要一位啟用的超級管理員" }, { status: 400 });
        }
      }
      updateData.role = body.role;
      metadata.role = body.role;
    }

    if (body.password && body.password.length >= 4) {
      updateData.passwordHash = await bcrypt.hash(body.password, 10);
      metadata.passwordReset = true;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "沒有可更新的欄位" }, { status: 400 });
    }

    const updated = await prisma.adminAccount.update({
      where: { id },
      data: updateData,
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
      action: "admin.update",
      message: `更新管理員 ${updated.username}`,
      actorId: session.adminId,
      actorEmail: session.username,
      targetType: "AdminAccount",
      targetId: updated.id,
      metadata,
      requestPath: request.url,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("❌ PATCH /api/admin/accounts/[id] error:", error);
    return NextResponse.json({ message: "更新管理員失敗" }, { status: 500 });
  }
}
