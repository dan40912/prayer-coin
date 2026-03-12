"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  AUTH_CHANGE_EVENT,
  AUTH_STORAGE_KEY,
  clearAuthSession,
  readAuthSession
} from "@/lib/auth-storage";

const PRIMARY_NAV = [
  { href: "/", label: "首頁" },
  { href: "/prayfor", label: "禱告中心" },
  { href: "/about", label: "關於我們" },
  { href: "/howto", label: "使用教學" },
  { href: "/customer-portal", label: "管理中心" },
  // { href: "/login", label: "登入" },
  // { href: "/signup", label: "註冊" }
];

const FOOTER_COLUMNS = [
  {
    title: "Start Pray",
    links: [
      { href: "/", label: "首頁" },
      { href: "/about", label: "關於我們" },
      { href: "/howto", label: "使用教學" },
      { href: "/customer-portal", label: "管理中心" }
    ]
  },
  {
    title: "資源",
    links: [
      { href: "/whitepaper", label: "白皮書&免責聲明" },
      // { href: "/disclaimer", label: "免責聲明" },
      // { href: "/legacy/prayfor/details", label: "祈禱牆" }
    ]
  },
  {
    title: "聯絡",
    links: [
      { href: "/login", label: "登入" },
      { href: "/signup", label: "註冊" },
      { href: "mailto:startpraynow@gmail.com", label: "聯絡我們" }
    ]
  }
];

const SOCIAL_LINKS = [
  { href: "#", label: "Facebook" },
  { href: "#", label: "Instagram" },
  { href: "#", label: "YouTube" }
];

// function useAuthSession() {
//   const [authUser, setAuthUser] = useState(null);

//   useEffect(() => {
//     const syncAuth = () => {
//       const session = readAuthSession();
//       setAuthUser(session);
//     };

//     syncAuth();

//     const handleStorage = (event) => {
//       if (event.key && event.key !== AUTH_STORAGE_KEY) return;
//       syncAuth();
//     };

//     window.addEventListener("storage", handleStorage);
//     window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);

//     return () => {
//       window.removeEventListener("storage", handleStorage);
//       window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
//     };
//   }, []);

//   return authUser;
// }

export function SiteHeader({ activePath, hideAuthActions = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const authUser = useAuthSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const current = activePath ?? pathname;
  const isAuthenticated = Boolean(authUser);

  const navItems = useMemo(() => {
    if (isAuthenticated) {
      return PRIMARY_NAV.filter((item) => item.href !== "/login" && item.href !== "/signup");
    }
    return PRIMARY_NAV.filter((item) => item.href !== "/customer-portal");
  }, [isAuthenticated]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [current, closeMenu]);

  const handleLogout = useCallback(() => {
    closeMenu();
    clearAuthSession();
    router.push("/");
  }, [closeMenu, router]);

  return (
    <header className="site-header">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Link className="logo" href="/" prefetch={false}>
          <img className="logo-img" src="/legacy/img/logo.png" alt="Start Pray logo" style={{ height: '32px', width: 'auto' }} />
          Start Pray
        </Link>

        {/* mobile menu toggle placeholder if needed */}
        <button
          type="button"
          className={`menu-toggle${menuOpen ? " is-open" : ""}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          style={{ display: "none" }} /* Hidden in new theme by default unless explicitly styled */
          aria-label="切換導覽選單"
        >
          <span className="menu-toggle__icon" aria-hidden="true">
            <span /><span /><span />
          </span>
        </button>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          {navItems.map((item) => {
            const isActive = current === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={isActive ? "active" : undefined}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            );
          })}

          {!hideAuthActions ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {isAuthenticated ? (
                <>
                  <Link href="/customer-portal/create" prefetch={false} className="btn btn-primary" onClick={closeMenu}>
                    + 發布禱告
                  </Link>
                  {authUser?.name ? <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Hi, {authUser.name}</span> : null}
                  <button type="button" className="btn btn-glass" onClick={handleLogout}>
                    登出
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" prefetch={false} className="btn btn-glass" onClick={closeMenu}>
                    登入
                  </Link>
                  <Link href="/signup" prefetch={false} className="btn btn-primary" onClick={closeMenu}>
                    註冊
                  </Link>
                </>
              )}
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <img className="footer-logo" src="/legacy/img/logo.png" alt="Start Pray logo" />
            <div>
              <strong>Start Pray</strong>
              <p>禱告連結世界，整合代禱、媒體與行動。</p>
            </div>
          </div>
          <div className="footer-grid">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="footer-column">
                <span className="footer-title">{column.title}</span>
                {column.links.map((link) =>
                  link.href.startsWith("mailto:") ? (
                    <a key={link.label} href={link.href}>
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.label} href={link.href} prefetch={false}>
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            ))}
          </div>
          {/* <div className="footer-social">
            <span className="footer-title">社群</span>
            <div className="footer-social-links">
              {SOCIAL_LINKS.map((social) => (
                <a key={social.label} href={social.href}>
                  {social.label}
                </a>
              ))}
            </div>
          </div> */}
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Start Pray. All rights reserved.</span>
          <div className="footer-legal">
            <Link href="/whitepaper" prefetch={false}>
              白皮書&免責聲明
            </Link>
            {/* <Link href="/disclaimer" prefetch={false}>
              免責聲明
            </Link> */}
          </div>
        </div>
      </div>
    </footer>
  );
}

export const siteNavigation = {
  primary: PRIMARY_NAV,
  footer: FOOTER_COLUMNS,
  social: SOCIAL_LINKS
};

