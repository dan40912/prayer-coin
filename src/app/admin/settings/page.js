const ROLES = [
  { id: "role-1", name: "超級管理員", permissions: "全功能" },
  { id: "role-2", name: "祈禱室管理者", permissions: "祈禱室、需求" },
  { id: "role-3", name: "財務操作員", permissions: "Impact、交易" }
];

export default function SettingsPage() {
  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">治理與法遵</p>
          <h1>設定治理</h1>
        </div>
        <div className="admin-section__header-actions">
          <button type="button" className="button button--ghost">審核流程</button>
          <button type="button" className="button button--primary">新增角色</button>
        </div>
      </header>

      <section className="admin-section__grid">
        <article className="admin-section__card">
          <header className="admin-section__card-header">
            <div>
              <h2>角色與權限</h2>
              <p>設定角色對應的功能存取。</p>
            </div>
          </header>

          <table className="admin-table">
            <thead>
              <tr>
                <th>角色</th>
                <th>權限範圍</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td>{role.permissions}</td>
                  <td>
                    <button type="button" className="link-button">編輯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="admin-section__card">
          <header className="admin-section__card-header">
            <div>
              <h2>合規中心</h2>
              <p>掌握隱私與資安稽核狀態。</p>
            </div>
            <button type="button" className="link-button">下載政策 →</button>
          </header>
          <ul className="admin-accordion">
            <li>
              <div>
                <h3>GDPR / 個資</h3>
                <time dateTime="2025-09-18">更新：2025-09-18</time>
              </div>
              <button type="button" className="link-button">檢視</button>
            </li>
            <li>
              <div>
                <h3>平台服務條款</h3>
                <time dateTime="2025-08-30">更新：2025-08-30</time>
              </div>
              <button type="button" className="link-button">檢視</button>
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}
