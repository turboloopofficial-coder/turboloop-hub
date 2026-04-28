// RSS 2.0 feed for blog posts.
// Helps with: SEO discovery, content syndication, RSS readers, IFTTT/Zapier feeds,
// Telegram channel auto-posting, Twitter auto-share via tools like Buffer.

import type { IncomingMessage, ServerResponse } from "node:http";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc } from "drizzle-orm";
import { blogPosts } from "../../drizzle/schema";

const SITE = "https://turboloop.tech";

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(d: Date | null | undefined): string {
  return (d ? new Date(d) : new Date()).toUTCString();
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL not set");
    const db = drizzle(neon(url));

    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.scheduledPublishAt))
      .limit(20);

    const items = posts.map((p) => {
      const link = `${SITE}/blog/${p.slug}`;
      const pub = p.scheduledPublishAt || p.createdAt;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <pubDate>${rfc822(pub)}</pubDate>
      ${p.excerpt ? `<description>${esc(p.excerpt)}</description>` : ""}
      <enclosure url="${SITE}/api/og?slug=${esc(p.slug)}" type="image/svg+xml" />
      <author>turboloop@turboloop.tech (Turbo Loop)</author>
      <category>DeFi</category>
    </item>`;
    }).join("\n");

    const lastBuildDate = rfc822(posts[0]?.scheduledPublishAt || new Date());

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Turbo Loop Blog</title>
    <link>${SITE}/feed</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Stories, strategies, and deep dives from Turbo Loop — the complete DeFi ecosystem on Binance Smart Chain.</description>
    <language>en</language>
    <copyright>Copyright © Turbo Loop ${new Date().getFullYear()}</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png</url>
      <title>Turbo Loop</title>
      <link>${SITE}</link>
    </image>
${items}
  </channel>
</rss>`;

    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=600, s-maxage=600, stale-while-revalidate=3600");
    res.statusCode = 200;
    res.end(xml);
  } catch (err: any) {
    console.error("[rss]", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end(`rss error: ${err?.message || err}`);
  }
}
