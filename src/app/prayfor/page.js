import HomePrayerExplorer from "@/components/HomePrayerExplorer";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { readActiveCategories } from "@/lib/homeCategories";
import { readHomeCards } from "@/lib/homeCards";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Start Pray | 禱告牆",
  description: "搜尋與瀏覽代禱牆卡片。",
};

const WALL_CARD_LIMIT = 24;

export default async function PrayforWallPage() {
  const [categories, topCards] = await Promise.all([
    readActiveCategories(),
    readHomeCards({ sort: "responses", limit: WALL_CARD_LIMIT }),
  ]);

  return (
    <>
      <SiteHeader activePath="/prayfor" />

      <main>
        <section className="section" id="wall">
          <HomePrayerExplorer
            initialCategories={categories}
            initialCards={topCards}
            cardLimit={WALL_CARD_LIMIT}
          />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
