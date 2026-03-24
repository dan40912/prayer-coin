import Link from "next/link";

import HomePrayerExplorer from "@/components/HomePrayerExplorer";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { readBanner } from "@/lib/banner";
import { readActiveCategories } from "@/lib/homeCategories";
import { readHomeCards } from "@/lib/homeCards";
import { readHomeStats } from "@/lib/homeStats";

export const dynamic = "force-dynamic";

const DEFAULT_PRIMARY_CTA = { label: "發布代禱需求", href: "/customer-portal/create" };
const DEFAULT_SECONDARY_CTA = { label: "先看平台怎麼運作", href: "/howto" };
const DEFAULT_HERO_IMAGE = "/img/categories/popular.jpg";

function normalizeCta(cta, fallback) {
  const label = cta?.label?.trim?.() || fallback.label;
  const href = cta?.href?.trim?.() || fallback.href;

  if (!href.startsWith("/")) return fallback;
  if (href.startsWith("/legacy")) return fallback;

  return { label, href };
}

export const metadata = {
  title: "首頁 | Start Pray 一起禱告吧",
  description: "在 Start Pray 發佈禱告需求、收到文字與語音回應，讓每一份需要都被看見與陪伴。",
};

export default async function HomeLandingPage() {
  const [banner, categories, topCards, stats] = await Promise.all([
    readBanner(),
    readActiveCategories(),
    readHomeCards({ sort: "responses", limit: 12 }),
    readHomeStats(),
  ]);

  const primaryCta = normalizeCta(banner?.primaryCta, DEFAULT_PRIMARY_CTA);
  const secondaryCta = normalizeCta(banner?.secondaryCta, DEFAULT_SECONDARY_CTA);
  const heroImage = banner?.heroImage || DEFAULT_HERO_IMAGE;

  return (
    <>
      <SiteHeader activePath="/prayfor" />

      <main>
        <section className="hero hero--full hero--fade" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero__overlay" />
          <div className="hero__content">
            <span className="badge-soft hero__badge">{banner?.eyebrow || "START PRAY"}</span>
            <h1>{banner?.headline || "說出你的需要，讓人用禱告回應你"}</h1>
            <h2>{banner?.subheadline || "你可以發出代禱請求，也可以用聲音陪伴他人。"}</h2>
            <p>{banner?.description || "在這裡，代禱不是被滑過，而是被真實地聽見。"}</p>
            <div className="hero__buttons">
              <Link href={primaryCta.href} className="button button--primary" prefetch={false}>
                {primaryCta.label}
              </Link>
              <Link href={secondaryCta.href} className="button button--ghost" prefetch={false}>
                {secondaryCta.label}
              </Link>
            </div>
          </div>
        </section>

        <section className="section bg-light-flow" id="entry-flows">
          <div className="section__container">
            <h2>三條最短路徑</h2>
            <div className="feature-grid-3">
              <article className="feature-item">
                <h3>我想找人為我代禱</h3>
                <p>快速發布你的需求，讓願意代禱的人看見並回應你。</p>
                <Link href="/customer-portal/create" prefetch={false} className="link-arrow">
                  立即發布
                </Link>
              </article>
              <article className="feature-item">
                <h3>我想為別人代禱</h3>
                <p>前往禱告牆，從正在更新的需求中開始代禱與留言。</p>
                <Link href="#wall" prefetch={false} className="link-arrow">
                  前往禱告牆
                </Link>
              </article>
              <article className="feature-item">
                <h3>我想先了解平台</h3>
                <p>先看平台運作方式、回應形式與社群規範，再決定下一步。</p>
                <Link href="/howto" prefetch={false} className="link-arrow">
                  查看使用方式
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="section home-stats" aria-label="平台數據摘要">
          <div className="home-stats__container">
            <article className="home-stats__item">
              <span className="home-stats__icon" aria-hidden="true">
                🙏
              </span>
              <span className="home-stats__label">代禱事項</span>
              <strong className="home-stats__value">{stats.totalPrayerCards.toLocaleString("zh-TW")}</strong>
            </article>
            <article className="home-stats__item">
              <span className="home-stats__icon" aria-hidden="true">
                👥
              </span>
              <span className="home-stats__label">參與使用者</span>
              <strong className="home-stats__value">{stats.totalUsers.toLocaleString("zh-TW")}</strong>
            </article>
            <article className="home-stats__item">
              <span className="home-stats__icon" aria-hidden="true">
                🎧
              </span>
              <span className="home-stats__label">語音回應</span>
              <strong className="home-stats__value">{stats.totalVoiceResponses.toLocaleString("zh-TW")}</strong>
            </article>
          </div>
        </section>

        <section className="section" id="wall">
          <HomePrayerExplorer initialCategories={categories} initialCards={topCards} />
        </section>

        <section className="section bg-legal-links" id="trust-links">
          <div className="section__container">
            <div className="info-links-grid">
              <div className="info-link-group">
                <h3>平台定位</h3>
                <p>了解 Start Pray 的核心價值、適合對象與服務邊界。</p>
                <Link href="/about" className="link-arrow" prefetch={false}>
                  前往 About
                </Link>
              </div>
              <div className="info-link-group">
                <h3>使用方式</h3>
                <p>一步步看發布、留言、語音回應與後續追蹤方式。</p>
                <Link href="/howto" className="link-arrow" prefetch={false}>
                  前往 HowTo
                </Link>
              </div>
              <div className="info-link-group">
                <h3>條款與說明</h3>
                <p>查看白皮書、使用條款與平台規範，建立使用信任。</p>
                <Link href="/whitepaper" className="link-arrow" prefetch={false}>
                  前往條款
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
