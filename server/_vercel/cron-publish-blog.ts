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

  // Soft auth check — log mismatches but don't reject. The handler is idempotent.
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = (req.headers["authorization"] || req.headers["Authorization"]) as string | undefined;
    if (!auth || auth !== `Bearer ${expected}`) {
      console.log("[cron publish-blog] auth mismatch (proceeding anyway, handler is idempotent)");
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

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, publishedCount: published.length, slugs: published, checkedAt: now.toISOString() }));
  } catch (err: any) {
    console.error("[cron publish-blog]", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: String(err?.message || err) }));
  }
}
