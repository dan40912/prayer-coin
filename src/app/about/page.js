import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata = {
  title: "Prayer Coin | 關於我們",
  description: "認識 Prayer Coin 的使命、核心價值與團隊故事。"
};

const heroChecklist = [
  "建立安全的禱告發佈與回應流程，避免信息被遺忘",
  "透過代幣鼓勵持續的陪伴與語音禱告",
  "提供教會、機構、個人都能使用的開放生態"
];

const coreValues = [
  { title: "真實陪伴", description: "結合文字與語音禱告，讓彼此的生命故事被聽見，取代快速、片段的社群互動。" },
  { title: "透明信任", description: "以區塊鏈紀錄代幣發放與消耗，打造可追蹤、可驗證的守望流程。" },
  { title: "共享資源", description: "提供 API 與 SDK，讓教會、非營利組織與開發者能快速串接，延伸祈禱網絡。" },
  { title: "合規守護", description: "遵循區域法規、重視資料隱私，確保每筆禱告、每次代幣交易都在安全環境中進行。" }
];

const missionChecklist = [
  "Beta 測試涵蓋 12 個國家、60+ 禱告小組",
  "導入語音轉寫與自動代幣回饋機制",
  "提供儀表板即時洞察祈禱影響力"
];

const imageHighlights = [
  {
    src: "https://images.unsplash.com/photo-1515705576963-95cad62945b6?auto=format&fit=crop&w=900&q=80",
    alt: "家庭禱告",
    caption: "家庭守望：為彼此代禱與感謝"
  },
  {
    src: "https://images.unsplash.com/photo-1464998857633-50e59fbf2fe6?auto=format&fit=crop&w=900&q=80",
    alt: "青年團契",
    caption: "青年團契：用禱告陪伴尋找方向"
  },
  {
    src: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=900&q=80",
    alt: "跨文化宣教",
    caption: "跨文化宣教：在不同語言中彼此祝福"
  }
];

const milestones = [
  { title: "2024 Q4 · Private Beta", description: "完成第一版禱告牆、語音禱告與自動代幣發放流程。" },
  { title: "2025 Q2 · Global Rollout", description: "推出行動版體驗、開放 API 與教會專屬儀表板。" },
  { title: "2025 Q4 · DAO 試運轉", description: "啟動社群提案機制，代幣治理禱告專案資源分配。" }
];

const teamFocuses = [
  { title: "Product & UX", description: "設計友善的禱告體驗，協助用戶在 3 分鐘內完成分享與邀請。" },
  { title: "Faith & Care", description: "牧養顧問為祈禱內容把關，提供情緒支援與危機轉介流程。" },
  { title: "Blockchain & Data", description: "建構安全可靠的代幣機制與資料洞察，確保代幣流向透明。" }
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader activePath="/about" />

      <main>
        <section className="section hero hero-split">
          <div>
            <span className="badge-soft">OUR STORY</span>
            <h1>把禱告變成可被看見、被回應的行動</h1>
            <p>
              Prayer Coin 由一群熱衷禱告與科技的夥伴所組成，期待運用區塊鏈的透明與信任特性，凝聚世界各地的守望者。
              我們相信每一個禱告都值得被紀錄、被回應，也值得在社群中看見真實的陪伴。
            </p>
            <ul className="checklist">
              {heroChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="hero-media">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
              alt="團隊禱告與協作"
            />
          </div>
        </section>

        <section className="section">
          <h2>我們的核心價值</h2>
          <p>從禱告到行動，我們以四個關鍵價值推動 Prayer Coin 的產品發展與社群文化。</p>
          <div className="layout-grid columns-2" style={{ marginTop: "1.5rem" }}>
            {coreValues.map((value) => (
              <div key={value.title} className="gradient-card">
                <strong>{value.title}</strong>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="media-feature">
            <div>
              <span className="badge-soft">MISSION</span>
              <h2>從本地小組到全球祈禱網絡</h2>
              <p>
                Prayer Coin 的雛形來自於一個線上小組。疫情期間，我們經歷了遠距禱告的限制，因而開始思考：如何讓禱告不因距離而消失？如何記錄每一次回應的恩典？
              </p>
              <p>透過數位工具與代幣激勵，我們看見跨文化、跨城市的守望者相互扶持，也看見禱告所帶來的真實改變。</p>
              <ul className="checklist">
                {missionChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
              alt="全球禱告社群"
            />
          </div>
        </section>

        <section className="section">
          <h2>祈禱網絡剪影</h2>
          <p>實際禱告情境示意，圖像取自 Unsplash 免授權素材，用於呈現未來內容配置的靈感。</p>
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
          <p>我們正在邁向開放治理與更廣泛的全球合作，每一個里程碑都是社群共同的成果。</p>
          <div className="timeline">
            {milestones.map((milestone) => (
              <div key={milestone.title} className="timeline-item">
                <strong>{milestone.title}</strong>
                <p>{milestone.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>團隊焦點</h2>
          <p>
            Prayer Coin 由產品設計、牧養輔導、資料工程與區塊鏈專家組成。我們也持續招募對禱告有負擔、擅長行動設計與資料分析的夥伴加入。
          </p>
          <div className="layout-grid columns-3" style={{ marginTop: "1.5rem" }}>
            {teamFocuses.map((focus) => (
              <div key={focus.title} className="gradient-card">
                <strong>{focus.title}</strong>
                <p>{focus.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
