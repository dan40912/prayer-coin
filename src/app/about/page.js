import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata = {
  title: "Start Pray | 關於我們 | 禱告幣",
  // 優化：強調解決「無聲的呼求」與「不知如何回應」的困境
  description: "認識 Start Pray 的使命、核心價值與團隊故事。我們正在將無聲的禱告，轉化為可被看見、被回應的溫暖行動。"
};

const coreValues = [
  { title: "真實陪伴", description: "結合文字與語音禱告，讓彼此的生命故事被聽見，取代快速、片段的社群互動。" },
  { title: "透明信任", description: "以區塊鏈紀錄代幣發放與消耗，打造可追蹤、可驗證的守望流程。" },
  { title: "共享資源", description: "提供 API 與 SDK，讓教會、非營利組織與開發者能快速串接，延伸祈禱網絡。" },
  { title: "合規守護", description: "遵循區域法規、重視資料隱私，確保每筆禱告、每次代幣交易都在安全環境中進行。" }
];


const imageHighlights = [
  {
    src: "/img/categories/world.jpg",
    alt: "世界局勢",
    caption: "為了世界局勢和福音的廣傳，我們來禱告"
  },
  {
    src: "/img/categories/personal.jpg",
    alt: "個人狀況",
    caption: "和彼得， 我們不願意漏掉任何一位"
  },
  {
    src: "/img/categories/gospel.jpg",
    alt: "福音",
    caption: "為了福音的廣傳"
  }
];

const milestones = [
  { title: "2025 09 · Private Beta", description: "因為大失眠和禱告後的感覺，完成第一版禱告牆、語音禱告功能" },
  { title: "2025 10 · Global Rollout", description: "10 開發基礎功能 和社群測試" },
  { title: "2025 11 · 上GCP和購買正式URL", description: "徵求有意願參加的行銷或開發人員" },
  { title: "2025 12 · 預備英文網站", description: "徵求翻譯 或 管理員" },
  { title: "2026 01 · 上Github 開源", description: "提供非錢包版本給大家使用" },
  { title: "2026 02 · 上鏈 ! 準備發送代幣", description: "上Binance Alpha" },
  { title: "2026 05 · 銷毀代幣", description: "持有數量減少" },
  { title: "2026 07 · 預備區塊鏈代禱事項蒐尋器", description: "環境搭建預計五個月" },
];

// 創建新的資訊結構，取代舊的 teamFocuses
const engagementPoints = [
    {
        icon: "💖", // 捐款與支持圖標
        title: "非營利模式與透明捐贈",
        description: "Start Pray **不收取任何費用**。若您願意支持平臺運行，我們接受 **USDT** 或 Email 聯繫直接捐贈。您將收到平臺運營的**透明帳目報告**。"
    },
    {
        icon: "🤝", // 合作與管理圖標
        title: "社群管理員招募",
        description: "我們歡迎有熱忱的夥伴加入管理團隊。管理員資格將依據個人在社群中的**貢獻度與服務意願**來評估與授予，共同守護這個溫暖的空間。"
    },
    {
        icon: "⛪", // 教會合作圖標
        title: "系統複製與教會合作",
        description: "我們提供系統複製服務，讓您的教會組織也能擁有專屬的語音禱告平臺。請透過 Email 聯繫我們，瞭解詳細的**合作與技術支援方案**。"
    }
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader activePath="/about" />

      <main>
        {/* --- 英雄區塊：強化痛點與解決方案 --- */}
        <section className="section hero hero-split">
          <div>
            <span className="badge-soft">我們的故事 (OUR STORY)</span>
            {/* 優化標題：直指痛點，點出解決方案的核心價值 */}
            <h1>我們都在 Let's Pray For You !</h1>
            <p>
              {/* 優化文案：更強調「無從開始幫助」的解決方案 */}
              你需要別人的禱告嗎? 你想聽聽別人為你禱告和祝福嗎? 
          
            </p>
          </div>
          <div className="hero-media">
            <img
              src="/img/voice.png"
              alt="團隊禱告與協作"
            />
          </div>
        </section>
               <section className="section">
          <div className="media-feature">
            <div>
              <span className="badge-soft">你曾經這樣嗎? </span>
              <h2>有待禱事項，有心卻不知道從何禱告起? </h2>
              <p>
                {/* 優化文案：將痛點轉化為使命的起點 */}
                只說一句阿們很敷衍，但我不知道怎麼更深層的幫助別人，或是進入他的負擔裡面，希望我能夠透過聲音和文字，更多的幫助和參與到這個事項中。
              </p>
            </div>
            <img
              src="img/pray.png"
              alt="全球禱告社群"
            />
          </div>
        </section>
        {/* <section className="section">
          <h2>我們的核心價值</h2>
          <p>從禱告到行動，我們以四個關鍵價值推動 Start Pray 的產品發展與社群文化。我們深知**真誠的陪伴**是解決冷漠的最佳良藥。</p>
          <div className="layout-grid columns-2" style={{ marginTop: "1.5rem" }}>
            {coreValues.map((value) => (
              <div key={value.title} className="gradient-card">
                <strong>{value.title}</strong>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </section> */}

        {/* --- 使命區塊：深化連結與影響力 --- */}
       

        <section className="section">
          <h2>禱告事項</h2>
          <p>
            您將會看到這樣的真實光景：**每一個需要幫助的人，都會有回應的聲音。
          </p>
          <div className="image-grid" style={{ marginTop: "1.5rem" }}>
            {imageHighlights.map((item) => (
              <div key={item.caption} className="image-card">
                <img src={item.src} alt={item.alt} />
                <div className="image-caption">{item.caption}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>發展里程碑</h2>
          <p>我們正在邁向開放治理與更廣泛的全球合作，每一個里程碑都是社群共同的成果，**確保平臺能長遠、可靠地承載每一個生命的需求**。</p>
          <div className="timeline">
            {milestones.map((milestone) => (
              <div key={milestone.title} className="timeline-item">
                <strong>{milestone.title}</strong>
                <p>{milestone.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- 新增區塊：參與方式與透明承諾 (取代舊的團隊焦點) --- */}
        <section className="section section-large"> {/* section-large 讓這個重要區塊上下留白更多 */}
            <h2 className="text-center">參與方式與透明承諾</h2>
            <p className="text-center lead-text">Start Pray 是一個以奉獻為基礎的平臺。我們不收費，但邀請您以不同方式成為這個使命的一部分。</p>
            <div className="icon-grid columns-3" style={{ marginTop: "2.5rem" }}> {/* 替換為 icon-grid，讓圖標和文字更集中 */}
                {engagementPoints.map((point) => (
                    <div key={point.title} className="card-icon-top card-shadow-hover"> {/* 增加 card-shadow-hover 增加互動性 */}
                        <div className="icon-lg icon-theme-color">{point.icon}</div> {/* 使用 emoji 作為圖標，並設定主題色 */}
                        <strong>{point.title}</strong>
                        <p>{point.description}</p>
                    </div>
                ))}
            </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}