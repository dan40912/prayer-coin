import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import Comments from "@/components/Comments";
import PrayerAudioPlayer from "@/components/PrayerAudioPlayer";
import ShareButton from "@/components/ShareButton";
import PrayerRequestActions from "@/components/PrayerRequestActions";
import { readHomeCard, readRelatedHomeCards } from "@/lib/homeCards";
import { slugify } from "@/lib/slugify";

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

function parseIdAndSlug(idAndSlug = "") {
  if (!idAndSlug || typeof idAndSlug !== "string") return null;
  const decoded = decodeURIComponent(idAndSlug.trim());
  if (!decoded) return null;
  const [rawId, ...slugParts] = decoded.split("+");
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) return null;
  const slug = slugParts.length ? slugParts.join("+") : null;
  return { id, slug };
}

function getOwnerInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "祈";
}

export async function generateMetadata({ params }) {
  console.log("[PrayerDetail] generateMetadata params", params?.idAndSlug);
  const parsed = parseIdAndSlug(params?.idAndSlug);
  if (!parsed) return {};

  const card = await readHomeCard(parsed.id);
  console.log("[PrayerDetail] generateMetadata card", { id: parsed.id, found: Boolean(card) });
  if (!card) return {};

  const description = card.description || formatMeta(card.meta).join(" • ");
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
  console.log("[PrayerDetail] params raw", params?.idAndSlug);
  const parsed = parseIdAndSlug(params?.idAndSlug);
  console.log("[PrayerDetail] parsed", parsed);

  if (!parsed) {
    return notFound();
  }

  const card = await readHomeCard(parsed.id);
  console.log("[PrayerDetail] card", { id: parsed.id, found: Boolean(card) });

  if (!card) {
    return notFound();
  }

  const canonicalSlug = slugify(card.title);
  if (parsed.slug && parsed.slug !== canonicalSlug) {
    console.log("[PrayerDetail] redirecting canonical slug", { from: parsed.slug, to: canonicalSlug });
    redirect(`/prayfor/${card.id}+${canonicalSlug}`);
  }

  const relatedCards = (await readRelatedHomeCards(card.id, 3)).filter(
    (item) => item && Number(item.id) !== Number(card.id)
  );
  console.log("[PrayerDetail] relatedCards", relatedCards.map((item) => item?.id));

  const canonical = `/prayfor/${card.id}+${canonicalSlug}`;

  const heroStyle = card.image
    ? {
        backgroundImage: `linear-gradient(rgba(13, 20, 33, 0.75), rgba(13, 20, 33, 0.65)), url(${card.image})`,
      }
    : undefined;

  const metaItems = formatMeta(card.meta);
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
                description={card.description || metaItems.join("、")}
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
              {card.description ? <p className="pray-article__lead">{card.description}</p> : null}

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
                  若你想提供實質幫助或禱告支持，請使用平台回應機制或聯絡提交單位，我們重視匿名與隱私保護。
                </p>
              </div>

              <div className="pray-share">
                <h4>分享這張祈禱卡片</h4>
                <p className="pray-share__hint">透過社群或訊息讓更多人加入代禱行列。</p>
                <ShareButton canonical={canonical} />
              </div>

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
                    href={item?.id ? `/prayfor/${item.id}+${slugify(item.title)}` : undefined}
                    prefetch={false}
                    className="pray-related__item"
                  >
                    <img src={item.image} alt={item.alt || item.title} loading="lazy" />
                    <div>
                      <strong>{item.title}</strong>
                      <p className="muted small">
                        {formatMeta(item.meta).slice(0, 2).join(" • ") || "敬請期待"}
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
