import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import OvercomerReportButton from "@/components/OvercomerReportButton";
import { buildOvercomerCardPath, buildOvercomerResponsePath, readOvercomerProfile } from "@/lib/overcomer-server";
import { buildOvercomerSlug, parseOvercomerSlug } from "@/lib/overcomer";

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
      <main className="cp-main">
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
          <h2>已發佈的祈禱內容</h2>
          {cards.length === 0 ? (
            <p className="cp-helper">尚未發佈祈禱卡片。</p>
          ) : (
            <div className="cp-cards">
              {cards.map((card) => {
                const link = buildOvercomerCardPath(card);
                return (
                  <article key={card.id} className="cp-card">
                    <div className="cp-card__layout">
                      <div className="cp-card__cover">
                        {card.image ? (
                          <img src={card.image} alt={card.title || "祈禱卡片封面"} loading="lazy" />
                        ) : (
                          <div className="cp-card__placeholder">尚無封面</div>
                        )}
                      </div>
                      <div className="cp-card__content">
                        <h3>{card.title || "未命名祈禱卡片"}</h3>
                        <p className="cp-helper">{card.description || "尚未撰寫描述。"}</p>
                        <div className="cp-card__meta">
                          <span>更新時間：{formatDateTime(card.updatedAt)}</span>
                          <span>回應數：{card._count?.responses ?? 0}</span>
                        </div>
                        {link ? (
                          <Link href={link} className="cp-link" prefetch={false}>
                            查看祈禱卡片
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
          <h2>發表的代禱回應</h2>
          {responses.length === 0 ? (
            <p className="cp-helper">尚未發表代禱回應。</p>
          ) : (
            <ul className="cp-replies">
              {responses.map((reply) => {
                const link = buildOvercomerResponsePath(reply);
                return (
                  <li key={reply.id} className="cp-reply">
                    {reply.message ? <p className="cp-reply__content">{reply.message}</p> : null}
                    <div className="cp-meta">
                      <span>發表時間：{formatDateTime(reply.createdAt)}</span>
                      {link ? (
                        <>
                          <span> ｜ </span>
                          <Link href={link} prefetch={false}>
                            查看祈禱卡片
                          </Link>
                        </>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

