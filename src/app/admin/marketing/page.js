"use client";

import { useEffect, useState } from "react";

const CAMPAIGNS = [
  { id: "campaign-01", title: "秋季祈禱行動", channel: "Email + App 推播", schedule: "2025-09-25", status: "排程中" },
  { id: "campaign-02", title: "Impact 成果週報", channel: "Newsletter", schedule: "每週五", status: "進行中" }
];

const AB_TESTS = [
  { id: "ab-001", name: "Header 文案測試", variants: "A/B", lift: "+5.2%", significance: "92%" },
  { id: "ab-002", name: "CTA 顏色對比", variants: "A/B/C", lift: "+2.1%", significance: "78%" }
];

const EMPTY_BANNER = {
  eyebrow: "",
  headline: "",
  subheadline: "",
  description: "",
  primaryCta: { label: "", href: "" },
  secondaryCta: { label: "", href: "" },
  heroImage: ""
};

export default function MarketingPage() {
  const [form, setForm] = useState(EMPTY_BANNER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadBanner = async () => {
      try {
        const response = await fetch("/api/banner", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load banner");
        const data = await response.json();
        if (!isMounted) return;
        setForm({
          eyebrow: data.eyebrow ?? "",
          headline: data.headline ?? "",
          subheadline: data.subheadline ?? "",
          description: data.description ?? "",
          primaryCta: {
            label: data.primaryCta?.label ?? "",
            href: data.primaryCta?.href ?? ""
          },
          secondaryCta: {
            label: data.secondaryCta?.label ?? "",
            href: data.secondaryCta?.href ?? ""
          },
          heroImage: data.heroImage ?? ""
        });
      } catch (error) {
        if (!isMounted) return;
        setStatus({ type: "error", message: "無法載入首頁 Banner，請稍後再試。" });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBanner();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateCta = (ctaKey, field, value) => {
    setForm((prev) => ({
      ...prev,
      [ctaKey]: {
        ...prev[ctaKey],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    const payload = {
      eyebrow: form.eyebrow.trim(),
      headline: form.headline.trim(),
      subheadline: form.subheadline.trim(),
      description: form.description.trim(),
      primaryCta: {
        label: form.primaryCta.label.trim() || "立即註冊",
        href: form.primaryCta.href.trim() || "/signup"
      },
      heroImage: form.heroImage.trim()
    };

    if (form.secondaryCta.label.trim() && form.secondaryCta.href.trim()) {
      payload.secondaryCta = {
        label: form.secondaryCta.label.trim(),
        href: form.secondaryCta.href.trim()
      };
    }

    try {
      const response = await fetch("/api/banner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "更新失敗" }));
        throw new Error(error.message || "更新失敗");
      }

      const updated = await response.json();
      setForm({
        eyebrow: updated.eyebrow ?? "",
        headline: updated.headline ?? "",
        subheadline: updated.subheadline ?? "",
        description: updated.description ?? "",
        primaryCta: {
          label: updated.primaryCta?.label ?? "",
          href: updated.primaryCta?.href ?? ""
        },
        secondaryCta: {
          label: updated.secondaryCta?.label ?? "",
          href: updated.secondaryCta?.href ?? ""
        },
        heroImage: updated.heroImage ?? ""
      });
      setStatus({ type: "success", message: "首頁 Banner 已更新" });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "儲存失敗，請稍後再試" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-section">
      <header className="admin-section__header">
        <div>
          <p className="admin-section__eyebrow">內容與流量</p>
          <h1>內容行銷</h1>
        </div>
        <div className="admin-section__header-actions">
          <button type="button" className="button button--ghost">內容庫</button>
          <button type="button" className="button button--primary">建立活動</button>
        </div>
      </header>

      <section className="admin-section__grid">
        <article className="admin-section__card admin-section__card--wide">
          <header className="admin-section__card-header">
            <div>
              <h2>首頁 Banner 編輯</h2>
              <p>調整 Landing page 的主標題、副標題、說明與 CTA 連結。</p>
            </div>
          </header>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form__row">
              <label className="admin-form__field">
                <span>Eyebrow 標籤</span>
                <input
                  type="text"
                  value={form.eyebrow}
                  onChange={(event) => updateField("eyebrow", event.target.value)}
                  placeholder="例：Prayer + Impact"
                  disabled={loading || saving}
                />
              </label>
            </div>

            <div className="admin-form__row">
              <label className="admin-form__field">
                <span>主標題 (H1)</span>
                <textarea
                  value={form.headline}
                  onChange={(event) => updateField("headline", event.target.value)}
                  placeholder="輸入首頁主標"
                  required
                  disabled={loading || saving}
                  rows={2}
                />
              </label>
            </div>

            <div className="admin-form__row">
              <label className="admin-form__field">
                <span>副標題 (H2)</span>
                <textarea
                  value={form.subheadline}
                  onChange={(event) => updateField("subheadline", event.target.value)}
                  placeholder="輸入副標"
                  required
                  disabled={loading || saving}
                  rows={2}
                />
              </label>
            </div>

            <div className="admin-form__row">
              <label className="admin-form__field">
                <span>說明文字</span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="輸入描述"
                  required
                  disabled={loading || saving}
                  rows={4}
                />
              </label>
            </div>

            <fieldset className="admin-form__fieldset">
              <legend>Primary CTA</legend>
              <div className="admin-form__row admin-form__row--equal">
                <label className="admin-form__field">
                  <span>按鈕文字</span>
                  <input
                    type="text"
                    value={form.primaryCta.label}
                    onChange={(event) => updateCta("primaryCta", "label", event.target.value)}
                    placeholder="例：立即註冊"
                    required
                    disabled={loading || saving}
                  />
                </label>
                <label className="admin-form__field">
                  <span>連結 (URL)</span>
                  <input
                    type="text"
                    value={form.primaryCta.href}
                    onChange={(event) => updateCta("primaryCta", "href", event.target.value)}
                    placeholder="例：/signup"
                    required
                    disabled={loading || saving}
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="admin-form__fieldset">
              <legend>Secondary CTA (選填)</legend>
              <div className="admin-form__row admin-form__row--equal">
                <label className="admin-form__field">
                  <span>按鈕文字</span>
                  <input
                    type="text"
                    value={form.secondaryCta.label}
                    onChange={(event) => updateCta("secondaryCta", "label", event.target.value)}
                    placeholder="例：了解使用方式"
                    disabled={loading || saving}
                  />
                </label>
                <label className="admin-form__field">
                  <span>連結 (URL)</span>
                  <input
                    type="text"
                    value={form.secondaryCta.href}
                    onChange={(event) => updateCta("secondaryCta", "href", event.target.value)}
                    placeholder="例：/howto"
                    disabled={loading || saving}
                  />
                </label>
              </div>
            </fieldset>

            <div className="admin-form__row">
              <label className="admin-form__field">
                <span>Hero 圖片 URL</span>
                <input
                  type="text"
                  value={form.heroImage}
                  onChange={(event) => updateField("heroImage", event.target.value)}
                  placeholder="貼上外部圖庫連結，例如 Unsplash"
                  disabled={loading || saving}
                />
              </label>
              {form.heroImage ? (
                <div className="admin-form__preview">
                  <span>預覽</span>
                  <img src={form.heroImage} alt="Hero preview" />
                </div>
              ) : null}
            </div>

            <div className="admin-form__actions">
              {status ? (
                <p
                  className={
                    status.type === "success"
                      ? "admin-form__status admin-form__status--success"
                      : "admin-form__status admin-form__status--error"
                  }
                >
                  {status.message}
                </p>
              ) : null}

              <button type="submit" className="button button--primary" disabled={saving}>
                {saving ? "儲存中..." : "儲存 Banner"}
              </button>
            </div>
          </form>
        </article>

        <article className="admin-section__card">
          <header className="admin-section__card-header">
            <div>
              <h2>活動推播</h2>
              <p>規劃多通路觸達與排程。</p>
            </div>
            <button type="button" className="link-button">查看歷史活動 →</button>
          </header>
          <ul className="admin-campaign-list">
            {CAMPAIGNS.map((campaign) => (
              <li key={campaign.id}>
                <div>
                  <h3>{campaign.title}</h3>
                  <p>{campaign.channel}</p>
                </div>
                <div>
                  <span>{campaign.status}</span>
                  <time dateTime={campaign.schedule}>{campaign.schedule}</time>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="admin-section__card">
          <header className="admin-section__card-header">
            <div>
              <h2>A/B 測試</h2>
              <p>追蹤版本成效與顯著性。</p>
            </div>
          </header>
          <table className="admin-table">
            <thead>
              <tr>
                <th>測試主題</th>
                <th>版本</th>
                <th>提升率</th>
                <th>顯著性</th>
              </tr>
            </thead>
            <tbody>
              {AB_TESTS.map((test) => (
                <tr key={test.id}>
                  <td>{test.name}</td>
                  <td>{test.variants}</td>
                  <td>{test.lift}</td>
                  <td>{test.significance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </div>
  );
}
