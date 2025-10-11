"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const SESSION_STORAGE_KEY = "prayer-coin-admin-session";
const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "all", label: "全部狀態" },
  { value: "PENDING", label: "待審" },
  { value: "PROCESSING_CHAIN", label: "鏈上處理" },
  { value: "COMPLETED", label: "已完成" },
  { value: "FAILED", label: "已取消" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "全部類型" },
  { value: "WITHDRAW", label: "提領" },
  { value: "EARN_PRAYER", label: "禱卡獎勵" },
  { value: "EARN_RESPONSE", label: "錄音獎勵" },
  { value: "DONATE", label: "捐贈" },
];

const STATUS_LABELS = {
  PENDING: "待審",
  PROCESSING_CHAIN: "鏈上處理",
  COMPLETED: "已完成",
  FAILED: "已取消",
};

const TYPE_LABELS = {
  WITHDRAW: "提領",
  EARN_PRAYER: "禱卡獎勵",
  EARN_RESPONSE: "錄音獎勵",
  DONATE: "捐贈",
};

const STATUS_BADGE = {
  PENDING: "status-badge status-badge--warning",
  PROCESSING_CHAIN: "status-badge status-badge--processing",
  COMPLETED: "status-badge status-badge--active",
  FAILED: "status-badge status-badge--blocked",
};

const TABS = [
  { id: "overview", label: "代幣總覽", roles: ["SUPER"] },
  { id: "history", label: "發送歷史", roles: ["SUPER"] },
  { id: "rules", label: "代幣發送規則", roles: ["SUPER", "ADMIN"] },
  { id: "balances", label: "使用者餘額", roles: ["SUPER"] },
];

const currencyFormatter = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  minimumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("zh-TW", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatDate(value) {
  if (!value) return "―";
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return String(value);
  }
}

function formatAmount(amount) {
  return currencyFormatter.format(Number(amount ?? 0));
}

function formatTokenAmount(amount) {
  return numberFormatter.format(Number(amount ?? 0));
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
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 });
  const [actionId, setActionId] = useState(null);
  const [sessionRole, setSessionRole] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");

  const [rewardRule, setRewardRule] = useState(null);
  const [ruleForm, setRuleForm] = useState({ rewardTokens: "", observationDays: "", allowedReports: "" });
  const [ruleLoading, setRuleLoading] = useState(false);
  const [ruleError, setRuleError] = useState("");
  const [ruleSubmitting, setRuleSubmitting] = useState(false);
  const [ruleFeedback, setRuleFeedback] = useState("");

  const [balances, setBalances] = useState([]);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [balancesError, setBalancesError] = useState("");

  useEffect(() => {
    const role = readSessionRole();
    setSessionRole(role);
    setSessionChecked(true);
  }, []);

  const canViewTransactions = sessionRole === "SUPER";
  const canManageRules = sessionRole === "SUPER" || sessionRole === "ADMIN";

  const availableTabs = useMemo(() => {
    if (!sessionRole) return [];
    return TABS.filter((tab) => tab.roles.includes(sessionRole));
  }, [sessionRole]);

  useEffect(() => {
    if (!sessionChecked) return;
    if (!availableTabs.length) {
      setActiveTab("rules");
      return;
    }
    if (!availableTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [sessionChecked, availableTabs, activeTab]);

  const loadTransactions = useCallback(async () => {
    if (!canViewTransactions) {
      setLoading(false);
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

      const response = await fetch(`/api/admin/transactions?${params.toString()}` , {
        cache: "no-store",
        headers: {
          "x-admin-role": sessionRole ?? "",
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "無法載入交易紀錄");
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
        },
      );
    } catch (err) {
      console.error("載入錢包交易時發生錯誤:", err);
      setError(err.message || "無法載入交易紀錄");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [canViewTransactions, page, statusFilter, typeFilter, search, sessionRole]);

  const loadRewardRule = useCallback(async () => {
    if (!canManageRules) {
      setRuleLoading(false);
      return;
    }

    try {
      setRuleLoading(true);
      setRuleError("");

      const response = await fetch("/api/admin/token-rules", {
        cache: "no-store",
        headers: {
          "x-admin-role": sessionRole ?? "",
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "無法載入發送規則");
      }

      const data = await response.json();
      setRewardRule(data);
      setRuleForm({
        rewardTokens: String(Number(data.rewardTokens ?? 0)),
        observationDays: String(data.observationDays ?? 3),
        allowedReports: String(data.allowedReports ?? 0),
      });
    } catch (err) {
      console.error("載入代幣規則時發生錯誤:", err);
      setRuleError(err.message || "無法載入發送規則");
      setRewardRule(null);
    } finally {
      setRuleLoading(false);
    }
  }, [canManageRules, sessionRole]);

  const loadBalances = useCallback(async () => {
    if (sessionRole !== "SUPER") {
      setBalancesLoading(false);
      return;
    }

    try {
      setBalancesLoading(true);
      setBalancesError("");

      const response = await fetch("/api/admin/token-balances?limit=50", {
        cache: "no-store",
        headers: {
          "x-admin-role": sessionRole ?? "",
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "無法載入使用者餘額");
      }

      const data = await response.json();
      setBalances(data.data ?? []);
    } catch (err) {
      console.error("載入使用者餘額時發生錯誤:", err);
      setBalancesError(err.message || "無法載入使用者餘額");
      setBalances([]);
    } finally {
      setBalancesLoading(false);
    }
  }, [sessionRole]);

  useEffect(() => {
    if (!sessionChecked) return;
    if (canViewTransactions && (activeTab === "overview" || activeTab === "history")) {
      loadTransactions();
    }
  }, [sessionChecked, canViewTransactions, activeTab, loadTransactions]);

  useEffect(() => {
    if (!sessionChecked || !canManageRules) return;
    if (activeTab === "rules") {
      loadRewardRule();
    }
  }, [sessionChecked, canManageRules, activeTab, loadRewardRule]);

  useEffect(() => {
    if (!sessionChecked || sessionRole !== "SUPER") return;
    if (activeTab === "balances") {
      loadBalances();
    }
  }, [sessionChecked, sessionRole, activeTab, loadBalances]);

  const summaryCards = useMemo(() => {
    if (!summary) {
      return [
        { id: "wallet-total", label: "使用者總餘額", value: formatAmount(0) },
        { id: "pending-withdraw", label: "待審提領 (筆 / 金額)", value: "0 筆 / $0.00" },
        { id: "processed-total", label: "已發放獎勵", value: formatAmount(0) },
      ];
    }

    const pendingInfo = summary.pendingWithdraw || { count: 0, amount: 0 };
    const totalsByType = summary.totalsByType || {};

    return [
      {
        id: "wallet-total",
        label: "使用者總餘額",
        value: formatAmount(summary.walletBalanceTotal || 0),
      },
      {
        id: "pending-withdraw",
        label: "待審提領 (筆 / 金額)",
        value: `${pendingInfo.count ?? 0} 筆 / ${formatAmount(pendingInfo.amount || 0)}`,
      },
      {
        id: "processed-total",
        label: "已發放獎勵",
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

  const totalPages = pagination.totalPages ?? 1;

  const handleSearchSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setPage(1);
      setSearch(searchInput.trim());
    },
    [searchInput],
  );

  const handleUpdateStatus = useCallback(
    async (transaction, targetStatus) => {
      if (!canViewTransactions) {
        alert("沒有權限執行此操作");
        return;
      }

      try {
        setActionId(transaction.id);

        let txHash = transaction.txHash ?? "";
        if (targetStatus === "COMPLETED") {
          txHash = window.prompt("請輸入鏈上交易 Hash (可略過)", txHash || "") ?? txHash;
        }

        const response = await fetch(`/api/admin/transactions/${transaction.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-role": sessionRole ?? "",
          },
          body: JSON.stringify({ status: targetStatus, txHash: txHash || null }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "更新狀態失敗");
        }

        await loadTransactions();
      } catch (err) {
        alert(err.message || "更新狀態失敗");
      } finally {
        setActionId(null);
      }
    },
    [canViewTransactions, loadTransactions, sessionRole],
  );

  const handleRuleInputChange = useCallback((field, value) => {
    setRuleForm((prev) => ({ ...prev, [field]: value }));
    setRuleFeedback("");
  }, []);

  const handleRuleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!canManageRules) {
        setRuleError("沒有權限更新規則");
        return;
      }

      try {
        setRuleSubmitting(true);
        setRuleError("");
        setRuleFeedback("");

        const payload = {
          rewardTokens: Number(ruleForm.rewardTokens || 0),
          observationDays: Number(ruleForm.observationDays || 0),
          allowedReports: Number(ruleForm.allowedReports || 0),
        };

        const response = await fetch("/api/admin/token-rules", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-role": sessionRole ?? "",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "更新代幣規則失敗");
        }

        const data = await response.json();
        setRewardRule(data);
        setRuleForm({
          rewardTokens: String(Number(data.rewardTokens ?? payload.rewardTokens)),
          observationDays: String(data.observationDays ?? payload.observationDays),
          allowedReports: String(data.allowedReports ?? payload.allowedReports),
        });
        setRuleFeedback("規則已更新");
      } catch (err) {
        console.error("更新代幣規則失敗:", err);
        setRuleError(err.message || "更新代幣規則失敗");
      } finally {
        setRuleSubmitting(false);
      }
    },
    [canManageRules, ruleForm, sessionRole],
  );

  const renderOverview = () => (
    <section className="admin-section__card">
      <header className="admin-section__card-header">
        <div>
          <h2>代幣總覽</h2>
          <p>快速檢視平台代幣流向與使用者錢包概況。</p>
        </div>
      </header>

      <div className="admin-cards">
        {summaryCards.map((card) => (
          <article key={card.id} className="admin-card">
            <span className="admin-card__label">{card.label}</span>
            <strong className="admin-card__value">{card.value}</strong>
          </article>
        ))}
      </div>

      {statusSummary.length ? (
        <div className="admin-wallet__status-summary">
          {statusSummary.map(({ status, count }) => (
            <span key={status} className="admin-wallet__status-pill">
              {formatStatus(status.toUpperCase())}：{count}
            </span>
          ))}
        </div>
      ) : null}

      {canManageRules && rewardRule ? (
        <div className="admin-maintenance">
          <p>
            目前規則：錄音完成後 <strong>{rewardRule.observationDays}</strong> 天內未被檢舉，可獲得
            <strong> {formatTokenValue(rewardRule.rewardTokens)} </strong> 代幣；允許檢舉次數上限為
            <strong> {rewardRule.allowedReports}</strong> 次。
          </p>
        </div>
      ) : null}
    </section>
  );

  const renderHistory = () => (
    <section className="admin-section__card">
      <header className="admin-section__card-header">
        <div>
          <h2>發送歷史</h2>
          <p>查閱提領與獎勵發放紀錄，可依狀態、類型或關鍵字篩選。</p>
        </div>
        <div className="admin-section__filters">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <form className="admin-section__search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="搜尋信箱 / 使用者 / Tx Hash"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </form>
        </div>
      </header>

      {loading ? (
        <p>載入中...</p>
      ) : error ? (
        <div>
          <p className="error">{error}</p>
          <button type="button" className="link-button" onClick={() => loadTransactions()}>
            重新載入
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <p>目前尚無交易資料。</p>
      ) : (
        <div className="admin-wallet__table">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "180px" }}>建立時間</th>
                <th style={{ width: "120px" }}>類型</th>
                <th style={{ width: "120px" }}>金額</th>
                <th style={{ width: "120px" }}>狀態</th>
                <th>使用者</th>
                <th style={{ width: "220px" }}>對應目標</th>
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
                      <div>{transaction.user?.name || "(未命名)"}</div>
                      <div className="admin-wallet__muted">{transaction.user?.email}</div>
                    </td>
                    <td>
                      {transaction.type === "WITHDRAW"
                        ? transaction.targetAddress || "—"
                        : transaction.relatedHomeCard?.title || transaction.relatedResponse?.id || "—"}
                    </td>
                    <td>{transaction.txHash || "—"}</td>
                    <td>
                      {transaction.type === "WITHDRAW" && !["COMPLETED", "FAILED"].includes(transaction.status) ? (
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
                              const confirmed = window.confirm("確定要將此提領標記為失敗並退回款項？");
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
            <button type="button" disabled={page === 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
              上一頁
            </button>
            <span>
              第 {page} / {totalPages} 頁，共 {pagination.total} 筆
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
  );

  const renderRules = () => (
    <section className="admin-section__card">
      <header className="admin-section__card-header">
        <div>
          <h2>代幣發送規則</h2>
          <p>設定錄音獎勵與檢舉門檻，將自動套用於後台排程。</p>
        </div>
      </header>

      {!canManageRules ? (
        <p>僅限管理員維護發送規則。</p>
      ) : ruleLoading ? (
        <p>載入規則中...</p>
      ) : ruleError ? (
        <div>
          <p className="error">{ruleError}</p>
          <button type="button" className="link-button" onClick={loadRewardRule}>
            重新載入
          </button>
        </div>
      ) : (
        <form className="admin-form" onSubmit={handleRuleSubmit}>
          <div className="admin-form__row admin-form__row--equal">
            <label className="admin-form__field">
              <span>獎勵代幣數量</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={ruleForm.rewardTokens}
                onChange={(event) => handleRuleInputChange("rewardTokens", event.target.value)}
                required
              />
              <small className="admin-wallet__muted">單位：Start Pray 代幣</small>
            </label>
            <label className="admin-form__field">
              <span>觀察天數</span>
              <input
                type="number"
                min="1"
                value={ruleForm.observationDays}
                onChange={(event) => handleRuleInputChange("observationDays", event.target.value)}
                required
              />
              <small className="admin-wallet__muted">錄音完成後等待的天數</small>
            </label>
            <label className="admin-form__field">
              <span>允許檢舉次數</span>
              <input
                type="number"
                min="0"
                value={ruleForm.allowedReports}
                onChange={(event) => handleRuleInputChange("allowedReports", event.target.value)}
                required
              />
              <small className="admin-wallet__muted">超過門檻將不發放代幣</small>
            </label>
          </div>

          {ruleError ? <p className="error">{ruleError}</p> : null}
          {ruleFeedback ? <p className="success">{ruleFeedback}</p> : null}

          <div className="admin-form__actions">
            <button type="submit" className="button button--primary" disabled={ruleSubmitting}>
              {ruleSubmitting ? "儲存中..." : "儲存規則"}
            </button>
          </div>
        </form>
      )}
    </section>
  );

  const renderBalances = () => (
    <section className="admin-section__card">
      <header className="admin-section__card-header">
        <div>
          <h2>使用者餘額</h2>
          <p>列出目前持有最多代幣的使用者，方便追蹤與審核。</p>
        </div>
      </header>

      {sessionRole !== "SUPER" ? (
        <p>僅限超級管理員檢視使用者餘額。</p>
      ) : balancesLoading ? (
        <p>載入中...</p>
      ) : balancesError ? (
        <div>
          <p className="error">{balancesError}</p>
          <button type="button" className="link-button" onClick={loadBalances}>
            重新載入
          </button>
        </div>
      ) : balances.length === 0 ? (
        <p>目前沒有可顯示的餘額資料。</p>
      ) : (
        <div className="admin-wallet__table">
          <table className="admin-table">
            <thead>
              <tr>
                <th>使用者</th>
                <th>Email</th>
                <th>Username</th>
                <th style={{ width: "140px" }}>可用代幣</th>
                <th style={{ width: "120px" }}>錄音數</th>
                <th style={{ width: "180px" }}>建立時間</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || "(未命名)"}</td>
                  <td>{user.email}</td>
                  <td>{user.username || "—"}</td>
                  <td>{formatTokenAmount(user.walletBalance)}</td>
                  <td>{user.responsesCount}</td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">錢包與代幣管理</p>
          <h1>代幣控制台</h1>
          <p>管理 Start Pray 代幣發放、提領與使用者餘額。</p>
        </div>
      </header>

      <div className="admin-tabs">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-tab${tab.id === activeTab ? " admin-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {canViewTransactions && activeTab === "overview" && renderOverview()}
      {canViewTransactions && activeTab === "history" && renderHistory()}
      {canManageRules && activeTab === "rules" && renderRules()}
      {sessionRole === "SUPER" && activeTab === "balances" && renderBalances()}
    </div>
  );
}

