"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import AdminHintPanel from "@/components/admin/AdminHintPanel";
import { useAdminFeedback } from "@/components/admin/useAdminFeedback";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const PAGE_SIZE = 10;

function createEmptyEditForm() {
  return {
    id: "",
    email: "",
    name: "",
    username: "",
    faithTradition: "",
    country: "",
    avatarUrl: "",
    bio: "",
    solanaAddress: "",
    bscAddress: "",
    isAddressVerified: false,
  };
}

function mapUserToEditForm(user) {
  return {
    id: user.id,
    email: user.email || "",
    name: user.name || "",
    username: user.username || "",
    faithTradition: user.faithTradition || "",
    country: user.country || "",
    avatarUrl: user.avatarUrl || "",
    bio: user.bio || "",
    solanaAddress: user.solanaAddress || "",
    bscAddress: user.bscAddress || "",
    isAddressVerified: Boolean(user.isAddressVerified),
  };
}

function sanitizeForPayload(form) {
  return {
    email: form.email,
    name: form.name,
    username: form.username,
    faithTradition: form.faithTradition,
    country: form.country,
    avatarUrl: form.avatarUrl,
    bio: form.bio,
    solanaAddress: form.solanaAddress,
    bscAddress: form.bscAddress,
    isAddressVerified: Boolean(form.isAddressVerified),
  };
}

export default function AdminUsersPage() {
  const { feedbackNode, confirmAction, notifyError, notifySuccess } = useAdminFeedback();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [blockActionUserId, setBlockActionUserId] = useState(null);
  const [loadingEditUserId, setLoadingEditUserId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editForm, setEditForm] = useState(createEmptyEditForm());
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
        throw new Error("無法取得使用者資料");
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
      setError(err.message || "無法取得使用者資料");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filter, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleBlock = useCallback(
    async (id, block) => {
      const shouldContinue = await confirmAction({
        title: block ? "確認封鎖使用者" : "確認解除封鎖",
        message: block
          ? "封鎖後該使用者將無法正常使用部分功能。"
          : "解除封鎖後該使用者將恢復功能使用。",
        confirmText: block ? "確認封鎖" : "確認解除",
        tone: "warning",
      });

      if (!shouldContinue) return;

      try {
        setBlockActionUserId(id);
        const res = await fetch(`/api/admin/users/${id}/block`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ block }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "更新使用者狀態失敗");
        }

        await loadUsers();
        notifySuccess(block ? "已封鎖使用者" : "已解除封鎖");
      } catch (err) {
        notifyError(err.message || "更新使用者狀態失敗");
      } finally {
        setBlockActionUserId(null);
      }
    },
    [confirmAction, loadUsers, notifyError, notifySuccess],
  );

  const openEditor = useCallback(
    async (id) => {
      try {
        setLoadingEditUserId(id);
        const res = await fetch(`/api/admin/users/${id}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "無法取得使用者詳細資料");
        }

        const user = await res.json();
        setEditForm(mapUserToEditForm(user));
        setEditorOpen(true);
      } catch (err) {
        notifyError(err.message || "無法取得使用者詳細資料");
      } finally {
        setLoadingEditUserId(null);
      }
    },
    [notifyError],
  );

  const closeEditor = useCallback(() => {
    if (savingEdit) return;
    setEditorOpen(false);
    setEditForm(createEmptyEditForm());
  }, [savingEdit]);

  const handleEditField = useCallback((key, value) => {
    setEditForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSaveEdit = useCallback(async () => {
    const shouldContinue = await confirmAction({
      title: "確認更新使用者資料",
      message: "這會立即覆蓋目前資料，請確認欄位內容正確。",
      confirmText: "儲存變更",
      tone: "warning",
    });

    if (!shouldContinue) return;

    try {
      setSavingEdit(true);
      const payload = sanitizeForPayload(editForm);

      const res = await fetch(`/api/admin/users/${editForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "更新使用者資料失敗");
      }

      await loadUsers();
      notifySuccess("使用者資料已更新");
      setEditorOpen(false);
      setEditForm(createEmptyEditForm());
    } catch (err) {
      notifyError(err.message || "更新使用者資料失敗");
    } finally {
      setSavingEdit(false);
    }
  }, [confirmAction, editForm, loadUsers, notifyError, notifySuccess]);

  const totalPages = Math.max(pagination.totalPages || 1, 1);
  const isEditing = editorOpen && Boolean(editForm.id);
  const editorTitle = useMemo(() => {
    if (!isEditing) return "編輯使用者資料";
    return `編輯使用者：${editForm.name || editForm.email || "未命名"}`;
  }, [editForm.email, editForm.name, isEditing]);

  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">會員管理</p>
          <h1>使用者清單</h1>
        </div>
      </header>

      <AdminHintPanel
        title="管理建議"
        tone="warning"
        description="你可以透過「編輯」直接修正使用者上傳的個資欄位，封鎖操作請先二次確認。"
        items={["先比對 Email 與建立時間，避免操作錯誤帳號。", "大量處理建議分批進行，每批先複核再執行。"]}
      />

      <section className="admin-section__card">
        <header className="admin-section__card-header">
          <div>
            <h2>使用者列表</h2>
            <p>可依姓名、Email 及狀態快速搜尋，並進行個別編輯。</p>
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
                        <td>{user.name || "未命名"}</td>
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
                          <div className="admin-user-actions">
                            <button
                              type="button"
                              className="link-button"
                              onClick={() => openEditor(user.id)}
                              disabled={loadingEditUserId === user.id || blockActionUserId === user.id}
                            >
                              {loadingEditUserId === user.id ? "載入中..." : "編輯"}
                            </button>
                            <button
                              type="button"
                              className="link-button"
                              onClick={() => handleToggleBlock(user.id, !user.isBlocked)}
                              disabled={blockActionUserId === user.id || loadingEditUserId === user.id}
                            >
                              {blockActionUserId === user.id ? "處理中..." : user.isBlocked ? "解除封鎖" : "封鎖"}
                            </button>
                          </div>
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

      {editorOpen ? (
        <div className="admin-user-editor" role="dialog" aria-modal="true" aria-label={editorTitle}>
          <div className="admin-user-editor__backdrop" onClick={closeEditor} />
          <section className="admin-user-editor__dialog">
            <header className="admin-user-editor__header">
              <div>
                <p className="admin-user-editor__eyebrow">管理員編輯模式</p>
                <h3>{editorTitle}</h3>
              </div>
              <button type="button" className="button button--ghost" onClick={closeEditor} disabled={savingEdit}>
                關閉
              </button>
            </header>

            <div className="admin-user-editor__grid">
              <label className="admin-user-editor__field">
                <span>Email</span>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(event) => handleEditField("email", event.target.value)}
                  placeholder="user@example.com"
                />
              </label>

              <label className="admin-user-editor__field">
                <span>姓名</span>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(event) => handleEditField("name", event.target.value)}
                  placeholder="使用者顯示名稱"
                />
              </label>

              <label className="admin-user-editor__field">
                <span>Username</span>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(event) => handleEditField("username", event.target.value)}
                  placeholder="username"
                />
              </label>

              <label className="admin-user-editor__field">
                <span>信仰傳統</span>
                <input
                  type="text"
                  value={editForm.faithTradition}
                  onChange={(event) => handleEditField("faithTradition", event.target.value)}
                  placeholder="例：基督教"
                />
              </label>

              <label className="admin-user-editor__field">
                <span>國家</span>
                <input
                  type="text"
                  value={editForm.country}
                  onChange={(event) => handleEditField("country", event.target.value)}
                  placeholder="例：Taiwan"
                />
              </label>

              <label className="admin-user-editor__field admin-user-editor__field--full">
                <span>頭像 URL</span>
                <input
                  type="url"
                  value={editForm.avatarUrl}
                  onChange={(event) => handleEditField("avatarUrl", event.target.value)}
                  placeholder="https://..."
                />
              </label>

              <label className="admin-user-editor__field admin-user-editor__field--full">
                <span>個人簡介</span>
                <textarea
                  rows={4}
                  value={editForm.bio}
                  onChange={(event) => handleEditField("bio", event.target.value)}
                  placeholder="可編輯使用者上傳的簡介內容"
                />
              </label>

              <label className="admin-user-editor__field">
                <span>Solana 地址</span>
                <input
                  type="text"
                  value={editForm.solanaAddress}
                  onChange={(event) => handleEditField("solanaAddress", event.target.value)}
                  placeholder="未來發幣用地址"
                />
              </label>

              <label className="admin-user-editor__field">
                <span>BSC 地址</span>
                <input
                  type="text"
                  value={editForm.bscAddress}
                  onChange={(event) => handleEditField("bscAddress", event.target.value)}
                  placeholder="未來發幣用地址"
                />
              </label>
            </div>

            <label className="admin-user-editor__checkbox">
              <input
                type="checkbox"
                checked={editForm.isAddressVerified}
                onChange={(event) => handleEditField("isAddressVerified", event.target.checked)}
              />
              <span>地址已驗證</span>
            </label>

            <footer className="admin-user-editor__actions">
              <button type="button" className="button button--ghost" onClick={closeEditor} disabled={savingEdit}>
                取消
              </button>
              <button type="button" className="button button--primary" onClick={handleSaveEdit} disabled={savingEdit}>
                {savingEdit ? "儲存中..." : "儲存變更"}
              </button>
            </footer>
          </section>
        </div>
      ) : null}
      {feedbackNode}
    </div>
  );
}
