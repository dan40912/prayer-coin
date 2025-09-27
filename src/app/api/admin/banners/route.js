// src/app/api/admin/banners/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 取得全部 Banners
export async function GET() {
  try {
    const banners = await prisma.siteBanner.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(banners);
  } catch (err) {
    console.error("❌ GET /api/admin/banners error:", err);
    return NextResponse.json({ message: "取得 Banners 失敗" }, { status: 500 });
  }
}

// 新增 Banner
export async function POST(request) {
  try {
    const data = await request.json();
    const banner = await prisma.siteBanner.create({
      data,
    });
    return NextResponse.json(banner);
  } catch (err) {
    console.error("❌ POST /api/admin/banners error:", err);
    return NextResponse.json({ message: "新增 Banner 失敗" }, { status: 500 });
  }
}

// 更新 Banner
export async function PATCH(request) {
  try {
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ message: "缺少 ID" }, { status: 400 });
    }

    const banner = await prisma.siteBanner.update({
      where: { id: Number(data.id) }, // ⚠️ 確保轉型成數字
      data,
    });
    return NextResponse.json(banner);
  } catch (err) {
    console.error("❌ PATCH /api/admin/banners error:", err);
    return NextResponse.json({ message: "更新 Banner 失敗" }, { status: 500 });
  }
}

// 刪除 Banner
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ message: "缺少 ID" }, { status: 400 });
    }

    await prisma.siteBanner.delete({
      where: { id: Number(id) }, // ⚠️ id 是 Int
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /api/admin/banners error:", err);
    return NextResponse.json({ message: "刪除 Banner 失敗" }, { status: 500 });
  }
}
