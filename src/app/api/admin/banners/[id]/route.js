import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH /api/admin/banners/:id
export async function PATCH(req, { params }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: "❌ 無效的 ID" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await prisma.siteBanner.update({
      where: { id },
      data: {
        eyebrow: body.eyebrow,
        headline: body.headline,
        subheadline: body.subheadline,
        description: body.description,
        primaryCtaLabel: body.primaryCtaLabel,
        primaryCtaHref: body.primaryCtaHref,
        secondaryCtaLabel: body.secondaryCtaLabel,
        secondaryCtaHref: body.secondaryCtaHref,
        heroImage: body.heroImage,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("❌ PATCH /api/admin/banners/:id error:", error);
    return NextResponse.json({ message: "更新失敗" }, { status: 500 });
  }
}
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ message: "缺少 ID" }, { status: 400 });

    await prisma.siteBanner.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "刪除成功" });
  } catch (error) {
    console.error("❌ DELETE /api/admin/banner error:", error);
    return NextResponse.json({ message: "刪除失敗" }, { status: 500 });
  }
}
