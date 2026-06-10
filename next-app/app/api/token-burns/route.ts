// /api/token-burns — server-side proxy for the BscScan V2 tokentx
// Deploy: 2026-06-11-v2 (force CDN cache invalidation)
// endpoint, filtered to TURBO transfers landing at the dead-address
// burn sink (0x…dead). The Burn Events Feed widget on /token reads
// from here every 5 minutes.
//
// Caching strategy:
//   • Module-scoped in-memory cache, 5-minute TTL. Survives across
//     requests on the same Edge instance.
//   • HTTP Cache-Control: s-maxage=300, stale-while-revalidate=600 so
//     Vercel's CDN also caches between cache misses.
//
// Graceful degradation: if BscScan is down or the API key is missing,
// we serve last-good cached data when we have it, otherwise return a
// structured `fresh: false` envelope so the widget can show "Burn
// data unavailable" without crashing the whole page.

import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const TURBO_CONTRACT = "0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3";
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dead";
const BSC_CHAIN_ID = 56;
const PAGE_SIZE = 20;
const CACHE_TTL_MS = 5 * 60_000; // 5 minutes

export interface BurnEvent {
  /** Transaction hash, full 0x… string. */
  hash: string;
  /** Unix epoch (seconds). */
  timestamp: number;
  /** Parsed token amount (value / 10^decimals). */
  amount: number;
  /** Sender address (the buyback contract for daily auto-burns). */
  from: string;
}

export interface BurnFeedData {
  burns: BurnEvent[];
  /** Sum of all amounts on the current page (NOT lifetime total
   *  burned — BscScan doesn't expose that directly, would need a
   *  separate balance read). */
  totalBurned: number;
  fetchedAt: number;
  fresh: boolean;
}

interface BscScanTx {
  hash: string;
  timeStamp: string;
  value: string;
  tokenDecimal: string;
  from: string;
  to: string;
}

interface BscScanResponse {
  status?: string;
  message?: string;
  result?: BscScanTx[] | string;
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

async function fetchFromBscScan(): Promise<BurnFeedData> {
  const apiKey = process.env.BSCSCAN_API_KEY ?? "";
  // BscScan V2 still accepts the dummy `YourApiKeyToken` for very low
  // throughput, but production-stable rates require a real key. We
  // pass whatever we have; failure handling stays the same either way.
  const url =
    `https://api.bscscan.com/v2/api?chainid=${BSC_CHAIN_ID}` +
    `&module=account&action=tokentx` +
    `&contractaddress=${TURBO_CONTRACT}` +
    `&address=${DEAD_ADDRESS}` +
    `&page=1&offset=${PAGE_SIZE}&sort=desc` +
    `&apikey=${apiKey || "YourApiKeyToken"}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return emptyResponse();
    const json = (await res.json()) as BscScanResponse;
    // BscScan V2 sometimes returns status="0" with a string result for
    // empty queries; we treat that as "no burns yet" not as an error.
    if (json.status !== "1" || !Array.isArray(json.result)) {
      return emptyResponse();
    }
    const burns: BurnEvent[] = json.result
      .filter((t) => t.to?.toLowerCase() === DEAD_ADDRESS)
      .map((t) => {
        const decimals = Number(t.tokenDecimal) || 18;
        const amount = Number(t.value) / Math.pow(10, decimals);
        return {
          hash: t.hash,
          timestamp: Number(t.timeStamp) || 0,
          amount: Number.isFinite(amount) ? amount : 0,
          from: t.from ?? "",
        };
      });
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

  const data = await fetchFromBscScan();

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
