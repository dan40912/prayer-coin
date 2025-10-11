import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import SignupForm from "./SignupForm";

export const metadata = {
  title: "Start Pray | 註冊帳戶",
  description: "把你的聲音分享出去，讓別人聽見並回應，在陪伴中得到力量。"
};

const stepItems = [
  {
    index: "1",
    title: "分享你的聲音",
    description: "錄下禱告或心聲，勇敢說出你的需要。"
  },
  {
    index: "2",
    title: "有人會聽見",
    description: "你的聲音不會孤單，社群會真實回應。"
  },
  {
    index: "3",
    title: "彼此陪伴",
    description: "透過語音與文字交流，建立溫暖的連結。"
  }
];

const heroStats = [
  { label: "已提交禱告", value: "38,420+" },
  { label: "社群語音禱告", value: "126,800 秒" },
  { label: "彼此陪伴成功率", value: "99.8%" }
];

const signupReasons = [
  "讓每一個聲音都來自真實的你。",
  "給彼此安心的環境，放心分享心聲。",
  "保護社群安全，避免惡意註冊。"
];

const postSignupBenefits = [
  "立即錄下你的禱告或心聲，讓人聽見並回應。",
  "收到來自社群的語音與文字陪伴。",
  "在 Dashboard 追蹤你的分享與互動成效。"
];

export default function SignupPage() {
  return (
    <>
      <SiteHeader activePath="/signup" />

      <main>
        <div className="auth-wrapper">
          <div className="auth-grid">
            {/* Hero Section */}
            <section className="auth-card auth-hero">
              <div>
                <span className="badge-mini">STEP 1 · 分享你的聲音</span>
                <h1>讓你的聲音被聽見</h1>
                <p>
                  只要幾分鐘，分享你的禱告或心聲，別人就能透過語音回應，
                  給你真實的陪伴與支持。
                </p>
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

              {/* <div className="hero-stats">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="hero-stat">
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                  </div>
                ))}
              </div> */}
            </section>

            {/* Signup Section */}
            <section className="auth-card">
              <div>
                <h1>建立 Start Pray 帳戶</h1>
                <p>
                  註冊後你可以立即錄下禱告，讓別人聽見並回應，從陪伴中獲得力量。
                </p>
              </div>
{/* 
              <div className="social-buttons">
                <button className="social-button google" type="button">
                  使用 Google 註冊
                </button>
                <button className="social-button facebook" type="button">
                  使用 Facebook 註冊
                </button>
              </div> */}
{/* 
              <div className="auth-divider">或使用電子信箱註冊</div> */}

              <SignupForm />

              <div className="auth-footer">
                <span>
                  已經有禱告帳戶？
                  <Link href="/login" prefetch={false}>
                    前往登入
                  </Link>
                  。
                </span>
              </div>
            </section>

            {/* Side Notes */}
            {/* <aside className="auth-card">
              <div className="auth-note">
                <strong>為什麼需要註冊？</strong>
                <ul className="auth-meta-list">
                  {signupReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
              <div className="auth-note">
                <strong>註冊後你可以做什麼？</strong>
                <ul className="auth-meta-list">
                  {postSignupBenefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </aside> */}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
