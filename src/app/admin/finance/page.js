const ORDERS = [
  { id: "ord-7701", user: "黃郁婷", amount: "NT$2,400", channel: "信用卡", status: "成功", createdAt: "2025-09-22 09:32" },
  { id: "ord-7702", user: "Prayer Studio", amount: "NT$15,000", channel: "銀行轉帳", status: "待核對", createdAt: "2025-09-22 08:48" }
];

const REFUNDS = [
  { id: "ref-004", user: "James Lin", amount: "NT$1,200", reason: "重複扣款", status: "待財務", createdAt: "2025-09-21 19:10" },
  { id: "ref-005", user: "Lydia", amount: "NT$640", reason: "祈禱室停止", status: "已退款", createdAt: "2025-09-20 16:32" }
];

export default function FinancePage() {
  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">支付與對帳</p>
          <h1>交易財務</h1>
        </div>
        <div className="admin-section__header-actions">
          <button type="button" className="button button--ghost">下載稅務報表</button>
          <button type="button" className="button button--primary">新增撥款</button>
        </div>
      </header>

      <section className="admin-section__grid">
        <article className="admin-section__card">
          <header className="admin-section__card-header">
            <div>
              <h2>最新訂單對帳</h2>
              <p>監控付款狀態與通路分布。</p>
            </div>
            <button type="button" className="link-button">全部訂單 →</button>
          </header>
          <table className="admin-table">
            <thead>
              <tr>
                <th>訂單編號</th>
                <th>用戶/單位</th>
                <th>金額</th>
                <th>通路</th>
                <th>狀態</th>
                <th>建立時間</th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.user}</td>
                  <td>{order.amount}</td>
                  <td>{order.channel}</td>
                  <td>{order.status}</td>
                  <td>{order.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="admin-section__card">
          <header className="admin-section__card-header">
            <div>
              <h2>退款流程</h2>
              <p>追蹤退款狀態與責任單位。</p>
            </div>
          </header>
          <ul className="admin-ticket-list">
            {REFUNDS.map((refund) => (
              <li key={refund.id}>
                <div>
                  <h3>{refund.user}</h3>
                  <p>{refund.reason} · {refund.amount}</p>
                </div>
                <div>
                  <span>{refund.status}</span>
                  <time dateTime={refund.createdAt}>{refund.createdAt}</time>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
