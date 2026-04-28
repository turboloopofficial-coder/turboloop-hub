// Edge Function — generates real PNG banners for Telegram (1200x630).
// /api/og-banner?type=zoom&lang=en — Zoom reminder banner
// /api/og-banner?type=blog&slug=...  — Blog post banner (uses topic emoji + title)
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

export default async function handler(req) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "zoom";
  const lang = url.searchParams.get("lang") || "en";
  const title = url.searchParams.get("title") || "";

  // Decide config
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
