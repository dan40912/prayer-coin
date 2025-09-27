const REPORTS = [
  { id: "rep-001", type: "內容", severity: "高", summary: "疑似不當宣傳", room: "Healing Waves", submitted: "2025-09-22 09:02" },
  { id: "rep-002", type: "用戶", severity: "中", summary: "垃圾訊息", room: "Hope Valley", submitted: "2025-09-22 08:50" }
];

const REVIEW_QUEUE = [
  { id: "ai-001", label: "AI 檢測完成", confidence: "92%", status: "等待人工覆核" },
  { id: "ai-002", label: "AI 檢測進行中", confidence: "--", status: "分析中" }
];

export default function ModerationPage() {
  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">風險與合規</p>
          <h1>社群審核</h1>
        </div>
        <div className="admin-section__header-actions">
          <button type="button" className="button button--ghost">政策文件</button>
          <button type="button" className="button button--primary">設定旗標</button>
        </div>
      </header>

      <section className="admin-section__grid">
        <article className="admin-section__card">
          <header className="admin-section__card-header">
            <div>
              <h2>檢舉中心</h2>
              <p>依嚴重程度排列的案件列表。</p>
            </div>
            <button type="button" className="link-button">檢視全部 →</button>
          </header>
          <table className="admin-table">
            <thead>
              <tr>
                <th>類型</th>
                <th>嚴重度</th>
                <th>摘要</th>
                <th>相關祈禱室</th>
                <th>提交時間</th>
              </tr>
            </thead>
            <tbody>
              {REPORTS.map((report) => (
                <tr key={report.id}>
                  <td>{report.type}</td>
                  <td>{report.severity}</td>
                  <td>{report.summary}</td>
                  <td>{report.room}</td>
                  <td>{report.submitted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="admin-section__card">
          <header className="admin-section__card-header">
            <div>
              <h2>AI 審查隊列</h2>
              <p>自動檢測結果與信心值。</p>
            </div>
          </header>
          <ul className="admin-queue">
            {REVIEW_QUEUE.map((item) => (
              <li key={item.id}>
                <div>
                  <h3>{item.label}</h3>
                  <p>信心值：{item.confidence}</p>
                </div>
                <span>{item.status}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
