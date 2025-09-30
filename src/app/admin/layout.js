"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const SESSION_STORAGE_KEY = "prayer-coin-admin-session";
const ADMIN_RESTRICTED_PATHS = [
  "/admin/users",
  "/admin/wallet",
  "/admin/log",
  "/admin/settings",
];

const NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "總覽 Dashboard",
    roles: ["SUPER", "ADMIN"],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="13" width="4" height="8" rx="1" fill="currentColor" opacity="0.9" />
        <rect x="9" y="7" width="4" height="14" rx="1" fill="currentColor" opacity="0.9" />
        <rect x="15" y="3" width="4" height="18" rx="1" fill="currentColor" opacity="0.9" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "用戶管理",
    roles: ["SUPER"],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M16 11c1.657 0 3-1.567 3-3.5S17.657 4 16 4s-3 1.567-3 3.5S14.343 11 16 11zM8 11c1.657 0 3-1.567 3-3.5S9.657 4 8 4 5 5.567 5 7.5 6.343 11 8 11z" fill="currentColor" />
        <path d="M3 20c0-2.5 3-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/admin/prayfor",
    label: "禱告事項管理",
    roles: ["SUPER", "ADMIN"],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21s-6-4.5-8-7.5C1 10 5 6 8.5 6 10.5 6 12 8 12 8s1.5-2 3.5-2C19 6 23 10 20 13.5 18 16.5 12 21 12 21z" fill="currentColor" />
        <circle cx="12" cy="9" r="1.2" fill="#fff" opacity="0.3" />
      </svg>
    ),
  },
  {
    href: "/admin/prayerresponse",
    label: "禱告回應管理",
    roles: ["SUPER", "ADMIN"],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" />
        <path d="M11 10h2M11 14h2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/admin/content",
    label: "內容管理",
    roles: ["SUPER", "ADMIN"],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="7" height="7" rx="1.2" fill="currentColor" />
        <rect x="14" y="4" width="7" height="7" rx="1.2" fill="currentColor" opacity="0.95" />
        <rect x="3" y="13" width="7" height="7" rx="1.2" fill="currentColor" opacity="0.9" />
        <rect x="14" y="13" width="7" height="7" rx="1.2" fill="currentColor" opacity="0.85" />
      </svg>
    ),
  },
  // {
  //   href: "/admin/analytics",
  //   label: "洞察分析",
  //   roles: ["SUPER", "ADMIN"],
  //   icon: (
  //     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  //       <path d="M21 12A9 9 0 1 1 12 3" stroke="currentColor" strokeWidth="1.4" fill="currentColor" />
  //       <path d="M12 12v-6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
  //     </svg>
  //   ),
  // },
  {
    href: "/admin/wallet",
    label: "錢包管理",
    roles: ["SUPER"],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2.5" fill="currentColor" opacity="0.9" />
        <path d="M16 12h3M5 9h7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/admin/log",
    label: "系統紀錄",
    roles: ["SUPER"],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="3" width="14" height="18" rx="2" fill="currentColor" opacity="0.85" />
        <path d="M8 8h8M8 12h5M8 16h6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "權限管理",
    roles: ["SUPER"],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" fill="currentColor" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 2.41 16.8l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.7 0 1.27-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.6 2.41l.06.06a1.65 1.65 0 0 0 1.82.33h.01C9.8 2.7 10.37 2.3 11.07 2.3H13a2 2 0 1 1 0 4h-.09c-.7 0-1.27.4-1.51 1a1.65 1.65 0 0 0 .33 1.82l.06.06A2 2 0 1 1 17.6 7.6l-.06.06a1.65 1.65 0 0 0-1.82.33c-.24.6-.81 1-1.51 1H11a2 2 0 1 1 0 4h.09c.7 0 1.27.4 1.51 1z" fill="currentColor" opacity="0.95" />
      </svg>
    ),
  },
];

function readAdminSession() {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(pathname === "/admin");
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (pathname === "/admin") {
      setIsReady(true);
      return;
    }

    const sessionData = readAdminSession();

    if (!sessionData) {
      router.replace("/admin");
      return;
    }

    setSession(sessionData);

    if (
      sessionData.role === "ADMIN" &&
      ADMIN_RESTRICTED_PATHS.some((restricted) => pathname.startsWith(restricted))
    ) {
      router.replace("/admin/dashboard");
      return;
    }

    setIsReady(true);
  }, [pathname, router]);

  const visibleNavItems = useMemo(() => {
    if (!session) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(session.role));
  }, [session]);

  const profileName = session?.username ?? "Admin";
  const profileRoleLabel = session?.role === "SUPER" ? "超級管理員" : "一般管理員";

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
    router.replace("/admin");
  };

  if (pathname === "/admin") {
    return children;
  }

  if (!isReady) {
    return (
      <main className="admin-shell admin-shell--loading">
        <div className="admin-shell__loading">載入後台中...</div>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-shell__sidebar">
        <div className="admin-shell__brand">
          <Image src="/legacy/img/logo.png" alt="Prayer Coin logo" width={42} height={42} />
          <div>
            <p>PRAY COIN</p>
            <span>Admin 後台</span>
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
              >
                <span className="admin-shell__nav-icon" aria-hidden="true">{item.icon}</span>
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
        {/* <header className="admin-shell__topbar">
          <form className="admin-shell__search" role="search">
            <input type="search" placeholder="搜尋祈禱室、用戶或專案" aria-label="Search" />
          </form>
          <div className="admin-shell__topbar-actions">
            <button type="button">通知</button>
            <button type="button">語系</button>
            <button type="button">快速新增</button>
          </div>
        </header> */}

        <div className="admin-shell__scroll">
          <div className="admin-shell__content">{children}</div>
        </div>
      </div>
    </div>
  );
}
