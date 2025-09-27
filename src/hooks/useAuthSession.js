"use client";

import { useState, useEffect } from "react";
import {
  AUTH_CHANGE_EVENT,
  AUTH_STORAGE_KEY,
  readAuthSession,
} from "@/lib/auth-storage";

export function useAuthSession() {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const syncAuth = () => {
      const session = readAuthSession();
      setAuthUser(session);
    };

    syncAuth();

    const handleStorage = (event) => {
      if (event.key && event.key !== AUTH_STORAGE_KEY) return;
      syncAuth();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
    };
  }, []);

  return authUser;
}