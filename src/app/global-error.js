"use client";

import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(160deg, rgba(15, 23, 42, 0.92), rgba(37, 99, 235, 0.65))",
  display: "flex",
  flexDirection: "column"
};

const cardStyle = {
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
  color: "#f8fafc"
};

const errorCodeStyle = {
  fontSize: "5rem",
  fontWeight: 700,
  letterSpacing: "0.1em",
  color: "#38bdf8"
};

const outlineButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.8rem 1.4rem",
  borderRadius: "0.9rem",
  border: "1px solid rgba(148, 163, 184, 0.5)",
  color: "#f8fafc",
  fontWeight: 600,
  background: "transparent",
  cursor: "pointer"
};

export default function GlobalError({ reset }) {
  return (
    <html lang="zh-Hant">
      <body style={pageStyle}>
        <SiteHeader />

        <div className="error-wrapper" style={{ flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem 1.5rem" }}>
          <div className="error-card" style={cardStyle}>
            <div>
              <div className="error-code" style={errorCodeStyle}>
                500
              </div>
              <h1>伺服器暫時無法回應</h1>
              <p>我們的禱告節點目前正忙著處理大量請求或進行維護。請稍候片刻再嘗試，或透過以下方式取得協助。</p>
            </div>
            <div className="error-actions" style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
              <Link
                href="/"
                prefetch={false}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.8rem 1.4rem",
                  borderRadius: "0.9rem",
                  border: "none",
                  background: "linear-gradient(120deg, #0ea5e9, #38bdf8)",
                  color: "#02121f",
                  fontWeight: 600
                }}
              >
                返回首頁
              </Link>
              <button
                type="button"
                style={outlineButtonStyle}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.reload();
                  }
                  reset();
                }}
              >
                重新整理
              </button>
              <a href="mailto:support@prayercoin.app" style={outlineButtonStyle}>
                聯絡支援
              </a>
            </div>
            <div
              className="auth-note"
              style={{
                background: "rgba(15, 23, 42, 0.45)",
                border: "1px solid rgba(148, 163, 184, 0.35)",
                borderRadius: "1rem",
                padding: "1.5rem",
                textAlign: "left"
              }}
            >
              <strong>我們正在努力恢復服務</strong>
              <ul className="auth-meta-list" style={{ color: "rgba(226, 232, 240, 0.85)" }}>
                <li>自動警示已通知維運團隊。</li>
                <li>代幣鏈上交易不受此事件影響。</li>
                <li>如有急迫需求，請提供您的禱告 ID 與錯誤時間。</li>
              </ul>
            </div>
          </div>
        </div>

        <SiteFooter />
      </body>
    </html>
  );
}
