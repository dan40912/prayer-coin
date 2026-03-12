import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import "@/styles/theme-customer.css";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import OvercomerReportButton from "@/components/OvercomerReportButton";
import ResponseReportButton from "@/components/ResponseReportButton";
import { buildOvercomerCardPath, buildOvercomerResponsePath, readOvercomerProfile } from "@/lib/overcomer-server";
import { buildOvercomerSlug, parseOvercomerSlug } from "@/lib/overcomer";

export const metadata = {
  title: "Start Pray | 得勝者 ",
  description: "登入 Start Pray 管理禱告內容、追蹤互動數據並查看代幣紀錄。"
};

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80";

function formatDateTime(value) {
  if (!value) return "尚未更新";
  try {
    return new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch (error) {
    console.error("formatDateTime failed", error);
    return new Date(value).toLocaleString();
  }
}

export const dynamic = "force-dynamic";

export default async function OvercomerProfilePage({ params }) {
  console.log("[overcomer] raw slug", params?.slug);
  const parsed = parseOvercomerSlug(params?.slug);
  console.log("[overcomer] parsed slug", parsed);
  if (!parsed?.username) {
    return notFound();
  }

  const profile = await readOvercomerProfile(parsed.username);
  console.log("[overcomer] profile exists", Boolean(profile));
  if (!profile) {
    return notFound();
  }

  const canonicalSlug = buildOvercomerSlug(profile);
  console.log("[overcomer] canonical slug", canonicalSlug);
  if (!canonicalSlug) {
    return notFound();
  }

  if (parsed.username !== canonicalSlug) {
    redirect(`/overcomer/${encodeURIComponent(canonicalSlug)}`);
  }

  const avatarUrl = profile.avatarUrl?.trim() || DEFAULT_AVATAR;
  const cards = profile.homePrayerCards ?? [];
  const responses = profile.prayerResponses ?? [];

  return (
    <>
      <SiteHeader activePath="/overcomer" />
      <main className="cp-main cp-main--overcomer">
        <section className="cp-profile">
          <div className="cp-profile__avatar">
            <img src={avatarUrl} alt={`${profile.name || "使用者"} 大頭貼`} loading="lazy" />
          </div>
          <div className="cp-profile__info">
            <h1>{profile.name || profile.username || "匿名使用者"}</h1>
            <p className="cp-helper">{profile.bio || "這位勇士尚未撰寫個人介紹。"}</p>
            <p className="cp-meta">加入時間：{formatDateTime(profile.createdAt)}</p>
            <OvercomerReportButton
              targetUserId={profile.id}
              targetUsername={profile.username}
              targetDisplayName={profile.name || profile.username}
            />
          </div>
        </section>

        <section className="cp-section cp-section--cards">
          <div className="cp-section__head">
            <div>
              <h2>已發佈的代禱事項</h2>
              <p>瀏覽 {profile.name || profile.username || "這位帶禱者"} 分享的最新禱告內容。</p>
            </div>
          </div>
          {cards.length === 0 ? (
            <p className="cp-helper">尚未發佈任何代禱事項。</p>
          ) : (
            <div className="cp-cards">
              {cards.map((card) => {
                const link = buildOvercomerCardPath(card);
                const coverAlt = card.alt || `${card.title || "祈禱卡片"} 封面`;
                return (
                  <article key={card.id} className="cp-card">
                    <div className="cp-card__layout">
                      <div className="cp-card__cover">
                        {link ? (
                          <Link href={link} prefetch={false} className="cp-card__cover-link">
                            {card.image ? (
                              <img src={card.image} alt={coverAlt} loading="lazy" />
                            ) : (
                              <div className="cp-card__placeholder">尚無封面</div>
                            )}
                          </Link>
                        ) : card.image ? (
                          <img src={card.image} alt={coverAlt} loading="lazy" />
                        ) : (
                          <div className="cp-card__placeholder">尚無封面</div>
                        )}
                      </div>
                      <div className="cp-card__content">
                        <div className="cp-card__title">
                          <h3>{card.title || "暫未命名的祈禱卡"}</h3>
                          {card.description ? (
                            <p className="cp-card__description">{card.description}</p>
                          ) : (
                            <p className="cp-helper">尚未提供詳細敘述。</p>
                          )}
                        </div>
                        <div className="cp-card__meta">
                          <span>更新時間：{formatDateTime(card.updatedAt)}</span>
                          <span>禱告錄音：{card._count?.responses ?? 0}</span>
                        </div>
                        {link ? (
                          <Link href={link} className="cp-link" prefetch={false}>
                            前往查看
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="cp-section cp-section--replies">
          <div className="cp-section__head">
            <div>
              <h2>個人回應</h2>
              <p>聆聽 {profile.name || profile.username || "這位帶禱者"} 的禱告同行記錄。</p>
            </div>
          </div>
          {responses.length === 0 ? (
            <p className="cp-helper">目前尚未有個人回應。</p>
          ) : (
            <div className="cp-replies">
              {responses.map((reply) => {
                const cardTitle = reply.homeCard?.title || "祈禱卡片";
                const cardAlt = reply.homeCard?.alt || `${cardTitle} 封面`;
                const cardImage = reply.homeCard?.image || null;
                const cardLink = buildOvercomerResponsePath(reply);
                const reportCount = reply.reportCount ?? 0;
                const publishedAt = formatDateTime(reply.createdAt);
                return (
                  <article key={reply.id} className="cp-reply">
                    <div className="cp-reply__header">
                      <div className="cp-reply__card">
                        {cardImage ? (
                          <img
                            src={cardImage}
                            alt={cardAlt}
                            className="cp-reply__thumb"
                            loading="lazy"
                          />
                        ) : (
                          <span
                            className="cp-reply__thumb cp-reply__thumb--placeholder"
                            aria-hidden="true"
                          >
                            🙏
                          </span>
                        )}
                        <div className="cp-reply__card-info">
                          <h3>{cardTitle}</h3>
                          {cardLink ? (
                            <Link href={cardLink} prefetch={false} className="cp-link">
                              查看代禱事項
                            </Link>
                          ) : null}
                        </div>
                      </div>
                      <ResponseReportButton responseId={reply.id} triggerLabel="檢舉" />
                    </div>

                    {reply.message ? (
                      <p className="cp-reply__content">{reply.message}</p>
                    ) : null}

                    {reply.voiceUrl ? (
                      <audio
                        className="cp-reply__audio"
                        controls
                        preload="none"
                        src={reply.voiceUrl}
                      >
                        您的瀏覽器不支援音訊播放。
                      </audio>
                    ) : null}

                    <div className="cp-reply__footer">
                      <div className="cp-reply__meta">
                        <span>發佈時間：{publishedAt}</span>
                        <span>檢舉數：{reportCount}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

