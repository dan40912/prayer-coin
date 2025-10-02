import { SiteFooter, SiteHeader } from "@/components/site-chrome";

// 調整標題與描述，移除代幣相關字眼
export const metadata = {
  title: "Prayer Coin | 使用說明",
  description: "瞭解如何快速發起禱告需求、分享給守望夥伴，並追蹤回應進度與守望成果。"
};

// 調整 heroChecklist 移除代幣回饋，強調行動與成效
const heroChecklist = [
  "使用純文字與關鍵字清晰描述禱告重點",
  "上傳圖片與設定分享標題，提升社群曝光",
  "邀請朋友留言或語音禱告，累計守望成果" // 將代幣回饋改為累計成果
];

// 調整 steps 移除代幣相關描述
const steps = [
  {
    title: "Step 01 · 發佈禱告",
    description: "於「我的禱告」頁面填寫標題、禱告內容（200-1000 字）與關鍵字，並上傳至少 2 張圖片。",
    items: [
      "清楚描述背景與代禱要點",
      "設定禱告分類與公開/私密選項",
      "可設定優先曝光 (未來功能) 或禱告截止日" // 移除代幣提升曝光的說法
    ]
  },
  {
    title: "Step 02 · 分享與邀請守望者",
    description: "複製禱告頁面連結，邀請朋友、教會小組或線上社群加入守望。也可以直接在社群平台發佈貼文。",
    items: [
      "支援 Telegram / LINE / Messenger 等主流平台",
      "社群分享自動帶入封面圖片，更吸睛",
      "可設定守望者提醒，確保不遺漏重要請求" // 調整了提醒描述
    ]
  },
  {
    title: "Step 03 · 收集回應與影響力點數", // 將代幣改為影響力點數
    description: "守望者可用文字或**錄音 (語音)** 回應。系統自動計算語音長度與回覆數，並發放影響力點數，同時即時更新 Dashboard 數據。",
    items: [
      "語音滿 10 秒才會計入有效守望次數",
      "影響力點數可用於未來平台服務或活動", // 移除代幣的用途描述
      "即時通知最新回應與互動，保持連結"
    ]
  }
];

// 調整 dashboardChecklist 移除代幣流向
const dashboardChecklist = [
  "即時更新守望次數、語音長度與互動趨勢",
  "一鍵匯出成果報表與 QR Code 分享",
  "守望者熱區分析，了解誰正在支持你的禱告", // 新增一項內容，讓內容更豐富
  "即將推出：熱門禱告通知與自動感謝訊息"
];

// imageExamples 內容維持不變 (圖片範例) - 將「青年小組」改為「社群凝聚」
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
    alt: "社群凝聚", // <-- 調整：移除「青年小組」
    caption: "社群凝聚：分享活動照片，邀請更多陪伴與同理。" // <-- 調整：移除「青年小組」
  }
];

// 調整 faqCards 移除代幣/虛擬貨幣概念，並加入註冊與重複播放的相關問題
const faqCards = [
  { question: "如何開始使用 Prayer Coin？", answer: "您需要**註冊成為會員**才能發起禱告、留言及錄音。註冊程序僅需電子郵件或社群帳號驗證，過程快速簡便。" }, // 增加註冊相關內容
  { question: "語音多久才算有效守望？", answer: "守望者錄音需超過 **10 秒**，才會被計入有效守望次數並累積影響力點數。未達門檻的音檔仍會儲存，方便您聆聽回顧。" }, // 調整影響力點數
  { question: "我可以刪除或修改禱告內容嗎？", answer: "發佈者可隨時切換「公開 / 私密」，或提交刪除申請。禱告的歷史記錄 (守望次數、影響力點數) 將保留於您的帳戶作為紀錄。" },
  { question: "錄音可以重複播放或修改嗎？", answer: "守望者送出錄音後，發起者與守望者都可**重複播放**。但為保持記錄的真實性，語音一經送出即無法修改或刪除，請謹慎錄製。" } // 增加重複播放與錄音修改的內容
];

// 新增區塊一：非基督徒參與方式建議 (已整合到新大區塊)
const nonChristianGuide = [
    {
        icon: "💬",
        title: "真誠留言鼓勵",
        description: "即便不是用禱告的語言，一句溫暖的鼓勵、同理的留言，或給予支持的文字，對發起者都是極大的幫助。"
    },
    {
        icon: "🎧",
        title: "「語音祝福」或「心靈支持」",
        description: "您可以使用語音功能，單純送出**祝福話語**、**加油打氣**或**簡短的慰問**。平台的核心是支持與關懷，形式不拘。"
    },
    {
        icon: "🔄",
        title: "分享給合適的人",
        description: "您可以將請求分享給您認識的、願意提供精神支持或協助的人，作為一種資訊傳遞與互助的管道。"
    }
];

// 禱告任務以外的參與方式 (保留在原本的位置)
const otherParticipation = [
    {
        icon: "🤝",
        title: "發起互助請求",
        description: "除了傳統的禱告，您也可以發起一個**互助請求**，例如為需要幫忙搬家、提供專業諮詢或籌集物資的活動，尋求社群支援。"
    },
    {
        icon: "💡",
        title: "募集創意與建議",
        description: "如果您遇到生活難題或專案瓶頸，可以將此處作為**集思廣益**的平台，邀請大家用留言或語音提供不同視角的解決方案。"
    },
    {
        icon: "💖",
        title: "分享感恩與見證",
        description: "發佈您的**正面體驗、感恩事項或已實現的目標**，讓社群一起慶祝，用正向能量感染他人。"
    }
];

// 新增區塊二：基督徒禱告指引
const christianGuide = {
    title: "如果你是基督徒，你可以這樣說：",
    template: "「主耶穌阿，求祢幫助 [代禱對象或需求]，求祢賜下平安與力量，成就祢美好的旨意。請把自己最深處的想法告訴祂。」",
    points: [
        "專注於對方的需求與神的心意。",
        "將您的**最深處的想法**透過語音，真誠地與神分享。",
        "為此禱告設定一個「**回應目標**」，讓守望更有方向。"
    ]
};


export default function HowToPage() {
  return (
    <>
      <SiteHeader activePath="/howto" />

      <main>
        <section className="section hero hero-split">
          <div>
            <span className="badge-soft">使用指南</span>
            <h1>3 個步驟，啟動您的禱告任務與連結</h1>
            <p>
              Prayer Coin 致力於讓代禱資訊清晰、有序地流動：從發起禱告、邀請守望者、到接收語音回應並看見守望的**實際影響力**。
              我們將流程化繁為簡，拆成三個核心步驟，讓您快速掌握。
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
          <p>依序完成以下動作，十分鐘內即可發佈第一個禱告任務，並開始接收文字與**語音守望**。</p>
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
        <section className="section soft-bg">
          <span className="badge-soft">如果您是基督徒</span>
          <h2>主耶穌阿，我需要祢，求祢＿＿＿＿＿</h2>
               <div className="gradient-card">
                <h3>如果你是基督徒：</h3>
                <p>鼓勵您以最深處的渴慕向主。</p>
                <p style={{ fontFamily: 'serif', fontStyle: 'italic', fontWeight: 'bold', borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                    {christianGuide.template}
                </p>
                <ul className="checklist">
                    {christianGuide.points.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </div>
        </section>
        {/* --- 新增區塊一：非基督徒友善指南 (大標題: 我希望_____) --- */}
        <section className="section soft-bg">
          <span className="badge-soft">如果您沒有信仰</span>
          <h2>我希望＿＿＿＿＿</h2>
          <p>Prayer Coin 是一個支持與關懷的平台，不論您是否具有信仰，都可以用真誠的心來表達您的願望、祝福或給予支持。我們的核心價值是愛與陪伴。</p>
          <div className="layout-grid columns-2" style={{ marginTop: "1.5rem" }}>
            <div className="gradient-card">
                
                <p>將您的**祝福話語、加油打氣或簡短的慰問**錄製下來。將「守望」視為一種**溫暖的陪伴**，用最真實的聲音給予支持。</p>
                <ul className="checklist">
                    {nonChristianGuide.map((item) => (
                        <li key={item.title}><strong>{item.title}:</strong> {item.description}</li>
                    ))}
                </ul>
            </div>          
          </div>
        </section>
        
        {/* ------------------------------------------------------------------- */}

        <section className="section">
          <div className="media-feature">
            <img
              src="/img/dashboard.png"
              alt="Dashboard 示意"
            />
            <div>
              <span className="badge-soft">儀表板</span>
              <h2>用儀表板掌握守望互動成效</h2>
              <p>
                登入後即可在 **Dashboard** 查看您所有禱告的列表、詳細的**守望者人數統計**、**語音總時長**、影響力點數累積與守望者活動熱區。這些數據將幫助您更具體地評估禱告的影響力與廣度。
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
          <h2>Prayer Coin 不只是禱告：擴展你的任務類型</h2>
          <p>除了傳統的信仰代禱，您也可以利用本平台的架構，來發起更廣泛的互助、資源募集或心靈支持任務。</p>
          <div className="icon-step-grid columns-3">
            {otherParticipation.map((item) => (
              <div key={item.title} className="icon-card">
                <div className="icon-lg">{item.icon}</div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>常見情境與建議</h2>
          <p>一個清晰且富有情感的禱告圖片，能大幅提升守望者的參與意願。以下範例圖片取自 Unsplash，為您的禱告呈現提供靈感。無論是家庭、醫療、宣教或社群議題，都能找到合適的呈現方式。</p>
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