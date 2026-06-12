// upload-final-75.mjs
// Uploads all 75 final banners from TurboLoop_Final_75_Banners.zip to R2.
//
// Folder → R2 key mapping:
//   zoom_en/zoom-en-{tier}-v{n}.png  → zoom-banners/hub-promo-zoom-en-{tier}-v{n}.png
//   zoom_hi/zoom-hi-{tier}-v{n}.png  → zoom-banners/hub-promo-zoom-hi-{tier}-v{n}.png
//   hub_promo/{Page}_V{n}.png        → hub-promo/hub-promo-{page}-v{n}.png
//     (PascalCase → lowercase, e.g. Leaderboard_V3 → hub-promo-leaderboard-v3)

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
const BASE   = "/home/ubuntu/final-75-banners/TurboLoop_Final_Banners";

function toR2Key(folder, filename) {
  const name = basename(filename, extname(filename)); // e.g. zoom-en-t60-v1 or Leaderboard_V3

  if (folder === "zoom_en" || folder === "zoom_hi") {
    // zoom-en-t60-v1 → zoom-banners/hub-promo-zoom-en-t60-v1.png
    return `zoom-banners/hub-promo-${name}.png`;
  }

  if (folder === "hub_promo") {
    // Leaderboard_V3 → hub-promo/hub-promo-leaderboard-v3.png
    // Split on last underscore before V to get page name and variant
    // Pattern: {PageName}_V{n}  e.g. Leaderboard_V3, FAQ_V1, Homepage_V2
    const match = name.match(/^(.+)_V(\d+)$/i);
    if (match) {
      const page    = match[1].toLowerCase(); // leaderboard, faq, homepage
      const variant = match[2];               // 1, 2, 3
      return `hub-promo/hub-promo-${page}-v${variant}.png`;
    }
  }

  // Fallback — keep as-is under hub-promo
  return `hub-promo/${name.toLowerCase()}.png`;
}

async function upload(localPath, r2Key) {
  const body = readFileSync(localPath);
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    Body: body,
    ContentType: "image/png",
    CacheControl: "public, max-age=31536000",
  }));
  console.log(`✅  ${r2Key}`);
}

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walk(full));
    } else if (entry.match(/\.(png|jpg)$/i)) {
      const folder = full.replace(BASE + "/", "").split("/")[0];
      results.push({ full, folder, filename: entry });
    }
  }
  return results;
}

async function main() {
  const files = walk(BASE);
  console.log(`Uploading ${files.length} files…\n`);

  for (const { full, folder, filename } of files) {
    const key = toR2Key(folder, filename);
    await upload(full, key);
  }

  console.log(`\nDone — ${files.length} files uploaded.`);
}

main().catch(e => { console.error(e); process.exit(1); });
