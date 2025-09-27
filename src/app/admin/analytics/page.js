const KPIS = [
  { id: "kpi-001", label: "7日留存", value: "62%", change: "+4%" },
  { id: "kpi-002", label: "轉化率", value: "8.5%", change: "+1.2%" },
  { id: "kpi-003", label: "活躍用戶", value: "18,420", change: "+9%" }
];

export default function AnalyticsPage() {
  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">數據洞察</p>
          <h1>分析洞察</h1>
        </div>
        <div className="admin-section__header-actions">
          <button type="button" className="button button--ghost">儲存報表</button>
          <button type="button" className="button button--primary">建立自訂報表</button>
        </div>
      </header>

      <section className="admin-section__kpi-grid">
        {KPIS.map((kpi) => (
          <article key={kpi.id} className="admin-section__kpi">
            <p>{kpi.label}</p>
            <div>
              <strong>{kpi.value}</strong>
              <span>{kpi.change}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="admin-section__card admin-section__card--chart">
        <header className="admin-section__card-header">
          <div>
            <h2>祈禱旅程轉化漏斗</h2>
            <p>觀察各階段流失率與成效。</p>
          </div>
          <button type="button" className="link-button">匯出圖檔 →</button>
        </header>
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
          alt="Analytics chart placeholder"
          loading="lazy"
        />
      </section>
    </div>
  );
}
