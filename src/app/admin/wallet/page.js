"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const SESSION_STORAGE_KEY = "prayer-coin-admin-session";
const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "all", label: "全部狀態" },
  { value: "PENDING", label: "待審" },
  { value: "PROCESSING_CHAIN", label: "鏈上處理" },
  { value: "COMPLETED", label: "已完成" },
  { value: "FAILED", label: "失敗" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "全部類型" },
  { value: "WITHDRAW", label: "提領" },
  { value: "EARN_PRAYER", label: "祈禱獎勵" },
  { value: "EARN_RESPONSE", label: "回應獎勵" },
  { value: "DONATE", label: "捐贈" },
];

const STATUS_LABELS = {
  PENDING: "待審",
  PROCESSING_CHAIN: "鏈上處理",
  COMPLETED: "已完成",
  FAILED: "失敗",
};

const TYPE_LABELS = {
  WITHDRAW: "提領",
  EARN_PRAYER: "祈禱獎勵",
  EARN_RESPONSE: "回應獎勵",
  DONATE: "捐贈",
};

const STATUS_BADGE = {
  PENDING: "status-badge status-badge--warning",
  PROCESSING_CHAIN: "status-badge status-badge--processing",
  COMPLETED: "status-badge status-badge--active",
  FAILED: "status-badge status-badge--blocked",
};

const currencyFormatter = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  minimumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("zh-TW", {
  maximumFractionDigits: 2,
});

function formatDate(value) {
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return value;
  }
}

function formatAmount(amount) {
  return currencyFormatter.format(amount ?? 0);
}

function formatType(type) {
  return TYPE_LABELS[type] ?? type;
}

function formatStatus(status) {
  return STATUS_LABELS[status] ?? status;
}

function readSessionRole() {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.role ?? null;
  } catch (error) {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export default function AdminWalletPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });
  const [actionId, setActionId] = useState(null);
  const [sessionRole, setSessionRole] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const role = readSessionRole();
    setSessionRole(role);
    setSessionChecked(true);
  }, []);

  const loadTransactions = useCallback(async () => {
    if (sessionRole !== "SUPER") {
      setLoading(false);
      if (sessionRole !== null) {
        setError("沒有權限檢視此頁面");
      }
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        includeSummary: "true",
      });

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      if (typeFilter !== "all") {
        params.set("type", typeFilter);
      }

      if (search) {
        params.set("search", search);
      }

      const response = await fetch(`/api/admin/transactions?${params.toString()}`, {
        cache: "no-store",
        headers: {
          "x-admin-role": sessionRole ?? "",
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "無法載入交易資料");
      }

      const data = await response.json();
      setTransactions(data.data ?? []);
      setSummary(data.summary ?? null);
      setPagination(
        data.pagination ?? {
          total: 0,
          page: 1,
          limit: PAGE_SIZE,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("載入錢包交易失敗:", err);
      setError(err.message || "無法載入交易資料");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [sessionRole, statusFilter, typeFilter, page, search]);

  useEffect(() => {
    if (!sessionChecked) return;
    loadTransactions();
  }, [sessionChecked, loadTransactions]);

  const handleSearchSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setPage(1);
      setSearch(searchInput.trim());
    },
    [searchInput]
  );

  const totalPages = Math.max(pagination.totalPages || 1, 1);

  const summaryCards = useMemo(() => {
    if (!summary) {
      return [
        { id: "wallet-total", label: "平台錢包總餘額", value: formatAmount(0) },
        { id: "pending-withdraw", label: "待審提領 (筆 / 金額)", value: "0 筆 / $0.00" },
        { id: "processed-total", label: "累計發放 (earn)", value: formatAmount(0) },
      ];
    }

    const pendingInfo = summary.pendingWithdraw || { count: 0, amount: 0 };
    const totalsByType = summary.totalsByType || {};

    return [
      {
        id: "wallet-total",
        label: "平台錢包總餘額",
        value: formatAmount(summary.walletBalanceTotal || 0),
      },
      {
        id: "pending-withdraw",
        label: "待審提領 (筆 / 金額)",
        value: `${pendingInfo.count ?? 0} 筆 / ${formatAmount(pendingInfo.amount || 0)}`,
      },
      {
        id: "processed-total",
        label: "累計發放 (earn)",
        value: formatAmount((totalsByType.earn_prayer || 0) + (totalsByType.earn_response || 0)),
      },
    ];
  }, [summary]);

  const statusSummary = useMemo(() => {
    if (!summary?.status) return [];
    return Object.entries(summary.status).map(([status, count]) => ({
      status,
      count,
    }));
  }, [summary]);

  const handleUpdateStatus = useCallback(
    async (transaction, targetStatus) => {
      if (sessionRole !== "SUPER") {
        alert("沒有權限執行此操作");
        return;
      }

      try {
        setActionId(transaction.id);

        let txHash = transaction.txHash ?? "";
        if (targetStatus === "COMPLETED") {
          txHash = window.prompt("請輸入鏈上交易 Hash (可留空)", txHash || "") ?? txHash;
        }

        const response = await fetch(`/api/admin/transactions/${transaction.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-role": sessionRole ?? "",
          },
          body: JSON.stringify({ status: targetStatus, txHash }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "更新失敗");
        }

        await loadTransactions();
      } catch (err) {
        alert(`⚠ ${err.message}`);
      } finally {
        setActionId(null);
      }
    },
    [sessionRole, loadTransactions]
  );

  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">代幣與餘額管理</p>
          <h1>錢包管理</h1>
          <p>掌握平台代幣流動、提領審批與用戶餘額變化。</p>
        </div>
        <button type="button" className="button button--ghost" onClick={() => loadTransactions()} disabled={loading}>
          重新整理
        </button>
      </header>

      <section className="admin-section__card">
        <div className="admin-dashboard__kpis" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          {summaryCards.map((card) => (
            <article key={card.id} className="dashboard-kpi">
              <p className="dashboard-kpi__label">{card.label}</p>
              <div className="dashboard-kpi__value-row">
                <span className="dashboard-kpi__value">{card.value}</span>
              </div>
              <p className="dashboard-kpi__footnote">&nbsp;</p>
            </article>
          ))}
        </div>
        {statusSummary.length > 0 ? (
          <div className="admin-wallet__status-summary">
            {statusSummary.map(({ status, count }) => (
              <span key={status} className="admin-wallet__status-pill">
                {formatStatus(status)}：{numberFormatter.format(count)}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <section className="admin-section__card">
        <header className="admin-section__card-header">
          <div>
            <h2>代幣交易台帳</h2>
            <p>審核提領、追蹤獎勵發放與捐贈紀錄。</p>
          </div>
          <div className="admin-section__filters">
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <form className="admin-section__search" onSubmit={handleSearchSubmit}>
              <input
                type="search"
                placeholder="搜尋用戶、地址或 Tx Hash"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </form>
          </div>
        </header>

        {loading ? (
          <p>載入中…</p>
        ) : error ? (
          <div>
            <p className="error">{error}</p>
            <button type="button" className="link-button" onClick={() => loadTransactions()}>
              重新載入
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <p>目前沒有符合條件的交易紀錄。</p>
        ) : (
          <div className="admin-wallet__table">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "180px" }}>建立時間</th>
                  <th style={{ width: "120px" }}>類型</th>
                  <th style={{ width: "120px" }}>金額</th>
                  <th style={{ width: "120px" }}>狀態</th>
                  <th>用戶</th>
                  <th style={{ width: "220px" }}>地址 / 參考</th>
                  <th style={{ width: "220px" }}>Tx Hash</th>
                  <th style={{ width: "140px" }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const badgeClass = STATUS_BADGE[transaction.status] || "status-badge";
                  return (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.createdAt)}</td>
                      <td>{formatType(transaction.type)}</td>
                      <td>{formatAmount(transaction.amount)}</td>
                      <td>
                        <span className={badgeClass}>{formatStatus(transaction.status)}</span>
                      </td>
                      <td>
                        <div>{transaction.user?.name || "(未提供)"}</div>
                        <div className="admin-wallet__muted">{transaction.user?.email}</div>
                      </td>
                      <td>
                        {transaction.type === "WITHDRAW"
                          ? transaction.targetAddress || "—"
                          : transaction.relatedHomeCard?.title || transaction.relatedResponse?.id || "—"}
                      </td>
                      <td>{transaction.txHash || "—"}</td>
                      <td>
                        {transaction.type === "WITHDRAW" && transaction.status !== "COMPLETED" && transaction.status !== "FAILED" ? (
                          <div className="admin-wallet__actions">
                            {transaction.status === "PENDING" ? (
                              <button
                                type="button"
                                className="link-button"
                                onClick={() => handleUpdateStatus(transaction, "PROCESSING_CHAIN")}
                                disabled={actionId === transaction.id}
                              >
                                標記鏈上處理
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="link-button"
                              onClick={() => handleUpdateStatus(transaction, "COMPLETED")}
                              disabled={actionId === transaction.id}
                            >
                              標記完成
                            </button>
                            <button
                              type="button"
                              className="link-button"
                              onClick={() => {
                                const confirmed = window.confirm("確定要將此提領標記為失敗並退回餘額？");
                                if (confirmed) {
                                  handleUpdateStatus(transaction, "FAILED");
                                }
                              }}
                              disabled={actionId === transaction.id}
                            >
                              標記失敗
                            </button>
                          </div>
                        ) : (
                          <span className="admin-wallet__muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="pagination">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                上一頁
              </button>
              <span>
                第 {page} / {totalPages} 頁（共 {pagination.total} 筆）
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                下一頁
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
