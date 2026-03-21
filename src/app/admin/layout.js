"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const ADMIN_RESTRICTED_PATHS = ["/admin/users", "/admin/wallet", "/admin/log", "/admin/settings"];

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "總覽", roles: ["SUPER", "ADMIN"] },
  { href: "/admin/prayfor", label: "代禱牆管理", roles: ["SUPER", "ADMIN"] },
  { href: "/admin/prayerresponse", label: "回應管理", roles: ["SUPER", "ADMIN"] },
  { href: "/admin/content", label: "首頁 Banner", roles: ["SUPER", "ADMIN"] },
  { href: "/admin/home-categories", label: "分類管理", roles: ["SUPER", "ADMIN"] },
  { href: "/admin/wallet", label: "錢包與交易", roles: ["SUPER"] },
  { href: "/admin/log", label: "操作紀錄", roles: ["SUPER"] },
  { href: "/admin/settings", label: "系統設定", roles: ["SUPER"] },
];

async function fetchAdminSession() {
  const response = await fetch("/api/admin/session", { cache: "no-store" });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.user ?? null;
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isReady, setIsReady] = useState(pathname === "/admin");
  const [session, setSession] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const guardAdminRoute = async () => {
      if (pathname === "/admin") {
        setIsReady(true);
        return;
      }

      setIsReady(false);
      const user = await fetchAdminSession();
      if (!active) return;

      if (!user) {
        router.replace("/admin");
        return;
      }

      if (
        user.role === "ADMIN" &&
        ADMIN_RESTRICTED_PATHS.some((restricted) => pathname.startsWith(restricted))
      ) {
        router.replace("/admin/dashboard");
        return;
      }

      setSession(user);
      setIsReady(true);
    };

    guardAdminRoute();
    return () => {
      active = false;
    };
  }, [pathname, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const visibleNavItems = useMemo(() => {
    if (!session?.role) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) => item.roles.includes(session.role));
  }, [session]);

  const currentNavLabel = useMemo(() => {
    const active = visibleNavItems.find((item) => pathname.startsWith(item.href));
    return active?.label || "管理後台";
  }, [pathname, visibleNavItems]);

  const profileName = session?.username ?? "Admin";
  const profileRoleLabel = session?.role === "SUPER" ? "超級管理員" : "管理員";

  const handleSignOut = async () => {
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
    } finally {
      router.replace("/admin");
    }
  };

  if (pathname === "/admin") return children;

  if (!isReady) {
    return (
      <main className="admin-shell admin-shell--loading">
        <div className="admin-shell__loading">正在驗證管理員身份…</div>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      <button
        type="button"
        className={`admin-shell__backdrop${sidebarOpen ? " is-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-label="關閉側邊欄"
        tabIndex={sidebarOpen ? 0 : -1}
      />

      <aside className={`admin-shell__sidebar${sidebarOpen ? " is-open" : ""}`}>
        <div className="admin-shell__brand">
                  <Image src="/img/LOGO.PNG" alt="Start Pray logo" width={42} height={42} />
          <div>
            <p>START PRAY</p>
            <span>Admin Console</span>
          </div>
        </div>

        <nav className="admin-shell__nav">
          {visibleNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "admin-shell__nav-link admin-shell__nav-link--active" : "admin-shell__nav-link"}
                onClick={() => setSidebarOpen(false)}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <footer className="admin-shell__sidebar-footer">
          <div className="admin-shell__profile">
            <div>
              <strong>{profileName}</strong>
              <span>{profileRoleLabel}</span>
            </div>
          </div>
          <button type="button" className="admin-shell__signout" onClick={handleSignOut}>
            登出
          </button>
        </footer>
      </aside>

      <div className="admin-shell__main">
        <div className="admin-shell__topbar">
          <div className="admin-shell__topbar-left">
            <button
              type="button"
              className="admin-shell__menu-toggle"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="切換管理側欄"
              aria-expanded={sidebarOpen}
            >
              <span aria-hidden="true">☰</span>
            </button>
            <div>
              <p className="admin-shell__topbar-kicker">Admin</p>
              <strong className="admin-shell__topbar-title">{currentNavLabel}</strong>
            </div>
          </div>
          <div className="admin-shell__topbar-actions">
            <Link href="/prayfor" className="button button--ghost" prefetch={false}>
              回前台
            </Link>
          </div>
        </div>

        <div className="admin-shell__scroll">
          <div className="admin-shell__content">{children}</div>
        </div>
      </div>
    </div>
  );
}
