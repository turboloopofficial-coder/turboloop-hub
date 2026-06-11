"use client";

// BurnEventsFeed — renders the most recent $TURBO buyback & burn events.
// Polls /api/token-burns every 5 minutes — matches the server cache TTL.
//
// Data source: /api/token-burns → turboloop.io/api/proxy/buybacks
//
// Behaviour states:
//   • Loading      → 5 shimmer skeleton rows
//   • Empty/error  → "Burn data unavailable" with a BscScan deep link
//   • Loaded       → up to 10 burn rows, newest first
//
// Each row shows:
//   - Execution number badge (e.g. "#9")
//   - Burn amount in TURBO (cyan, bold)
//   - USDT spent on the buyback
//   - Relative time
//   - Truncated tx hash + BscScan link

import { useEffect, useState } from "react";
import { Flame, ExternalLink, Timer } from "lucide-react";

// ─── Burn Countdown ──────────────────────────────────────────────
// Daily burn fires at 14:00:00 UTC. Counts down to the next one.
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

  // Show "executing" for 60s BEFORE and 60s AFTER the 14:00 UTC rollover,
  // giving the on-chain tx time to confirm and appear in the feed.
  const isFiring = secs !== null && (secs < 60 || secs > 86_340);

  return (
    <div
      className={`flex items-center justify-between gap-3 mb-4 px-3 py-2.5 rounded-lg border ${
        isFiring
          ? "border-orange-500/60 bg-orange-500/10 animate-pulse"
          : "border-[var(--c-border)] bg-[var(--c-bg)]"
      }`}
    >
      <div className="flex items-center gap-2">
        <Timer
          className={`w-3.5 h-3.5 shrink-0 ${
            isFiring ? "text-orange-400" : "text-[var(--c-text-muted)]"
          }`}
          aria-hidden="true"
        />
        <span className="text-xs text-[var(--c-text-muted)]">
          {isFiring ? "🔥 Burn executing…" : "Next burn in"}
        </span>
      </div>
      {secs === null ? (
        <div className="h-3 w-16 rounded bg-[var(--c-border)] animate-pulse" />
      ) : isFiring ? (
        <span className="text-xs font-bold text-orange-400 font-mono tabular-nums">
          any moment
        </span>
      ) : (
        <span
          className="text-sm font-bold font-mono tabular-nums"
          style={{ color: "#f59e0b" }}
        >
          {formatCountdown(secs)}
        </span>
      )}
    </div>
  );
}

interface BurnEvent {
  hash: string;
  timestamp: number;
  amount: number;
  usdtSpent?: number;
  executionNumber?: number;
}

interface BurnFeedData {
  burns: BurnEvent[];
  totalBurned: number;
  /** Sum of USDT spent across all displayed burns. Optional because
   *  an older route version didn't return it — we compute a fallback
   *  from row totals if it's missing. */
  totalUsdtSpent?: number;
  fetchedAt: number;
  fresh: boolean;
}

const POLL_INTERVAL_MS = 5 * 60_000;
const ROW_LIMIT = 10;
const BSCSCAN_BURN_VIEW =
  "https://bscscan.com/token/0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3?a=0x000000000000000000000000000000000000dead";

function truncateHash(h: string): string {
  if (!h || h.length < 16) return h;
  return `${h.slice(0, 8)}…${h.slice(-6)}`;
}

function formatAmount(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "0";
  if (n >= 1000) return Math.round(n).toLocaleString("en-US");
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

function formatUsdt(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function relativeTime(ts: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - ts);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
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

  const rows = (data?.burns ?? []).slice(0, ROW_LIMIT);
  // Prefer the server-computed total when present; fall back to a
  // client-side sum across the displayed rows. The `??` chain keeps
  // the footer working against both new and older API responses.
  const totalUsdtSpent =
    data?.totalUsdtSpent ??
    rows.reduce((sum, b) => sum + (b.usdtSpent ?? 0), 0);

  return (
    <div
      className="rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] shadow-[var(--s-sm)] p-5 md:p-6"
      aria-label="Recent $TURBO burn events"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" aria-hidden="true" />
          <h3 className="text-sm md:text-base font-bold text-[var(--c-text)]">
            Recent Burn Events
          </h3>
        </div>
        <a
          href={BSCSCAN_BURN_VIEW}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--c-brand-cyan)] hover:underline"
        >
          View all
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>

      {/* Countdown to next burn */}
      <BurnCountdown />

      {/* Body */}
      {!loaded ? (
        <BurnSkeleton />
      ) : rows.length === 0 ? (
        <BurnEmpty />
      ) : (
        <ul className="divide-y divide-[var(--c-border)]">
          {rows.map((b) => (
            <li key={b.hash}>
              <a
                href={`https://bscscan.com/tx/${b.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 py-2.5 min-h-[52px] hover:bg-[var(--c-bg)] -mx-2 px-2 rounded-md transition"
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    {b.executionNumber ? (
                      <span className="text-[10px] font-bold text-[var(--c-text-muted)] bg-[var(--c-bg)] px-1.5 py-0.5 rounded tabular-nums shrink-0">
                        #{b.executionNumber}
                      </span>
                    ) : (
                      <span className="text-base" aria-hidden="true">🔥</span>
                    )}
                    <span className="font-bold text-[var(--c-brand-cyan)] tabular-nums text-sm md:text-base truncate">
                      {formatAmount(b.amount)} TURBO
                    </span>
                    {b.usdtSpent ? (
                      <span className="text-[11px] text-[var(--c-text-muted)] tabular-nums shrink-0">
                        {formatUsdt(b.usdtSpent)} spent
                      </span>
                    ) : null}
                  </div>
                  <div className="text-[11px] md:text-xs text-[var(--c-text-subtle)] font-mono mt-0.5 truncate">
                    {truncateHash(b.hash)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-xs text-[var(--c-text-muted)]">
                  <span className="tabular-nums">{relativeTime(b.timestamp)}</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Footer — shows both TURBO burned and USDT spent across the
          displayed rows. Wraps cleanly on narrow viewports because
          mobile gets the two amounts on a second line via flex-wrap. */}
      {loaded && data && (
        <div className="mt-4 pt-3 border-t border-[var(--c-border)] text-[11px] md:text-xs text-[var(--c-text-muted)]">
          {data.fresh ? (
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <span>Total burned (last {rows.length}):</span>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-[var(--c-text)] tabular-nums">
                  {formatAmount(data.totalBurned)} TURBO
                </span>
                {totalUsdtSpent > 0 && (
                  <span className="text-[var(--c-text-muted)] tabular-nums">
                    ·&nbsp;
                    <span className="font-bold text-[var(--c-text)]">
                      {formatUsdt(totalUsdtSpent)}
                    </span>
                    {" "}USDT spent
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span>Burn data unavailable —</span>
              <a
                href={BSCSCAN_BURN_VIEW}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[var(--c-brand-cyan)] hover:underline inline-flex items-center gap-1"
              >
                View on BscScan
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-views ───────────────────────────────────────────────────

function BurnSkeleton() {
  return (
    <ul className="divide-y divide-[var(--c-border)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <li
          key={i}
          className="flex items-center justify-between gap-3 py-2.5 min-h-[52px]"
        >
          <div className="flex-1 min-w-0">
            <div className="h-3.5 w-32 rounded bg-[var(--c-bg)] animate-pulse" />
            <div className="h-2.5 w-48 rounded bg-[var(--c-bg)] animate-pulse mt-2" />
          </div>
          <div className="h-2.5 w-12 rounded bg-[var(--c-bg)] animate-pulse" />
        </li>
      ))}
    </ul>
  );
}

function BurnEmpty() {
  return (
    <div className="py-8 text-center text-sm text-[var(--c-text-muted)]">
      Burn data unavailable.{" "}
      <a
        href={BSCSCAN_BURN_VIEW}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--c-brand-cyan)] hover:underline font-bold inline-flex items-center gap-1"
      >
        View on BscScan
        <ExternalLink className="w-3 h-3" aria-hidden="true" />
      </a>
    </div>
  );
}
