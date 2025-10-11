"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const POPULAR_SLUG = "popular";
const DEFAULT_LIMIT = 6;
const SUGGESTION_LIMIT = 6;
const SEARCH_DEBOUNCE = 2000;

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
  const [hasSearched, setHasSearched] = useState(false);

  const debounceTimeoutRef = useRef(null);
  const searchControllerRef = useRef(null);

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

  const trimmedQuery = searchQuery.trim();

  const runSearch = useCallback(
    async (query, { signal } = {}) => {
      if (!query) return;

      setIsSearchLoading(true);
      setSearchError(null);
      try {
        const results = await fetchCards(
          { search: query, limit: DEFAULT_LIMIT * 2, sort: "responses" },
          { signal }
        );
        setSearchResults(results);
        setHasSearched(true);
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        console.warn("[HomePrayerExplorer] search failed", error);
        setSearchError("搜尋發生錯誤，請稍後再試");
        setHasSearched(true);
      } finally {
        setIsSearchLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    if (searchControllerRef.current) {
      searchControllerRef.current.abort();
      searchControllerRef.current = null;
    }

    if (!trimmedQuery) {
      setSearchResults([]);
      setIsSearchLoading(false);
      setSearchError(null);
      setHasSearched(false);
      return undefined;
    }

    const controller = new AbortController();
    searchControllerRef.current = controller;

    debounceTimeoutRef.current = setTimeout(() => {
      runSearch(trimmedQuery, { signal: controller.signal }).finally(() => {
        if (searchControllerRef.current === controller) {
          searchControllerRef.current = null;
        }
      });
    }, SEARCH_DEBOUNCE);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      controller.abort();
      if (searchControllerRef.current === controller) {
        searchControllerRef.current = null;
      }
    };
  }, [trimmedQuery, runSearch]);

  const displayCards = trimmedQuery ? searchResults : cards;
  const displayIsLoading = trimmedQuery ? isSearchLoading : isLoading;
  const displayError = trimmedQuery ? searchError : loadError;
  const isShowingSearchResults = Boolean(trimmedQuery);
  const suggestions = isShowingSearchResults ? searchResults.slice(0, SUGGESTION_LIMIT) : [];
  const showSuggestions = Boolean(
    trimmedQuery && (isSearchLoading || searchError || suggestions.length > 0 || hasSearched)
  );

  const handleCategorySelect = async (slug) => {
    if (!slug) return;
    if (slug === activeCategory && !isShowingSearchResults) {
      return;
    }

    setActiveCategory(slug);
    setSearchQuery("");
    setHasSearched(false);
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
      setLoadError("無法載入內容，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const value = event?.target?.value ?? "";
    setSearchQuery(value);
    setHasSearched(false);
    if (value.trim()) {
      setActiveCategory(null);
    } else {
      setSearchResults([]);
      setSearchError(null);
      setActiveCategory((prev) => prev || POPULAR_SLUG);
    }
  };

  const handleSearchSubmit = () => {
    const query = trimmedQuery;
    if (!query) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    if (searchControllerRef.current) {
      searchControllerRef.current.abort();
      searchControllerRef.current = null;
    }

    const controller = new AbortController();
    searchControllerRef.current = controller;
    runSearch(query, { signal: controller.signal }).finally(() => {
      if (searchControllerRef.current === controller) {
        searchControllerRef.current = null;
      }
    });
  };

  const headingText = isShowingSearchResults
    ? `搜尋結果：「${searchQuery.trim()}」`
    : activeCategory === POPULAR_SLUG
    ? "熱門祈禱"
    : "祈禱卡片";

  return (
    <section className="section home-explorer">
      <div className="home-explorer__header">
        <div>
          <span className="badge-soft">PRAYER DISCOVERY</span>
          <h2>{"探索祈禱與影響力"}</h2>
          <p className="muted">
            {"精選內容，幫助你快速找到可以代祈的主題。"}
          </p>
        </div>
        <div className="home-explorer__search-card">
          <div className="home-explorer__search">
            <label htmlFor="home-explorer-search" className="sr-only">
              {"搜尋祈禱需求與影響力專案"}
            </label>
            <input
              id="home-explorer-search"
              type="search"
              placeholder="輸入關鍵字，例如：福音、個人、世界局勢、政治、健康..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="home-explorer__search-input"
              autoComplete="off"
            />
            <button
              type="button"
              className="home-explorer__search-button"
              onClick={handleSearchSubmit}
              disabled={!trimmedQuery || isSearchLoading}
            >
              {isSearchLoading ? "搜尋中..." : "搜尋"}
            </button>
            {showSuggestions ? (
              <div className="home-explorer__suggestions" role="listbox" aria-label="搜尋建議">
                {isSearchLoading ? (
                  <div className="home-explorer__suggestion home-explorer__suggestion--status">
                    {"搜尋中…"}
                  </div>
                ) : null}
                {searchError ? (
                  <div className="home-explorer__suggestion home-explorer__suggestion--status home-explorer__suggestion--error">
                    {searchError}
                  </div>
                ) : null}
                {!isSearchLoading && !searchError && hasSearched && suggestions.length === 0 ? (
                  <div className="home-explorer__suggestion home-explorer__suggestion--status muted">
                    {"沒有找到相關的主題"}
                  </div>
                ) : null}
                {suggestions.map((item) => {
                  if (!item) return null;
                  const detailHref = `/prayfor/${item.id}`;
                  return (
                    <Link
                      key={item.id}
                      href={detailHref}
                      className="home-explorer__suggestion"
                      prefetch={false}
                    >
                      <span className="home-explorer__suggestion-title">{item.title}</span>
                      <span className="home-explorer__suggestion-meta">
                        {item.category?.name || "禱告主題"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
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
                <span className="home-category-card__description">
                  {category.description || "沒有描述"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="home-cards">
        <div className="home-cards__header">
          <h3>{headingText}</h3>
          {displayIsLoading ? (
            <span className="home-cards__status">{"載入中..."}</span>
          ) : null}
          {displayError ? <span className="home-cards__status error">{displayError}</span> : null}
        </div>

        <div className="home-card-grid">
          {displayCards.map((card) => {
            const responseCount = card?._count?.responses ?? card?.responsesCount ?? 0;
            const detailHref = `/prayfor/${card.id}`;
            return (
              <article key={card.id} className="home-card">
                <div
                  className="home-card__media"
                  style={card.image ? { backgroundImage: `url(${card.image})` } : undefined}
                >
                  <span className="home-card__category">{card.category?.name || "未分類"}</span>
                </div>
                <div className="home-card__body">
                  <h4>{card.title}</h4>
                  <p>{card.description}</p>
                </div>
                <div className="home-card__footer">
                  <span className="home-card__responses">
                    {formatResponseCount(responseCount)}{"個回應"}
                  </span>
                  <Link href={detailHref} className="home-card__link" prefetch={false}>
                    {"查看詳情"}
                  </Link>
                </div>
              </article>
            );
          })}
          {!displayIsLoading && !displayError && displayCards.length === 0 ? (
            <p className="home-card__empty">
              {"目前沒有符合條件的祈禱卡片"}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
