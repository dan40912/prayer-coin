import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "重設密碼功能暫時停用，請稍後再試。" },
    { status: 503 }
  );
}

