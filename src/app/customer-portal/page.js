"use client";



import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";



import { SiteHeader, SiteFooter } from "@/components/site-chrome";

import { useAuthSession } from "@/hooks/useAuthSession";

import { saveAuthSession } from "@/lib/auth-storage";



const FALLBACK_AVATARS = {

  male: "/img/male.jpg",

  female: "/img/female.jpg",

};

const MAX_BIO_LENGTH = 360;

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;



function normalizeGender(value) {

  if (value === null || value === undefined) {

    return null;

  }



  const normalized = String(value).trim().toLowerCase();

  if (!normalized) {

    return null;

  }



  if (["male", "man", "m", "boy", "男", "男性"].includes(normalized)) {

    return "male";

  }



  if (["female", "woman", "f", "girl", "女", "女性"].includes(normalized)) {

    return "female";

  }



  return null;

}



function resolveDefaultAvatar(profileLike, authUserLike) {

  const candidates = [

    profileLike?.gender,

    profileLike?.sex,

    profileLike?.profileGender,

    authUserLike?.gender,

    authUserLike?.sex,

  ];



  for (const candidate of candidates) {

    const detected = normalizeGender(candidate);

    if (detected && FALLBACK_AVATARS[detected]) {

      return FALLBACK_AVATARS[detected];

    }

  }



  return FALLBACK_AVATARS.male;

}



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
  // Determine current site origin without a trailing slash.
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin.replace(/\/$/, "")
      : "";

  const rawHref = card?.detailsHref?.trim();

  // 1. Prefer explicit absolute URLs supplied via detailsHref.
  if (rawHref && /^https?:\/\//i.test(rawHref)) {
    return rawHref;
  }

  // 2. Support relative paths by prefixing the origin if available.
  if (rawHref) {
    const path = rawHref.replace(/^\/+/, "");
    return origin ? `${origin}/${path}` : `/${path}`;
  }

  // 3. Fallback to a canonical prayfor route using id + slug when possible.
  const slug = card?.slug || card?.id;
  if (slug) {
    const idAndSlug = card.id && card.slug ? `${card.id}+${card.slug}` : slug;
    const pathValue = `prayfor/${idAndSlug}`;

    return origin ? `${origin}/${pathValue}` : `/${pathValue}`;
  }

  // 4. Default to the site root when no data is available.
  return origin || "/";
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

  const avatarFileInputRef = useRef(null);

  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState("");



  const [cards, setCards] = useState([]);

  const [cardsLoading, setCardsLoading] = useState(true);

  const [cardsError, setCardsError] = useState("");

  const [cardAction, setCardAction] = useState(null);



  const [toast, setToast] = useState(null);



  const defaultAvatar = useMemo(

    () => resolveDefaultAvatar(profile, authUser),

    [profile, authUser]

  );



  useEffect(() => {

    if (selectedAvatarFile) {

      return;

    }



    const nextPreview = profileForm.avatarUrl?.trim() || defaultAvatar;

    setAvatarPreview((prev) => {

      if (prev === nextPreview) {

        return prev;

      }



      if (prev && prev.startsWith("blob:")) {

        URL.revokeObjectURL(prev);

      }



      return nextPreview;

    });

  }, [selectedAvatarFile, profileForm.avatarUrl, defaultAvatar]);



  useEffect(

    () => () => {

      if (avatarPreview && avatarPreview.startsWith("blob:")) {

        URL.revokeObjectURL(avatarPreview);

      }

    },

    [avatarPreview]

  );



  function resetAvatarFileSelection(nextPreview = "") {

    setSelectedAvatarFile(null);

    setAvatarPreview((prev) => {

      if (prev && prev.startsWith("blob:") && prev !== nextPreview) {

        URL.revokeObjectURL(prev);

      }



      return nextPreview;

    });



    if (avatarFileInputRef.current) {

      avatarFileInputRef.current.value = "";

    }

  }



  const resolvedAvatar = useMemo(() => {

    const avatar = profile?.avatarUrl?.trim();

    return avatar || defaultAvatar;

  }, [profile?.avatarUrl, defaultAvatar]);



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
      console.error("載入個人檔案發生錯誤:", error);
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
        throw new Error(data?.message || "無法取得祈禱卡");
      }

      setCards(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("載入祈禱卡發生錯誤:", error);
      setCardsError(error.message || "無法取得祈禱卡");
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

  const resolvedName = profile?.name ?? authUser?.name ?? "未命名使用者";
  const resolvedEmail = profile?.email ?? authUser?.email ?? "尚未提供電子郵件";

  const handleOpenProfileModal = () => {
    setProfileStatus(null);
    const currentAvatar = profile?.avatarUrl?.trim() || defaultAvatar;
    setProfileForm({
      avatarUrl: currentAvatar,
      bio: profile?.bio ?? "",
    });
    resetAvatarFileSelection(currentAvatar);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    if (profileSaving) return;
    setIsProfileModalOpen(false);
    const latestAvatar = profile?.avatarUrl?.trim() || defaultAvatar;
    resetAvatarFileSelection(latestAvatar);
  };

  const updateProfileField = (field) => (event) => {
    const value = event.target.value;
    if (field === "avatarUrl") {
      resetAvatarFileSelection(value.trim() || defaultAvatar);
    }
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      resetAvatarFileSelection(profileForm.avatarUrl?.trim() || defaultAvatar);
      return;
    }

    if (!file.type?.startsWith("image/")) {
      setProfileStatus({
        type: "error",
        message: "請選擇圖片檔案",
      });
      resetAvatarFileSelection(profileForm.avatarUrl?.trim() || defaultAvatar);
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      const sizeInMb = file.size / (1024 * 1024);
      setProfileStatus({
        type: "error",
        message: `圖片大小需小於 5MB，當前約 ${sizeInMb.toFixed(2)} MB`,
      });
      resetAvatarFileSelection(profileForm.avatarUrl?.trim() || defaultAvatar);
      return;
    }

    setProfileStatus(null);
    setSelectedAvatarFile(file);
    setAvatarPreview((prev) => {
      if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return URL.createObjectURL(file);
    });
  };

  const handleUseDefaultAvatar = () => {
    setProfileStatus(null);
    resetAvatarFileSelection(defaultAvatar);
    setProfileForm((prev) => ({ ...prev, avatarUrl: defaultAvatar }));
  };

  const handleSaveProfile = async () => {
    const trimmedAvatar = (profileForm.avatarUrl || "").trim();
    const trimmedBio = profileForm.bio.trim();
    const defaultAvatarUrl = defaultAvatar;

    if (trimmedBio.length > MAX_BIO_LENGTH) {
      setProfileStatus({
        type: "error",
        message: `個人簡介不可超過 ${MAX_BIO_LENGTH} 個字，目前為 ${trimmedBio.length} 個字`,
      });
      return;
    }

    if (selectedAvatarFile && selectedAvatarFile.size > MAX_AVATAR_BYTES) {
      const sizeInMb = selectedAvatarFile.size / (1024 * 1024);
      setProfileStatus({
        type: "error",
        message: `圖片大小需小於 5MB，當前約 ${sizeInMb.toFixed(2)} MB`,
      });
      return;
    }

    setProfileSaving(true);
    setProfileStatus(null);

    let nextAvatarUrl = trimmedAvatar;

    try {
      if (selectedAvatarFile) {
        setProfileStatus({ type: "info", message: "圖片上傳中，請稍候..." });
        const formData = new FormData();
        formData.append("file", selectedAvatarFile);

        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        const uploadPayload = await uploadRes.json().catch(() => null);

        if (!uploadRes.ok || !uploadPayload?.url) {
          throw new Error(uploadPayload?.message || "圖片上傳失敗");
        }

        nextAvatarUrl = uploadPayload.url;
        setProfileStatus(null);
      } else if (!nextAvatarUrl) {
        nextAvatarUrl = defaultAvatarUrl;
      }

      const payload = {
        avatarUrl: nextAvatarUrl || null,
        bio: trimmedBio || null,
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

      const savedAvatar = data?.avatarUrl?.trim() || nextAvatarUrl || defaultAvatarUrl;

      setProfile(data);
      setProfileForm({
        avatarUrl: savedAvatar,
        bio: data.bio ?? "",
      });
      resetAvatarFileSelection(savedAvatar);
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
          avatarUrl: savedAvatar,
          bio: data.bio,
        });
      }
    } catch (error) {
      console.error("更新個人檔案發生錯誤:", error);
      setProfileStatus({
        type: "error",
        message: error.message || "更新個人檔案發生錯誤",
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
          await navigator.share({ title: card.title || "祈禱卡", url });
          setToast({ type: "success", message: "已成功分享" });
          return;
        }

        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          setToast({ type: "success", message: "連結已複製" });
          return;
        }
      }

      setToast({
        type: "error",
        message: "裝置不支援自動分享，請手動複製連結",
      });
    } catch (error) {
      console.error("分享祈禱卡發生錯誤:", error);
      setToast({ type: "error", message: "分享失敗，請稍後再試" });
    }
  };



  const handleDeleteCard = async (card) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`確定要刪除「${card.title}」嗎？`);
      if (!confirmed) return;
    }

    if (card.isBlocked) {
      setToast({ type: "error", message: "祈禱卡已被封存，無法刪除" });
      return;
    }

    setCardAction({ id: card.id, type: "delete" });

    try {
      const res = await fetch(`/api/customer/cards/${card.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "刪除祈禱卡失敗");
      }

      setCards((prev) => prev.filter((item) => item.id !== card.id));
      setToast({ type: "success", message: "祈禱卡已刪除" });
    } catch (error) {
      console.error("刪除祈禱卡發生錯誤:", error);
      setToast({ type: "error", message: error.message || "刪除失敗" });
    } finally {
      setCardAction(null);
    }
  };



  const handleToggleVisibility = async (card) => {
    if (card.isBlocked) {
      setToast({ type: "error", message: "祈禱卡已被封存，無法變更顯示" });
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
        message: data.isBlocked ? "祈禱卡已封存" : "祈禱卡已重新顯示",
      });
    } catch (error) {
      console.error("更新顯示狀態發生錯誤:", error);
      setToast({ type: "error", message: error.message || "操作失敗" });
    } finally {
      setCardAction(null);
    }
  };



  const renderCards = () => {
    if (cardsLoading) {
      return <p className="cp-helper">祈禱卡載入中...</p>;
    }

    if (cardsError) {
      return <p className="cp-alert cp-alert--error">{cardsError}</p>;
    }

    if (!cards.length) {
      return (
        <div className="cp-empty">
          <p>目前尚未建立祈禱卡。</p>
          <Link href="/customer-portal/create" className="cp-link">
            點我立即建立祈禱卡
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
          const isToggling =
            cardAction?.id === card.id && cardAction?.type === "visibility";
          const canManage = !card.isBlocked;
          const statusLabel = card.isBlocked ? "已封存" : "已公開";
          const coverAlt = card.alt || `${card.title || "祈禱卡"} 封面`;
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
                        <p className="cp-helper">尚缺少描述文字</p>
                      )}
                    </div>
                    <span
                      className={`cp-status${card.isBlocked ? " cp-status--inactive" : ""}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div className="cp-card__meta">
                    <span>更新：{formatTime(card.updatedAt)}</span>
                    {card.category?.name ? <span>分類：{card.category.name}</span> : null}
                    <span>回應：{responsesCount}</span>
                    <span>檢舉：{reportCount}</span>
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
                      {isDeleting ? "刪除中..." : "刪除"}
                    </button>

                    <button
                      type="button"
                      className="cp-link"
                      onClick={() => handleShareCard(card)}
                      disabled={shareDisabled}
                    >
                      分享
                    </button>

                    <button
                      type="button"
                      className="cp-link cp-link--muted"
                      onClick={() => handleToggleVisibility(card)}
                      disabled={!canManage || isToggling}
                    >
                      {isToggling ? "切換中..." : card.isBlocked ? "公開" : "隱藏"}
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
                    <p className="cp-helper">資料載入中...</p>
                  ) : profileError ? (
                    <p className="cp-alert cp-alert--error">{profileError}</p>
                  ) : profile?.bio ? (
                    <p>{profile.bio}</p>
                  ) : (
                    <p className="cp-helper">尚未撰寫個人介紹，快來更新讓大家更了解你。</p>
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
                    新增祈禱卡
                  </Link>
                </div>
              </div>
            </section>



            <section className="cp-hero">
              <div className="cp-hero__content">
                <p className="cp-badge">Member Workspace</p>
                <h1>客戶祈禱中心</h1>
                <p>
                  在這裡管理你的祈禱卡，更新內容、追蹤狀態並與社群共享代禱需要。
                </p>
                <div className="cp-hero__actions">
                  <Link
                    className="cp-button"
                    href="/customer-portal/create"
                    prefetch={false}
                  >
                    建立祈禱卡
                  </Link>
                  <Link
                    className="cp-button cp-button--ghost"
                    href="/customer-portal/edit"
                    prefetch={false}
                  >
                    檢視我的清單
                  </Link>
                </div>
              </div>
              <div className="cp-hero__stats">
                <div className="cp-stat">
                  <span>祈禱卡</span>
                  <strong>{cards.length}</strong>
                </div>
                <div className="cp-stat">
                  <span>封存數</span>
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

              <span>大頭貼圖片</span>

              <input

                ref={avatarFileInputRef}

                type="file"

                accept="image/*"

                onChange={handleAvatarFileChange}

                disabled={profileSaving}

              />

              <small className="cp-helper">

                檔案需小於 5MB，送出時會自動壓縮為最佳格式。

              </small>

              <button

                type="button"

                className="cp-link cp-link--muted"

                onClick={handleUseDefaultAvatar}

                disabled={profileSaving}

              >

                使用預設圖片

              </button>

            </label>



            <label className="cp-modal__field">

              <span>圖片網址（選填）</span>

              <input

                type="url"

                value={profileForm.avatarUrl}

                onChange={updateProfileField("avatarUrl")}

                placeholder="可貼上自訂圖片網址"

                disabled={profileSaving}

              />

              <small className="cp-helper">

                若未輸入會使用預設頭像，或是選擇檔案上傳。

              </small>

            </label>



            <div className="cp-modal__preview">

              {avatarPreview ? (

                <img src={avatarPreview} alt="大頭貼預覽" />

              ) : (

                <div className="cp-modal__placeholder">預覽</div>

              )}

            </div>



            <label className="cp-modal__field">

              <span>個人簡介</span>

              <textarea

                rows={4}

                value={profileForm.bio}

                onChange={updateProfileField("bio")}

                maxLength={MAX_BIO_LENGTH}

                placeholder="分享你的信仰背景、祈禱焦點或協助方式。"

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





