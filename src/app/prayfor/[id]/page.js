import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import Comments from "@/components/Comments";
import PrayerAudioPlayer from "@/components/PrayerAudioPlayer";
import ShareButton from "@/components/ShareButton";
import PrayerRequestActions from "@/components/PrayerRequestActions";
import { readHomeCard, readRelatedHomeCards } from "@/lib/homeCards";
import { sanitizeHtmlForDisplay, sanitizeHtmlToPlainText } from "@/lib/htmlSanitizer";

import "@/styles/prayer-detail.css";

export const dynamic = "force-dynamic";

function SafeLink({ href, children, className, prefetch = false }) {
  if (!href || typeof href !== "string") {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link href={href} className={className} prefetch={prefetch}>
      {children}
    </Link>
  );
}

function formatMeta(meta = []) {
  return Array.isArray(meta) ? meta.filter(Boolean) : [];
}

function parseId(paramValue) {
  const raw = typeof paramValue === "string" ? paramValue.trim() : "";
  if (!raw) return null;
  const value = raw.split("%2B").join("+"); // tolerate encoded plus signs
  const match = value.match(/^(\d+)/);
  if (!match) return null;
  const id = Number(match[1]);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function getOwnerInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "祈";
}

export async function generateMetadata({ params }) {
  console.log("[PrayerDetail] generateMetadata params", params?.id);
  const id = parseId(params?.id);
  if (!id) return {};

  const card = await readHomeCard(id);
  console.log("[PrayerDetail] generateMetadata card", { id, found: Boolean(card) });
  if (!card) return {};

  const metaItems = formatMeta(card.meta);
  const descriptionText = sanitizeHtmlToPlainText(card.description);
  const combinedMeta = metaItems.join(" • ");
  const description = descriptionText || combinedMeta;
  return {
    title: `${card.title} ｜ Prayer Coin`,
    description: description || "邀請一起為這份需要代禱。",
    openGraph: {
      title: card.title,
      description: description || undefined,
      images: card.image ? [{ url: card.image, alt: card.alt || card.title }] : undefined,
    },
  };
}

export default async function PrayerDetailPage({ params }) {
  console.log("[PrayerDetail] params raw", params?.id);
  const id = parseId(params?.id);
  console.log("[PrayerDetail] parsed", id);

  if (!id) {
    return notFound();
  }

  const card = await readHomeCard(id);
  console.log("[PrayerDetail] card", { id, found: Boolean(card) });

  if (!card) {
    return notFound();
  }

  const relatedCards = (await readRelatedHomeCards(card.id, 3)).filter(
    (item) => item && Number(item.id) !== Number(card.id)
  );
  console.log("[PrayerDetail] relatedCards", relatedCards.map((item) => item?.id));

  const canonical = `/prayfor/${card.id}`;

  const heroStyle = card.image
    ? {
        backgroundImage: `linear-gradient(rgba(13, 20, 33, 0.75), rgba(13, 20, 33, 0.65)), url(${card.image})`,
      }
    : undefined;

  const metaItems = formatMeta(card.meta);
  const descriptionHtml = sanitizeHtmlForDisplay(card.description);
  const descriptionPlainText = sanitizeHtmlToPlainText(card.description);
  const owner = card.owner ?? null;
  const ownerIdValue = owner?.id ? String(owner.id) : null;
  const ownerName = owner?.name?.trim() || "匿名發起人";
  const ownerAvatar = owner?.avatarUrl?.trim() || "";
  const ownerBio = owner?.bio?.trim() || "";

  return (
    <>
      <SiteHeader activePath="/prayfor" />

      <main className="pray-detail">
        <section className="pray-hero" style={heroStyle}>
          <div className="pray-hero__content">
            <div className="pray-hero__top">
              <nav className="breadcrumb" aria-label="breadcrumb">
                <SafeLink href="/prayfor" prefetch={false} className="breadcrumb__link">
                  祈禱列表
                </SafeLink>
                <span className="breadcrumb__separator" aria-hidden="true">/</span>
                <span>{card.title}</span>
              </nav>
              <PrayerRequestActions
                cardId={card.id}
                canonicalUrl={canonical}
                title={card.title}
                description={descriptionPlainText || metaItems.join("、")}
                reportCount={card.reportCount ?? 0}
              />
            </div>
            <h1>{card.title}</h1>
            {card.tags?.length ? (
              <ul className="pray-hero__tags" aria-label="祈禱主題">
                {card.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : null}
            {metaItems.length ? <p className="pray-hero__meta">{metaItems.join(" • ")}</p> : null}
              <PrayerAudioPlayer
                requestId={String(card.id)}
                initialTrack={card.voiceHref ? { voiceUrl: card.voiceHref, speaker: card.title || "祈禱錄音" } : null}
              />


          </div>
        </section>

        <section className="pray-container">
          <article className="pray-article">
            {card.image ? (
              <div className="pray-cover">
                <img src={card.image} alt={card.alt || card.title} loading="lazy" />
              </div>
            ) : null}

            <div className="pray-article__body">
              {descriptionHtml ? (
                <div
                  className="pray-article__content"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              ) : null}

              {metaItems.length ? (
                <div className="pray-article__meta">
                  <h3>背景資訊</h3>
                  <ul>
                    {metaItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="pray-article__note">
                <h4>如何回應</h4>
                <p>
                  歡迎註冊成為用戶，並在下方留下您寶貴的錄音一起替他們加油打氣，更可以為他們禱告。
                </p>
              </div>

              {/* <div className="pray-share">
                <h4>分享這張祈禱卡片</h4>
                <p className="pray-share__hint">透過社群或訊息讓更多人加入代禱行列。</p>
                <ShareButton canonical={canonical} />
              </div> */}

              <section className="pray-owner-card">
                <h4>祈禱發起人</h4>
                <div className="pray-owner-card__content">
                  <div className="pray-owner-card__avatar" aria-hidden="true">
                    {ownerAvatar ? (
                      <img src={ownerAvatar} alt={ownerName} loading="lazy" />
                    ) : (
                      <span>{getOwnerInitial(ownerName)}</span>
                    )}
                  </div>
                  <div className="pray-owner-card__details">
                    <strong>{ownerName}</strong>
                    <p className={ownerBio ? undefined : 'muted'}>{ownerBio || '這位發起人尚未留下自我介紹。'}</p>
                  </div>
                </div>
              </section>

              <PrayerAudioPlayer
                requestId={String(card.id)}
                initialTrack={card.voiceHref ? { voiceUrl: card.voiceHref, speaker: card.title || "祈禱錄音" } : null}
              />

            </div>
          </article>

          <Comments requestId={String(card.id)} ownerId={ownerIdValue} />
        </section>

        <section className="pray-related">
          <h3>相關祈禱</h3>
          <ul className="pray-related__list">
            {relatedCards.length === 0 ? (
              <li className="muted">暫時沒有其他祈禱卡片。</li>
            ) : (
              relatedCards.map((item) => (
                <li key={item.id}>
                  <SafeLink
                    href={item?.id ? `/prayfor/${item.id}` : undefined}
                    prefetch={false}
                    className="pray-related__item"
                  >
                    <img src={item.image} alt={item.alt || item.title} loading="lazy" />
                    <div>
                      <strong>{item.title}</strong>
                      <p className="muted small">
                        {formatMeta(item.meta).slice(0, 2).join(" • ") || "有空可以進來看看"}
                      </p>
                    </div>
                  </SafeLink>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
