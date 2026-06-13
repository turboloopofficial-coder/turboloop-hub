"use client";
// CampaignCategoryGrid — paginated grid for campaign creative sub-pages.
// Mirrors CategoryGrid's show-more pattern. Shows 12 initially, expands
// to all on user request.
import { useState } from "react";
import { CampaignBannerCard } from "./CampaignBannerCard";
import type { CampaignCreative } from "@lib/campaignData";

const INITIAL_PER_PAGE = 12;

interface Props {
  items: CampaignCreative[];
  catLabel: string;
}

export function CampaignCategoryGrid({ items, catLabel }: Props) {
  const [showAll, setShowAll] = useState(false);
  const hasMore = items.length > INITIAL_PER_PAGE;
  const visible = showAll ? items : items.slice(0, INITIAL_PER_PAGE);
  const hiddenCount = items.length - INITIAL_PER_PAGE;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {visible.map(item => (
          <CampaignBannerCard
            key={item.filename}
            item={item}
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
            <span aria-hidden="true" className="inline-block translate-y-px">↓</span>
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
            Collapse · show first {INITIAL_PER_PAGE}
          </button>
        </div>
      )}
    </>
  );
}
