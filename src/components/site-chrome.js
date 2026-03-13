"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/hooks/useAuthSession";
import { clearAuthSession } from "@/lib/auth-storage";

const PRIMARY_NAV = [
  { href: "/", label: "首頁" },
  { href: "/prayfor", label: "禱告牆" },
  { href: "/about", label: "關於我們" },
  { href: "/howto", label: "使用教學" },
  { href: "/customer-portal", label: "會員中心" },
];

const FOOTER_COLUMNS = [
  {
    title: "Start Pray",
    links: [
      { href: "/", label: "首頁" },
      { href: "/about", label: "關於我們" },
      { href: "/howto", label: "使用教學" },
      { href: "/customer-portal", label: "會員中心" },
    ],
  },
  {
    title: "資源",
    links: [
      { href: "/whitepaper", label: "白皮書 / 免責聲明" },
    ],
  },
  {
    title: "帳戶",
    links: [
      { href: "/login", label: "登入" },
      { href: "/signup", label: "註冊" },
      { href: "mailto:startpraynow@gmail.com", label: "聯絡我們" },
    ],
  },
];

const SOCIAL_LINKS = [
  { href: "#", label: "Facebook" },
  { href: "#", label: "Instagram" },
  { href: "#", label: "YouTube" },
];

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
      <div className="container navbar">
        <Link className="logo" href="/" prefetch={false}>
          <img className="logo-img" src="/legacy/img/logo.png" alt="Start Pray logo" />
          Start Pray
        </Link>

        <button
          type="button"
          className={`menu-toggle${menuOpen ? " is-open" : ""}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="切換導覽選單"
        >
          <span className="menu-toggle__icon" aria-hidden="true">
            <span />
            <span />
            <span />
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
            <div className="nav-actions">
              {isAuthenticated ? (
                <>
                  <Link href="/customer-portal/create" prefetch={false} className="btn btn-primary" onClick={closeMenu}>
                    + 發布禱告
                  </Link>
                  {authUser?.name ? <span className="nav-user">Hi, {authUser.name}</span> : null}
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
              <p>讓禱告被聽見，讓陪伴真正發生。</p>
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
          {/*
          <div className="footer-social">
            <span className="footer-title">社群</span>
            <div className="footer-social-links">
              {SOCIAL_LINKS.map((social) => (
                <a key={social.label} href={social.href}>
                  {social.label}
                </a>
              ))}
            </div>
          </div>
          */}
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Start Pray. All rights reserved.</span>
          <div className="footer-legal">
            <Link href="/whitepaper" prefetch={false}>
              白皮書 / 免責聲明
            </Link>
            {/*
            <Link href="/disclaimer" prefetch={false}>
              免責聲明
            </Link>
            */}
          </div>
        </div>
      </div>
    </footer>
  );
}

export const siteNavigation = {
  primary: PRIMARY_NAV,
  footer: FOOTER_COLUMNS,
  social: SOCIAL_LINKS,
};
