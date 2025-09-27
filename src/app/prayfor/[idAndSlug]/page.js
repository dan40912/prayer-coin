import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { readHomeCards, readHomeCard } from "@/lib/homeCards";
import { slugify } from "@/lib/slugify";
import Comments from "@/components/Comments";
import "@/styles/prayer-detail.css";
export const dynamic = "force-dynamic";
import ShareButton from "@/components/ShareButton";

// 


// 

export default async function PrayerDetailPage({ params }) {
  const idAndSlug = decodeURIComponent(params.idAndSlug || "");
  const [id] = idAndSlug.split("+");
  if (!id) return notFound();

  const card = await readHomeCard(id);
  const cards = await readHomeCards();
  if (!card) return notFound();

  const SafeLink = ({ href, children, className, prefetch = false }) => {
    if (!href || typeof href !== "string") {
      return <span className={className}>{children}</span>;
    }
    return (
      <Link href={href} className={className} prefetch={prefetch}>
        {children}
      </Link>
    );
  };

  const canonical = `/prayfor/${card.id}+${slugify(card.title)}`;
  const related = cards.filter((c) => String(c.id) !== String(card.id)).slice(0, 4);

  return (
    <>
      <SiteHeader activePath="/prayfor" />

      <main>
        <section className="hero hero--small hero--fade"    >
          <div className="hero__overlay" />
          <div className="hero__content">
            <nav className="breadcrumb">
              <SafeLink href="/prayfor" prefetch={false}>祈禱列表</SafeLink> / <span>{card.title}</span>
            </nav>
            <h1>{card.title}</h1>
            <div className="tag-list" aria-hidden>
              {card.tags?.map((t) => (<span key={t} className="tag">{t}</span>))}
            </div>
            <p className="muted">{card.meta?.join(" • ")}</p>
          </div>
        </section>
        <section className="section">
          <div className="detail-grid">
            <article className="prayer-detail-card">
              <div className="detail-media">
                <img src={card.image} alt={card.alt || card.title} />
              </div>

              <div className="detail-body">
                <h2></h2>
                <p>{card.description}</p>

                {/* <h3>背景與細節</h3>
                <ul className="detail-list">
                  {card.meta?.map((m) => (<li key={m}>{m}</li>))}
                </ul>

                <div className="detail-actions">
                  {card.voiceHref ? (
                    <a
                      className="button button--primary"
                      href={card.voiceHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      收聽禱告錄音
                    </a>
                  ) : null}
                  <SafeLink href="/prayfor" className="button button--ghost" prefetch={false}>
                    回到列表
                  </SafeLink>
                </div> */}

                <div className="detail-note">
                  <h4>如何回應</h4>
                  <p>若你想提供實質幫助或禱告支持，請使用平台回應機制或聯絡提交單位。我們保護匿名與隱私。</p>
                </div>

                <div className="muted">分享連結：
                  <ShareButton canonical={canonical} />
                  {/* <SafeLink href={canonical} prefetch={false}>{canonical}</SafeLink> */}
                </div>
              </div>
            </article>
          </div>
        </section>

        <Comments
          requestId={String(card.id)}   // ✅ 必須加這個
          comments={[
            { user: "匿名代禱者", text: "願主堅固你們 🙏" },
            { user: "小明", text: "我會每天為你禱告！" }
          ]}
          audios={[
            "/voices/sample1.mp3",
            "/voices/sample2.mp3"
          ]}
        />
      </main>
      <div className="card">
                <h4>相關祈禱</h4>
                <ul className="related-list">
                  {related.map((r) => (
                    <li key={r.id}>
                      <SafeLink
                        href={r?.id ? `/prayfor/${r.id}+${slugify(r.title)}` : undefined}
                        prefetch={false}
                        className="related-item"
                      >
                        <img src={r.image} alt={r.alt || r.title} />
                        <div>
                          <strong>{r.title}</strong>
                          <div className="muted small">{r.meta?.slice(0,2).join(" • ")}</div>
                        </div>
                      </SafeLink>
                    </li>
                  ))}
                </ul>
              </div>

      <SiteFooter />
    </>
  );
}
