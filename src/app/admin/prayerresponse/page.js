"use client";

import { useEffect, useState } from "react";

export default function AdminPrayerResponsePage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  // 載入留言資料
  const loadResponses = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/prayerresponse?search=${search}&status=${statusFilter}&page=${page}&limit=10`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("無法取得留言");
      const data = await res.json();
      setResponses(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 切換封鎖狀態
  const handleToggleBlock = async (id, block) => {
    try {
      const res = await fetch(`/api/admin/prayerresponse/${id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ block }),
      });
      if (!res.ok) throw new Error("更新失敗");
      await loadResponses();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  useEffect(() => {
    loadResponses();
  }, [page, search, statusFilter]);

  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">內容治理</p>
          <h1>留言與錄音管理</h1>
        </div>
      </header>

      <section className="admin-section__card">
        <header className="admin-section__card-header">
          <div>
            <h2>留言清單</h2>
            <p>管理所有祈禱回應與錄音。</p>
          </div>
          <div className="admin-section__filters">
            <input
              type="search"
              placeholder="搜尋留言內容或作者"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">所有狀態</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </header>

        {loading ? (
          <p>載入中...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>作者</th>
                <th>Email</th>
                <th>留言</th>
                <th>對應卡片</th>
                <th>狀態</th>
                <th>檢舉次數</th>
                <th>建立時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {responses.length === 0 ? (
                <tr>
                  <td colSpan={8}>目前沒有留言</td>
                </tr>
              ) : (
                responses.map((resp) => (
                  <tr key={resp.id}>
                    <td>{resp.responder?.name || "匿名"}</td>
                    <td>{resp.responder?.email || "-"}</td>
                    <td>{resp.message}</td>
                    <td>{resp.homeCard?.title || "—"}</td>
                    <td>
                      {resp.isBlocked ? (
                        <span className="status-badge status-badge--blocked">
                          Blocked
                        </span>
                      ) : (
                        <span className="status-badge status-badge--active">
                          Active
                        </span>
                      )}
                    </td>
                    <td>{resp.reportCount}</td>
                    <td>{new Date(resp.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        className="link-button"
                        onClick={() =>
                          handleToggleBlock(resp.id, !resp.isBlocked)
                        }
                      >
                        {resp.isBlocked ? "解除封鎖" : "封鎖"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* 分頁控制 */}
        <div className="pagination">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            上一頁
          </button>
          <span>
            第 {page} / {pagination.totalPages} 頁
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
          >
            下一頁
          </button>
        </div>
      </section>
    </div>
  );
}
