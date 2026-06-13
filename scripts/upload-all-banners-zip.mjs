// upload-all-banners-zip.mjs
// Uploads all three batches from TurboLoop_ALL_Banners.zip to R2.
//
// Batch 1 — TurboLoop_Zoom_4PM/  → zoom-banners/hub-promo-zoom-en-{tier}-v{n}.png
// Batch 2 — TurboLoop_Rebuilt/   → hub-promo/hub-promo-{file}
// Batch 3 — TurboLoop_Remaining/ → monthly-banners/, campaign-banners/, cinematic-thumbs/

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname, basename } from "path";
import { config } from "dotenv";

config({ path: new URL("../.env", import.meta.url).pathname });

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
const BASE   = "/home/ubuntu/all-banners-upload";

// Map local filename → R2 key for the zoom 4PM batch
// Local: zoom-en-t60-v1.png  →  R2: zoom-banners/hub-promo-zoom-en-t60-v1.png
function zoomKey(filename) {
  const name = basename(filename, extname(filename)); // zoom-en-t60-v1
  return `zoom-banners/hub-promo-${name}.png`;
}

// Map local filename → R2 key for hub-promo rebuilt batch
// Local: hub-promo-leaderboard-v1.png  →  R2: hub-promo/hub-promo-leaderboard-v1.png
function hubPromoKey(filename) {
  return `hub-promo/${basename(filename)}`;
}

// Map local path → R2 key for remaining batch (preserves subfolder)
// Local: monthly-banners/monthly-en-50.png  →  R2: monthly-banners/monthly-en-50.png
// Local: cinematic-thumbs/manifesto.png     →  R2: cinematic-thumbs/manifesto.jpg (convert ext)
function remainingKey(relPath) {
  // cinematic thumbs must be .jpg in R2
  if (relPath.startsWith("cinematic-thumbs/")) {
    return relPath.replace(/\.png$/, ".jpg");
  }
  return relPath;
}

async function upload(localPath, r2Key) {
  const body = readFileSync(localPath);
  const ct   = r2Key.endsWith(".jpg") ? "image/jpeg" : "image/png";
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    Body: body,
    ContentType: ct,
    CacheControl: "public, max-age=31536000",
  }));
  console.log(`✅  ${r2Key}`);
}

function walk(dir, base = dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walk(full, base));
    } else {
      results.push({ full, rel: full.slice(base.length + 1) });
    }
  }
  return results;
}

async function main() {
  const jobs = [];

  // Batch 1 — Zoom 4PM banners
  const zoomDir = join(BASE, "TurboLoop_Zoom_4PM");
  for (const { full, rel } of walk(zoomDir)) {
    if (!rel.match(/\.(png|jpg)$/i)) continue;
    jobs.push({ local: full, key: zoomKey(rel) });
  }

  // Batch 2 — Rebuilt hub-promo banners
  const rebuiltDir = join(BASE, "TurboLoop_Rebuilt/hub-promo");
  for (const { full, rel } of walk(rebuiltDir)) {
    if (!rel.match(/\.(png|jpg)$/i)) continue;
    jobs.push({ local: full, key: hubPromoKey(rel) });
  }

  // Batch 3 — Remaining (monthly, campaign, cinematic)
  const remainDir = join(BASE, "TurboLoop_Remaining");
  for (const { full, rel } of walk(remainDir)) {
    if (!rel.match(/\.(png|jpg)$/i)) continue;
    jobs.push({ local: full, key: remainingKey(rel) });
  }

  console.log(`Uploading ${jobs.length} files…\n`);
  for (const { local, key } of jobs) {
    await upload(local, key);
  }
  console.log(`\nDone — ${jobs.length} files uploaded.`);
}

main().catch(e => { console.error(e); process.exit(1); });
