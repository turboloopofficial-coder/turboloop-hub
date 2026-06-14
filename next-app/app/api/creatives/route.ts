// /api/creatives — paginated, filterable creatives endpoint.
//
// GET params:
//   page       — 1-based page number (default: 1)
//   pageSize   — items per page (default: 48, max: 96)
//   category   — category slug filter (default: "all")
//   lang       — language code filter (default: "all")
//   q          — search query (matches title, alt, categoryLabel)
//
// Response:
//   {
//     items: UnifiedCreative[],
//     total: number,       // total matching items (after filters)
//     page: number,
//     pageSize: number,
//     hasMore: boolean,
//   }
//
// The full dataset (~1.7 MB of JSON) is imported once at module level and
// cached in the Edge function's memory. Subsequent requests within the same
// instance pay zero I/O cost. The initial page load of /creatives now only
// needs to fetch 48 items instead of serialising all 1,134+ into the HTML.
//
// Cache headers: 60s CDN cache (stale-while-revalidate 300s) so Vercel's
// edge network absorbs burst traffic without hitting the function.

import { NextRequest, NextResponse } from "next/server";
import {
  ALL_UNIFIED_CREATIVES,
  UNIFIED_CATEGORIES,
  UNIFIED_LANGUAGES,
  type UnifiedCreative,
  type UnifiedCategoryDef,
  type CreativeLanguage,
} from "@lib/unifiedCreativesData";

export const runtime = "edge";

const DEFAULT_PAGE_SIZE = 48;
const MAX_PAGE_SIZE = 96;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // ── Parse params ──────────────────────────────────────────────────
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
  );
  const category = searchParams.get("category") ?? "all";
  const lang = (searchParams.get("lang") ?? "all") as CreativeLanguage | "all";
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  // ── Filter ────────────────────────────────────────────────────────
  let filtered: UnifiedCreative[] = ALL_UNIFIED_CREATIVES;

  if (category !== "all") {
    filtered = filtered.filter(i => i.categoryId === category);
  }
  if (lang !== "all") {
    filtered = filtered.filter(i => i.language === lang);
  }
  if (q) {
    filtered = filtered.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.categoryLabel.toLowerCase().includes(q) ||
      i.alt.toLowerCase().includes(q)
    );
  }

  // ── Paginate ──────────────────────────────────────────────────────
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  const hasMore = start + pageSize < total;

  return NextResponse.json(
    { items, total, page, pageSize, hasMore },
    {
      headers: {
        // Cache at the CDN edge for 60s; serve stale for up to 5 min
        // while revalidating in the background. Creatives don't change
        // often so this is safe and dramatically reduces cold-start cost.
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}

// ── /api/creatives/meta — categories + languages for the filter bar ────────
// Exported separately so the page can fetch just the filter metadata
// without pulling any banner items. Called once on mount.
export async function HEAD() {
  // HEAD is used by the client to check if the endpoint is alive.
  return new NextResponse(null, { status: 200 });
}
