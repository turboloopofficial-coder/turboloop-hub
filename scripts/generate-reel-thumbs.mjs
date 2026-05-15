// Generate 9 custom reel thumbnails (3 concepts × 3 languages) and
// upload to R2 under reel-thumbs/<lang>/<concept>.png.
//
// Each thumbnail is 720×1280 (9:16 phone aspect — matches the reel
// player on the marketing site). Pure SVG composited via sharp, no
// external font dependency beyond what librsvg pulls from system Arial
// fallback — we deliberately keep the type to common system sans-serif
// so the renderer doesn't need to bundle TTFs.
//
// Concepts (matches the three reel definitions in next-app/lib/reelsData.ts):
//   v1-withdrawal  — cyan→blue gradient, key glyph, "WITHDRAW"
//   v2-investment  — gold→amber gradient, chart glyph, "RETURNS / RENDITEN / HASIL"
//   v3-lp-check    — magenta→purple gradient, lock glyph, "$34.7M LOCKED"
//
// Usage:
//   node scripts/generate-reel-thumbs.mjs            (generates + uploads)
//   node scripts/generate-reel-thumbs.mjs --dry-run  (writes locally, no upload)

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const {
  R2_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

const dryRun = process.argv.includes("--dry-run");

if (!dryRun && (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL)) {
  console.error("Missing R2 env vars (or use --dry-run for local-only).");
  process.exit(1);
}

const WIDTH = 720;
const HEIGHT = 1280;

// Visual identity per concept. The gradient travels diagonally from
// top-left to bottom-right so the brand mark in the bottom-right
// stays legible against the darker end of the ramp.
const CONCEPTS = {
  "v1-withdrawal": {
    gradient: ["#0E7490", "#0891B2", "#22D3EE"], // teal → cyan
    accent: "#67E8F9",
    eyebrow: "Smart Contract",
    glyph: "⟶", // forward arrow (Unicode, present in most system fonts)
    headlines: {
      en: ["WITHDRAW", "LIKE A PRO"],
      de: ["PROFI-", "ABHEBUNG"],
      id: ["TARIK DANA", "SEPERTI PRO"],
    },
  },
  "v2-investment": {
    gradient: ["#92400E", "#D97706", "#FBBF24"], // amber → gold
    accent: "#FDE68A",
    eyebrow: "30-Day Loop",
    glyph: "↗", // up-right arrow
    headlines: {
      en: ["30 DAYS,", "REAL RETURNS"],
      de: ["30 TAGE,", "ECHTE RENDITE"],
      id: ["30 HARI,", "HASIL NYATA"],
    },
  },
  "v3-lp-check": {
    gradient: ["#581C87", "#7C3AED", "#A78BFA"], // deep purple → lavender
    accent: "#DDD6FE",
    eyebrow: "Liquidity Lock",
    glyph: "◆", // diamond — proxy for "locked / verified"
    headlines: {
      en: ["$34.7M", "LP LOCKED"],
      de: ["$34.7M", "GESICHERT"],
      id: ["$34.7M", "TERKUNCI"],
    },
  },
};

const LANGUAGES = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "de", label: "DE", flag: "🇩🇪" },
  { code: "id", label: "ID", flag: "🇮🇩" },
];

/** Build the SVG for one thumbnail. Layout:
 *    top strip   — small language tag (rounded pill)
 *    mid block   — large two-line headline, glyph behind it for depth
 *    bottom strip — vortex-style brand mark dot + "TurboLoop" wordmark */
function thumbnailSvg(conceptKey, langCode) {
  const concept = CONCEPTS[conceptKey];
  const lang = LANGUAGES.find(l => l.code === langCode);
  const [g1, g2, g3] = concept.gradient;
  const [line1, line2] = concept.headlines[langCode];

  // Headline auto-shrinks based on the longer line's character count so
  // DE/ID words like "ECHTE RENDITE" (13c) don't overflow. Buckets are
  // empirical — Arial Black at letter-spacing -2 averages ~0.58×size in
  // width, so a 13-char line at 70px ≈ 530px (fits comfortably in our
  // 600px safe-area width of 60px left padding to 720px right edge).
  const maxLen = Math.max(line1.length, line2.length);
  const titleSize =
    maxLen >= 13 ? 70
    : maxLen >= 11 ? 82
    : maxLen >= 9 ? 96
    : maxLen >= 7 ? 110
    : 124;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="${g1}"/>
      <stop offset="55%"  stop-color="${g2}"/>
      <stop offset="100%" stop-color="${g3}"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="60%"  stop-color="black" stop-opacity="0"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.35"/>
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
  </defs>

  <!-- backdrop -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)"/>

  <!-- huge ghost glyph for depth -->
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 80}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="780" font-weight="900"
        fill="${concept.accent}" fill-opacity="0.12"
        text-anchor="middle" dominant-baseline="middle"
        filter="url(#glow)">${concept.glyph}</text>

  <!-- language pill, top-right -->
  <g transform="translate(${WIDTH - 130}, 64)">
    <rect width="86" height="44" rx="22" ry="22"
          fill="rgba(0,0,0,0.42)" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
    <text x="43" y="29"
          font-family="Arial, Helvetica, sans-serif"
          font-size="22" font-weight="900"
          fill="white" text-anchor="middle"
          letter-spacing="3">${lang.label}</text>
  </g>

  <!-- eyebrow, top-left -->
  <text x="60" y="92"
        font-family="Arial, Helvetica, sans-serif"
        font-size="20" font-weight="700"
        fill="rgba(255,255,255,0.78)"
        letter-spacing="4">${concept.eyebrow.toUpperCase()}</text>

  <!-- two-line headline, vertically centered -->
  <text x="60" y="${HEIGHT / 2 - 30}"
        font-family="Arial Black, Arial, Helvetica, sans-serif"
        font-size="${titleSize}" font-weight="900"
        fill="white"
        letter-spacing="-2">${escapeXml(line1)}</text>
  <text x="60" y="${HEIGHT / 2 + titleSize - 5}"
        font-family="Arial Black, Arial, Helvetica, sans-serif"
        font-size="${titleSize}" font-weight="900"
        fill="${concept.accent}"
        letter-spacing="-2">${escapeXml(line2)}</text>

  <!-- bottom brand bar -->
  <g transform="translate(0, ${HEIGHT - 130})">
    <rect x="0" y="0" width="${WIDTH}" height="130" fill="rgba(0,0,0,0.35)"/>
    <circle cx="86" cy="65" r="26" fill="${concept.accent}"/>
    <circle cx="86" cy="65" r="18" fill="${g1}"/>
    <text x="130" y="58"
          font-family="Arial Black, Arial, Helvetica, sans-serif"
          font-size="34" font-weight="900"
          fill="white"
          letter-spacing="-1">TurboLoop</text>
    <text x="130" y="92"
          font-family="Arial, Helvetica, sans-serif"
          font-size="20" font-weight="600"
          fill="rgba(255,255,255,0.72)"
          letter-spacing="2">turboloop.tech</text>
  </g>
</svg>`;
}

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function renderToPng(svg, outPath) {
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(outPath, png);
  return png.length;
}

async function main() {
  const outDir = path.resolve("./tmp-reel-thumbs");
  fs.mkdirSync(outDir, { recursive: true });

  const jobs = [];
  for (const conceptKey of Object.keys(CONCEPTS)) {
    for (const lang of LANGUAGES) {
      jobs.push({ conceptKey, lang });
    }
  }

  console.log(`Generating ${jobs.length} reel thumbnails…\n`);

  const s3 = dryRun
    ? null
    : new S3Client({
        region: "auto",
        endpoint: R2_ENDPOINT,
        credentials: {
          accessKeyId: R2_ACCESS_KEY_ID,
          secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
      });

  let okCount = 0;
  for (const { conceptKey, lang } of jobs) {
    const svg = thumbnailSvg(conceptKey, lang.code);
    const localPath = path.join(outDir, `${lang.code}-${conceptKey}.png`);
    const bytes = await renderToPng(svg, localPath);
    const r2Key = `reel-thumbs/${lang.code}/${conceptKey}.png`;
    if (s3) {
      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: r2Key,
            Body: fs.readFileSync(localPath),
            ContentType: "image/png",
            CacheControl: "public, max-age=31536000, immutable",
          })
        );
        const url = `${R2_PUBLIC_URL.replace(/\/$/, "")}/${r2Key}`;
        console.log(`  ✓ ${url} (${(bytes / 1024).toFixed(0)} KB)`);
        okCount++;
      } catch (err) {
        console.error(`  ✗ ${r2Key} — ${err?.message ?? err}`);
      }
    } else {
      console.log(`  · ${localPath} (${(bytes / 1024).toFixed(0)} KB) [dry-run]`);
      okCount++;
    }
  }

  console.log(
    `\n${okCount === jobs.length ? "✅" : "⚠️ "} ${okCount}/${jobs.length} thumbnails ${dryRun ? "rendered" : "uploaded"}.`
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
