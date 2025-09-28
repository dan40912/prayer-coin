"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";

const EMPTY_FORM = {
  title: "",
  description: "",
  image: "",
  alt: "",
  slug: "",
  tags: "",
  meta: "",
  detailsHref: "",
  voiceHref: "",
  categoryId: "",
};

function mapCardToForm(card) {
  if (!card) return EMPTY_FORM;
  return {
    title: card.title ?? "",
    description: card.description ?? "",
    image: card.image ?? "",
    alt: card.alt ?? "",
    slug: card.slug ?? "",
    tags: Array.isArray(card.tags) ? card.tags.join(", ") : "",
    meta: Array.isArray(card.meta) ? card.meta.join("\n") : "",
    detailsHref: card.detailsHref ?? "",
    voiceHref: card.voiceHref ?? "",
    categoryId: card.category?.id ? String(card.category.id) : "",
  };
}

export default function CustomerPortalEditCardPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params?.id;

  const [form, setForm] = useState(EMPTY_FORM);
  const [card, setCard] = useState(null);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const tagsPreview = useMemo(
    () => form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    [form.tags],
  );

  const metaPreview = useMemo(
    () => form.meta.split("\n").map((line) => line.trim()).filter(Boolean),
    [form.meta],
  );

  useEffect(() => {
    let active = true;

    const loadInitial = async () => {
      if (!cardId) {
        setStatus({ type: "error", message: "找不到祈禱卡片編號" });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [cardRes, categoriesRes] = await Promise.all([
          fetch(`/api/customer/cards/${cardId}`, { cache: "no-store" }),
          fetch("/api/home-categories", { cache: "no-store" }),
        ]);

        if (!cardRes.ok) {
          const payload = await cardRes.json().catch(() => null);
          throw new Error(payload?.message || "無法載入祈禱卡片");
        }
        const cardData = await cardRes.json();

        if (!categoriesRes.ok) {
          const payload = await categoriesRes.json().catch(() => null);
          throw new Error(payload?.message || "無法載入分類清單");
        }
        const categoryData = await categoriesRes.json();

        if (!active) return;

        setCard(cardData);
        setCategories(categoryData);
        setForm(mapCardToForm(cardData));
      } catch (error) {
        if (active) {
          setStatus({ type: "error", message: error.message || "載入資料時發生錯誤" });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInitial();

    return () => {
      active = false;
    };
  }, [cardId]);

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!cardId) return;

    if (!form.categoryId) {
      setStatus({ type: "error", message: "請選擇分類" });
      return;
    }

    setSaving(true);
    setStatus(null);

    const payload = {
      title: form.title.trim(),
      description: form.description,
      image: form.image,
      alt: form.alt,
      slug: form.slug,
      tags: tagsPreview,
      meta: metaPreview,
      detailsHref: form.detailsHref,
      voiceHref: form.voiceHref,
      categoryId: Number(form.categoryId),
    };

    try {
      const response = await fetch(`/api/customer/cards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "更新祈禱卡片失敗");
      }

      const updated = await response.json();
      setCard(updated);
      setForm(mapCardToForm(updated));
      setStatus({ type: "success", message: "祈禱卡片已更新" });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "更新失敗" });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/customer-portal");
  };

  return (
    <>
      <SiteHeader activePath="/customer-portal" />
      <main className="cp-main">
        <section className="cp-section cp-section--form">
          <div className="cp-section__head">
            <div>
              <h2>編輯祈禱卡片</h2>
              <p>更新內容、分享資訊與分類，讓社群更了解這項代禱。</p>
            </div>
            <button type="button" className="cp-button cp-button--ghost" onClick={handleBack}>
              返回我的總覽
            </button>
          </div>

          {loading ? (
            <p>資料載入中…</p>
          ) : card ? (
            <form className="cp-card-form" onSubmit={handleSubmit}>
              {status ? (
                <div className={`cp-alert cp-alert--${status.type}`}>{status.message}</div>
              ) : null}

              <div className="cp-form__grid">
                <label>
                  <span>標題 *</span>
                  <input type="text" value={form.title} onChange={updateField("title")} required />
                </label>
                <label>
                  <span>Slug</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={updateField("slug")}
                    placeholder="留空則沿用目前設定"
                  />
                </label>
              </div>

              <label>
                <span>說明</span>
                <textarea rows={4} value={form.description} onChange={updateField("description")} />
              </label>

              <div className="cp-form__grid">
                <label>
                  <span>分類 *</span>
                  <select value={form.categoryId} onChange={updateField("categoryId")} required>
                    <option value="" disabled>
                      請選擇分類
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>封面圖片 URL</span>
                  <input type="url" value={form.image} onChange={updateField("image")} />
                </label>
              </div>

              <div className="cp-form__grid">
                <label>
                  <span>圖片替代文字</span>
                  <input type="text" value={form.alt} onChange={updateField("alt")} />
                </label>
                <label>
                  <span>分享詳情連結</span>
                  <input type="url" value={form.detailsHref} onChange={updateField("detailsHref")} />
                </label>
              </div>

              <div className="cp-form__grid">
                <label>
                  <span>語音連結</span>
                  <input type="url" value={form.voiceHref} onChange={updateField("voiceHref")} />
                </label>
                <label>
                  <span>標籤（以逗號分隔）</span>
                  <input type="text" value={form.tags} onChange={updateField("tags")} />
                </label>
              </div>

              <label>
                <span>Meta 資訊（每行一筆）</span>
                <textarea rows={3} value={form.meta} onChange={updateField("meta")} />
              </label>

              <div className="cp-form__preview">
                <strong>儲存前快速檢查</strong>
                <ul>
                  <li>標題：{form.title || "--"}</li>
                  <li>分類：{categories.find((item) => String(item.id) === form.categoryId)?.name || "--"}</li>
                  <li>標籤：{tagsPreview.length ? tagsPreview.join(", ") : "--"}</li>
                </ul>
              </div>

              <div className="cp-form__actions">
                <button type="button" className="cp-button cp-button--ghost" onClick={handleBack} disabled={saving}>
                  取消
                </button>
                <button type="submit" className="cp-button" disabled={saving}>
                  {saving ? "儲存中…" : "儲存變更"}
                </button>
              </div>
            </form>
          ) : (
            <div className="cp-alert cp-alert--error">找不到這張祈禱卡片</div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}