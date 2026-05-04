// Generate the PWA icon set from the existing R2-hosted brand logo.
// Outputs: 192×192, 512×512, 512×512-maskable, 180×180 (apple-touch-icon).
//
// Run with: node scripts/generate-pwa-icons.mjs
// Re-run when the brand logo changes. The output PNGs are committed to the
// repo (in client/public/) so Vite ships them as static assets.

import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "client", "public", "pwa");
await fs.mkdir(outDir, { recursive: true });

const SOURCE_URL =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png";

console.log(`📥 Fetching brand logo from ${SOURCE_URL}`);
const res = await fetch(SOURCE_URL);
if (!res.ok) {
  console.error(`❌ Failed to fetch logo: ${res.status}`);
  process.exit(1);
}
const sourceBytes = Buffer.from(await res.arrayBuffer());
console.log(`✓ Fetched ${(sourceBytes.length / 1024).toFixed(1)} KB`);

// 1. 192×192 — standard PWA icon
await sharp(sourceBytes)
  .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(outDir, "icon-192.png"));
console.log("  ✓ icon-192.png");

// 2. 512×512 — high-res standard
await sharp(sourceBytes)
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(outDir, "icon-512.png"));
console.log("  ✓ icon-512.png");

// 3. 512×512 maskable — fills the safe zone (80% of canvas, centered)
//    Background is the brand cyan→purple gradient so Android's mask
//    (circle, squircle, etc.) gets a solid-color edge. The logo is
//    inset to 80% per Maskable spec.
const SAFE_ZONE_INSET = 51; // ~10% inset on each side = 80% safe zone
const gradientBg = await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 8, g: 145, b: 178, alpha: 1 }, // #0891B2
  },
})
  .composite([
    {
      input: Buffer.from(
        `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#0891B2"/>
              <stop offset="100%" stop-color="#7C3AED"/>
            </linearGradient>
          </defs>
          <rect width="512" height="512" fill="url(#g)"/>
        </svg>`
      ),
      top: 0,
      left: 0,
    },
  ])
  .png()
  .toBuffer();

const innerLogo = await sharp(sourceBytes)
  .resize(512 - SAFE_ZONE_INSET * 2, 512 - SAFE_ZONE_INSET * 2, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

await sharp(gradientBg)
  .composite([{ input: innerLogo, top: SAFE_ZONE_INSET, left: SAFE_ZONE_INSET }])
  .png()
  .toFile(path.join(outDir, "icon-512-maskable.png"));
console.log("  ✓ icon-512-maskable.png");

// 4. 180×180 — apple-touch-icon (iOS uses this verbatim, no masking)
await sharp(sourceBytes)
  .resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png()
  .toFile(path.join(outDir, "apple-touch-icon.png"));
console.log("  ✓ apple-touch-icon.png");

console.log(`\n✅ Wrote 4 icons to ${path.relative(root, outDir)}`);
