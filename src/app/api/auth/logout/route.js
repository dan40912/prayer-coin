import { NextResponse } from "next/server";

import { clearCustomerSessionCookie } from "@/lib/customer-session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearCustomerSessionCookie(response);
  return response;
}
