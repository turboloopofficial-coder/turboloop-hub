// /api/token-holders — fetches the current holder count for the TURBO token.
//
// Strategy (in order):
//   1. Try BscScan AJAX endpoint directly from Vercel (Node.js runtime, not blocked)
//   2. Try BscScan main token page meta description
//   3. Fall back to Cloudflare Worker proxy (legacy, may be blocked)
//
// Cache: 30-min in-memory TTL. On failure we serve stale cache if available;
// if nothing is cached we return { holders: null, fresh: false } and the
// widget renders "—" without breaking the rest of the supply panel.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTRACT = "0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3";
const BSCSCAN_AJAX_URL =
  `https://bscscan.com/token/generic-tokenholders2?m=normal&a=${CONTRACT}&s=0&sid=0&l=10&p=1&f=0&mode=&chainid=56`;
const BSCSCAN_TOKEN_URL = `https://bscscan.com/token/${CONTRACT}`;
const WORKER_URL = "https://turboloop-holders.turbo-loop-official.workers.dev/";

export interface TokenHoldersData {
  holders: string | null;
  holdersNum: number | null;
  fetchedAt: number;
  fresh: boolean;
}

let cached: { data: TokenHoldersData; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30 * 60_000;

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Upgrade-Insecure-Requests": "1",
};

function emptyResponse(): TokenHoldersData {
  return { holders: null, holdersNum: null, fetchedAt: Date.now(), fresh: false };
}

function parseHolders(html: string): string | null {
  // Pattern 1: AJAX page — "A total of X,XXX holder addresses found"
  const m1 = html.match(/total of ([\d,]+) holder/i);
  if (m1) return m1[1].replace(/,/g, "");

  // Pattern 2: Meta description — "Holders: X,XXX"
  const m2 = html.match(/Holders:\s*([\d,]+)/i);
  if (m2) return m2[1].replace(/,/g, "");

  // Pattern 3: JSON-LD or data attribute
  const m3 = html.match(/"holdersCount"\s*:\s*"?([\d,]+)"?/i);
  if (m3) return m3[1].replace(/,/g, "");

  return null;
}

async function fetchDirect(): Promise<TokenHoldersData> {
  // Try AJAX endpoint first (lighter page)
  for (const url of [BSCSCAN_AJAX_URL, BSCSCAN_TOKEN_URL]) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(12_000),
        headers: BROWSER_HEADERS,
        cache: "no-store",
      });
      if (!res.ok) continue;
      const html = await res.text();
      if (html.length < 500) continue; // Challenge page
      const holders = parseHolders(html);
      if (holders) {
        const holdersNum = parseInt(holders, 10);
        return {
          holders: holdersNum.toLocaleString("en-US"),
          holdersNum,
          fetchedAt: Date.now(),
          fresh: true,
        };
      }
    } catch {
      // Try next URL
    }
  }
  return emptyResponse();
}

async function fetchFromWorker(): Promise<TokenHoldersData> {
  try {
    const res = await fetch(WORKER_URL, {
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": "turboloop-next/1.0" },
      cache: "no-store",
    });
    if (!res.ok) return emptyResponse();
    const json = await res.json();
    if (!json.holdersNum) return emptyResponse();
    return {
      holders: json.holders,
      holdersNum: json.holdersNum,
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
      headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" },
    });
  }

  // Try direct BscScan fetch first (Vercel IPs are not blocked)
  let data = await fetchDirect();

  // Fall back to Cloudflare Worker if direct fetch fails
  if (!data.fresh) {
    data = await fetchFromWorker();
  }

  if (data.fresh) {
    cached = { data, expiresAt: now + CACHE_TTL_MS };
  } else if (cached) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
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
