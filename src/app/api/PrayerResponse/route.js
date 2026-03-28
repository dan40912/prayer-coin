import { NextResponse } from "next/server";

function gone() {
  return NextResponse.json(
    { message: "This endpoint has been deprecated. Please use /api/responses." },
    { status: 410 }
  );
}

export async function POST() {
  return gone();
}
