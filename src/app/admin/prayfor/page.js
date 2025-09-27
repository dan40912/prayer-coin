"use client";

import { useEffect, useState } from "react";

export default function AdminPrayforPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const loadCards = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        status,
        sort,
        order,
        page,
        limit: 10,
      });

      const res = await fetch(`/api/admin/prayfor?${query.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("無法取得禱告事項");
      const result = await res.json();
      setCards(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error("❌ 載入失敗:", err);
    } finally {
      setLoading(false);
    }
  };

 const toggleBlock = async (id, block) => {
  try {
    const res = await fetch(`/api/admin/prayfor`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, block }),
    });
    if (!res.ok) throw new Error("更新失敗");
    const updated = await res.json();

    setCards((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  } catch (err) {
    alert("❌ " + err.message);
  }
};


  useEffect(() => {
    loadCards();
  }, [search, status, sort, order, page]);

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
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">全部</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
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

      {loading ? (
        <p>載入中...</p>
      ) : (
        <>
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
                        <span className="status-badge status-badge--blocked">
                          Blocked
                        </span>
                      ) : (
                        <span className="status-badge status-badge--active">
                          Active
                        </span>
                      )}
                    </td>
                    <td>{card.reportCount}</td>
                    <td>{new Date(card.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => toggleBlock(card.id, !card.isBlocked)}
                      >
                        {card.isBlocked ? "解除封鎖" : "封鎖"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* 分頁控制 */}
          <div className="pagination">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              上一頁
            </button>
            <span>
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(p + 1, pagination.totalPages))
              }
              disabled={page === pagination.totalPages}
            >
              下一頁
            </button>
          </div>
        </>
      )}
    </div>
  );
}
