import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata = {
  title: "使用條款 | Start Pray 一起禱告吧",
  description: "了解 Start Pray 的使用方式、隱私保護、內容截圖分享與安全提醒。",
};

const TERMS = [
  {
    title: "平台用途",
    body:
      "Start Pray 是提供代禱、陪伴與回應的社群平台。你可以分享代禱事項，也可以用文字或語音回應別人的需要。請用尊重、真實、不傷害他人的方式使用這個平台。",
  },
  {
    title: "不是專業服務",
    body:
      "平台上的內容與回應不等同於醫療、法律、心理諮商、財務或其他專業建議。如果你正在面對緊急危機，請立即聯絡當地緊急服務、可信任的親友、教會同工或專業人員。",
  },
  {
    title: "內容責任",
    body:
      "使用者需自行確認分享內容是否適合公開。請不要公開他人的個人資料、聯絡方式、住址、醫療紀錄、家庭細節或任何可能造成危險的資訊。",
  },
];

const PRIVACY = [
  {
    title: "我們不會販售個人資訊",
    body:
      "Start Pray 不會販售、出租或交換你的個人資訊。平台只會在提供登入、建立代禱卡、顯示回應、管理內容與維護安全所需的範圍內使用資料。",
  },
  {
    title: "請盡量保護自己",
    body:
      "如果你希望降低被辨識的可能，建議使用匿名名稱註冊，避免使用真實姓名、個人照片、私人地址、電話或可追蹤到你現實身分的資訊。",
  },
  {
    title: "私密代禱",
    body:
      "建立代禱卡時，你可以選擇私密模式。私密代禱不會公開標題、內容、圖片、上傳者與詳情頁，只會保留匿名的大致位置光點，讓社群知道有人需要被守望。",
  },
];

const SHARING = [
  {
    title: "可能會被截圖分享",
    body:
      "公開頁面上的代禱內容、回應、得勝故事或平台畫面，可能會被使用者、管理者或社群成員截圖，並分享到社群網站、通訊軟體或教會群組中。",
  },
  {
    title: "平台宣傳與見證整理",
    body:
      "為了介紹平台、分享見證或邀請更多人一起代禱，Start Pray 可能會使用公開頁面的截圖或畫面片段。若涉及敏感內容，我們會盡量避免呈現可辨識個人身分的資訊。",
  },
  {
    title: "如果你不希望被公開",
    body:
      "請使用匿名帳號、避免填寫可辨識資訊，並優先使用私密代禱。若你發現不適合公開的內容，請聯絡我們協助處理。",
  },
];

const SAFETY = [
  "不要公開住址、電話、身分證件、醫療紀錄、金融資訊或他人的私人資料。",
  "不要冒用他人身分，也不要替別人公開敏感故事。",
  "遇到疑似騷擾、詐騙、冒用或不適當內容，請使用檢舉功能或聯絡管理者。",
  "平台會盡力維護資料安全，但網路服務不可能保證永遠不中斷或完全沒有錯誤。",
];

export default function TermsPage() {
  return (
    <>
      <SiteHeader activePath="/whitepaper" />
      <main className="whitepaper-page">
        <section className="whitepaper-hero">
          <div>
            <p className="whitepaper-hero__eyebrow">Terms & Safety</p>
            <h1>Start Pray 使用條款</h1>
            <p>
              這份條款用簡單的方式說明平台如何使用、我們如何看待隱私，以及你在分享代禱事項前需要知道的安全提醒。
            </p>
          </div>
          <div className="whitepaper-hero__stats" aria-label="條款重點">
            <div>
              <span>Privacy</span>
              <strong>不販售個資</strong>
            </div>
            <div>
              <span>Safety</span>
              <strong>建議匿名</strong>
            </div>
            <div>
              <span>Sharing</span>
              <strong>公開內容可能被截圖</strong>
            </div>
          </div>
        </section>

        <section className="whitepaper-section">
          <div className="whitepaper-section__header">
            <h2>使用原則</h2>
            <p>Start Pray 是為了陪伴與守望而存在。請讓你的使用方式也保留這份溫柔。</p>
          </div>
          <div className="whitepaper-grid">
            {TERMS.map((item) => (
              <article key={item.title} className="whitepaper-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="whitepaper-section">
          <div className="whitepaper-section__header">
            <h2>個人資訊與匿名建議</h2>
            <p>你可以分享需要，但不需要把自己的真實身分完全暴露出來。</p>
          </div>
          <div className="whitepaper-grid">
            {PRIVACY.map((item) => (
              <article key={item.title} className="whitepaper-card whitepaper-card--outline">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="whitepaper-section">
          <div className="whitepaper-section__header">
            <h2>公開內容與截圖分享</h2>
            <p>請把公開頁面視為可能被轉傳的內容。分享前，先替自己和身邊的人多想一步。</p>
          </div>
          <div className="whitepaper-grid">
            {SHARING.map((item) => (
              <article key={item.title} className="whitepaper-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="whitepaper-section">
          <div className="whitepaper-section__header">
            <h2>安全提醒</h2>
            <p>這些提醒不是為了讓你害怕，而是為了讓平台可以更安全地承載真實需要。</p>
          </div>
          <div className="whitepaper-card whitepaper-card--outline">
            <ul>
              {SAFETY.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="whitepaper-download">
          <div>
            <h2>需要協助？</h2>
            <p>
              如果你想刪除內容、回報不適當截圖、處理隱私疑慮，或需要管理者協助，請聯絡我們。
            </p>
          </div>
          <div className="whitepaper-download__actions">
            <a className="button button--primary" href="mailto:startpraynow@gmail.com">
              聯絡 Start Pray
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
