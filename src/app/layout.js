import "./globals.css";
import "@/styles/admin.css";
import { headers } from "next/headers";
import { Open_Sans, Raleway, Poppins } from "next/font/google";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { readSiteSettings } from "@/lib/siteSettings";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-sans" });
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Start Pray",
  description: "Start Pray 讓我們一同禱告、陪伴與連結。",
};

export const dynamic = "force-dynamic";

function extractPathFromHeaders(requestHeaders) {
  const candidates = [
    requestHeaders.get("x-invoke-path"),
    requestHeaders.get("next-url"),
    requestHeaders.get("referer"),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    if (candidate.startsWith("/")) {
      return candidate;
    }

    try {
      const parsed = new URL(candidate, "http://localhost");
      if (parsed.pathname) {
        return parsed.pathname;
      }
    } catch (error) {
      // ignore malformed values
    }
  }

  return "/";
}

function shouldBypassMaintenance(pathname) {
  if (!pathname) return false;
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  );
}

export default async function RootLayout({ children }) {
  const requestHeaders = headers();
  const requestPath = extractPathFromHeaders(requestHeaders);

  if (!shouldBypassMaintenance(requestPath)) {
    const settings = await readSiteSettings();
    if (settings?.maintenanceMode) {
      return (
        <html lang="zh-Hant" className={`${openSans.variable} ${raleway.variable} ${poppins.variable}`}>
          <body className="admin-layout">
            <SiteHeader />
            <div
              style={{
                minHeight: "80vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4rem 1.5rem",
                background: "linear-gradient(160deg, rgba(15, 23, 42, 0.92), rgba(37, 99, 235, 0.65))",
              }}
            >
              <div
                style={{
                  maxWidth: "640px",
                  width: "100%",
                  background: "rgba(8, 13, 25, 0.85)",
                  borderRadius: "1.6rem",
                  padding: "3rem",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  boxShadow: "0 24px 48px rgba(8, 15, 30, 0.35)",
                  display: "grid",
                  gap: "1.75rem",
                  textAlign: "center",
                  color: "#f8fafc",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "4rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: "#38bdf8",
                    }}
                  >
                    Server 500 Error
                  </div>
                  <h1 style={{ marginBottom: "1rem" }}>系統維修中，請幫我們禱告盡快修好...</h1>
                  <p style={{ lineHeight: 1.8 }}>
                    我們目前正在維修中，敬請期待我們很快回來！如果您有任何緊急問題，請聯絡我們。
                  </p>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <a
                    href="mailto:startpraynow@gmail.com"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.8rem 1.4rem",
                      borderRadius: "0.9rem",
                      border: "none",
                      background: "linear-gradient(120deg, #0ea5e9, #38bdf8)",
                      color: "#02121f",
                      fontWeight: 600,
                    }}
                  >
                    發送 Email
                  </a>
                </div>
              </div>
            </div>
            <SiteFooter />
          </body>
        </html>
      );
    }
  }

  return (
    <html lang="zh-Hant" className={`${openSans.variable} ${raleway.variable} ${poppins.variable}`}>
      <body className="admin-layout">{children}</body>
    </html>
  );
}
