"use client";
// TokenSupplyWidget — live $TURBO supply stats. Renders four columns:
//
//   Circulating Supply  •  Total Supply  •  Burned  •  Vested / Locked
//
// Data sources:
//   • /api/token-supply  — upstream proxy for circulating / total / burned
//     (lockedOrBurned from the main app API = burned tokens)
//   • /api/token-vested  — on-chain balanceOf(TOKEN_CONTRACT) = vested/locked
//
// Both endpoints are polled every 5 minutes client-side so an open /token
// tab stays current. Shows "—" placeholders during the initial fetch and
// on upstream failure rather than spinning indefinitely.

import { useEffect, useState } from "react";
import type { TokenVestedData } from "@app/api/token-vested/route";

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

const POLL_INTERVAL_MS = 5 * 60_000;

async function fetchSupply(signal?: AbortSignal): Promise<TokenSupplyData | null> {
  try {
    const res = await fetch("/api/token-supply", { signal, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as TokenSupplyData;
  } catch {
    return null;
  }
}

async function fetchVested(signal?: AbortSignal): Promise<TokenVestedData | null> {
  try {
    const res = await fetch("/api/token-vested", { signal, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as TokenVestedData;
  } catch {
    return null;
  }
}

interface TokenSupplyWidgetProps {
  className?: string;
}

export function TokenSupplyWidget({ className = "" }: TokenSupplyWidgetProps) {
  const [supplyData, setSupplyData] = useState<TokenSupplyData | null>(null);
  const [vestedData, setVestedData] = useState<TokenVestedData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;

    const tick = async () => {
      const [nextSupply, nextVested] = await Promise.all([
        fetchSupply(ctrl.signal),
        fetchVested(ctrl.signal),
      ]);
      if (cancelled) return;
      if (nextSupply) setSupplyData(nextSupply);
      if (nextVested) setVestedData(nextVested);
      if (!loaded) setLoaded(true);
    };

    tick();
    const id = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      ctrl.abort();
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const circulating = loaded ? supplyData?.circulatingSupply ?? "—" : "—";
  const total       = loaded ? supplyData?.totalSupply       ?? "1,000,000" : "—";
  const burned      = loaded ? supplyData?.lockedOrBurned    ?? "—" : "—";
  const vested      = loaded ? vestedData?.lockedVested      ?? "—" : "—";

  const burnedPct =
    supplyData?.lockedOrBurnedNum != null &&
    supplyData?.totalSupplyNum != null &&
    supplyData.totalSupplyNum > 0
      ? ((supplyData.lockedOrBurnedNum / supplyData.totalSupplyNum) * 100).toFixed(1)
      : null;

  const vestedPct =
    vestedData?.lockedVestedNum != null &&
    vestedData?.totalSupplyNum != null &&
    vestedData.totalSupplyNum > 0
      ? ((vestedData.lockedVestedNum / vestedData.totalSupplyNum) * 100).toFixed(1)
      : null;

  return (
    <section
      className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] p-5 md:p-6 shadow-[var(--s-sm)] ${className}`}
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
        label="Burned"
        value={burned}
        unit="TURBO"
        accent="orange"
        footnote={
          burnedPct !== null
            ? `${burnedPct}% of total supply`
            : "Daily auto-buyback & burn"
        }
      />
      <SupplyCell
        label="Vested / Locked"
        value={vested}
        unit="TURBO"
        accent="violet"
        footnote={
          vestedPct !== null
            ? `${vestedPct}% of total supply`
            : "Held by contract"
        }
      />
    </section>
  );
}

function SupplyCell(props: {
  label: string;
  value: string;
  unit: string;
  accent: "cyan" | "violet" | "orange" | "text";
  footnote?: string;
}) {
  const accentColor =
    props.accent === "cyan"
      ? "var(--c-brand-cyan)"
      : props.accent === "violet"
        ? "#7C3AED"
        : props.accent === "orange"
          ? "#F97316"
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
