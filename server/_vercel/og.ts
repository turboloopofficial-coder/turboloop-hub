// Per-blog OG image generator — returns a 1200×630 SVG card.
// Twitter/X, LinkedIn, and Facebook all support SVG OG images.
// Telegram and most messaging apps fall back to og:image, which we set per-blog.
//
// URL: /api/og?slug=<blog-slug>
//   The slug determines the gradient palette and topic emoji.
//   The blog title is fetched from DB and rendered.
//
// Cached aggressively (1 day public, 1 week stale) since the content rarely changes.

import type { IncomingMessage, ServerResponse } from "node:http";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { blogPosts } from "../../drizzle/schema";

const PALETTES = [
  { from: "#0891B2", via: "#22D3EE", to: "#7C3AED" },
  { from: "#7C3AED", via: "#A78BFA", to: "#EC4899" },
  { from: "#10B981", via: "#34D399", to: "#0891B2" },
  { from: "#D97706", via: "#FBBF24", to: "#EC4899" },
  { from: "#0F172A", via: "#475569", to: "#7C3AED" },
  { from: "#0891B2", via: "#10B981", to: "#F59E0B" },
  { from: "#EC4899", via: "#F472B6", to: "#7C3AED" },
  { from: "#1E40AF", via: "#0891B2", to: "#22D3EE" },
];

function paletteFor(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return PALETTES[h % PALETTES.length];
}

const TOPIC_RULES: Array<{ keywords: string[]; emoji: string; tag: string }> = [
  { keywords: ["security", "audit", "renounced", "lock", "verify", "100k"], emoji: "🛡", tag: "Security" },
  { keywords: ["compound", "math", "yield", "apy", "apr", "return"], emoji: "📈", tag: "Strategy" },
  { keywords: ["referral", "leadership", "rank", "community", "global", "telegram", "zoom", "creator", "presenter", "leader"], emoji: "🌐", tag: "Community" },
  { keywords: ["roadmap", "future", "phase", "vision"], emoji: "🚀", tag: "Roadmap" },
  { keywords: ["beginner", "first", "guide", "metamask", "step", "playbook", "habits", "mistakes"], emoji: "📘", tag: "Guide" },
  { keywords: ["swap", "buy", "moonpay", "fiat", "onramp", "dex"], emoji: "💱", tag: "Product" },
  { keywords: ["flywheel", "revenue", "ecosystem", "complete", "what-is"], emoji: "⚙", tag: "Protocol" },
  { keywords: ["bsc", "ethereum", "blockchain", "transparency", "chain"], emoji: "⛓", tag: "Tech" },
  { keywords: ["onboarding", "bonus", "challenge"], emoji: "🎁", tag: "Promo" },
  { keywords: ["impermanent", "loss"], emoji: "🧮", tag: "Concepts" },
  { keywords: ["token", "doesnt-have"], emoji: "💎", tag: "Philosophy" },
];

function topicFor(slug: string): { emoji: string; tag: string } {
  const s = slug.toLowerCase();
  for (const r of TOPIC_RULES) {
    if (r.keywords.some((k) => s.includes(k))) return { emoji: r.emoji, tag: r.tag };
  }
  return { emoji: "✦", tag: "Article" };
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/** Wrap title text into multiple lines that fit within 1000px at the configured size */
function wrapTitle(title: string, maxCharsPerLine = 28): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length <= maxCharsPerLine) {
      cur = (cur + " " + w).trim();
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
    if (lines.length >= 2 && cur.length > maxCharsPerLine) break;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3); // max 3 lines
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    const slug = url.searchParams.get("slug") || "";

    let title = "Turbo Loop";
    let isBlog = false;

    if (slug) {
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        try {
          const db = drizzle(neon(dbUrl));
          const r = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
          if (r[0]?.title) {
            title = r[0].title;
            isBlog = true;
          }
        } catch {
          // Fall through to default
        }
      }
    }

    const palette = paletteFor(slug || "default");
    const topic = isBlog ? topicFor(slug) : { emoji: "🚀", tag: "Hub" };
    const titleLines = wrapTitle(title);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.from}"/>
      <stop offset="50%" stop-color="${palette.via}"/>
      <stop offset="100%" stop-color="${palette.to}"/>
    </linearGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    </pattern>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="60%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.35)"/>
    </radialGradient>
  </defs>

  <!-- Background gradient -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Grid pattern overlay -->
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- Vignette -->
  <rect width="1200" height="630" fill="url(#vignette)"/>

  <!-- Big topic emoji watermark (right side) -->
  <text x="1130" y="510" font-size="280" text-anchor="end" opacity="0.85"
        style="filter: drop-shadow(0 8px 30px rgba(0,0,0,0.3));">
    ${topic.emoji}
  </text>

  <!-- Top brand row -->
  <g transform="translate(80, 80)">
    <rect x="0" y="0" rx="999" ry="999" width="200" height="48" fill="rgba(255,255,255,0.95)"/>
    <text x="100" y="32" font-family="-apple-system, system-ui, sans-serif" font-weight="800"
          font-size="14" fill="${palette.from}" text-anchor="middle" letter-spacing="3">
      TURBO LOOP
    </text>
  </g>

  <!-- Topic tag pill (top, next to brand) -->
  <g transform="translate(300, 80)">
    <rect x="0" y="0" rx="999" ry="999" width="${topic.tag.length * 11 + 50}" height="48" fill="rgba(15,23,42,0.6)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="${(topic.tag.length * 11 + 50) / 2}" y="32" font-family="-apple-system, system-ui, sans-serif" font-weight="700"
          font-size="14" fill="rgba(255,255,255,0.95)" text-anchor="middle" letter-spacing="2.5">
      ${escapeXml(topic.tag.toUpperCase())}
    </text>
  </g>

  <!-- Main title (multi-line) -->
  ${titleLines.map((line, i) => `
  <text x="80" y="${290 + i * 90}" font-family="-apple-system, system-ui, sans-serif" font-weight="800"
        font-size="${titleLines.length > 2 ? 64 : 76}" fill="white" letter-spacing="-2"
        style="filter: drop-shadow(0 4px 24px rgba(0,0,0,0.5));">
    ${escapeXml(line)}
  </text>
  `).join("")}

  <!-- Bottom brand row -->
  <line x1="80" y1="540" x2="1120" y2="540" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>

  <text x="80" y="585" font-family="-apple-system, system-ui, sans-serif" font-weight="700"
        font-size="22" fill="rgba(255,255,255,0.85)" letter-spacing="1">
    turboloop.tech
  </text>

  <text x="1120" y="585" font-family="-apple-system, system-ui, sans-serif" font-weight="500"
        font-size="18" fill="rgba(255,255,255,0.55)" letter-spacing="2" text-anchor="end">
    ${isBlog ? "BLOG · 5 MIN READ" : "THE COMPLETE DEFI ECOSYSTEM"}
  </text>
</svg>`;

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800");
    res.statusCode = 200;
    res.end(svg);
  } catch (err: any) {
    console.error("[og]", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end(`og error: ${err?.message || err}`);
  }
}
