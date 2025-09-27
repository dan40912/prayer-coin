import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const notFound = () => NextResponse.json({ message: "Prayer request not found" }, { status: 404 });

export async function GET(_request, { params }) {
  const { id } = params;

  try {
    const prayer = await prisma.prayerRequest.findUnique({ where: { id } });

    if (!prayer) {
      return notFound();
    }

    const responses = await prisma.prayerResponse.findMany({
      where: { requestId: id },
      orderBy: { createdAt: "desc" },
      include: {
        responder: { select: { id: true, email: true, name: true } }
      }
    });

    return NextResponse.json({ responses });
  } catch (error) {
    console.error(`GET /api/prayers/${id}/responses`, error);
    return NextResponse.json({ message: "Failed to load responses" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { id } = params;

  try {
    const prayer = await prisma.prayerRequest.findUnique({ where: { id } });

    if (!prayer) {
      return notFound();
    }

    const body = await request.json();
    const { message, voiceUrl, responderId, tokensAwarded } = body ?? {};

    if (!message && !voiceUrl) {
      return NextResponse.json({ message: "message or voiceUrl is required" }, { status: 400 });
    }

    const response = await prisma.prayerResponse.create({
      data: {
        message: message ?? "",
        voiceUrl,
        tokensAwarded: tokensAwarded ?? 0,
        request: { connect: { id } },
        responder: responderId ? { connect: { id: responderId } } : undefined
      }
    });

    return NextResponse.json({ response }, { status: 201 });
  } catch (error) {
    console.error(`POST /api/prayers/${id}/responses`, error);
    return NextResponse.json({ message: "Failed to create response" }, { status: 500 });
  }
}