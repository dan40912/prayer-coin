import crypto from "node:crypto";

export const CUSTOMER_SESSION_COOKIE = "pc-auth-session";

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function getSessionSecret() {
  return process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "dev-customer-session-secret-change-me";
}

function encodePayload(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(payloadBase64) {
  try {
    const raw = Buffer.from(payloadBase64, "base64url").toString("utf8");
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function signPayload(payloadBase64) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payloadBase64).digest("base64url");
}

export function createCustomerSessionToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    v: 1,
    userId: user.id,
    email: user.email,
    name: user.name ?? null,
    username: user.username ?? null,
    exp: now + SESSION_TTL_SECONDS,
  };
  const payloadBase64 = encodePayload(payload);
  const signature = signPayload(payloadBase64);
  return `${payloadBase64}.${signature}`;
}

export function verifyCustomerSessionToken(token) {
  if (typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) return null;

  const expected = signPayload(payloadBase64);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return null;
  }

  const payload = decodePayload(payloadBase64);
  if (!payload || typeof payload !== "object") return null;

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp <= now) {
    return null;
  }

  if (!payload.userId || !payload.email) {
    return null;
  }

  return payload;
}

export function readCustomerSessionFromRequest(request) {
  const token = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  return verifyCustomerSessionToken(token);
}

export function setCustomerSessionCookie(response, token) {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearCustomerSessionCookie(response) {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
