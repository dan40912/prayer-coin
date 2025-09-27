"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";

const INITIAL_FORM = {
  title: "",
  slug: "",
  image: "",
  alt: "",
  description: "",
  tags: "",
  meta: "",
  detailsHref: "",
  voiceHref: ""
};

const HERO_POINTS = [
  "分享自己的需要，讓社群一起守望",
  "接住別人的禱告，把支持化為行動",
  "透過 Impact Ledger 看見信心的足跡"
];

export default function CustomerPortalCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const response = await fetch("/api/home-categories", { cache: "no-store" });
        if (!response.ok) throw new Error("無法載入分類");
        const data = await response.json();
        if (mounted) {
          setCategories(data);
          setCategoryId((prev) => prev ?? data[0]?.id ?? null);
        }
      } catch (error) {
        if (mounted) {
          setStatus({ type: "error", message: error.message });
        }
      } finally {
        if (mounted) setCategoriesLoading(false);
      }
    };

    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => () => {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
    }
  }, [redirectTimer]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!categoryId) {
      setStatus({ type: "error", message: "請選擇一個分類" });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    const payload = {
      title: form.title,
      slug: form.slug,
      image: form.image,
      alt: form.alt,
      description: form.description,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      meta: form.meta
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      detailsHref: form.detailsHref,
      voiceHref: form.voiceHref,
      categoryId
    };

    try {
      const response = await fetch("/api/home-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "新增失敗" }));
        throw new Error(error.message || "新增失敗");
      }

      const created = await response.json();
      setStatus({
        type: "success",
        message: `卡片 ${created.slug} 已建立並加入首頁清單。`
      });
      setForm(INITIAL_FORM);
      setShowModal(true);
      const timer = setTimeout(() => {
        router.push("/customer-portal");
      }, 1000);
      setRedirectTimer(timer);
    } catch (error) {
      setStatus({ type: "error", message: error.message || "儲存失敗" });
    } finally {
      setSubmitting(false);
    }
  };

  const previewImage = form.image.trim();

  return (
    <>
      <SiteHeader activePath="/customer-portal"  />
      <main className="customer-create">
        <section className="customer-create__hero">
          <div className="customer-create__hero-card">
            <p className="customer-create__eyebrow">Share & Pray</p>
            <h1>把禱告化成故事，被看見、被陪伴</h1>
            <p>
              無論你正面臨人生關卡、為城市守望，還是陪著弟兄姊妹同行，這裡是你分享、
              也是我們一起禱告的家。用圖片、文字與關鍵資訊描繪需求，幫助守望者快速進入狀況。
            </p>
            <ul>
              {HERO_POINTS.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          <div className="customer-create__hero-visual" aria-hidden="true">
            <div className="customer-create__hero-glow" />
            <div className="customer-create__hero-bubble" />
            <div className="customer-create__hero-bubble customer-create__hero-bubble--sm" />
          </div>
        </section>

        <header className="customer-create__header">
          <div>
            <p className="customer-create__eyebrow">Customer Portal</p>
            <h2>新增首頁祈禱卡片</h2>
            <p>
              填寫以下資訊即可建立新的首頁卡片。提交後會自動帶您回到卡片總覽頁面，方便進一步管理與編輯。
            </p>
          </div>
          {status ? (
            <span
              className={
                status.type === "success"
                  ? "customer-create__status customer-create__status--success"
                  : "customer-create__status customer-create__status--error"
              }
            >
              {status.message}
            </span>
          ) : null}
        </header>
          <form className="cp-form" onSubmit={handleSubmit}>
  {/* 基本資訊 */}
  <div className="cp-input-card">
    <h3 className="cp-input-card__title">基本資訊</h3>
    <div className="cp-row cp-row--equal">
      <label>
        <span>卡片標題 <span className="cp-badge cp-badge--required">必填</span></span>
        <input
          type="text"
          value={form.title}
          onChange={handleChange("title")}
          placeholder="例：花東偏鄉課後共學與禱告陪伴"
          required
        />
        <small className="cp-helper">30 字內，能一眼看懂禱告重點</small>
      </label>
      {/* <label>
        <span>自訂 Slug <span className="cp-muted">(選填)</span></span>
        <input
          type="text"
          value={form.slug}
          onChange={handleChange("slug")}
          placeholder="例：pc-101"
        />
        <small className="cp-helper">不輸入會自動產生</small>
      </label> */}
    </div>
  </div>

  {/* 圖片與分類 */}
  <div className="cp-input-card">
    <h3 className="cp-input-card__title">圖片與分類</h3>
    <div className="cp-row cp-row--equal">
      <label>
        <span>分類 <span className="cp-badge cp-badge--required">必填</span></span>
        <select
          value={categoryId ?? ""}
          onChange={(event) => setCategoryId(Number(event.target.value))}
          disabled={categoriesLoading || categories.length === 0}
          required
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>圖片 URL <span className="cp-badge cp-badge--required">必填</span></span>
        <input
          type="url"
          value={form.image}
          onChange={handleChange("image")}
          placeholder="貼上 Unsplash 或其他圖庫連結"
          required
        />
      </label>
    </div>
    <div className="cp-preview">
      {previewImage ? (
        <img src={previewImage} alt={form.alt || form.title || "卡片預覽"} />
      ) : (
        <div className="cp-placeholder">尚未選擇圖片</div>
      )}
    </div>
    <label>
      <span>圖片替代文字</span>
      <input
        type="text"
        value={form.alt}
        onChange={handleChange("alt")}
        placeholder="例：偏鄉孩子在教室祈禱"
      />
      <small className="cp-helper">協助無障礙及 SEO</small>
    </label>
  </div>

  {/* 內容描述 */}
  <div className="cp-input-card">
    <h3 className="cp-input-card__title">祈禱內容</h3>
    <label>
      <span>說明文字 <span className="cp-badge cp-badge--required">必填</span></span>
      <textarea
        rows={6}
        value={form.description}
        onChange={handleChange("description")}
        placeholder="描述祈禱需求的背景、目的與當前需要，建議 200–1000 字。"
        required
      />
      <small className="cp-helper">建議 200–1000 字，適度加入真實情境</small>
    </label>
  </div>

  {/* 其他資訊 */}
  <div className="cp-input-card">
    <h3 className="cp-input-card__title">其他資訊</h3>
    <div className="cp-row cp-row--equal">
      <label>
        <span>標籤 (逗號分隔)</span>
        <input
          type="text"
          value={form.tags}
          onChange={handleChange("tags")}
          placeholder="例：教育, 偏鄉"
        />
      </label>
      <label>
        <span>Meta 行 (換行分隔)</span>
        <textarea
          rows={2}
          value={form.meta}
          onChange={handleChange("meta")}
          placeholder={`例：祈禱 ID：PC-101\n已回覆 12 次 · 跟進 3 名同工`}
        />
      </label>
    </div>
    <div className="cp-row cp-row--equal">
      <label>
        <span>詳情連結 (選填)</span>
        <input
          type="text"
          value={form.detailsHref}
          onChange={handleChange("detailsHref")}
          placeholder="預設會導向 /legacy/prayfor/details.html"
        />
      </label>
      <label>
        <span>禱告錄音連結 (選填)</span>
        <input
          type="text"
          value={form.voiceHref}
          onChange={handleChange("voiceHref")}
          placeholder="預設為詳情連結加上 #voice"
        />
      </label>
    </div>
  </div>

  {/* 按鈕 */}
  <div className="cp-actions">
    <button type="submit" className="btn btn-primary" disabled={submitting}>
      {submitting ? "建立中..." : "建立卡片"}
    </button>
    <Link href="/customer-portal/edit" className="btn btn-secondary" prefetch={false}>
      前往管理
    </Link>
  </div>
</form>

        {/* <form className="customer-create__form" onSubmit={handleSubmit}>
          <div className="customer-create__row customer-create__row--equal">
            <label>
              <span>卡片標題 *</span>
              <input
                type="text"
                value={form.title}
                onChange={handleChange("title")}
                placeholder="例：花東偏鄉課後共學與禱告陪伴"
                required
              />
            </label>
            <label>
              <span>自訂 Slug (選填)</span>
              <input
                type="text"
                value={form.slug}
                onChange={handleChange("slug")}
                placeholder="例：pc-101"
              />
            </label>
          </div>

          <div className="customer-create__row customer-create__row--equal">
            <label>
              <span>分類 *</span>
              <select
                value={categoryId ?? ""}
                onChange={(event) => setCategoryId(Number(event.target.value))}
                disabled={categoriesLoading || categories.length === 0}
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>圖片 URL *</span>
              <input
                type="text"
                value={form.image}
                onChange={handleChange("image")}
                placeholder="貼上 Unsplash 或其他圖庫連結"
                required
              />
            </label>
          </div>

          <div className="customer-create__preview">
            {previewImage ? (
              <img src={previewImage} alt={form.alt || form.title || "卡片預覽"} />
            ) : (
              <div className="customer-create__placeholder">預覽圖片</div>
            )}
          </div>

          <div className="customer-create__row">
            <label>
              <span>圖片替代文字</span>
              <input
                type="text"
                value={form.alt}
                onChange={handleChange("alt")}
                placeholder="例：偏鄉孩子在教室祈禱"
              />
            </label>
          </div>

          <div className="customer-create__row customer-create__row--description">
            <label>
              <span>說明文字 *</span>
              <textarea
                rows={5}
                value={form.description}
                onChange={handleChange("description")}
                placeholder="描述祈禱需求的背景、目的與當前需要，建議 200–1000 字。"
                required
              />
            </label>
          </div>

          <div className="customer-create__row customer-create__row--equal">
            <label>
              <span>標籤 (逗號分隔)</span>
              <input
                type="text"
                value={form.tags}
                onChange={handleChange("tags")}
                placeholder="例：教育, 偏鄉"
              />
            </label>
            <label>
              <span>Meta 行 (換行分隔)</span>
              <textarea
                rows={2}
                value={form.meta}
                onChange={handleChange("meta")}
                placeholder={`例：祈禱 ID：PC-101\n已回覆 12 次 · 跟進 3 名同工`}
              />
            </label>
          </div>

          <div className="customer-create__row customer-create__row--equal">
            <label>
              <span>詳情連結 (選填)</span>
              <input
                type="text"
                value={form.detailsHref}
                onChange={handleChange("detailsHref")}
                placeholder="預設會導向 /legacy/prayfor/details.html"
              />
            </label>
            <label>
              <span>禱告錄音連結 (選填)</span>
              <input
                type="text"
                value={form.voiceHref}
                onChange={handleChange("voiceHref")}
                placeholder="預設為詳情連結加上 #voice"
              />
            </label>
          </div>

          <div className="customer-create__actions">
            <button type="submit" className="button button--primary" disabled={submitting}>
              {submitting ? "建立中..." : "建立卡片"}
            </button>
            <Link href="/customer-portal/edit" className="button button--ghost" prefetch={false}>
              前往管理
            </Link>
          </div>
        </form> */}
      </main>
      <SiteFooter />

      {showModal ? (
        <div className="customer-create__modal" role="alert" aria-live="assertive">
          <div className="customer-create__modal-card">
            <h3>新增成功！</h3>
            <p>即將帶您回到卡片管理頁面。</p>
          </div>
        </div>
      ) : null}
    </>
  );
}