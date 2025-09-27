import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { readBanner } from "@/lib/banner";
import { readHomeCards } from "@/lib/homeCards";
import { slugify } from "@/lib/slugify"; // added

export const dynamic = "force-dynamic";

const heroChecklist = [
  "即時掌握祈禱需求與回應進度",
  "將禱告行動轉換為可追蹤的社會影響",
  "Dashboard 隨時更新社群指標與資源流向"
];

const filterCategories = [
  { href: "/legacy/search", label: "全部", active: true },
  { href: "/legacy/search?category=education", label: "教育" },
  { href: "/legacy/search?category=medical", label: "醫療" },
  { href: "/legacy/search?category=community", label: "社福" },
  { href: "/legacy/search?category=missions", label: "宣教" }
];

export default async function HomePage() {
  const [banner, cards] = await Promise.all([readBanner(), readHomeCards()]);

  // SafeLink: avoid passing undefined href to next/link and avoid spreading unsupported props onto native elements
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

  return (
    <>
      <SiteHeader activePath="/customer-portal"  />

      <main>
        <section
          className="hero hero--full hero--fade"
          style={{ backgroundImage: `url(${banner.heroImage})` }}
        >
          <div className="hero__overlay" />
          <div className="hero__content">
            {banner.eyebrow && <span className="badge-soft hero__badge">{banner.eyebrow}</span>}
            <h1>{banner.headline}</h1>
            <h2>{banner.subheadline}</h2>
            <p>{banner.description}</p>
            <div className="hero__buttons">
              <SafeLink href={banner?.primaryCta?.href} className="button button--primary" prefetch={false}>
                {banner?.primaryCta?.label || null}
              </SafeLink>
              <SafeLink href={banner?.secondaryCta?.href} className="button button--ghost" prefetch={false}>
                {banner?.secondaryCta?.label || null}
              </SafeLink>
            </div>
            <ul className="hero__checklist">
              {heroChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section" id="global-search">
          <div className="search-controls">
            <div>
              <h2>搜尋祈禱需求與影響力專案</h2>
              <p>輸入關鍵字或從分類開始瀏覽，找到你想守望的社群與需求，並追蹤後續更新。</p>
            </div>
            <form className="search-bar" action="/legacy/search" method="get">
              <input
                type="text"
                name="q"
                placeholder="搜尋祈禱主題，例如：教育、醫療、宣教"
              />
              <button type="submit">開始搜尋</button>
            </form>
            <div className="filter-row">
              <div className="filter-group">
                <span className="filter-title">熱門分類</span>
                {filterCategories.map((category) => (
                  <Link
                    key={category.label}
                    href={category.href}
                    prefetch={false}
                    className={`filter-pill${category.active ? " active" : ""}`}
                  >
                    {category.label}
                  </Link>
                ))}
              </div>
              <div className="filter-group">
                <span className="filter-title">排序</span>
                <select className="sort-select" defaultValue="最新需求">
                  <option>最新需求</option>
                  <option>回應數量</option>
                  <option>上架時間</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>最新祈禱需求</h2>
          <p>以下案例由合作教會與 NGO 提供，已通過基礎審核，可即時加入守望與資源連結。</p>
          <div className="card-grid">
            {cards.map((card) => (
              <article key={card.id} className="prayer-card">
                <img src={card.image} alt={card.alt} />
                <div className="card-body">
                  <div className="tag-list">
                    {card.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <div className="prayer-meta">
                    {card.meta.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </div>
                </div>
                <div className="card-footer">
                  { /* compute a stable details href instead of relying on card.detailsHref */ }
                  <Link
                    className="cta-link"
                    href={`/prayfor/${card.id}+${slugify(card.title)}`}
                    prefetch={false}
                  >
                    查看詳情 →
                  </Link>
                  <SafeLink className="voice-link" href={card?.voiceHref} prefetch={false}>
                    收聽禱告錄音
                  </SafeLink>
                </div>
              </article>
            ))}
          </div>
        </section>

     <section className="section section--alt">
          <div className="alt-columns">
            <div>
              <h3>我沒有信仰，但我希望…</h3>
              <p>我需要一個安全、非宗派的空間，讓人為我和我的需要禱告，並能匿名參與或接受支持。</p>
              <p>你可以瀏覽匿名祈禱、提出需要，或閱讀如何在平台上保護隱私的說明。</p>
              <div className="hero__buttons">
                <Link href="/legacy/search" className="button button--ghost" prefetch={false}>
                  瀏覽祈禱
                </Link>
                <Link href="/howto" className="button button--primary" prefetch={false}>
                  如何開始
                </Link>
              </div>
            </div>
            <div>
              <img src="/legacy/img/anon-prayer.jpg" alt="匿名守望示意" />
            </div>
          </div>
        </section>

        <section
          className="section section--full-split section--bg"
    
        >
          <div className="section__overlay" />
          <div className="section__inner split-inner">
            <div className="split-col split-col--left">
              <div className="split-card">
                <h3>我沒有信仰，但我希望能幫別人集氣</h3>
                <p>一個安全、非宗派的空間，讓人為我和我的需要禱告，並能匿名參與或接受支持。</p>
                <p>你可以瀏覽匿名祈禱、提出需要，或閱讀如何在平台上保護隱私的說明。</p>
                <div className="hero__buttons">
                  <Link href="/legacy/search" className="button button--ghost" prefetch={false}>
                    瀏覽祈禱
                  </Link>
                  <Link href="/howto" className="button button--primary" prefetch={false}>
                    如何開始
                  </Link>
                </div>
              </div>
              <div className="split-media">
                <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80" alt="匿名守望示意" />
              </div>
            </div>
            
            <div className="split-col split-col--right">
              <div className="split-card">
                <h3>我有信仰，我想要一個可以禱告的地方</h3>
                <p>建立你的禱告、邀請守望者或加入小組守望，一起代禱與回應。平台支援文字與語音回應。</p>
                <div className="hero__buttons">
                  <Link href="/my-prayers/new" className="button button--primary" prefetch={false}>
                    建立禱告
                  </Link>
                  <Link href="/customer-portal" className="button button--ghost" prefetch={false}>
                    管理中心
                  </Link>
                </div>
              </div>
              <div className="split-media">
                <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80" alt="信仰小組示意" />
              </div>
            </div>
          </div>
        </section>
                <section className="section section--video">
          <div className="video-inner">
            <div className="video-card">
              <h2>如何開始 &amp; 如何禱告</h2>
              <p>觀看教學影片，示範如何建立代禱、邀請守望者與實際的禱告流程。</p>

              <a
                className="video-thumb"
                href={"https://www.youtube.com/watch?v=" + "YOUR_VIDEO_ID"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={"https://img.youtube.com/vi/" + "YOUR_VIDEO_ID" + "/hqdefault.jpg"}
                  alt="教學影片縮圖"
                />
              </a>

              <div className="video-actions">
                <a
                  href={"https://www.youtube.com/watch?v=" + "YOUR_VIDEO_ID"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button--primary"
                >
                  觀看教學影片
                </a>
                <Link href="/howto" className="button button--ghost" prefetch={false}>
                  閱讀使用說明
                </Link>
              </div>

              <p className="muted">提示：將 YOUR_VIDEO_ID 換成你的影片 ID（例如 abc123xyz）。若要直接內嵌影片 iframe，我可以幫你改。</p>
            </div>
          </div>
        </section>    
         {/* <section className="section section--features">
          <div className="features-inner">
            <h2>平台三大特色</h2>
            <p className="lead">讓你更容易分享、守望與聆聽</p>

            <div className="features-grid">
              <div className="feature">
                <div className="feature-icon" aria-hidden>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 11v1a7 7 0 0 1-14 0v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 19v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>可以禱告錄音</h3>
                <p>直接在裝置錄製語音禱告，上傳後可供守望者收聽與回應。</p>
              </div>

              <div className="feature">
                <div className="feature-icon" aria-hidden>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 7V5a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>可以上傳代禱事項</h3>
                <p>建立並發布你的代禱事項，設定是否公開或私人並邀請守望者。</p>
              </div>

              <div className="feature">
                <div className="feature-icon" aria-hidden>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>播放別人的錄音</h3>
                <p>瀏覽並收聽其他守望者的錄音，給予回應或代幣支持。</p>
              </div>
            </div>
          </div>
        </section>         */}
               <section className="contact contact--newsletter" id="contact">
          <div className="contact__inner">
            <div className="contact__info">
              <h2>想即時收到新代禱事項通知嗎？</h2>
              <p>訂閱後一有新的代禱事項或你關注的主題更新，我們會立即以 Email 通知你。你也會收到每週精選與重要消息（可隨時取消）。</p>
              <ul className="contact__bullets" aria-hidden>
                <li>📣 一有代禱事項立刻告訴我</li>
                <li>📰 每週精選內容</li>
                <li>🔒 尊重隱私，可隨時取消訂閱</li>
              </ul>
            </div>

            <form className="contact__form" action="/api/subscribe" method="post">
              <label htmlFor="email">電子郵件</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" required />

              <div className="contact__options">
                <label className="contact__checkbox">
                  <input type="checkbox" name="notify_prayer" defaultChecked />
                  <span>一有代禱事項立刻告訴我</span>
                </label>
                <label className="contact__checkbox">
                  <input type="checkbox" name="weekly_digest" />
                  <span>訂閱每週精選</span>
                </label>
              </div>

              <button type="submit" className="button button--primary">訂閱並啟用通知</button>

              <p className="contact__privacy">我們只用你的 Email 發送通知與重要更新，不會外洩。</p>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}