"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/_vercel/og-zoom.ts
var og_zoom_exports = {};
__export(og_zoom_exports, {
  default: () => handler
});
module.exports = __toCommonJS(og_zoom_exports);
var PALETTES = [
  { from: "#0891B2", via: "#22D3EE", to: "#7C3AED" },
  { from: "#7C3AED", via: "#A78BFA", to: "#EC4899" },
  { from: "#10B981", via: "#34D399", to: "#0891B2" },
  { from: "#D97706", via: "#FBBF24", to: "#EC4899" },
  { from: "#0F172A", via: "#475569", to: "#7C3AED" },
  { from: "#0891B2", via: "#10B981", to: "#F59E0B" },
  { from: "#EC4899", via: "#F472B6", to: "#7C3AED" },
  { from: "#1E40AF", via: "#0891B2", to: "#22D3EE" }
];
var TIER_ACCENTS = {
  T60: { color: "#22D3EE", pulse: "#22D3EE", label: "1 HOUR" },
  T30: { color: "#A78BFA", pulse: "#A78BFA", label: "30 MIN" },
  T15: { color: "#F59E0B", pulse: "#FBBF24", label: "15 MIN" },
  LIVE: { color: "#EF4444", pulse: "#FB7185", label: "LIVE NOW" }
};
var LANG_INFO = {
  en: { headline: "Daily Community Call", subline: "Global \xB7 English \xB7 5 PM UTC \xB7 30 minutes", emoji: "\u{1F30D}" },
  hi: { headline: "Daily Community Call", subline: "Hindi / Urdu \xB7 9 PM IST \xB7 30 minutes", emoji: "\u{1F1EE}\u{1F1F3}" }
};
function paletteForDay() {
  const day = Math.floor(Date.now() / (1e3 * 60 * 60 * 24));
  return PALETTES[day % PALETTES.length];
}
function todayLabel(lang) {
  const d = /* @__PURE__ */ new Date();
  const opts = { weekday: "long", month: "short", day: "numeric" };
  try {
    return d.toLocaleDateString(lang === "hi" ? "en-IN" : "en-US", opts).toUpperCase();
  } catch {
    return d.toUTCString().slice(0, 16).toUpperCase();
  }
}
async function handler(req, res) {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    const lang = (url.searchParams.get("lang") || "en").toLowerCase();
    const tier = (url.searchParams.get("tier") || "T30").toUpperCase();
    const palette = paletteForDay();
    const accent = TIER_ACCENTS[tier] || TIER_ACCENTS.T30;
    const info = LANG_INFO[lang] || LANG_INFO.en;
    const dateStr = todayLabel(lang);
    const isLive = tier === "LIVE";
    const day = Math.floor(Date.now() / (1e3 * 60 * 60 * 24));
    const layout = day % 4;
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
      <stop offset="100%" stop-color="rgba(0,0,0,0.4)"/>
    </radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="20" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#vignette)"/>

  ${isLive ? `
  <!-- LIVE pulsing ring -->
  <circle cx="${layout % 2 === 0 ? 1050 : 150}" cy="120" r="60" fill="${accent.color}" opacity="0.6" filter="url(#glow)"/>
  <circle cx="${layout % 2 === 0 ? 1050 : 150}" cy="120" r="40" fill="${accent.color}"/>
  <text x="${layout % 2 === 0 ? 1050 : 150}" y="130" font-family="-apple-system, system-ui, sans-serif" font-weight="900" font-size="22" fill="white" text-anchor="middle" letter-spacing="2">LIVE</text>
  ` : ""}

  <!-- Big language emoji watermark -->
  <text x="${layout < 2 ? 1130 : 70}" y="510" font-size="280" text-anchor="${layout < 2 ? "end" : "start"}" opacity="0.85"
        style="filter: drop-shadow(0 8px 30px rgba(0,0,0,0.3));">
    ${info.emoji}
  </text>

  <!-- Top brand row -->
  <g transform="translate(80, 80)">
    <rect x="0" y="0" rx="999" ry="999" width="200" height="48" fill="rgba(255,255,255,0.95)"/>
    <text x="100" y="32" font-family="-apple-system, system-ui, sans-serif" font-weight="800"
          font-size="14" fill="${palette.from}" text-anchor="middle" letter-spacing="3">
      TURBO LOOP
    </text>
  </g>

  <!-- Tier countdown pill (top-right or top-left depending on layout) -->
  <g transform="translate(${layout < 2 ? "920" : "300"}, 80)">
    <rect x="0" y="0" rx="999" ry="999" width="${accent.label.length * 16 + 60}" height="48"
          fill="${isLive ? "rgba(239,68,68,0.95)" : "rgba(15,23,42,0.6)"}"
          stroke="${isLive ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}" stroke-width="${isLive ? 2 : 1}"/>
    <circle cx="22" cy="24" r="5" fill="${accent.pulse}">
      ${isLive ? `<animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite"/>` : ""}
    </circle>
    <text x="${(accent.label.length * 16 + 60) / 2 + 10}" y="32" font-family="-apple-system, system-ui, sans-serif" font-weight="900"
          font-size="14" fill="white" text-anchor="middle" letter-spacing="2.5">
      ${accent.label}
    </text>
  </g>

  <!-- Main headline -->
  <text x="80" y="290" font-family="-apple-system, system-ui, sans-serif" font-weight="800"
        font-size="76" fill="white" letter-spacing="-2"
        style="filter: drop-shadow(0 4px 24px rgba(0,0,0,0.5));">
    ${info.headline}
  </text>

  <!-- Subline -->
  <text x="80" y="370" font-family="-apple-system, system-ui, sans-serif" font-weight="500"
        font-size="32" fill="rgba(255,255,255,0.92)" letter-spacing="-0.5">
    ${info.subline}
  </text>

  <!-- Date strip -->
  <text x="80" y="430" font-family="-apple-system, system-ui, sans-serif" font-weight="700"
        font-size="20" fill="rgba(255,255,255,0.65)" letter-spacing="3">
    ${dateStr}
  </text>

  <!-- Bottom divider + CTA -->
  <line x1="80" y1="540" x2="1120" y2="540" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>

  <text x="80" y="585" font-family="-apple-system, system-ui, sans-serif" font-weight="700"
        font-size="22" fill="rgba(255,255,255,0.9)" letter-spacing="0.5">
    ${isLive ? "\u25B6  Tap to join now" : "\u25B6  Tap below to join"}
  </text>

  <text x="1120" y="585" font-family="-apple-system, system-ui, sans-serif" font-weight="500"
        font-size="18" fill="rgba(255,255,255,0.55)" letter-spacing="2" text-anchor="end">
    turboloop.tech
  </text>
</svg>`;
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    res.statusCode = 200;
    res.end(svg);
  } catch (err) {
    console.error("[og-zoom]", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end(`og-zoom error: ${err?.message || err}`);
  }
}
