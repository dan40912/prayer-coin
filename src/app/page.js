import Link from "next/link";

import HomePrayerExplorer from "@/components/HomePrayerExplorer";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { readBanner } from "@/lib/banner";
import { readActiveCategories } from "@/lib/homeCategories";
import { readHomeCards } from "@/lib/homeCards";
export const dynamic = "force-dynamic";

const heroChecklist = [
  "即時掌握祈禱需求與回應進度",
  "將禱告行動轉換為可追蹤的社會影響",
  "Dashboard 隨時更新社群指標與資源流向",
];

export default async function HomePage() {
  const [banner, categories, topCards] = await Promise.all([
    readBanner(),
    readActiveCategories(),
    readHomeCards({ sort: "responses", limit: 6 })
  ]);

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

        <HomePrayerExplorer
          initialCategories={categories}
          initialCards={topCards}
        />

        <section className="section bg-light-flow" id="platform-intro">
  <div className="section__container text-center">
    {/* 標題與簡介 */}
    <h2>Let's Pray</h2>
    <p className="intro-text">
      Let's Pray 是一個創新的代禱與影響力平台。我們將傳統的善意與現代科技結合，讓您的每一個行動，都能被量化、被追蹤、並產生真實的社會效益。
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
        <h3>訂閱追蹤</h3>
        <p>全球代禱或特定代禱事項都可以通知您，立刻參與集氣</p>
      </div>
    </div>

    {/* 導引按鈕 */}
    <div className="cta-register">
      <Link
        href="/signup" // 假設您的註冊頁面是 /signup
        className="button button--large button--primary"
        prefetch={false}
      >
        立即加入
      </Link>
    </div>
  </div>
</section>
            <section className="section bg-gradient-power" id="universal-power">
  <div className="section__container">
    <div className="content-grid-2">
      <div className="content-text">
        <span className="badge-soft">🤝 跨越信仰，一同成就美好</span>
        <h2>你的善意，就是最好的「集氣」力量</h2>
        <p>
          即使沒有特定信仰，你也能透過平台貢獻一份獨特的能量。我們將你的每次關注與行動，轉化為對社會專案的實質支持和鼓勵。
        </p>
        <ul className="power-list">
          <li>✨ 點擊集氣：為急需幫助的個人或社群專案點亮一盞燈。</li>
          <li>🎯 追蹤影響：看見你的集氣如何轉化為實際的進度更新與正面改變。</li>
          <li>💡 普世關懷：不論背景，為共同的社會議題發聲與支持。</li>
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
            不論您是信仰新手或是資深信徒，不僅是一個代禱平台，更是您的屬靈成長夥伴。
          </p>
          <div className="feature-cards">
            <div className="feature-card">
              <h3>🙌 禱告入門指引</h3>
              <p>
               如果您不知道怎麼禱告，可以跟著我們一起，從深處轉向主。
              </p>
            </div>
            <div className="feature-card">
              <h3>🔗 聖徒共禱連結</h3>
              <p>
                與其他有共同負擔的信徒連結，為同一件人事物在靈裡合一，見證禱告的力量。
              </p>
            </div>
          </div>
          <Link
            href="/howto" // 連結到您網站導航中「使用說明」的錨點
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
        <p>深入了解 Let's Pray 的創立願景、團隊核心價值與我們承諾帶來的社會影響力。</p>
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
