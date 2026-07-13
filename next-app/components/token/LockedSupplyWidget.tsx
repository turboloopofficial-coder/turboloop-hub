"use client";
// LockedSupplyWidget — shows locked/vested tokens, burned tokens, and
// true circulating supply derived from live on-chain data.
//
// Data source: /api/token-vested — reads balanceOf(TOKEN_CONTRACT) for
// locked/vested tokens and balanceOf(DEAD) for burned tokens directly
// from the BSC RPC. Polls every 5 minutes.
//
// True Circulating = totalSupply - lockedVested - burned
// This gives a transparent, verifiable picture of the real free float.

import { useEffect, useState } from "react";
import { Lock, Flame, TrendingUp, ExternalLink, DollarSign } from "lucide-react";

interface TokenVestedData {
  lockedVested: string;
  lockedVestedNum: number | null;
  burned: string;
  burnedNum: number | null;
  totalSupply: string;
  totalSupplyNum: number | null;
  trueCirculating: string;
  trueCirculatingNum: number | null;
  lockedPct: number | null;
  burnedPct: number | null;
  fetchedAt: number;
  fresh: boolean;
}

const POLL_INTERVAL_MS = 5 * 60_000;
const TOKEN_CONTRACT   = "0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3";
const BSCSCAN_URL      = `https://bscscan.com/address/${TOKEN_CONTRACT}`;

async function fetchVested(signal?: AbortSignal): Promise<TokenVestedData | null> {
  try {
    const res = await fetch("/api/token-vested", { signal, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as TokenVestedData;
  } catch {
    return null;
  }
}

async function fetchLifetimeUsdt(signal?: AbortSignal): Promise<number | null> {
  try {
    const res = await fetch("/api/token-burns", { signal, cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.fresh ? (data.totalUsdtSpent ?? null) : null;
  } catch {
    return null;
  }
}

interface Props {
  className?: string;
}

export function LockedSupplyWidget({ className = "" }: Props) {
  const [data, setData]     = useState<TokenVestedData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [lifetimeUsdt, setLifetimeUsdt] = useState<number | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;

    const tick = async () => {
      const next = await fetchVested(ctrl.signal);
      if (cancelled) return;
      if (next) { setData(next); setLoaded(true); }
      else if (!loaded) setLoaded(true);
    };

    tick();
    // Also fetch lifetime USDT spent on buybacks
    fetchLifetimeUsdt(ctrl.signal).then((v) => { if (!cancelled && v !== null) setLifetimeUsdt(v); });
    const id = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => { cancelled = true; ctrl.abort(); window.clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locked      = loaded ? (data?.lockedVested      ?? "—") : "—";
  const burned      = loaded ? (data?.burned             ?? "—") : "—";
  const circulating = loaded ? (data?.trueCirculating    ?? "—") : "—";
  const total       = loaded ? (data?.totalSupply        ?? "—") : "—";
  const lockedPct   = loaded ? (data?.lockedPct          ?? null) : null;
  const burnedPct   = loaded ? (data?.burnedPct          ?? null) : null;

  // Compute bar widths (circulating fills the rest)
  const circulatingPct =
    lockedPct !== null && burnedPct !== null
      ? Math.max(0, 100 - lockedPct - burnedPct)
      : null;

  const skeleton = "animate-pulse bg-white/10 rounded h-7 w-28 inline-block";

  return (
    <section className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-1">
            On-Chain Transparency
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Locked, Burned &amp; True Circulating Supply
          </h2>
          <p className="text-sm text-white/50 mt-1">
            Live from BNB Smart Chain · updates every 5 min
          </p>
        </div>
        <a
          href={BSCSCAN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors shrink-0"
        >
          Verify on BscScan
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Three stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Locked / Vested */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20">
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Locked / Vesting
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {loaded ? locked : <span className={skeleton} />}
          </div>
          <div className="text-sm text-white/40 mt-0.5">
            TURBO{lockedPct !== null ? ` · ${lockedPct}% of supply` : ""}
          </div>
          <p className="text-xs text-white/30 mt-2 leading-relaxed">
            Tokens held by the contract address — locked in active vesting schedules and not freely tradable.
          </p>
        </div>

        {/* Burned */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-orange-500/20">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Burned
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {loaded ? burned : <span className={skeleton} />}
          </div>
          <div className="text-sm text-white/40 mt-0.5">
            TURBO{burnedPct !== null ? ` · ${burnedPct}% of supply` : ""}
          </div>
          {lifetimeUsdt !== null && lifetimeUsdt > 0 && (
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5">
              <DollarSign className="w-3.5 h-3.5 text-green-400" />
              <span className="text-sm font-bold text-green-400 tabular-nums">
                ${lifetimeUsdt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-white/40">USDT spent on buybacks</span>
            </div>
          )}
          <p className="text-xs text-white/30 mt-2 leading-relaxed">
            Tokens sent to the dead address — permanently removed from supply via the daily auto-buyback mechanism.
          </p>
        </div>

        {/* True Circulating */}
        <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              True Circulating
            </span>
          </div>
          <div className="text-2xl font-bold text-cyan-300">
            {loaded ? circulating : <span className={skeleton} />}
          </div>
          <div className="text-sm text-cyan-400/60 mt-0.5">
            TURBO · freely tradable
          </div>
          <p className="text-xs text-white/30 mt-2 leading-relaxed">
            Total Supply minus locked/vesting and burned tokens. The real free float on the open market.
          </p>
        </div>
      </div>

      {/* Supply breakdown bar */}
      {circulatingPct !== null && lockedPct !== null && burnedPct !== null && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>Supply breakdown</span>
            <span>Total: {total} TURBO</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden gap-px bg-white/5">
            <div
              className="bg-cyan-500 transition-all duration-700"
              style={{ width: `${circulatingPct}%` }}
              title={`Circulating: ${circulatingPct.toFixed(1)}%`}
            />
            <div
              className="bg-purple-500 transition-all duration-700"
              style={{ width: `${lockedPct}%` }}
              title={`Locked: ${lockedPct}%`}
            />
            <div
              className="bg-orange-500 transition-all duration-700"
              style={{ width: `${burnedPct}%` }}
              title={`Burned: ${burnedPct}%`}
            />
          </div>
          <div className="flex gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
              Circulating {circulatingPct.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              Locked {lockedPct}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
              Burned {burnedPct}%
            </span>
          </div>
        </div>
      )}

      {/* Formula note */}
      <p className="text-xs text-white/25 mt-4 border-t border-white/5 pt-4">
        Formula: True Circulating = Total Supply − Locked/Vesting − Burned.
        Data read directly from{" "}
        <a
          href={BSCSCAN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-500/60 hover:text-cyan-400 underline"
        >
          the $TURBO contract
        </a>{" "}
        on BNB Smart Chain.
      </p>
    </section>
  );
}
