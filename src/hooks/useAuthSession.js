"use client";

import { useEffect, useState } from "react";
import {
  AUTH_CHANGE_EVENT,
  AUTH_STORAGE_KEY,
  clearAuthSession,
  readAuthSession,
  saveAuthSession,
} from "@/lib/auth-storage";

function isSameUser(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

async function readServerSession() {
  const response = await fetch("/api/customer/session", { cache: "no-store" });
  if (!response.ok) return null;

  const data = await response.json().catch(() => null);
  return data?.user ?? null;
}

export function useAuthSession() {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    let active = true;

    const syncAuth = async () => {
      const localSession = readAuthSession();
      if (active) {
        setAuthUser(localSession);
      }

      try {
        const serverSession = await readServerSession();
        if (!active) return;

        if (!serverSession) {
          if (localSession) {
            clearAuthSession();
          }
          setAuthUser(null);
          return;
        }

        setAuthUser(serverSession);
        if (!isSameUser(serverSession, localSession)) {
          saveAuthSession(serverSession);
        }
      } catch (error) {
        // Keep local snapshot when session endpoint is temporarily unavailable.
        if (active) {
          setAuthUser(localSession);
        }
      }
    };

    syncAuth();

    const handleStorage = (event) => {
      if (event.key && event.key !== AUTH_STORAGE_KEY) return;
      void syncAuth();
    };

    const handleAuthChange = () => {
      void syncAuth();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);

    return () => {
      active = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  return authUser;
}
