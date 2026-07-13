"use client";

// BurnEventsFeed — renders $TURBO buyback & burn events grouped by day.
// Supports the new multi-burn strategy (12 micro-burns per day to prevent
// sandwich attacks) while remaining backwards-compatible with single daily burns.
//
// Polls /api/token-burns every 5 minutes — matches the server cache TTL.
//
// Data source: /api/token-burns → turboloop.io/api/proxy/buybacks
//
// Display strategy:
//   • 24hr countdown to next burn event (14:00 UTC daily)
//   • Progress bar showing X/12 micro-burns completed today
//   • Burns grouped by calendar day (UTC)
//   • Day rows show summary (total burned, total spent)
//   • Expand/collapse ONLY shows individual transaction hashes
//
// Responsive design:
//   • Mobile: compact cards, stacked layout, full-width
//   • Desktop: spacious rows, inline details, hover states

import { useEffect, useState, useCallback } from "react";
import { Flame, ExternalLink, ChevronDown, ChevronRight, Shield, Clock } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

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
  totalUsdtSpent?: number;
  fetchedAt: number;
  fresh: boolean;
}

interface DayGroup {
  dateKey: string; // YYYY-MM-DD
  label: string; // "Today", "Yesterday", or formatted date
  burns: BurnEvent[];
  totalAmount: number;
  totalUsdtSpent: number;
  isToday: boolean;
}

// ─── Constants ──────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5 * 60_000;
const BURNS_PER_DAY = 12; // Expected micro-burns per day
const BURN_HOUR_UTC = 14; // Burns fire at 14:00 UTC daily
const BSCSCAN_BURN_VIEW =
  "https://bscscan.com/token/0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3?a=0x000000000000000000000000000000000000dead";

// ─── Utilities ──────────────────────────────────────────────────

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

function truncateHash(h: string): string {
  if (!h || h.length < 16) return h || "pending…";
  return `${h.slice(0, 8)}…${h.slice(-6)}`;
}

function relativeTime(ts: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - ts);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getDateKey(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toISOString().slice(0, 10);
}

function getDateLabel(dateKey: string): { label: string; isToday: boolean } {
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (dateKey === todayKey) return { label: "Today", isToday: true };
  if (dateKey === yesterdayKey) return { label: "Yesterday", isToday: false };

  const d = new Date(dateKey + "T00:00:00Z");
  return {
    label: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }),
    isToday: false,
  };
}

function groupBurnsByDay(burns: BurnEvent[]): DayGroup[] {
  const groups = new Map<string, BurnEvent[]>();

  for (const burn of burns) {
    const key = getDateKey(burn.timestamp);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(burn);
  }

  const result: DayGroup[] = [];
  for (const [dateKey, dayBurns] of groups) {
    const { label, isToday } = getDateLabel(dateKey);
    const totalAmount = dayBurns.reduce((sum, b) => sum + b.amount, 0);
    const totalUsdtSpent = dayBurns.reduce((sum, b) => sum + (b.usdtSpent ?? 0), 0);
    result.push({ dateKey, label, burns: dayBurns, totalAmount, totalUsdtSpent, isToday });
  }

  // Sort by date descending (newest first)
  result.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  return result;
}

/** Calculate seconds until next 14:00 UTC */
function getSecondsUntilNextBurn(): number {
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(BURN_HOUR_UTC, 0, 0, 0);

  // If we've already passed 14:00 UTC today, target tomorrow
  if (now >= target) {
    target.setUTCDate(target.getUTCDate() + 1);
  }

  return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
}

function formatCountdown(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Fetch ──────────────────────────────────────────────────────

async function fetchBurns(signal?: AbortSignal): Promise<BurnFeedData | null> {
  try {
    const res = await fetch("/api/token-burns", { signal, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as BurnFeedData;
  } catch {
    return null;
  }
}

// ─── Sub-components ─────────────────────────────────────────────

function NextBurnCountdown() {
  const [seconds, setSeconds] = useState(getSecondsUntilNextBurn());

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(getSecondsUntilNextBurn());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 mb-4 px-3 py-2.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-bg)]">
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 shrink-0 text-orange-500" aria-hidden="true" />
        <span className="text-xs text-[var(--c-text-muted)]">
          Next burn in
        </span>
      </div>
      <span className="text-sm md:text-base font-bold font-mono tabular-nums text-[var(--c-text)]">
        {formatCountdown(seconds)}
      </span>
    </div>
  );
}

function TodayProgress({ count }: { count: number }) {
  const progress = Math.min(count / BURNS_PER_DAY, 1);

  return (
    <div className="flex items-center gap-3 mb-4 px-3 py-2.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-bg)]">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Shield className="w-3.5 h-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
        <span className="text-xs text-[var(--c-text-muted)] truncate">
          Today&apos;s burns
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {/* Progress bar */}
        <div className="w-16 md:w-24 h-1.5 rounded-full bg-[var(--c-border)] overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold font-mono tabular-nums text-[var(--c-text)]">
          {count}/{BURNS_PER_DAY}
        </span>
      </div>
    </div>
  );
}

function AntiSandwichBadge() {
  return (
    <div className="flex items-start gap-2 mb-4 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
      <Shield className="w-3.5 h-3.5 shrink-0 text-emerald-500 mt-0.5" aria-hidden="true" />
      <p className="text-[11px] md:text-xs text-[var(--c-text-muted)] leading-relaxed">
        <span className="font-bold text-emerald-600 dark:text-emerald-400">Multi-batch burns</span>
        {" "}— Daily buyback amount is split into {BURNS_PER_DAY} smaller transactions to prevent sandwich attacks and reduce price impact.
      </p>
    </div>
  );
}

function DayGroupRow({ group }: { group: DayGroup }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => setExpanded((v) => !v), []);

  return (
    <div className="border border-[var(--c-border)] rounded-xl overflow-hidden mb-3 last:mb-0">
      {/* Day summary header — always visible, click expands transactions */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between gap-2 px-3 md:px-4 py-3 bg-[var(--c-bg)] hover:bg-[var(--c-surface)] transition text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-[var(--c-text-muted)]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[var(--c-text-muted)]" />
          )}
          <span className="text-xs md:text-sm font-bold text-[var(--c-text)] truncate">
            {group.isToday && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            )}
            {group.label}
          </span>
          {group.burns.length > 1 && (
            <span className="text-[10px] font-bold text-[var(--c-text-muted)] bg-[var(--c-surface)] px-1.5 py-0.5 rounded shrink-0">
              {group.burns.length} txns
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0 text-right">
          <div className="hidden md:block">
            {group.totalUsdtSpent > 0 && (
              <span className="text-[11px] text-[var(--c-text-muted)] tabular-nums">
                {formatUsdt(group.totalUsdtSpent)} spent
              </span>
            )}
          </div>
          <span className="text-xs md:text-sm font-bold text-[var(--c-brand-cyan)] tabular-nums">
            {formatAmount(group.totalAmount)} TURBO
          </span>
        </div>
      </button>

      {/* Expanded: individual transaction rows */}
      {expanded && (
        <ul className="divide-y divide-[var(--c-border)] border-t border-[var(--c-border)]">
          {group.burns.map((b, idx) => (
            <li key={b.hash || idx}>
              <a
                href={b.hash ? `https://bscscan.com/tx/${b.hash}` : BSCSCAN_BURN_VIEW}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-3 md:px-4 py-2.5 hover:bg-[var(--c-bg)] transition"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    {b.executionNumber ? (
                      <span className="text-[10px] font-bold text-[var(--c-text-muted)] bg-[var(--c-bg)] px-1.5 py-0.5 rounded tabular-nums shrink-0">
                        #{b.executionNumber}
                      </span>
                    ) : (
                      <span className="text-xs" aria-hidden="true">🔥</span>
                    )}
                    <span className="font-bold text-[var(--c-brand-cyan)] tabular-nums text-sm truncate">
                      {formatAmount(b.amount)} TURBO
                    </span>
                    {b.usdtSpent ? (
                      <span className="text-[11px] text-[var(--c-text-muted)] tabular-nums shrink-0">
                        {formatUsdt(b.usdtSpent)} spent
                      </span>
                    ) : null}
                  </div>
                  <div className="text-[10px] md:text-[11px] text-[var(--c-text-subtle)] font-mono mt-0.5 truncate">
                    {truncateHash(b.hash)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-[var(--c-text-muted)]">
                  <span className="tabular-nums">{relativeTime(b.timestamp)}</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Collapsed mobile summary: show USDT spent below */}
      {!expanded && group.totalUsdtSpent > 0 && (
        <div className="md:hidden px-3 pb-2 -mt-1">
          <span className="text-[10px] text-[var(--c-text-muted)] tabular-nums">
            {formatUsdt(group.totalUsdtSpent)} spent
          </span>
        </div>
      )}
    </div>
  );
}

function BurnSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="border border-[var(--c-border)] rounded-xl px-4 py-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="h-3.5 w-24 rounded bg-[var(--c-bg)] animate-pulse" />
            </div>
            <div className="h-3.5 w-28 rounded bg-[var(--c-bg)] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
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

// ─── Main Component ─────────────────────────────────────────────

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

  const burns = data?.burns ?? [];
  const dayGroups = groupBurnsByDay(burns);
  const todayGroup = dayGroups.find((g) => g.isToday);
  const todayBurnCount = todayGroup?.burns.length ?? 0;

  // Compute totals across all displayed burns
  const totalBurned = data?.totalBurned ?? burns.reduce((s, b) => s + b.amount, 0);
  const totalUsdtSpent =
    data?.totalUsdtSpent ?? burns.reduce((s, b) => s + (b.usdtSpent ?? 0), 0);

  return (
    <div
      className="rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] shadow-[var(--s-sm)] p-4 md:p-6"
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

      {/* Anti-sandwich explanation badge */}
      <AntiSandwichBadge />

      {/* 24hr countdown to next burn */}
      <NextBurnCountdown />

      {/* Today's burn progress */}
      {loaded && todayBurnCount > 0 && (
        <TodayProgress count={todayBurnCount} />
      )}

      {/* Body — grouped by day, all collapsed by default */}
      {!loaded ? (
        <BurnSkeleton />
      ) : dayGroups.length === 0 ? (
        <BurnEmpty />
      ) : (
        <div>
          {dayGroups.map((group) => (
            <DayGroupRow
              key={group.dateKey}
              group={group}
            />
          ))}
        </div>
      )}

      {/* Footer — aggregate totals */}
      {loaded && data && data.fresh && (
        <div className="mt-4 pt-3 border-t border-[var(--c-border)] text-[11px] md:text-xs text-[var(--c-text-muted)]">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <span>Total (last {burns.length} burns):</span>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-[var(--c-text)] tabular-nums">
                {formatAmount(totalBurned)} TURBO
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
        </div>
      )}
    </div>
  );
}
