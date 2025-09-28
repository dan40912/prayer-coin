"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const numberFormatter = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat("zh-TW", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const currencyFormatter = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const INITIAL_METRICS = {
  totalUsers: 0,
  blockedUsers: 0,
  totalPrayers: 0,
  totalResponses: 0,
  averageWallet: 0,
};

const formatInteger = (value) =>
  numberFormatter.format(Math.max(0, Math.round(Number.isFinite(value) ? value : Number(value) || 0)));

const formatPercent = (value) =>
  percentFormatter.format(Math.max(0, Number.isFinite(value) ? value : Number(value) || 0));

const formatCurrency = (value) =>
  currencyFormatter.format(Number.isFinite(value) ? value : Number(value) || 0);

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [highRiskUsers, setHighRiskUsers] = useState([]);
  const [highRiskUsersLoading, setHighRiskUsersLoading] = useState(true);
  const [highRiskUsersError, setHighRiskUsersError] = useState("");

  const [highRiskPrayers, setHighRiskPrayers] = useState([]);
  const [highRiskPrayersLoading, setHighRiskPrayersLoading] = useState(true);
  const [highRiskPrayersError, setHighRiskPrayersError] = useState("");

  const [userActionId, setUserActionId] = useState(null);
  const [prayerActionId, setPrayerActionId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsError("");

    try {
      const baseParams = new URLSearchParams({ limit: "1", includeSummary: "true" });
      const blockedParams = new URLSearchParams({ limit: "1", status: "blocked" });
      const shortParams = new URLSearchParams({ limit: "1" });

      const [overallRes, blockedRes, prayersRes, responsesRes] = await Promise.all([
        fetch(`/api/admin/users?${baseParams.toString()}`, { cache: "no-store" }),
        fetch(`/api/admin/users?${blockedParams.toString()}`, { cache: "no-store" }),
        fetch(`/api/admin/prayfor?${shortParams.toString()}`, { cache: "no-store" }),
        fetch(`/api/admin/prayerresponse?${shortParams.toString()}`, { cache: "no-store" }),
      ]);

      if (!overallRes.ok || !blockedRes.ok || !prayersRes.ok || !responsesRes.ok) {
        throw new Error("載入儀表板指標失敗");
      }

      const [overallData, blockedData, prayersData, responsesData] = await Promise.all([
        overallRes.json(),
        blockedRes.json(),
        prayersRes.json(),
        responsesRes.json(),
      ]);

      const totalUsers = overallData.pagination?.total ?? overallData.summary?.totalUsers ?? 0;
      const blockedUsers =
        blockedData.pagination?.total ?? overallData.summary?.blockedUsers ?? 0;
      const totalPrayers = prayersData.pagination?.total ?? 0;
      const totalResponses = responsesData.pagination?.total ?? 0;

      const averageWalletRaw =
        typeof overallData.summary?.averageWalletBalance === "number"
          ? overallData.summary.averageWalletBalance
          : 0;

      const averageWallet = Number.isFinite(averageWalletRaw)
        ? Math.round(averageWalletRaw * 100) / 100
        : 0;

      setMetrics({
        totalUsers,
        blockedUsers,
        totalPrayers,
        totalResponses,
        averageWallet,
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("載入儀表板指標失敗:", error);
      setMetricsError(error.message || "載入儀表板指標失敗");
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const loadHighRiskUsers = useCallback(async () => {
    setHighRiskUsersLoading(true);
    setHighRiskUsersError("");

    try {
      const params = new URLSearchParams({
        sort: "reportCount",
        order: "desc",
        limit: "5",
      });

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("無法取得高風險用戶清單");
      }

      const data = await res.json();
      const items = (data.data ?? []).filter((user) => (user.reportCount ?? 0) > 0);
      setHighRiskUsers(items);
    } catch (error) {
      console.error("載入高風險用戶失敗:", error);
      setHighRiskUsersError(error.message || "無法取得高風險用戶清單");
    } finally {
      setHighRiskUsersLoading(false);
    }
  }, []);

  const loadHighRiskPrayers = useCallback(async () => {
    setHighRiskPrayersLoading(true);
    setHighRiskPrayersError("");

    try {
      const params = new URLSearchParams({
        sort: "reportCount",
        order: "desc",
        limit: "5",
        status: "active",
      });

      const res = await fetch(`/api/admin/prayfor?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("無法取得禱告事項清單");
      }

      const data = await res.json();
      const items = (data.data ?? []).filter((item) => !item.isBlocked);
      setHighRiskPrayers(items);
    } catch (error) {
      console.error("載入禱告待審清單失敗:", error);
      setHighRiskPrayersError(error.message || "無法取得禱告事項清單");
    } finally {
      setHighRiskPrayersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
    loadHighRiskUsers();
    loadHighRiskPrayers();
  }, [loadMetrics, loadHighRiskUsers, loadHighRiskPrayers]);

  const handleBlockUser = async (userId, nextState) => {
    try {
      setUserActionId(userId);
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ block: nextState }),
      });

      if (!res.ok) {
        throw new Error("更新用戶狀態失敗");
      }

      await Promise.all([loadHighRiskUsers(), loadMetrics()]);
    } catch (error) {
      alert(`⚠ ${error.message}`);
    } finally {
      setUserActionId(null);
    }
  };

  const handleBlockPrayer = async (prayerId) => {
    try {
      setPrayerActionId(prayerId);
      const res = await fetch("/api/admin/prayfor", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prayerId, block: true }),
      });

      if (!res.ok) {
        throw new Error("封鎖禱告事項失敗");
      }

      await loadHighRiskPrayers();
    } catch (error) {
      alert(`⚠ ${error.message}`);
    } finally {
      setPrayerActionId(null);
    }
  };

  const handleExport = () => {
    if (metricsLoading || exporting) return;

    try {
      setExporting(true);
      const rows = [];

      rows.push(["儀表板指標", "數值"]);
      rows.push(["總註冊用戶數", metrics.totalUsers]);
      rows.push(["封鎖用戶數", metrics.blockedUsers]);
      rows.push([
        "封鎖用戶比例",
        metrics.totalUsers > 0
          ? `${((metrics.blockedUsers / metrics.totalUsers) * 100).toFixed(1)}%`
          : "0%",
      ]);
      rows.push(["總禱告事項數", metrics.totalPrayers]);
      rows.push(["總禱告回應數", metrics.totalResponses]);
      rows.push(["平均錢包餘額 (NT$)", metrics.averageWallet.toFixed(2)]);

      rows.push([]);
      rows.push(["高風險用戶 Top 5"]);
      rows.push(["姓名", "Email", "檢舉次數", "狀態"]);
      if (highRiskUsers.length === 0) {
        rows.push(["目前無資料", "", "", ""]);
      } else {
        highRiskUsers.forEach((user) => {
          rows.push([
            user.name || "未設定",
            user.email,
            user.reportCount ?? 0,
            user.isBlocked ? "Blocked" : "Active",
          ]);
        });
      }

      rows.push([]);
      rows.push(["待審禱告事項 Top 5"]);
      rows.push(["標題", "建立者", "檢舉次數", "狀態"]);
      if (highRiskPrayers.length === 0) {
        rows.push(["目前無資料", "", "", ""]);
      } else {
        highRiskPrayers.forEach((item) => {
          rows.push([
            item.title,
            item.owner?.name || item.owner?.email || "未提供",
            item.reportCount ?? 0,
            item.isBlocked ? "Blocked" : "Active",
          ]);
        });
      }

      const csv = rows
        .map((row) =>
          row
            .map((cell) => {
              const value = cell ?? "";
              const text = typeof value === "number" ? value.toString() : String(value);
              return `"${text.replace(/"/g, '""')}"`;
            })
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("匯出儀表板失敗:", error);
      alert("⚠ 匯出失敗，請稍後再試");
    } finally {
      setExporting(false);
    }
  };

  const blockedRatio = useMemo(() => {
    if (!metrics.totalUsers || metrics.totalUsers <= 0) return 0;
    return Math.min(Math.max(metrics.blockedUsers / metrics.totalUsers, 0), 1);
  }, [metrics.blockedUsers, metrics.totalUsers]);

  const metricCards = useMemo(() => {
    const walletValue = Number.isFinite(metrics.averageWallet)
      ? Math.round(metrics.averageWallet * 100) / 100
      : 0;

    return [
      {
        id: "total-users",
        label: "總註冊用戶數",
        value: formatInteger(metrics.totalUsers),
        footnote: "含所有狀態",
      },
      {
        id: "blocked-ratio",
        label: "封鎖用戶比例",
        value: formatPercent(blockedRatio),
        footnote: `${formatInteger(metrics.blockedUsers)} 人封鎖中`,
      },
      {
        id: "total-prayers",
        label: "總禱告事項數",
        value: formatInteger(metrics.totalPrayers),
        footnote: "PrayFor Cards",
      },
      {
        id: "total-responses",
        label: "總禱告回應數",
        value: formatInteger(metrics.totalResponses),
        footnote: "涵蓋全部回應狀態",
      },
      {
        id: "average-wallet",
        label: "平均用戶錢包餘額",
        value: formatCurrency(walletValue),
        footnote: walletValue > 0 ? "以新台幣計價" : "目前無有效餘額資料",
      },
    ];
  }, [blockedRatio, metrics.averageWallet, metrics.blockedUsers, metrics.totalPrayers, metrics.totalResponses, metrics.totalUsers]);

  return (
    <div className="admin-section">
      <header className="admin-dashboard__header">
        <div>
          <p className="admin-dashboard__eyebrow">PRAY COIN 後台</p>
          <h1>儀表板總覽</h1>
          <p>即時掌握平台健康度，並快速處理需要注意的高風險項目。</p>
        </div>
        <div className="admin-dashboard__header-actions">
          {lastUpdated ? (
            <span className="admin-dashboard__timestamp">
              最後更新：{lastUpdated.toLocaleString()}
            </span>
          ) : null}
          <button
            type="button"
            className="button button--primary"
            onClick={handleExport}
            disabled={metricsLoading || exporting}
          >
            {exporting ? "匯出中…" : "匯出試算表"}
          </button>
        </div>
      </header>

      <section className="admin-dashboard__kpis">
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <article key={index} className="dashboard-kpi admin-dashboard--loading">
              <p className="dashboard-kpi__label">載入中…</p>
              <div className="dashboard-kpi__value-row">
                <span className="dashboard-kpi__value">—</span>
              </div>
              <p className="dashboard-kpi__footnote">&nbsp;</p>
            </article>
          ))
        ) : metricsError ? (
          <article className="dashboard-card dashboard-card--wide">
            <p className="error">{metricsError}</p>
            <button type="button" className="link-button" onClick={loadMetrics}>
              重新載入
            </button>
          </article>
        ) : (
          metricCards.map((card) => (
            <article key={card.id} className="dashboard-kpi">
              <p className="dashboard-kpi__label">{card.label}</p>
              <div className="dashboard-kpi__value-row">
                <span className="dashboard-kpi__value">{card.value}</span>
              </div>
              <p className="dashboard-kpi__footnote">{card.footnote}</p>
            </article>
          ))
        )}
      </section>

      <section className="admin-dashboard__grid">
        <article className="dashboard-card">
          <header className="dashboard-card__header">
            <div>
              <h2>高風險用戶清單</h2>
              <p>依檢舉次數排序的 Top 5，用於快速評估是否需要封鎖。</p>
            </div>
          </header>

          {highRiskUsersLoading ? (
            <p>載入中…</p>
          ) : highRiskUsersError ? (
            <div>
              <p className="error">{highRiskUsersError}</p>
              <button type="button" className="link-button" onClick={loadHighRiskUsers}>
                重新載入
              </button>
            </div>
          ) : highRiskUsers.length === 0 ? (
            <p>目前沒有需要關注的高風險用戶。</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>Email</th>
                  <th>檢舉次數</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {highRiskUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name || "未設定"}</td>
                    <td>{user.email}</td>
                    <td>{user.reportCount ?? 0}</td>
                    <td>
                      {user.isBlocked ? (
                        <span className="status-badge status-badge--blocked">Blocked</span>
                      ) : (
                        <span className="status-badge status-badge--active">Active</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => handleBlockUser(user.id, !user.isBlocked)}
                        disabled={userActionId === user.id}
                      >
                        {userActionId === user.id
                          ? "處理中…"
                          : user.isBlocked
                          ? "解除封鎖"
                          : "封鎖"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>

        <article className="dashboard-card">
          <header className="dashboard-card__header">
            <div>
              <h2>待審禱告事項</h2>
              <p>依檢舉次數排序的 Top 5，封鎖後將立即從前台下架。</p>
            </div>
          </header>

          {highRiskPrayersLoading ? (
            <p>載入中…</p>
          ) : highRiskPrayersError ? (
            <div>
              <p className="error">{highRiskPrayersError}</p>
              <button type="button" className="link-button" onClick={loadHighRiskPrayers}>
                重新載入
              </button>
            </div>
          ) : highRiskPrayers.length === 0 ? (
            <p>目前沒有需要處理的禱告事項。</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>標題</th>
                  <th>建立者</th>
                  <th>檢舉次數</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {highRiskPrayers.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.owner?.name || item.owner?.email || "未提供"}</td>
                    <td>{item.reportCount ?? 0}</td>
                    <td>
                      {item.isBlocked ? (
                        <span className="status-badge status-badge--blocked">Blocked</span>
                      ) : (
                        <span className="status-badge status-badge--active">Active</span>
                      )}
                    </td>
                    <td>
                      {item.isBlocked ? (
                        <span>已封鎖</span>
                      ) : (
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => handleBlockPrayer(item.id)}
                          disabled={prayerActionId === item.id}
                        >
                          {prayerActionId === item.id ? "處理中…" : "封鎖"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      </section>
    </div>
  );
}


