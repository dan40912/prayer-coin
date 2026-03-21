import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

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
