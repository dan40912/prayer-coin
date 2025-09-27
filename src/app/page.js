import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { readBanner } from "@/lib/banner";
import { readHomeCards } from "@/lib/homeCards";
import { slugify } from "@/lib/slugify"; // added
export const dynamic = "force-dynamic";

const heroChecklist = [
  "即時掌握祈禱需求與回應進度",
  "將禱告行動轉換為可追蹤的社會影響",
  "Dashboard 隨時更新社群指標與資源流向",
];

const filterCategories = [
  { href: "/legacy/search", label: "全部", active: true },
  { href: "/legacy/search?category=education", label: "教育" },
  { href: "/legacy/search?category=medical", label: "醫療" },
  { href: "/legacy/search?category=community", label: "社福" },
  { href: "/legacy/search?category=missions", label: "宣教" },
];

export default async function HomePage() {
  const [banner, cards] = await Promise.all([readBanner(), readHomeCards()]);
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
    
      <SiteHeader activePath="/customer-portal" />

      <main>
        {/* Hero Section */}
        <section
          className="hero hero--full hero--fade"
          style={{ backgroundImage: `url(${banner.heroImage})` }}
        >
          <div className="hero__overlay" />
          <div className="hero__content">
            {banner.eyebrow && (
              <span className="badge-soft hero__badge">{banner.eyebrow}</span>
            )}
            <h1>{banner.headline}</h1>
            <h2>{banner.subheadline}</h2>
            <p>{banner.description}</p>
            <div className="hero__buttons">
              <Link
                href={banner.primaryCta?.href || "#"}
                className="button button--primary"
                prefetch={false}
              >
                {banner.primaryCta?.label || "前往"}
              </Link>
              {banner.secondaryCta?.href && banner.secondaryCta?.label ? (
                <Link
                  href={banner.secondaryCta.href || "#"}
                  className="button button--ghost"
                  prefetch={false}
                >
                  {banner.secondaryCta.label}
                </Link>
              ) : null}
            </div>
            <ul className="hero__checklist">
              {heroChecklist.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Search Section */}
        <section className="section" id="global-search">
          <div className="search-controls">
            <div>
              <h2>搜尋祈禱需求與影響力專案</h2>
              <p>
                輸入關鍵字或從分類開始瀏覽，找到你想守望的社群與需求，並追蹤後續更新。
              </p>
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
                {filterCategories.map((category, idx) => (
                  <Link
                    key={idx}
                    href={category.href || "#"}
                    prefetch={false}
                    className={`filter-pill${
                      category.active ? " active" : ""
                    }`}
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

        {/* Cards Section */}
        <section className="section">
          <h2>最新祈禱需求</h2>
          <p>
            以下案例由合作教會與 NGO 提供，已通過基礎審核，可即時加入守望與資源連結。
          </p>
          <div className="card-grid">
            {cards.map((card) => (
              <article key={card.id} className="prayer-card">
                <img src={card.image} alt={card.alt} />
                <div className="card-body">
                  <div className="tag-list">
                    {card.tags.map((tag, idx) => (
                      <span key={idx} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <div className="prayer-meta">
                    {card.meta.map((line, idx) => (
                      <span key={idx}>{line}</span>
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

        {/* 其他 Section 保持不變 */}
        {/* ...（省略，邏輯和上面類似，主要是 key 與 href fallback 的修正）... */}
      </main>

      <SiteFooter />
    </>
  );
}
