import type { IncomingMessage, ServerResponse } from "node:http";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { blogPosts, videos } from "../../drizzle/schema";

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

function slugFromReelUrl(directUrl: string): string | null {
  try {
    const u = new URL(directUrl);
    const m = u.pathname.match(/\/reels\/([a-z0-9-]+)\.mp4$/i);
    return m ? m[1] : null;
  } catch { return null; }
}

function thumbForReel(directUrl: string): string {
  try {
    const u = new URL(directUrl);
    u.pathname = u.pathname.replace(/^\/reels\//, "/reel-thumbs/").replace(/\.mp4$/i, ".jpg");
    return u.toString();
  } catch { return ""; }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL not set");
    const db = drizzle(neon(url));

    type Entry = {
      loc: string;
      lastmod: string;
      priority: string;
      changefreq: string;
      images?: Array<{ loc: string; title?: string }>;
      videos?: Array<{ thumbnail: string; title: string; description: string; contentLoc?: string; duration?: string }>;
    };
    const urls: Entry[] = [];

    // Static routes
    for (const s of STATIC_ROUTES) {
      urls.push({ loc: `${SITE}${s.path}`, lastmod: new Date().toISOString(), priority: s.priority, changefreq: s.changefreq });
    }

    // Blog posts (published only) — with per-blog OG image
    const publishedPosts = await db.select().from(blogPosts).where(eq(blogPosts.published, true));
    for (const p of publishedPosts) {
      // Use scheduled_publish_at as lastmod if present (real publish date), else updated/created
      const lastmodDate = p.updatedAt || p.scheduledPublishAt || p.createdAt;
      urls.push({
        loc: `${SITE}/blog/${p.slug}`,
        lastmod: iso(lastmodDate),
        priority: "0.8",
        changefreq: "weekly",
        images: [{
          loc: p.coverImage || `${SITE}/api/og?slug=${p.slug}`,
          title: p.title,
        }],
      });
    }

    // Reels (each as its own URL with VideoObject schema)
    const allVideos = await db.select().from(videos);
    for (const v of allVideos) {
      // Reel = directUrl-only video (no youtubeUrl)
      if (v.directUrl && !v.youtubeUrl) {
        const slug = slugFromReelUrl(v.directUrl);
        if (slug) {
          urls.push({
            loc: `${SITE}/reels/${slug}`,
            lastmod: iso(v.createdAt),
            priority: "0.7",
            changefreq: "monthly",
            videos: [{
              thumbnail: thumbForReel(v.directUrl),
              title: v.title,
              description: `${v.title} — short explainer from Turbo Loop.`,
              contentLoc: v.directUrl,
            }],
          });
        }
      }
    }

    // Build XML with image: + video: namespaces
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
      `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n` +
      `        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n` +
      urls.map(u => {
        let entry = `  <url>\n` +
          `    <loc>${esc(u.loc)}</loc>\n` +
          `    <lastmod>${u.lastmod}</lastmod>\n` +
          `    <changefreq>${u.changefreq}</changefreq>\n` +
          `    <priority>${u.priority}</priority>\n`;
        if (u.images) {
          for (const img of u.images) {
            entry += `    <image:image>\n` +
              `      <image:loc>${esc(img.loc)}</image:loc>\n` +
              (img.title ? `      <image:title>${esc(img.title)}</image:title>\n` : "") +
              `    </image:image>\n`;
          }
        }
        if (u.videos) {
          for (const vid of u.videos) {
            entry += `    <video:video>\n` +
              `      <video:thumbnail_loc>${esc(vid.thumbnail)}</video:thumbnail_loc>\n` +
              `      <video:title>${esc(vid.title)}</video:title>\n` +
              `      <video:description>${esc(vid.description)}</video:description>\n` +
              (vid.contentLoc ? `      <video:content_loc>${esc(vid.contentLoc)}</video:content_loc>\n` : "") +
              `    </video:video>\n`;
          }
        }
        entry += `  </url>`;
        return entry;
      }).join("\n") +
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
