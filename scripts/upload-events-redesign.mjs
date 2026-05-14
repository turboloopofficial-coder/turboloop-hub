// Re-upload Lagos past-event + Port Harcourt upcoming-event media to
// clean R2 keys per the team's organized folder layout:
//
//   events/past/lagos/photos/photo-01.jpg .. photo-06.jpg
//   events/past/lagos/videos/main.mp4 + clip-01.mp4 .. clip-05.mp4
//   events/upcoming/port-harcourt-invite.mp4
//
// Source folders are in C:\Users\DEV NARSI\Downloads\Event page Media\.
// Idempotent — re-running just overwrites.

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const BASE = "C:/Users/DEV NARSI/Downloads/Event page Media";
const PHOTOS_DIR = `${BASE}/past event images`;
const VIDEOS_DIR = `${BASE}/past event Videos`;
const UPCOMING_DIR = `${BASE}/Upcoming Events`;

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
    console.error(`  · MISSING ${localPath}`);
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
  const size =
    body.length > 1024 * 1024
      ? `${(body.length / 1024 / 1024).toFixed(1)} MB`
      : `${(body.length / 1024).toFixed(0)} KB`;
  console.log(`  ✓ ${key} (${size})`);
  return true;
}

// Photos — sorted in the order WhatsApp delivers them, which roughly
// follows capture time. Indexed 01..06 so the data file stays clean.
const PHOTOS = [
  "WhatsApp Image 2026-05-14 at 1.17.34 PM.jpeg",
  "WhatsApp Image 2026-05-14 at 1.17.35 PM.jpeg",
  "WhatsApp Image 2026-05-14 at 1.17.35 PM (1).jpeg",
  "WhatsApp Image 2026-05-14 at 1.17.35 PM (2).jpeg",
  "WhatsApp Image 2026-05-14 at 1.17.36 PM.jpeg",
  "WhatsApp Image 2026-05-14 at 1.17.36 PM (1).jpeg",
];

const VIDEOS = [
  // 0-index 0 is the main feature (TURBO LOOP y); the rest are clips.
  "TURBO LOOP y.mp4",
  "VID-20260514-WA0016.mp4",
  "VID-20260514-WA0017.mp4",
  "VID-20260514-WA0018.mp4",
  "VID-20260514-WA0019.mp4",
  "VID-20260514-WA0020.mp4",
];

async function main() {
  console.log(`📤 Uploading to bucket "${bucket}"\n`);
  let ok = 0;
  let fail = 0;

  console.log("Photos → events/past/lagos/photos/");
  for (let i = 0; i < PHOTOS.length; i++) {
    const local = path.join(PHOTOS_DIR, PHOTOS[i]);
    const key = `events/past/lagos/photos/photo-${String(i + 1).padStart(2, "0")}.jpg`;
    try {
      const did = await put(local, key, "image/jpeg");
      did ? ok++ : fail++;
    } catch (e) {
      console.error(`  ✗ ${key} — ${e?.message ?? e}`);
      fail++;
    }
  }

  console.log("\nVideos → events/past/lagos/videos/");
  for (let i = 0; i < VIDEOS.length; i++) {
    const local = path.join(VIDEOS_DIR, VIDEOS[i]);
    const key =
      i === 0
        ? `events/past/lagos/videos/main.mp4`
        : `events/past/lagos/videos/clip-${String(i).padStart(2, "0")}.mp4`;
    try {
      const did = await put(local, key, "video/mp4");
      did ? ok++ : fail++;
    } catch (e) {
      console.error(`  ✗ ${key} — ${e?.message ?? e}`);
      fail++;
    }
  }

  console.log("\nUpcoming → events/upcoming/");
  try {
    const did = await put(
      path.join(UPCOMING_DIR, "Invitation_Video.mp4"),
      "events/upcoming/port-harcourt-invite.mp4",
      "video/mp4"
    );
    did ? ok++ : fail++;
  } catch (e) {
    console.error(`  ✗ port-harcourt-invite.mp4 — ${e?.message ?? e}`);
    fail++;
  }

  console.log(`\n${fail === 0 ? "✅" : "⚠️ "} ${ok} uploaded, ${fail} failed.`);
  if (fail > 0) process.exitCode = 1;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
