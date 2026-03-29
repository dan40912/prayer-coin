"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function createEmptyForm() {
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
    isBlocked: false,
    reportCount: 0,
    createdAt: null,
    updatedAt: null,
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
    isBlocked: Boolean(user.isBlocked),
    reportCount: Number(user.reportCount || 0),
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
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

export default function AdminLinkedUserEditor({
  open,
  userId,
  roleLabel = "使用者",
  confirmAction,
  notifyError,
  notifySuccess,
  onClose,
  onUpdated,
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(createEmptyForm());
  const [originalForm, setOriginalForm] = useState(createEmptyForm());

  const isDirty = useMemo(
    () => JSON.stringify(sanitizeForPayload(form)) !== JSON.stringify(sanitizeForPayload(originalForm)),
    [form, originalForm],
  );

  const loadUser = useCallback(async () => {
    if (!open || !userId) return;

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/admin/users/${userId}`, { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "無法取得使用者詳情");
      }

      const user = await res.json();
      const mapped = mapUserToEditForm(user);
      setForm(mapped);
      setOriginalForm(mapped);
    } catch (err) {
      setError(err.message || "無法取得使用者詳情");
    } finally {
      setLoading(false);
    }
  }, [open, userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        void requestClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, saving, isDirty]);

  const requestClose = useCallback(async () => {
    if (saving) return;

    if (isDirty) {
      const shouldClose = await confirmAction({
        title: "尚未儲存變更",
        message: "目前有尚未儲存的內容，確定要關閉嗎？",
        confirmText: "關閉",
        cancelText: "繼續編輯",
        tone: "warning",
      });
      if (!shouldClose) return;
    }

    onClose?.();
    setLoading(false);
    setSaving(false);
    setError("");
    setForm(createEmptyForm());
    setOriginalForm(createEmptyForm());
  }, [confirmAction, isDirty, onClose, saving]);

  const handleEditField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.id) return;

    const shouldContinue = await confirmAction({
      title: "確認儲存使用者資料",
      message: `儲存後將更新${roleLabel}資料，是否繼續？`,
      confirmText: "儲存",
      tone: "warning",
    });
    if (!shouldContinue) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/users/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizeForPayload(form)),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "更新使用者失敗");
      }

      const updated = await res.json();
      const mapped = mapUserToEditForm(updated);
      setForm(mapped);
      setOriginalForm(mapped);
      onUpdated?.(updated);
      notifySuccess?.(`${roleLabel}資料已更新`);
    } catch (err) {
      notifyError?.(err.message || "更新使用者失敗");
    } finally {
      setSaving(false);
    }
  }, [confirmAction, form, notifyError, notifySuccess, onUpdated, roleLabel]);

  if (!open || !userId) return null;

  const publicProfileHref = form.username ? `/overcomer/${form.username}` : "";

  return (
    <div className="admin-editor admin-editor--child" role="dialog" aria-modal="true" aria-label={`${roleLabel}編輯`}>
      <div className="admin-editor__backdrop" onClick={() => void requestClose()} />
      <section className="admin-editor__dialog">
        <header className="admin-editor__header">
          <div>
            <p className="admin-editor__eyebrow">{roleLabel}資料</p>
            <h3>{form.id ? `${roleLabel} #${form.id}` : roleLabel}</h3>
          </div>
          <button type="button" className="button button--ghost" onClick={() => void requestClose()} disabled={saving}>
            關閉
          </button>
        </header>

        {loading ? (
          <p className="admin-editor__status">載入中...</p>
        ) : error ? (
          <div className="admin-editor__status admin-editor__status--error">
            <p>{error}</p>
            <button type="button" className="button button--ghost" onClick={() => void loadUser()}>
              重新載入
            </button>
          </div>
        ) : (
          <>
            <section className="admin-editor__preview">
              <div className="admin-editor__preview-media admin-editor__preview-media--avatar">
                {form.avatarUrl ? <img src={form.avatarUrl} alt={form.name || "avatar"} /> : <span>無頭像</span>}
              </div>

              <div className="admin-editor__preview-content">
                <h4>{form.name || "未設定姓名"}</h4>
                <p>{form.bio || "（無個人簡介）"}</p>
                <div className="admin-editor__preview-meta">
                  <span>Username：{form.username || "-"}</span>
                  <span>Email：{form.email || "-"}</span>
                  <span>國家：{form.country || "-"}</span>
                  <span>封鎖狀態：{form.isBlocked ? "封鎖中" : "啟用中"}</span>
                  <span>檢舉數：{form.reportCount ?? 0}</span>
                  <span>建立：{form.createdAt ? new Date(form.createdAt).toLocaleString() : "-"}</span>
                  <span>更新：{form.updatedAt ? new Date(form.updatedAt).toLocaleString() : "-"}</span>
                </div>
                {publicProfileHref ? (
                  <a className="admin-editor__preview-link" href={publicProfileHref} target="_blank" rel="noreferrer">
                    開啟公開頁面
                  </a>
                ) : null}
              </div>
            </section>

            <section className="admin-editor__form">
              <div className="admin-editor__grid">
                <label className="admin-editor__field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => handleEditField("email", event.target.value)}
                    placeholder="user@example.com"
                  />
                </label>

                <label className="admin-editor__field">
                  <span>姓名</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => handleEditField("name", event.target.value)}
                    placeholder="請輸入使用者姓名"
                  />
                </label>

                <label className="admin-editor__field">
                  <span>Username</span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(event) => handleEditField("username", event.target.value)}
                    placeholder="username"
                  />
                </label>

                <label className="admin-editor__field">
                  <span>信仰傳統</span>
                  <input
                    type="text"
                    value={form.faithTradition}
                    onChange={(event) => handleEditField("faithTradition", event.target.value)}
                    placeholder="例如：基督教"
                  />
                </label>

                <label className="admin-editor__field">
                  <span>國家</span>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(event) => handleEditField("country", event.target.value)}
                    placeholder="例如：Taiwan"
                  />
                </label>

                <label className="admin-editor__field admin-editor__field--full">
                  <span>頭像 URL</span>
                  <input
                    type="url"
                    value={form.avatarUrl}
                    onChange={(event) => handleEditField("avatarUrl", event.target.value)}
                    placeholder="https://..."
                  />
                </label>

                <label className="admin-editor__field admin-editor__field--full">
                  <span>個人簡介</span>
                  <textarea
                    rows={4}
                    value={form.bio}
                    onChange={(event) => handleEditField("bio", event.target.value)}
                    placeholder="請輸入公開個人簡介"
                  />
                </label>

                <label className="admin-editor__field">
                  <span>Solana 地址</span>
                  <input
                    type="text"
                    value={form.solanaAddress}
                    onChange={(event) => handleEditField("solanaAddress", event.target.value)}
                    placeholder="Solana wallet"
                  />
                </label>

                <label className="admin-editor__field">
                  <span>BSC 地址</span>
                  <input
                    type="text"
                    value={form.bscAddress}
                    onChange={(event) => handleEditField("bscAddress", event.target.value)}
                    placeholder="BSC wallet"
                  />
                </label>
              </div>

              <label className="admin-editor__checkbox">
                <input
                  type="checkbox"
                  checked={form.isAddressVerified}
                  onChange={(event) => handleEditField("isAddressVerified", event.target.checked)}
                />
                <span>錢包地址已驗證</span>
              </label>
            </section>

            <footer className="admin-editor__actions">
              <button type="button" className="button button--ghost" onClick={() => void requestClose()} disabled={saving}>
                取消
              </button>
              <button type="button" className="button button--primary" onClick={() => void handleSave()} disabled={saving}>
                {saving ? "儲存中..." : "儲存變更"}
              </button>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}

