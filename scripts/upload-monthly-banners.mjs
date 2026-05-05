// Upload the 20 Monthly Compounding banners (10 EN + 10 DE) to R2.
//
// Usage:
//   node scripts/upload-monthly-banners.mjs                                 # uses scripts/source/monthly-banners/
//   node scripts/upload-monthly-banners.mjs ./path/to/your/banners          # override source dir
//
// Expects each image at <source>/monthly-<lang>-<amount>.png where
//   lang = en | de
//   amount ∈ { 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000 }
//
// Files that don't exist are skipped with a warning so you can upload
// partial batches during preview without aborting the whole run.

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
  console.error("Missing R2 env vars. Check .env (need R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL).");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const AMOUNTS = [50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000];
const LANGS = ["en", "de"];
const KEY_PREFIX = "monthly-banners/";

async function uploadOne(localPath, key) {
  const body = fs.readFileSync(localPath);
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: "image/png",
      // Cron-master appends ?v=<dayOfYear> when fetching from R2 in case we
      // ever regenerate banners; the immutable cache is safe.
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  const url = `${R2_PUBLIC_URL}/${key}`;
  console.log(`  ✓ ${key} (${(body.length / 1024).toFixed(0)} KB) → ${url}`);
  return url;
}

async function main() {
  const projectRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    ".."
  );
  const arg = process.argv[2];
  const sourceDir = arg
    ? path.resolve(arg)
    : path.join(projectRoot, "scripts", "source", "monthly-banners");

  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    console.error(
      "Create it and drop the 20 banner PNGs in, or pass a path as the first argument."
    );
    process.exit(1);
  }

  console.log(`📤 Uploading monthly compounding banners`);
  console.log(`   source: ${sourceDir}`);
  console.log(`   bucket: ${R2_BUCKET_NAME} (key prefix: ${KEY_PREFIX})\n`);

  let uploaded = 0;
  let missing = 0;
  for (const lang of LANGS) {
    for (const monthly of AMOUNTS) {
      const filename = `monthly-${lang}-${monthly}.png`;
      const localPath = path.join(sourceDir, filename);
      const key = `${KEY_PREFIX}${filename}`;
      if (!fs.existsSync(localPath)) {
        console.log(`  · skip ${filename} (not found)`);
        missing++;
        continue;
      }
      try {
        await uploadOne(localPath, key);
        uploaded++;
      } catch (err) {
        console.error(`  ✗ ${filename} — ${err?.message ?? err}`);
      }
    }
  }

  console.log(
    `\n✅ Done. Uploaded ${uploaded}/${LANGS.length * AMOUNTS.length} banners (${missing} missing).`
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
