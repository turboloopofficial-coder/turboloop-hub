"use client";

// ZoomCountdown — small client island used by ZoomLiveSection.
// Ticks every second showing the time until the next call start, or
// "Live now" when a call is in progress.
//
// Pulled out of ZoomLiveSection so that section stays an RSC and
// only this <40-line subtree ships JS to the browser.

import { useEffect, useState } from "react";

interface ZoomCountdownProps {
  /** Daily start time in minutes since UTC 00:00. */
  startUtcMin: number;
  /** Call duration in minutes — used to detect "Live now". */
  durationMin: number;
  /** Optional days-of-week filter (0=Sun … 6=Sat). Undefined = every day. */
  daysOfWeek?: number[];
}

/**
 * Compute the next-occurrence Date for a UTC-scheduled call.
 * Respects daysOfWeek — skips days when the session doesn't run.
 * If the call is currently in progress, returns the current start time.
 */
function nextOccurrence(
  startUtcMin: number,
  durationMin: number,
  now: Date,
  daysOfWeek?: number[]
): Date {
  const ms = now.getTime();
  for (let offset = 0; offset <= 7; offset++) {
    const dayStart = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + offset
    );
    const dayOfWeek = new Date(dayStart).getUTCDay();
    // Skip days not in the schedule
    if (daysOfWeek && !daysOfWeek.includes(dayOfWeek)) continue;
    const callStart = dayStart + startUtcMin * 60_000;
    const callEnd = callStart + durationMin * 60_000;
    // Skip today if the call has already ended
    if (offset === 0 && ms >= callEnd) continue;
    return new Date(callStart);
  }
  // Fallback: tomorrow at session time
  const tomorrow = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  );
  return new Date(tomorrow + startUtcMin * 60_000);
}

interface CountdownParts {
  /** Whether the call is currently in progress. */
  live: boolean;
  /** Hours / minutes / seconds until the next start (or 0s when live). */
  h: number;
  m: number;
  s: number;
}

function computeParts(
  startUtcMin: number,
  durationMin: number,
  now: Date,
  daysOfWeek?: number[]
): CountdownParts {
  const next = nextOccurrence(startUtcMin, durationMin, now, daysOfWeek);
  const diffMs = next.getTime() - now.getTime();
  const live = diffMs <= 0;
  const positive = Math.max(0, diffMs);
  const h = Math.floor(positive / 3_600_000);
  const m = Math.floor((positive % 3_600_000) / 60_000);
  const s = Math.floor((positive % 60_000) / 1000);
  return { live, h, m, s };
}

export function ZoomCountdown({ startUtcMin, durationMin, daysOfWeek }: ZoomCountdownProps) {
  // We mount with `null` to defer first render — server HTML stays empty
  // until hydration so we never ship a stale countdown that flashes
  // wrong numbers before the client tick.
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setParts(computeParts(startUtcMin, durationMin, new Date(), daysOfWeek));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [startUtcMin, durationMin, daysOfWeek]);

  if (!parts) {
    return (
      <div
        className="font-mono text-2xl font-bold tabular-nums text-[var(--c-text)]"
        aria-hidden="true"
      >
        --:--:--
      </div>
    );
  }

  if (parts.live) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="text-2xl font-heading font-bold text-emerald-700">
          Live now
        </span>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="font-mono text-2xl font-bold tabular-nums text-[var(--c-text)]">
      {pad(parts.h)}:{pad(parts.m)}:{pad(parts.s)}
    </div>
  );
}
