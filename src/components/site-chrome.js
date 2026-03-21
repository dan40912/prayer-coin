"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/hooks/useAuthSession";
import { clearAuthSession } from "@/lib/auth-storage";

const PRIMARY_NAV = [
  { href: "/prayfor", label: "禱告牆" },
  { href: "/about", label: "平台介紹" },
  { href: "/howto", label: "使用方式" },
  { href: "/customer-portal", label: "會員中心", requiresAuth: true },
];

const FOOTER_COLUMNS = [
  {
    title: "Start Pray",
    links: [
      { href: "/prayfor", label: "禱告牆" },
      { href: "/about", label: "平台介紹" },
      { href: "/howto", label: "使用方式" },
      { href: "/customer-portal", label: "會員中心" },
    ],
  },
  {
    title: "信任與條款",
    links: [
      { href: "/whitepaper", label: "白皮書與使用條款" },
      { href: "/disclaimer", label: "免責與風險聲明" },
    ],
  },
  {
    title: "帳號與聯絡",
    links: [
      { href: "/login", label: "登入" },
      { href: "/signup", label: "註冊" },
      { href: "mailto:startpraynow@gmail.com", label: "客服信箱" },
    ],
  },
];

const SOCIAL_LINKS = [
  { href: "#", label: "Facebook" },
  { href: "#", label: "Instagram" },
  { href: "#", label: "YouTube" },
];

function resolveNavHref(item, isAuthenticated) {
  if (item.requiresAuth && !isAuthenticated) {
    return "/login?next=/customer-portal";
  }
  return item.href;
}

function isNavActive(currentPath, href) {
  if (href === "/prayfor") {
    return currentPath === "/prayfor" || currentPath.startsWith("/prayfor/");
  }
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function SiteHeader({ activePath, hideAuthActions = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const authUser = useAuthSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const current = activePath ?? pathname;
  const isAuthenticated = Boolean(authUser);
  const navItems = useMemo(() => PRIMARY_NAV, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [current, closeMenu]);

  const handleLogout = useCallback(() => {
    closeMenu();
    clearAuthSession();
    router.push("/prayfor");
  }, [closeMenu, router]);

  return (
    <header className="site-header">
      <div className="container navbar">
        <Link className="logo" href="/" prefetch={false}>
          <img className="logo-img" src="/img/logo.png" alt="Start Pray logo" />
          Start Pray
        </Link>

        <button
          type="button"
          className={`menu-toggle${menuOpen ? " is-open" : ""}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="切換導覽選單"
          aria-expanded={menuOpen}
          aria-controls="site-primary-nav"
        >
          <span className="menu-toggle__icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <nav id="site-primary-nav" className={`nav-links ${menuOpen ? "open" : ""}`}>
          {navItems.map((item) => {
            const targetHref = resolveNavHref(item, isAuthenticated);
            const isActive = isNavActive(current, item.href);
            return (
              <Link
                key={item.href}
                href={targetHref}
                prefetch={false}
                className={isActive ? "active" : undefined}
                onClick={closeMenu}
                title={item.requiresAuth && !isAuthenticated ? "登入後可進入會員中心" : undefined}
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
                    + 新增代禱
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
            <Link href="/" prefetch={false} aria-label="Start Pray homepage">
              <img className="footer-logo" src="/img/logo.png" alt="Start Pray logo" />
            </Link>
            <div>
              <strong>Start Pray</strong>
              <p>讓需要幫助的人能安全說出來，讓願意代禱的人能真實回應。</p>
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
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Start Pray. All rights reserved.</span>
          <div className="footer-legal">
            <Link href="/whitepaper" prefetch={false}>
              白皮書與使用條款
            </Link>
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
