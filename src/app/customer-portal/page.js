"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { useAuthSession } from "@/hooks/useAuthSession"; // ✅ 加這行

export default function CustomerPortalPage() {
  const authUser = useAuthSession(); // ✅ 這樣才有 authUser 可用
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const res = await fetch("/api/customer/cards", { cache: "no-store" });
        if (!res.ok) throw new Error("無法取得卡片");
        const data = await res.json();
        setCards(data);
      } catch (err) {
        console.error("❌ 載入失敗:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCards();
  }, []);

  return (
    <>
      <SiteHeader activePath="/customer-portal" />
      <main className="cp-main">
        {/* ✅ 新增封鎖狀態檢查 */}
        {authUser?.isBlocked ? (
          <div className="cp-alert cp-alert--error">
            <h2>帳號已被封鎖</h2>
            <p>您目前無法新增或管理祈禱事項。如有問題，請聯絡管理員。</p>
          </div>
        ) : (
          <>
            {/* 原本的內容 */}
            <section className="cp-hero">
              <div className="cp-hero__content">
                <p className="cp-badge">Member Workspace</p>
                <h1>夥伴祈禱管理中心</h1>
                <p>
                  歡迎回來，這裡是整理祈禱故事與夥伴協作的溫暖基地。追蹤祈禱進度、補上代禱重點，
                  讓每一次守望都被記錄、看見並傳遞到需要的人手中。
                </p>
                <div className="cp-hero__actions">
                  <Link className="cp-button" href="/customer-portal/create" prefetch={false}>
                    新增祈禱卡片
                  </Link>
                  <Link className="cp-button cp-button--ghost" href="/customer-portal/edit" prefetch={false}>
                    管理現有卡片
                  </Link>
                </div>
              </div>
              <div className="cp-hero__stats">
                {/* 假設你有 stats，可以放這裡 */}
              </div>
            </section>
          </>
        )}

        {/* 我的祈禱卡片列表 */}
        {!authUser?.isBlocked && (
          <section className="cp-section">
            <div className="cp-section__head">
              <h2>我的祈禱卡片</h2>
              <p>查看並管理您曾經上傳的祈禱事項。</p>
            </div>

            {loading ? (
              <p>載入中...</p>
            ) : (
              <div className="cp-table">
                <div className="cp-table__header">
                  <span>標題</span>
                  <span>狀態</span>
                  <span>最後更新</span>
                  <span>操作</span>
                </div>
                {cards.length === 0 ? (
                  <div className="cp-table__row">
                    <span colSpan={4}>尚未新增任何祈禱卡片</span>
                  </div>
                ) : (
                  cards.map((card) => (
                    <div key={card.id} className="cp-table__row">
                      <span>{card.title}</span>
                      <span>{card.status ?? "公開"}</span>
                      <span>{new Date(card.updatedAt).toLocaleDateString()}</span>
                      <span className="cp-table__actions">
                        <Link href={`/customer-portal/edit/${card.id}`} className="cp-link">
                          編輯
                        </Link>
                        <button className="cp-link cp-link--danger">刪除</button>
                        <button className="cp-link">設為不可見</button>
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
