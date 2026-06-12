/**
 * Upload all 75 new TurboLoop banners to R2.
 * 
 * Mapping strategy:
 * - Zoom banners: T60_EN_V1_* → hub-promo-zoom-en-t60-v1.png
 * - Hub promo banners: Calculator_V1_* → hub-promo-calculator-v1.png
 *   (new v1/v2/v3 rotation — message pools will be updated separately)
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, readdirSync } from "fs";
import { join, basename } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://68826d73a0ff6068b5a37bb3ded7e980.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: "75a41881f1540f2f8b2866e9faac6979",
    secretAccessKey: "0e2cf5c2fc729e16f715c83e10434d0238606000f28693948489f6400933770b",
  },
});

const BUCKET = "turboloop-assets";
const BANNER_DIR = "/home/ubuntu/new-banners/TurboLoop_Banners";

// ─── Zoom banner mapping ───────────────────────────────────────────
// Source: zoom_call_banners/english/T60_EN_V1_NeonCyberpunk.png
// Target: hub-promo/hub-promo-zoom-en-t60-v1.png
const ZOOM_TIER_MAP = { "T60": "t60", "T30": "t30", "T15": "t15", "LIVE": "live" };
const ZOOM_LANG_MAP = { "EN": "en", "HI": "hi" };

function parseZoomFilename(filename) {
  // e.g. T60_EN_V1_NeonCyberpunk.png
  const match = filename.match(/^(T60|T30|T15|LIVE)_(EN|HI)_(V\d)_/);
  if (!match) return null;
  const [, tier, lang, variant] = match;
  const t = ZOOM_TIER_MAP[tier];
  const l = ZOOM_LANG_MAP[lang];
  const v = variant.toLowerCase(); // V1 → v1
  return `hub-promo/hub-promo-zoom-${l}-${t}-${v}.png`;
}

// ─── Hub promo banner mapping ──────────────────────────────────────
// Source: hub_promo_banners/Calculator_V1_NeonNumbers.png
// Target: hub-promo/hub-promo-calculator-v1.png
const HUB_PAGE_MAP = {
  "Calculator": "calculator",
  "Community": "community",
  "Compound": "compound",
  "Dashboard": "dashboard",
  "Deposit": "deposit",
  "Ecosystem": "ecosystem",
  "FAQ": "faq",
  "Films": "films",
  "Homepage": "homepage",
  "Leaderboard": "leaderboard",
  "Learn": "learn",
  "Plans": "plans",
  "Profile": "profile",
  "Referral": "referral",
  "Roadmap": "roadmap",
  "Security": "security",
  "Withdraw": "withdraw",
};

function parseHubFilename(filename) {
  // e.g. Calculator_V1_NeonNumbers.png
  const match = filename.match(/^([A-Za-z]+)_(V\d)_/);
  if (!match) return null;
  const [, page, variant] = match;
  const slug = HUB_PAGE_MAP[page];
  if (!slug) return null;
  const v = variant.toLowerCase();
  return `hub-promo/hub-promo-${slug}-${v}.png`;
}

async function uploadFile(localPath, r2Key) {
  const body = readFileSync(localPath);
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    Body: body,
    ContentType: "image/png",
    CacheControl: "public, max-age=86400",
  }));
  console.log(`✅ ${r2Key}`);
}

async function main() {
  let uploaded = 0;
  let skipped = 0;

  // Upload zoom banners
  for (const lang of ["english", "hindi"]) {
    const dir = join(BANNER_DIR, "zoom_call_banners", lang);
    for (const file of readdirSync(dir).filter(f => f.endsWith(".png"))) {
      const r2Key = parseZoomFilename(file);
      if (!r2Key) { console.warn(`⚠️  Could not map zoom: ${file}`); skipped++; continue; }
      await uploadFile(join(dir, file), r2Key);
      uploaded++;
    }
  }

  // Upload hub promo banners
  const hubDir = join(BANNER_DIR, "hub_promo_banners");
  for (const file of readdirSync(hubDir).filter(f => f.endsWith(".png"))) {
    const r2Key = parseHubFilename(file);
    if (!r2Key) { console.warn(`⚠️  Could not map hub: ${file}`); skipped++; continue; }
    await uploadFile(join(hubDir, file), r2Key);
    uploaded++;
  }

  console.log(`\n🎉 Done! Uploaded: ${uploaded}, Skipped: ${skipped}`);
}

main().catch(console.error);
