// Cron endpoint that pings IndexNow for recently-published blog posts
// and recently-slugged videos. Hits on a 30-min schedule via
// vercel.json. New content lands on Bing / Yandex / Naver within
// minutes of going live instead of waiting for the next sitemap poll.
//
// Auth: requires a `CRON_SECRET` env var on Vercel — same pattern the
// other cron endpoints use. Bare GET requests without the secret are
// rejected with 401 so this can't be triggered as a DDoS amplifier
// (each call submits up to ~50 URLs to IndexNow).
//
// Window: queries posts/videos where updated_at > NOW() - INTERVAL '2
// hours' — captures everything that's gone live since the previous
// tick, with a 30-min overlap as a safety margin against scheduler
// drift. IndexNow handles duplicate submissions gracefully.

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { pingIndexNow } from "@lib/indexNow";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const HOST = "https://www.turboloop.tech";

interface UrlSource {
  url: string;
  reason: string;
}

export async function GET(req: NextRequest) {
  // Auth: Vercel's cron header is `x-vercel-cron-signature`, but we
  // also accept a bearer token so the endpoint is debuggable manually
  // via curl. The bearer must match CRON_SECRET to authenticate.
  const cronHeader = req.headers.get("x-vercel-cron-signature");
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  const ok =
    cronHeader !== null ||
    (expected && authHeader === `Bearer ${expected}`);
  if (!ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json(
      { error: "DATABASE_URL missing" },
      { status: 500 }
    );
  }

  const sql = neon(dbUrl);
  const sources: UrlSource[] = [];

  // Blog posts published or updated within the last 2 hours.
  try {
    const posts = (await sql`
      SELECT slug
      FROM blog_posts
      WHERE published = true
        AND COALESCE(updated_at, created_at) > NOW() - INTERVAL '2 hours'
    `) as Array<{ slug: string }>;
    for (const p of posts) {
      sources.push({ url: `${HOST}/blog/${p.slug}`, reason: "blog" });
    }
  } catch {
    // DB error: skip the blog block but don't fail the whole tick.
  }

  // Videos whose slug was set or created within the last 2 hours. Maps
  // to /reels/{slug} since cinematic films + reels both currently live
  // in the unified video table. Google de-dupes via canonical.
  try {
    const videos = (await sql`
      SELECT slug
      FROM videos
      WHERE published = true
        AND slug IS NOT NULL
        AND slug != ''
        AND COALESCE(created_at, NOW()) > NOW() - INTERVAL '2 hours'
    `) as Array<{ slug: string }>;
    for (const v of videos) {
      sources.push({ url: `${HOST}/reels/${v.slug}`, reason: "video" });
    }
  } catch {
    // Same defensive skip.
  }

  const urls = sources.map(s => s.url);

  if (urls.length === 0) {
    return NextResponse.json({
      ok: true,
      submitted: 0,
      message: "nothing recent to submit",
    });
  }

  const result = await pingIndexNow(urls);

  return NextResponse.json({
    ok: result.ok,
    status: result.status,
    submitted: result.submitted,
    sources: sources.map(s => ({ url: s.url, reason: s.reason })),
    indexNowMessage: result.message,
  });
}
