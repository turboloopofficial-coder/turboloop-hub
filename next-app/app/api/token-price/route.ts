// /api/token-price — server-side proxy for DexScreener's pair endpoint
// for the TURBO/USDT pool on BSC. Single source of live price data
// for every surface (homepage section, /token page, /calculator, blog
// sidebars).
//
// Caching strategy:
//   - Module-scoped in-memory cache, 60-second TTL. Survives across
//     requests in the same Edge function instance. Vercel may spin up
//     N instances; each holds its own cache, but at our traffic level
//     DexScreener's 300/min/IP limit is never approached.
//   - HTTP Cache-Control: s-maxage=60, stale-while-revalidate=120 so
//     Vercel's CDN also caches between cache misses.
//
// DexScreener occasionally rate-limits or returns empty pair data
// (early after listing, during their incident windows). We return
// last-good cached data when we have it, otherwise a structured
// "unavailable" response that downstream consumers handle gracefully
// (showing dashes instead of stale numbers).

import { NextResponse } from "next/server";
import { DEXSCREENER_API, TOKEN } from "@lib/tokenFacts";

export const runtime = "edge";
// Set high revalidate so Next.js ISR doesn't fight our manual cache.
// We're authoritative for freshness via the s-maxage header below.
export const dynamic = "force-dynamic";

interface DexPairResponse {
  pair?: {
    priceUsd?: string;
    priceNative?: string;
    volume?: { h24?: number };
    priceChange?: { h24?: number; h6?: number; h1?: number };
    liquidity?: { usd?: number; base?: number; quote?: number };
    fdv?: number;
    marketCap?: number;
    pairAddress?: string;
    baseToken?: { symbol?: string; name?: string };
  };
}

export interface TokenPriceData {
  /** Price in USD. */
  priceUsd: number | null;
  /** 24-hour price change as a decimal (+0.05 = +5%). */
  priceChange24h: number | null;
  /** 24-hour trading volume in USD. */
  volume24h: number | null;
  /** Liquidity pool value in USD (both sides combined). */
  liquidityUsd: number | null;
  /** Fully-diluted valuation in USD (= price × total supply). */
  fdv: number | null;
  /** When this data was fetched (ms since epoch). */
  fetchedAt: number;
  /** True if data came from a DexScreener response, false if it's the
   *  fallback "unavailable" stub. */
  fresh: boolean;
}

let cached: { data: TokenPriceData; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

function emptyResponse(): TokenPriceData {
  return {
    priceUsd: null,
    priceChange24h: null,
    volume24h: null,
    liquidityUsd: null,
    fdv: null,
    fetchedAt: Date.now(),
    fresh: false,
  };
}

async function fetchFromDexScreener(): Promise<TokenPriceData> {
  try {
    const res = await fetch(DEXSCREENER_API, {
      // 5s timeout — DexScreener is usually <500ms, anything past 5s
      // means an outage and we'd rather fall through to cached/empty.
      signal: AbortSignal.timeout(5000),
      // Bypass Next.js's own fetch cache — we manage caching here.
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return emptyResponse();
    const json = (await res.json()) as DexPairResponse;
    const p = json.pair;
    if (!p) return emptyResponse();
    const priceUsd = p.priceUsd ? Number(p.priceUsd) : null;
    return {
      priceUsd: Number.isFinite(priceUsd as number) ? (priceUsd as number) : null,
      priceChange24h:
        typeof p.priceChange?.h24 === "number"
          ? p.priceChange.h24 / 100
          : null,
      volume24h: typeof p.volume?.h24 === "number" ? p.volume.h24 : null,
      liquidityUsd:
        typeof p.liquidity?.usd === "number" ? p.liquidity.usd : null,
      fdv:
        typeof p.fdv === "number"
          ? p.fdv
          : typeof p.marketCap === "number"
            ? p.marketCap
            : priceUsd !== null && Number.isFinite(priceUsd)
              ? (priceUsd as number) * TOKEN.totalSupply
              : null,
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
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }

  const data = await fetchFromDexScreener();

  // Only persist the cache when we got a fresh successful read. If
  // DexScreener returned empty/error AND we have an older cached
  // value, keep serving the cached value (graceful degradation).
  if (data.fresh) {
    cached = { data, expiresAt: now + CACHE_TTL_MS };
  } else if (cached) {
    // Don't extend expiry — but return last-good rather than empty.
    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=60",
        "X-Token-Price-Status": "stale-fallback",
      },
    });
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": data.fresh
        ? "public, s-maxage=60, stale-while-revalidate=120"
        : "public, s-maxage=10, stale-while-revalidate=30",
      "X-Token-Price-Status": data.fresh ? "fresh" : "unavailable",
    },
  });
}
