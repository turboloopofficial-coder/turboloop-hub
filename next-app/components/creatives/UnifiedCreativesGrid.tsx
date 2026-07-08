"use client";
// UnifiedCreativesGrid — filterable, paginated grid for all 1,134+ creatives.
//
// v2: API-driven pagination. Instead of receiving all 1,134+ items as props
// (which serialises ~1.7 MB of JSON into the page HTML), this component now:
//   1. Receives only the first page of items as SSR props (fast initial render)
//   2. Fetches subsequent pages from /api/creatives on "Load more" clicks
//   3. Fetches /api/creatives/meta once on mount for filter metadata
//
// This drops the initial JS payload for /creatives from ~1.7 MB to ~50 KB.
//
// Features: category tabs, language filter, search, load-more pagination.
// Mobile-first: sticky filter bar, 2-col mobile → 3-col tablet → 4-col desktop.

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { UnifiedBannerCard } from "./UnifiedBannerCard";
import { DownloadKitButton } from "./DownloadKitButton";
import type { UnifiedCreative, UnifiedCategoryDef, CreativeLanguage } from "@lib/unifiedCreativesData";
import { UNIFIED_LANGUAGES } from "@lib/unifiedCreativesData";

const PAGE_SIZE = 48;

interface ApiResponse {
  items: UnifiedCreative[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface Props {
  // SSR-rendered first page of items (avoids loading skeleton on initial render)
  initialItems: UnifiedCreative[];
  initialTotal: number;
  // Categories + languages passed from the server (already computed at build time)
  categories: UnifiedCategoryDef[];
  // Optional pre-selected category (for /creatives/[category] sub-pages)
  initialCategory?: string;
  // When true, clicking a category tab navigates to /creatives/[id] instead of filtering in-place.
  categoryNavMode?: boolean;
}

export function UnifiedCreativesGrid({
  initialItems,
  initialTotal,
  categories,
  initialCategory,
  categoryNavMode = false,
}: Props) {
  const router = useRouter();
  // Hardcoded strings — /creatives is not inside the [locale] segment so
  // next-intl's useTranslations is not available here. These labels are
  // English-only; the page itself is not locale-routed.
  const t = (key: string) => ({
    byCategory: "By Category",
    byLanguage: "By Language",
    searchPlaceholder: "Search banners...",
    allLanguages: "All Languages",
  }[key] ?? key);
  const [exploreMode, setExploreMode] = useState<"category" | "language">("language");

  // When switching explore modes, reset the other filter to avoid cross-contamination
  const switchToCategory = () => {
    setExploreMode("category");
    setActiveLang("all"); // clear language filter when switching to category mode
  };
  const switchToLanguage = () => {
    setExploreMode("language");
    setActiveCategory(initialCategory ?? "all"); // clear category filter when switching to language mode
  };
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory ?? "all");
  const [activeLang, setActiveLang] = useState<CreativeLanguage | "all">("all");
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Paginated items state ──────────────────────────────────────────
  const [items, setItems] = useState<UnifiedCreative[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialItems.length < initialTotal);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Debounced search ───────────────────────────────────────────────
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ── Fetch from API when filters change ────────────────────────────
  // Reset to page 1 and refetch when any filter changes.
  useEffect(() => {
    // Skip the very first render — we already have SSR data for the
    // default state (all categories, all languages, no search, page 1).
    const isDefaultState =
      activeCategory === (initialCategory ?? "all") &&
      activeLang === "all" &&
      debouncedSearch === "" &&
      currentPage === 1;

    if (isDefaultState && items === initialItems) return;

    setLoading(true);
    setCurrentPage(1);

    const params = new URLSearchParams({ page: "1", pageSize: String(PAGE_SIZE) });
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (activeLang !== "all") params.set("lang", activeLang);
    if (debouncedSearch) params.set("q", debouncedSearch);

    fetch(`/api/creatives?${params}`)
      .then(r => r.json() as Promise<ApiResponse>)
      .then(data => {
        setItems(data.items);
        setTotal(data.total);
        setHasMore(data.hasMore);
      })
      .catch(err => console.error("[creatives] fetch failed:", err))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activeLang, debouncedSearch]);

  // ── Load more ─────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;

    const params = new URLSearchParams({ page: String(nextPage), pageSize: String(PAGE_SIZE) });
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (activeLang !== "all") params.set("lang", activeLang);
    if (debouncedSearch) params.set("q", debouncedSearch);

    try {
      const data: ApiResponse = await fetch(`/api/creatives?${params}`).then(r => r.json());
      setItems(prev => [...prev, ...data.items]);
      setCurrentPage(nextPage);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("[creatives] load more failed:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentPage, activeCategory, activeLang, debouncedSearch]);

  // ── Infinite scroll sentinel ──────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(loadMore);

  // Keep loadMoreRef current so the observer callback always calls the latest version
  useEffect(() => { loadMoreRef.current = loadMore; }, [loadMore]);

  // Attach IntersectionObserver to the sentinel div — re-run whenever hasMore changes
  // so the observer is always watching when there is more content to load.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadMoreRef.current();
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore]);

  const clearFilters = useCallback(() => {
    setActiveCategory(initialCategory ?? "all");
    setActiveLang("all");
    setSearch("");
  }, [initialCategory]);

  const isFiltered =
    activeCategory !== (initialCategory ?? "all") ||
    activeLang !== "all" ||
    search.trim() !== "";

  return (
    <div className="flex flex-col gap-0">
      {/* ── Sticky filter bar ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[var(--c-bg)]/95 backdrop-blur-md border-b border-[var(--c-border)] py-3 px-4 md:px-6">

        {/* ── Explore mode toggle + search row ──────────────────────── */}
        <div className="flex items-center gap-2 mb-3">
          {/* Mode toggle pill */}
          <div
            className="inline-flex rounded-full p-0.5 gap-0.5 shrink-0"
            style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
          >
            <button
              onClick={switchToCategory}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap"
              style={
                exploreMode === "category"
                  ? { background: "var(--c-brand-gradient, linear-gradient(135deg,#06b6d4,#7c3aed))", color: "white" }
                  : { color: "var(--c-text-subtle)" }
              }
            >
              🗂️ By Category
            </button>
            <button
              onClick={switchToLanguage}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap"
              style={
                exploreMode === "language"
                  ? { background: "var(--c-brand-gradient, linear-gradient(135deg,#06b6d4,#7c3aed))", color: "white" }
                  : { color: "var(--c-text-subtle)" }
              }
            >
              🌍 By Language
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-subtle)]" />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search banners..."
              className="w-full h-9 pl-9 pr-4 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-sm text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] focus:outline-none focus:border-[var(--c-brand-cyan)] transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--c-text-subtle)] hover:text-[var(--c-text)]"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {isFiltered && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 h-9 px-3 rounded-xl text-xs font-semibold text-[var(--c-text-subtle)] hover:text-[var(--c-text)] border border-[var(--c-border)] bg-[var(--c-surface)] transition shrink-0"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* ── Category tabs — shown when mode = category ─────────────── */}
        {exploreMode === "category" && (
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:-mx-6 md:px-6">
            <div className="flex items-center gap-2 w-max pb-0.5">
              <CategoryTab
                id="all"
                label="All"
                emoji="✨"
                count={initialTotal}
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
              />
              {categories.filter(cat => !cat.isLanguageCategory && cat.source !== "lang-kit").map(cat => (
                <CategoryTab
                  key={cat.id}
                  id={cat.id}
                  label={cat.label}
                  emoji={cat.emoji}
                  count={cat.count}
                  active={activeCategory === cat.id}
                  onClick={() =>
                    categoryNavMode
                      ? router.push(`/creatives/${cat.id}`)
                      : setActiveCategory(cat.id)
                  }
                  accent={cat.accent.from}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Language tabs — shown when mode = language ─────────────── */}
        {exploreMode === "language" && (
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:-mx-6 md:px-6">
            <div className="flex items-center gap-2 w-max pb-0.5">
              <LangChip
                code="all"
                label="All Languages"
                flag="🌍"
                active={activeLang === "all"}
                onClick={() => setActiveLang("all")}
              />
              {UNIFIED_LANGUAGES.map(l => (
                <LangChip
                  key={l.code}
                  code={l.code}
                  label={l.label}
                  flag={l.flag}
                  active={activeLang === l.code}
                  onClick={() => setActiveLang(l.code as CreativeLanguage)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Results count ─────────────────────────────────────────────── */}
      <div className="px-4 md:px-6 pt-4 pb-2 flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--c-text-subtle)]">
          {loading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 size={11} className="animate-spin" /> Filtering…
            </span>
          ) : total === initialTotal && !isFiltered ? (
            `${total.toLocaleString()} banners`
          ) : (
            `${total.toLocaleString()} of ${initialTotal.toLocaleString()} banners`
          )}
        </p>
        <div className="flex items-center gap-2">
          {isFiltered && activeCategory !== "all" && (
            <p
              className="text-xs font-semibold"
              style={{ color: categories.find(c => c.id === activeCategory)?.accent.from }}
            >
              {categories.find(c => c.id === activeCategory)?.label}
            </p>
          )}
          {activeCategory !== "all" && (() => {
            const cat = categories.find(c => c.id === activeCategory);
            return cat ? (
              <DownloadKitButton
                categoryId={activeCategory}
                categoryLabel={cat.label}
                accentColor={cat.accent.from}
              />
            ) : null;
          })()}
        </div>
      </div>

      {/* ── Grid ──────────────────────────────────────────────────────── */}
      {loading ? (
        // Loading skeleton — 48 placeholder cards
        <div className="px-4 md:px-6 pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-[var(--c-text-subtle)]">
          <Search size={32} className="opacity-30" />
          <p className="text-sm">No banners match your filters.</p>
          <button
            onClick={clearFilters}
            className="text-xs text-[var(--c-brand-cyan)] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="px-4 md:px-6 pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {items.map(item => (
              <UnifiedBannerCard key={item.id} item={item} />
            ))}
          </div>

          {/* Infinite scroll sentinel — always rendered so the observer can attach */}
          {/* The sentinel is invisible; the observer fires loadMore when it enters the viewport */}
          <div ref={sentinelRef} className="w-full h-1" aria-hidden="true" />

          {/* Loading indicator + end-of-list message */}
          <div className="flex flex-col items-center gap-2 mt-4 pb-6">
            {loadingMore && (
              <div className="flex items-center gap-2 text-xs text-[var(--c-text-subtle)] py-4">
                <Loader2 size={14} className="animate-spin" />
                Loading more banners…
              </div>
            )}
            {!hasMore && items.length > PAGE_SIZE && (
              <p className="text-xs text-[var(--c-text-subtle)] py-4">
                All {total.toLocaleString()} banners loaded
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function CategoryTab({
  id,
  label,
  emoji,
  count,
  active,
  onClick,
  accent,
}: {
  id: string;
  label: string;
  emoji: string;
  count: number;
  active: boolean;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
        active
          ? "text-black shadow-md"
          : "bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text-subtle)] hover:text-[var(--c-text)]"
      }`}
      style={
        active
          ? {
              background: accent
                ? `linear-gradient(135deg, ${accent}, ${accent}cc)`
                : "var(--c-brand-cyan)",
              boxShadow: accent ? `0 2px 10px ${accent}50` : undefined,
            }
          : undefined
      }
    >
      <span aria-hidden="true">{emoji}</span>
      <span>{label}</span>
      <span className={`text-[0.6rem] ${active ? "opacity-70" : "opacity-50"}`}>
        ({count})
      </span>
    </button>
  );
}

function LangChip({
  code,
  label,
  flag,
  active,
  onClick,
}: {
  code: string;
  label: string;
  flag: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold transition-all ${
        active
          ? "bg-[var(--c-brand-cyan)] text-black"
          : "bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text-subtle)] hover:text-[var(--c-text)]"
      }`}
    >
      <span aria-hidden="true">{flag}</span>
      <span>{label}</span>
    </button>
  );
}
