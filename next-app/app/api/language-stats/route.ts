// /api/language-stats — Track and return language usage statistics.
//
// GET: Returns language codes sorted by popularity (page views).
//      Uses a simple in-memory counter that persists within the Edge
//      function instance. For a production system, this would be backed
//      by a database or analytics service. We use GA4 data as the
//      ground truth and supplement with real-time tracking.
//
// POST: Records a page view for a given locale.
//       Body: { locale: string }
//
// The auto-prioritization system uses these stats to dynamically
// reorder language lists across the site.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// In-memory popularity scores. Seeded with approximate relative
// popularity based on GA4 data and community size. These persist
// within a single Edge function instance and reset on cold start.
// For true persistence, integrate with a KV store or database.
const POPULARITY_SCORES: Record<string, number> = {
  en: 10000,  // English — always highest baseline
  hi: 4500,   // Hindi — large Indian community
  th: 3800,   // Thai — very active
  id: 3200,   // Indonesian — large community
  bn: 2800,   // Bangla — growing fast
  ko: 2500,   // Korean
  ur: 2200,   // Urdu — Pakistan
  ar: 2000,   // Arabic
  es: 1800,   // Spanish
  de: 1600,   // German
  tr: 1500,   // Turkish — new, growing
  fr: 1400,   // French
  ta: 1200,   // Tamil
  zh: 1100,   // Chinese
  it: 1000,   // Italian
  pcm: 900,   // Nigerian Pidgin
  lo: 800,    // Lao
};

export async function GET() {
  // Return languages sorted by popularity (descending)
  const sorted = Object.entries(POPULARITY_SCORES)
    .sort(([, a], [, b]) => b - a)
    .map(([code, score]) => ({ code, score }));

  return NextResponse.json(
    { languages: sorted, updatedAt: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const locale = body?.locale;
    if (typeof locale === "string" && locale in POPULARITY_SCORES) {
      POPULARITY_SCORES[locale] = (POPULARITY_SCORES[locale] || 0) + 1;
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}
