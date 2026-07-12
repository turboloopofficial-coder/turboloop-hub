// /api/language-stats — Track and return language usage statistics.
//
// GET: Returns language codes sorted by popularity (page views),
//      plus actual post counts from the database.
//
// POST: Records a page view for a given locale.
//       Body: { locale: string }
import { NextRequest, NextResponse } from "next/server";
import { api, BLOG_LANGUAGES, type BlogLanguage } from "@lib/api";

export const runtime = "edge";
export const revalidate = 300; // 5 min cache

// In-memory popularity scores. Seeded with approximate relative
// popularity based on GA4 data and community size.
const POPULARITY_SCORES: Record<string, number> = {
  en: 10000,
  hi: 4500,
  th: 3800,
  id: 3200,
  bn: 2800,
  ko: 2500,
  ur: 2200,
  ar: 2000,
  es: 1800,
  de: 1600,
  tr: 1500,
  fr: 1400,
  ta: 1200,
  zh: 1100,
  it: 1000,
  pcm: 900,
  lo: 800,
};

// Map DB language codes to frontend locale codes
const DB_TO_LOCALE: Record<string, string> = {
  en: "en", hi: "hi", th: "th", id: "id", bn: "bn",
  ko: "ko", pk: "ur", sa: "ar", es: "es", de: "de",
  tr: "tr", fr: "fr", ta: "ta", cn: "zh", it: "it",
  ng: "pcm", la: "lo", kr: "ko",
};

export async function GET() {
  // Fetch all posts and count by language
  let postCounts: Record<string, number> = {};
  try {
    const posts = await api.blogPosts();
    for (const post of posts) {
      if (post.published) {
        const locale = DB_TO_LOCALE[post.language] || post.language;
        postCounts[locale] = (postCounts[locale] || 0) + 1;
      }
    }
  } catch {
    // If DB fetch fails, return empty counts
    postCounts = {};
  }

  // Return languages sorted by popularity (descending) with post counts
  const sorted = Object.entries(POPULARITY_SCORES)
    .sort(([, a], [, b]) => b - a)
    .map(([code, score]) => ({
      code,
      score,
      postCount: postCounts[code] || 0,
      name: code, // Frontend resolves display name from locale
    }));

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
