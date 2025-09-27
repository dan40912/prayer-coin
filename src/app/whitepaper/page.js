import { SiteFooter, SiteHeader } from "@/components/site-chrome";

const HERO_STATS = [
  { label: "Beta 上線", value: "2025 Q2" },
  { label: "活躍祈禱室", value: "320+" },
  { label: "影響力金流", value: "NT" }
];

const MISSION_PILLARS = [
  {
    title: "祈禱室網絡",
    description:
      "協助牧者、社群領袖建立在地化祈禱室，透過模組化工具收集需求、回應與代禱更新。"
  },
  {
    title: "透明影響力",
    description:
      "以 Impact Ledger 記錄資源流向與成果證明，支援捐款稽核、志工時數與社會影響評估。"
  },
  {
    title: "使命型代幣",
    description:
      "Prayer Coin (PCN) 作為社群協作激勵，連結禱告、志願服務與資源挹注的代幣經濟。"
  }
];

const TOKEN_SECTIONS = [
  {
    heading: "代幣用途",
    bullets: [
      "解鎖祈禱室進階工具與 API 存取",
      "作為 Impact 專案的治理與投票憑證",
      "激勵志工、代禱夥伴與教會推動者"
    ]
  },
  {
    heading: "發行模型",
    bullets: [
      "初始供給：1 億枚，4 年線性釋出",
      "20% 生態激勵、15% 技術研發、10% 影響力基金",
      "剩餘配置將進入 DAO 庫存，由治理投票支用"
    ]
  },
  {
    heading: "法遵架構",
    bullets: [
      "採用 RegTech 夥伴監控交易異常，符合 AML/KYT",
      "遵循台灣、歐盟與美國 NGO 與慈善相關規範",
      "於主要市場委任法律顧問與會計師事務所"
    ]
  }
];

const ARCHITECTURE_LAYERS = [
  {
    layer: "體驗層",
    description:
      "Next.js + React Server Components 建構前台體驗，搭配多語系、行動端優化與可及性 AA 標準。"
  },
  {
    layer: "應用層",
    description:
      "採微服務設計，包含祈禱室、Impact Ledger、通知中心、KYC 驗證與內容審核工作流。"
  },
  {
    layer: "資料層",
    description:
      "以 PostgreSQL 與 ClickHouse 分別處理交易與分析資料，重要資訊採用 KMS 加密與 Tokenization。"
  },
  {
    layer: "區塊鏈層",
    description:
      "Polygon PoS 為主要發行網路，並透過跨鏈橋接支援 TRON 與 Stellar 的低手續費場景。"
  }
];

const ROADMAP_PHASES = [
  {
    quarter: "2025 Q2",
    title: "Beta Launch",
    items: [
      "啟動封測祈禱室與 Impact Ledger",
      "完成祈禱需求審核 SOP 與客服流程",
      "釋出第一版 PCN 發行白皮書"
    ]
  },
  {
    quarter: "2025 Q3",
    title: "Growth",
    items: [
      "上線行動 App 與即時推播",
      "導入多國法遵指南與付款通路",
      "推行社群大使與志工激勵計畫"
    ]
  },
  {
    quarter: "2025 Q4",
    title: "Network",
    items: [
      "開放開發者 API 與小組專案模板",
      "整合更多 Denomination 與教派夥伴",
      "引進 ESG 報告模組與第三方保證"
    ]
  },
  {
    quarter: "2026",
    title: "DAO 與開放治理",
    items: [
      "成立 Prayer DAO，治理行動與基金配置",
      "釋出 SDK 與 UI 套件，協助夥伴自建應用",
      "導入可驗證祈禱紀錄（Verifiable Prayer Proof）"
    ]
  }
];

export default function WhitepaperPage() {
  return (
    <>
      <SiteHeader activePath="/whitepaper" />
      <main className="whitepaper-page">
        <section className="whitepaper-hero">
          <div>
            <p className="whitepaper-hero__eyebrow">Prayer Coin Whitepaper</p>
            <h1>為全球祈禱社群打造的影響力經濟體</h1>
            <p>
              我們將祈禱、志工與捐助數據化，藉由代幣經濟與透明治理，讓每一次代禱都能看見成果與被賦能的生命故事。
            </p>
            <div className="whitepaper-hero__actions">
              <a href="#token" className="button button--primary">
                查看代幣模型
              </a>
              <a href="#roadmap" className="button button--ghost">
                探索 Roadmap
              </a>
            </div>
          </div>
          <aside className="whitepaper-hero__stats">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </aside>
        </section>

        <section className="whitepaper-section" id="mission">
          <h2>使命與願景</h2>
          <p>
            Prayer Coin 致力於將祈禱行動與實際影響連結，讓全球教會、宣教士與 NGO 能在同一個平台協作、互相代禱並共享資源。透過資料驅動的儀表板與代幣激勵機制，我們要讓善的循環更快被看見。
          </p>
          <div className="whitepaper-grid whitepaper-grid--three">
            {MISSION_PILLARS.map((pillar) => (
              <article key={pillar.title} className="whitepaper-card">
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="whitepaper-section" id="token">
          <div className="whitepaper-section__header">
            <h2>代幣設計概覽 (PCN)</h2>
            <p>
              PCN 代幣旨在鼓勵祈禱室生態系的互助與透明治理；所有發行、分配與銷毀資訊將於鏈上公開，並接受第三方審計。
            </p>
          </div>
          <div className="whitepaper-grid whitepaper-grid--three">
            {TOKEN_SECTIONS.map((section) => (
              <article key={section.heading} className="whitepaper-card whitepaper-card--outline">
                <h3>{section.heading}</h3>
                <ul>
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="whitepaper-section" id="architecture">
          <h2>技術與治理架構</h2>
          <div className="whitepaper-steps">
            {ARCHITECTURE_LAYERS.map((layer) => (
              <div key={layer.layer} className="whitepaper-step">
                <span>{layer.layer}</span>
                <p>{layer.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="whitepaper-section" id="roadmap">
          <h2>產品 Roadmap</h2>
          <div className="whitepaper-roadmap">
            {ROADMAP_PHASES.map((phase) => (
              <article key={phase.quarter}>
                <header>
                  <span>{phase.quarter}</span>
                  <h3>{phase.title}</h3>
                </header>
                <ul>
                  {phase.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="whitepaper-section" id="download">
          <div className="whitepaper-download">
            <div>
              <h2>取得完整白皮書</h2>
              <p>
                立即下載 PDF 與概覽簡報，取得代幣經濟、技術規格、治理架構與公開審計計畫的詳細資訊。
              </p>
            </div>
            <div className="whitepaper-download__actions">
              <a className="button button--primary" href="/legacy/whitepaper.pdf">
                下載 PDF 版本
              </a>
              <a className="button button--ghost" href="mailto:partnership@prayercoin.app">
                聯絡合作夥伴
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
