import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "我的禱告管理 | Start Pray 一起禱告吧",
  description: "查看與管理你建立的禱告卡、回應互動與個人內容設定。",
};

const CustomerPortalClient = nextDynamic(
  () => import("./CustomerPortalClient"),
  {
    ssr: false,
    loading: () => (
      <main className="cp-main">
        <section className="cp-section">
          <p className="cp-helper">載入會員中心中...</p>
        </section>
      </main>
    ),
  }
);

export default function CustomerPortalPage() {
  return <CustomerPortalClient />;
}
