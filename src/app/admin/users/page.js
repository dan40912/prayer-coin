"use client";

import { useCallback, useEffect, useState } from "react";

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });
  const [actionUserId, setActionUserId] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        sort: "createdAt",
        order: "desc",
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (filter !== "all") {
        params.set("status", filter);
      }

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("無法取得使用者名單");
      }

      const data = await res.json();
      const nextPagination = data.pagination ?? {
        total: 0,
        page: 1,
        limit: PAGE_SIZE,
        totalPages: 1,
      };
      const totalPages = Math.max(nextPagination.totalPages || 1, 1);

      if (page > totalPages) {
        setPage(totalPages);
        setPagination(nextPagination);
        setUsers(data.data ?? []);
        return;
      }

      setUsers(data.data ?? []);
      setPagination(nextPagination);
    } catch (err) {
      console.error("載入使用者失敗:", err);
      setError(err.message || "無法取得使用者名單");
    } finally {
      setLoading(false);
    }
  }, [filter, page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleBlock = async (id, block) => {
    try {
      setActionUserId(id);
      const res = await fetch(`/api/admin/users/${id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ block }),
      });

      if (!res.ok) {
        throw new Error("更新狀態失敗");
      }

      await loadUsers();
    } catch (err) {
      alert(`⚠ ${err.message}`);
    } finally {
      setActionUserId(null);
    }
  };

  const totalPages = Math.max(pagination.totalPages || 1, 1);

  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">使用者與權限管理</p>
          <h1>用戶管理</h1>
        </div>
      </header>

      <section className="admin-section__card">
        <header className="admin-section__card-header">
          <div>
            <h2>用戶列表</h2>
            <p>透過搜尋與篩選快速找到需要關注的用戶。</p>
          </div>
          <div className="admin-section__filters">
            <input
              type="search"
              placeholder="以姓名或 Email 搜尋"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <select
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">全部</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </header>

        {loading ? (
          <p>載入中…</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>Email</th>
                  <th>檢舉次數</th>
                  <th>狀態</th>
                  <th>最後更新</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6}>目前沒有符合條件的使用者</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name || "尚未設定"}</td>
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
                        {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "—"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => handleToggleBlock(user.id, !user.isBlocked)}
                          disabled={actionUserId === user.id}
                        >
                          {actionUserId === user.id
                            ? "處理中…"
                            : user.isBlocked
                            ? "解除封鎖"
                            : "封鎖"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                上一頁
              </button>
              <span>
                第 {page} / {totalPages} 頁
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                下一頁
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
