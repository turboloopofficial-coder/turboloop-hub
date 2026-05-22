"use client";

// CategoryGrid — paginated wrapper around BannerCard for a single
// /creatives category section. Previously /creatives mounted all 630
// BannerCard client components on first render, ballooning the page
// to 4.4 MB / 3.4 s load. Now each category mounts 12 cards initially
// (3 rows of 4 on desktop, 6 rows of 2 on mobile) and renders the rest
// only after the user opts in via the "Show all" button.
//
// Why a client island instead of server pagination + URL state: the
// existing UX flow lets users browse multiple categories in one
// session. URL-based pagination would force a navigation per expand,
// killing scroll position and the brand feel. The card list itself is
// tiny data — the bottleneck was the React/JS payload, not the data.
// Toggling visibility client-side gives "show all" effectively for
// free once you've already paid the load cost.

import { useState } from "react";
import { BannerCard } from "./BannerCard";
import type { CreativeBanner } from "@lib/creativesData";

const INITIAL_PER_CATEGORY = 12;

interface CategoryGridProps {
  items: CreativeBanner[];
  catLabel: string;
}

export function CategoryGrid({ items, catLabel }: CategoryGridProps) {
  const [showAll, setShowAll] = useState(false);

  const hasMore = items.length > INITIAL_PER_CATEGORY;
  const visible = showAll ? items : items.slice(0, INITIAL_PER_CATEGORY);
  const hiddenCount = items.length - INITIAL_PER_CATEGORY;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {visible.map(banner => (
          <BannerCard
            key={banner.slug}
            banner={banner}
            catLabel={catLabel}
          />
        ))}
      </div>

      {hasMore && !showAll && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:bg-[var(--c-bg)] hover:shadow-[var(--s-md)] hover:-translate-y-0.5 transition active:scale-[0.985]"
          >
            Show all {items.length} {catLabel.toLowerCase()} banners
            <span
              aria-hidden="true"
              className="inline-block translate-y-px"
            >
              ↓
            </span>
          </button>
          <p className="mt-2 text-xs text-[var(--c-text-subtle)]">
            {hiddenCount} more — load them when you want them
          </p>
        </div>
      )}

      {showAll && hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="text-xs text-[var(--c-text-subtle)] hover:text-[var(--c-text)] underline underline-offset-4 transition"
          >
            Collapse · show first {INITIAL_PER_CATEGORY}
          </button>
        </div>
      )}
    </>
  );
}
