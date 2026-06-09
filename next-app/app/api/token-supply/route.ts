// /api/token-supply — server-side proxy for the upstream main-app
// circulating-supply endpoint. Provides a single, CDN-cached source of
// truth for the /token page's supply trio (circulating / total / locked-
// or-burned). Mirrors the caching pattern of /api/token-price.
//
// Caching strategy:
//   • Module-scoped in-memory cache with a 5-minute TTL. Survives across
//     requests in the same Edge function instance. Vercel may spin up N
//     instances, each holding its own cache, but at our traffic level
//     the upstream is never approached.
//   • HTTP Cache-Control: s-maxage=300, stale-while-revalidate=600 so
//     Vercel's CDN also caches between cache misses.
//
// On upstream failure we serve the last-good cached value when we have
// one. If we have neither cache nor a successful upstream fetch, we
// fall back to a hardcoded "1,000,000" total supply with no live
// circulating / locked numbers so the page can still render without
// breaking.

import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const UPSTREAM = "https://turboloop.io/api/token/circulating-supply";
const CACHE_TTL_MS = 5 * 60_000; // 5 minutes
const HARDCODED_TOTAL_SUPPLY = "1,000,000";

export interface TokenSupplyData {
  /** Tokens in circulation (formatted with commas, no decimals). */
  circulatingSupply: string;
  /** Total supply ever minted (formatted with commas). Always
   *  "1,000,000" by protocol design — there is no mint function. */
  totalSupply: string;
  /** Tokens locked in contracts or sent to burn addresses (= totalSupply - circulating). */
  lockedOrBurned: string;
  /** Numeric raw values for downstream math (e.g. percent-locked badge). */
  circulatingSupplyNum: number | null;
  totalSupplyNum: number | null;
  lockedOrBurnedNum: number | null;
  /** When this data was fetched (ms since epoch). */
  fetchedAt: number;
  /** True if the data came from a successful upstream response, false
   *  if it's the fallback stub. */
  fresh: boolean;
}

let cached: { data: TokenSupplyData; expiresAt: number } | null = null;

function fmtCommas(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString("en-US");
}

function fallbackResponse(): TokenSupplyData {
  return {
    circulatingSupply: HARDCODED_TOTAL_SUPPLY,
    totalSupply: HARDCODED_TOTAL_SUPPLY,
    lockedOrBurned: "0",
    circulatingSupplyNum: null,
    totalSupplyNum: 1_000_000,
    lockedOrBurnedNum: null,
    fetchedAt: Date.now(),
    fresh: false,
  };
}

/** Coerce an arbitrary number-ish input to a finite number, or null. */
function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    // Strip commas + whitespace, then parse. Upstream sometimes returns
    // "1,000,000" formatted, sometimes "1000000" raw.
    const cleaned = v.replace(/[,\s]/g, "");
    const n = Number(cleaned);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

async function fetchFromUpstream(): Promise<TokenSupplyData> {
  try {
    const res = await fetch(UPSTREAM, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return fallbackResponse();
    const json = (await res.json()) as {
      data?: {
        circulatingSupply?: number | string;
        totalSupply?: number | string;
        lockedOrBurned?: number | string;
      };
      circulatingSupply?: number | string;
      totalSupply?: number | string;
      lockedOrBurned?: number | string;
    };

    // Tolerate two response shapes — { data: { ... } } and flat { ... }.
    // The spec calls out the nested shape, but defensive parsing keeps
    // us alive if the upstream tweaks their envelope.
    const payload = json.data ?? json;
    const circulating = toNum(payload.circulatingSupply);
    const total = toNum(payload.totalSupply) ?? 1_000_000;

    // Prefer explicit lockedOrBurned from upstream; otherwise compute
    // it from total - circulating (always non-negative).
    let locked = toNum(payload.lockedOrBurned);
    if (locked === null && circulating !== null) {
      locked = Math.max(0, total - circulating);
    }

    if (circulating === null) {
      // Upstream sent us a body but the field we need is missing —
      // treat as a soft failure.
      return fallbackResponse();
    }

    return {
      circulatingSupply: fmtCommas(circulating),
      totalSupply: fmtCommas(total),
      lockedOrBurned: locked !== null ? fmtCommas(locked) : "0",
      circulatingSupplyNum: circulating,
      totalSupplyNum: total,
      lockedOrBurnedNum: locked,
      fetchedAt: Date.now(),
      fresh: true,
    };
  } catch {
    return fallbackResponse();
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

  const data = await fetchFromUpstream();

  // Only refresh the cache window on a successful upstream read. If the
  // upstream is degraded and we have a previous good value, keep
  // serving it (graceful degradation pattern from /api/token-price).
  if (data.fresh) {
    cached = { data, expiresAt: now + CACHE_TTL_MS };
  } else if (cached) {
    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        "X-Token-Supply-Status": "stale-fallback",
      },
    });
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": data.fresh
        ? "public, s-maxage=300, stale-while-revalidate=600"
        : "public, s-maxage=30, stale-while-revalidate=120",
      "X-Token-Supply-Status": data.fresh ? "fresh" : "unavailable",
    },
  });
}
