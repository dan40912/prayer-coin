import { NextResponse } from "next/server";

import { ensureActiveCustomer } from "@/lib/customer-access";
import {
  clearCustomerSessionCookie,
  readCustomerSessionFromRequest,
} from "@/lib/customer-session";

function toPublicUser(session) {
  return {
    id: session.userId,
    email: session.email,
    name: session.name,
    username: session.username,
  };
}

export async function GET(request) {
  try {
    const session = readCustomerSessionFromRequest(request);
    if (!session) {
      const response = NextResponse.json({ authenticated: false }, { status: 401 });
      clearCustomerSessionCookie(response);
      return response;
    }

    const user = await ensureActiveCustomer(session.userId);

    return NextResponse.json({
      authenticated: true,
      user: toPublicUser({
        userId: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
      }),
    });
  } catch (error) {
    if (error?.code === "UNAUTHENTICATED" || error?.code === "ACCOUNT_BLOCKED") {
      const response = NextResponse.json({ authenticated: false }, { status: 401 });
      clearCustomerSessionCookie(response);
      return response;
    }

    console.error("GET /api/customer/session error", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearCustomerSessionCookie(response);
  return response;
}
