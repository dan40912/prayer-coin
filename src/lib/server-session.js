import { cookies } from "next/headers";

import { AUTH_COOKIE_KEY } from "@/lib/auth-storage";

function parseSessionCookie(rawValue) {
  if (!rawValue) return null;

  try {
    const decoded = decodeURIComponent(rawValue);
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (error) {
    console.warn("server-session: failed to parse session cookie", error);
  }
  return null;
}

export function readSessionUser() {
  try {
    const cookieStore = cookies();
    const raw = cookieStore.get(AUTH_COOKIE_KEY)?.value;
    return parseSessionCookie(raw);
  } catch (error) {
    console.warn("server-session: unable to read cookies", error);
    return null;
  }
}

export function requireSessionUser() {
  const session = readSessionUser();
  if (!session?.id) {
    const error = new Error("UNAUTHENTICATED");
    error.code = "UNAUTHENTICATED";
    throw error;
  }
  return session;
}
