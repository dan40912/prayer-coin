// src/lib/auth-storage.js
export const AUTH_STORAGE_KEY = "pc-auth-user";
export const AUTH_COOKIE_KEY = "pc-auth";
export const AUTH_CHANGE_EVENT = "pc-auth-changed";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.warn("auth-storage: failed to parse json", error);
    return null;
  }
}

export function readAuthSession() {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage?.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  return safeParse(stored);
}

export function saveAuthSession(user) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(user);

  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, payload);
  } catch (error) {
    console.warn("auth-storage: unable to save to localStorage", error);
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  // Cleanup legacy non-httpOnly cookie from old auth implementation.
  if (typeof document !== "undefined") {
    document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; sameSite=Lax`;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}
