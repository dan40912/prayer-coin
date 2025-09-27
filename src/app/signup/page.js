import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";

import SignupForm from "./SignupForm";

export const metadata = {
  title: "Prayer Coin | 註冊帳戶",
  description: "幾分鐘完成註冊，立即發布禱告、接受語音回應並獲得代幣激勵。"
};

const stepItems = [
  {
    index: "1",
    title: "填寫基本資訊",
    description: "提供姓名、信仰與國家，幫助我們維護社群安全。"
  },
  {
    index: "2",
    title: "綁定 Solana 收款錢包",
    description: "禱告互動獎勵將自動發放至你的地址。"
  },
  {
    index: "3",
    title: "啟動祈禱任務",
    description: "建立禱告、邀請守望者，用語音與文字陪伴彼此。"
  }
];

const heroStats = [
  { label: "已提交禱告", value: "38,420+" },
  { label: "社群語音禱告", value: "126,800 秒" },
  { label: "代幣發放成功率", value: "99.8%" }
];

const kycReasons = [
  "確保語音禱告與代幣獎勵的真實性與可追溯性。",
  "協助我們遵循區塊鏈與慈善相關的在地合規。",
  "保護社群安全，防止惡意註冊或資金詐騙。"
];

const postSignupBenefits = [
  "建立禱告、邀請他人以文字或語音回應。",
  "透過客製化圖片與標題，優化社群分享。",
  "在 Dashboard 追蹤代幣流向、曝光成效與互動。"
];

export default function SignupPage() {
  return (
    <>
      <SiteHeader activePath="/signup" />

      <main>
        <div className="auth-wrapper">
          <div className="auth-grid">
            <section className="auth-card auth-hero">
              <div>
                <span className="badge-mini">STEP 1 · KYC Onboarding</span>
                <h1>加入禱告與陪伴的生態</h1>
                <p>幾分鐘完成註冊，立即發布禱告、接受語音回應，並透過代幣獲得激勵。</p>
              </div>

              <div className="stepper">
                {stepItems.map((step) => (
                  <div key={step.index} className="step-item">
                    <div className="step-index">{step.index}</div>
                    <div className="step-body">
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hero-stats">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="hero-stat">
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="auth-card">
              <div>
                <h1>建立 Prayer Coin 帳戶</h1>
                <p>完成基本資料與 KYC 項目，進一步體驗禱告分享、語音回應與代幣激勵。</p>
              </div>

              <div className="social-buttons">
                <button className="social-button google" type="button">
                  使用 Google 註冊
                </button>
                <button className="social-button facebook" type="button">
                  使用 Facebook 註冊
                </button>
              </div>

              <div className="auth-divider">或使用電子信箱註冊</div>

              <SignupForm />

              <div className="auth-footer">
                <span>
                  已經有禱告帳戶？<Link href="/login" prefetch={false}>前往登入</Link>。
                </span>
              </div>
            </section>

            <aside className="auth-card">
              <div className="auth-note">
                <strong>為何需要 KYC？</strong>
                <ul className="auth-meta-list">
                  {kycReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
              <div className="auth-note">
                <strong>註冊完成後可以做什麼？</strong>
                <ul className="auth-meta-list">
                  {postSignupBenefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
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

