import { NextResponse } from "next/server";

function gone() {
  return NextResponse.json(
    { message: "This endpoint has been deprecated. Please use /api/home-cards and /api/responses." },
    { status: 410 }
  );
}

export async function GET() {
  return gone();
}

export async function POST() {
  return gone();
}
