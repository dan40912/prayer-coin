"use client";

import { useEffect, useState } from "react";

import AdminHintPanel from "@/components/admin/AdminHintPanel";
import { useAdminFeedback } from "@/components/admin/useAdminFeedback";

const EMPTY_FORM = {
  eyebrow: "",
  headline: "",
  subheadline: "",
  description: "",
  primaryCtaLabel: "",
  primaryCtaHref: "",
  secondaryCtaLabel: "",
  secondaryCtaHref: "",
  heroImage: "",
};

export default function AdminContentPage() {
  const { feedbackNode, confirmAction, notifyError, notifySuccess } = useAdminFeedback();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetEditor = () => {
    setEditingBanner(null);
    setForm(EMPTY_FORM);
    setShowModal(false);
  };

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/banners", { cache: "no-store" });
      if (!res.ok) throw new Error("無法取得 Banner");
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      notifyError(err.message || "載入 Banner 失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const method = editingBanner ? "PATCH" : "POST";
      const url = editingBanner ? `/api/admin/banners/${editingBanner.id}` : "/api/admin/banners";

      const payload = editingBanner ? { ...form, id: editingBanner.id } : form;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "儲存失敗");
      }

      await loadBanners();
      resetEditor();
      notifySuccess(editingBanner ? "Banner 已更新" : "Banner 已新增");
    } catch (err) {
      notifyError(err.message || "儲存失敗");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const shouldContinue = await confirmAction({
      title: "確認刪除 Banner",
      message: "刪除後無法復原，確定要繼續嗎？",
      confirmText: "確認刪除",
      tone: "danger",
    });
    if (!shouldContinue) return;

    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "刪除失敗");
      }
      await loadBanners();
      resetEditor();
      notifySuccess("Banner 已刪除");
    } catch (err) {
      notifyError(err.message || "刪除失敗");
    }
  };

  const openModal = (banner = null) => {
    setEditingBanner(banner);
    setForm(
      banner
        ? {
            ...EMPTY_FORM,
            ...banner,
          }
        : EMPTY_FORM,
    );
    setShowModal(true);
  };

  useEffect(() => {
    loadBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">內容管理</p>
          <h1>Banner 管理</h1>
        </div>
        <button className="button button--primary" onClick={() => openModal(null)}>
          新增 Banner
        </button>
      </header>

      <AdminHintPanel
        title="內容發布提示"
        description="發布前請先檢查標題、CTA 連結與 Hero 圖片比例。"
        items={["建議每次只修改一個主題，方便追蹤問題。", "高流量時段前先在預覽環境確認顯示結果。"]}
      />

      <section className="admin-section__card">
        <h2>Banner 清單</h2>
        {loading ? (
          <p>載入中...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Eyebrow</th>
                  <th>主標題</th>
                  <th>副標題</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan={4}>目前沒有 Banner</td>
                  </tr>
                ) : (
                  banners.map((banner) => (
                    <tr key={banner.id}>
                      <td>{banner.eyebrow || "—"}</td>
                      <td>{banner.headline}</td>
                      <td>{banner.subheadline}</td>
                      <td>
                        <button className="link-button" onClick={() => openModal(banner)}>
                          編輯
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showModal ? (
        <div className="modal">
          <div className="modal__overlay" onClick={resetEditor} />
          <div className="modal__content">
            <h2>{editingBanner ? "編輯 Banner" : "新增 Banner"}</h2>
            <form className="dashboard-form" onSubmit={handleSubmit}>
              <div className="dashboard-form__row">
                <label>
                  <span>Eyebrow</span>
                  <input type="text" value={form.eyebrow} onChange={(e) => updateForm("eyebrow", e.target.value)} />
                </label>
                <label>
                  <span>主標題</span>
                  <input type="text" value={form.headline} onChange={(e) => updateForm("headline", e.target.value)} required />
                </label>
              </div>
              <div className="dashboard-form__row">
                <label>
                  <span>副標題</span>
                  <input
                    type="text"
                    value={form.subheadline}
                    onChange={(e) => updateForm("subheadline", e.target.value)}
                  />
                </label>
              </div>
              <div className="dashboard-form__row">
                <label>
                  <span>說明文字</span>
                  <textarea rows={3} value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
                </label>
              </div>
              <div className="dashboard-form__row dashboard-form__row--equal">
                <label>
                  <span>主按鈕文字</span>
                  <input
                    type="text"
                    value={form.primaryCtaLabel}
                    onChange={(e) => updateForm("primaryCtaLabel", e.target.value)}
                  />
                </label>
                <label>
                  <span>主按鈕連結</span>
                  <input
                    type="text"
                    value={form.primaryCtaHref}
                    onChange={(e) => updateForm("primaryCtaHref", e.target.value)}
                  />
                </label>
              </div>
              <div className="dashboard-form__row dashboard-form__row--equal">
                <label>
                  <span>副按鈕文字</span>
                  <input
                    type="text"
                    value={form.secondaryCtaLabel}
                    onChange={(e) => updateForm("secondaryCtaLabel", e.target.value)}
                  />
                </label>
                <label>
                  <span>副按鈕連結</span>
                  <input
                    type="text"
                    value={form.secondaryCtaHref}
                    onChange={(e) => updateForm("secondaryCtaHref", e.target.value)}
                  />
                </label>
              </div>
              <div className="dashboard-form__row">
                <label>
                  <span>Hero 圖片 URL</span>
                  <input type="text" value={form.heroImage} onChange={(e) => updateForm("heroImage", e.target.value)} />
                </label>
                {form.heroImage ? (
                  <div className="dashboard-form__preview">
                    <span>預覽</span>
                    <img src={form.heroImage} alt="Hero 預覽" />
                  </div>
                ) : null}
              </div>
              <div className="dashboard-form__actions">
                {editingBanner ? (
                  <button
                    type="button"
                    className="button button--danger"
                    onClick={() => handleDelete(editingBanner.id)}
                    disabled={submitting}
                  >
                    刪除
                  </button>
                ) : null}
                <button type="button" className="button button--ghost" onClick={resetEditor} disabled={submitting}>
                  取消
                </button>
                <button type="submit" className="button button--primary" disabled={submitting}>
                  {submitting ? "儲存中..." : editingBanner ? "儲存變更" : "新增 Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      {feedbackNode}
    </div>
  );
}
