import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const safeJson = (obj, init = {}) => NextResponse.json(obj, init);

export async function GET() {
  try {
    const prayers = await prisma.prayerRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, email: true, name: true } },
        _count: { select: { responses: true } }
      }
    });

    return safeJson({ prayers });
  } catch (error) {
    console.error("GET /api/prayers", error);
    return safeJson({ message: "Failed to fetch prayer requests" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, category, ownerId, tokensTarget } = body ?? {};

    if (!title || !description) {
      return safeJson({ message: "title and description are required" }, { status: 400 });
    }

    const slugBase = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
      .replace(/\s+/g, "-");

    const slugCandidate = slugBase || `prayer-${Date.now()}`;

    let slug = slugCandidate;
    let counter = 1;

    while (await prisma.prayerRequest.findUnique({ where: { slug } })) {
      slug = `${slugCandidate}-${counter++}`;
    }

    const prayer = await prisma.prayerRequest.create({
      data: {
        title,
        description,
        category,
        tokensTarget: tokensTarget ?? 0,
        slug,
        owner: ownerId ? { connect: { id: ownerId } } : undefined,
        status: "DRAFT"
      }
    });

    return safeJson({ prayer }, { status: 201 });
  } catch (error) {
    console.error("POST /api/prayers", error);
    return safeJson({ message: "Failed to create prayer request" }, { status: 500 });
  }
}