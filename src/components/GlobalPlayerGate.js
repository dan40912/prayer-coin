"use client";

import { usePathname } from "next/navigation";

import GlobalPlayer from "@/components/GlobalPlayer";

export default function GlobalPlayerGate() {
  const pathname = usePathname() || "/";
  const hideGlobalPlayer =
    pathname === "/" ||
    pathname.startsWith("/customer-portal/create");

  if (hideGlobalPlayer) {
    return null;
  }

  return <GlobalPlayer />;
}
