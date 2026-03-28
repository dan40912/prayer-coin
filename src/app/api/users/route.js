import { NextResponse } from "next/server";

function gone() {
  return NextResponse.json(
    { message: "This endpoint has been deprecated." },
    { status: 410 }
  );
}

export async function GET() {
  return gone();
}

export async function POST() {
  return gone();
}
