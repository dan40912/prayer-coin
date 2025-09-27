"use client";

import { useEffect, useState } from "react";

const KPI_CARDS = [
  { id: "prayer-today", label: "今日祈禱次數", value: "1,254", delta: "+12%", tone: "positive" },
  { id: "rooms-active", label: "活躍祈禱室", value: "86", delta: "+5%", tone: "positive" },
  { id: "impact-total", label: "Impact 金流 (本週)", value: "NT$420K", delta: "+8%", tone: "positive" },
  { id: "response-rate", label: "祈禱回應率", value: "78%", delta: "-3%", tone: "negative" }
];

const QUICK_ACTIONS = [
  { id: "new-announcement", label: "建立公告" },
  { id: "review-room", label: "審核祈禱室" },
  { id: "export-report", label: "匯出報表" }
];

const REVIEW_QUEUE = [
  {
    id: "room-9812",
    title: "祈禱室申請 #9812",
    meta: "社區牧場 · 等待初審",
    owner: "Grace Fellowship",
    submittedAt: "09:40"
  },
  {
    id: "request-3321",
    title: "祈禱需求 #3321",
    meta: "醫療協助 · 高優先",
    owner: "王小美",
    submittedAt: "09:15"
  },
  {
    id: "refund-7720",
    title: "退款申請 #7720",
    meta: "信用卡 · 待財務審核",
    owner: "Kevin Lin",
    submittedAt: "08:52"
  }
];

const LEDGER_PROJECTS = [
  {
    id: "impact-1",
    name: "偏鄉醫療巡迴",
    progress: 72,
    amount: "NT$1,280,000",
    image:
      "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "impact-2",
    name: "青年職涯輔導",
    progress: 54,
    amount: "NT$620,000",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80"
  }
];

const SUPPORT_TICKETS = [
  {
    id: "ticket-21",
    subject: "帳號權限異常",
    status: "處理中",
    assignee: "Irene",
    updatedAt: "10:05"
  },
  {
    id: "ticket-22",
    subject: "祈禱室封面無法更新",
    status: "待回覆",
    assignee: "Ken",
    updatedAt: "09:48"
  },
  {
    id: "ticket-23",
    subject: "Impact 報表下載失敗",
    status: "已解決",
    assignee: "Zoey",
    updatedAt: "09:12"
  }
];

const DEFAULT_BANNER_FORM = {
  eyebrow: "",
  headline: "",
  subheadline: "",
  description: "",
  primaryCtaLabel: "",
  primaryCtaHref: "",
  secondaryCtaLabel: "",
  secondaryCtaHref: "",
  heroImage: ""
};

export default function AdminDashboardPage() {
  const [bannerForm, setBannerForm] = useState(DEFAULT_BANNER_FORM);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerStatus, setBannerStatus] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadBanner = async () => {
      try {
        const response = await fetch("/api/banner", { cache: "no-store" });
        if (!response.ok) throw new Error("failed");
        const data = await response.json();
        if (!isMounted) return;
        setBannerForm({
          eyebrow: data.eyebrow ?? "",
          headline: data.headline ?? "",
          subheadline: data.subheadline ?? "",
          description: data.description ?? "",
          primaryCtaLabel: data.primaryCta?.label ?? "",
          primaryCtaHref: data.primaryCta?.href ?? "",
          secondaryCtaLabel: data.secondaryCta?.label ?? "",
          secondaryCtaHref: data.secondaryCta?.href ?? "",
          heroImage: data.heroImage ?? ""
        });
      } catch (error) {
        if (isMounted) {
          setBannerStatus({ type: "error", message: "載入 Banner 內容失敗" });
        }
      } finally {
        if (isMounted) setBannerLoading(false);
      }
    };

    loadBanner();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateBannerField = (field, value) => {
    setBannerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBannerSubmit = async (event) => {
    event.preventDefault();
    setBannerSaving(true);
    setBannerStatus(null);

    const payload = {
      eyebrow: bannerForm.eyebrow.trim(),
      headline: bannerForm.headline.trim(),
      subheadline: bannerForm.subheadline.trim(),
      description: bannerForm.description.trim(),
      primaryCta: {
        label: bannerForm.primaryCtaLabel.trim() || "立即註冊",
        href: bannerForm.primaryCtaHref.trim() || "/signup"
      },
      secondaryCta:
        bannerForm.secondaryCtaLabel.trim() && bannerForm.secondaryCtaHref.trim()
          ? {
              label: bannerForm.secondaryCtaLabel.trim(),
              href: bannerForm.secondaryCtaHref.trim()
            }
          : null,
      heroImage: bannerForm.heroImage.trim()
    };

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
      setBannerForm({
        eyebrow: updated.eyebrow ?? "",
        headline: updated.headline ?? "",
        subheadline: updated.subheadline ?? "",
        description: updated.description ?? "",
        primaryCtaLabel: updated.primaryCta?.label ?? "",
        primaryCtaHref: updated.primaryCta?.href ?? "",
        secondaryCtaLabel: updated.secondaryCta?.label ?? "",
        secondaryCtaHref: updated.secondaryCta?.href ?? "",
        heroImage: updated.heroImage ?? ""
      });
      setBannerStatus({ type: "success", message: "Banner 已更新" });
    } catch (error) {
      setBannerStatus({ type: "error", message: error.message || "儲存失敗" });
    } finally {
      setBannerSaving(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div>
          <p className="admin-dashboard__eyebrow">PRAY COIN 控制台</p>
          <h1>總覽 Dashboard</h1>
        </div>

        <div className="admin-dashboard__header-actions">
          {QUICK_ACTIONS.map((action) => (
            <button key={action.id} type="button" className="button button--ghost">
              {action.label}
            </button>
          ))}
          <button type="button" className="button button--primary">
            建立專案
          </button>
        </div>
      </header>

      <section className="admin-dashboard__kpis">
        {KPI_CARDS.map((card) => (
          <article key={card.id} className="dashboard-kpi">
            <p className="dashboard-kpi__label">{card.label}</p>
            <div className="dashboard-kpi__value-row">
              <span className="dashboard-kpi__value">{card.value}</span>
              <span
                className={`dashboard-kpi__delta dashboard-kpi__delta--${card.tone}`}
              >
                {card.delta}
              </span>
            </div>
            <p className="dashboard-kpi__footnote">相較於昨日</p>
          </article>
        ))}
      </section>

      <section className="admin-dashboard__grid">
        <article className="dashboard-card dashboard-card--wide">
          <header className="dashboard-card__header">
            <div>
              <h2>祈禱與回應趨勢</h2>
              <p>過去 14 天祈禱與回應的整體動能。</p>
            </div>
            <button type="button" className="link-button">
              下載 CSV →
            </button>
          </header>
          <img
            src="https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80"
            alt="折線圖示意"
            className="dashboard-card__image"
            loading="lazy"
          />
        </article>

        <article className="dashboard-card">
          <header className="dashboard-card__header">
            <div>
              <h2>待處理事項</h2>
              <p>依緊急程度排序的審核與財務任務。</p>
            </div>
          </header>
          <ul className="dashboard-queue">
            {REVIEW_QUEUE.map((item) => (
              <li key={item.id}>
                <div className="dashboard-queue__main">
                  <p className="dashboard-queue__title">{item.title}</p>
                  <p className="dashboard-queue__meta">{item.meta}</p>
                </div>
                <div className="dashboard-queue__aside">
                  <span>{item.owner}</span>
                  <time dateTime={item.submittedAt}>{item.submittedAt}</time>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="dashboard-card">
          <header className="dashboard-card__header">
            <div>
              <h2>支援工單</h2>
              <p>最新客服回覆進度與指派。</p>
            </div>
          </header>
          <ul className="dashboard-ticket-list">
            {SUPPORT_TICKETS.map((ticket) => (
              <li key={ticket.id}>
                <div className="dashboard-ticket__title">{ticket.subject}</div>
                <div className="dashboard-ticket__meta">
                  <span>{ticket.status}</span>
                  <span>指派：{ticket.assignee}</span>
                  <time dateTime={ticket.updatedAt}>{ticket.updatedAt}</time>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="dashboard-card dashboard-card--wide">
          <header className="dashboard-card__header">
            <div>
              <h2>首頁 Banner 快速設定</h2>
              <p>即時調整首頁標題、說明與背景圖片。</p>
            </div>
          </header>
          <form className="dashboard-form" onSubmit={handleBannerSubmit}>
            <div className="dashboard-form__row">
              <label>
                <span>Eyebrow 標籤</span>
                <input
                  type="text"
                  value={bannerForm.eyebrow}
                  onChange={(event) => updateBannerField("eyebrow", event.target.value)}
                  disabled={bannerLoading || bannerSaving}
                  placeholder="例：禱告即影響"
                />
              </label>
              <label>
                <span>主標題 H1</span>
                <input
                  type="text"
                  value={bannerForm.headline}
                  onChange={(event) => updateBannerField("headline", event.target.value)}
                  required
                  disabled={bannerLoading || bannerSaving}
                  placeholder="輸入主標"
                />
              </label>
            </div>

            <div className="dashboard-form__row">
              <label>
                <span>副標題 H2</span>
                <input
                  type="text"
                  value={bannerForm.subheadline}
                  onChange={(event) => updateBannerField("subheadline", event.target.value)}
                  required
                  disabled={bannerLoading || bannerSaving}
                  placeholder="輸入副標"
                />
              </label>
            </div>

            <div className="dashboard-form__row">
              <label>
                <span>說明文字</span>
                <textarea
                  value={bannerForm.description}
                  onChange={(event) => updateBannerField("description", event.target.value)}
                  required
                  disabled={bannerLoading || bannerSaving}
                  rows={3}
                  placeholder="輸入描述"
                />
              </label>
            </div>

            <div className="dashboard-form__row dashboard-form__row--equal">
              <label>
                <span>主按鈕文字</span>
                <input
                  type="text"
                  value={bannerForm.primaryCtaLabel}
                  onChange={(event) => updateBannerField("primaryCtaLabel", event.target.value)}
                  disabled={bannerLoading || bannerSaving}
                  placeholder="例：立即註冊"
                />
              </label>
              <label>
                <span>主按鈕連結</span>
                <input
                  type="text"
                  value={bannerForm.primaryCtaHref}
                  onChange={(event) => updateBannerField("primaryCtaHref", event.target.value)}
                  disabled={bannerLoading || bannerSaving}
                  placeholder="例：/signup"
                />
              </label>
            </div>

            <div className="dashboard-form__row dashboard-form__row--equal">
              <label>
                <span>副按鈕文字 (選填)</span>
                <input
                  type="text"
                  value={bannerForm.secondaryCtaLabel}
                  onChange={(event) => updateBannerField("secondaryCtaLabel", event.target.value)}
                  disabled={bannerLoading || bannerSaving}
                />
              </label>
              <label>
                <span>副按鈕連結 (選填)</span>
                <input
                  type="text"
                  value={bannerForm.secondaryCtaHref}
                  onChange={(event) => updateBannerField("secondaryCtaHref", event.target.value)}
                  disabled={bannerLoading || bannerSaving}
                />
              </label>
            </div>

            <div className="dashboard-form__row dashboard-form__row--image">
              <label>
                <span>Hero 圖片 URL</span>
                <input
                  type="text"
                  value={bannerForm.heroImage}
                  onChange={(event) => updateBannerField("heroImage", event.target.value)}
                  disabled={bannerLoading || bannerSaving}
                  placeholder="貼上 Unsplash 或其他圖庫連結"
                />
              </label>
              {bannerForm.heroImage ? (
                <div className="dashboard-form__preview">
                  <span>預覽</span>
                  <img src={bannerForm.heroImage} alt="Hero preview" />
                </div>
              ) : null}
            </div>

            <div className="dashboard-form__actions">
              {bannerStatus ? (
                <span
                  className={
                    bannerStatus.type === "success"
                      ? "dashboard-form__status dashboard-form__status--success"
                      : "dashboard-form__status dashboard-form__status--error"
                  }
                >
                  {bannerStatus.message}
                </span>
              ) : null}
              <button type="submit" className="button button--primary" disabled={bannerSaving}>
                {bannerSaving ? "儲存中..." : "儲存 Banner"}
              </button>
            </div>
          </form>
        </article>

        <article className="dashboard-card dashboard-card--wide">
          <header className="dashboard-card__header">
            <div>
              <h2>Impact Ledger 專案</h2>
              <p>重點專案的資金進度與佐證。</p>
            </div>
            <button type="button" className="link-button">
              檢視全部 →
            </button>
          </header>
          <div className="dashboard-ledger">
            {LEDGER_PROJECTS.map((project) => (
              <article key={project.id} className="dashboard-ledger__item">
                <img
                  src={project.image}
                  alt={project.name}
                  loading="lazy"
                />
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.amount}</p>
                  <div className="dashboard-ledger__progress">
                    <span style={{ width: `${project.progress}%` }} />
                  </div>
                  <p className="dashboard-ledger__progress-text">
                    達成 {project.progress}%
                  </p>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}