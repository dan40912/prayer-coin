"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const SESSION_STORAGE_KEY = "prayer-coin-admin-session";
const ROLE_OPTIONS = [
  { value: "SUPER", label: "超級管理員" },
  { value: "ADMIN", label: "一般管理員" },
];

function readSessionRole() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.role ?? null;
  } catch (error) {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export default function SettingsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username: "", password: "", role: "ADMIN" });
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [sessionRole, setSessionRole] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [siteSettings, setSiteSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);

  useEffect(() => {
    const role = readSessionRole();
    setSessionRole(role);
    setSessionChecked(true);
  }, []);

  const loadSiteSettings = useCallback(async () => {
    if (!sessionRole) {
      setSettingsLoading(false);
      return;
    }

    if (sessionRole !== "SUPER" && sessionRole !== "ADMIN") {
      setSettingsError("僅限管理員存取系統設定");
      setSettingsLoading(false);
      setSiteSettings(null);
      return;
    }

    try {
      setSettingsLoading(true);
      setSettingsError("");

      const response = await fetch("/api/admin/site-settings", {
        cache: "no-store",
        headers: {
          "x-admin-role": sessionRole ?? "",
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "無法載入系統設定");
      }

      const data = await response.json();
      setSiteSettings(data);
    } catch (err) {
      console.error("載入系統設定時發生錯誤:", err);
      setSettingsError(err.message || "無法載入系統設定");
      setSiteSettings(null);
    } finally {
      setSettingsLoading(false);
    }
  }, [sessionRole]);

  const loadAccounts = useCallback(async () => {
    if (sessionRole !== "SUPER") {
      setLoading(false);
      if (sessionRole !== null) {
        setError("只有超級管理員可以管理後台帳號");
      }
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/accounts", {
        cache: "no-store",
        headers: {
          "x-admin-role": sessionRole ?? "",
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "無法載入管理員列表");
      }

      const data = await response.json();
      setAccounts(data ?? []);
    } catch (err) {
      console.error("載入管理員帳號失敗:", err);
      setError(err.message || "無法載入管理員列表");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [sessionRole]);

  useEffect(() => {
    if (!sessionChecked) return;
    loadSiteSettings();
    loadAccounts();
  }, [sessionChecked, loadSiteSettings, loadAccounts]);

  const handleToggleMaintenance = async () => {
    if (!siteSettings || settingsSubmitting) {
      return;
    }

    if (sessionRole !== "SUPER" && sessionRole !== "ADMIN") {
      setSettingsError("沒有權限更新系統設定");
      return;
    }

    try {
      setSettingsSubmitting(true);
      setSettingsError("");

      const response = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": sessionRole ?? "",
        },
        body: JSON.stringify({
          maintenanceMode: !siteSettings.maintenanceMode,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "更新維護模式失敗");
      }

      const data = await response.json();
      setSiteSettings(data);
    } catch (err) {
      console.error("切換維護模式錯誤:", err);
      setSettingsError(err.message || "更新維護模式失敗");
    } finally {
      setSettingsSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();

    if (sessionRole !== "SUPER") {
      setFormError("沒有權限執行此操作");
      return;
    }

    if (!form.username.trim() || !form.password.trim()) {
      setFormError("請輸入帳號與密碼");
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError("");

      const response = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": sessionRole ?? "",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "新增管理員失敗");
      }

      setForm({ username: "", password: "", role: form.role });
      await loadAccounts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActive = async (account) => {
    if (sessionRole !== "SUPER") {
      alert("沒有權限");
      return;
    }

    try {
      const response = await fetch(`/api/admin/accounts/${account.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": sessionRole ?? "",
        },
        body: JSON.stringify({ isActive: !account.isActive }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "更新失敗");
      }

      await loadAccounts();
    } catch (err) {
      alert(`⚠ ${err.message}`);
    }
  };

  const handleChangeRole = async (account, role) => {
    if (sessionRole !== "SUPER") {
      alert("沒有權限");
      return;
    }

    try {
      const response = await fetch(`/api/admin/accounts/${account.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": sessionRole ?? "",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "更新角色失敗");
      }

      await loadAccounts();
    } catch (err) {
      alert(`⚠ ${err.message}`);
    }
  };

  const accountsSummary = useMemo(() => {
    const total = accounts.length;
    const superAdmins = accounts.filter((account) => account.role === "SUPER" && account.isActive).length;
    return { total, superAdmins };
  }, [accounts]);

  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">權限與後台帳號</p>
          <h1>權限管理</h1>
          <p>管理可以登入系統後台的管理員帳號與權限角色。</p>
        </div>
      </header>

      <section className="admin-section__card">
        <header className="admin-section__card-header">
          <div>
            <h2>Maintenance Mode</h2>
            <p>Toggle to display a maintenance 500 page for public visitors.</p>
          </div>
        </header>

        {settingsLoading ? (
          <p>Loading settings...</p>
        ) : settingsError ? (
          <p className="error">{settingsError}</p>
        ) : siteSettings ? (
          <div className="admin-maintenance">
            <div className="admin-maintenance__status">
              <p>
                Current status:{" "}
                <strong>{siteSettings.maintenanceMode ? "Maintenance" : "Online"}</strong>
              </p>
              {siteSettings.updatedAt ? (
                <p className="admin-maintenance__meta">
                  Last updated: {new Date(siteSettings.updatedAt).toLocaleString()}
                </p>
              ) : null}
            </div>
            <div className="admin-maintenance__actions">
              <button
                type="button"
                className="button button--primary"
                onClick={handleToggleMaintenance}
                disabled={settingsSubmitting}
              >
                {settingsSubmitting
                  ? "Applying..."
                  : siteSettings.maintenanceMode
                    ? "Disable maintenance"
                    : "Enable maintenance"}
              </button>
            </div>
          </div>
        ) : (
          <p className="error">Unable to load settings.</p>
        )}
      </section>

      <section className="admin-section__card">
        <header className="admin-section__card-header">
          <div>
            <h2>管理員列表</h2>
            <p>目前共有 {accountsSummary.total} 位管理員，其中 {accountsSummary.superAdmins} 位為啟用中的超級管理員。</p>
          </div>
        </header>

        {loading ? (
          <p>載入中…</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>帳號</th>
                <th>角色</th>
                <th>狀態</th>
                <th>最後登入</th>
                <th>建立時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={6}>目前尚未建立管理員帳號</td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.username}</td>
                    <td>
                      <select
                        value={account.role}
                        onChange={(event) => handleChangeRole(account, event.target.value)}
                        disabled={sessionRole !== "SUPER"}
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {account.isActive ? (
                        <span className="status-badge status-badge--active">啟用</span>
                      ) : (
                        <span className="status-badge status-badge--blocked">停用</span>
                      )}
                    </td>
                    <td>{account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString() : "—"}</td>
                    <td>{new Date(account.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="admin-wallet__actions">
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => handleToggleActive(account)}
                        >
                          {account.isActive ? "停用" : "啟用"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>

      <section className="admin-section__card">
        <header className="admin-section__card-header">
          <div>
            <h2>新增管理員</h2>
            <p>建立新的管理員帳號，並指定可存取的權限範圍。</p>
          </div>
        </header>

        <form className="admin-form" onSubmit={handleCreateAccount}>
          <div className="admin-form__row admin-form__row--equal">
            <label className="admin-form__field">
              <span>帳號</span>
              <input
                type="text"
                value={form.username}
                onChange={(event) => handleFormChange("username", event.target.value)}
                placeholder="小寫英文字母或數字"
                disabled={formSubmitting}
                required
              />
            </label>
            <label className="admin-form__field">
              <span>密碼</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => handleFormChange("password", event.target.value)}
                placeholder="至少 4 個字元"
                minLength={4}
                disabled={formSubmitting}
                required
              />
            </label>
            <label className="admin-form__field">
              <span>角色</span>
              <select
                value={form.role}
                onChange={(event) => handleFormChange("role", event.target.value)}
                disabled={formSubmitting}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {formError ? <p className="error">{formError}</p> : null}

          <div className="admin-form__actions">
            <button type="submit" className="button button--primary" disabled={formSubmitting}>
              {formSubmitting ? "建立中…" : "建立管理員"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
