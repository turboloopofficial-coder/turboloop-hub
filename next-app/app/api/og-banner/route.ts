// Edge route handler — generates 1200x630 PNG banners for OG previews
// + Telegram sendPhoto. Ported in-tree from api/og-banner.js (which
// lives in the legacy turboloop-hub Vercel project) because that
// project's GitHub auto-deploy webhook stopped firing and this content
// stayed stale on the old code path. Hosting the function inside the
// Next-app project means it deploys with every push that hits main.
//
// Same wire format as before: /api/og-banner?type=launch | blog | zoom
// | calculator | community | security | ecosystem | films | creatives
// | blog-listing. Old www.turboloop.tech and api.turboloop.tech URLs
// stay equivalent — pages now reference www, but anything still hitting
// api/* keeps falling through to the (stale but functional) legacy fn.
//
// Element trees are written as `{ type, props }` literals (Satori walks
// them by shape, not by React identity) so the cast `as any` at each
// ImageResponse call is intentional — it documents the structural-typing
// boundary without paying the cost of a JSX rewrite.

import { ImageResponse } from "next/og";
import langKitManifest from "@lib/creatives-language-kit-manifest.json";

export const runtime = "edge";

// ─── Creatives banner i18n + counts ────────────────────────────────
// Total banner count = legacy English-only kit (pillar/myth/product
// banners, 175 in `creatives-manifest.json`) PLUS the 6-language
// educational kit (455 entries from `creatives-language-kit-manifest`).
//
// Per-language counts on /creatives:
//   en → 175 legacy + 65 kit = 240 (the legacy banners default to EN)
//   de/hi/id/fr/ar/es → 65 each from the kit
//
// LEGACY_BANNER_COUNT is hardcoded rather than imported because the
// legacy manifest is ~1MB and we don't want it in the edge bundle.
// Bump this constant when scripts/process-creatives.mjs adds more.
const LEGACY_BANNER_COUNT = 175;
const LANG_KIT_TOTAL = (langKitManifest.items ?? []).length;
const TOTAL_BANNER_COUNT = LEGACY_BANNER_COUNT + LANG_KIT_TOTAL;

type CreativesLang = "en" | "de" | "hi" | "id" | "fr" | "ar" | "es";

// Per-language count: only `en` gets the legacy boost; the rest are
// kit-only. Derived from the manifest at module-load so adding a
// language to the kit doesn't require touching this file.
const COUNTS_PER_LANG: Record<CreativesLang, number> = (() => {
  const langs = (langKitManifest.languages ?? {}) as Record<
    string,
    { count?: number }
  >;
  return {
    en: (langs.en?.count ?? 0) + LEGACY_BANNER_COUNT,
    de: langs.de?.count ?? 0,
    hi: langs.hi?.count ?? 0,
    id: langs.id?.count ?? 0,
    fr: langs.fr?.count ?? 0,
    ar: langs.ar?.count ?? 0,
    es: langs.es?.count ?? 0,
  };
})();

// Title + subtitle per language. Subtitle uses the count so the OG
// image always shows the current size of the library for that locale —
// no drift when banners are added.
const CREATIVES_COPY: Record<
  CreativesLang | "all",
  { title: string; subtitleTemplate: (n: number) => string; accent: string }
> = {
  all: {
    title: "Creatives Library",
    subtitleTemplate: n => `${n} ready-to-share banners. Free for the community.`,
    accent: "CREATIVES",
  },
  en: {
    title: "Creatives Library",
    subtitleTemplate: n => `${n} English banners — pre-designed and free to share.`,
    accent: "ENGLISH",
  },
  de: {
    title: "Kreativ-Bibliothek",
    subtitleTemplate: n => `${n} deutsche Banner — sofort einsatzbereit.`,
    accent: "DEUTSCH",
  },
  hi: {
    title: "क्रिएटिव लाइब्रेरी",
    subtitleTemplate: n => `${n} हिन्दी बैनर — शेयर करने के लिए तैयार।`,
    accent: "हिन्दी",
  },
  id: {
    title: "Pustaka Kreatif",
    subtitleTemplate: n => `${n} banner Bahasa Indonesia — siap dibagikan.`,
    accent: "INDONESIA",
  },
  fr: {
    title: "Bibliothèque Créative",
    subtitleTemplate: n => `${n} bannières françaises — prêtes à partager.`,
    accent: "FRANÇAIS",
  },
  ar: {
    title: "مكتبة الإبداعات",
    subtitleTemplate: n => `${n} بانر عربي — جاهز للمشاركة.`,
    accent: "العربية",
  },
  es: {
    title: "Biblioteca Creativa",
    subtitleTemplate: n => `${n} banners en español — listos para compartir.`,
    accent: "ESPAÑOL",
  },
};

function isCreativesLang(v: string | null): v is CreativesLang {
  return (
    v === "en" ||
    v === "de" ||
    v === "hi" ||
    v === "id" ||
    v === "fr" ||
    v === "ar" ||
    v === "es"
  );
}

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
  return d
    .toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    .toUpperCase();
}

const TYPE_CONFIG = {
  zoom_en: {
    label: "Daily English Call",
    subline: "Live in 30 minutes · 5 PM UTC",
    emoji: "🌍",
    accent: "LIVE IN 30 MIN",
  },
  zoom_hi: {
    label: "Hindi / Urdu Daily Call",
    subline: "30 minute mein live · 9 PM IST",
    emoji: "🇮🇳",
    accent: "LIVE IN 30 MIN",
  },
  blog: {
    label: "Today on the Blog",
    subline: "turboloop.tech",
    emoji: "📖",
    accent: "NEW POST",
  },
};

interface Theme {
  emoji?: string;
  from: string;
  via: string;
  to: string;
  accent: string;
  tagline?: string;
}

const TOPIC_THEMES: Record<string, Theme> = {
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

function detectTopic(slug: string, title: string): Theme {
  const text = `${slug || ""} ${title || ""}`.toLowerCase();
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

function titleFontSize(title: string): number {
  const len = (title || "").length;
  if (len < 30) return 86;
  if (len < 50) return 70;
  if (len < 70) return 58;
  if (len < 90) return 50;
  return 44;
}

// ============ BLOG BANNER (content-aware) ============
function blogBanner(slug: string, title: string) {
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
          { type: "div", props: { style: { flex: 1 } } },
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
    } as any,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

// ============ LAUNCH BANNER ============
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
          { type: "div", props: { style: { flex: 1 } } },
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
    } as any,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

// ============ PAGE BANNER (per-route hero) ============
function pageBanner(title: string, subtitle: string, emoji: string, theme: Theme) {
  const safeTitle = title || "";
  const fontSize = titleFontSize(safeTitle);
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
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                right: "60px",
                bottom: "70px",
                fontSize: "320px",
                opacity: 0.5,
                lineHeight: 1,
                filter: "drop-shadow(0 8px 40px rgba(0,0,0,0.5))",
              },
              children: emoji,
            },
          },
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
                    },
                    children: theme.accent,
                  },
                },
              ],
            },
          },
          { type: "div", props: { style: { flex: 1 } } },
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
                      lineHeight: 1.3,
                    },
                    children: subtitle || "",
                  },
                },
              ],
            },
          },
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
                      fontWeight: "700",
                      color: "rgba(255,255,255,0.95)",
                      letterSpacing: "1.5px",
                    },
                    children: "turboloop.tech",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "rgba(255,255,255,0.75)",
                      letterSpacing: "1px",
                      fontStyle: "italic",
                    },
                    children: theme.tagline || "",
                  },
                },
              ],
            },
          },
        ],
      },
    } as any,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "zoom";
  const lang = url.searchParams.get("lang") || "en";
  const title = url.searchParams.get("title") || "";
  const slug = url.searchParams.get("slug") || "";

  if (type === "launch") return launchBanner();
  if (type === "blog") return blogBanner(slug, title);

  if (type === "calculator")
    return pageBanner(
      "Yield Calculator",
      "Run the numbers. See the projection.",
      "📊",
      TOPIC_THEMES.yield,
    );
  if (type === "community")
    return pageBanner(
      "Global Community",
      "Voices from 14+ countries across 6 continents.",
      "🌍",
      TOPIC_THEMES.community,
    );
  if (type === "security")
    return pageBanner(
      "Security Architecture",
      "Audited. Renounced. 100% LP locked. $100K bounty.",
      "🛡",
      TOPIC_THEMES.security,
    );
  if (type === "ecosystem")
    return pageBanner(
      "The Ecosystem",
      "Six pillars. One engine. Complete DeFi.",
      "⚙️",
      TOPIC_THEMES.ecosystem,
    );
  if (type === "films")
    return pageBanner(
      "Cinematic Universe",
      "20 films. 4 seasons. One story.",
      "🎬",
      {
        from: "#0F172A",
        via: "#7C3AED",
        to: "#EC4899",
        accent: "FILMS",
        tagline: "From The Problem to The Movement.",
      },
    );
  if (type === "creatives") {
    // Language-aware creatives banner. Picks copy + count from the
    // tables above so the OG image always reflects the current size
    // of the library + the locale that's about to be shared.
    const langParam = url.searchParams.get("lang");
    const langKey: CreativesLang | "all" = isCreativesLang(langParam)
      ? langParam
      : "all";
    const count =
      langKey === "all" ? TOTAL_BANNER_COUNT : COUNTS_PER_LANG[langKey];
    const copy = CREATIVES_COPY[langKey];
    return pageBanner(
      copy.title,
      copy.subtitleTemplate(count),
      "🎨",
      // Override the accent on the topic theme so the chip reads in the
      // active locale ("DEUTSCH", "हिन्दी", ...) instead of the generic
      // English "CREATIVES" tag.
      { ...TOPIC_THEMES.creatives, accent: copy.accent },
    );
  }
  if (type === "blog-listing")
    return pageBanner(
      "Editorial",
      "Deep-dives on yield, security, and the math.",
      "📖",
      TOPIC_THEMES.default,
    );
  // Three additional variants added 2026-05-18 to give /social-wall,
  // /careers, /promotions unique OG images instead of sharing one with
  // /creatives + /apply (which weakens entity-disambiguation signal
  // to Google's image-pack — see plan doc 2026-05-18).
  if (type === "social-wall")
    return pageBanner(
      "Social Wall",
      "Community posts + highlights from across the TurboLoop ecosystem.",
      "🎬",
      TOPIC_THEMES.community,
    );
  if (type === "careers")
    return pageBanner(
      "Careers",
      "Join the TurboLoop presenter team. Remote. $100/month stipend.",
      "🎙",
      TOPIC_THEMES.community,
    );
  if (type === "promotions")
    return pageBanner(
      "Promotions",
      "$100K bounty · Creator Star · Local Presenter. Get paid in stablecoins.",
      "🎁",
      TOPIC_THEMES.referral,
    );
  if (type === "apply")
    return pageBanner(
      "Apply to Earn",
      "Creator Star ($10–$100/video) or Local Presenter ($100/month).",
      "⭐",
      TOPIC_THEMES.referral,
    );
  if (type === "faq")
    return pageBanner(
      "FAQ",
      "Plain answers on minimum deposits, security audits, and how yield works.",
      "❓",
      TOPIC_THEMES.default,
    );
  if (type === "learn")
    return pageBanner(
      "Learn DeFi",
      "Step-by-step guides on yield farming, wallets, and the protocol.",
      "📚",
      TOPIC_THEMES.default,
    );
  if (type === "events")
    return pageBanner(
      "Events",
      "Global TurboLoop community meetups — Lagos, Berlin, Dubai, and more.",
      "📅",
      TOPIC_THEMES.community,
    );

  // ─── Legacy fallback: zoom + unknown types ──────────────────────────
  let cfg: { label: string; subline: string; emoji: string; accent: string } = TYPE_CONFIG.blog;
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
          { type: "div", props: { style: { flex: 1 } } },
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
    } as any,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    },
  );
}
