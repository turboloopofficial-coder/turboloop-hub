// Upload all monthly banners from a single-language folder to R2.
//
// Differs from upload-monthly-banners.mjs in two ways:
//   1. Takes a language flag (--lang en|de) so a folder can be ALL-EN
//      or ALL-DE without having to pre-rename files.
//   2. Fuzzy-matches whatever filenames the user has against the
//      expected key list (50, 100, 500, 1000, 1500, 2000, 5000,
//      10000, 50000, grand-master). Handles "$50_banner.png",
//      "Monthly-1500.png", "10K Tier.png", "GrandMaster.png", etc.
//
// Usage:
//   node scripts/upload-banners-from-folder.mjs --lang en --dir "C:/Users/DEV NARSI/Downloads/TurboLoop_Monthly_Banners"
//   node scripts/upload-banners-from-folder.mjs --lang de --dir "C:/Users/DEV NARSI/Downloads/TurboLoop_Monthly_German_Banners"

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

if (
  !R2_ENDPOINT ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME ||
  !R2_PUBLIC_URL
) {
  console.error(
    "Missing R2 env vars in .env (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL)."
  );
  process.exit(1);
}

// ───────────────────────── arg parsing ───────────────────────────────────
const argv = process.argv.slice(2);
function arg(name) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : null;
}

const lang = arg("lang");
const dir = arg("dir");

if (!lang || !["en", "de"].includes(lang)) {
  console.error("Required: --lang en|de");
  process.exit(1);
}
if (!dir) {
  console.error("Required: --dir <folder containing the PNG banners>");
  process.exit(1);
}
if (!fs.existsSync(dir)) {
  console.error(`Folder not found: ${dir}`);
  process.exit(1);
}

// ───────────────────────── fuzzy matcher ─────────────────────────────────
const NUMERIC_KEYS = [50000, 10000, 5000, 2000, 1500, 1000, 500, 100, 50];

/** Return the canonical key string this filename refers to, or null if
 *  the filename doesn't look like one of our expected tiers. */
function matchKey(filename) {
  const name = filename.toLowerCase().replace(/\.[^.]+$/, ""); // strip extension

  // Grand Master — multiple aliases people commonly use, including the
  // German variants (gesamt = "total", übersicht = "overview", abschluss
  // = "conclusion") that tend to come up in finale/summary banners.
  if (
    /grand[-_\s]*master|\bgm\b|legend|elite|premium|top[-_\s]*tier|finale|gesamt|uebersicht|übersicht|abschluss|gipfel|maximal/.test(
      name
    )
  ) {
    return "grand-master";
  }

  // <number>K shorthand (50k → 50000, 1k → 1000). Check before raw numerics
  // so "10K" doesn't get misread as 10.
  const kMatch = name.match(/(?<![\d])(\d+)\s*k\b/);
  if (kMatch) {
    const n = parseInt(kMatch[1], 10) * 1000;
    if (NUMERIC_KEYS.includes(n)) return String(n);
  }

  // Plain numeric, longest-first to avoid prefix collisions
  // (50000 must beat 5000 must beat 500 must beat 50).
  for (const k of NUMERIC_KEYS) {
    const re = new RegExp(`(?<![0-9])${k}(?![0-9])`);
    if (re.test(name)) return String(k);
  }

  return null;
}

// ───────────────────────── upload ────────────────────────────────────────
const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function uploadOne(localPath, key) {
  const body = fs.readFileSync(localPath);
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: "image/png",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return body.length;
}

async function main() {
  console.log(`📤 Uploading ${lang.toUpperCase()} banners from ${dir}\n`);

  const files = fs
    .readdirSync(dir)
    .filter(f => /\.png$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.error(`No PNG files in ${dir}`);
    process.exit(1);
  }

  // Build mapping first so we can detect collisions and report cleanly
  // before any network call.
  const mapping = new Map(); // key → { file, sourcePath }
  const skipped = [];

  for (const file of files) {
    const key = matchKey(file);
    if (!key) {
      skipped.push({ file, reason: "no key match" });
      continue;
    }
    if (mapping.has(key)) {
      skipped.push({
        file,
        reason: `key "${key}" already taken by ${mapping.get(key).file}`,
      });
      continue;
    }
    mapping.set(key, { file, sourcePath: path.join(dir, file) });
  }

  // Print the plan
  console.log("Plan:");
  for (const [key, { file }] of mapping) {
    console.log(`  ${file.padEnd(50)} → monthly-${lang}-${key}.png`);
  }
  if (skipped.length > 0) {
    console.log("\nSkipped:");
    for (const { file, reason } of skipped) {
      console.log(`  ${file} — ${reason}`);
    }
  }
  console.log("");

  // Execute
  let uploaded = 0;
  for (const [key, { file, sourcePath }] of mapping) {
    const r2Key = `monthly-banners/monthly-${lang}-${key}.png`;
    try {
      const bytes = await uploadOne(sourcePath, r2Key);
      console.log(
        `  ✓ ${r2Key} (${(bytes / 1024).toFixed(0)} KB) ← ${file}`
      );
      uploaded++;
    } catch (err) {
      console.error(`  ✗ ${r2Key} — ${err?.message ?? err}`);
    }
  }

  const expected = 10;
  console.log(
    `\n${
      uploaded === expected ? "✅" : "⚠️ "
    } Uploaded ${uploaded}/${expected} ${lang.toUpperCase()} banners.${
      uploaded < expected
        ? ` Missing keys: ${[...["50","100","500","1000","1500","2000","5000","10000","50000","grand-master"].filter(k => !mapping.has(k))].join(", ")}`
        : ""
    }`
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
