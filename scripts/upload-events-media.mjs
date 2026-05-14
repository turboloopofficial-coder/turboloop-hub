// One-off: push the Lagos past-event media + Port Harcourt upcoming-event
// media + the 9 multi-language reels to R2. All files land in
// turboloop-assets (the bucket R2_BUCKET_NAME resolves to) under
// stable keys; the public r2.dev URL serves them at the same prefix.
//
// Run once locally:  node scripts/upload-events-media.mjs
// Re-runnable: each PutObjectCommand is idempotent.

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const DL = "C:/Users/DEV NARSI/Downloads";
const EN_DIR = `${DL}/TurboLoop_English/TurboLoop_English`;
const DE_DIR = `${DL}/TurboLoop_German/TurboLoop_German`;
const ID_DIR = `${DL}/TurboLoop_Indonesian/TurboLoop_Indonesian`;

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const bucket = process.env.R2_BUCKET_NAME;

async function put(localPath, key, contentType) {
  if (!fs.existsSync(localPath)) {
    console.error(`  · MISSING ${localPath} — skipping ${key}`);
    return false;
  }
  const body = fs.readFileSync(localPath);
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  const kb = (body.length / 1024).toFixed(0);
  const sizeStr = body.length > 1024 * 1024
    ? `${(body.length / 1024 / 1024).toFixed(1)} MB`
    : `${kb} KB`;
  console.log(`  ✓ ${key} (${sizeStr})`);
  return true;
}

// Manifest — explicit source→destination mapping. Order: Lagos photos,
// Lagos main video, Lagos short clips, Port Harcourt banner + invite,
// reels (EN, DE, ID).
const UPLOADS = [
  // ─── Lagos past event ─────────────────────────────────────────────
  ["WhatsApp Image 2026-05-01 at 7.08.02 PM.jpeg", "events/past/lagos/lagos-1.jpg", "image/jpeg"],
  ["WhatsApp Image 2026-05-04 at 3.11.34 PM.jpeg", "events/past/lagos/lagos-2.jpg", "image/jpeg"],
  ["WhatsApp Image 2026-05-14 at 1.17.34 PM.jpeg", "events/past/lagos/lagos-3.jpg", "image/jpeg"],
  ["WhatsApp Image 2026-05-14 at 1.17.35 PM.jpeg", "events/past/lagos/lagos-4.jpg", "image/jpeg"],
  ["WhatsApp Image 2026-05-14 at 1.17.35 PM (1).jpeg", "events/past/lagos/lagos-5.jpg", "image/jpeg"],
  ["WhatsApp Image 2026-05-14 at 1.17.35 PM (2).jpeg", "events/past/lagos/lagos-6.jpg", "image/jpeg"],
  ["WhatsApp Image 2026-05-14 at 1.17.36 PM.jpeg", "events/past/lagos/lagos-7.jpg", "image/jpeg"],
  ["WhatsApp Image 2026-05-14 at 1.17.36 PM (1).jpeg", "events/past/lagos/lagos-8.jpg", "image/jpeg"],

  ["TURBO LOOP y.mp4",            "events/past/lagos/main.mp4",   "video/mp4"],
  ["VID-20260514-WA0016.mp4",     "events/past/lagos/clip-1.mp4", "video/mp4"],
  ["VID-20260514-WA0017.mp4",     "events/past/lagos/clip-2.mp4", "video/mp4"],
  ["VID-20260514-WA0018.mp4",     "events/past/lagos/clip-3.mp4", "video/mp4"],
  ["VID-20260514-WA0019.mp4",     "events/past/lagos/clip-4.mp4", "video/mp4"],
  ["VID-20260514-WA0020.mp4",     "events/past/lagos/clip-5.mp4", "video/mp4"],

  // ─── Port Harcourt upcoming event ────────────────────────────────
  ["photo_2026-05-14_13-17-30.jpg", "events/upcoming/port-harcourt-banner.jpg", "image/jpeg"],
];

// Port Harcourt invite video (lives under TurboLoop_English)
const PH_INVITE_LOCAL = `${EN_DIR}/Videos/Invitation_Video.mp4`;
const PH_INVITE_KEY = "events/upcoming/port-harcourt-invite.mp4";
const PH_INVITE_TYPE = "video/mp4";

// ─── Multi-language reels ───────────────────────────────────────────
const REELS = [
  // English
  { src: `${EN_DIR}/Videos/V1_Withdrawal_English.mp4`,    key: "reels/en/v1-withdrawal.mp4",   ct: "video/mp4" },
  { src: `${EN_DIR}/Videos/V2_Investment_English.mp4`,    key: "reels/en/v2-investment.mp4",   ct: "video/mp4" },
  { src: `${EN_DIR}/Videos/V3_LP_Check_English.mp4`,      key: "reels/en/v3-lp-check.mp4",     ct: "video/mp4" },
  { src: `${EN_DIR}/Thumbnails/V1_EN_thumbnail.png`,      key: "reels/en/v1-withdrawal.png",   ct: "image/png" },
  { src: `${EN_DIR}/Thumbnails/V2_EN_thumbnail.png`,      key: "reels/en/v2-investment.png",   ct: "image/png" },
  { src: `${EN_DIR}/Thumbnails/V3_EN_thumbnail.png`,      key: "reels/en/v3-lp-check.png",     ct: "image/png" },

  // German
  { src: `${DE_DIR}/Videos/V1_Withdrawal_German.mp4`,     key: "reels/de/v1-withdrawal.mp4",   ct: "video/mp4" },
  { src: `${DE_DIR}/Videos/V2_Investment_German.mp4`,     key: "reels/de/v2-investment.mp4",   ct: "video/mp4" },
  { src: `${DE_DIR}/Videos/V3_LP_Check_German.mp4`,       key: "reels/de/v3-lp-check.mp4",     ct: "video/mp4" },
  { src: `${DE_DIR}/Thumbnails/V1_DE_thumbnail.png`,      key: "reels/de/v1-withdrawal.png",   ct: "image/png" },
  { src: `${DE_DIR}/Thumbnails/V2_DE_thumbnail.png`,      key: "reels/de/v2-investment.png",   ct: "image/png" },
  { src: `${DE_DIR}/Thumbnails/V3_DE_thumbnail.png`,      key: "reels/de/v3-lp-check.png",     ct: "image/png" },

  // Indonesian
  { src: `${ID_DIR}/Videos/V1_Withdrawal_Tutorial_Indonesian.mp4`, key: "reels/id/v1-withdrawal.mp4", ct: "video/mp4" },
  { src: `${ID_DIR}/Videos/V2_Investment_Returns_Indonesian.mp4`,  key: "reels/id/v2-investment.mp4", ct: "video/mp4" },
  { src: `${ID_DIR}/Videos/V3_LP_Lock_Check_Indonesian.mp4`,       key: "reels/id/v3-lp-check.mp4",   ct: "video/mp4" },
  { src: `${ID_DIR}/Thumbnails/V1_ID_thumbnail.png`,               key: "reels/id/v1-withdrawal.png", ct: "image/png" },
  { src: `${ID_DIR}/Thumbnails/V2_ID_thumbnail.png`,               key: "reels/id/v2-investment.png", ct: "image/png" },
  { src: `${ID_DIR}/Thumbnails/V3_ID_thumbnail.png`,               key: "reels/id/v3-lp-check.png",   ct: "image/png" },
];

async function main() {
  console.log(`📤 Uploading to bucket "${bucket}"\n`);

  let ok = 0;
  let fail = 0;

  console.log("Lagos + Port Harcourt:");
  for (const [filename, key, type] of UPLOADS) {
    const localPath = path.join(DL, filename);
    try {
      const did = await put(localPath, key, type);
      did ? ok++ : fail++;
    } catch (e) {
      console.error(`  ✗ ${key} — ${e?.message ?? e}`);
      fail++;
    }
  }

  console.log("\nPort Harcourt invite video:");
  try {
    const did = await put(PH_INVITE_LOCAL, PH_INVITE_KEY, PH_INVITE_TYPE);
    did ? ok++ : fail++;
  } catch (e) {
    console.error(`  ✗ ${PH_INVITE_KEY} — ${e?.message ?? e}`);
    fail++;
  }

  console.log("\nReels (EN + DE + ID, vids + thumbs):");
  for (const r of REELS) {
    try {
      const did = await put(r.src, r.key, r.ct);
      did ? ok++ : fail++;
    } catch (e) {
      console.error(`  ✗ ${r.key} — ${e?.message ?? e}`);
      fail++;
    }
  }

  console.log(`\n${fail === 0 ? "✅" : "⚠️ "} ${ok} uploaded, ${fail} failed.`);
  if (fail > 0) process.exitCode = 1;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
