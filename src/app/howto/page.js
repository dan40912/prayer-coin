import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata = {
  title: "Prayer Coin | 使用說明",
  description: "瞭解如何快速建立禱告、分享給守望者並追蹤回應成效。"
};

const heroChecklist = [
  "使用純文字與關鍵字描述禱告需求",
  "上傳圖片與設定分享標題，提升曝光",
  "邀請朋友留言或語音禱告，獲得代幣回饋"
];

const steps = [
  {
    title: "Step 01 · 建立禱告",
    description: "於「我的禱告」頁面填寫標題、禱告內容（200-1000 字）與關鍵字，並上傳至少 2 張圖片。",
    items: [
      "清楚描述背景與代禱要點",
      "設定禱告分類與曝光選項",
      "選擇是否使用代幣提升曝光"
    ]
  },
  {
    title: "Step 02 · 分享給守望者",
    description: "複製禱告頁面連結，邀請朋友、教會小組或線上社群加入守望。也可以直接在社群貼文分享。",
    items: [
      "支援 Telegram / LINE / Messenger",
      "社群分享自動帶入封面圖片",
      "可設定禱告截止時間與提醒"
    ]
  },
  {
    title: "Step 03 · 收集回應與代幣",
    description: "守望者可用文字或語音回應，系統自動判斷語音長度並發放代幣，同時更新 Dashboard 數據。",
    items: [
      "語音滿 10 秒才會計入有效次數",
      "代幣可用於提升禱告曝光或捐出",
      "即時通知最新回應與互動"
    ]
  }
];

const dashboardChecklist = [
  "即時更新回應次數、語音長度與互動趨勢",
  "一鍵匯出報表與 QR Code 分享",
  "即將推出：熱門禱告通知與自動感謝訊息"
];

const imageExamples = [
  {
    src: "https://images.unsplash.com/photo-1523289333742-be1143f6b766?auto=format&fit=crop&w=900&q=80",
    alt: "家庭守望",
    caption: "家庭守望：用圖片呈現成員合照與禱告焦點。"
  },
  {
    src: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=900&q=80",
    alt: "醫療團隊",
    caption: "醫療團隊：告訴守望者如何為前線人員禱告。"
  },
  {
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
    alt: "青年小組",
    caption: "青年小組：分享活動照片，邀請更多陪伴與同理。"
  }
];

const faqCards = [
  { question: "忘記密碼怎麼辦？", answer: "請在登入頁面選擇「忘記密碼」，輸入信箱後會收到重設連結。若未收到，請檢查垃圾信或聯絡客服。" },
  { question: "語音多久才算有效？", answer: "語音需超過 10 秒才會記錄並發放代幣。未達門檻仍會儲存音檔，方便守望者回顧。" },
  { question: "可以刪除禱告嗎？", answer: "發佈者可隨時切換「公開 / 私密」，或提交刪除申請。已發放的代幣紀錄將保留於帳戶。" },
  { question: "代幣如何使用？", answer: "可用於提升禱告曝光度、捐贈給公益祈禱池，或參與未來的 DAO 治理提案。" }
];

export default function HowToPage() {
  return (
    <>
      <SiteHeader activePath="/howto" />

      <main>
        <section className="section hero hero-split">
          <div>
            <span className="badge-soft">GUIDE</span>
            <h1>3 個步驟，啟動你的禱告任務</h1>
            <p>
              Prayer Coin 讓代禱資訊有秩序地流動：建立禱告、分享給守望者、聆聽語音回應並回饋代幣。
              我們將流程拆成簡單的三個步驟，快速上手。
            </p>
            <ul className="checklist">
              {heroChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="hero-media">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
              alt="使用 Prayer Coin 的示意圖"
            />
          </div>
        </section>

        <section className="section">
          <h2>快速開始 · Step by Step</h2>
          <p>依序完成以下動作，十分鐘內即可發佈第一個禱告任務並啟動語音禱告回饋。</p>
          <div className="icon-step-grid">
            {steps.map((step) => (
              <div key={step.title} className="icon-step">
                <strong>{step.title}</strong>
                <p>{step.description}</p>
                <ul className="checklist">
                  {step.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="media-feature">
            <img
              src="https://images.unsplash.com/photo-1519181245277-cffeb31da2fb?auto=format&fit=crop&w=1200&q=80"
              alt="Dashboard 示意"
            />
            <div>
              <span className="badge-soft">DASHBOARD</span>
              <h2>用儀表板掌握禱告成效</h2>
              <p>
                登入後可在 Dashboard 查看禱告列表、語音統計、代幣流向與守望者活動熱區，協助你評估禱告影響力並安排後續行動。
              </p>
              <ul className="checklist">
                {dashboardChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>常見情境與建議</h2>
          <p>以下範例圖片取自 Unsplash，提供你規劃祈禱內容時的靈感。無論家庭、醫療、宣教或青年議題，都能找到合適的呈現方式。</p>
          <div className="image-grid" style={{ marginTop: "1.5rem" }}>
            {imageExamples.map((item) => (
              <div key={item.caption} className="image-card">
                <img src={item.src} alt={item.alt} />
                <div className="image-caption">{item.caption}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>祈禱流程圖</h2>
          <p>以下流程概念示意未來可插入資訊圖或影片，協助初次接觸 Prayer Coin 的使用者快速理解。</p>
          <div className="placeholder" aria-hidden="true" style={{ minHeight: "240px" }} />
        </section>

        <section className="section">
          <h2>常見問題</h2>
          <div className="layout-grid columns-2" style={{ marginTop: "1.5rem" }}>
            {faqCards.map((card) => (
              <div key={card.question} className="gradient-card">
                <strong>{card.question}</strong>
                <p>{card.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
