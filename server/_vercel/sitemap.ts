import type { IncomingMessage, ServerResponse } from "node:http";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { blogPosts, videos } from "../../drizzle/schema";

const SITE = "https://turboloop.tech";
const R2_BASE = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

// 20 cinematic films — kept inline rather than imported from client/ to keep this Edge bundle small.
// Each entry generates one /films/:slug URL with full <video:video> metadata.
const CINEMATIC_FILMS: Array<{ slug: string; title: string; description: string }> = [
  { slug: "bank-is-lying", title: "Your Bank is Lying to You", description: "They make billions. You make pennies. The 0.01% lie, exposed." },
  { slug: "where-does-money-go", title: "Where Does Your Money Actually Go?", description: "You take 100% of the inflation risk. They take 99.9% of the profit." },
  { slug: "inflation-trap", title: "The Inflation Trap", description: "Your savings account is a slow-motion losing trade." },
  { slug: "why-rich-stay-rich", title: "Why the Rich Stay Rich and You Don't", description: "Same yield strategies. No minimums. No gatekeepers." },
  { slug: "system-not-built-for-you", title: "The System Was Never Built for You", description: "Designed in 1913. By the powerful. For the powerful." },
  { slug: "what-is-turboloop", title: "What is TurboLoop?", description: "No bank. No broker. Just you and the code." },
  { slug: "smart-contract-bank-manager", title: "The Smart Contract — Your New Bank Manager", description: "It cannot be bribed. It cannot make mistakes." },
  { slug: "54-percent-real-math", title: "How 54% is Real Math, Not Magic", description: "Concentrated liquidity. 10x to 50x amplified fees." },
  { slug: "20-level-network", title: "The 20-Level Network — Your Digital Empire", description: "You build it once. It generates while you sleep." },
  { slug: "stablecoins-stay-safe", title: "Stablecoins — Why Your Money Stays Safe", description: "Pegged to the dollar. Built for boring stability." },
  { slug: "code-is-law", title: "Code is Law — The Transparency Promise", description: "You don't trust. You verify." },
  { slug: "myth-buster-ponzi", title: "The Myth Buster — Ponzi vs. Real Yield", description: "Yield comes from real trades. Not recruitment." },
  { slug: "blockchain-never-lies-film", title: "The Blockchain Never Lies", description: "Most complete financial record in human history." },
  { slug: "unbreakable-vault", title: "Security, Audits, and the Unbreakable Vault", description: "Immutable. Renounced. No backdoor. No kill switch." },
  { slug: "defi-vs-banks", title: "DeFi vs. Banks — The Final Comparison", description: "Open 24/7/365. 3-5 seconds. Up to 54%. You keep it all." },
  { slug: "global-revolution-lagos-london", title: "The Global Revolution — From Lagos to London", description: "Geography no longer determines your destiny." },
  { slug: "compounding-secret", title: "The Compounding Secret — Time is Your Weapon", description: "Your yield earns yield. The math accelerates." },
  { slug: "build-your-legacy", title: "Build Your Legacy — Generational Wealth", description: "An inheritance that cannot be seized or inflated." },
  { slug: "leadership-path", title: "The Leadership Path — From Member to Leader", description: "Educate before you recruit. Create more leaders, not followers." },
  { slug: "manifesto", title: "The TurboLoop Manifesto — Join the Sovereign Movement", description: "Your Money. Your Power. Your Future." },
];

const STATIC_ROUTES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/feed", priority: "0.9", changefreq: "daily" },
  // Phase 1 — main topic pages
  { path: "/security", priority: "0.85", changefreq: "weekly" },
  { path: "/community", priority: "0.85", changefreq: "daily" },
  { path: "/creatives", priority: "0.8", changefreq: "weekly" },
  { path: "/roadmap", priority: "0.8", changefreq: "weekly" },
  // Phase 2 — additional pages
  { path: "/promotions", priority: "0.8", changefreq: "weekly" },
  { path: "/library", priority: "0.8", changefreq: "daily" },
  { path: "/faq", priority: "0.7", changefreq: "monthly" },
  // Ecosystem hub + 6 sub-pages
  { path: "/ecosystem", priority: "0.85", changefreq: "weekly" },
  { path: "/ecosystem/turbo-buy", priority: "0.75", changefreq: "monthly" },
  { path: "/ecosystem/turbo-swap", priority: "0.75", changefreq: "monthly" },
  { path: "/ecosystem/yield-farming", priority: "0.75", changefreq: "monthly" },
  { path: "/ecosystem/referral-network", priority: "0.75", changefreq: "monthly" },
  { path: "/ecosystem/leadership-program", priority: "0.75", changefreq: "monthly" },
  { path: "/ecosystem/smart-contract-security", priority: "0.75", changefreq: "monthly" },
  // Cinematic Universe hub
  { path: "/films", priority: "0.85", changefreq: "weekly" },
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
      // Reel = directUrl-only video (no youtubeUrl) AND NOT cinematic (cinematic films are listed separately below)
      if (v.directUrl && !v.youtubeUrl && v.category !== "cinematic") {
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

    // Cinematic Universe — 20 films, each with its own /films/:slug URL + full <video:video> schema
    for (const f of CINEMATIC_FILMS) {
      const videoUrl = `${R2_BASE}/cinematic/${f.slug}.mp4`;
      const thumbUrl = `${R2_BASE}/cinematic-thumbs/${f.slug}.jpg`;
      urls.push({
        loc: `${SITE}/films/${f.slug}`,
        lastmod: new Date().toISOString(),
        priority: "0.8",
        changefreq: "monthly",
        images: [{ loc: thumbUrl, title: f.title }],
        videos: [{
          thumbnail: thumbUrl,
          title: f.title,
          description: f.description,
          contentLoc: videoUrl,
        }],
      });
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
