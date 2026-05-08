"use client";

// One row in the leaderboard. Client-only so the bar can animate from
// 0 → pct% on first intersection (IntersectionObserver). Top-3 cards
// pick up a medal tint (gold/silver/bronze) with a matching glow; the
// #1 card gets a 3 s breathing animation defined in globals.css.
//
// The sustained shimmer overlay on each filled bar lives in CSS too
// (.tl-bar-shimmer) so the section reads as "live" rather than static.

import { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";
import { Card } from "@components/ui/Card";
import { getFlagUrl } from "@lib/constants";

export type Medal = "gold" | "silver" | "bronze" | "none";

const MEDAL_STYLES: Record<
  Medal,
  { ring: string; emoji: string; glow: string }
> = {
  gold:   { ring: "#F59E0B", emoji: "🥇", glow: "0 0 16px rgba(245,158,11,0.45)" },
  silver: { ring: "#94A3B8", emoji: "🥈", glow: "0 0 14px rgba(148,163,184,0.40)" },
  bronze: { ring: "#D97706", emoji: "🥉", glow: "0 0 14px rgba(217,119,6,0.40)" },
  none:   { ring: "transparent", emoji: "", glow: "" },
};

interface Props {
  rank: number;
  country: string;
  /** Lowercase ISO 3166-1 alpha-2 (e.g. "de"). */
  code: string;
  description: string;
  /** Pre-computed percentage (0-100) — already normalised against the leader. */
  pct: number;
  medal: Medal;
}

export function LeaderboardCard({
  rank,
  country,
  code,
  description,
  pct,
  medal,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // `filled` is true once the row has scrolled into view at least once;
  // the bar's width transitions from 0% → pct% on that flip. Once filled
  // it stays filled — re-entering the viewport doesn't replay.
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setFilled(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // tiny delay so the cascade reads as a wave across the grid
          window.setTimeout(() => setFilled(true), 120);
          obs.disconnect();
        }
      },
      { rootMargin: "-30px", threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const m = MEDAL_STYLES[medal];
  const isMedal = medal !== "none";
  const isLeader = rank === 1;

  return (
    <div ref={ref}>
      <Card
        elevation="raised"
        padding="md"
        interactive
        className={`flex items-center gap-3 h-full ${
          isLeader ? "tl-rank1-breathe" : ""
        }`}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{
            background: isMedal ? `${m.ring}22` : "transparent",
            color: m.ring === "transparent" ? "var(--c-text)" : m.ring,
            border: `2px solid ${
              m.ring === "transparent" ? "var(--c-border)" : m.ring
            }`,
            boxShadow: isMedal ? m.glow : undefined,
          }}
          aria-label={`Rank ${rank}`}
        >
          <span aria-hidden="true">{m.emoji || rank}</span>
        </div>
        <img
          src={getFlagUrl(code, 80)}
          alt={`${country} flag`}
          width={40}
          height={28}
          loading="lazy"
          className="rounded-sm flex-shrink-0 object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[var(--c-text)] truncate">
            {country}
          </div>
          <div className="text-xs text-[var(--c-text-muted)] truncate mb-1.5">
            {description}
          </div>
          <div className="relative h-1.5 rounded-full bg-[rgba(15,23,42,0.06)] dark:bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <div
              className="relative h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
              style={{
                width: filled ? `${pct}%` : "0%",
                background: "var(--c-brand-gradient)",
              }}
            >
              {/* Continuous shimmer once the bar has filled — lives long
                  on the page, not just during the initial fill. */}
              {filled && <div className="tl-bar-shimmer" aria-hidden="true" />}
            </div>
          </div>
        </div>
        {isMedal && (
          <Trophy
            className="w-4 h-4 flex-shrink-0"
            style={{ color: m.ring }}
            aria-hidden="true"
          />
        )}
      </Card>
    </div>
  );
}
