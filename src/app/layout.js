import "./globals.css";
import "@/styles/theme-modern.css";
import "@/styles/admin.css";
import { headers } from "next/headers";
import { Open_Sans, Raleway, Poppins } from "next/font/google";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import GlobalPlayerGate from "@/components/GlobalPlayerGate";
import { AudioProvider } from "@/context/AudioContext";
import { readSiteSettings } from "@/lib/siteSettings";
import { SITE_NAME, SITE_URL, absoluteUrl, buildPageMetadata } from "@/lib/seo";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-sans" });
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  ...buildPageMetadata({
    title: {
      default: "Start Pray 一起禱告吧",
      template: `%s | ${SITE_NAME}`,
    },
    description: "Start Pray 是一個讓人分享代禱事項、用文字與語音彼此回應，並看見得勝者故事的禱告平台。",
    path: "/",
  }),
  applicationName: SITE_NAME,
  category: "faith community",
  keywords: ["Start Pray", "禱告", "代禱", "基督信仰", "見證", "得勝者", "語音禱告"],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    telephone: false,
  },
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
    } catch {
      // Ignore malformed values.
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

function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "zh-Hant-TW",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/prayfor?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
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
          <head>
            <meta name="robots" content="noindex,nofollow" />
            <link
              rel="stylesheet"
              href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
              referrerPolicy="no-referrer"
            />
          </head>
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
                    維護中
                  </div>
                  <h1 style={{ marginBottom: "1rem" }}>Start Pray 暫時維護中</h1>
                  <p style={{ lineHeight: 1.8 }}>
                    我們正在調整服務，請稍後再回來。若有緊急需求，請聯絡客服信箱。
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
                    聯絡客服
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
      <head>
        <link rel="canonical" href={absoluteUrl(requestPath || "/")} />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="admin-layout">
        <StructuredData />
        <AudioProvider>
          {children}
          <GlobalPlayerGate />
        </AudioProvider>
      </body>
    </html>
  );
}
