import { NextResponse } from "next/server";

import { ensureActiveCustomer } from "@/lib/customer-access";
import {
  clearCustomerSessionCookie,
  readCustomerSessionFromRequest,
} from "@/lib/customer-session";

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl ?? null,
    bio: user.bio ?? null,
    publicProfileEnabled: Boolean(user.publicProfileEnabled),
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

    const user = await ensureActiveCustomer(session);

    return NextResponse.json({
      authenticated: true,
      user: toPublicUser(user),
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
