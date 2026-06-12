"use client";

// TokenPriceWidget — live $TURBO price + 24h change. Two variants:
//
//   <TokenPriceWidget variant="inline" />  — compact, fits in a card
//                                            or hero. Price + change.
//   <TokenPriceWidget variant="full" />    — large, for /token hero.
//                                            Price + change + volume
//                                            + liquidity + FDV.
//
// Data source: /api/token-price (server-side proxy to DexScreener with
// 60 s in-memory cache). We poll every 60 s client-side so an open
// /token tab stays current without a refresh.
//
// A11y notes: price-change direction is conveyed via TEXT (▲ / ▼ /
// →) AND color (green / red / muted). Screen-readers get an explicit
// "up", "down", or "unchanged" prefix via visually-hidden text. Per
// the design system, accessibility = no color-only signal.

import { useEffect, useState, useId } from "react";
import { TOKEN } from "@lib/tokenFacts";

interface TokenPriceData {
  priceUsd: number | null;
  priceChange24h: number | null;
  volume24h: number | null;
  liquidityUsd: number | null;
  fdv: number | null;
  fetchedAt: number;
  fresh: boolean;
}

// Inlined to avoid a server-route → client-bundle type import that
// pulls runtime exports along for the ride. Keep in lockstep with the
// shape returned by /api/token-price-history.
interface TokenPriceHistoryData {
  priceChange7d: number | null;
  priceChange14d: number | null;
  priceChange30d: number | null;
  priceChangeAllTime: number | null;
  daysSinceLaunch: number;
  currentPriceFromCandles: number | null;
  fetchedAt: number;
  fresh: boolean;
}

const POLL_INTERVAL_MS = 60_000;
// Daily candles barely move — 5 min is enough.
const HISTORY_POLL_INTERVAL_MS = 5 * 60_000;

function formatPrice(usd: number | null): string {
  if (usd === null || !Number.isFinite(usd)) return "—";
  // Show enough precision to differentiate at low prices (launch is
  // $0.001). 5 significant figures keeps "0.001234" readable without
  // tripping into scientific notation.
  if (usd >= 1) return `$${usd.toFixed(4)}`;
  if (usd >= 0.01) return `$${usd.toFixed(5)}`;
  return `$${usd.toFixed(6)}`;
}

function formatUsdShort(usd: number | null): string {
  if (usd === null || !Number.isFinite(usd)) return "—";
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}K`;
  return `$${usd.toFixed(0)}`;
}

function formatPctChange(d: number | null): {
  text: string;
  direction: "up" | "down" | "flat";
} {
  if (d === null || !Number.isFinite(d)) return { text: "—", direction: "flat" };
  const pct = d * 100;
  if (Math.abs(pct) < 0.005) return { text: "0.00%", direction: "flat" };
  const sign = pct > 0 ? "+" : "";
  return {
    text: `${sign}${pct.toFixed(2)}%`,
    direction: pct > 0 ? "up" : "down",
  };
}

const DIRECTION_GLYPH = { up: "▲", down: "▼", flat: "→" } as const;

// Color tokens: greens/reds via inline style so we don't have to
// touch the global stylesheet for a one-off widget.
const DIRECTION_COLOR = {
  up: "#059669",
  down: "#DC2626",
  flat: "#64748B",
} as const;

const DIRECTION_SR = {
  up: "Up by",
  down: "Down by",
  flat: "Unchanged at",
} as const;

interface TokenPriceWidgetProps {
  variant?: "inline" | "full";
  /** Optional CSS class to add to the outer wrapper. */
  className?: string;
}

async function fetchPrice(signal?: AbortSignal): Promise<TokenPriceData | null> {
  try {
    const res = await fetch("/api/token-price", { signal, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as TokenPriceData;
  } catch {
    return null;
  }
}

async function fetchPriceHistory(
  signal?: AbortSignal
): Promise<TokenPriceHistoryData | null> {
  try {
    const res = await fetch("/api/token-price-history", { signal });
    if (!res.ok) return null;
    return (await res.json()) as TokenPriceHistoryData;
  } catch {
    return null;
  }
}

export function TokenPriceWidget({
  variant = "inline",
  className = "",
}: TokenPriceWidgetProps) {
  const [data, setData] = useState<TokenPriceData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [historyData, setHistoryData] = useState<TokenPriceHistoryData | null>(null);
  const liveRegionId = useId();

  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;

    const tick = async () => {
      const next = await fetchPrice(ctrl.signal);
      if (cancelled) return;
      if (next) {
        setData(next);
        setLoaded(true);
      } else if (!loaded) {
        // Still mark as loaded so we exit the skeleton state even on
        // initial failure — the widget then shows "—" placeholders
        // instead of an indefinite spinner.
        setLoaded(true);
      }
    };

    tick();
    const id = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      ctrl.abort();
      window.clearInterval(id);
    };
    // We intentionally don't include `loaded` in deps — that's a
    // one-way bool used only to suppress the very first false-positive
    // skeleton-clear path; re-tripping it would cause loop fetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Multi-period price history — only the `full` variant renders the
  // performance row, so we skip the fetch entirely on `inline` to save
  // a request on every embed (hero token chip, sidebar callout, etc).
  useEffect(() => {
    if (variant !== "full") return;
    const ctrl = new AbortController();
    let cancelled = false;

    const tick = async () => {
      const next = await fetchPriceHistory(ctrl.signal);
      if (cancelled || !next) return;
      setHistoryData(next);
    };

    tick();
    const id = window.setInterval(tick, HISTORY_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      ctrl.abort();
      window.clearInterval(id);
    };
  }, [variant]);

  const change = formatPctChange(data?.priceChange24h ?? null);
  const direction = change.direction;
  const color = DIRECTION_COLOR[direction];

  // ── INLINE variant (compact pill) ────────────────────────────────
  if (variant === "inline") {
    return (
      <div
        className={`inline-flex items-baseline gap-2 ${className}`}
        aria-label={`${TOKEN.symbol} live price`}
      >
        <span className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)]">
          ${TOKEN.symbol}
        </span>
        <span className="font-bold tabular-nums text-[var(--c-text)]">
          {loaded ? formatPrice(data?.priceUsd ?? null) : "—"}
        </span>
        <span
          className="inline-flex items-baseline gap-0.5 text-xs font-bold tabular-nums"
          style={{ color }}
          aria-hidden={true}
        >
          <span aria-hidden="true">{DIRECTION_GLYPH[direction]}</span>
          <span>{change.text}</span>
        </span>
        <span id={liveRegionId} className="sr-only" aria-live="polite">
          {loaded
            ? `${TOKEN.symbol} ${formatPrice(data?.priceUsd ?? null)}, ${DIRECTION_SR[direction]} ${change.text} in the last 24 hours.`
            : `${TOKEN.symbol} live price loading.`}
        </span>
      </div>
    );
  }

  // ── FULL variant (stats grid for /token hero) ────────────────────
  const daysSinceLaunch = historyData?.daysSinceLaunch ?? 0;
  return (
    <div className={className} aria-label={`${TOKEN.symbol} live stats`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Stat
          label="Price"
          value={loaded ? formatPrice(data?.priceUsd ?? null) : "—"}
          emphasis
        />
        <Stat
          label="24h Change"
          value={
            <span
              className="inline-flex items-baseline gap-1 tabular-nums"
              style={{ color }}
            >
              <span aria-hidden="true">{DIRECTION_GLYPH[direction]}</span>
              <span>{change.text}</span>
            </span>
          }
          srValue={`${DIRECTION_SR[direction]} ${change.text} in the last 24 hours`}
          emphasis
        />
        <Stat
          label="24h Volume"
          value={loaded ? formatUsdShort(data?.volume24h ?? null) : "—"}
        />
        <Stat
          label="Liquidity"
          value={loaded ? formatUsdShort(data?.liquidityUsd ?? null) : "—"}
        />
      </div>

      {/* Price Performance — 7D / 14D / 30D / All-Time. 14D and 30D
          render a "Coming Soon" state until the token clears each age
          gate; the grid stays 4-wide so the layout doesn't reflow on
          unlock day. */}
      <div className="mt-3 md:mt-4">
        <div className="text-[0.625rem] md:text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
          Price Performance
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <PerfPill
            label="7D"
            change={historyData?.priceChange7d ?? null}
            available={true}
            loaded={historyData !== null}
          />
          <PerfPill
            label="14D"
            change={historyData?.priceChange14d ?? null}
            available={daysSinceLaunch >= 14}
            loaded={historyData !== null}
          />
          <PerfPill
            label="30D"
            change={historyData?.priceChange30d ?? null}
            available={daysSinceLaunch >= 30}
            loaded={historyData !== null}
          />
          <PerfPill
            label="All-Time"
            change={historyData?.priceChangeAllTime ?? null}
            available={true}
            loaded={historyData !== null}
          />
        </div>
      </div>

      <span id={liveRegionId} className="sr-only" aria-live="polite">
        {loaded
          ? `${TOKEN.symbol} price ${formatPrice(data?.priceUsd ?? null)}. ${DIRECTION_SR[direction]} ${change.text} in the last 24 hours. 24-hour volume ${formatUsdShort(data?.volume24h ?? null)}.`
          : `${TOKEN.symbol} live stats loading.`}
      </span>
    </div>
  );
}

function PerfPill({
  label,
  change,
  available,
  loaded,
}: {
  label: string;
  change: number | null;
  available: boolean;
  loaded: boolean;
}) {
  const formatted = formatPctChange(change);
  const direction = formatted.direction;
  const color = DIRECTION_COLOR[direction];

  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--c-border)] bg-[var(--c-surface)] px-3 py-3 md:px-4 md:py-3.5 shadow-[var(--s-sm)] flex flex-col gap-1">
      <div className="text-[0.625rem] md:text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)]">
        {label}
      </div>
      {!available ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[0.6875rem] opacity-50" aria-hidden="true">
            ⏳
          </span>
          <span className="text-xs font-semibold text-[var(--c-text-subtle)] opacity-60">
            Coming Soon
          </span>
        </div>
      ) : !loaded ? (
        <div className="h-5 w-16 rounded bg-[var(--c-border)] animate-pulse" />
      ) : change === null ? (
        <span className="text-sm font-bold text-[var(--c-text-subtle)]">—</span>
      ) : (
        <span
          className="inline-flex items-baseline gap-1 tabular-nums text-sm font-bold"
          style={{ color }}
        >
          <span aria-hidden="true">{DIRECTION_GLYPH[direction]}</span>
          <span>{formatted.text}</span>
          <span className="sr-only">
            {DIRECTION_SR[direction]} {formatted.text} over {label.toLowerCase()}.
          </span>
        </span>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  emphasis,
  srValue,
}: {
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
  /** Optional screen-reader-only override for `value`. */
  srValue?: string;
}) {
  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--c-border)] bg-[var(--c-surface)] px-3 py-3 md:px-4 md:py-3.5 shadow-[var(--s-sm)]">
      <div className="text-[0.625rem] md:text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-1">
        {label}
      </div>
      <div
        className={`tabular-nums font-bold text-[var(--c-text)] ${
          emphasis ? "text-lg md:text-2xl" : "text-sm md:text-lg"
        }`}
      >
        {value}
      </div>
      {srValue && <span className="sr-only">{srValue}</span>}
    </div>
  );
}
