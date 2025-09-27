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
    title: "Prayer Coin",
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
      { href: "/whitepaper", label: "白皮書" },
      { href: "/disclaimer", label: "免責聲明" },
      { href: "/legacy/prayfor/details", label: "祈禱牆" }
    ]
  },
  {
    title: "聯絡",
    links: [
      { href: "/login", label: "登入" },
      { href: "/signup", label: "註冊" },
      { href: "mailto:", label: "聯絡我們" }
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

// export function SiteHeader({ activePath, hideAuthActions = false }) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const authUser = useAuthSession();

//   const current = activePath ?? pathname;

//   const isAuthenticated = Boolean(authUser);

//   const navItems = useMemo(() => {
//     if (isAuthenticated) {
//       return PRIMARY_NAV.filter((item) => item.href !== "/login" && item.href !== "/signup");
//     }
//     return PRIMARY_NAV.filter((item) => item.href !== "/customer-portal");
//   }, [isAuthenticated]);

//   // debug - 暫時印出檢查資訊（開發完請移除）
//  useEffect(() => {
//    console.log("SiteHeader debug:", { pathname, current, hideAuthActions, isAuthenticated, authUser });
// }, [pathname, current, hideAuthActions, isAuthenticated, authUser]);
  
//   const handleLogout = useCallback(() => {
//     clearAuthSession();
//     router.push("/");
//   }, [router]);

//   return (
//     <header>
//       <div className="navbar">
//         <Link className="brand" href="/" prefetch={false}>
//           <img className="brand-logo" src="/legacy/img/logo.png" alt="Prayer Coin logo" />
//           <span>Prayer Coin</span>
//         </Link>
//         <nav className="nav-links">
//           {navItems.map((item) => {
//             const isActive = current === item.href;
//             const className = isActive ? "active" : undefined;
//             return (
//               <Link key={item.href} href={item.href} prefetch={false} className={className}>
//                 {item.label}
//               </Link>
//             );
//           })}
//         </nav>
//         {!hideAuthActions && (
//           <div className="nav-actions">
//             {isAuthenticated ? (
//               <>
//                 {authUser?.name ? <span className="nav-user">Hi, {authUser.name}</span> : null}
//                 <button type="button" className="nav-link nav-link--button" onClick={handleLogout}>
//                   登出
//                 </button>
//               </>
//             ) : (
//               <>

//                 <Link href="/signup" prefetch={false} className="nav-link nav-link--primary">
//                   註冊
//                 </Link>

//                 <Link href="/login" prefetch={false} className="nav-link nav-link--button">
//                   登入
//                 </Link>
//               </>
//             )}
//           </div>
//         )}
//       </div>
//     </header>
//   );
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

  const handleLogout = useCallback(() => {
    clearAuthSession();
    router.push("/");
  }, [router]);

  return (
    <header>
      <div className="navbar">
        {/* 左邊 Logo */}
        <Link className="brand" href="/" prefetch={false}>
          <img className="brand-logo" src="/legacy/img/logo.png" alt="Prayer Coin logo" />
          <span>Prayer Coin</span>
        </Link>

        {/* 右邊 - 漢堡選單按鈕 */}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? "✖" : "☰"}
        </button>

        {/* 導覽 + 使用者選單 */}
        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          {navItems.map((item) => {
            const isActive = current === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={isActive ? "active" : undefined}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="nav-actions">
              {isAuthenticated ? (
                <>
                  {authUser?.name ? <span className="nav-user">Hi, {authUser.name}</span> : null}
                  <button type="button" className="nav-link nav-link--button" onClick={handleLogout}>
                    登出
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signup" prefetch={false} className="nav-link nav-link--primary">
                    註冊
                  </Link>
                  <Link href="/login" prefetch={false} className="nav-link nav-link--button">
                    登入
                  </Link>
                </>
              )}
            </div>
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
            <img className="footer-logo" src="/legacy/img/logo.png" alt="Prayer Coin logo" />
            <div>
              <strong>Prayer Coin</strong>
              <p>以祈禱連結世界，整合代禱、媒體與行動。</p>
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
        </div>
        <div className="footer-bottom">
          <span>&copy; 2025 Prayer Coin. All rights reserved.</span>
          <div className="footer-legal">
            <Link href="/whitepaper" prefetch={false}>
              白皮書
            </Link>
            <Link href="/disclaimer" prefetch={false}>
              免責聲明
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
  social: SOCIAL_LINKS
};

