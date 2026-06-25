// /api/token-supply-history — returns daily circulating supply snapshots
// for the TurboLoop token page chart.
//
// Data source: supply_snapshots table in Neon DB.
// Populated by:
//   1. Backfill script (historical data from launch June 1, 2026)
//   2. Manus scheduled task (daily snapshot via cron)
//   3. cron-master daily snapshot task (writes today's row each day)
//
// Returns up to 90 days of daily data, sorted oldest→newest.
// Each row: { date, circulating, burned, locked, total }
//
// Cache: 1-hour in-memory TTL (data only changes once per day).

import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface SupplySnapshot {
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** True circulating supply (total - locked - burned) */
  circulating: number;
  /** Cumulative burned tokens */
  burned: number;
  /** Locked / vesting tokens */
  locked: number;
  /** Total supply on-chain */
  total: number;
  /** Circulating as % of total */
  circulatingPct: number | null;
  /** Data source: "onchain" | "estimated" */
  source: string;
}

export interface SupplyHistoryData {
  snapshots: SupplySnapshot[];
  /** Total tokens burned since launch */
  totalBurned: number;
  /** Total tokens locked / vesting (latest snapshot) */
  totalLocked: number;
  /** Circulating supply drop since day 1 */
  totalDrop: number;
  /** Percentage drop from initial circulating */
  dropPct: number | null;
  fetchedAt: number;
  fresh: boolean;
}

let cached: { data: SupplyHistoryData; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60_000; // 1 hour

function emptyResponse(): SupplyHistoryData {
  return {
    snapshots: [],
    totalBurned: 0,
    totalLocked: 0,
    totalDrop: 0,
    dropPct: null,
    fetchedAt: Date.now(),
    fresh: false,
  };
}

async function fetchFromDB(): Promise<SupplyHistoryData> {
  const url = process.env.DATABASE_URL;
  if (!url) return emptyResponse();

  try {
    const sql = neon(url);
    const rows = await sql`
      SELECT
        snapshot_date::text AS date,
        circulating::float8  AS circulating,
        burned::float8       AS burned,
        locked_vested::float8 AS locked,
        total_supply::float8  AS total,
        circulating_pct::float8 AS circulating_pct,
        source
      FROM supply_snapshots
      ORDER BY snapshot_date ASC
      LIMIT 90
    `;

    if (!rows.length) return emptyResponse();

    const snapshots: SupplySnapshot[] = rows.map((r) => ({
      date: r.date,
      circulating: Math.round(r.circulating),
      burned: Math.round(r.burned),
      locked: Math.round(r.locked),
      total: Math.round(r.total),
      circulatingPct: r.circulating_pct ?? null,
      source: r.source,
    }));

    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    const totalDrop = first.circulating - last.circulating;
    const dropPct = first.circulating > 0
      ? parseFloat(((totalDrop / first.circulating) * 100).toFixed(2))
      : null;

    return {
      snapshots,
      totalBurned: last.burned,
      totalLocked: last.locked,
      totalDrop: Math.round(totalDrop),
      dropPct,
      fetchedAt: Date.now(),
      fresh: true,
    };
  } catch (err) {
    console.error("[token-supply-history] DB error:", err);
    return emptyResponse();
  }
}

export async function GET() {
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  }

  const data = await fetchFromDB();

  if (data.fresh) {
    cached = { data, expiresAt: now + CACHE_TTL_MS };
  } else if (cached) {
    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Supply-History-Status": "stale-fallback",
      },
    });
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": data.fresh
        ? "public, s-maxage=3600, stale-while-revalidate=7200"
        : "public, s-maxage=30, stale-while-revalidate=120",
      "X-Supply-History-Status": data.fresh ? "fresh" : "unavailable",
    },
  });
}
