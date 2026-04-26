import nextDynamic from "next/dynamic";

import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "會員中心",
  description: "登入後管理你的代禱事項、禱告回應、公開個人頁與錢包資訊。",
  path: "/customer-portal",
  noIndex: true,
});

const CustomerPortalClient = nextDynamic(
  () => import("./CustomerPortalClient"),
  {
    ssr: false,
    loading: () => (
      <main className="cp-main">
        <section className="cp-section">
          <p className="cp-helper">會員中心載入中...</p>
        </section>
      </main>
    ),
  }
);

export default function CustomerPortalPage() {
  return <CustomerPortalClient />;
}
