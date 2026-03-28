"use client";

import "@/styles/theme-customer.css";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useAuthSession } from "@/hooks/useAuthSession";
import { buildCardMetaArray } from "@/lib/card-meta";

const HERO_POINTS = [
  "清楚分享當前需要，讓代禱者快速抓住重點",
  "條列式說明能幫助大家更容易進入禱告的負擔",
];

const INITIAL_FORM = {
  title: "",
  slug: "",
  image: "",
  alt: "",
  description: "",
  tags: "",
  meta: "",
  detailsHref: "",
  voiceHref: "",
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 3;
const DRAFT_STORAGE_KEY = "customer-portal-create-draft-v1";
const AUTO_SAVE_DELAY_MS = 700;
const UPLOADS_PREFIX = "/uploads/";

function isInternalUploadUrl(value) {
  return typeof value === "string" && value.startsWith(UPLOADS_PREFIX);
}

function normalizeUploadedImage(item) {
  if (!item || typeof item !== "object") return null;
  const url = typeof item.url === "string" ? item.url.trim() : "";
  if (!isInternalUploadUrl(url)) return null;
  const name = typeof item.name === "string" && item.name.trim() ? item.name.trim() : "uploaded-image";
  return { url, name };
}

export default function CustomerPortalCreatePage() {
  const authUser = useAuthSession();
  const router = useRouter();

  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState(null);

  const uploadLockRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || typeof draft !== "object") return;

      const hasDraftContent = Boolean(
        draft?.form?.title?.trim?.() ||
          draft?.form?.description?.trim?.() ||
          draft?.form?.image?.trim?.() ||
          (Array.isArray(draft?.uploadedImages) && draft.uploadedImages.length)
      );
      if (!hasDraftContent) return;

      const safeUploadedImages = Array.isArray(draft.uploadedImages)
        ? draft.uploadedImages
            .map(normalizeUploadedImage)
            .filter(Boolean)
            .slice(0, MAX_GALLERY_IMAGES)
        : [];
      const draftCover = typeof draft?.form?.image === "string" ? draft.form.image.trim() : "";
      const safeCoverImage = isInternalUploadUrl(draftCover) ? draftCover : safeUploadedImages[0]?.url || "";

      setForm((prev) => ({ ...prev, ...draft.form, image: safeCoverImage }));
      setUploadedImages(safeUploadedImages);
      if (Number.isFinite(draft.categoryId)) {
        setCategoryId((prev) => prev ?? draft.categoryId);
      }
      if (draft.savedAt) {
        setLastAutoSavedAt(draft.savedAt);
      }
      setStatus({ type: "info", message: "已還原上次未送出的草稿" });
    } catch (error) {
      console.warn("restore draft failed", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasContent = Boolean(
      form.title.trim() ||
        form.description.trim() ||
        form.image.trim() ||
        uploadedImages.length
    );
    if (!hasContent) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      setLastAutoSavedAt(null);
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        const savedAt = new Date().toISOString();
        window.localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            form,
            categoryId,
            uploadedImages,
            savedAt,
          })
        );
        setLastAutoSavedAt(savedAt);
      } catch (error) {
        console.warn("save draft failed", error);
      }
    }, AUTO_SAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [form, categoryId, uploadedImages]);

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
        if (mounted) {
          setCategoriesLoading(false);
        }
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

  const updateFormField = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "image") {
      setStatus(null);
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length) return;
    if (uploadLockRef.current) return;

    const currentImages = uploadedImages.slice(0, MAX_GALLERY_IMAGES);
    const availableSlots = MAX_GALLERY_IMAGES - currentImages.length;
    if (availableSlots <= 0) {
      setStatus({ type: "error", message: `最多只能上傳 ${MAX_GALLERY_IMAGES} 張圖片` });
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length) {
      setStatus({ type: "error", message: "請選擇圖片檔案" });
      return;
    }

    const selected = imageFiles.slice(0, availableSlots);
    const uploadedBatch = [];
    let successCount = 0;
    let lastError = "";

    uploadLockRef.current = true;
    setIsUploadingImage(true);
    setStatus({ type: "info", message: "圖片上傳中..." });

    try {
      for (const file of selected) {
        if (file.size > MAX_UPLOAD_BYTES) {
          lastError = `${file.name} 超過 10MB 限制`;
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "圖片上傳失敗" }));
            throw new Error(error.message || "圖片上傳失敗");
          }

          const result = await response.json();
          const image = normalizeUploadedImage({ url: result.url, name: file.name });
          if (!image) {
            throw new Error("上傳圖片來源不合法，請重新上傳");
          }
          if (!uploadedBatch.some((item) => item.url === image.url)) {
            uploadedBatch.push(image);
            successCount += 1;
          }
        } catch (error) {
          console.error("圖片上傳失敗:", error);
          lastError = error.message || "圖片上傳失敗";
        }
      }
    } finally {
      uploadLockRef.current = false;
      setIsUploadingImage(false);
    }

    const mergedImages = [...currentImages];
    for (const image of uploadedBatch) {
      if (mergedImages.some((item) => item.url === image.url)) continue;
      mergedImages.push(image);
      if (mergedImages.length >= MAX_GALLERY_IMAGES) break;
    }

    setUploadedImages(mergedImages);

    if (successCount > 0) {
      setStatus({ type: "success", message: `已上傳 ${successCount} 張圖片` });
    } else if (lastError) {
      setStatus({ type: "error", message: lastError });
    } else if (!mergedImages.length) {
      setStatus(null);
    }

    if (!form.image.trim() && mergedImages.length) {
      setForm((prev) => ({ ...prev, image: mergedImages[mergedImages.length - 1].url }));
    }
  };

  const selectUploadedImage = (url) => {
    setForm((prev) => ({ ...prev, image: url }));
    setStatus(null);
  };

  const removeUploadedImage = (url) => {
    const next = uploadedImages.filter((item) => item.url !== url);
    setUploadedImages(next);
    if (form.image === url) {
      setForm((prev) => ({ ...prev, image: next[0]?.url ?? "" }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!authUser?.id) {
      setStatus({ type: "error", message: "請先登入後再建立禱告卡" });
      return;
    }

    if (!categoryId) {
      setStatus({ type: "error", message: "請選擇分類" });
      return;
    }

    const coverImage = form.image.trim();
    if (!coverImage) {
      setStatus({ type: "error", message: "請至少上傳一張圖片" });
      return;
    }
    if (!isInternalUploadUrl(coverImage)) {
      setStatus({ type: "error", message: "封面圖片需使用站內上傳檔案，不能使用外部網址" });
      return;
    }

    if (!form.description.trim()) {
      setStatus({ type: "error", message: "請至少填寫一段代禱內容" });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    const infoLines = form.meta
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const galleryUrls = uploadedImages.map((item) => item.url).filter(isInternalUploadUrl);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      image: coverImage,
      alt: form.alt.trim(),
      description: form.description,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      meta: buildCardMetaArray(infoLines, galleryUrls),
      detailsHref: form.detailsHref.trim(),
      voiceHref: form.voiceHref.trim(),
      categoryId,
    };

    try {
      const response = await fetch("/api/home-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "建立失敗" }));
        throw new Error(error.message || "建立失敗");
      }

      await response.json();
      setStatus({ type: "success", message: "禱告卡已建立" });
      setForm(INITIAL_FORM);
      setUploadedImages([]);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      setLastAutoSavedAt(null);
      setShowModal(true);

      const timer = setTimeout(() => {
        router.push("/customer-portal");
      }, 1000);
      setRedirectTimer(timer);
    } catch (error) {
      setStatus({ type: "error", message: error.message || "建立失敗" });
    } finally {
      setSubmitting(false);
    }
  };

  const previewImage = form.image.trim();

  return (
    <>
      <SiteHeader activePath="/customer-portal" />
      <main className="customer-create customer-create--editor-only">
        <section className="customer-create__hero">
          <div className="customer-create__hero-card">
            <p className="customer-create__eyebrow">Share & Pray</p>
            <h1>讓需要被看見，邀請眾人一同守望</h1>
            <p>
              在這裡整理你的近況、壓力與需要，讓代禱者更快理解並以禱告托住你。你可以先上傳圖片，再撰寫內容。
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

        <form className="customer-create__form" onSubmit={handleSubmit}>
          {status ? (
            <div className={`customer-create__status customer-create__status--${status.type}`} role="alert">
              {status.message}
            </div>
          ) : null}

          <div className="customer-create__row customer-create__row--equal">
            <label>
              <span>標題 *</span>
              <input
                type="text"
                value={form.title}
                onChange={updateFormField("title")}
                placeholder="例如：為家人健康與平安代禱"
                required
              />
            </label>
            {/* <label>
              <span>?芾?蝬脣?隞?? (slug)</span>
              <input
                type="text"
                value={form.slug}
                onChange={updateFormField("slug")}
                placeholder="靘?family-health"
              />
            </label> */}
          </div>

          <div className="customer-create__row">
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
          </div>

          <div className="customer-create__row">
            <label className="customer-create__file-label">
              <span>上傳圖片（最多 3 張）</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                disabled={isUploadingImage || uploadedImages.length >= MAX_GALLERY_IMAGES}
              />
              <small className="cp-helper">
                支援 JPG、PNG、WEBP，每張上限 10MB，最多 {MAX_GALLERY_IMAGES} 張。圖片上傳後會壓縮儲存；不支援外部圖片網址。
              </small>
            </label>
            {uploadedImages.length ? (
              <div className="customer-create__gallery">
                {uploadedImages.map(({ url, name }) => {
                  const isActive = form.image === url;
                  return (
                    <figure
                      key={url}
                      className={`customer-create__gallery-item${isActive ? " active" : ""}`}
                    >
                      <button type="button" onClick={() => selectUploadedImage(url)}>
                        <img src={url} alt={name} />
                      </button>
                      <figcaption>
                        <span title={name}>{name}</span>
                        <button type="button" onClick={() => removeUploadedImage(url)}>
                          移除
                        </button>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="customer-create__preview">
            {previewImage ? (
              <img src={previewImage} alt={form.alt || form.title || "禱告卡預覽"} />
            ) : (
              <div className="customer-create__placeholder">尚未設定封面圖片</div>
            )}
          </div>

          {/* <div className="customer-create__row">
            <label>
              <span>???蹂誨??</span>
              <input
                type="text"
                value={form.alt}
                onChange={updateFormField("alt")}
                placeholder="靘?摰嗡犖??銝?曲??
              />
            </label>
          </div> */}

          <div className="customer-create__row customer-create__row--description">
            <label>
              <span>代禱內容 *</span>
              <textarea
                value={form.description}
                onChange={updateFormField("description")}
                placeholder="請直接輸入代禱內容，清楚描述目前情況、需要代禱與盼望。"
                rows={10}
                required
              />
              <small className="cp-helper">請直接輸入文字即可，不提供模板與即時預覽。</small>
            </label>
          </div>

          {/* <div className="customer-create__row customer-create__row--equal">
            <label>
              <span>璅惜 (隞仿???)</span>
              <input
                type="text"
                value={form.tags}
                onChange={updateFormField("tags")}
                placeholder="靘?摰嗅滬, ?怎?"
              />
            </label>
            <label>
              <span>Meta 鞈? (瘥?銝??</span>
              <textarea
                rows={2}
                value={form.meta}
                onChange={updateFormField("meta")}
                placeholder={`靘?蝳勗??∠楊??PC-101
撌脰◤ 12 雿誨蝳梯??亦?蝳望??害}
              />
            </label>
          </div>

          <div className="customer-create__row customer-create__row--equal">
            <label>
              <span>閰喟敦?批捆??? (?詨‵)</span>
              <input
                type="text"
                value={form.detailsHref}
                onChange={updateFormField("detailsHref")}
                placeholder="?舫???唳摰??霅?隤芣???
              />
            </label>
            <label>
              <span>蝳勗????? (?詨‵)</span>
              <input
                type="text"
                value={form.voiceHref}
                onChange={updateFormField("voiceHref")}
                placeholder="靘?閰喟敦?? #voice ?畾?
              />
            </label>
          </div> */}

          <div className="customer-create__actions">
            <button type="submit" className="button button--primary" disabled={submitting || isUploadingImage}>
              {submitting ? "建立中..." : "建立禱告卡"}
            </button>
            <Link href="/customer-portal" className="button button--ghost" prefetch={false}>
              返回管理頁
            </Link>
          </div>
        </form>
      </main>
      <SiteFooter />

      {showModal ? (
        <div className="customer-create__modal" role="alert" aria-live="assertive">
          <div className="customer-create__modal-card">
            <h3>建立成功</h3>
            <p>1 秒後會回到管理頁</p>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .customer-create--editor-only {
          background:
            radial-gradient(circle at 8% 12%, rgba(59, 130, 246, 0.16), transparent 42%),
            radial-gradient(circle at 90% 82%, rgba(56, 189, 248, 0.12), transparent 46%);
          padding-bottom: 4rem;
        }

        .customer-create__hero-card {
          border: 1px solid rgba(148, 163, 184, 0.3);
          background: linear-gradient(145deg, rgba(10, 20, 38, 0.9), rgba(15, 23, 42, 0.78));
          box-shadow: 0 28px 50px -34px rgba(2, 6, 23, 0.8);
        }

        .customer-create__form {
          width: min(980px, 100%);
          margin: 1rem auto 0;
          padding: clamp(1rem, 2vw, 1.3rem);
          border-radius: 20px;
          border: 1px solid rgba(148, 163, 184, 0.26);
          background: linear-gradient(160deg, rgba(7, 16, 34, 0.9), rgba(10, 21, 41, 0.84));
          box-shadow: 0 24px 48px -34px rgba(2, 6, 23, 0.86);
        }

        .customer-create__row label {
          display: grid;
          gap: 0.42rem;
        }

        .customer-create__row label > span {
          color: rgba(226, 232, 240, 0.95);
          font-size: 0.84rem;
          font-weight: 700;
          letter-spacing: 0.01em;
        }

        .customer-create__row input,
        .customer-create__row select,
        .customer-create__row textarea {
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.36);
          background: rgba(15, 23, 42, 0.66);
          color: #f8fbff;
          min-height: 44px;
          padding: 0.7rem 0.78rem;
        }

        .customer-create__row input::placeholder,
        .customer-create__row textarea::placeholder {
          color: rgba(148, 163, 184, 0.88);
        }

        .customer-create__row input:focus,
        .customer-create__row select:focus,
        .customer-create__row textarea:focus {
          outline: none;
          border-color: rgba(125, 211, 252, 0.9);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.22);
        }

        .customer-create__preview {
          border: 1px dashed rgba(148, 163, 184, 0.42);
          border-radius: 16px;
          min-height: 180px;
          display: grid;
          place-items: center;
          background: rgba(2, 6, 23, 0.35);
        }

        .customer-create__preview img {
          width: 100%;
          height: 100%;
          max-height: 360px;
          object-fit: cover;
          border-radius: 16px;
        }

        .customer-create__placeholder {
          color: rgba(226, 232, 240, 0.82);
          font-size: 0.9rem;
        }

        .customer-create__status {
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.34);
          background: rgba(15, 23, 42, 0.5);
          padding: 0.65rem 0.78rem;
        }

        .customer-create__actions {
          margin-top: 0.2rem;
          display: flex;
          gap: 0.65rem;
        }

        .customer-create__actions :global(.button) {
          min-height: 44px;
          border-radius: 12px;
          font-weight: 700;
        }

        .customer-create__actions :global(.button--primary) {
          background: linear-gradient(135deg, #3b82f6, #0ea5e9);
          border-color: transparent;
        }

        .customer-create__actions :global(.button--ghost) {
          border-color: rgba(148, 163, 184, 0.45);
          color: #e2e8f0;
          background: rgba(15, 23, 42, 0.4);
        }

        .customer-create__row--description textarea {
          min-height: 280px;
          line-height: 1.7;
          resize: vertical;
        }

        .customer-create__row--description .cp-helper {
          margin: 0;
        }

        @media (max-width: 640px) {
          .customer-create__form {
            border-radius: 16px;
            padding: 0.88rem;
          }

          .customer-create__actions {
            flex-direction: column;
          }

          .customer-create__actions :global(.button) {
            width: 100%;
            justify-content: center;
          }

          .customer-create__row--description textarea {
            min-height: 220px;
          }
        }

        .customer-create__gallery {
          display: grid;
          gap: 12px;
          margin-top: 12px;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        }

        @media (max-width: 640px) {
          .customer-create__gallery {
            gap: 10px;
          }
        }

        @media (max-width: 480px) {
          .customer-create__gallery {
            grid-auto-flow: column;
            grid-auto-columns: minmax(160px, 1fr);
            overflow-x: auto;
            padding-bottom: 6px;
            scroll-snap-type: x proximity;
            -webkit-overflow-scrolling: touch;
          }
        }

        .customer-create__gallery-item {
          border: 1px solid #d1d5db;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .customer-create__gallery-item.active {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25);
        }

        .customer-create__gallery-item button {
          all: unset;
          cursor: pointer;
          display: block;
          width: 100%;
          aspect-ratio: 4 / 3;
        }

        .customer-create__gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .customer-create__gallery-item figcaption {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 8px 8px;
          font-size: 12px;
        }

        @media (max-width: 480px) {
          .customer-create__gallery-item {
            scroll-snap-align: start;
          }

          .customer-create__gallery-item figcaption {
            font-size: 11px;
          }
        }

        .customer-create__gallery-item figcaption button {
          all: unset;
          cursor: pointer;
          color: #dc2626;
        }

        .customer-create__gallery-item figcaption span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }

        .customer-create__file-label input[type='file'] {
          width: 100%;
        }
      `}</style>
    </>
  );
}


