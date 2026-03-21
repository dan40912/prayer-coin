import { NextResponse } from "next/server";

import {
  clearAdminSessionCookie,
  readAdminSessionFromRequest,
} from "@/lib/admin-session";

export async function GET(request) {
  const session = readAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.adminId,
      username: session.username,
      role: session.role,
    },
  });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearAdminSessionCookie(response);
  return response;
}
