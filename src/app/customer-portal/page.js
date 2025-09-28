"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { useAuthSession } from "@/hooks/useAuthSession";
import { saveAuthSession } from "@/lib/auth-storage";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80";
const MAX_BIO_LENGTH = 360;

function formatTime(dateLike) {
  if (!dateLike) {
    return "尚未更新";
  }

  try {
    return new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateLike));
  } catch {
    return new Date(dateLike).toLocaleString();
  }
}

function buildShareUrl(card) {
  const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "";
  const rawHref = card?.detailsHref?.trim();

  if (rawHref) {
    if (/^https?:\/\//i.test(rawHref)) {
      return rawHref;
    }

    if (rawHref.startsWith("/")) {
      return origin ? `${origin}${rawHref}` : rawHref;
    }

    const normalized = rawHref.startsWith("/") ? rawHref.slice(1) : rawHref;
    return origin ? `${origin}/${normalized}` : `/${normalized}`;
  }

  const slug = card?.slug || card?.id;
  if (!slug) {
    return origin;
  }

  const pathValue = `/legacy/prayfor/details.html?prayer=${slug}`;
  return origin ? `${origin}${pathValue}` : pathValue;
}

export default function CustomerPortalPage() {
  const authUser = useAuthSession();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [profileStatus, setProfileStatus] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ avatarUrl: "", bio: "" });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [cards, setCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState("");
  const [cardAction, setCardAction] = useState(null);

  const [toast, setToast] = useState(null);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError("");

    try {
      const res = await fetch("/api/customer/profile", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "無法載入個人檔案");
      }

      setProfile(data);
    } catch (error) {
      console.error("載入個人檔案失敗:", error);
      setProfileError(error.message || "無法載入個人檔案");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const loadCards = useCallback(async () => {
    setCardsLoading(true);
    setCardsError("");

    try {
      const res = await fetch("/api/customer/cards", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "無法取得祈禱卡片");
      }

      setCards(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("載入祈禱卡片失敗:", error);
      setCardsError(error.message || "無法取得祈禱卡片");
    } finally {
      setCardsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadCards();
  }, [loadProfile, loadCards]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const resolvedAvatar = useMemo(() => {
    const avatar = profile?.avatarUrl?.trim();
    return avatar || DEFAULT_AVATAR;
  }, [profile?.avatarUrl]);

  const resolvedName = profile?.name ?? authUser?.name ?? "未命名的旅人";
  const resolvedEmail = profile?.email ?? authUser?.email ?? "尚未綁定信箱";

  const handleOpenProfileModal = () => {
    setProfileStatus(null);
    setProfileForm({
      avatarUrl: profile?.avatarUrl?.trim() || DEFAULT_AVATAR,
      bio: profile?.bio ?? "",
    });
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    if (profileSaving) return;
    setIsProfileModalOpen(false);
  };

  const updateProfileField = (field) => (event) => {
    const value = event.target.value;
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    const avatarUrl = profileForm.avatarUrl.trim();
    const bio = profileForm.bio.trim();

    if (bio.length > MAX_BIO_LENGTH) {
      setProfileStatus({
        type: "error",
        message: `自我介紹最多 ${MAX_BIO_LENGTH} 個字元，目前為 ${bio.length} 個字元`,
      });
      return;
    }

    setProfileSaving(true);
    setProfileStatus(null);

    try {
      const payload = {
        avatarUrl: avatarUrl || null,
        bio: bio || null,
      };

      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "更新個人檔案失敗");
      }

      setProfile(data);
      setToast({ type: "success", message: "個人檔案已更新" });
      setIsProfileModalOpen(false);

      if (typeof window !== "undefined") {
        saveAuthSession({
          ...(authUser ?? {}),
          id: data.id,
          email: data.email,
          name: data.name,
          username: data.username,
          isBlocked: data.isBlocked,
          avatarUrl: data.avatarUrl,
          bio: data.bio,
        });
      }
    } catch (error) {
      console.error("更新個人檔案失敗:", error);
      setProfileStatus({
        type: "error",
        message: error.message || "更新個人檔案失敗",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleShareCard = async (card) => {
    const url = buildShareUrl(card);
    if (!url) {
      setToast({ type: "error", message: "無法建立分享連結" });
      return;
    }

    try {
      if (typeof navigator !== "undefined") {
        if (navigator.share) {
          await navigator.share({ title: card.title || "祈禱卡片", url });
          setToast({ type: "success", message: "已開啟分享選單" });
          return;
        }

        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          setToast({ type: "success", message: "分享連結已複製" });
          return;
        }
      }

      setToast({ type: "error", message: "裝置不支援自動分享，請手動複製連結" });
    } catch (error) {
      console.error("分享祈禱卡片失敗:", error);
      setToast({ type: "error", message: "分享失敗，請稍後再試" });
    }
  };

  const handleDeleteCard = async (card) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`確定要刪除「${card.title}」嗎？`);
      if (!confirmed) return;
    }

    if (card.isBlocked) {
      setToast({ type: "error", message: "此祈禱卡片已被封鎖，無法刪除" });
      return;
    }

    setCardAction({ id: card.id, type: "delete" });

    try {
      const res = await fetch(`/api/customer/cards/${card.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "刪除祈禱卡片失敗");
      }

      setCards((prev) => prev.filter((item) => item.id !== card.id));
      setToast({ type: "success", message: "祈禱卡片已刪除" });
    } catch (error) {
      console.error("刪除祈禱卡片失敗:", error);
      setToast({ type: "error", message: error.message || "刪除失敗" });
    } finally {
      setCardAction(null);
    }
  };

  const handleToggleVisibility = async (card) => {
    if (card.isBlocked) {
      setToast({ type: "error", message: "此祈禱卡片已被封鎖，無法變更顯示" });
      return;
    }

    setCardAction({ id: card.id, type: "visibility" });

    try {
      const res = await fetch(`/api/customer/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !card.isBlocked }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "更新顯示狀態失敗");
      }

      setCards((prev) => prev.map((item) => (item.id === data.id ? data : item)));
      setToast({
        type: "success",
        message: data.isBlocked ? "祈禱卡片已隱藏" : "祈禱卡片已重新顯示",
      });
    } catch (error) {
      console.error("更新顯示狀態失敗:", error);
      setToast({ type: "error", message: error.message || "操作失敗" });
    } finally {
      setCardAction(null);
    }
  };

  const renderCards = () => {
    if (cardsLoading) {
      return <p className="cp-helper">祈禱卡片載入中…</p>;
    }

    if (cardsError) {
      return <p className="cp-alert cp-alert--error">{cardsError}</p>;
    }

    if (!cards.length) {
      return (
        <div className="cp-empty">
          <p>目前尚未建立祈禱卡片。</p>
          <Link href="/customer-portal/create" className="cp-link">
            立即建立我的第一張祈禱卡片
          </Link>
        </div>
      );
    }

    return (
      <div className="cp-cards">
        {cards.map((card) => {
          const responsesCount = card._count?.responses ?? card.responsesCount ?? 0;
          const reportCount = card.reportCount ?? 0;
          const isDeleting = cardAction?.id === card.id && cardAction?.type === "delete";
          const isToggling = cardAction?.id === card.id && cardAction?.type === "visibility";
          const canManage = !card.isBlocked;
          const statusLabel = card.isBlocked ? "已封鎖" : "已發布";
          const coverAlt = card.alt || `${card.title || "祈禱卡片"} 封面`;
          const shareDisabled = !buildShareUrl(card);

          return (
            <article
              key={card.id}
              className={`cp-card${card.isBlocked ? " cp-card--muted" : ""}`}
            >
              <div className="cp-card__layout">
                <div className="cp-card__cover">
                  {card.image ? (
                    <img src={card.image} alt={coverAlt} loading="lazy" />
                  ) : (
                    <div className="cp-card__placeholder">尚無封面</div>
                  )}
                </div>

                <div className="cp-card__content">
                  <div className="cp-card__header">
                    <div className="cp-card__title">
                      <h3>{card.title || "未命名的祈禱卡片"}</h3>
                      {card.description ? (
                        <p className="cp-card__description">{card.description}</p>
                      ) : (
                        <p className="cp-helper">尚未撰寫描述</p>
                      )}
                    </div>
                    <span className={`cp-status${card.isBlocked ? " cp-status--inactive" : ""}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="cp-card__meta">
                    <span>更新：{formatTime(card.updatedAt)}</span>
                    {card.category?.name ? <span>分類：{card.category.name}</span> : null}
                    <span>回覆：{responsesCount}</span>
                    <span>被檢舉：{reportCount}</span>
                  </div>

                  <div className="cp-card__actions">
                    {canManage ? (
                      <Link
                        href={`/customer-portal/edit/${card.id}`}
                        className="cp-link"
                        prefetch={false}
                      >
                        編輯
                      </Link>
                    ) : (
                      <span className="cp-link cp-link--disabled" aria-disabled="true">
                        編輯
                      </span>
                    )}

                    <button
                      type="button"
                      className="cp-link cp-link--danger"
                      onClick={() => handleDeleteCard(card)}
                      disabled={!canManage || isDeleting}
                    >
                      {isDeleting ? "刪除中…" : "刪除"}
                    </button>

                    <button
                      type="button"
                      className="cp-link"
                      onClick={() => handleShareCard(card)}
                      disabled={shareDisabled}
                    >
                      分享連結
                    </button>

                    <button
                      type="button"
                      className="cp-link cp-link--muted"
                      onClick={() => handleToggleVisibility(card)}
                      disabled={!canManage || isToggling}
                    >
                      {isToggling ? "更新中…" : card.isBlocked ? "已封鎖" : "隱藏"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  };


  return (
    <>
      <SiteHeader activePath="/customer-portal" />
      <main className="cp-main">
        {toast ? (
          <div
            className={`cp-toast cp-toast--${toast.type ?? "info"}`}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        ) : null}

        {authUser?.isBlocked ? (
          <div className="cp-alert cp-alert--error">
            <h2>帳號已被暫時停權</h2>
            <p>您的帳號目前無法建立或管理祈禱卡片。請聯絡系統管理員。</p>
          </div>
        ) : (
          <>
            <section className="cp-profile">
              <div className="cp-profile__avatar">
                <img
                  src={resolvedAvatar}
                  alt={`${resolvedName} 的大頭貼`}
                  loading="lazy"
                />
                <button
                  type="button"
                  className="cp-profile__edit"
                  onClick={handleOpenProfileModal}
                >
                  更新自我介紹
                </button>
              </div>
              <div className="cp-profile__info">
                <div className="cp-profile__meta">
                  <h1>{resolvedName}</h1>
                  <span>{resolvedEmail}</span>
                </div>

                <div className="cp-profile__bio">
                  {profileLoading ? (
                    <p className="cp-helper">正在載入自我介紹…</p>
                  ) : profileError ? (
                    <p className="cp-alert cp-alert--error">{profileError}</p>
                  ) : profile?.bio ? (
                    <p>{profile.bio}</p>
                  ) : (
                    <p className="cp-helper">還沒有撰寫自我介紹，讓社群更認識你吧！</p>
                  )}
                </div>

                <div className="cp-profile__actions">
                  <button
                    type="button"
                    className="cp-button"
                    onClick={handleOpenProfileModal}
                  >
                    編輯個人檔案
                  </button>
                  <Link
                    className="cp-button cp-button--ghost"
                    href="/customer-portal/create"
                    prefetch={false}
                  >
                    新增祈禱卡片
                  </Link>
                </div>
              </div>
            </section>

            <section className="cp-hero">
              <div className="cp-hero__content">
                <p className="cp-badge">Member Workspace</p>
                <h1>祈禱影響力中心</h1>
                <p>
                  在這裡集中管理你的祈禱故事、更新祈禱進度與狀態，並透過分享讓更多人參與支持。
                </p>
                <div className="cp-hero__actions">
                  <Link
                    className="cp-button"
                    href="/customer-portal/create"
                    prefetch={false}
                  >
                    建立祈禱卡片
                  </Link>
                  <Link
                    className="cp-button cp-button--ghost"
                    href="/customer-portal/edit"
                    prefetch={false}
                  >
                    檢視全部清單
                  </Link>
                </div>
              </div>
              <div className="cp-hero__stats">
                <div className="cp-stat">
                  <span>祈禱卡片</span>
                  <strong>{cards.length}</strong>
                </div>
                <div className="cp-stat">
                  <span>隱藏中</span>
                  <strong>{cards.filter((card) => card.isBlocked).length}</strong>
                </div>
              </div>
            </section>

            <section className="cp-section cp-section--cards">
              <div className="cp-section__head">
                <div>
                  <h2>我的祈禱卡片</h2>
                  <p>編輯、分享、隱藏祈禱卡片，掌握你的禱告旅程。</p>
                </div>
                <Link
                  href="/customer-portal/create"
                  className="cp-button"
                  prefetch={false}
                >
                  + 建立祈禱卡片
                </Link>
              </div>

              {renderCards()}
            </section>
          </>
        )}
      </main>
      <SiteFooter />

      {isProfileModalOpen ? (
        <div className="cp-modal" role="dialog" aria-modal="true">
          <div className="cp-modal__backdrop" onClick={handleCloseProfileModal} />
          <div className="cp-modal__card">
            <header className="cp-modal__header">
              <h3>編輯個人檔案</h3>
              <p>更新自我介紹與大頭貼，讓大家更了解你。</p>
            </header>

            <label className="cp-modal__field">
              <span>大頭貼圖片網址</span>
              <input
                type="url"
                value={profileForm.avatarUrl}
                onChange={updateProfileField("avatarUrl")}
                placeholder="貼上線上圖片連結"
              />
              <small className="cp-helper">
                建議使用正方形圖片。預設圖像：Unsplash 自然光人像。
              </small>
            </label>

            <div className="cp-modal__preview">
              {profileForm.avatarUrl ? (
                <img src={profileForm.avatarUrl} alt="大頭貼預覽" />
              ) : (
                <div className="cp-modal__placeholder">預覽</div>
              )}
            </div>

            <label className="cp-modal__field">
              <span>自我介紹</span>
              <textarea
                rows={4}
                value={profileForm.bio}
                onChange={updateProfileField("bio")}
                maxLength={MAX_BIO_LENGTH}
                placeholder="分享你的信仰旅程、祈禱焦點或協助方式。"
              />
              <small className="cp-helper">
                {profileForm.bio.trim().length} / {MAX_BIO_LENGTH}
              </small>
            </label>

            {profileStatus ? (
              <div
                className={`cp-alert cp-alert--${profileStatus.type ?? "info"}`}
                role="status"
              >
                {profileStatus.message}
              </div>
            ) : null}

            <div className="cp-modal__actions">
              <button
                type="button"
                className="cp-button cp-button--ghost"
                onClick={handleCloseProfileModal}
                disabled={profileSaving}
              >
                取消
              </button>
              <button
                type="button"
                className="cp-button"
                onClick={handleSaveProfile}
                disabled={profileSaving}
              >
                {profileSaving ? "儲存中…" : "儲存變更"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}


