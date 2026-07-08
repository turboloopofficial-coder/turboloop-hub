"use client";
// HomeGlobalReelsTabs — language-tab state island for the homepage Global Reels section.
//
// Layout:
//   Desktop (lg+):  2×2 grid — balanced, premium look for 4 videos
//   Tablet (sm-lg): 2×2 grid
//   Mobile:         horizontal scroll snap carousel — 1 card visible, peek at next
//
// Language tabs: horizontal scroll strip with pill buttons (15 languages).
// Transitions: CSS fade on key change so <video> elements unmount cleanly.

import { useState, useRef } from "react";
import { ReelGalleryCard } from "@components/reels/ReelGalleryCard";
import type { ReelTrack, ReelLang } from "@lib/reelsData";

export interface HomeGlobalReelsTabsProps {
  reelsByLang: Record<ReelLang, ReelTrack[]>;
  languages: Array<{ code: ReelLang; label: string; flag: string }>;
  defaultLang?: ReelLang;
}

export function HomeGlobalReelsTabs({
  reelsByLang,
  languages,
  defaultLang,
}: HomeGlobalReelsTabsProps) {
  const [active, setActive] = useState<ReelLang>(defaultLang ?? "en");
  const visible = reelsByLang[active] ?? [];
  const tabsRef = useRef<HTMLDivElement>(null);

  function handleLangSelect(code: ReelLang) {
    setActive(code);
    // Scroll the selected tab into view on mobile
    const btn = tabsRef.current?.querySelector(`[data-lang="${code}"]`) as HTMLElement | null;
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  return (
    <div>
      {/* ── Language tab strip — horizontal scroll on all sizes ──────── */}
      <div
        ref={tabsRef}
        className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:-mx-6 md:px-6 mb-8 md:mb-10"
        role="tablist"
        aria-label="Reel language"
      >
        <div className="flex items-center gap-2 w-max pb-1">
          {languages.map(lang => {
            const isActive = lang.code === active;
            return (
              <button
                key={lang.code}
                data-lang={lang.code}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleLangSelect(lang.code)}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-full text-sm font-bold transition-all active:scale-[0.97] backdrop-blur-sm shrink-0"
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
                <span className="text-[0.6875rem] opacity-60 tabular-nums">
                  {reelsByLang[lang.code]?.length ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Cards: mobile carousel + tablet/desktop 2×2 grid ─────────── */}
      <div
        key={active}
        role="tabpanel"
        style={{ animation: "fadeIn 300ms ease-out" }}
      >
        {/* Mobile: horizontal snap carousel — 85vw card, peek at next */}
        <div className="sm:hidden overflow-x-auto scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
          <div className="flex gap-4 w-max pb-2">
            {visible.map(reel => (
              <div
                key={`${active}-${reel.id}-mob`}
                className="snap-center shrink-0"
                style={{ width: "calc(85vw)" }}
              >
                <ReelGalleryCard reel={reel} />
              </div>
            ))}
          </div>
        </div>

        {/* Tablet + desktop: 2×2 grid, max-width constrained for readability */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          {visible.map(reel => (
            <ReelGalleryCard key={`${active}-${reel.id}`} reel={reel} />
          ))}
        </div>
      </div>

      {/* Mobile scroll progress dots */}
      <div className="flex sm:hidden justify-center gap-1.5 mt-4">
        {visible.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === 0 ? "1.25rem" : "0.375rem",
              height: "0.375rem",
              background: i === 0
                ? "var(--c-brand-cyan)"
                : "color-mix(in oklab, var(--c-text-subtle) 35%, transparent)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
