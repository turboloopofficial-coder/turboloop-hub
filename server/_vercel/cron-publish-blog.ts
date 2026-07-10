import type { IncomingMessage, ServerResponse } from "node:http";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq, lte, isNotNull } from "drizzle-orm";
import { blogPosts } from "../../drizzle/schema";

/**
 * Daily cron job — publishes any blog post whose scheduledPublishAt <= now() and not yet published.
 *
 * SECURITY MODEL: This handler is INTENTIONALLY safe to call without auth.
 *  - It's idempotent: only publishes posts whose scheduled time has passed.
 *  - The worst-case anonymous call just causes posts to publish a few seconds earlier.
 *  - This makes the system resilient: if Vercel's auto-bearer header doesn't match
 *    CRON_SECRET (typo, missing env, infra change), the cron still works.
 *
 * If CRON_SECRET is set AND the request came with a non-matching auth header,
 * we still allow it (no 401) — we just log the mismatch. Removing the strict
 * auth fixed a real bug where yesterday's post failed to publish.
 *
 * Backup: server/db.ts → listBlogPosts() also calls publishOverdueBlogs() on
 * every homepage load, so even if THIS cron never fires, posts still publish
 * (worst case: a few minutes late, when the next visitor hits the site).
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json");

  // SECURITY: Strict auth check — reject on mismatch. Idempotency does
  // not justify allowing unauthenticated database writes.
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = (req.headers["authorization"] || req.headers["Authorization"]) as string | undefined;
    if (!auth || auth !== `Bearer ${expected}`) {
      console.error("[cron publish-blog] REJECTED: auth mismatch");
      res.statusCode = 401;
      res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
      return;
    }
  }

  try {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL missing");
    const db = drizzle(neon(url));

    // Find all posts that should be published now
    const now = new Date();
    const due = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.published, false), isNotNull(blogPosts.scheduledPublishAt), lte(blogPosts.scheduledPublishAt, now)));

    const published: string[] = [];
    for (const post of due) {
      await db.update(blogPosts).set({ published: true }).where(eq(blogPosts.id, post.id));
      published.push(post.slug);
    }

    // Revalidate the Next.js ISR cache for the blog index and each new post
    // so visitors see the new content immediately without waiting for the
    // 5-minute ISR window. Best-effort: if this fails the post is still
    // published and ISR will pick it up within 5 minutes anyway.
    if (published.length > 0) {
      try {
        const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;
        const NEXT_HOST = "https://www.turboloop.tech";
        if (REVALIDATE_SECRET) {
          // Revalidate the blog index
          await fetch(`${NEXT_HOST}/api/revalidate-blog?secret=${encodeURIComponent(REVALIDATE_SECRET)}`);
          // Revalidate each individual post page
          for (const slug of published) {
            await fetch(`${NEXT_HOST}/api/revalidate-blog?secret=${encodeURIComponent(REVALIDATE_SECRET)}&slug=${encodeURIComponent(slug)}`);
          }
        }
      } catch (revalErr) {
        console.warn("[cron publish-blog] revalidation ping failed (non-fatal):", revalErr);
      }
    }

    // IndexNow ping — push the new URLs to Bing / Yandex / Naver
    // immediately on publish, rather than waiting for the 30-min
    // /api/cron/indexnow tick. Inline (not via a shared module)
    // because this is the legacy api/* bundle which can't import from
    // next-app/lib. Best-effort: if the ping fails the post is still
    // published, we just don't get the instant indexing benefit.
    let indexNow: { ok: boolean; status: number; submitted: number; message?: string } = {
      ok: true,
      status: 0,
      submitted: 0,
    };
    if (published.length > 0) {
      try {
        const INDEXNOW_KEY = "7f3a9c2e1b8d4f6a5e0c3b9d2f7a1e8c";
        const HOST = "www.turboloop.tech";
        const urlList = published.map(slug => `https://${HOST}/blog/${slug}`);
        const r = await fetch("https://api.indexnow.org/IndexNow", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            host: HOST,
            key: INDEXNOW_KEY,
            keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
            urlList,
          }),
        });
        indexNow = {
          ok: r.ok,
          status: r.status,
          submitted: urlList.length,
          message: r.ok ? undefined : await r.text().catch(() => undefined),
        };
      } catch (err) {
        indexNow = {
          ok: false,
          status: 0,
          submitted: 0,
          message: err instanceof Error ? err.message : String(err),
        };
      }
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, publishedCount: published.length, slugs: published, indexNow, checkedAt: now.toISOString() }));
  } catch (err: any) {
    console.error("[cron publish-blog]", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: String(err?.message || err) }));
  }
}
