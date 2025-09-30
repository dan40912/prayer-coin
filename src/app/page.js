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
                     

<section className="section bg-light-flow" id="platform-intro">
  <div className="section__container text-center">
    {/* 標題與簡介 */}
    <h2>PRAY COIN 如何將心意轉化為行動？</h2>
    <p className="intro-text">
      **PRAY COIN** 是一個創新的代禱與影響力平台。我們將傳統的善意與現代科技結合，讓您的每一個行動，都能被量化、被追蹤、並產生真實的社會效益。
    </p>

    {/* 三個特色小格 (col-4 / Feature Cards) */}
    <div className="feature-grid-3">
      {/* 特色 1：上傳錄音 */}
      <div className="feature-item">
        <span className="icon-circle">🎙️</span>
        <h3>上傳錄音</h3>
        <p>無論是個人的代禱、祝福、或是集氣宣言，透過簡短錄音將您的心意傳遞給全世界。</p>
      </div>

      {/* 特色 2：聲歷其境 (社群共鳴) */}
      <div className="feature-item">
        <span className="icon-circle">👂</span>
        <h3>聲歷其境</h3>
        <p>聆聽來自不同社群與專案的真實需求，感受最迫切的呼求，讓愛與關懷零距離。</p>
      </div>

      {/* 特色 3：獲得代幣 (追蹤影響力) */}
      <div className="feature-item">
        <span className="icon-circle">🪙</span>
        <h3>獲得代幣</h3>
        <p>每次集氣或參與禱告，您將獲得 **PRAY COIN**，追蹤您所累積的正面影響力與貢獻。</p>
      </div>
    </div>

    {/* 導引按鈕 */}
    <div className="cta-register">
      <Link
        href="/signup" // 假設您的註冊頁面是 /signup
        className="button button--large button--primary"
        prefetch={false}
      >
        加入 PRAY COIN，啟動您的善意循環
      </Link>
    </div>
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
            <section className="section bg-gradient-power" id="universal-power">
  <div className="section__container">
    <div className="content-grid-2">
      <div className="content-text">
        <span className="badge-soft">🤝 跨越信仰，一同成就美好</span>
        <h2>你的善意，就是最好的「集氣」力量</h2>
        <p>
          即使沒有特定信仰，你也能透過 **PRAY COIN** 平台貢獻一份獨特的能量。我們將你的每次關注與行動，轉化為對社會專案的實質支持和鼓勵。
        </p>
        <ul className="power-list">
          <li>✨ **點擊集氣**：為急需幫助的個人或社群專案點亮一盞燈。</li>
          <li>🎯 **追蹤影響**：看見你的集氣如何轉化為實際的進度更新與正面改變。</li>
          <li>💡 **普世關懷**：不論背景，為共同的社會議題發聲與支持。</li>
        </ul>
        <Link
          href="/legacy/search" // 連結到您的搜尋頁面
          className="button button--secondary"
          prefetch={false}
        >
          立即開始集氣支持 →
        </Link>
      </div>
      <div className="content-image-wrapper">
        {/* 這裡可以放一張代表集氣、光芒或社會連結的圖片 */}
        <img
          src="legacy/img/not-beliver.jpg"
          alt="Universal power and support"
          loading="lazy"
          className="content-image"
        />
      </div>
    </div>
  </div>
</section>
<section className="section bg-dark-faith" id="faith-connect">
    <div className="section__container">
      <div className="content-grid-2 content-grid-reverse">
        <div className="content-text">
          <span className="badge-soft badge-light">🕊️ 深入信仰，連結社群</span>
          <h2>學習禱告的藝術，與全球聖徒同行</h2>
          <p>
            不論您是信仰新手或是資深信徒，**PRAY COIN** 不僅是一個代禱平台，更是您的屬靈成長夥伴。
          </p>
          <div className="feature-cards">
            <div className="feature-card">
              <h3>🙌 禱告入門指引</h3>
              <p>
                提供基礎的禱告範本與主題式指南，帶領您學習如何有效地與上主對話，建立個人靈修生活。
              </p>
            </div>
            <div className="feature-card">
              <h3>🔗 聖徒共禱連結</h3>
              <p>
                與其他有共同負擔的信徒連結，為同一件人事物在靈裡合一，見證禱告帶來的驚人突破與回應。
              </p>
            </div>
          </div>
          <Link
            href="../index.html#howto" // 連結到您網站導航中「使用說明」的錨點
            className="button button--primary"
            prefetch={false}
          >
            探索禱告學習資源 →
          </Link>
        </div>
        <div className="content-image-wrapper">
          {/* 這裡可以放一張代表屬靈、靜謐或連結的圖片 */}
          <img
            src="legacy/img/homepage-beleve.jpg"
            alt="Faith connection and prayer guidance"
            loading="lazy"
            className="content-image"
          />
        </div>
      </div>
    </div>
  </section>

<section className="section bg-legal-links" id="disclaimers">
  <div className="section__container">
    <div className="info-links-grid">
      {/* 關於我們連結 */}
      <div className="info-link-group">
        <h3>平台宗旨</h3>
        <p>深入了解 PRAY COIN 的創立願景、團隊核心價值與我們承諾帶來的社會影響力。</p>
        <Link
          href="/about"
          className="link-arrow"
          prefetch={false}
        >
          查看關於我們 →
        </Link>
      </div>

      {/* 使用說明連結 (從您的記憶資訊中取出) */}
      <div className="info-link-group">
        <h3>快速上手指南</h3>
        <p>從註冊、上傳錄音到追蹤代幣，一步步學習如何有效使用平台並發揮最大影響力。</p>
        <Link
          href="../howto" // 使用您儲存的錨點連結
          className="link-arrow"
          prefetch={false}
        >
          使用說明（HOWTO）→
        </Link>
      </div>

      {/* 白皮書與法律聲明連結 */}
      <div className="info-link-group">
        <h3>白皮書與免責聲明</h3>
        <p>閱讀我們的技術架構、代幣經濟學，以及相關的法律聲明和使用條款。</p>
        <Link
          href="/whitepaper"
          className="link-arrow"
          prefetch={false}
        >
          白皮書 / 免責聲明 →
        </Link>
      </div>
    </div>
  </div>
</section>

        {/* 其他 Section 保持不變 */}
        {/* ...（省略，邏輯和上面類似，主要是 key 與 href fallback 的修正）... */}
      </main>

      <SiteFooter />
    </>
  );
}
