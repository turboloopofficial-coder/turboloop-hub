// One-shot uploader for the Hub Promotion banner set. Drops 14 PNGs
// into R2 under hub-promo/<filename>.png with the same cache + content-
// type config we use for monthly banners + cinematic thumbs.
//
// Usage:
//   node scripts/upload-hub-promo.mjs
//   node scripts/upload-hub-promo.mjs <source-dir>

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const {
  R2_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

if (
  !R2_ENDPOINT ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME ||
  !R2_PUBLIC_URL
) {
  console.error("Missing R2 env vars. Need R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL.");
  process.exit(1);
}

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const FILES = [
  "hub-promo-apply.png",
  "hub-promo-blog.png",
  "hub-promo-calculator-de.png",
  "hub-promo-calculator.png",
  "hub-promo-code-is-law.png",
  "hub-promo-community.png",
  "hub-promo-creatives.png",
  "hub-promo-ecosystem.png",
  "hub-promo-faq.png",
  "hub-promo-films.png",
  "hub-promo-leaderboard.png",
  "hub-promo-learn.png",
  "hub-promo-roadmap.png",
  "hub-promo-security.png",
];

const KEY_PREFIX = "hub-promo/";

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function main() {
  const arg = process.argv[2];
  const sourceDir = arg
    ? path.resolve(arg)
    : "C:\\Users\\DEV NARSI\\Downloads\\hub-promo-banners-final";

  if (!fs.existsSync(sourceDir)) {
    console.error(`Source folder not found: ${sourceDir}`);
    process.exit(1);
  }

  console.log(`📤 Uploading ${FILES.length} hub-promo banners`);
  console.log(`   source: ${sourceDir}`);
  console.log(`   bucket: ${R2_BUCKET_NAME} (prefix: ${KEY_PREFIX})\n`);

  let uploaded = 0;
  let missing = 0;
  for (const file of FILES) {
    const localPath = path.join(sourceDir, file);
    if (!fs.existsSync(localPath)) {
      console.log(`  · skip ${file} (not found)`);
      missing++;
      continue;
    }
    try {
      const body = fs.readFileSync(localPath);
      await s3.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: `${KEY_PREFIX}${file}`,
          Body: body,
          ContentType: "image/png",
          CacheControl: "public, max-age=31536000, immutable",
        })
      );
      console.log(`  ✓ ${KEY_PREFIX}${file} (${(body.length / 1024).toFixed(0)} KB)`);
      uploaded++;
    } catch (err) {
      console.error(`  ✗ ${file} — ${err?.message ?? err}`);
    }
  }

  console.log(
    `\n${uploaded === FILES.length ? "✅" : "⚠️ "} Uploaded ${uploaded}/${FILES.length} banners (${missing} missing).`
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
