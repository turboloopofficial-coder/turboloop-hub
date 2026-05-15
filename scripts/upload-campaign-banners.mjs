// Upload the 15 May 2026 campaign banners (B1–B7 Port Harcourt countdown
// + A1–A8 Events page promo) to R2 under campaign-banners/.
//
// Pattern matches scripts/upload-banners-from-folder.mjs — same S3 client
// setup, same content type, same cache headers.
//
// Usage:
//   node scripts/upload-campaign-banners.mjs --dir "C:/Users/DEV NARSI/Downloads/Turbo Loop Hub assts/turboloop-campaign-banners"

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const {
  R2_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  console.error("Missing R2 env vars in .env (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL).");
  process.exit(1);
}

const argv = process.argv.slice(2);
const dirIdx = argv.indexOf("--dir");
const dir = dirIdx >= 0 ? argv[dirIdx + 1] : null;
if (!dir) {
  console.error("Required: --dir <folder containing PNG banners>");
  process.exit(1);
}
if (!fs.existsSync(dir)) {
  console.error(`Folder not found: ${dir}`);
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

// Map the source filename to a stable, public-friendly R2 key. We don't
// rely on alphabetic sort because B10 would land before B2; instead we
// extract the campaign letter + index from the prefix.
//
// Source:   B1-port-harcourt-save-the-date.png
// R2 key:   campaign-banners/B1.png
//
// Keeping the keys short means the public URL stays clean
// (https://pub-….r2.dev/campaign-banners/B1.png) and is easy to embed
// in Telegram captions / cron tables.
function r2KeyFor(filename) {
  const base = filename.replace(/\.[^.]+$/, "");
  const m = base.match(/^([AB])(\d+)/i);
  if (!m) return null;
  return `campaign-banners/${m[1].toUpperCase()}${m[2]}.png`;
}

async function uploadOne(localPath, key) {
  const body = fs.readFileSync(localPath);
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: "image/png",
      // 1y immutable — banners are tagged by ID; if content changes we
      // bump the suffix (e.g. B1-v2.png) rather than mutating in place.
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return body.length;
}

async function main() {
  console.log(`Uploading campaign banners from ${dir}\n`);

  const files = fs.readdirSync(dir).filter(f => /\.png$/i.test(f)).sort();
  if (files.length === 0) {
    console.error(`No PNG files in ${dir}`);
    process.exit(1);
  }

  const mapping = new Map();
  const skipped = [];

  for (const file of files) {
    const key = r2KeyFor(file);
    if (!key) {
      skipped.push({ file, reason: "filename doesn't start with A<n> or B<n>" });
      continue;
    }
    if (mapping.has(key)) {
      skipped.push({ file, reason: `key "${key}" already taken by ${mapping.get(key).file}` });
      continue;
    }
    mapping.set(key, { file, sourcePath: path.join(dir, file) });
  }

  console.log("Plan:");
  for (const [key, { file }] of mapping) {
    console.log(`  ${file.padEnd(48)} → ${key}`);
  }
  if (skipped.length > 0) {
    console.log("\nSkipped:");
    for (const { file, reason } of skipped) console.log(`  ${file} — ${reason}`);
  }
  console.log("");

  let uploaded = 0;
  let bytes = 0;
  for (const [key, { file, sourcePath }] of mapping) {
    try {
      const n = await uploadOne(sourcePath, key);
      bytes += n;
      uploaded++;
      const url = `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
      console.log(`  ✓ ${url} (${(n / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.error(`  ✗ ${key} — ${err?.message ?? err}`);
    }
  }

  const expected = 15;
  const totalMb = (bytes / 1024 / 1024).toFixed(2);
  console.log(
    `\n${uploaded === expected ? "✅" : "⚠️ "} Uploaded ${uploaded}/${expected} banners (${totalMb} MB total).`
  );
  if (uploaded < expected) {
    const missing = [
      ...Array.from({ length: 8 }, (_, i) => `A${i + 1}`),
      ...Array.from({ length: 7 }, (_, i) => `B${i + 1}`),
    ].filter(id => ![...mapping.keys()].some(k => k.endsWith(`/${id}.png`)));
    console.log(`Missing: ${missing.join(", ")}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
