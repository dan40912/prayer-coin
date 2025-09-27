import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";

import LoginForm from "./LoginForm";

export const metadata = {
  title: "Prayer Coin | 登入",
  description: "登入 Prayer Coin 管理禱告內容、追蹤互動數據並查看代幣紀錄。"
};

const securityTips = [
  "建議啟用 MFA 或 WebAuthn，保護個人資料與代幣資產。",
  "陌生裝置登入時，系統會寄送通知到您的電子信箱。",
  "客服不會主動索取密碼或助記詞，如遇可疑請立即回報。"
];

const managementHighlights = [
  "建立或編輯禱告：支援純文字 200–1000 字範圍。",
  "圖片管理：封面 + 敘事至少兩張，提升社群分享成效。",
  "代幣動態：掌握語音禱告獎勵、曝光加值與使用紀錄。"
];

export default function LoginPage() {
  return (
    <>
      <SiteHeader activePath="/login" />

      <main>
        <div className="auth-wrapper">
          <div className="auth-grid">
            <section className="auth-card">
              <div>
                <h1>歡迎回來</h1>
                <p>登入後即可管理禱告內容、追蹤互動數據並查看代幣餘額。</p>
              </div>

              {/* <div className="social-buttons">
                <button className="social-button google" type="button">
                  使用 Google 登入
                </button>
                <button className="social-button facebook" type="button">
                  使用 Facebook 登入
                </button>
              </div> */}

              {/* <div className="auth-divider">或使用電子信箱登入</div> */}

              <LoginForm />

              <div className="auth-footer">
                <span>
                  還沒有帳號？前往 <Link href="/signup">註冊 Prayer Coin</Link>。
                </span>
              </div>
            </section>

            <aside className="auth-card">
              <div className="auth-note">
                <strong>登入安全提醒</strong>
                <ul className="auth-meta-list">
                  {securityTips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
              <div className="auth-note">
                <strong>禱告管理快速導覽</strong>
                <ul className="auth-meta-list">
                  {managementHighlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
