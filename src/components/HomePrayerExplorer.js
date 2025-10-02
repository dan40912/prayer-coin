"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { slugify } from "@/lib/slugify";

const POPULAR_SLUG = "popular";
const DEFAULT_LIMIT = 6;

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

async function fetchCards(params = {}, { signal } = {}) {
  const response = await fetch(`/api/home-cards${buildQuery(params)}`, { cache: "no-store", signal });
  if (!response.ok) {
    throw new Error(`Failed to load cards (${response.status})`);
  }
  return response.json();
}

function getCategoryBackground(slug) {
  if (!slug) return "";
  return `/img/categories/${slug}.jpg`;
}

function formatResponseCount(count) {
  const safe = Number(count) || 0;
  if (safe >= 1000) {
    return `${(safe / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${safe}`;
}

export default function HomePrayerExplorer({
  initialCategories = [],
  initialCards = [],
  initialActiveSlug = POPULAR_SLUG
}) {
  const [categories] = useState(initialCategories);
  const [activeCategory, setActiveCategory] = useState(initialActiveSlug);
  const [cards, setCards] = useState(initialCards);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const topCategories = useMemo(() => categories.slice(0, 5), [categories]);

  const categoryItems = useMemo(() => {
    return [
      {
        slug: POPULAR_SLUG,
        name: "熱門祈禱",
        description: "回應最多的禱告需求",
        background: "/img/categories/popular.jpg"
      },
      ...topCategories.map((item) => ({
        ...item,
        background: getCategoryBackground(item.slug)
      }))
    ];
  }, [topCategories]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchLoading(false);
      setSearchError(null);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setIsSearchLoading(true);
      setSearchError(null);
      try {
        const results = await fetchCards(
          { search: searchQuery.trim(), limit: DEFAULT_LIMIT * 2, sort: "responses" },
          { signal: controller.signal }
        );
        setSearchResults(results);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("[HomePrayerExplorer] search failed", error);
          setSearchError("搜尋發生錯誤，請稍後再試");
        }
      } finally {
        setIsSearchLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const displayCards = searchQuery.trim() ? searchResults : cards;
  const displayIsLoading = searchQuery.trim() ? isSearchLoading : isLoading;
  const displayError = searchQuery.trim() ? searchError : loadError;
  const isShowingSearchResults = Boolean(searchQuery.trim());

  const handleCategorySelect = async (slug) => {
    if (!slug) return;
    if (slug === activeCategory && !isShowingSearchResults) {
      return;
    }

    setActiveCategory(slug);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
    setIsLoading(true);
    setLoadError(null);

    try {
      const params = { limit: DEFAULT_LIMIT };
      if (slug === POPULAR_SLUG) {
        params.sort = "responses";
      } else {
        params.category = slug;
        params.sort = "recent";
      }
      const nextCards = await fetchCards(params);
      setCards(nextCards);
    } catch (error) {
      console.warn("[HomePrayerExplorer] load failed", error);
      setLoadError("無法載入禱告內容，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const value = event?.target?.value ?? "";
    setSearchQuery(value);
    if (value.trim()) {
      setActiveCategory(null);
    } else if (!value) {
      setSearchResults([]);
      setSearchError(null);
      setActiveCategory((prev) => prev || POPULAR_SLUG);
    }
  };

  const headingText = isShowingSearchResults
    ? `搜尋結果：${searchQuery.trim()}`
    : activeCategory === POPULAR_SLUG
    ? "回應最多的禱告卡片"
    : "最新禱告卡片";

  return (
    <section className="section home-explorer">
      <div className="home-explorer__header">
        <div>
          <span className="badge-soft">PRAYER DISCOVERY</span>
          <h2>搜尋祈禱需求與影響力專案</h2>
          <p className="muted">透過熱門分類或關鍵字，找到你想一起守望的禱告。</p>
        </div>
        {/* <div className="home-explorer__search">
          <label htmlFor="home-explorer-search" className="sr-only">
            搜尋祈禱需求與影響力專案
          </label>
          <input
            id="home-explorer-search"
            type="search"
            placeholder="輸入關鍵字，例如：宣教、青年、小組..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="home-explorer__search-input"
          />
          {searchQuery ? (
            <button
              type="button"
              className="home-explorer__search-clear"
              onClick={() => handleSearchChange({ target: { value: "" } })}
            >
              清除
            </button>
          ) : null}
        </div> */}
      </div>

      <div className="home-category-grid">
        {categoryItems.map((category) => {
          const isActive = category.slug && category.slug === activeCategory;
          return (
            <button
              key={category.slug}
              type="button"
              className={`home-category-card${isActive ? " is-active" : ""}`}
              onClick={() => handleCategorySelect(category.slug)}
            >
              <span
                className="home-category-card__bg"
                style={category.background ? { backgroundImage: `url(${category.background})` } : undefined}
                aria-hidden
              />
              <span className="home-category-card__content">
                <span className="home-category-card__name">{category.name}</span>
                <span className="home-category-card__description">{category.description || "最新禱告動態"}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="home-cards">
        <div className="home-cards__header">
          <h3>{headingText}</h3>
          {displayIsLoading ? <span className="home-cards__status">載入中...</span> : null}
          {displayError ? <span className="home-cards__status error">{displayError}</span> : null}
        </div>

        <div className="home-card-grid">
          {displayCards.map((card) => {
            const responseCount = card?._count?.responses ?? card?.responsesCount ?? 0;
            const detailHref = `/prayfor/${card.id}+${slugify(card.title)}`;
            return (
              <article key={card.id} className="home-card">
                <div
                  className="home-card__media"
                  style={card.image ? { backgroundImage: `url(${card.image})` } : undefined}
                >
                  <span className="home-card__category">{card.category?.name || "禱告需求"}</span>
                </div>
                <div className="home-card__body">
                  <h4>{card.title}</h4>
                  <p>{card.description}</p>
                </div>
                <div className="home-card__footer">
                  <span className="home-card__responses">{formatResponseCount(responseCount)} 則回應</span>
                  <Link href={detailHref} className="home-card__link" prefetch={false}>
                    查看詳情
                  </Link>
                </div>
              </article>
            );
          })}
          {!displayIsLoading && !displayError && displayCards.length === 0 ? (
            <p className="home-card__empty">目前沒有符合條件的禱告卡片。</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}