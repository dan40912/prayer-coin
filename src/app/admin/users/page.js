"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 分頁 / 搜尋 / 篩選狀態
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | blocked

  // 載入用戶
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) throw new Error("無法取得用戶清單");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 切換封鎖狀態
  const handleToggleBlock = async (id, block) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ block }),
      });
      if (!res.ok) throw new Error("更新失敗");
      // ✅ 更新當前使用者清單
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, isBlocked: block } : u
        )
      );
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ✅ 篩選與搜尋邏輯
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "all" ||
      (filter === "active" && !user.isBlocked) ||
      (filter === "blocked" && user.isBlocked);

    return matchSearch && matchFilter;
  });

  // ✅ 分頁邏輯
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">人員與權限治理</p>
          <h1>用戶管理</h1>
        </div>
      </header>

      <section className="admin-section__card">
        <header className="admin-section__card-header">
          <div>
            <h2>用戶清單</h2>
            <p>依帳號狀態管理。</p>
          </div>
          <div className="admin-section__filters">
            <input
              type="search"
              placeholder="搜尋姓名或 Email"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // 重置頁數
              }}
            />
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
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
          <p>載入中...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>Email</th>
                  <th>狀態</th>
                  <th>上次登入</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5}>沒有符合的使用者</td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name || "（未設定）"}</td>
                      <td>{user.email}</td>
                      <td>
                        {user.isBlocked ? (
                          <span className="status-badge status-badge--blocked">
                            Blocked
                          </span>
                        ) : (
                          <span className="status-badge status-badge--active">
                            Active
                          </span>
                        )}
                      </td>
                      <td>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString()
                          : "尚未登入"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="link-button"
                          onClick={() =>
                            handleToggleBlock(user.id, !user.isBlocked)
                          }
                        >
                          {user.isBlocked ? "解除封鎖" : "封鎖"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* ✅ 分頁控制 */}
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                上一頁
              </button>
              <span>
                頁數 {page} / {totalPages || 1}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
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
