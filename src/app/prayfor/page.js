import HomePrayerExplorer from "@/components/HomePrayerExplorer";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { readActiveCategories } from "@/lib/homeCategories";
import { readHomeCards } from "@/lib/homeCards";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "禱告牆",
  description: "瀏覽 Start Pray 代禱牆，找到需要陪伴的人，透過文字或語音留下真實的禱告回應。",
  path: "/prayfor",
  image: "/img/categories/popular.jpg",
});

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
        <section>
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
