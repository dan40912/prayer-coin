// /src/app/api/admin/prayfor/[id]/block/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { block } = await request.json();

    const updated = await prisma.homePrayerCard.update({
      where: { id: Number(id) }, // 注意 ID 是 Int
      data: { isBlocked: block },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("❌ 封鎖/解除封鎖失敗:", err);
    return NextResponse.json({ message: "操作失敗" }, { status: 500 });
  }
}
