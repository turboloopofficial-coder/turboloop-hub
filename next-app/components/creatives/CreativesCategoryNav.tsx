"use client";

// Sticky horizontal pill nav for /creatives. Ships the full category
// list (parent renders all sections in one long page); each pill jumps
// to its category section via smooth scroll. The active pill auto-
// updates as the user scrolls through sections via IntersectionObserver,
// so the nav always reflects what's on screen without manual click.
//
// Mobile-first: horizontal scroll with snap, hidden scrollbar so it
// reads as a clean rail. Sticky underneath the main navbar at top
// so the user can hop categories from any scroll depth.

import { useEffect, useRef, useState } from "react";
import type { CreativeCategoryDef } from "@lib/creativesData";

interface Props {
  categories: CreativeCategoryDef[];
}

const ALL_ID = "__all__";

export function CreativesCategoryNav({ categories }: Props) {
  const [active, setActive] = useState<string>(ALL_ID);
  const containerRef = useRef<HTMLDivElement>(null);

  // Watch each category section + the page hero. Whichever is closest
  // to the top of the viewport (with a small offset for the sticky nav)
  // is the active one.
  useEffect(() => {
    const ids = categories.map(c => c.id);
    // The hero hits the same observer with id="__top__" — when it's
    // intersecting, we surface the "All" pill as active. (Set in render
    // tree below.)
    const targets = ids
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) return;

    const obs = new IntersectionObserver(
      entries => {
        // Pick the topmost intersecting entry — most reliable on scroll.
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      {
        // Top edge sits just under the sticky double-nav (page nav +
        // this rail ≈ 110 px on desktop, less on mobile).
        rootMargin: "-120px 0px -60% 0px",
        threshold: 0,
      }
    );
    targets.forEach(t => obs.observe(t));
    return () => obs.disconnect();
  }, [categories]);

  // When the active pill changes by scroll, keep it visible in the
  // horizontal rail (auto-scroll the rail).
  useEffect(() => {
    const el = containerRef.current?.querySelector(
      `[data-cat-pill="${active}"]`
    ) as HTMLElement | null;
    if (el && containerRef.current) {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      el.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [active]);

  function jumpTo(id: string) {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (id === ALL_ID) {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  return (
    <div
      className="sticky z-30 backdrop-blur-md backdrop-saturate-150 border-b border-[var(--c-border)]"
      style={{
        // Sit directly under the main navbar.
        top: "var(--nav-h)",
        background: "color-mix(in oklab, var(--c-bg) 70%, transparent)",
      }}
    >
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Creative categories"
        className="flex gap-2 overflow-x-auto scrollbar-hide px-[var(--gutter)] py-3 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <Pill
          id={ALL_ID}
          label="All"
          emoji="✨"
          count={categories.reduce((s, c) => s + c.count, 0)}
          active={active === ALL_ID}
          onClick={() => jumpTo(ALL_ID)}
        />
        {categories.map(cat => (
          <Pill
            key={cat.id}
            id={cat.id}
            label={cat.label}
            emoji={cat.emoji}
            count={cat.count}
            active={active === cat.id}
            onClick={() => jumpTo(cat.id)}
          />
        ))}
      </div>
    </div>
  );
}

function Pill({
  id,
  label,
  emoji,
  count,
  active,
  onClick,
}: {
  id: string;
  label: string;
  emoji: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-cat-pill={id}
      onClick={onClick}
      className={[
        "snap-start shrink-0 inline-flex items-center gap-2 px-4 min-h-[40px] rounded-full text-xs font-bold tracking-wide transition-all duration-200",
        active
          ? "bg-brand text-white shadow-[var(--s-brand)]"
          : "bg-[var(--c-surface)] text-[var(--c-text-muted)] border border-[var(--c-border)] hover:text-[var(--c-text)]",
      ].join(" ")}
    >
      <span aria-hidden="true">{emoji}</span>
      <span>{label}</span>
      <span
        className={[
          "inline-flex items-center justify-center min-w-[1.5rem] h-[1.125rem] px-1.5 rounded-full text-[0.625rem] font-bold tabular-nums",
          active
            ? "bg-white/20 text-white"
            : "bg-[var(--c-bg)] text-[var(--c-text-subtle)]",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}
