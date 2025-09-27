// ./src/app/api/admin/prayerresponse/[id]/block/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const { id } = params; // URL /api/admin/prayerresponse/[id]/block
    const { block } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "缺少 ID" }, { status: 400 });
    }

    const updated = await prisma.prayerResponse.update({
      where: { id },
      data: { isBlocked: block },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("❌ PATCH /api/admin/prayerresponse/[id]/block error:", error);
    return NextResponse.json({ message: "更新失敗" }, { status: 500 });
  }
}
