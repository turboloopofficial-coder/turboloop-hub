import type { IncomingMessage, ServerResponse } from "node:http";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { blogPosts, videos, presentations } from "../../drizzle/schema";

const SITE = "https://turboloop.tech";
const STATIC_ROUTES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/feed", priority: "0.9", changefreq: "daily" },
];

function iso(d: Date | null | undefined): string {
  if (!d) return new Date().toISOString();
  try { return new Date(d).toISOString(); } catch { return new Date().toISOString(); }
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL not set");
    const db = drizzle(neon(url));

    const urls: Array<{ loc: string; lastmod: string; priority: string; changefreq: string }> = [];

    for (const s of STATIC_ROUTES) {
      urls.push({ loc: `${SITE}${s.path}`, lastmod: new Date().toISOString(), priority: s.priority, changefreq: s.changefreq });
    }

    // Blog posts (published only)
    const publishedPosts = await db.select().from(blogPosts).where(eq(blogPosts.published, true));
    for (const p of publishedPosts) {
      urls.push({
        loc: `${SITE}/blog/${p.slug}`,
        lastmod: iso(p.updatedAt || p.createdAt),
        priority: "0.8",
        changefreq: "weekly",
      });
    }

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map(u =>
        `  <url>\n` +
        `    <loc>${esc(u.loc)}</loc>\n` +
        `    <lastmod>${u.lastmod}</lastmod>\n` +
        `    <changefreq>${u.changefreq}</changefreq>\n` +
        `    <priority>${u.priority}</priority>\n` +
        `  </url>`
      ).join("\n") +
      `\n</urlset>\n`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400");
    res.statusCode = 200;
    res.end(xml);
  } catch (err: any) {
    console.error("[sitemap]", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end(`sitemap error: ${err?.message || err}`);
  }
}
