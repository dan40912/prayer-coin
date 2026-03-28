import { cookies } from "next/headers";

import { CUSTOMER_SESSION_COOKIE, verifyCustomerSessionToken } from "@/lib/customer-session";

function normalizeSessionPayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (!payload.userId) return null;

  return {
    id: payload.userId,
    userId: payload.userId,
    email: payload.email ?? null,
    name: payload.name ?? null,
    username: payload.username ?? null,
    exp: payload.exp ?? null,
  };
}

export function readSessionUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
    const payload = verifyCustomerSessionToken(token);
    return normalizeSessionPayload(payload);
  } catch (error) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") {
      return null;
    }
    console.warn("server-session: unable to read cookies", error);
    return null;
  }
}

export function requireSessionUser() {
  const session = readSessionUser();
  if (!session?.userId) {
    const error = new Error("UNAUTHENTICATED");
    error.code = "UNAUTHENTICATED";
    throw error;
  }
  return session;
}
