"use client";
// UnifiedCreativesGrid — filterable, paginated grid for all 1,134+ creatives.
// Features: category tabs, language filter, search, load-more pagination.
// Mobile-first: sticky filter bar, 2-col mobile → 3-col tablet → 4-col desktop.

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Search, X, ChevronDown, Filter } from "lucide-react";
import { UnifiedBannerCard } from "./UnifiedBannerCard";
import type { UnifiedCreative, UnifiedCategoryDef, CreativeLanguage } from "@lib/unifiedCreativesData";
import { UNIFIED_LANGUAGES } from "@lib/unifiedCreativesData";

const PAGE_SIZE = 48;

interface Props {
  items: UnifiedCreative[];
  categories: UnifiedCategoryDef[];
  initialCategory?: string;
}

export function UnifiedCreativesGrid({ items, categories, initialCategory }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory ?? "all");
  const [activeLang, setActiveLang] = useState<CreativeLanguage | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [activeCategory, activeLang, search]);

  // Filtered + searched items
  const filtered = useMemo(() => {
    let out = items;
    if (activeCategory !== "all") {
      out = out.filter(i => i.categoryId === activeCategory);
    }
    if (activeLang !== "all") {
      out = out.filter(i => i.language === activeLang);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.categoryLabel.toLowerCase().includes(q) ||
        i.alt.toLowerCase().includes(q)
      );
    }
    return out;
  }, [items, activeCategory, activeLang, search]);

  const visible = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = visible.length < filtered.length;

  const clearFilters = useCallback(() => {
    setActiveCategory("all");
    setActiveLang("all");
    setSearch("");
  }, []);

  const isFiltered = activeCategory !== "all" || activeLang !== "all" || search.trim() !== "";

  return (
    <div className="flex flex-col gap-0">
      {/* ── Sticky filter bar ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[var(--c-bg)]/95 backdrop-blur-md border-b border-[var(--c-border)] py-3 px-4 md:px-6">
        {/* Search + filter toggle row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-subtle)]" />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search banners…"
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-sm text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] focus:outline-none focus:border-[var(--c-brand-cyan)] transition"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--c-text-subtle)] hover:text-[var(--c-text)]">
                <X size={13} />
              </button>
            )}
          </div>
          <button
            onClick={() => setFilterOpen(o => !o)}
            className={`flex items-center gap-1.5 h-10 px-3.5 rounded-xl border text-sm font-semibold transition-all ${filterOpen ? "bg-[var(--c-brand-cyan)] text-black border-[var(--c-brand-cyan)]" : "bg-[var(--c-surface)] border-[var(--c-border)] text-[var(--c-text)]"}`}
          >
            <Filter size={13} />
            <span className="hidden sm:inline">Filter</span>
            {isFiltered && <span className="w-2 h-2 rounded-full bg-[var(--c-brand-cyan)] ml-0.5" />}
          </button>
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 h-10 px-3 rounded-xl text-xs font-semibold text-[var(--c-text-subtle)] hover:text-[var(--c-text)] border border-[var(--c-border)] bg-[var(--c-surface)] transition"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Category tabs — horizontal scroll */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:-mx-6 md:px-6">
          <div className="flex items-center gap-2 w-max pb-0.5">
            <CategoryTab
              id="all"
              label="All"
              emoji="✨"
              count={items.length}
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
            />
            {categories.map(cat => (
              <CategoryTab
                key={cat.id}
                id={cat.id}
                label={cat.label}
                emoji={cat.emoji}
                count={cat.count}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
                accent={cat.accent.from}
              />
            ))}
          </div>
        </div>

        {/* Language filter — only shown when filter panel is open */}
        {filterOpen && (
          <div className="mt-3 flex flex-wrap gap-2">
            <LangChip code="all" label="All languages" flag="🌍" active={activeLang === "all"} onClick={() => setActiveLang("all")} />
            {UNIFIED_LANGUAGES.map(l => (
              <LangChip key={l.code} code={l.code} label={l.label} flag={l.flag} active={activeLang === l.code} onClick={() => setActiveLang(l.code)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Results count ─────────────────────────────────────────────── */}
      <div className="px-4 md:px-6 pt-4 pb-2 flex items-center justify-between">
        <p className="text-xs text-[var(--c-text-subtle)]">
          {filtered.length === items.length
            ? `${items.length.toLocaleString()} banners`
            : `${filtered.length.toLocaleString()} of ${items.length.toLocaleString()} banners`}
        </p>
        {isFiltered && activeCategory !== "all" && (
          <p className="text-xs font-semibold" style={{ color: categories.find(c => c.id === activeCategory)?.accent.from }}>
            {categories.find(c => c.id === activeCategory)?.label}
          </p>
        )}
      </div>

      {/* ── Grid ──────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-[var(--c-text-subtle)]">
          <Search size={32} className="opacity-30" />
          <p className="text-sm">No banners match your filters.</p>
          <button onClick={clearFilters} className="text-xs text-[var(--c-brand-cyan)] hover:underline">Clear filters</button>
        </div>
      ) : (
        <div className="px-4 md:px-6 pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {visible.map(item => (
              <UnifiedBannerCard key={item.id} item={item} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex flex-col items-center gap-2 mt-10">
              <p className="text-xs text-[var(--c-text-subtle)]">
                Showing {visible.length} of {filtered.length}
              </p>
              <button
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-2 h-12 px-8 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-sm font-semibold text-[var(--c-text)] hover:border-[var(--c-brand-cyan)] hover:text-[var(--c-brand-cyan)] transition-all"
              >
                <ChevronDown size={15} />
                Load more ({Math.min(PAGE_SIZE, filtered.length - visible.length)} more)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function CategoryTab({
  id, label, emoji, count, active, onClick, accent,
}: {
  id: string; label: string; emoji: string; count: number;
  active: boolean; onClick: () => void; accent?: string;
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
      style={active ? {
        background: accent ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : "var(--c-brand-cyan)",
        boxShadow: accent ? `0 2px 10px ${accent}50` : undefined,
      } : undefined}
    >
      <span aria-hidden="true">{emoji}</span>
      <span>{label}</span>
      <span className={`text-[0.6rem] ${active ? "opacity-70" : "opacity-50"}`}>({count})</span>
    </button>
  );
}

function LangChip({
  code, label, flag, active, onClick,
}: {
  code: string; label: string; flag: string; active: boolean; onClick: () => void;
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
