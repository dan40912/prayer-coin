import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";

const wrapperStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(14, 165, 233, 0.12))",
  display: "flex",
  flexDirection: "column"
};

const cardStyle = {
  maxWidth: "620px",
  width: "100%",
  background: "var(--surface)",
  borderRadius: "1.5rem",
  padding: "3rem",
  boxShadow: "var(--shadow)",
  border: "1px solid var(--border-soft)",
  display: "grid",
  gap: "1.75rem",
  textAlign: "center"
};

const errorCodeStyle = {
  fontSize: "5rem",
  fontWeight: 700,
  color: "var(--accent)",
  letterSpacing: "0.1em"
};

export default function NotFound() {
  return (
    <div style={wrapperStyle}>
      <SiteHeader />

      <div className="error-wrapper" style={{ flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem 1.5rem" }}>
        <div className="error-card" style={cardStyle}>
          <div>
            <div className="error-code" style={errorCodeStyle}>
              404
            </div>
            <h1>啊！禱告頁面迷路了</h1>
            <p>您造訪的連結可能已下架、重新命名或暫時無法使用。請確認 URL 是否正確，或透過以下連結回到熟悉的地方。</p>
          </div>
          <div className="error-actions" style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link className="btn btn-primary" href="/" prefetch={false}>
              返回首頁
            </Link>
            <Link className="btn btn-outline" href="/legacy/prayfor/details" prefetch={false}>
              前往禱告牆
            </Link>
            <a className="btn btn-outline" href="mailto:support@prayercoin.app">
              聯絡支援
            </a>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
