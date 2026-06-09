"use client";

// TokenSupplyWidget — live $TURBO supply trio. Renders three columns:
//
//   Circulating Supply  •  Total Supply  •  Locked / Burned
//
// Data source: /api/token-supply (server-side proxy to
// https://turboloop.io/api/token/circulating-supply with a 5-min
// in-memory cache). We poll every 5 min client-side so an open /token
// tab stays current without a refresh.
//
// Mirrors the loading / fallback pattern of TokenPriceWidget — shows
// "—" placeholders during the initial fetch and on upstream failure
// rather than spinning indefinitely.

import { useEffect, useState } from "react";

interface TokenSupplyData {
  circulatingSupply: string;
  totalSupply: string;
  lockedOrBurned: string;
  circulatingSupplyNum: number | null;
  totalSupplyNum: number | null;
  lockedOrBurnedNum: number | null;
  fetchedAt: number;
  fresh: boolean;
}

const POLL_INTERVAL_MS = 5 * 60_000; // 5 minutes — matches the server cache TTL

async function fetchSupply(signal?: AbortSignal): Promise<TokenSupplyData | null> {
  try {
    const res = await fetch("/api/token-supply", { signal, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as TokenSupplyData;
  } catch {
    return null;
  }
}

interface TokenSupplyWidgetProps {
  className?: string;
}

export function TokenSupplyWidget({ className = "" }: TokenSupplyWidgetProps) {
  const [data, setData] = useState<TokenSupplyData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;

    const tick = async () => {
      const next = await fetchSupply(ctrl.signal);
      if (cancelled) return;
      if (next) {
        setData(next);
        setLoaded(true);
      } else if (!loaded) {
        // Mark loaded even on initial failure so we exit the skeleton
        // and render "—" placeholders rather than hanging.
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
    // We intentionally don't include `loaded` in deps — same one-way
    // bool pattern as TokenPriceWidget.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const circulating = loaded ? data?.circulatingSupply ?? "—" : "—";
  const total = loaded ? data?.totalSupply ?? "1,000,000" : "—";
  const locked = loaded ? data?.lockedOrBurned ?? "—" : "—";

  // Percent of supply locked / burned — only computed when we have
  // both numerics available, so we don't render misleading 0% during
  // the loading or fallback state.
  const lockedPct =
    data?.circulatingSupplyNum != null &&
    data?.totalSupplyNum != null &&
    data.totalSupplyNum > 0
      ? Math.max(
          0,
          Math.min(100, ((data.totalSupplyNum - data.circulatingSupplyNum) / data.totalSupplyNum) * 100)
        )
      : null;

  return (
    <section
      className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] p-5 md:p-6 shadow-[var(--s-sm)] ${className}`}
      aria-label="$TURBO supply"
    >
      <SupplyCell
        label="Circulating Supply"
        value={circulating}
        unit="TURBO"
        accent="cyan"
      />
      <SupplyCell
        label="Total Supply"
        value={total}
        unit="TURBO"
        accent="text"
        footnote="Fixed by protocol — no mint function."
      />
      <SupplyCell
        label="Locked / Burned"
        value={locked}
        unit="TURBO"
        accent="violet"
        footnote={
          lockedPct !== null
            ? `${lockedPct.toFixed(1)}% of total supply`
            : undefined
        }
      />
    </section>
  );
}

function SupplyCell(props: {
  label: string;
  value: string;
  unit: string;
  accent: "cyan" | "violet" | "text";
  footnote?: string;
}) {
  const accentColor =
    props.accent === "cyan"
      ? "var(--c-brand-cyan)"
      : props.accent === "violet"
        ? "#7C3AED"
        : "var(--c-text)";
  return (
    <div className="flex flex-col">
      <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-1">
        {props.label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-3xl md:text-4xl font-heading font-bold tabular-nums leading-none"
          style={{ color: accentColor }}
        >
          {props.value}
        </span>
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-[var(--c-text-muted)]">
          {props.unit}
        </span>
      </div>
      {props.footnote && (
        <div className="text-[11px] text-[var(--c-text-subtle)] mt-1.5 leading-snug">
          {props.footnote}
        </div>
      )}
    </div>
  );
}
