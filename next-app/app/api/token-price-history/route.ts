// /api/token-price-history — multi-period price change for $TURBO.
// Daily candles from GeckoTerminal OHLCV (no API key required). Used by
// the TokenPriceWidget's "Price Performance" row.
//
// Why GeckoTerminal here instead of DexScreener? DexScreener only ships
// h6 and h24 deltas — anything longer needs daily candles, which Gecko
// exposes for free.
//
// 5-minute in-memory cache. Daily candles update slowly so the TTL is
// long; the widget also polls only every 5 min, so per-instance fetch
// volume is bounded.

import { NextResponse } from "next/server";
import { TOKEN } from "@lib/tokenFacts";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const GECKO_OHLCV_URL =
  `https://api.geckoterminal.com/api/v2/networks/bsc/pools/${TOKEN.pair}/ohlcv/day?limit=30&currency=usd`;

// Token launch — UTC midnight on 2026-06-01.
const LAUNCH_DATE_MS = new Date("2026-06-01T00:00:00Z").getTime();

export interface TokenPriceHistoryData {
  /** 7-day price change as a decimal (+0.05 = +5%). null if unavailable. */
  priceChange7d: number | null;
  /** 14-day price change. null if token < 14 days old. */
  priceChange14d: number | null;
  /** 30-day price change. null if token < 30 days old. */
  priceChange30d: number | null;
  /** All-time change from launch price ($0.001). null if current price unavailable. */
  priceChangeAllTime: number | null;
  /** Days since token launch (for the UI to decide which badges to show). */
  daysSinceLaunch: number;
  /** Current price used for calculations (from most recent candle close). */
  currentPriceFromCandles: number | null;
  fetchedAt: number;
  fresh: boolean;
}

let cached: { data: TokenPriceHistoryData; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60_000;

function emptyResponse(): TokenPriceHistoryData {
  const daysSinceLaunch = Math.max(
    0,
    Math.floor((Date.now() - LAUNCH_DATE_MS) / 86_400_000)
  );
  return {
    priceChange7d: null,
    priceChange14d: null,
    priceChange30d: null,
    priceChangeAllTime: null,
    daysSinceLaunch,
    currentPriceFromCandles: null,
    fetchedAt: Date.now(),
    fresh: false,
  };
}

async function fetchHistory(): Promise<TokenPriceHistoryData> {
  const now = Date.now();
  const daysSinceLaunch = Math.max(
    0,
    Math.floor((now - LAUNCH_DATE_MS) / 86_400_000)
  );

  try {
    const res = await fetch(GECKO_OHLCV_URL, {
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return emptyResponse();

    const json = (await res.json()) as {
      data?: {
        attributes?: {
          ohlcv_list?: Array<[number, number, number, number, number, number]>;
        };
      };
    };
    const candles = json?.data?.attributes?.ohlcv_list ?? [];
    if (!candles.length) return emptyResponse();

    // Sort ascending by timestamp (oldest first). Gecko ships ascending
    // already but normalise defensively in case that changes.
    candles.sort((a, b) => a[0] - b[0]);

    const currentPrice = candles[candles.length - 1][4]; // close of latest candle
    if (!currentPrice || !Number.isFinite(currentPrice)) return emptyResponse();

    // Open price of the candle that was active N days ago (= the last
    // candle whose timestamp is <= now - N*day). Returns null if no
    // candle predates that mark (i.e. token is younger than N days).
    function priceNDaysAgo(n: number): number | null {
      const targetMs = now - n * 86_400_000;
      let best: [number, number, number, number, number, number] | null = null;
      for (const c of candles) {
        const candleMs = c[0] * 1000;
        if (candleMs <= targetMs) best = c;
        else break;
      }
      if (!best) return null;
      return best[1];
    }

    function pctChange(from: number | null): number | null {
      if (from === null || from === 0 || !Number.isFinite(from)) return null;
      return (currentPrice - from) / from;
    }

    const open7d = priceNDaysAgo(7);
    const open14d = daysSinceLaunch >= 14 ? priceNDaysAgo(14) : null;
    const open30d = daysSinceLaunch >= 30 ? priceNDaysAgo(30) : null;
    const allTimeChange = pctChange(TOKEN.launchPrice);

    return {
      priceChange7d: pctChange(open7d),
      priceChange14d: pctChange(open14d),
      priceChange30d: pctChange(open30d),
      priceChangeAllTime: allTimeChange,
      daysSinceLaunch,
      currentPriceFromCandles: currentPrice,
      fetchedAt: now,
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
        "Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  }
  const data = await fetchHistory();
  if (data.fresh) {
    cached = { data, expiresAt: now + CACHE_TTL_MS };
  } else if (cached) {
    // Upstream failure but we have stale data — serve it with a short
    // SWR so the next miss retries soon.
    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control":
          "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": data.fresh
        ? "public, s-maxage=300, stale-while-revalidate=600"
        : "public, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
