import { NextResponse } from "next/server";

function gone() {
  return NextResponse.json(
    {
      message:
        "This endpoint has been deprecated. Please use /api/customer/cards/[id] for owner operations.",
    },
    { status: 410 }
  );
}

export async function GET() {
  return gone();
}

export async function PUT() {
  return gone();
}

export async function PATCH() {
  return gone();
}

export async function DELETE() {
  return gone();
}
