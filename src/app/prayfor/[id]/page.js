import Link from "next/link";
import { notFound } from "next/navigation";

import Comments from "@/components/Comments";
import DetailAudioQueueBootstrap from "@/components/prayer-detail/DetailAudioQueueBootstrap";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import {
  readAdjacentHomeCards,
  readHomeCard,
  readRelatedHomeCards,
} from "@/lib/homeCards";
import { sanitizeHtmlForDisplay, sanitizeHtmlToPlainText } from "@/lib/htmlSanitizer";
import { normalizeAudioUrl } from "@/lib/media-url";

import "@/styles/theme-detail.css";

export const dynamic = "force-dynamic";

function parseId(paramValue) {
  const raw = typeof paramValue === "string" ? paramValue.trim() : "";
  if (!raw) return null;
  const value = raw.split("%2B").join("+");
  const match = value.match(/^(\d+)/);
  if (!match) return null;
  const id = Number(match[1]);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function formatResponseCount(count) {
  const safe = Number(count) || 0;
  if (safe >= 1000) {
    return `${(safe / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(safe);
}

function getAuthorName(card) {
  return card?.owner?.name?.trim?.() || "匿名使用者";
}

function buildPrayerMetaDescription(description) {
  const plain = sanitizeHtmlToPlainText(description).replace(/\s+/g, " ").trim();
  if (!plain) {
    return "讓我們一起禱告，願這份需要被看見並得到回應。";
  }
  const snippet = plain.length > 120 ? `${plain.slice(0, 120).trim()}...` : plain;
  return `讓我們一起禱告，${snippet}`;
}

export async function generateMetadata({ params }) {
  const id = parseId(params?.id);
  if (!id) {
    return {
      title: "禱告內容 | Start Pray 一起禱告吧",
      description: "讓我們一起禱告，願這份需要被看見並得到回應。",
    };
  }
  const card = await readHomeCard(id);
  if (!card) {
    return {
      title: "禱告內容 | Start Pray 一起禱告吧",
      description: "讓我們一起禱告，願這份需要被看見並得到回應。",
    };
  }
  return {
    title: "禱告內容 | Start Pray 一起禱告吧",
    description: buildPrayerMetaDescription(card.description),
  };
}

export default async function PrayerDetailPage({ params }) {
  const id = parseId(params?.id);
  if (!id) return notFound();

  const [card, relatedCards, adjacentCards] = await Promise.all([
    readHomeCard(id),
    readRelatedHomeCards(id, 4),
    readAdjacentHomeCards(id),
  ]);

  if (!card) return notFound();

  const owner = card.owner ?? null;
  const ownerName = getAuthorName(card);
  const ownerAvatar = owner?.avatarUrl?.trim?.() || "";
  const updatedDisplay = card.updatedAt
    ? new Date(card.updatedAt).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "未更新";
  const createdDisplay = card.createdAt
    ? new Date(card.createdAt).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : updatedDisplay;

  const detailImage = card.image || "/img/categories/popular.jpg";
  const descriptionHtml = sanitizeHtmlForDisplay(card.description || "<p>目前尚無詳細內容</p>");
  const responseCount = Number(card?._count?.responses || 0);
  const normalizedVoiceHref = normalizeAudioUrl(card.voiceHref);
  const initialTrack = normalizedVoiceHref
    ? {
        id: `primary-${card.id}`,
        voiceUrl: normalizedVoiceHref,
        speaker: ownerName,
        message: card.title,
        avatarUrl: ownerAvatar,
        requestTitle: card.title,
        coverImage: detailImage,
      }
    : null;

  const previousCard = adjacentCards?.prev || null;
  const nextCard = adjacentCards?.next || null;

  return (
    <>
      <SiteHeader activePath="/prayfor" />

      <main className="pdv2-page">
        {previousCard ? (
          <Link href={`/prayfor/${previousCard.id}`} prefetch={false} className="pdv2-nav-arrow pdv2-nav-arrow--prev" aria-label={`上一則：${previousCard.title}`}>
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </Link>
        ) : (
          <span className="pdv2-nav-arrow pdv2-nav-arrow--prev is-disabled" aria-hidden="true">
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </span>
        )}

        {nextCard ? (
          <Link href={`/prayfor/${nextCard.id}`} prefetch={false} className="pdv2-nav-arrow pdv2-nav-arrow--next" aria-label={`下一則：${nextCard.title}`}>
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </Link>
        ) : (
          <span className="pdv2-nav-arrow pdv2-nav-arrow--next is-disabled" aria-hidden="true">
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </span>
        )}

        <div className="pdv2-shell">
          <Link href="/prayfor" prefetch={false} className="pdv2-back-link">
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            返回禱告牆
          </Link>

          <article className="pdv2-hero-card">
            <div className="pdv2-hero-image-wrap">
              <img src={detailImage} alt={card.title} loading="lazy" />
            </div>

            <div className="pdv2-hero-body">
              <div className="pdv2-title-row">
                <h1>{card.title}</h1>
                <Link href="#responses-panel" prefetch={false} className="pdv2-follow-btn">
                  留下回應
                </Link>
              </div>

              <div className="pdv2-meta-row">
                {/* <span>更新日期：{updatedDisplay}</span> */}
                <span>建立日期：{createdDisplay}</span>
                <span>上傳者：{ownerName}</span>
                {/* <span>回應數：{responseCount}</span> */}
              </div>
            </div>
          </article>

          <article className="pdv2-content-card">
            <div className="pdv2-content-body" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          </article>

          <section className="pdv2-comments-card" id="responses-panel">
            <div className="pdv2-comments-head">
              <h2>留言與代禱回應</h2>
            </div>
            <Comments requestId={String(card.id)} ownerId={owner?.id} prayerTitle={card.title} />
          </section>

          <section className="pdv2-adjacent" aria-label="上一篇與下一篇">
            <h2>繼續瀏覽</h2>
            <div className="pdv2-adjacent-grid">
              {previousCard ? (
                <Link href={`/prayfor/${previousCard.id}`} prefetch={false} className="pdv2-adjacent-card">
                  <span className="pdv2-adjacent-card__label">上一篇</span>
                  <strong>{previousCard.title}</strong>
                </Link>
              ) : (
                <div className="pdv2-adjacent-card is-disabled" aria-disabled="true">
                  <span className="pdv2-adjacent-card__label">上一篇</span>
                  <strong>目前沒有上一篇</strong>
                </div>
              )}

              {nextCard ? (
                <Link href={`/prayfor/${nextCard.id}`} prefetch={false} className="pdv2-adjacent-card">
                  <span className="pdv2-adjacent-card__label">下一篇</span>
                  <strong>{nextCard.title}</strong>
                </Link>
              ) : (
                <div className="pdv2-adjacent-card is-disabled" aria-disabled="true">
                  <span className="pdv2-adjacent-card__label">下一篇</span>
                  <strong>目前沒有下一篇</strong>
                </div>
              )}
            </div>
          </section>

          {relatedCards?.length ? (
            <section className="pdv2-related-section" aria-label="其他代禱事項">
              <div className="pdv2-related-head">
                <h2>其他代禱事項</h2>
                <Link href="/prayfor" prefetch={false}>
                  查看更多
                </Link>
              </div>

              <div className="home-card-grid pdv2-home-card-grid">
                {relatedCards.map((item) => {
                  const relatedAuthor = getAuthorName(item);
                  const relatedCount = item?._count?.responses ?? item?.responsesCount ?? 0;
                  return (
                    <article key={item.id} className="home-card">
                      <Link
                        href={`/prayfor/${item.id}`}
                        prefetch={false}
                        className="home-card__cover-link"
                        aria-label={`前往 ${item.title}`}
                      />

                      <div
                        className="home-card__bg"
                        style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
                        aria-hidden="true"
                      />

                      <div className="home-card__content">
                        <h4 className="home-card__title">{item.title}</h4>
                        <div className="home-card__tag-row">
                          <span className="home-card__category">{item.category?.name || "代禱"}</span>
                        </div>
                        <div className="home-card__meta home-card__meta--bottom">
                          <span className="home-card__author" title={`作者：${relatedAuthor}`}>
                            作者：{relatedAuthor}
                          </span>
                          <span className="home-card__responses">{formatResponseCount(relatedCount)} 則</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <DetailAudioQueueBootstrap
        requestId={String(card.id)}
        prayerTitle={card.title}
        initialTrack={initialTrack}
      />

      <SiteFooter />
    </>
  );
}
