// Per-route Open Graph meta server. Solves the SPA share-preview problem:
// when a user shares /reels/<slug> on Telegram/Twitter/etc, the social bot
// fetches the HTML and reads OG tags as-is — they don't run JavaScript. So
// our SPA's per-route meta updates (in SEOHead.tsx) never reach social
// previews; bots always saw the homepage's static OG tags from index.html.
//
// This handler intercepts requests from social bots (matched by user-agent
// in vercel.json rewrite) and returns a tiny HTML response with the right
// title/description/og:image for that specific URL.
//
// Real users (browsers) bypass this entirely — vercel.json's `has` clause
// only matches social bot UAs, so humans get the SPA as normal.

import type { IncomingMessage, ServerResponse } from "node:http";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { blogPosts, videos } from "../../drizzle/schema";

const SITE_ORIGIN = "https://turboloop.tech";
const DEFAULT_IMAGE = `${SITE_ORIGIN}/api/og-banner?type=launch`;
const LOGO =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png";

let _db: ReturnType<typeof drizzle> | null = null;
function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  _db = drizzle(neon(url));
  return _db;
}

interface Meta {
  title: string;
  description: string;
  image: string;
  type: "website" | "article" | "video.other";
  publishedTime?: string;
}

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function trim(s: string, max: number): string {
  if (!s) return s;
  if (s.length <= max) return s;
  return s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

/** Derive thumbnail URL from a reel video URL.
 *  Pattern: <r2>/reels/slug.mp4 → <r2>/reel-thumbs/slug.jpg */
function thumbForReelUrl(videoUrl: string): string {
  try {
    const u = new URL(videoUrl);
    u.pathname = u.pathname
      .replace(/^\/reels\//, "/reel-thumbs/")
      .replace(/\.mp4$/i, ".jpg");
    return u.toString();
  } catch {
    return "";
  }
}

function slugFromReelUrl(videoUrl: string): string {
  try {
    const u = new URL(videoUrl);
    const m = u.pathname.match(/\/reels\/([a-z0-9-]+)\.mp4$/i);
    return m ? m[1] : "";
  } catch {
    return "";
  }
}

async function metaForPath(path: string): Promise<Meta> {
  // Default fallback
  let meta: Meta = {
    title: "Turbo Loop — Sustainable DeFi Yield on BSC",
    description:
      "Audited, renounced, 100% LP-locked yield farming on Binance Smart Chain. Six DeFi primitives, one self-sustaining ecosystem.",
    image: DEFAULT_IMAGE,
    type: "website",
  };

  try {
    // /blog/:slug — fetch full post for rich preview
    const blogMatch = path.match(/^\/blog\/([^/?#]+)/);
    if (blogMatch) {
      const slug = decodeURIComponent(blogMatch[1]);
      const db = getDb();
      const rows = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);
      const post = rows[0];
      if (post) {
        meta = {
          title: trim(post.title, 90),
          description: trim(post.excerpt || post.title, 200),
          image:
            post.coverImage || `${SITE_ORIGIN}/api/og?slug=${encodeURIComponent(slug)}`,
          type: "article",
          publishedTime: post.createdAt
            ? new Date(post.createdAt).toISOString()
            : undefined,
        };
        return meta;
      }
    }

    // /reels/:slug — fetch the matching video by deriving slug from directUrl
    const reelMatch = path.match(/^\/reels\/([^/?#]+)/);
    if (reelMatch) {
      const slug = decodeURIComponent(reelMatch[1]);
      const db = getDb();
      const allVideos = await db.select().from(videos);
      const reel = allVideos.find(
        v => v.directUrl && slugFromReelUrl(v.directUrl) === slug
      );
      if (reel && reel.directUrl) {
        meta = {
          title: trim(`${reel.title} — Turbo Loop reel`, 90),
          description: trim(
            `Watch this short on Turbo Loop, the complete DeFi ecosystem on Binance Smart Chain.`,
            200
          ),
          image: thumbForReelUrl(reel.directUrl) || DEFAULT_IMAGE,
          type: "video.other",
        };
        return meta;
      }
    }

    // /films/:slug — cinematic films are static; we don't have access to the
    // client's TS data here without duplicating it. Use a slug-based title
    // and the dynamic film OG endpoint if you have one. Otherwise fallback.
    const filmMatch = path.match(/^\/films\/([^/?#]+)/);
    if (filmMatch) {
      const slug = decodeURIComponent(filmMatch[1])
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
      meta = {
        title: trim(`${slug} — TurboLoop Cinematic Universe`, 90),
        description:
          "Watch this short film from the TurboLoop Cinematic Universe — 20 films across 4 seasons.",
        image: DEFAULT_IMAGE,
        type: "video.other",
      };
      return meta;
    }

    // /topic/:tag — static, slugified label is good enough for the preview
    const topicMatch = path.match(/^\/topic\/([^/?#]+)/);
    if (topicMatch) {
      const tag = decodeURIComponent(topicMatch[1])
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
      meta = {
        title: trim(`${tag} — Turbo Loop Blog`, 90),
        description: `Articles on ${tag} from the Turbo Loop editorial.`,
        image: DEFAULT_IMAGE,
        type: "website",
      };
      return meta;
    }

    // /vs/:slug
    const vsMatch = path.match(/^\/vs\/([^/?#]+)/);
    if (vsMatch) {
      const slug = decodeURIComponent(vsMatch[1])
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
      meta = {
        title: trim(`Turbo Loop vs ${slug}`, 90),
        description: `Side-by-side comparison: Turbo Loop vs ${slug}. Sustainable DeFi yield on BSC.`,
        image: DEFAULT_IMAGE,
        type: "website",
      };
      return meta;
    }

    // /learn/:slug
    const learnMatch = path.match(/^\/learn\/([^/?#]+)/);
    if (learnMatch) {
      const slug = decodeURIComponent(learnMatch[1])
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
      meta = {
        title: trim(`${slug} — DeFi 101`, 90),
        description: `Plain-English DeFi explainer from Turbo Loop.`,
        image: DEFAULT_IMAGE,
        type: "article",
      };
      return meta;
    }

    // /ecosystem/:slug
    const ecoMatch = path.match(/^\/ecosystem\/([^/?#]+)/);
    if (ecoMatch) {
      const slug = decodeURIComponent(ecoMatch[1])
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
      meta = {
        title: trim(`${slug} — Turbo Loop Ecosystem`, 90),
        description: `Deep dive on ${slug}, one of the six pillars of the Turbo Loop ecosystem.`,
        image: DEFAULT_IMAGE,
        type: "website",
      };
      return meta;
    }
  } catch (err) {
    // DB error or anything else — fall through to default homepage meta
    console.error("[social-meta] error generating meta for", path, err);
  }

  return meta;
}

function buildHtml(path: string, meta: Meta): string {
  const url = `${SITE_ORIGIN}${path}`;
  const t = escapeHtml(meta.title);
  const d = escapeHtml(meta.description);
  const img = escapeHtml(meta.image);
  const type = escapeHtml(meta.type);
  const publishedTime = meta.publishedTime
    ? `<meta property="article:published_time" content="${escapeHtml(meta.publishedTime)}" />`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${t}</title>
    <meta name="title" content="${t}" />
    <meta name="description" content="${d}" />
    <link rel="canonical" href="${url}" />

    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Turbo Loop" />
    ${publishedTime}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${url}" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />
    <meta name="twitter:site" content="@TurboLoop_io" />

    <link rel="icon" type="image/png" href="${LOGO}" />
  </head>
  <body>
    <h1>${t}</h1>
    <p>${d}</p>
    <p><a href="${url}">View on TurboLoop.tech</a></p>
  </body>
</html>`;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    // The original request URL is preserved by Vercel rewrite — we read it
    // directly. Strip query string for path matching.
    const rawUrl = req.url || "/";
    const path = rawUrl.split("?")[0] || "/";

    const meta = await metaForPath(path);
    const html = buildHtml(path, meta);

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    // Cache aggressively at the edge — share previews don't change often.
    // Bots may re-crawl every few hours; HIT cache is fine for them.
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
    res.end(html);
  } catch (err: any) {
    console.error("[social-meta]", err);
    // Even on error, return SOMETHING parseable for the bot — the homepage
    // OG fallback is better than a 500 (which causes blank previews).
    const fallback = buildHtml("/", {
      title: "Turbo Loop — Sustainable DeFi Yield on BSC",
      description:
        "Audited, renounced, 100% LP-locked yield farming on Binance Smart Chain.",
      image: DEFAULT_IMAGE,
      type: "website",
    });
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(fallback);
  }
}
