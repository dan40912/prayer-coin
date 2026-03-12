"use client";

import "@/styles/theme-customer.css";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 3;

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
  const [editorReady, setEditorReady] = useState(false);

  const editorRef = useRef({ CKEditor: null, ClassicEditor: null });
  const uploadLockRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const loadEditor = async () => {
      try {
        const [CKEditorModule, ClassicEditorModule] = await Promise.all([
          import("@ckeditor/ckeditor5-react"),
          import("@ckeditor/ckeditor5-build-classic"),
        ]);

        if (!mounted) return;
        const CKEditorComponent =
          CKEditorModule.CKEditor ?? CKEditorModule.default ?? CKEditorModule;
        const ClassicEditor = ClassicEditorModule.default ?? ClassicEditorModule;

        editorRef.current = {
          CKEditor: CKEditorComponent,
          ClassicEditor,
        };
        setEditorReady(true);
      } catch (error) {
        console.error("頛 CKEditor 憭望?:", error);
        setStatus({ type: "error", message: "無法載入編輯器，請重新整理頁面" });
      }
    };

    loadEditor();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const response = await fetch("/api/home-categories", { cache: "no-store" });
        if (!response.ok) throw new Error("?⊥?頛??");
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

  const handleEditorChange = (value) => {
    setForm((prev) => ({ ...prev, description: value }));
  };

  const normalizedDescription = useMemo(() => {
    const plain = form.description.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    return plain;
  }, [form.description]);

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
          lastError = `${file.name} 超過 5MB 限制`;
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
          const image = { url: result.url, name: file.name };
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

    if (!normalizedDescription) {
      setStatus({ type: "error", message: "隢‵撖恍?閬曲???批捆" });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    const infoLines = form.meta
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const galleryUrls = uploadedImages.map((item) => item.url).filter(Boolean);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      image: coverImage,
      alt: form.alt.trim(),
      description: form.description,
      ownerId: authUser.id,
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
        const error = await response.json().catch(() => ({ message: "撱箇?憭望?" }));
        throw new Error(error.message || "撱箇?憭望?");
      }

      await response.json();
      setStatus({ type: "success", message: "禱告卡已建立" });
      setForm(INITIAL_FORM);
      setUploadedImages([]);
      setShowModal(true);

      const timer = setTimeout(() => {
        router.push("/customer-portal");
      }, 1000);
      setRedirectTimer(timer);
    } catch (error) {
      setStatus({ type: "error", message: error.message || "撱箇?憭望?" });
    } finally {
      setSubmitting(false);
    }
  };

  const previewImage = form.image.trim();

  const { CKEditor, ClassicEditor } = editorRef.current;

  return (
    <>
      <SiteHeader activePath="/customer-portal" />
      <main className="customer-create customer-create--editor-only">
        <section className="customer-create__hero">
          <div className="customer-create__hero-card">
            <p className="customer-create__eyebrow">Share & Pray</p>
            <h1>讓需要被看見，邀請眾人一同守望</h1>
            <p>
              ??皜??曲?摰對?蝷曄黎?賢翰??閫??瘙蒂?脣隞?曲?????????賢隞亙?ㄐ銝甈∪???
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
              <span>璅? *</span>
              <input
                type="text"
                value={form.title}
                onChange={updateFormField("title")}
                placeholder="靘??箏振鈭箇?頨恍??亙熒蝳勗?"
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

          <div className="customer-create__row customer-create__row--equal">
            <label>
              <span>?? *</span>
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
              <span>撠?? URL *</span>
              <input
                type="text"
                value={form.image}
                onChange={updateFormField("image")}
                placeholder="?航票銝??典?摨急? CDN ?????"
                required
              />
            </label>
          </div>

          <div className="customer-create__row">
            <label className="customer-create__file-label">
              <span>銝?? (?憭?3 撘?</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                disabled={isUploadingImage || uploadedImages.length >= MAX_GALLERY_IMAGES}
              />
              <small className="cp-helper">
                ?舀 JPG?NG?EBP嚗撘萎???5MB??憭?{MAX_GALLERY_IMAGES} 撘蛛?撠＊蝷箸蝳勗?閰單???隞?曲?汗??              </small>
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
                          蝘駁
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
              <div className="customer-create__placeholder">撠?豢???</div>
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
              <span>?閬曲?摰?*</span>
              <div className="customer-create__editor">
                {editorReady && CKEditor && ClassicEditor ? (
                  <CKEditor
                    editor={ClassicEditor}
                    data={form.description}
                    config={{
                      toolbar: [
                        "heading",
                        "|",
                        "bold",
                        "italic",
                        "underline",
                        "strikethrough",
                        "link",
                        "bulletedList",
                        "numberedList",
                        "blockQuote",
                        "insertTable",
                        "undo",
                        "redo",
                      ],
                      removePlugins: [
                        "Image",
                        "ImageCaption",
                        "ImageStyle",
                        "ImageToolbar",
                        "ImageUpload",
                        "EasyImage",
                        "CKFinder",
                        "CKFinderUploadAdapter",
                        "MediaEmbed",
                      ],
                    }}
                    onChange={(_, editor) => handleEditorChange(editor.getData())}
                  />
                ) : (
                  <textarea
                    value={form.description}
                    onChange={(event) => handleEditorChange(event.target.value)}
                    placeholder="請描述你的代禱內容，越清楚越能幫助大家一起守望。"
                    rows={6}
                  />
                )}
              </div>
              <small className="cp-helper">
                ?⊿??Ⅱ嚗??牧??閬曲??鈭??鼠?拙之摰嗆摰寞??脣鞎?銝准?
              </small>
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
              ?蝮質汗
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
        .customer-create__editor {
          width: 100%;
          min-width: 0;
        }

        .customer-create__editor :global(.ck-editor) {
          width: 100%;
        }

        .customer-create__editor :global(.ck-editor__main) {
          width: 100%;
        }

        .customer-create__editor :global(.ck-editor__editable) {
          min-height: 240px;
          border-radius: 12px;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        @media (max-width: 640px) {
          .customer-create__editor :global(.ck-editor__editable) {
            min-height: 200px;
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

