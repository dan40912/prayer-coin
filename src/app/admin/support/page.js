const TICKETS = [
  { id: "sup-001", title: "API 回傳 500", category: "技術", status: "開啟", assignee: "Chris" },
  { id: "sup-002", title: "忘記密碼連結失效", category: "客服", status: "進行中", assignee: "Mia" }
];

const KNOWLEDGE_BASE = [
  { id: "kb-001", question: "如何建立祈禱室?", updated: "2025-09-20" },
  { id: "kb-002", question: "Impact 報表權限設定", updated: "2025-09-18" }
];

export default function SupportPage() {
  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">支援與運維</p>
          <h1>支援運維</h1>
        </div>
        <div className="admin-section__header-actions">
          <button type="button" className="button button--ghost">建立 FAQ</button>
          <button type="button" className="button button--primary">新增工單</button>
        </div>
      </header>

      <section className="admin-section__grid">
        <article className="admin-section__card">
          <header className="admin-section__card-header">
            <div>
              <h2>工單看板</h2>
              <p>追蹤客服與技術支援狀態。</p>
            </div>
          </header>
          <table className="admin-table">
            <thead>
              <tr>
                <th>主題</th>
                <th>分類</th>
                <th>狀態</th>
                <th>指派</th>
              </tr>
            </thead>
            <tbody>
              {TICKETS.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.title}</td>
                  <td>{ticket.category}</td>
                  <td>{ticket.status}</td>
                  <td>{ticket.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="admin-section__card">
          <header className="admin-section__card-header">
            <div>
              <h2>知識庫</h2>
              <p>維運團隊常見問題與更新紀錄。</p>
            </div>
          </header>
          <ul className="admin-accordion">
            {KNOWLEDGE_BASE.map((article) => (
              <li key={article.id}>
                <div>
                  <h3>{article.question}</h3>
                  <time dateTime={article.updated}>更新：{article.updated}</time>
                </div>
                <button type="button" className="link-button">編輯</button>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
