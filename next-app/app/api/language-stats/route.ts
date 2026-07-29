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

// Simple in-memory rate limiter — max 5 POST requests per IP per minute.
// Edge runtime: each edge replica has its own memory, so this is a
// per-replica limit. Good enough to stop naive abuse without Redis.
const RATE_MAP = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

export async function POST(req: NextRequest) {
  // Rate limiting by IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const entry = RATE_MAP.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= RATE_LIMIT) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }
    entry.count++;
  } else {
    RATE_MAP.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
  }
  // Clean up old entries periodically (1% chance per request)
  if (Math.random() < 0.01) {
    for (const [k, v] of RATE_MAP) {
      if (now > v.resetAt) RATE_MAP.delete(k);
    }
  }
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
