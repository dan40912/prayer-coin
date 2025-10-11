import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/server-session";

const RESPONSE_SELECT = {
  id: true,
  message: true,
  voiceUrl: true,
  isBlocked: true,
  reportCount: true,
  createdAt: true,
  homeCard: {
    select: {
      id: true,
      title: true,
      image: true,
      alt: true,
      slug: true,
      detailsHref: true,
    },
  },
};

async function findOwnedResponse(responseId, userId) {
  const response = await prisma.prayerResponse.findUnique({
    where: { id: responseId },
    select: {
      responderId: true,
    },
  });

  if (!response) {
    return {
      response: NextResponse.json(
        { message: "Response not found." },
        { status: 404 },
      ),
    };
  }

  if (response.responderId !== userId) {
    return {
      response: NextResponse.json(
        { message: "You do not have permission to manage this response." },
        { status: 403 },
      ),
    };
  }

  return { response };
}

export async function PATCH(request, { params }) {
  const responseId = params?.id ? String(params.id) : "";
  if (!responseId) {
    return NextResponse.json({ message: "Invalid response id." }, { status: 400 });
  }

  try {
    const session = requireSessionUser();
    const payload = await request.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { message: "Please provide the fields to update." },
        { status: 400 },
      );
    }

    const { response: ownershipResponse } = await findOwnedResponse(
      responseId,
      session.id,
    );
    if (ownershipResponse) {
      return ownershipResponse;
    }

    const data = {};
    if (Object.prototype.hasOwnProperty.call(payload, "isBlocked")) {
      data.isBlocked = Boolean(payload.isBlocked);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "No valid fields to update." },
        { status: 400 },
      );
    }

    const updated = await prisma.prayerResponse.update({
      where: { id: responseId },
      data,
      select: RESPONSE_SELECT,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Please sign in." }, { status: 401 });
    }

    console.error("PATCH /api/customer/responses/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update response." },
      { status: 500 },
    );
  }
}

