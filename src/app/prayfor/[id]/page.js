import Link from "next/link";
import { notFound } from "next/navigation";
import { readHomeCard, readRelatedHomeCards } from "@/lib/homeCards";
import { sanitizeHtmlForDisplay, sanitizeHtmlToPlainText } from "@/lib/htmlSanitizer";
import PrayerAudioPlayer from "@/components/PrayerAudioPlayer";
import Comments from "@/components/Comments";
import ShareButton from "@/components/ShareButton";
import PrayerRequestActions from "@/components/PrayerRequestActions";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

// Import new styles
import "@/styles/theme-detail.css";

export const dynamic = "force-dynamic";

const FALLBACK_GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1520854221050-0f4caff449fb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80"
];

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

function formatMeta(meta = []) {
  return Array.isArray(meta) ? meta.filter(Boolean) : [];
}

export async function generateMetadata({ params }) {
  const id = parseId(params?.id);
  if (!id) return {};
  const card = await readHomeCard(id);
  if (!card) return {};
  return {
    title: `${card.title} - Start Pray`,
    description: sanitizeHtmlToPlainText(card.description) || "Join us in prayer.",
  };
}

export default async function PrayerDetailPage({ params }) {
  const id = parseId(params?.id);
  if (!id) return notFound();

  const card = await readHomeCard(id);
  if (!card) return notFound();

  const relatedCards = (await readRelatedHomeCards(card.id, 6)).filter(
    (item) => item && Number(item.id) !== Number(card.id)
  );

  const canonical = `/prayfor/${card.id}`;
  const metaItems = formatMeta(card.meta);
  const descriptionHtml = sanitizeHtmlForDisplay(card.description);
  const owner = card.owner ?? null;
  const ownerName = owner?.name?.trim() || "Prayer Host";
  const ownerAvatar = owner?.avatarUrl?.trim() || "";
  const bgImage = card.image || FALLBACK_GALLERY_IMAGES[0];

  return (
    <>
      <SiteHeader activePath="/prayfor" />
      <main className="detail-page" style={{ paddingTop: 0 }}>
        <div id="swipe-container">
          <section
            className="prayer-slide active"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(7, 11, 20, 0.8), rgba(7, 11, 20, 1)), url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="ambient-glow"></div>
            <div className="slide-content-wrapper">
              
              <article className="prayer-main-content">
                <div className="author-row">
                  {ownerAvatar ? (
                    <img src={ownerAvatar} alt={ownerName} className="card-avatar large" />
                  ) : (
                    <div className="card-avatar large">{ownerName[0]}</div>
                  )}
                  <div className="author-info">
                    <h2>{ownerName}</h2>
                    <span>{new Date(card.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button className="btn-follow">追蹤</button>
                </div>

                <div className="prayer-tags">
                  {metaItems.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>

                <h1 className="prayer-title">{card.title}</h1>
                
                <div className="prayer-body legacy-body-text" dangerouslySetInnerHTML={{ __html: descriptionHtml }}>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                    <PrayerAudioPlayer
                      requestId={String(card.id)}
                      initialTrack={card.voiceHref ? { voiceUrl: card.voiceHref, speaker: card.title } : null}
                    />
                </div>
              </article>

              <div className="responses-area glass-panel">
                <div className="responses-header">
                  <h3>來自遠方的聲音祝福</h3>
                </div>
                
                <div className="comments-wrapper">
                  <Comments requestId={String(card.id)} ownerId={owner?.id} />
                </div>
              </div>

            </div>
          </section>
        </div>
      </main>
    </>
  );
}
