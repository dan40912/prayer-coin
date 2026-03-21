"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import GlobalPlayer from "@/components/GlobalPlayer";
import { useAudio } from "@/context/AudioContext";

function isPath(pathname, target) {
  return pathname === target || pathname.startsWith(`${target}/`);
}

export default function GlobalPlayerGate() {
  const pathname = usePathname() || "/";
  const { playlist, isPlaying, pause } = useAudio();

  const hasQueue = Array.isArray(playlist) && playlist.length > 0;
  const inPrayerDetail = pathname.startsWith("/prayfor/");
  const inOvercomer = isPath(pathname, "/overcomer");
  const inCustomerPortal = pathname === "/customer-portal";

  const blockedByRoute =
    pathname === "/" ||
    isPath(pathname, "/about") ||
    isPath(pathname, "/howto") ||
    isPath(pathname, "/whitepaper") ||
    isPath(pathname, "/disclaimer") ||
    isPath(pathname, "/login") ||
    isPath(pathname, "/signup") ||
    isPath(pathname, "/forgot-password") ||
    isPath(pathname, "/reset-password") ||
    isPath(pathname, "/admin") ||
    isPath(pathname, "/customer-portal/create") ||
    isPath(pathname, "/customer-portal/edit");

  useEffect(() => {
    if (!blockedByRoute) return;
    if (!isPlaying) return;
    pause();
  }, [blockedByRoute, isPlaying, pause]);

  const shouldShowByRoute =
    (inPrayerDetail && hasQueue) ||
    (inOvercomer && hasQueue) ||
    (inCustomerPortal && isPlaying);

  if (!shouldShowByRoute) {
    return null;
  }

  return <GlobalPlayer />;
}
