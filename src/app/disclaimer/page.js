import { SiteFooter, SiteHeader } from "@/components/site-chrome";

const TERMS_SECTIONS = [
  {
    title: "服務定位",
    body:
      "Start Pray 為祈禱與影響力連結的數位平台，旨在協助社群組織、教會與公益專案以透明方式呈現需求與成果。平台不提供任何金融投資或保證收益。"
  },
  {
    title: "使用原則",
    items: [
      "使用者應確保所提交之祈禱、資料與討論符合所在地法律與社群準則。",
      "平台所呈現之影響力數據僅供參考，並非法律、財務或醫療專業建議。",
      "任何捐款或資源動員行動請依組織內部審核流程辦理，Start Pray 不介入資金保管。"
    ]
  },
  {
    title: "責任限制",
    body:
      "對於使用者於平台上之互動、留言、連結或第三方整合所造成的損失，Start Pray 與其合作夥伴不承擔任何直接或間接責任。"
  }
];

const RISK_CARDS = [
  {
    heading: "技術風險",
    description:
      "雖採用雲端備援與資安檢測，仍可能因硬體故障、網路中斷或第三方服務異常導致資料延遲或暫時無法存取。"
  },
  {
    heading: "法遵風險",
    description:
      "各國宗教、公益與金融相關法規差異甚大，使用者應依所在地之法律完成必要申報、稅務與治理程序。"
  },
  {
    heading: "內容風險",
    description:
      "平台提供檢舉、審核機制，但無法保證所有內容皆即時驗證；如遇冒用、詐欺請即刻通知客服團隊。"
  },
  {
    heading: "合作風險",
    description:
      "與第三方 API、支付、外部社群之連結僅為便利性提供，Start Pray 不對其服務品質作任何保證。"
  }
];

const PRIVACY_ITEMS = [
  "平台依《個人資料保護法》蒐集、處理與利用使用者資料，僅於提供祈禱媒合與影響力呈現目的範圍內使用。",
  "未經同意不會出售或出租個資，惟於法令要求、司法調查或為保護使用者權益時得提供必要資訊。",
  "使用者得隨時透過 legal@prayercoin.app 請求查閱、更正或刪除相關紀錄。"
];

export default function DisclaimerPage() {
  return (
    <>
      <SiteHeader activePath="/disclaimer" />
      <main className="legal-page">
        <section className="legal-hero">
          <div>
            <p className="legal-hero__eyebrow">Legal Notice</p>
            <h1>Start Pray 使用者免責聲明</h1>
            <p>
              為保障祈禱社群與公益夥伴的透明信任，以下條款說明平台服務定位、使用責任與風險揭露。使用本服務即表示您同意並遵循本聲明。
            </p>
          </div>
          <div className="legal-hero__panel">
            <h2>聯絡與更新</h2>
            <ul>
              <li>
                法務與稽核：<a href="mailto:legal@prayercoin.app">legal@prayercoin.app</a>
              </li>
              <li>最新版本：2025.09.22</li>
              <li>下次檢視：2026 Q1</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>平台服務與使用責任</h2>
          <div className="legal-grid legal-grid--two">
            {TERMS_SECTIONS.map((section) => (
              <article key={section.title} className="legal-card">
                <h3>{section.title}</h3>
                {section.body ? <p>{section.body}</p> : null}
                {section.items ? (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="legal-section">
          <h2>主要風險揭露</h2>
          <div className="legal-grid legal-grid--four">
            {RISK_CARDS.map((card) => (
              <article key={card.heading} className="legal-card legal-card--emphasis">
                <h3>{card.heading}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="legal-section">
          <div className="legal-section__header">
            <h2>資料保護與舉報機制</h2>
            <p>
              我們採用 ISO 27001 等級的資安管理流程，並設置舉報表單與 24 小時客服信箱，協助社群共同維護安全。
            </p>
          </div>
          <div className="legal-steps">
            <ol>
              <li>
                <h3>資料權利</h3>
                <p>{PRIVACY_ITEMS[0]}</p>
              </li>
              <li>
                <h3>合法揭露</h3>
                <p>{PRIVACY_ITEMS[1]}</p>
              </li>
              <li>
                <h3>申請流程</h3>
                <p>{PRIVACY_ITEMS[2]}</p>
              </li>
            </ol>
            <aside className="legal-cta">
              <p>發現違規內容或詐騙風險？</p>
              <a className="button button--primary" href="mailto:safety@prayercoin.app">
                立即回報
              </a>
            </aside>
          </div>
        </section>

        <section className="legal-section">
          <h2>條款修訂</h2>
          <div className="legal-timeline">
            <div className="legal-timeline__item">
              <span>2024 Q4</span>
              <p>完成 Beta 使用者測試，新增資料存取權章節。</p>
            </div>
            <div className="legal-timeline__item">
              <span>2025 Q1</span>
              <p>引入祈禱室審核標準，補充內容風險揭露。</p>
            </div>
            <div className="legal-timeline__item">
              <span>2025 Q3</span>
              <p>與支付夥伴簽署 SLA，新增合作風險與備援流程。</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
