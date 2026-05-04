import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata = {
  title: "白皮書與條款 | Start Pray 一起禱告吧",
  description: "查看 Start Pray 的技術路線圖、平台治理方向與使用條款說明。",
};


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
      "平台所呈現之影響力數據僅供參考，並非法律、醫療或其他專業建議。",
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
      "各國宗教、公益與資料治理相關法規差異甚大，使用者應依所在地之法律完成必要申報與治理程序。"
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
  "使用者得隨時透過 startpraynow@gmail.com 請求查閱、更正或刪除相關紀錄。"
];


export default function WhitepaperPage() {
  return (
    <>
      <SiteHeader activePath="/whitepaper" />
      <main className="whitepaper-page">
 <section id="tech-roadmap">
<div className="roadmap-header">
<h2>Start Pray 技術路線圖：從穩定服務到開放協作</h2>
<p>我們的發展分為四個階段，旨在逐步提升平台的穩定度、透明度、可信度與內容保存能力。</p>
{/* 突出顯示當前階段 */}
<div className="current-status-tag">
目前階段：Phase 0（中心化啟動）
</div>
</div>

<div className="roadmap-stages-container">

{/* Phase 0: 中心化啟動 (CURRENT) */}
<div className="roadmap-stage current-stage" data-phase="0">
  <div className="stage-title-wrap">
    <span className="stage-label">Phase 0</span>
    <h3 className="stage-title">中心化啟動</h3>
  </div>
  <div className="stage-content">
    <p className="stage-goal">
      **現階段：** 平台已上線並運作。帳戶、禱告卡與回應紀錄集中儲存在我們的資料庫中，便於快速維護與改善體驗。
    </p>
    <p className="stage-focus">
      **核心重點：** 快速啟動、最小可行產品 (MVP)。所有信任度基於我們的隱私和透明政策。
    </p>
    <p className="stage-risk">
      **風險/挑戰：** 中心化依賴；用戶信任度需靠政策維護。
    </p>
  </div>
</div>

{/* Phase 1: 數位資產發行 (NEXT) */}
<div className="roadmap-stage next-stage" data-phase="1">
  <div className="stage-title-wrap">
    <span className="stage-label">Phase 1</span>
    <h3 className="stage-title">透明營運報告</h3>
  </div>
  <div className="stage-content">
    <p className="stage-goal">
      **目標：** 建立定期營運報告，公開說明平台維護、內容治理、資料保護與社群參與狀況。
    </p>
    <p className="stage-focus">
      **核心重點：** 讓使用者和合作夥伴能理解平台如何運作、如何處理資料，以及如何維護社群安全。
    </p>
    <p className="stage-risk">
      **風險/挑戰：** 報告格式、資料揭露範圍與隱私保護需要持續校準。
    </p>
  </div>
</div>

{/* Phase 2: 內容保存與驗證 */}
<div className="roadmap-stage" data-phase="2">
  <div className="stage-title-wrap">
    <span className="stage-label">Phase 2</span>
    <h3 className="stage-title">內容保存與驗證</h3>
  </div>
  <div className="stage-content">
    <p className="stage-goal">
      **目標：** 建立內容版本紀錄與時間戳，協助使用者確認禱告內容、語音與回應的建立時間。
    </p>
    <p className="stage-focus">
      **核心重點：** 內容可追蹤、可備份、可查詢，並在必要時提供清楚的異動紀錄。
    </p>
    <p className="stage-risk">
      **風險/挑戰：** 備份成本、資料同步與使用者刪除權之間需要取得平衡。
    </p>
  </div>
</div>

{/* Phase 3: 永久透明與治理 */}
<div className="roadmap-stage" data-phase="3">
  <div className="stage-title-wrap">
    <span className="stage-label">Phase 3</span>
    <h3 className="stage-title">長期保存與治理</h3>
  </div>
  <div className="stage-content">
    <p className="stage-goal">
      **目標：** 建立長期保存機制與社群治理流程，讓重要見證、禱告紀錄與平台決策能被妥善保存。
    </p>
    <p className="stage-focus">
      **核心重點：** 長期保存與社群參與，最大限度提升平台的透明度與可信度。
    </p>
    <p className="stage-risk">
      **風險/挑戰：** 儲存成本、審核權限與社群治理流程設計。
    </p>
  </div>
</div>

</div>
</section>
  <section className="legal-section">
          <h2>平台服務與免責聲明</h2>
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

        

      </main>
      <SiteFooter />
    </>
  );
}
