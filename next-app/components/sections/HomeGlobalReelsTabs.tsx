"use client";

// Client island — owns the language-tab state for the homepage Global
// Reels section. Receives the full MULTI_LANG_REELS map as a prop so
// no fetching / network round-trip is needed. Renders pill buttons +
// the active language's 3-up grid of <ReelGalleryCard>.
//
// Tab transitions: short CSS fade on the cards' key prop so swapping
// languages doesn't jank the layout.

import { useState } from "react";
import { ReelGalleryCard } from "@components/reels/ReelGalleryCard";
import type { ReelTrack, ReelLang } from "@lib/reelsData";

export interface HomeGlobalReelsTabsProps {
  reelsByLang: Record<ReelLang, ReelTrack[]>;
  languages: Array<{ code: ReelLang; label: string; flag: string }>;
}

export function HomeGlobalReelsTabs({
  reelsByLang,
  languages,
}: HomeGlobalReelsTabsProps) {
  const [active, setActive] = useState<ReelLang>("en");
  const visible = reelsByLang[active] ?? [];

  return (
    <div>
      {/* Language tab pills — glassmorphism, brand-cyan halo on active */}
      <div
        className="flex flex-wrap items-center justify-center gap-2 mb-8 md:mb-10"
        role="tablist"
        aria-label="Reel language"
      >
        {languages.map(lang => {
          const isActive = lang.code === active;
          return (
            <button
              key={lang.code}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(lang.code)}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-full text-sm font-bold transition-all active:scale-[0.97] backdrop-blur-sm"
              style={
                isActive
                  ? {
                      color: "white",
                      background: "var(--c-brand-gradient)",
                      boxShadow: "var(--s-brand)",
                      border: "1px solid transparent",
                    }
                  : {
                      color: "var(--c-text)",
                      background:
                        "color-mix(in oklab, var(--c-surface) 70%, transparent)",
                      border: "1px solid var(--c-border)",
                    }
              }
            >
              <span className="text-base leading-none" aria-hidden="true">
                {lang.flag}
              </span>
              <span>{lang.label}</span>
              <span className="text-[0.6875rem] opacity-70 tabular-nums">
                {reelsByLang[lang.code]?.length ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards — re-keyed by active language so the previous group's
          <video> elements unmount cleanly (and stop preloading) when
          the user switches tabs. */}
      <div
        key={active}
        role="tabpanel"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
        style={{ animation: "fadeIn 300ms ease-out" }}
      >
        {visible.map(reel => (
          <ReelGalleryCard key={`${active}-${reel.id}`} reel={reel} />
        ))}
      </div>
    </div>
  );
}
