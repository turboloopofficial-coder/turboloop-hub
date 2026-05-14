// Overwrite reels/{en,de,id}/* on R2 with the curated TurboLoop_Complete
// set. Keys match the existing reelsData.ts layout so the data file
// can keep its URL pattern; only titles/descriptions get the per-
// language localization treatment.
//
// Run:  node scripts/upload-reels-v2.mjs

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const BASE = "C:/Users/DEV NARSI/Downloads/TurboLoop_Complete (1)/TurboLoop_Complete";

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
  console.log(`  ✓ ${key} (${size}) ← ${path.basename(localPath)}`);
  return true;
}

/** Per-language source-filename → R2-key mapping. Filenames are
 *  consistent across languages except the final "_<Language>" suffix. */
const REELS = [
  // English
  { lang: "en", dir: "English", vid: "V1_Withdrawal_English.mp4",   thumb: "V1_EN_thumbnail.png", slug: "v1-withdrawal" },
  { lang: "en", dir: "English", vid: "V2_Investment_English.mp4",   thumb: "V2_EN_thumbnail.png", slug: "v2-investment" },
  { lang: "en", dir: "English", vid: "V3_LP_Check_English.mp4",     thumb: "V3_EN_thumbnail.png", slug: "v3-lp-check" },
  // German
  { lang: "de", dir: "German",  vid: "V1_Withdrawal_German.mp4",    thumb: "V1_DE_thumbnail.png", slug: "v1-withdrawal" },
  { lang: "de", dir: "German",  vid: "V2_Investment_German.mp4",    thumb: "V2_DE_thumbnail.png", slug: "v2-investment" },
  { lang: "de", dir: "German",  vid: "V3_LP_Check_German.mp4",      thumb: "V3_DE_thumbnail.png", slug: "v3-lp-check" },
  // Indonesian
  { lang: "id", dir: "Indonesian", vid: "V1_Withdrawal_Indonesian.mp4", thumb: "V1_ID_thumbnail.png", slug: "v1-withdrawal" },
  { lang: "id", dir: "Indonesian", vid: "V2_Investment_Indonesian.mp4", thumb: "V2_ID_thumbnail.png", slug: "v2-investment" },
  { lang: "id", dir: "Indonesian", vid: "V3_LP_Check_Indonesian.mp4",   thumb: "V3_ID_thumbnail.png", slug: "v3-lp-check" },
];

async function main() {
  console.log(`📤 Uploading reels to bucket "${bucket}"\n`);
  let ok = 0;
  let fail = 0;

  for (const r of REELS) {
    const vidLocal = path.join(BASE, r.dir, "Videos", r.vid);
    const thumbLocal = path.join(BASE, r.dir, "Thumbnails", r.thumb);
    const vidKey = `reels/${r.lang}/${r.slug}.mp4`;
    const thumbKey = `reels/${r.lang}/${r.slug}.png`;
    try {
      const a = await put(vidLocal, vidKey, "video/mp4");
      const b = await put(thumbLocal, thumbKey, "image/png");
      a ? ok++ : fail++;
      b ? ok++ : fail++;
    } catch (e) {
      console.error(`  ✗ ${r.lang}/${r.slug} — ${e?.message ?? e}`);
      fail++;
    }
  }

  // Also refresh the Port Harcourt invite from this bundle (English
  // folder has the latest Invitation_Video_English.mp4).
  const inviteLocal = path.join(BASE, "English", "Videos", "Invitation_Video_English.mp4");
  try {
    const did = await put(inviteLocal, "events/upcoming/port-harcourt-invite.mp4", "video/mp4");
    did ? ok++ : fail++;
  } catch (e) {
    console.error(`  ✗ invite — ${e?.message ?? e}`);
    fail++;
  }

  console.log(`\n${fail === 0 ? "✅" : "⚠️ "} ${ok} uploaded, ${fail} failed.`);
  if (fail > 0) process.exitCode = 1;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
