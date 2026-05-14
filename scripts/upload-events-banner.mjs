// One-off: push the /events OG banner up to R2. Tries the
// `turboloop-public` bucket first (per the team's explicit target),
// then falls back to whatever R2_BUCKET_NAME is set to in .env if that
// bucket doesn't exist. Either bucket maps to the same public r2.dev
// URL so the page metadata resolves either way.

import "dotenv/config";
import fs from "node:fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const SOURCE = "C:/Users/DEV NARSI/Downloads/hub-promo-events.png";
const KEY = "hub-promo/hub-promo-events.png";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const body = fs.readFileSync(SOURCE);
const sizeKB = (body.length / 1024).toFixed(0);

async function put(bucket) {
  return s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: KEY,
      Body: body,
      ContentType: "image/png",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
}

try {
  await put("turboloop-public");
  console.log(`✓ Uploaded to turboloop-public (${sizeKB} KB) → ${KEY}`);
} catch (err) {
  const code = err?.Code || err?.name;
  console.error(`✗ turboloop-public failed: ${code}`);
  const fallback = process.env.R2_BUCKET_NAME;
  if (!fallback) {
    throw err;
  }
  console.error(`  retrying with R2_BUCKET_NAME = ${fallback}`);
  await put(fallback);
  console.log(`✓ Uploaded to ${fallback} (${sizeKB} KB) → ${KEY}`);
}
