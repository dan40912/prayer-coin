"use client";

import { useEffect, useState } from "react";

export default function AdminContentPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState({
    eyebrow: "",
    headline: "",
    subheadline: "",
    description: "",
    primaryCtaLabel: "",
    primaryCtaHref: "",
    secondaryCtaLabel: "",
    secondaryCtaHref: "",
    heroImage: "",
  });

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const loadBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners", { cache: "no-store" });
      if (!res.ok) throw new Error("無法取得 Banner");
      const data = await res.json();
      setBanners(data);
    } catch (err) {
      console.error("❌ 載入 Banner 失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingBanner ? "PATCH" : "POST";
      const url = editingBanner
        ? `/api/admin/banners/${editingBanner.id}`
        : "/api/admin/banners";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("儲存失敗");

      await loadBanners();
      setShowModal(false);
      setEditingBanner(null);
      setForm({
        eyebrow: "",
        headline: "",
        subheadline: "",
        description: "",
        primaryCtaLabel: "",
        primaryCtaHref: "",
        secondaryCtaLabel: "",
        secondaryCtaHref: "",
        heroImage: "",
      });
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("確定要刪除此 Banner 嗎？")) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("刪除失敗");
      await loadBanners();
      setShowModal(false);
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const openModal = (banner = null) => {
    setEditingBanner(banner);
    if (banner) {
      setForm(banner);
    } else {
      setForm({
        eyebrow: "",
        headline: "",
        subheadline: "",
        description: "",
        primaryCtaLabel: "",
        primaryCtaHref: "",
        secondaryCtaLabel: "",
        secondaryCtaHref: "",
        heroImage: "",
      });
    }
    setShowModal(true);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">內容管理</p>
          <h1>Banner 管理</h1>
        </div>
        <button
          className="button button--primary"
          onClick={() => openModal(null)}
        >
          ➕ 新增 Banner
        </button>
      </header>

      <section className="admin-section__card">
        <h2>Banner 清單</h2>
        {loading ? (
          <p>載入中...</p>
        ) : (
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
                      <button
                        className="link-button"
                        onClick={() => openModal(banner)}
                      >
                        編輯
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* Modal 彈窗 */}
      {showModal && (
        <div className="modal">
          <div
            className="modal__overlay"
            onClick={() => setShowModal(false)}
          />
          <div className="modal__content">
            <h2>{editingBanner ? "編輯 Banner" : "新增 Banner"}</h2>
            <form className="dashboard-form" onSubmit={handleSubmit}>
              <div className="dashboard-form__row">
                <label>
                  <span>Eyebrow 標籤</span>
                  <input
                    type="text"
                    value={form.eyebrow}
                    onChange={(e) => updateForm("eyebrow", e.target.value)}
                  />
                </label>
                <label>
                  <span>主標題</span>
                  <input
                    type="text"
                    value={form.headline}
                    onChange={(e) => updateForm("headline", e.target.value)}
                    required
                  />
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
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                  />
                </label>
              </div>
              <div className="dashboard-form__row dashboard-form__row--equal">
                <label>
                  <span>主按鈕文字</span>
                  <input
                    type="text"
                    value={form.primaryCtaLabel}
                    onChange={(e) =>
                      updateForm("primaryCtaLabel", e.target.value)
                    }
                  />
                </label>
                <label>
                  <span>主按鈕連結</span>
                  <input
                    type="text"
                    value={form.primaryCtaHref}
                    onChange={(e) =>
                      updateForm("primaryCtaHref", e.target.value)
                    }
                  />
                </label>
              </div>
              <div className="dashboard-form__row dashboard-form__row--equal">
                <label>
                  <span>副按鈕文字</span>
                  <input
                    type="text"
                    value={form.secondaryCtaLabel}
                    onChange={(e) =>
                      updateForm("secondaryCtaLabel", e.target.value)
                    }
                  />
                </label>
                <label>
                  <span>副按鈕連結</span>
                  <input
                    type="text"
                    value={form.secondaryCtaHref}
                    onChange={(e) =>
                      updateForm("secondaryCtaHref", e.target.value)
                    }
                  />
                </label>
              </div>
              <div className="dashboard-form__row">
                <label>
                  <span>Hero 圖片</span>
                  <input
                    type="text"
                    value={form.heroImage}
                    onChange={(e) => updateForm("heroImage", e.target.value)}
                  />
                </label>
                {form.heroImage && (
                  <div className="dashboard-form__preview">
                    <span>預覽</span>
                    <img src={form.heroImage} alt="Hero 預覽" />
                  </div>
                )}
              </div>
              <div className="dashboard-form__actions">
                {editingBanner && (
                  <button
                    type="button"
                    className="button button--danger"
                    onClick={() => handleDelete(editingBanner.id)}
                  >
                    刪除
                  </button>
                )}
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setShowModal(false)}
                >
                  取消
                </button>
                <button type="submit" className="button button--primary">
                  {editingBanner ? "儲存變更" : "新增 Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
