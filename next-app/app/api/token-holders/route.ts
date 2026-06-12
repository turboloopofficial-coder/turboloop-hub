// /api/token-holders — scrapes the BscScan token page for the current
// holder count. BscScan exposes "Holders: <n>" in the og:description
// meta tag on the public token page, so no API key is needed and we
// avoid the paid V2 free-tier limits on BSC.
//
// Cache: 30-min in-memory TTL. BscScan itself only refreshes the
// holder count every few hours so a 5-min poll from the widget plus a
// 30-min server cache means the actual scrape fires only a few times
// per hour regardless of traffic.
//
// On failure we serve stale cache if available; if nothing is cached
// we return { holders: null, fresh: false } and the widget renders
// "—" without breaking the rest of the supply panel.

import { NextResponse } from "next/server";
import { TOKEN } from "@lib/tokenFacts";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const BSCSCAN_TOKEN_URL = `https://bscscan.com/token/${TOKEN.contract}`;

export interface TokenHoldersData {
  /** Display string, e.g. "1,234". null when scrape failed and no cache. */
  holders: string | null;
  /** Raw integer (no commas). null when scrape failed and no cache. */
  holdersNum: number | null;
  fetchedAt: number;
  fresh: boolean;
}

let cached: { data: TokenHoldersData; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30 * 60_000;

function emptyResponse(): TokenHoldersData {
  return {
    holders: null,
    holdersNum: null,
    fetchedAt: Date.now(),
    fresh: false,
  };
}

async function scrapeHolders(): Promise<TokenHoldersData> {
  try {
    const res = await fetch(BSCSCAN_TOKEN_URL, {
      signal: AbortSignal.timeout(10_000),
      headers: {
        // Full Chrome UA — BscScan returns a Cloudflare challenge page to
        // minimal or bot-like User-Agents. The full UA + Sec-Fetch headers
        // bypass the challenge from server-side fetch contexts.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
      redirect: "follow",
    });
    if (!res.ok) return emptyResponse();

    const html = await res.text();
    const match = html.match(/Holders:\s*([\d,]+)/);
    if (!match) return emptyResponse();

    const holdersStr = match[1];
    const holdersNum = parseInt(holdersStr.replace(/,/g, ""), 10);
    if (!Number.isFinite(holdersNum) || holdersNum < 0) return emptyResponse();

    // Re-format with commas in case BscScan ever ships a raw integer.
    const formatted = holdersNum.toLocaleString("en-US");

    return {
      holders: formatted,
      holdersNum,
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
        "Cache-Control":
          "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  }

  const data = await scrapeHolders();
  if (data.fresh) {
    cached = { data, expiresAt: now + CACHE_TTL_MS };
  } else if (cached) {
    // Upstream failed but we have an older successful read — keep
    // serving it with a shorter SWR so the next request retries soon.
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
        ? "public, s-maxage=1800, stale-while-revalidate=3600"
        : "public, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
