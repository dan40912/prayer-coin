import { NextResponse } from "next/server";

const DIRECTORY_SEGMENTS = new Set(["legacy", "css", "img", "js", "prayfor", "dontmove"]);
const ADMIN_SESSION_COOKIE = "prayer-coin-admin-session";
const ADMIN_ALLOWED_API_PATHS = new Set([
  "/api/admin/auth/login",
  "/api/admin/session",
]);
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "dev-admin-session-secret-change-me";

function base64UrlToBytes(base64Url) {
  try {
    const padded = base64Url.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(base64Url.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch (error) {
    return null;
  }
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function verifyAdminSessionToken(token) {
  if (typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) {
    return null;
  }

  const secretKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", secretKey, new TextEncoder().encode(payloadBase64));
  const expectedSignature = bytesToBase64Url(new Uint8Array(signatureBuffer));
  if (expectedSignature !== signature) {
    return null;
  }

  const payloadBytes = base64UrlToBytes(payloadBase64);
  if (!payloadBytes) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch (error) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp <= now) {
    return null;
  }

  if (!payload.adminId || !payload.username || !["SUPER", "ADMIN"].includes(payload.role)) {
    return null;
  }

  return payload;
}

async function guardAdminRequest(request) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(sessionToken);

  if (pathname === "/admin") {
    if (!session) return null;
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin/")) {
    if (session) return null;
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/api/admin/")) {
    if (ADMIN_ALLOWED_API_PATHS.has(pathname)) {
      return null;
    }

    if (!session) {
      return NextResponse.json({ message: "未授權的管理後台請求" }, { status: 401 });
    }

    const headers = new Headers(request.headers);
    headers.set("x-admin-role", session.role);
    headers.set("x-admin-id", session.adminId);
    headers.set("x-admin-username", session.username);

    return NextResponse.next({
      request: {
        headers,
      },
    });
  }

  return null;
}

function rewriteLegacyRequest(request) {
  const { nextUrl } = request;
  const { pathname } = nextUrl;

  if (pathname === "/legacy" || pathname === "/legacy/") {
    const url = nextUrl.clone();
    url.pathname = "/legacy/index.html";
    return NextResponse.rewrite(url);
  }

  if (!pathname.startsWith("/legacy/")) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments.at(-1);

  if (!lastSegment || lastSegment.includes(".")) {
    return null;
  }

  if (DIRECTORY_SEGMENTS.has(lastSegment)) {
    return null;
  }

  const url = nextUrl.clone();
  url.pathname = `${pathname}.html`;
  return NextResponse.rewrite(url);
}

export async function middleware(request) {
  const adminResponse = await guardAdminRequest(request);
  if (adminResponse) {
    return adminResponse;
  }

  const legacyResponse = rewriteLegacyRequest(request);
  if (legacyResponse) {
    return legacyResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/legacy", "/legacy/:path*", "/admin", "/admin/:path*", "/api/admin/:path*"],
};
