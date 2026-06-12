// /api/token-holders — fetches the current holder count via a Cloudflare
// Worker proxy (turboloop-holders.turbo-loop-official.workers.dev).
//
// Why a proxy? BscScan blocks Vercel datacenter IPs even with full browser
// headers. The Cloudflare Worker runs on Cloudflare's network which is not
// blocked, so it can scrape BscScan and return clean JSON.
//
// Cache: 30-min in-memory TTL on the Next.js side; the Worker itself also
// caches for 30 min. On failure we serve stale cache if available; if
// nothing is cached we return { holders: null, fresh: false } and the
// widget renders "—" without breaking the rest of the supply panel.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WORKER_URL =
  "https://turboloop-holders.turbo-loop-official.workers.dev/";

export interface TokenHoldersData {
  holders: string | null;
  holdersNum: number | null;
  fetchedAt: number;
  fresh: boolean;
}

let cached: { data: TokenHoldersData; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30 * 60_000;

function emptyResponse(): TokenHoldersData {
  return { holders: null, holdersNum: null, fetchedAt: Date.now(), fresh: false };
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

  const data = await fetchFromWorker();

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
