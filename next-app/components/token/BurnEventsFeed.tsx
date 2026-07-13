"use client";

// BurnEventsFeed — renders the $TURBO buyback & burn history as a table.
// Matches the turboloop.io dashboard design: table with expandable multi-tx rows.
//
// Data source: /api/token-burns → turboloop.io/api/proxy/buybacks
// Polls every 5 minutes.

import { useEffect, useState } from "react";
import { Flame, ExternalLink, Timer, ChevronDown, ChevronUp } from "lucide-react";

// ─── Burn Countdown ──────────────────────────────────────────────
function getSecondsUntilNextBurn(): number {
  const now = new Date();
  const next = new Date();
  next.setUTCHours(14, 0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
}

function formatCountdown(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [
    String(h).padStart(2, "0"),
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].join(":");
}

function BurnCountdown() {
  const [secs, setSecs] = useState<number | null>(null);

  useEffect(() => {
    setSecs(getSecondsUntilNextBurn());
    const id = window.setInterval(() => {
      setSecs(getSecondsUntilNextBurn());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const isFiring = secs !== null && (secs < 60 || secs > 86_340);

  return (
    <div
      className={`flex items-center justify-between gap-3 mb-5 px-4 py-3 rounded-xl border ${
        isFiring
          ? "border-orange-500/60 bg-orange-500/10 animate-pulse"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-center gap-2">
        <Timer
          className={`w-4 h-4 shrink-0 ${
            isFiring ? "text-orange-400" : "text-white/40"
          }`}
          aria-hidden="true"
        />
        <span className="text-xs text-white/50">
          {isFiring ? "🔥 Burn executing…" : "Next burn in"}
        </span>
      </div>
      {secs === null ? (
        <div className="h-4 w-16 rounded bg-white/10 animate-pulse" />
      ) : isFiring ? (
        <span className="text-xs font-bold text-orange-400 font-mono tabular-nums">
          any moment
        </span>
      ) : (
        <span className="text-sm font-bold font-mono tabular-nums text-amber-400">
          {formatCountdown(secs)}
        </span>
      )}
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────
interface BurnSlice {
  sliceIndex: number;
  hash: string;
  amount: number;
  usdtSpent: number;
  executedAt: number;
}

interface BurnEvent {
  hash: string;
  timestamp: number;
  amount: number;
  usdtSpent: number;
  executionNumber: number;
  isSliced: boolean;
  slices: BurnSlice[];
}

interface BurnFeedData {
  burns: BurnEvent[];
  totalBurned: number;
  totalUsdtSpent: number;
  fetchedAt: number;
  fresh: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 5 * 60_000;
const BSCSCAN_BURN_VIEW =
  "https://bscscan.com/token/0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3?a=0x000000000000000000000000000000000000dead";

function truncateHash(h: string): string {
  if (!h || h.length < 16) return h || "—";
  return `${h.slice(0, 8)}…${h.slice(-6)}`;
}

function formatAmount(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "0";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatUsdt(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "$0.00";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(ts: number): string {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  const day = d.getUTCDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} ${h}:${m}`;
}

async function fetchBurns(signal?: AbortSignal): Promise<BurnFeedData | null> {
  try {
    const res = await fetch("/api/token-burns", { signal, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as BurnFeedData;
  } catch {
    return null;
  }
}

// ─── Expandable Row ──────────────────────────────────────────────
function BurnRow({ burn }: { burn: BurnEvent }) {
  const [expanded, setExpanded] = useState(false);
  const hasSlices = burn.isSliced && burn.slices.length > 0;

  return (
    <>
      {/* Main row */}
      <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
        {/* # */}
        <td className="py-3 px-2 md:px-4">
          <span className="text-sm font-bold text-cyan-400 tabular-nums">
            {burn.executionNumber}
          </span>
        </td>
        {/* Date & Time */}
        <td className="py-3 px-2 md:px-4">
          <span className="text-sm text-white/70 tabular-nums whitespace-nowrap">
            {formatDateTime(burn.timestamp)}
          </span>
        </td>
        {/* USDT Spent */}
        <td className="py-3 px-2 md:px-4">
          <span className="text-sm font-bold text-green-400 tabular-nums">
            {formatUsdt(burn.usdtSpent)}
          </span>
        </td>
        {/* Tokens Burned */}
        <td className="py-3 px-2 md:px-4">
          <span className="text-sm text-white/90 tabular-nums whitespace-nowrap">
            <span className="text-orange-400 mr-1">🔥</span>
            <span className="font-bold text-orange-300">
              {formatAmount(burn.amount)}
            </span>
            <span className="text-white/40 ml-1 text-xs">TURBO</span>
          </span>
        </td>
        {/* Transaction */}
        <td className="py-3 px-2 md:px-4 text-right">
          {hasSlices ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-xs font-bold text-orange-400 hover:bg-orange-500/20 transition-colors"
            >
              🔥 {burn.slices.length} TXs
              {expanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          ) : burn.hash ? (
            <a
              href={`https://bscscan.com/tx/${burn.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {truncateHash(burn.hash)}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-xs text-white/30">—</span>
          )}
        </td>
      </tr>

      {/* Expanded slices */}
      {expanded && hasSlices && (
        <tr>
          <td colSpan={5} className="p-0">
            <div className="bg-white/[0.02] border-b border-white/5">
              {/* Slice header */}
              <div className="grid grid-cols-[60px_1fr_100px_1fr_1fr] md:grid-cols-[80px_1fr_120px_1fr_1fr] gap-1 px-4 md:px-8 py-2 border-b border-white/5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Slice</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Executed At</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">USDT</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Burned</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30 text-right">Transaction</span>
              </div>
              {/* Slice rows */}
              {burn.slices.map((slice) => (
                <div
                  key={slice.sliceIndex}
                  className="grid grid-cols-[60px_1fr_100px_1fr_1fr] md:grid-cols-[80px_1fr_120px_1fr_1fr] gap-1 px-4 md:px-8 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  {/* Slice # */}
                  <span className="text-xs font-bold text-cyan-400/70 tabular-nums">
                    {slice.sliceIndex + 1}
                  </span>
                  {/* Executed At */}
                  <span className="text-xs text-white/50 tabular-nums whitespace-nowrap">
                    {formatDateTime(slice.executedAt)}
                  </span>
                  {/* USDT */}
                  <span className="text-xs font-bold text-green-400/80 tabular-nums">
                    {formatUsdt(slice.usdtSpent)}
                  </span>
                  {/* Burned */}
                  <span className="text-xs text-orange-300/80 tabular-nums whitespace-nowrap">
                    {formatAmount(slice.amount)}
                    <span className="text-white/30 ml-1">TURBO</span>
                  </span>
                  {/* Transaction */}
                  <span className="text-right">
                    {slice.hash ? (
                      <a
                        href={`https://bscscan.com/tx/${slice.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400/80 hover:text-cyan-300 transition-colors"
                      >
                        {truncateHash(slice.hash)}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-white/20">—</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Mobile Card ─────────────────────────────────────────────────
function BurnCard({ burn }: { burn: BurnEvent }) {
  const [expanded, setExpanded] = useState(false);
  const hasSlices = burn.isSliced && burn.slices.length > 0;

  return (
    <div className="border-b border-white/5 py-4 first:pt-0 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-cyan-400 tabular-nums">
              #{burn.executionNumber}
            </span>
            <span className="text-xs text-white/40 tabular-nums">
              {formatDateTime(burn.timestamp)}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-bold text-green-400 tabular-nums">
              {formatUsdt(burn.usdtSpent)}
            </span>
            <span className="text-sm tabular-nums">
              <span className="text-orange-400">🔥</span>{" "}
              <span className="font-bold text-orange-300">
                {formatAmount(burn.amount)}
              </span>
              <span className="text-white/40 ml-1 text-xs">TURBO</span>
            </span>
          </div>
        </div>
        <div className="shrink-0">
          {hasSlices ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-[11px] font-bold text-orange-400 hover:bg-orange-500/20 transition-colors"
            >
              🔥 {burn.slices.length} TXs
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          ) : burn.hash ? (
            <a
              href={`https://bscscan.com/tx/${burn.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
            >
              {truncateHash(burn.hash)}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : null}
        </div>
      </div>

      {/* Expanded slices on mobile */}
      {expanded && hasSlices && (
        <div className="mt-3 ml-2 pl-3 border-l-2 border-orange-500/20 space-y-2.5">
          {burn.slices.map((slice) => (
            <div key={slice.sliceIndex} className="text-xs">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-cyan-400/70 tabular-nums">
                  #{slice.sliceIndex + 1}
                </span>
                <span className="text-white/40 tabular-nums">
                  {formatDateTime(slice.executedAt)}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-green-400/80 tabular-nums">
                  {formatUsdt(slice.usdtSpent)}
                </span>
                <span className="text-orange-300/80 tabular-nums">
                  {formatAmount(slice.amount)} TURBO
                </span>
                {slice.hash && (
                  <a
                    href={`https://bscscan.com/tx/${slice.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 font-mono text-cyan-400/70 hover:text-cyan-300"
                  >
                    {truncateHash(slice.hash)}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export function BurnEventsFeed() {
  const [data, setData] = useState<BurnFeedData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;

    const tick = async () => {
      const next = await fetchBurns(ctrl.signal);
      if (cancelled) return;
      if (next) {
        setData(next);
        setLoaded(true);
      } else if (!loaded) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = data?.burns ?? [];

  return (
    <section
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 md:p-7"
      aria-label="$TURBO Buyback & Burn History"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-orange-500/20">
            <Flame className="w-4 h-4 text-orange-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-white">
              Buyback &amp; Burn History
            </h3>
            <p className="text-xs text-white/40 mt-0.5">
              Daily auto-buyback · {rows.length} executions
            </p>
          </div>
        </div>
        <a
          href={BSCSCAN_BURN_VIEW}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Verify on-chain
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>

      {/* Countdown */}
      <BurnCountdown />

      {/* Summary stats */}
      {loaded && data && data.fresh && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Total Burned</p>
            <p className="text-lg font-bold text-orange-300 tabular-nums">
              {formatAmount(data.totalBurned)}
              <span className="text-xs text-white/40 ml-1">TURBO</span>
            </p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Total USDT Spent</p>
            <p className="text-lg font-bold text-green-400 tabular-nums">
              {formatUsdt(data.totalUsdtSpent)}
            </p>
          </div>
        </div>
      )}

      {/* Body */}
      {!loaded ? (
        <BurnSkeleton />
      ) : rows.length === 0 ? (
        <BurnEmpty />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-2.5 px-4 text-left text-[10px] font-semibold uppercase tracking-wider text-white/40">#</th>
                  <th className="py-2.5 px-4 text-left text-[10px] font-semibold uppercase tracking-wider text-white/40">Date &amp; Time</th>
                  <th className="py-2.5 px-4 text-left text-[10px] font-semibold uppercase tracking-wider text-white/40">USDT Spent</th>
                  <th className="py-2.5 px-4 text-left text-[10px] font-semibold uppercase tracking-wider text-white/40">Tokens Burned</th>
                  <th className="py-2.5 px-4 text-right text-[10px] font-semibold uppercase tracking-wider text-white/40">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <BurnRow key={b.executionNumber} burn={b} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden">
            {rows.map((b) => (
              <BurnCard key={b.executionNumber} burn={b} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// ─── Sub-views ───────────────────────────────────────────────────

function BurnSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 py-3"
        >
          <div className="flex-1 min-w-0">
            <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
            <div className="h-3 w-48 rounded bg-white/10 animate-pulse mt-2" />
          </div>
          <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function BurnEmpty() {
  return (
    <div className="py-10 text-center text-sm text-white/40">
      Burn data unavailable.{" "}
      <a
        href={BSCSCAN_BURN_VIEW}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1"
      >
        View on BscScan
        <ExternalLink className="w-3 h-3" aria-hidden="true" />
      </a>
    </div>
  );
}
