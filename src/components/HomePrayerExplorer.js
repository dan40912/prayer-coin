"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAudio } from "@/context/AudioContext";

const POPULAR_SLUG = "popular";
const DEFAULT_LIMIT = 12;
const SUGGESTION_LIMIT = 6;
const FALLBACK_CATEGORY_LIMIT = 3;
const SEARCH_DEBOUNCE = 450;
const QUICK_SEARCH_TAGS = ["福音", "醫治", "家庭", "工作", "個人", "世界"];

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
  const response = await fetch(`/api/home-cards${buildQuery(params)}`, {
    cache: "no-store",
    signal,
  });
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

function getAuthorName(card) {
  return card?.owner?.name?.trim?.() || "匿名";
}

function buildPrimaryTrack(card) {
  if (!card?.voiceHref) return null;
  return {
    id: `card-${card.id}-primary`,
    voiceUrl: card.voiceHref,
    speaker: getAuthorName(card),
    message: card.title || "",
    avatarUrl: card?.owner?.avatarUrl?.trim?.() || "",
    requestTitle: card.title || "禱告錄音",
  };
}

function dedupeTracks(tracks) {
  const source = Array.isArray(tracks) ? tracks : [];
  const seen = new Set();
  const result = [];

  for (const track of source) {
    if (!track?.voiceUrl) continue;
    const key = track.voiceUrl;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(track);
  }
  return result;
}

export default function HomePrayerExplorer({
  initialCategories = [],
  initialCards = [],
  initialActiveSlug = POPULAR_SLUG,
  cardLimit = DEFAULT_LIMIT,
}) {
  const { setQueue } = useAudio();
  const resolvedCardLimit = Number.isFinite(cardLimit) && cardLimit > 0 ? Math.floor(cardLimit) : DEFAULT_LIMIT;

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
        name: "熱門禱告",
        description: "回應最多的禱告需求",
        background: "/img/categories/popular.jpg",
      },
      ...topCategories.map((item) => ({
        ...item,
        background: getCategoryBackground(item.slug),
      })),
    ];
  }, [topCategories]);
  const fallbackCategories = useMemo(
    () =>
      categoryItems
        .filter((item) => item?.slug && item.slug !== POPULAR_SLUG)
        .slice(0, FALLBACK_CATEGORY_LIMIT),
    [categoryItems]
  );

  const trimmedQuery = searchQuery.trim();

  const runSearch = useCallback(async (query, { signal } = {}) => {
    if (!query) return;

    setIsSearchLoading(true);
    setSearchError(null);
    try {
      const results = await fetchCards(
        { search: query, limit: resolvedCardLimit * 2, sort: "responses" },
        { signal }
      );
      setSearchResults(results);
      setHasSearched(true);
    } catch (error) {
      if (error.name === "AbortError") return;
      console.warn("[HomePrayerExplorer] search failed", error);
      setSearchError("搜尋發生錯誤，請稍後再試。");
      setHasSearched(true);
    } finally {
      setIsSearchLoading(false);
    }
  }, [resolvedCardLimit]);

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
  const queueCards = useMemo(
    () => (Array.isArray(displayCards) ? displayCards.slice(0, resolvedCardLimit) : []),
    [displayCards, resolvedCardLimit]
  );
  const queueSignature = useMemo(
    () =>
      queueCards
        .map((card) => `${card?.id ?? ""}:${card?.voiceHref ?? ""}:${card?._count?.responses ?? 0}`)
        .join("|"),
    [queueCards]
  );

  const handleCategorySelect = async (slug) => {
    if (!slug) return;
    if (slug === activeCategory && !isShowingSearchResults) return;

    setActiveCategory(slug);
    setSearchQuery("");
    setHasSearched(false);
    setSearchResults([]);
    setSearchError(null);
    setIsLoading(true);
    setLoadError(null);

    try {
      const params = { limit: resolvedCardLimit };
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
      setLoadError("無法載入內容，請稍後再試。");
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
  const handleResetToPopular = () => {
    setSearchQuery("");
    setHasSearched(false);
    setSearchResults([]);
    setSearchError(null);
    void handleCategorySelect(POPULAR_SLUG);
  };

  const handleRetryLoad = () => {
    if (trimmedQuery) {
      handleSearchSubmit();
      return;
    }
    void handleCategorySelect(activeCategory || POPULAR_SLUG);
  };

  const handleSearchSubmit = () => {
    const query = trimmedQuery;
    if (!query) return;
    setActiveCategory(null);

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

  const handleQuickTagSearch = (keyword) => {
    const query = (keyword || "").trim();
    if (!query) return;
    setSearchQuery(query);
    setHasSearched(false);
    setActiveCategory(null);

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

  useEffect(() => {
    if (displayIsLoading && !queueCards.length) return;
    const tracks = dedupeTracks(queueCards.map(buildPrimaryTrack));
    setQueue(tracks, -1);
  }, [displayIsLoading, queueCards, queueSignature, setQueue]);

  const headingText = isShowingSearchResults
    ? `搜尋結果：「${trimmedQuery}」`
    : activeCategory === POPULAR_SLUG
      ? "熱門禱告牆"
      : "禱告卡片牆";

  return (
    <section className="section home-explorer">
      <div className="home-explorer__header">
        <div className="home-explorer__intro">
         
        </div>
        <div className="home-explorer__search-card">
          <div className="home-explorer__search-head">
            <p className="home-explorer__search-title">搜尋禱告主題</p>
            <p className="home-explorer__search-helper">輸入關鍵字，或點選下方快速標籤</p>
          </div>
          <div className="home-explorer__search">
            <label htmlFor="home-explorer-search" className="sr-only">
              搜尋禱告主題
            </label>
            <input
              id="home-explorer-search"
              type="search"
              placeholder="輸入關鍵字，例如：福音、醫治、家庭、工作..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="home-explorer__search-input"
              autoComplete="off"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearchSubmit();
                }
              }}
            />
            <button
              type="button"
              className="home-explorer__search-button"
              onClick={handleSearchSubmit}
              disabled={!trimmedQuery || isSearchLoading}
            >
              {isSearchLoading ? "搜尋中..." : "立即搜尋"}
            </button>
            {showSuggestions ? (
              <div className="home-explorer__suggestions" role="listbox" aria-label="搜尋建議">
                {isSearchLoading ? (
                  <div className="home-explorer__suggestion home-explorer__suggestion--status">
                    搜尋中...
                  </div>
                ) : null}
                {searchError ? (
                  <div className="home-explorer__suggestion home-explorer__suggestion--status home-explorer__suggestion--error">
                    {searchError}
                  </div>
                ) : null}
                {!isSearchLoading && !searchError && hasSearched && suggestions.length === 0 ? (
                  <>
                    <div
                      className="home-explorer__suggestion home-explorer__suggestion--status muted"
                      role="status"
                      aria-live="polite"
                    >
                      找不到符合的結果，試試熱門禱告或其他分類。
                    </div>
                    <div className="home-explorer__suggestion-actions">
                      <button
                        type="button"
                        className="home-explorer__action-btn"
                        onClick={handleResetToPopular}
                      >
                        找不到？改看熱門禱告
                      </button>
                    </div>
                    {fallbackCategories.length ? (
                      <div className="home-explorer__suggestion-tag-list" role="group" aria-label="推薦分類">
                        {fallbackCategories.map((item) => (
                          <button
                            key={`fallback-${item.slug}`}
                            type="button"
                            className="home-explorer__suggestion-tag"
                            onClick={() => void handleCategorySelect(item.slug)}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </>
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
                        {item.category?.name || "禱告"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
          <div className="home-explorer__quick-tags" role="group" aria-label="快速搜尋標籤">
            {QUICK_SEARCH_TAGS.map((tag) => {
              const isActiveTag = trimmedQuery === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  className={`home-explorer__quick-tag${isActiveTag ? " is-active" : ""}`}
                  onClick={() => handleQuickTagSearch(tag)}
                >
                  {tag}
                </button>
              );
            })}
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
                <span className="home-category-card__description">{category.description || "沒有描述"}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="home-cards">
        <div className="home-cards__header" aria-live="polite">
          <h3>{headingText}</h3>
          {displayIsLoading ? <span className="home-cards__status">載入中...</span> : null}
          {displayError ? <span className="home-cards__status error">{displayError}</span> : null}
          {displayError ? (
            <button type="button" className="home-explorer__action-btn home-explorer__action-btn--ghost" onClick={handleRetryLoad}>
              重新整理
            </button>
          ) : null}
        </div>

        <div className="home-card-grid">
          {displayCards.map((card) => {
            const responseCount = card?._count?.responses ?? card?.responsesCount ?? 0;
            const detailHref = `/prayfor/${card.id}`;
            const authorName = getAuthorName(card);

            return (
              <article key={card.id} className="home-card">
                <Link
                  href={detailHref}
                  className="home-card__cover-link"
                  aria-label={`Open ${card.title}`}
                  prefetch={false}
                />
                <div
                  className="home-card__bg"
                  style={card.image ? { backgroundImage: `url(${card.image})` } : undefined}
                  aria-hidden="true"
                />
                <div className="home-card__content">
                  <h4 className="home-card__title">{card.title}</h4>
                  <div className="home-card__tag-row">
                    <span className="home-card__category">{card.category?.name || "禱告"}</span>
                  </div>
                  <div className="home-card__meta home-card__meta--bottom">
                    <span className="home-card__author" title={`作者 ${authorName}`}>
                      作者 {authorName}
                    </span>
                    <span className="home-card__responses">{formatResponseCount(responseCount)} 則</span>
                  </div>
                </div>
              </article>
            );
          })}

          {!displayIsLoading && !displayError && displayCards.length === 0 ? (
            <div className="home-card__empty" role="status" aria-live="polite">
              <p>目前沒有符合條件的禱告卡片。</p>
              <div className="home-card__empty-actions">
                <button type="button" className="home-explorer__action-btn" onClick={handleResetToPopular}>
                  回到熱門禱告
                </button>
                {fallbackCategories[0] ? (
                  <button
                    type="button"
                    className="home-explorer__action-btn home-explorer__action-btn--ghost"
                    onClick={() => void handleCategorySelect(fallbackCategories[0].slug)}
                  >
                    改看「{fallbackCategories[0].name}」
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
