// /api/token-burns — serves the burn events feed on /token.
// Deploy: 2026-06-11-buybacks-proxy
//
// Data source: https://turboloop.io/api/proxy/buybacks
// The turboloop.io backend tracks every daily buyback & burn execution
// in its own database, including the tx hash, USDT spent, tokens burned,
// and timestamp. This is the same data shown on the turboloop.io
// Token Rewards dashboard.
//
// Why not BscScan? BscScan V1 was deprecated. BscScan V2 requires a
// paid API key for BSC — free tier returns an error. The turboloop.io
// proxy is public, always fresh, and returns exactly the fields we need.
//
// Caching strategy:
//   • Module-scoped in-memory cache, 5-minute TTL.
//   • HTTP Cache-Control: s-maxage=300, stale-while-revalidate=600 so
//     Vercel's CDN also caches between cache misses.
//
// Graceful degradation: if the upstream is down we serve last-good
// cached data, or a structured `fresh: false` envelope so the widget
// can show "Burn data unavailable" without crashing.

import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const BUYBACKS_URL =
  "https://turboloop.io/api/proxy/buybacks?limit=20&page=1";
const CACHE_TTL_MS = 5 * 60_000; // 5 minutes

export interface BurnEvent {
  /** Transaction hash, full 0x… string. */
  hash: string;
  /** Unix epoch (seconds). */
  timestamp: number;
  /** Parsed token amount (already divided by 1e18). */
  amount: number;
  /** USDT spent on this buyback. */
  usdtSpent: number;
  /** Execution number (1 = first ever buyback). */
  executionNumber: number;
}

export interface BurnFeedData {
  burns: BurnEvent[];
  /** Sum of all `amount` values across all returned burns. */
  totalBurned: number;
  fetchedAt: number;
  fresh: boolean;
}

interface BuybackItem {
  execution_number: number;
  tx_hash: string;
  usdt_spent: string; // raw wei string (18 decimals)
  tokens_burned: string; // raw wei string (18 decimals), may use scientific notation
  timestamp: string; // ISO 8601
}

interface BuybacksResponse {
  data?: {
    items?: BuybackItem[];
  };
  error?: string;
}

let cached: { data: BurnFeedData; expiresAt: number } | null = null;

function emptyResponse(): BurnFeedData {
  return {
    burns: [],
    totalBurned: 0,
    fetchedAt: Date.now(),
    fresh: false,
  };
}

/** Parse a raw token amount string (may be scientific notation) → human units */
function parseTokenAmount(raw: string): number {
  try {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return n / 1e18;
  } catch {
    return 0;
  }
}

async function fetchFromBuybacksProxy(): Promise<BurnFeedData> {
  try {
    const res = await fetch(BUYBACKS_URL, {
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return emptyResponse();

    const json = (await res.json()) as BuybacksResponse;
    if (json.error || !json.data?.items?.length) return emptyResponse();

    const burns: BurnEvent[] = json.data.items
      .map((item) => {
        const amount = parseTokenAmount(item.tokens_burned);
        const usdtSpent = parseTokenAmount(item.usdt_spent);
        const timestamp = item.timestamp
          ? Math.floor(new Date(item.timestamp).getTime() / 1000)
          : 0;
        return {
          hash: item.tx_hash ?? "",
          timestamp,
          amount,
          usdtSpent,
          executionNumber: Number(item.execution_number) || 0,
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    const totalBurned = burns.reduce((sum, b) => sum + b.amount, 0);

    return {
      burns,
      totalBurned,
      fetchedAt: Date.now(),
      fresh: true,
    };
  } catch {
    return emptyResponse();
  }
}

export async function GET() {
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  }

  const data = await fetchFromBuybacksProxy();

  if (data.fresh) {
    cached = { data, expiresAt: now + CACHE_TTL_MS };
  } else if (cached) {
    // Serve last-good when upstream is degraded.
    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        "X-Token-Burns-Status": "stale-fallback",
      },
    });
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": data.fresh
        ? "public, s-maxage=300, stale-while-revalidate=600"
        : "public, s-maxage=30, stale-while-revalidate=120",
      "X-Token-Burns-Status": data.fresh ? "fresh" : "unavailable",
    },
  });
}
