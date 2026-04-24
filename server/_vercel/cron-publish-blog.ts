import type { IncomingMessage, ServerResponse } from "node:http";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq, lte, isNotNull } from "drizzle-orm";
import { blogPosts } from "../../drizzle/schema";

/**
 * Daily cron job — publishes any blog post whose scheduledPublishAt <= now() and not yet published.
 *
 * Secured via CRON_SECRET env var (Vercel auto-adds a bearer token for cron invocations).
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json");

  // Auth check — Vercel cron sends `authorization: Bearer <CRON_SECRET>`
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = (req.headers["authorization"] || req.headers["Authorization"]) as string | undefined;
    if (!auth || auth !== `Bearer ${expected}`) {
      res.statusCode = 401;
      res.end(JSON.stringify({ ok: false, error: "unauthorized" }));
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

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, publishedCount: published.length, slugs: published, checkedAt: now.toISOString() }));
  } catch (err: any) {
    console.error("[cron publish-blog]", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: String(err?.message || err) }));
  }
}
