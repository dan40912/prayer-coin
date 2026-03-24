"use client";

import { useEffect, useState } from "react";

import AdminHintPanel from "@/components/admin/AdminHintPanel";
import { useAdminFeedback } from "@/components/admin/useAdminFeedback";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function AdminPrayforPage() {
  const { feedbackNode, confirmAction, notifyError, notifySuccess } = useAdminFeedback();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [actionId, setActionId] = useState(null);
  const debouncedSearch = useDebouncedValue(search, 400);

  const loadCards = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search: debouncedSearch,
        status,
        sort,
        order,
        page: String(page),
        limit: "10",
      });

      const res = await fetch(`/api/admin/prayfor?${query.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("無法取得禱告事項");
      const result = await res.json();
      setCards(result.data ?? []);
      setPagination(result.pagination ?? { total: 0, totalPages: 1 });
    } catch (err) {
      notifyError(err.message || "載入禱告事項失敗");
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (id, block) => {
    const shouldContinue = await confirmAction({
      title: block ? "確認封鎖禱告事項" : "確認解除封鎖",
      message: block
        ? "封鎖後該內容將不再公開顯示。"
        : "解除封鎖後該內容將回復公開狀態。",
      confirmText: block ? "確認封鎖" : "確認解除",
      tone: "warning",
    });

    if (!shouldContinue) return;

    try {
      setActionId(id);
      const res = await fetch(`/api/admin/prayfor`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, block }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "更新狀態失敗");
      }
      const updated = await res.json();
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      notifySuccess(block ? "已封鎖禱告事項" : "已解除封鎖");
    } catch (err) {
      notifyError(err.message || "更新狀態失敗");
    } finally {
      setActionId(null);
    }
  };

  useEffect(() => {
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status, sort, order, page]);

  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">祈禱牆管理</p>
          <h1>禱告事項</h1>
        </div>
        <div className="admin-section__filters">
          <input
            type="search"
            placeholder="搜尋標題或描述"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">全部</option>
            <option value="active">啟用中</option>
            <option value="blocked">已封鎖</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="createdAt">建立時間</option>
            <option value="reportCount">檢舉次數</option>
          </select>
          <select value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="desc">由新到舊</option>
            <option value="asc">由舊到新</option>
          </select>
        </div>
      </header>

      <AdminHintPanel
        title="審核提示"
        tone="warning"
        description="建議先依檢舉次數排序，再逐筆確認內容與作者資訊。"
        items={["先看建立時間與作者，避免誤封新發佈內容。", "若是大量案件，請按頁面分批處理。"]}
      />

      {loading ? (
        <p>載入中...</p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>標題</th>
                  <th>作者</th>
                  <th>狀態</th>
                  <th>檢舉次數</th>
                  <th>建立時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {cards.length === 0 ? (
                  <tr>
                    <td colSpan={6}>沒有資料</td>
                  </tr>
                ) : (
                  cards.map((card) => (
                    <tr key={card.id}>
                      <td>{card.title}</td>
                      <td>{card.owner?.name || card.owner?.email || "匿名"}</td>
                      <td>
                        {card.isBlocked ? (
                          <span className="status-badge status-badge--blocked">已封鎖</span>
                        ) : (
                          <span className="status-badge status-badge--active">啟用中</span>
                        )}
                      </td>
                      <td>{card.reportCount}</td>
                      <td>{new Date(card.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => toggleBlock(card.id, !card.isBlocked)}
                          disabled={actionId === card.id}
                        >
                          {actionId === card.id ? "處理中..." : card.isBlocked ? "解除封鎖" : "封鎖"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
              上一頁
            </button>
            <span>
              {page} / {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages || 1))}
              disabled={page === (pagination.totalPages || 1)}
            >
              下一頁
            </button>
          </div>
        </>
      )}
      {feedbackNode}
    </div>
  );
}
