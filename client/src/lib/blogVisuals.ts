// Per-blog visual identity system.
// Every blog gets a unique cover gradient + topic-aware icon based on its slug
// — zero manual work, deterministic and consistent across listing & detail pages.

export type BlogPalette = { from: string; via: string; to: string; soft: string };

export const BLOG_PALETTES: BlogPalette[] = [
  { from: "#0891B2", via: "#22D3EE", to: "#7C3AED", soft: "#CFFAFE" }, // cyan → purple
  { from: "#7C3AED", via: "#A78BFA", to: "#EC4899", soft: "#DDD6FE" }, // purple → pink
  { from: "#10B981", via: "#34D399", to: "#0891B2", soft: "#A7F3D0" }, // green → cyan
  { from: "#D97706", via: "#FBBF24", to: "#EC4899", soft: "#FED7AA" }, // amber → pink
  { from: "#0F172A", via: "#475569", to: "#7C3AED", soft: "#E0E7FF" }, // slate → purple
  { from: "#0891B2", via: "#10B981", to: "#F59E0B", soft: "#CFFAFE" }, // cyan → green → amber
  { from: "#EC4899", via: "#F472B6", to: "#7C3AED", soft: "#FCE7F3" }, // pink → purple
  { from: "#1E40AF", via: "#0891B2", to: "#22D3EE", soft: "#DBEAFE" }, // navy → cyan
];

/** Slug-deterministic palette pick — same blog always gets same colors */
export function paletteForSlug(slug: string): BlogPalette {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return BLOG_PALETTES[h % BLOG_PALETTES.length];
}

/**
 * Topic-aware emoji per blog — picked based on keywords in the slug.
 * This gives every blog a visual anchor without needing manual cover images.
 */
const TOPIC_RULES: { keywords: string[]; emoji: string; tag: string }[] = [
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
  { keywords: ["token", "doesnt-have", "not"], emoji: "💎", tag: "Philosophy" },
];

export type BlogTopic = { emoji: string; tag: string };

export function topicForSlug(slug: string): BlogTopic {
  const s = slug.toLowerCase();
  for (const rule of TOPIC_RULES) {
    if (rule.keywords.some((k) => s.includes(k))) return { emoji: rule.emoji, tag: rule.tag };
  }
  return { emoji: "✦", tag: "Article" };
}

export function readingTime(content: string | null | undefined): number {
  if (!content) return 1;
  const words = content.split(/\s+/).length || 0;
  return Math.max(1, Math.round(words / 200));
}

/** Extract H2/H3 headings for table of contents */
export type Heading = { level: 2 | 3; text: string; id: string };
export function extractHeadings(markdown: string): Heading[] {
  if (!markdown) return [];
  const out: Heading[] = [];
  const lines = markdown.split("\n");
  let inCodeBlock = false;
  for (const line of lines) {
    // Skip headings inside fenced code blocks
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const m = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (!m) continue;
    const level = m[1].length as 2 | 3;
    const text = m[2].replace(/\*\*/g, "").trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80);
    out.push({ level, text, id });
  }
  return out;
}
