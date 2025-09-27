import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("prayer-coin-admin-authenticated", "true", {
    httpOnly: true,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("prayer-coin-admin-authenticated", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
