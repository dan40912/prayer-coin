import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const notFound = () => NextResponse.json({ message: "Prayer request not found" }, { status: 404 });

export async function GET(_request, { params }) {
  const { id } = params;

  try {
    const prayer = await prisma.prayerRequest.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, email: true, name: true } },
        responses: {
          orderBy: { createdAt: "desc" },
          include: {
            responder: { select: { id: true, email: true, name: true } }
          }
        }
      }
    });

    if (!prayer) {
      return notFound();
    }

    return NextResponse.json({ prayer });
  } catch (error) {
    console.error(`GET /api/prayers/${id}`, error);
    return NextResponse.json({ message: "Failed to load prayer request" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { id } = params;

  try {
    const existing = await prisma.prayerRequest.findUnique({ where: { id } });

    if (!existing) {
      return notFound();
    }

    const body = await request.json();
    const allowedStatus = ["DRAFT", "PUBLISHED", "ANSWERED", "ARCHIVED"];

    if (body.status && !allowedStatus.includes(body.status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.prayerRequest.update({
      where: { id },
      data: {
        title: body.title ?? existing.title,
        description: body.description ?? existing.description,
        category: body.category ?? existing.category,
        tokensTarget: body.tokensTarget ?? existing.tokensTarget,
        status: body.status ?? existing.status
      }
    });

    return NextResponse.json({ prayer: updated });
  } catch (error) {
    console.error(`PATCH /api/prayers/${id}`, error);
    return NextResponse.json({ message: "Failed to update prayer request" }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const { id } = params;

  try {
    await prisma.prayerResponse.deleteMany({ where: { requestId: id } });
    const deleted = await prisma.prayerRequest.delete({ where: { id } });
    return NextResponse.json({ prayer: deleted });
  } catch (error) {
    if (error.code === "P2025") {
      return notFound();
    }

    console.error(`DELETE /api/prayers/${id}`, error);
    return NextResponse.json({ message: "Failed to delete prayer request" }, { status: 500 });
  }
}