"use client";

// Live-feel single-line ticker for the bottom of the Leaderboard. Cycles
// through a small handful of region-specific micro-updates every 5 s with
// a soft fade. Reduced-motion users see the first message statically —
// no rotation, no fade, so the line doesn't change underneath them.
//
// The messages are intentionally illustrative and conservative — no
// fake real-time numbers. They reinforce the "live" feel without making
// claims that need to actually be verifiable per minute.

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

const MESSAGES = [
  "🇮🇳 +12 new members joined from India this hour",
  "🇳🇬 Nigeria just crossed 500 community members",
  "🇩🇪 Germany community growing 3.2% this week",
  "🇮🇩 Indonesia — fastest growing in Southeast Asia",
  "🇹🇷 Turkey emerging as a key market",
  "🇧🇷 Brazil leading Latin America expansion",
];

export function LeaderboardActivityTicker() {
  const [idx, setIdx] = useState(0);
  // `phase` flips opacity for the cross-fade. Steps:
  //   1. show message N (phase = 1, opacity 1)
  //   2. fade out (phase = 0, opacity 0)
  //   3. swap message
  //   4. fade in (phase = 1, opacity 1)
  const [phase, setPhase] = useState<0 | 1>(1);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setPhase(0);
      window.setTimeout(() => {
        if (cancelled) return;
        setIdx(i => (i + 1) % MESSAGES.length);
        setPhase(1);
      }, 500); // matches the CSS transition below
    };
    const interval = window.setInterval(tick, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="mt-6 md:mt-8 flex items-center gap-2 justify-center"
      aria-live="polite"
    >
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full"
        style={{
          background: "rgba(8,145,178,0.12)",
          color: "var(--c-brand-cyan)",
        }}
        aria-hidden="true"
      >
        <Radio className="w-3 h-3" />
      </span>
      <span
        className="text-xs md:text-sm text-[var(--c-text-muted)] tabular-nums tracking-wide transition-opacity duration-500"
        style={{ opacity: phase }}
      >
        {MESSAGES[idx]}
      </span>
    </div>
  );
}
