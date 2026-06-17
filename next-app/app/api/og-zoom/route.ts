// /api/og-zoom?lang=hi&tier=T30
//
// Generates a fully dynamic, branded Zoom reminder banner using Next.js
// ImageResponse (Satori). The official TurboLoop logo is fetched from R2
// and embedded as a base64 <img> element — no post-processing stamping,
// no white-background bleeding.
//
// DISTINCTNESS SYSTEM (from turboloop-imagegen skill):
//   Style × Palette × Layout each rotate by (day + tierIndex) % 10
//   so every tier and every day produces a visually distinct banner.
//
// TIME SYNC:
//   timeLabel is imported from ZOOM_HI / ZOOM_EN at render time.
//   Changing the Zoom time in shared/zoomEvents.ts automatically
//   updates every banner — no manual work required.
//
// CACHING:
//   Vercel CDN caches the response for 1 hour (s-maxage=3600).
//   The day-keyed style index means the banner refreshes at midnight UTC.

import { ImageResponse } from "next/og";
import { ZOOM_HI, ZOOM_EN } from "@shared/zoomEvents";

export const runtime = "edge";

// ── Logo ─────────────────────────────────────────────────────────────────────

const LOGO_URL =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/brand/turboloop_logo_official.png";

async function fetchLogoBase64(): Promise<string> {
  const res = await fetch(LOGO_URL);
  const buf = await res.arrayBuffer();
  const b64 = Buffer.from(buf).toString("base64");
  return `data:image/png;base64,${b64}`;
}

// ── Distinctness System ───────────────────────────────────────────────────────

const STYLES = [
  "CINEMATIC",
  "NEON-GLOW",
  "PHOTO-REAL",
  "3D-RENDER",
  "ABSTRACT",
  "ILLUSTRATIVE",
  "INFOGRAPHIC",
  "MINIMALIST",
  "NATURE-ORGANIC",
  "CULTURAL",
];

// Each palette: [bg, accent, text2, badge]
const PALETTES: Record<string, [string, string, string, string]> = {
  "NAVY-GOLD":       ["#0A0A1A", "#F59E0B", "#FDE68A", "#1E293B"],
  "TEAL-WHITE":      ["#042F2E", "#22D3EE", "#A5F3FC", "#0F3D3D"],
  "PURPLE-PINK":     ["#0D0520", "#A78BFA", "#F9A8D4", "#1A0A30"],
  "EMERALD-DARK":    ["#022C22", "#10B981", "#6EE7B7", "#0A3D2A"],
  "SUNSET-WARM":     ["#1A0A00", "#F97316", "#FED7AA", "#2D1200"],
  "MIDNIGHT-BLUE":   ["#020617", "#3B82F6", "#BAE6FD", "#0C1A3A"],
  "FOREST-GREEN":    ["#0A1A0A", "#22C55E", "#BBF7D0", "#0F2D0F"],
  "ROSE-GOLD":       ["#1A0A10", "#F43F5E", "#FECDD3", "#2D0A15"],
  "COSMIC-VIOLET":   ["#05020F", "#8B5CF6", "#DDD6FE", "#120530"],
  "MONOCHROME-GOLD": ["#0A0A0A", "#D4AF37", "#FFF8DC", "#1A1A1A"],
};

const PALETTE_KEYS = Object.keys(PALETTES);

// Gradient overlays per style
const STYLE_GRADIENTS: Record<string, [string, string, string]> = {
  "CINEMATIC":      ["#0A0A1A", "#1A0A2E", "#0A1A2E"],
  "NEON-GLOW":      ["#020617", "#0D0520", "#020617"],
  "PHOTO-REAL":     ["#0A1628", "#1A2840", "#0A1628"],
  "3D-RENDER":      ["#050510", "#0A0A20", "#050510"],
  "ABSTRACT":       ["#020210", "#0A0220", "#020210"],
  "ILLUSTRATIVE":   ["#0A1A0A", "#0A0A1A", "#1A0A1A"],
  "INFOGRAPHIC":    ["#0A1A2A", "#0A0A1A", "#1A0A2A"],
  "MINIMALIST":     ["#050505", "#0A0A0A", "#050505"],
  "NATURE-ORGANIC": ["#020A02", "#0A1A0A", "#020A02"],
  "CULTURAL":       ["#1A0A00", "#0A0A1A", "#1A001A"],
};

// ── Tier config ───────────────────────────────────────────────────────────────

const TIER_INDEX: Record<string, number> = {
  T60: 0, T30: 1, T15: 2, LIVE: 3, T0: 3,
};

const TIER_LABEL: Record<string, string> = {
  T60:  "60 MINUTES TO GO",
  T30:  "30 MINUTES TO GO",
  T15:  "10 MINUTES TO GO",
  LIVE: "🔴 LIVE NOW",
  T0:   "🔴 LIVE NOW",
};

const TIER_BADGE_COLOR: Record<string, string> = {
  T60:  "#22D3EE",
  T30:  "#A78BFA",
  T15:  "#F59E0B",
  LIVE: "#EF4444",
  T0:   "#EF4444",
};

// ── Time extraction ───────────────────────────────────────────────────────────

/**
 * Extract a clean 2-line time summary from the multi-line timeLabel.
 * Line 1: primary UTC time (e.g. "5:00 PM UTC")
 * Line 2: top 3 regional times (e.g. "🇮🇳 9:00 PM IST · 🇵🇰 8:30 PM PKT · 🇦🇪 7:30 PM GST")
 */
function extractTimeLines(timeLabel: string): [string, string] {
  const lines = timeLabel.split("\n").map((l) => l.trim()).filter(Boolean);
  const primary = lines[0]?.replace(/[🕔🕓🕐🕑🕒]/g, "").trim() || "";
  const regional = lines[1]?.split("·").slice(0, 3).join(" · ").trim() || "";
  return [primary, regional];
}

// ── Layout helpers ────────────────────────────────────────────────────────────

type LayoutCode =
  | "HERO-LEFT" | "HERO-RIGHT" | "HERO-CENTER" | "SPLIT-SCREEN"
  | "FULL-BLEED" | "BOTTOM-SCENE" | "TOP-SCENE" | "FRAME-IN-FRAME"
  | "DIAGONAL" | "GRID-MOSAIC";

const LAYOUTS: LayoutCode[] = [
  "HERO-LEFT", "HERO-RIGHT", "HERO-CENTER", "SPLIT-SCREEN",
  "FULL-BLEED", "BOTTOM-SCENE", "TOP-SCENE", "FRAME-IN-FRAME",
  "DIAGONAL", "GRID-MOSAIC",
];

// ── Background pattern generators ────────────────────────────────────────────

function getPatternSvg(style: string, accent: string): string {
  const patterns: Record<string, string> = {
    "CINEMATIC": `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><circle cx='50' cy='50' r='40' fill='none' stroke='${accent}' stroke-width='0.3' opacity='0.15'/><circle cx='50' cy='50' r='25' fill='none' stroke='${accent}' stroke-width='0.3' opacity='0.1'/></svg>`,
    "NEON-GLOW": `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><line x1='0' y1='30' x2='60' y2='30' stroke='${accent}' stroke-width='0.4' opacity='0.12'/><line x1='30' y1='0' x2='30' y2='60' stroke='${accent}' stroke-width='0.4' opacity='0.12'/></svg>`,
    "ABSTRACT": `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><polygon points='40,5 75,65 5,65' fill='none' stroke='${accent}' stroke-width='0.4' opacity='0.1'/></svg>`,
    "INFOGRAPHIC": `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect x='0' y='0' width='40' height='40' fill='none' stroke='${accent}' stroke-width='0.3' opacity='0.1'/></svg>`,
    "MINIMALIST": `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><circle cx='60' cy='60' r='55' fill='none' stroke='${accent}' stroke-width='0.5' opacity='0.08'/></svg>`,
    "default": `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><path d='M0 30 Q15 0 30 30 Q45 60 60 30' fill='none' stroke='${accent}' stroke-width='0.5' opacity='0.12'/></svg>`,
  };
  const svg = patterns[style] || patterns["default"];
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// ── Main scene element builder ────────────────────────────────────────────────

function buildSceneElement(
  style: string,
  accent: string,
  isLive: boolean,
): object {
  // Large decorative element that varies by style
  const decorations: Record<string, object> = {
    "CINEMATIC": {
      type: "div",
      props: {
        style: {
          position: "absolute",
          right: "60px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
          border: `1px solid ${accent}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "140px",
        },
        children: isLive ? "📡" : "🎬",
      },
    },
    "NEON-GLOW": {
      type: "div",
      props: {
        style: {
          position: "absolute",
          right: "40px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          boxShadow: `0 0 80px ${accent}66, 0 0 160px ${accent}33`,
          background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "120px",
        },
        children: isLive ? "🔴" : "⚡",
      },
    },
    "ABSTRACT": {
      type: "div",
      props: {
        style: {
          position: "absolute",
          right: "80px",
          top: "50%",
          transform: "translateY(-50%) rotate(45deg)",
          width: "240px",
          height: "240px",
          border: `2px solid ${accent}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "100px",
        },
        children: isLive ? "🌐" : "🔷",
      },
    },
    "INFOGRAPHIC": {
      type: "div",
      props: {
        style: {
          position: "absolute",
          right: "60px",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          alignItems: "flex-end",
        },
        children: [
          { type: "div", props: { style: { width: "200px", height: "8px", background: accent, borderRadius: "4px", opacity: 0.9 }, children: "" } },
          { type: "div", props: { style: { width: "160px", height: "8px", background: accent, borderRadius: "4px", opacity: 0.7 }, children: "" } },
          { type: "div", props: { style: { width: "220px", height: "8px", background: accent, borderRadius: "4px", opacity: 0.8 }, children: "" } },
          { type: "div", props: { style: { width: "140px", height: "8px", background: accent, borderRadius: "4px", opacity: 0.6 }, children: "" } },
          { type: "div", props: { style: { width: "180px", height: "8px", background: accent, borderRadius: "4px", opacity: 0.75 }, children: "" } },
        ],
      },
    },
    "default": {
      type: "div",
      props: {
        style: {
          position: "absolute",
          right: "60px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "160px",
          opacity: 0.85,
        },
        children: isLive ? "🎙️" : "📅",
      },
    },
  };
  return decorations[style] || decorations["default"];
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lang = (url.searchParams.get("lang") || "hi").toLowerCase();
  const tier = (url.searchParams.get("tier") || "T30").toUpperCase();

  // Resolve zoom session for live time
  const session = lang === "en" ? ZOOM_EN : ZOOM_HI;
  const [primaryTime, regionalTime] = extractTimeLines(session.timeLabel);

  const isLive = tier === "LIVE" || tier === "T0";
  const tierLabel = TIER_LABEL[tier] || "30 MINUTES TO GO";
  const badgeColor = TIER_BADGE_COLOR[tier] || "#A78BFA";

  // Compute distinctness index: rotate by day + tier so each combo is unique
  const day = Math.floor(Date.now() / 86_400_000);
  const tierIdx = TIER_INDEX[tier] ?? 1;
  const styleIdx = (day + tierIdx) % 10;
  const paletteIdx = (day + tierIdx + 3) % 10;

  const style = STYLES[styleIdx];
  const paletteKey = PALETTE_KEYS[paletteIdx];
  const [bgColor, accent, text2, badgeBg] = PALETTES[paletteKey];
  const [gradFrom, gradVia, gradTo] = STYLE_GRADIENTS[style] || STYLE_GRADIENTS["CINEMATIC"];

  // Call name and subtext by language
  const callName = lang === "hi"
    ? "TurboLoop Hindi Community Call"
    : "TurboLoop Daily Community Call";
  const subtext = lang === "hi"
    ? "हर दिन · सवाल, जवाब, समुदाय"
    : "Every day · Questions, answers, community";
  const ctaText = isLive
    ? (lang === "hi" ? "अभी जुड़ें →" : "Join Now →")
    : (lang === "hi" ? "नीचे लिंक से जुड़ें →" : "Join via link below →");

  // Fetch logo as base64
  const logoSrc = await fetchLogoBase64();

  // Background pattern
  const patternSrc = getPatternSvg(style, accent);

  // Scene decoration
  const sceneEl = buildSceneElement(style, accent, isLive);

  const image = {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradVia} 50%, ${gradTo} 100%)`,
        position: "relative",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      },
      children: [
        // Background pattern overlay
        {
          type: "img",
          props: {
            src: patternSrc,
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0.4,
            },
          },
        },

        // Accent glow blob (top-right)
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "-100px",
              right: "-100px",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
            },
            children: "",
          },
        },

        // Accent glow blob (bottom-left)
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: "-80px",
              left: "-80px",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)`,
            },
            children: "",
          },
        },

        // Scene decoration element
        sceneEl,

        // Main content column
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: "48px 64px",
            },
            children: [
              // ── Top row: Logo + Tier badge ──────────────────────────────
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "32px",
                  },
                  children: [
                    // Logo — fetched from R2, rendered as <img> inside Satori
                    {
                      type: "img",
                      props: {
                        src: logoSrc,
                        style: {
                          height: "48px",
                          width: "auto",
                          objectFit: "contain",
                        },
                      },
                    },

                    // Tier badge pill
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          background: isLive ? "#EF4444" : `${badgeBg}CC`,
                          border: `1px solid ${isLive ? "#FB7185" : accent + "44"}`,
                          borderRadius: "999px",
                          padding: "10px 24px",
                        },
                        children: [
                          // Pulsing dot
                          {
                            type: "div",
                            props: {
                              style: {
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                background: isLive ? "#FFF" : badgeColor,
                                boxShadow: isLive ? "0 0 8px #FFF" : `0 0 8px ${badgeColor}`,
                              },
                              children: "",
                            },
                          },
                          {
                            type: "div",
                            props: {
                              style: {
                                fontSize: "16px",
                                fontWeight: "800",
                                color: "#FFFFFF",
                                letterSpacing: "2px",
                              },
                              children: tierLabel,
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },

              // ── Call name ───────────────────────────────────────────────
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "54px",
                    fontWeight: "900",
                    color: "#FFFFFF",
                    letterSpacing: "-1px",
                    lineHeight: "1.1",
                    maxWidth: "680px",
                    textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                  },
                  children: callName,
                },
              },

              // ── Subtext ─────────────────────────────────────────────────
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "24px",
                    fontWeight: "500",
                    color: accent,
                    marginTop: "12px",
                    letterSpacing: "0.5px",
                  },
                  children: subtext,
                },
              },

              // ── Time badge ──────────────────────────────────────────────
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    marginTop: "24px",
                    background: "rgba(0,0,0,0.35)",
                    border: `1px solid ${accent}33`,
                    borderRadius: "12px",
                    padding: "14px 20px",
                    maxWidth: "560px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "20px",
                          fontWeight: "700",
                          color: accent,
                          letterSpacing: "0.5px",
                        },
                        children: primaryTime,
                      },
                    },
                    ...(regionalTime
                      ? [{
                          type: "div",
                          props: {
                            style: {
                              fontSize: "15px",
                              fontWeight: "500",
                              color: "rgba(255,255,255,0.75)",
                              letterSpacing: "0.3px",
                            },
                            children: regionalTime,
                          },
                        }]
                      : []),
                  ],
                },
              },

              // ── Spacer ──────────────────────────────────────────────────
              { type: "div", props: { style: { flex: 1 }, children: "" } },

              // ── Bottom row: CTA + watermark ─────────────────────────────
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid rgba(255,255,255,0.12)",
                    paddingTop: "20px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "22px",
                          fontWeight: "700",
                          color: "rgba(255,255,255,0.9)",
                        },
                        children: ctaText,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "18px",
                          fontWeight: "500",
                          color: "rgba(255,255,255,0.5)",
                          letterSpacing: "2px",
                        },
                        children: "turboloop.io",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };

  return new ImageResponse(image as any, {
    width: 1200,
    height: 630,
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Style": `${style}+${paletteKey}`,
      "X-Tier": tier,
    },
  });
}
