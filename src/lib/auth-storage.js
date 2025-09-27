// src/lib/auth-storage.js
export const AUTH_STORAGE_KEY = "pc-auth-user";
export const AUTH_COOKIE_KEY = "pc-auth";
export const AUTH_CHANGE_EVENT = "pc-auth-changed";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.warn("auth-storage: failed to parse json", error);
    return null;
  }
}

function readCookieValue(name) {
  if (typeof document === "undefined") return null;
  const pattern = new RegExp(`(?:^|; )${name}=([^;]*)`);
  const match = document.cookie.match(pattern);
  return match ? decodeURIComponent(match[1]) : null;
}

export function readAuthSession() {
  if (typeof window === "undefined") return null;

  // 先讀 localStorage
  const stored = window.localStorage?.getItem(AUTH_STORAGE_KEY);
  if (stored) {
    const parsed = safeParse(stored);
    if (parsed) return parsed;
  }

  // 再讀 cookie
  const cookieValue = readCookieValue(AUTH_COOKIE_KEY);
  if (!cookieValue) return null;

  return safeParse(cookieValue);
}

export function saveAuthSession(user) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(user);

  // 存到 localStorage
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, payload);
  } catch (error) {
    console.warn("auth-storage: unable to save to localStorage", error);
  }

  // 存到 cookie
  if (typeof document !== "undefined") {
    document.cookie = `${AUTH_COOKIE_KEY}=${encodeURIComponent(
      payload
    )}; path=/; max-age=${COOKIE_MAX_AGE}; sameSite=Lax`;
  }

  // 觸發事件（跨 tab & hook 能監聽到）
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  if (typeof document !== "undefined") {
    document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; sameSite=Lax`;
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}
