import { NextResponse } from "next/server";

const SESSION_COOKIE = "prayer-coin-admin-session";

export async function POST(request) {
  try {
    const body = await request.json();
    const payload = JSON.stringify(body ?? {});
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, payload, {
      httpOnly: true,
      path: "/",
    });
    return res;
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
