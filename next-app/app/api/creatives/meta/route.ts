// /api/creatives/meta — returns categories + languages for the filter bar.
// Called once on mount by the UnifiedCreativesGrid component so the filter
// tabs can render without fetching all 1,134+ items.
//
// Response:
//   {
//     categories: UnifiedCategoryDef[],
//     languages: { code, label, flag }[],
//     total: number,
//   }
//
// Long cache: categories change only when new banner sets are uploaded,
// so 10-minute CDN cache is safe. The stale-while-revalidate window
// means the filter bar never blocks on a cold cache miss.

import { NextResponse } from "next/server";
import {
  UNIFIED_CATEGORIES,
  UNIFIED_LANGUAGES,
  TOTAL_CREATIVES,
} from "@lib/unifiedCreativesData";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json(
    {
      categories: UNIFIED_CATEGORIES,
      languages: UNIFIED_LANGUAGES,
      total: TOTAL_CREATIVES,
    },
    {
      headers: {
        // 10-minute CDN cache — categories change rarely.
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
      },
    }
  );
}
