// Edge Function — generates real PNG banners for Telegram (1200x630).
// /api/og-banner?type=zoom&lang=en — Zoom reminder banner
// /api/og-banner?type=blog&slug=...  — Blog post banner (uses topic emoji + title)
// /api/og-banner?type=launch         — Site launch banner (homepage OG + pinned post)
//
// Uses @vercel/og (Satori under the hood) — produces a real PNG that Telegram
// accepts in sendPhoto. Each request returns a fresh image; we cache aggressively.
// Different gradient palette + layout per day = "looks new every day".

import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

const PALETTES = [
  ["#0891B2", "#22D3EE", "#7C3AED"],
  ["#7C3AED", "#A78BFA", "#EC4899"],
  ["#10B981", "#34D399", "#0891B2"],
  ["#D97706", "#FBBF24", "#EC4899"],
  ["#0F172A", "#475569", "#7C3AED"],
  ["#0891B2", "#10B981", "#F59E0B"],
  ["#EC4899", "#F472B6", "#7C3AED"],
  ["#1E40AF", "#0891B2", "#22D3EE"],
];

function paletteForDay() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return PALETTES[day % PALETTES.length];
}

function todayLabel() {
  const d = new Date();
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }).toUpperCase();
}

const TYPE_CONFIG = {
  zoom_en: { label: "Daily English Call", subline: "Live in 30 minutes · 5 PM UTC", emoji: "🌍", accent: "LIVE IN 30 MIN" },
  zoom_hi: { label: "Hindi / Urdu Daily Call", subline: "30 minute mein live · 9 PM IST", emoji: "🇮🇳", accent: "LIVE IN 30 MIN" },
  blog:    { label: "Today on the Blog", subline: "turboloop.tech", emoji: "📖", accent: "NEW POST" },
};

// ============ TOPIC THEMES (for content-aware blog banners) ============
// Each theme defines the visual identity for a post category — palette, emoji,
// accent label, tagline. detectTopic() inspects the slug + title to choose.
const TOPIC_THEMES = {
  security:   { emoji: "🛡",  from: "#0891B2", via: "#1E40AF", to: "#0F172A", accent: "SECURITY",      tagline: "Trustless. Verifiable. Locked." },
  yield:      { emoji: "📈", from: "#10B981", via: "#0891B2", to: "#0F172A", accent: "YIELD FARMING", tagline: "Real revenue. Daily yield." },
  community:  { emoji: "👥", from: "#7C3AED", via: "#EC4899", to: "#1E1B4B", accent: "COMMUNITY",     tagline: "The people behind the protocol." },
  swap:       { emoji: "💱", from: "#22D3EE", via: "#0891B2", to: "#1E1B4B", accent: "TURBO SWAP",    tagline: "Decentralized exchange, on-chain." },
  buy:        { emoji: "💳", from: "#0891B2", via: "#7C3AED", to: "#0F172A", accent: "TURBO BUY",     tagline: "Fiat. On-chain. Instant." },
  referral:   { emoji: "🔗", from: "#F59E0B", via: "#EC4899", to: "#1E1B4B", accent: "REFERRAL",      tagline: "Share. Earn. Compound." },
  leadership: { emoji: "🏆", from: "#F59E0B", via: "#7C3AED", to: "#1E1B4B", accent: "LEADERSHIP",    tagline: "Build the network. Own a share." },
  ecosystem:  { emoji: "⚙️", from: "#22D3EE", via: "#A78BFA", to: "#1E1B4B", accent: "ECOSYSTEM",     tagline: "Six pillars. One engine." },
  roadmap:    { emoji: "🚀", from: "#EC4899", via: "#7C3AED", to: "#0F172A", accent: "ROADMAP",       tagline: "Where we're headed next." },
  creatives:  { emoji: "🎨", from: "#A78BFA", via: "#EC4899", to: "#1E1B4B", accent: "CREATIVES",     tagline: "Banners. Captions. 48 languages." },
  default:    { emoji: "📖", from: "#0891B2", via: "#7C3AED", to: "#1E1B4B", accent: "NEW POST",      tagline: "Fresh from the editorial." },
};

function detectTopic(slug, title) {
  const text = `${slug || ""} ${title || ""}`.toLowerCase();
  // Order matters — most specific patterns first
  if (/leadership|leader.program|leader-program/.test(text)) return TOPIC_THEMES.leadership;
  if (/security|audit|locked|renounced|trustless|smart.contract|hack|exploit|vuln/.test(text)) return TOPIC_THEMES.security;
  if (/yield|farming|apy|reward|deposit|stake/.test(text)) return TOPIC_THEMES.yield;
  if (/swap|liquidity|trading|amm|dex/.test(text)) return TOPIC_THEMES.swap;
  if (/turbo.buy|turbo-buy|fiat|onramp|on.ramp|on-ramp/.test(text)) return TOPIC_THEMES.buy;
  if (/referral|network|share|invite/.test(text)) return TOPIC_THEMES.referral;
  if (/ecosystem|pillar|six.pillar/.test(text)) return TOPIC_THEMES.ecosystem;
  if (/roadmap|future|next|phase/.test(text)) return TOPIC_THEMES.roadmap;
  if (/creative|design|banner|caption/.test(text)) return TOPIC_THEMES.creatives;
  if (/community|country|leaderboard|social|culture|telegram|zoom/.test(text)) return TOPIC_THEMES.community;
  return TOPIC_THEMES.default;
}

function titleFontSize(title) {
  const len = (title || "").length;
  if (len < 30) return 86;
  if (len < 50) return 70;
  if (len < 70) return 58;
  if (len < 90) return 50;
  return 44;
}

// ============ BLOG BANNER (content-aware) ============
// Premium per-post banner: topic-detected palette + topic emoji watermark +
// auto-sized title + topic tagline + read-on-blog footer. Same visual DNA as
// the launch banner (dark navy + cyan/purple glows) but accented per topic.
function blogBanner(slug, title) {
  const theme = detectTopic(slug, title);
  const safeTitle = title || "Today on the blog";
  const fontSize = titleFontSize(safeTitle);
  const slugDisplay = slug ? `turboloop.tech/blog/${slug}` : "turboloop.tech/feed";

  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.via} 50%, ${theme.to} 100%)`,
          fontFamily: '"Inter", system-ui, sans-serif',
          padding: "70px 90px",
          position: "relative",
          color: "white",
        },
        children: [
          // Soft topic-color glow — top-left
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "-180px",
                left: "-180px",
                width: "640px",
                height: "640px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${theme.from}55 0%, ${theme.from}00 70%)`,
              },
            },
          },
          // Soft accent glow — bottom-right
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                bottom: "-160px",
                right: "-160px",
                width: "560px",
                height: "560px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${theme.via}50 0%, ${theme.via}00 70%)`,
              },
            },
          },
          // Massive topic emoji — right-side watermark, low opacity
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                right: "60px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "340px",
                opacity: 0.18,
                lineHeight: 1,
                filter: "drop-shadow(0 8px 40px rgba(0,0,0,0.5))",
              },
              children: theme.emoji,
            },
          },
          // Top row: brand pill + topic accent pill
          {
            type: "div",
            props: {
              style: { display: "flex", gap: "12px", alignItems: "center", position: "relative", zIndex: 2 },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      background: "rgba(255,255,255,0.96)",
                      color: theme.from,
                      padding: "11px 22px",
                      borderRadius: "999px",
                      fontSize: "15px",
                      fontWeight: "800",
                      letterSpacing: "3px",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                    },
                    children: "TURBO LOOP",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      background: "rgba(15,23,42,0.55)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      color: "rgba(255,255,255,0.95)",
                      padding: "11px 22px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: "700",
                      letterSpacing: "3px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    },
                    children: [
                      { type: "div", props: { style: { fontSize: "16px" }, children: theme.emoji } },
                      theme.accent,
                    ],
                  },
                },
              ],
            },
          },
          // Spacer
          { type: "div", props: { style: { flex: 1 } } },
          // Headline block — auto-sized title + topic tagline
          {
            type: "div",
            props: {
              style: { display: "flex", flexDirection: "column", gap: "20px", maxWidth: "920px", position: "relative", zIndex: 2 },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: `${fontSize}px`,
                      fontWeight: "800",
                      letterSpacing: "-2px",
                      lineHeight: 1.05,
                      textShadow: "0 8px 32px rgba(0,0,0,0.55)",
                    },
                    children: safeTitle,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "26px",
                      fontWeight: "500",
                      color: "rgba(255,255,255,0.85)",
                      letterSpacing: "-0.5px",
                      fontStyle: "italic",
                    },
                    children: theme.tagline,
                  },
                },
              ],
            },
          },
          // Bottom row — slug + brand domain
          {
            type: "div",
            props: {
              style: {
                marginTop: "46px",
                paddingTop: "26px",
                borderTop: "1px solid rgba(255,255,255,0.22)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                zIndex: 2,
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "rgba(255,255,255,0.75)",
                      letterSpacing: "1px",
                    },
                    children: slugDisplay,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "rgba(255,255,255,0.95)",
                      letterSpacing: "2px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    },
                    children: [
                      { type: "div", props: { style: { fontSize: "16px" }, children: "📖" } },
                      "READ ON THE BLOG",
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      headers: {
        // Per-post banner is deterministic (theme is derived from slug) so cache aggressively
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

// ============ LAUNCH BANNER ============
// Premium site-launch announcement banner. Static layout (no per-day rotation —
// this is the "permanent" homepage OG card pinned to the brand for consistency).
function launchBanner() {
  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #1E1B4B 100%)",
          fontFamily: '"Inter", system-ui, sans-serif',
          padding: "70px 90px",
          position: "relative",
          color: "white",
        },
        children: [
          // Soft cyan radial glow — top-left, behind the headline
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "-200px",
                left: "-200px",
                width: "700px",
                height: "700px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(34,211,238,0.18) 0%, rgba(34,211,238,0) 70%)",
              },
            },
          },
          // Soft purple radial glow — bottom-right, accent
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                bottom: "-180px",
                right: "-180px",
                width: "600px",
                height: "600px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(124,58,237,0.22) 0%, rgba(124,58,237,0) 70%)",
              },
            },
          },
          // Top row — brand pill + LIVE badge
          {
            type: "div",
            props: {
              style: { display: "flex", gap: "14px", alignItems: "center" },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                      color: "white",
                      padding: "12px 24px",
                      borderRadius: "999px",
                      fontSize: "16px",
                      fontWeight: "800",
                      letterSpacing: "3px",
                      boxShadow: "0 8px 24px rgba(8,145,178,0.4)",
                    },
                    children: "TURBO LOOP",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      background: "rgba(34,197,94,0.15)",
                      border: "1px solid rgba(34,197,94,0.4)",
                      color: "#86EFAC",
                      padding: "12px 22px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: "700",
                      letterSpacing: "3px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: { width: "8px", height: "8px", borderRadius: "50%", background: "#22C55E" },
                        },
                      },
                      "NOW LIVE",
                    ],
                  },
                },
              ],
            },
          },
          // Spacer
          { type: "div", props: { style: { flex: 1 } } },
          // Headline block
          {
            type: "div",
            props: {
              style: { display: "flex", flexDirection: "column", gap: "18px", maxWidth: "1020px", position: "relative", zIndex: 2 },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "104px",
                      fontWeight: "900",
                      letterSpacing: "-4px",
                      lineHeight: 0.98,
                      textShadow: "0 8px 40px rgba(0,0,0,0.6)",
                      display: "flex",
                      alignItems: "baseline",
                      gap: "8px",
                    },
                    children: [
                      "TurboLoop",
                      {
                        type: "span",
                        props: {
                          style: {
                            background: "linear-gradient(135deg, #22D3EE 0%, #A78BFA 100%)",
                            backgroundClip: "text",
                            color: "transparent",
                          },
                          children: ".tech",
                        },
                      },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "44px",
                      fontWeight: "600",
                      color: "rgba(255,255,255,0.92)",
                      letterSpacing: "-1px",
                      lineHeight: 1.1,
                    },
                    children: "The hub is live.",
                  },
                },
                // Page list — comma-separated chips
                {
                  type: "div",
                  props: {
                    style: {
                      marginTop: "12px",
                      fontSize: "22px",
                      fontWeight: "500",
                      color: "rgba(203,213,225,0.85)",
                      letterSpacing: "0.5px",
                      lineHeight: 1.5,
                    },
                    children: "Ecosystem · Security · Community · Creatives · Editorial · Roadmap · Library · Promotions",
                  },
                },
              ],
            },
          },
          // Bottom row — stats strip + domain
          {
            type: "div",
            props: {
              style: {
                marginTop: "50px",
                paddingTop: "26px",
                borderTop: "1px solid rgba(148,163,184,0.2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                zIndex: 2,
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      gap: "32px",
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "rgba(148,163,184,0.9)",
                      letterSpacing: "1px",
                    },
                    children: [
                      { type: "div", props: { children: "16 pages" } },
                      { type: "div", props: { style: { color: "rgba(148,163,184,0.4)" }, children: "•" } },
                      { type: "div", props: { children: "13 deep-dives" } },
                      { type: "div", props: { style: { color: "rgba(148,163,184,0.4)" }, children: "•" } },
                      { type: "div", props: { children: "48 languages" } },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "22px",
                      fontWeight: "700",
                      color: "#22D3EE",
                      letterSpacing: "1.5px",
                    },
                    children: "turboloop.tech",
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      headers: {
        // Cache long — launch banner is static, doesn't change per request
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

export default async function handler(req) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "zoom";
  const lang = url.searchParams.get("lang") || "en";
  const title = url.searchParams.get("title") || "";
  const slug = url.searchParams.get("slug") || "";

  // Site-launch banner — distinct layout, used as the homepage OG card
  if (type === "launch") {
    return launchBanner();
  }

  // Content-aware blog banner — topic-detected palette + emoji per-post
  if (type === "blog") {
    return blogBanner(slug, title);
  }

  // Decide config (legacy path — kept for zoom + any unknown type fallback)
  let cfg = TYPE_CONFIG.blog;
  if (type === "zoom") cfg = lang === "hi" ? TYPE_CONFIG.zoom_hi : TYPE_CONFIG.zoom_en;

  const [from, via, to] = paletteForDay();
  const dateStr = todayLabel();

  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${from} 0%, ${via} 50%, ${to} 100%)`,
          fontFamily: '"Inter", system-ui, sans-serif',
          padding: "60px 80px",
          position: "relative",
          color: "white",
        },
        children: [
          // Top row: brand pill + accent pill
          {
            type: "div",
            props: {
              style: { display: "flex", gap: "16px", alignItems: "center" },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      background: "rgba(255,255,255,0.95)",
                      color: from,
                      padding: "10px 22px",
                      borderRadius: "999px",
                      fontSize: "16px",
                      fontWeight: "800",
                      letterSpacing: "3px",
                    },
                    children: "TURBO LOOP",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      background: "rgba(15,23,42,0.55)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "rgba(255,255,255,0.95)",
                      padding: "10px 22px",
                      borderRadius: "999px",
                      fontSize: "14px",
                      fontWeight: "700",
                      letterSpacing: "2.5px",
                    },
                    children: cfg.accent,
                  },
                },
              ],
            },
          },
          // Spacer
          { type: "div", props: { style: { flex: 1 } } },
          // Big emoji watermark — bottom right
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                right: "60px",
                bottom: "100px",
                fontSize: "260px",
                opacity: 0.85,
                lineHeight: 1,
              },
              children: cfg.emoji,
            },
          },
          // Headline + subline
          {
            type: "div",
            props: {
              style: { display: "flex", flexDirection: "column", gap: "14px", maxWidth: "740px" },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: title ? "60px" : "76px",
                      fontWeight: "800",
                      letterSpacing: "-2px",
                      lineHeight: 1.05,
                      textShadow: "0 4px 24px rgba(0,0,0,0.4)",
                    },
                    children: title || cfg.label,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "26px",
                      fontWeight: "500",
                      color: "rgba(255,255,255,0.92)",
                      letterSpacing: "-0.5px",
                    },
                    children: title ? cfg.label : cfg.subline,
                  },
                },
              ],
            },
          },
          // Bottom row: date + brand domain
          {
            type: "div",
            props: {
              style: {
                marginTop: "44px",
                paddingTop: "28px",
                borderTop: "1px solid rgba(255,255,255,0.18)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: { fontSize: "20px", fontWeight: "700", color: "rgba(255,255,255,0.7)", letterSpacing: "3px" },
                    children: dateStr,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { fontSize: "20px", fontWeight: "600", color: "rgba(255,255,255,0.85)", letterSpacing: "1px" },
                    children: "turboloop.tech",
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    },
  );
}
