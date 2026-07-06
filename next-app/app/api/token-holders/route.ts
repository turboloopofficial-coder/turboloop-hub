// /api/token-holders — serves the TURBO token holder count.
//
// Primary source: `cache:token_holders` row in site_settings DB.
// The cron-token-data handler (turboloop-hub project) fetches from
// BscScan every 5 minutes and writes this row.
//
// Fallback chain:
//   1. DB cache (fresh < 2h) → return immediately
//   2. Direct BscScan fetch (may work from some Vercel regions)
//   3. Cloudflare Worker proxy
//   4. Stale DB cache (any age) — ALWAYS prefer stale data over null
//
// Fix (Jul 2026): Previously the API returned { holders: null } when
// all live fetches failed AND the DB cache was stale. This caused the
// token page to show "—" even though we had a perfectly valid (if
// slightly old) holder count in the DB. Now we always return the stale
// DB value as a last resort. A 2-day-old count is infinitely better
// than null.

import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { siteSettings } from "../../../drizzle/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTRACT = "0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3";
const BSCSCAN_AJAX_URL = `https://bscscan.com/token/generic-tokenholders2?m=normal&a=${CONTRACT}&s=0&sid=0&l=10&p=1&f=0&mode=&chainid=56`;
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
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
};

function emptyResponse(): TokenHoldersData {
  return { holders: null, holdersNum: null, fetchedAt: Date.now(), fresh: false };
}

function parseHolders(html: string): string | null {
  const m1 = html.match(/total of ([\d,]+) holder/i);
  if (m1) return m1[1].replace(/,/g, "");
  const m2 = html.match(/Holders:\s*([\d,]+)/i);
  if (m2) return m2[1].replace(/,/g, "");
  return null;
}

interface DBResult {
  fresh: TokenHoldersData;
  stale: TokenHoldersData | null;
}

/** Reads the DB cache and returns both a fresh-or-empty result AND the raw
 *  stale value so we can use it as a last-resort fallback. */
async function fetchFromDB(): Promise<DBResult> {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return { fresh: emptyResponse(), stale: null };
    const sql = neon(dbUrl);
    const db = drizzle(sql);
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, "cache:token_holders"))
      .limit(1);
    if (!rows.length || !rows[0].settingValue) return { fresh: emptyResponse(), stale: null };
    const parsed = JSON.parse(rows[0].settingValue) as TokenHoldersData;
    if (!parsed.holdersNum || parsed.holdersNum <= 0) return { fresh: emptyResponse(), stale: null };

    const ageMs = Date.now() - new Date(parsed.fetchedAt as unknown as string).getTime();
    const isStale = ageMs > 2 * 60 * 60_000; // 2 hours

    const result: TokenHoldersData = { ...parsed, fresh: !isStale };

    if (!isStale) {
      // Fresh — use directly, no need for stale fallback
      return { fresh: result, stale: null };
    }
    // Stale — return empty as "fresh" result (triggers live fetch attempts)
    // but keep the stale value so we can fall back to it if live fetches fail.
    return { fresh: emptyResponse(), stale: result };
  } catch {
    return { fresh: emptyResponse(), stale: null };
  }
}

async function fetchDirect(): Promise<TokenHoldersData> {
  for (const url of [BSCSCAN_AJAX_URL, BSCSCAN_TOKEN_URL]) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(12_000),
        headers: BROWSER_HEADERS,
        cache: "no-store",
      });
      // Read body even on 403 — Cloudflare challenge pages still embed
      // the holder count in the meta description tag.
      if (!res.ok && res.status !== 403) continue;
      const html = await res.text();
      if (html.length < 200) continue;
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

  // Serve in-memory cache if still valid
  if (cached && cached.expiresAt > now) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" },
    });
  }

  // 1. Try DB cache (populated by cron-token-data every 5 min)
  const { fresh: dbFresh, stale: dbStale } = await fetchFromDB();
  let data = dbFresh;

  // 2. Try direct BscScan fetch (may work from some Vercel regions)
  if (!data.fresh) {
    data = await fetchDirect();
  }

  // 3. Fall back to Cloudflare Worker
  if (!data.fresh) {
    data = await fetchFromWorker();
  }

  // 4. Last resort: serve stale DB value rather than returning null.
  //    A slightly old holder count is always better than showing "—".
  if (!data.fresh && dbStale) {
    data = dbStale;
  }

  if (data.fresh || (data.holdersNum && data.holdersNum > 0)) {
    // Cache in-memory for 30 min if we got any real value
    cached = { data, expiresAt: now + CACHE_TTL_MS };
  } else if (cached) {
    // Still have an old in-memory cache — return it
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control":
        data.fresh
          ? "public, s-maxage=1800, stale-while-revalidate=3600"
          : "public, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
