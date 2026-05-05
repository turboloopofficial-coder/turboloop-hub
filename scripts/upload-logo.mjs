// Overwrite branding/turboloop-logo.png on R2 with a new file.
//
// Usage:
//   1. Save the new 3D vortex logo to scripts/source/branding/turboloop-logo.png
//      (or pass an absolute path as the first argument).
//   2. node scripts/upload-logo.mjs
//
// This overwrites the existing key so the live site picks up the new
// image immediately. Cloudflare's CDN caches at the edge, but the URL
// is referenced by Next/Image which already serves AVIF/WebP variants,
// so the browser will refetch on next route change.

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
  console.error(
    "Missing R2 env vars. Check .env (need R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL)."
  );
  process.exit(1);
}

const KEY = "branding/turboloop-logo.png";

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function main() {
  const projectRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    ".."
  );

  const arg = process.argv[2];
  const sourcePath = arg
    ? path.resolve(arg)
    : path.join(projectRoot, "scripts", "source", "branding", "turboloop-logo.png");

  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`);
    console.error(
      "Save the new logo PNG there, or pass an absolute path as the first argument."
    );
    process.exit(1);
  }

  const body = fs.readFileSync(sourcePath);
  console.log(`📤 Uploading ${sourcePath} (${(body.length / 1024).toFixed(1)} KB)`);
  console.log(`   → bucket: ${R2_BUCKET_NAME}, key: ${KEY}\n`);

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: KEY,
      Body: body,
      ContentType: "image/png",
      // Long max-age is fine — the URL is fixed; Next/Image handles
      // device-specific resizing client-side.
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  const publicUrl = `${R2_PUBLIC_URL}/${KEY}`;
  console.log(`✅ Uploaded.\n   ${publicUrl}\n`);
  console.log(
    "Heads-up: Cloudflare may cache the old image at edge for a few minutes."
  );
  console.log(
    "If you need an instant flush, hard-refresh once or append a ?v=N query."
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
