import Link from "next/link";

import "@/styles/theme-customer.css";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { listPublicOvercomers } from "@/lib/overcomer-server";

export const metadata = {
  title: "得勝者專區 | Start Pray 一起禱告吧",
  description: "探索公開個人頁面，延續代禱、回應與同行的見證。",
};

export const dynamic = "force-dynamic";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80";

function formatDateTime(value) {
  if (!value) return "尚未更新";
  try {
    return new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(value));
  } catch {
    return new Date(value).toLocaleDateString("zh-TW");
  }
}

export default async function OvercomerIndexPage() {
  const overcomers = await listPublicOvercomers();
  const totalCards = overcomers.reduce((sum, item) => sum + Number(item?._count?.homePrayerCards ?? 0), 0);
  const totalResponses = overcomers.reduce((sum, item) => sum + Number(item?._count?.prayerResponses ?? 0), 0);

  return (
    <>
      <SiteHeader activePath="/overcomer" />
      <main className="cp-main cp-main--overcomer">
        <section className="cp-section">
          <div className="cp-section__head">
            <div>
              <h1>得勝者專區</h1>
              <p>把故事從單次回應延伸成持續同行。你可以在這裡找到公開個人頁，回到那些仍在被守望的人身上。</p>
            </div>
            <Link href="/signup" prefetch={false} className="cp-button">
              建立我的公開頁
            </Link>
          </div>

          <div className="home-stats__container">
            <article className="home-stats__item">
              <span className="home-stats__label">公開個人頁</span>
              <strong className="home-stats__value">{overcomers.length}</strong>
              <p className="home-stats__hint">目前可瀏覽的得勝者頁面</p>
            </article>
            <article className="home-stats__item">
              <span className="home-stats__label">公開代禱事項</span>
              <strong className="home-stats__value">{totalCards.toLocaleString("zh-TW")}</strong>
              <p className="home-stats__hint">仍在等待同行與代禱的故事</p>
            </article>
            <article className="home-stats__item">
              <span className="home-stats__label">公開回應</span>
              <strong className="home-stats__value">{totalResponses.toLocaleString("zh-TW")}</strong>
              <p className="home-stats__hint">已留下來的聲音與鼓勵</p>
            </article>
          </div>
        </section>

        <section className="cp-section cp-section--cards">
          <div className="cp-section__head">
            <div>
              <h2>最近更新的公開頁</h2>
              <p>優先顯示最近有更新的個人頁，讓使用者有明確回訪理由。</p>
            </div>
          </div>

          {overcomers.length === 0 ? (
            <div className="cp-empty">
              <p>目前尚未有公開的得勝者頁面。</p>
              <Link href="/customer-portal" prefetch={false} className="cp-link">
                前往會員中心開啟公開個人頁
              </Link>
            </div>
          ) : (
            <div className="cp-cards">
              {overcomers.map((item) => {
                const profileHref = `/overcomer/${encodeURIComponent(item.slug)}`;
                const avatarUrl = item.avatarUrl?.trim() || DEFAULT_AVATAR;
                const displayName = item.name || item.username || "匿名使用者";
                const bio = item.bio?.trim() || "這位使用者尚未補充個人介紹。";

                return (
                  <article key={item.id} className="cp-card">
                    <div className="cp-card__layout cp-card__layout--profile">
                      <Link href={profileHref} prefetch={false} className="cp-overcomer-card__avatar">
                        <img src={avatarUrl} alt={`${displayName} 大頭貼`} loading="lazy" />
                      </Link>
                      <div className="cp-card__content">
                        <div className="cp-card__header">
                          <div className="cp-card__title">
                            <h3>{displayName}</h3>
                            <p className="cp-card__description">{bio}</p>
                          </div>
                          <span className="cp-status">公開中</span>
                        </div>

                        <div className="cp-card__meta">
                          <span>加入時間：{formatDateTime(item.createdAt)}</span>
                          <span>最近更新：{formatDateTime(item.updatedAt)}</span>
                          <span>代禱事項：{Number(item?._count?.homePrayerCards ?? 0).toLocaleString("zh-TW")}</span>
                          <span>回應：{Number(item?._count?.prayerResponses ?? 0).toLocaleString("zh-TW")}</span>
                        </div>

                        <div className="cp-card__actions">
                          <Link href={profileHref} className="cp-button" prefetch={false}>
                            查看公開頁
                          </Link>
                          <Link href="/prayfor" className="cp-button cp-button--ghost" prefetch={false}>
                            瀏覽更多代禱事項
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
