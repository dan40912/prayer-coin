"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionUserId, setActionUserId] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });

  const debouncedSearch = useDebouncedValue(search, 400);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        sort: "createdAt",
        order: "desc",
      });

      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }

      if (filter !== "all") {
        params.set("status", filter);
      }

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("無法取得使用者列表");
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
      }

      setUsers(data.data ?? []);
      setPagination(nextPagination);
    } catch (err) {
      console.error("載入使用者失敗", err);
      setError(err.message || "無法取得使用者列表");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filter, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleBlock = async (id, block) => {
    const shouldContinue = confirm(block ? "確定要封鎖這位使用者？" : "確定要解除封鎖這位使用者？");
    if (!shouldContinue) return;

    try {
      setActionUserId(id);
      const res = await fetch(`/api/admin/users/${id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ block }),
      });

      if (!res.ok) {
        throw new Error("更新使用者狀態失敗");
      }

      await loadUsers();
    } catch (err) {
      alert(`操作失敗：${err.message}`);
    } finally {
      setActionUserId(null);
    }
  };

  const totalPages = Math.max(pagination.totalPages || 1, 1);

  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">使用者管理</p>
          <h1>會員清單</h1>
        </div>
      </header>

      <section className="admin-section__card">
        <header className="admin-section__card-header">
          <div>
            <h2>使用者列表</h2>
            <p>支援依姓名、Email 搜尋與狀態篩選。</p>
          </div>
          <div className="admin-section__filters">
            <input
              type="search"
              placeholder="搜尋姓名或 Email"
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
              <option value="active">啟用中</option>
              <option value="blocked">已封鎖</option>
            </select>
          </div>
        </header>

        {loading ? (
          <p>載入中...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>名稱</th>
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
                        <td>{user.name || "未設定名稱"}</td>
                        <td>{user.email}</td>
                        <td>{user.reportCount ?? 0}</td>
                        <td>
                          {user.isBlocked ? (
                            <span className="status-badge status-badge--blocked">已封鎖</span>
                          ) : (
                            <span className="status-badge status-badge--active">啟用中</span>
                          )}
                        </td>
                        <td>{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "—"}</td>
                        <td>
                          <button
                            type="button"
                            className="link-button"
                            onClick={() => handleToggleBlock(user.id, !user.isBlocked)}
                            disabled={actionUserId === user.id}
                          >
                            {actionUserId === user.id ? "處理中..." : user.isBlocked ? "解除封鎖" : "封鎖"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
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
