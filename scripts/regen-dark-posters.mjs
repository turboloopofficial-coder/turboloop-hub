// Regenerates the cinematic posters that came out too dark / too small.
// For each flagged slug:
//   1. Tries 10 candidate timestamps spanning the whole video
//   2. Extracts each as a JPG, measures file size (proxy for visual richness)
//   3. Picks the LARGEST frame (most complex = least likely to be solid black)
//   4. Uploads it to R2 at cinematic-thumbs/{slug}.jpg
//
// Why size as the picker: a black/dark frame compresses to a tiny JPG (5-25 KB),
// while a frame full of motion/text/color compresses to 80-400 KB. Picking the
// biggest one is a reliable proxy for "most visually interesting".

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const downloads = "C:/Users/DEV NARSI/Downloads";

const FLAGGED = [
  { slug: "bank-is-lying",                file: "YOUR BANK IS LYING TO YOU_1080p.mp4" },
  { slug: "system-not-built-for-you",     file: "THE SYSTEM WAS NEVER BUILT FOR YOU_1080p.mp4" },
  { slug: "smart-contract-bank-manager",  file: "The Smart Contract — Your New Bank Manager_1080p.mp4" },
  { slug: "code-is-law",                  file: "CODE IS LAW — THE TRANSPARENCY PROMISE_1080p.mp4" },
  { slug: "unbreakable-vault",            file: "SECURITY, AUDITS, AND THE UNBREAKABLE VAULT_1080p.mp4" },
  { slug: "defi-vs-banks",                file: "DEFI VS. BANKS — THE FINAL COMPARISON_1080p.mp4" },
  { slug: "compounding-secret",           file: "THE COMPOUNDING SECRET — TIME IS YOUR WEAPON_1080p.mp4" },
  { slug: "leadership-path",              file: "THE LEADERSHIP PATH — FROM MEMBER TO LEADER_1080p.mp4" },
];

const TIMESTAMPS = [0.5, 1.0, 1.5, 2.5, 4.0, 6.0, 9.0, 14.0, 22.0, 35.0, 50.0];

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});

async function uploadR2(localPath, key) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: fs.readFileSync(localPath),
    ContentType: "image/jpeg",
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

function getDuration(videoPath) {
  try {
    const out = execSync(`"${ffmpegPath}" -i "${videoPath}" 2>&1`, { encoding: "utf8" });
    const m = out.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (!m) return null;
    return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
  } catch { return null; }
}

function extractFrame(videoPath, ts, outPath) {
  try {
    execSync(
      `"${ffmpegPath}" -y -ss ${ts.toFixed(2)} -i "${videoPath}" -vf "scale=1280:-2,format=yuvj420p" -frames:v 1 -q:v 2 "${outPath}"`,
      { stdio: "pipe" }
    );
    return fs.existsSync(outPath) ? fs.statSync(outPath).size : 0;
  } catch { return 0; }
}

async function regenerate(slug, file) {
  const videoPath = path.join(downloads, file);
  if (!fs.existsSync(videoPath)) {
    console.log(`  ❌ Source missing: ${file}`);
    return null;
  }

  const duration = getDuration(videoPath);
  const tmpDir = path.join(projectRoot, ".tmp-regen");
  fs.mkdirSync(tmpDir, { recursive: true });

  // Filter timestamps to those within video duration
  const valid = duration ? TIMESTAMPS.filter(t => t < duration - 0.5) : TIMESTAMPS;

  // Extract each candidate, track the largest
  const safeUnlink = (p) => { try { fs.unlinkSync(p); } catch {} };
  let best = { ts: null, size: 0, path: null };
  for (const ts of valid) {
    const candPath = path.join(tmpDir, `${slug}-${ts}.jpg`);
    const size = extractFrame(videoPath, ts, candPath);
    if (size === 0) continue; // ffmpeg failed for this timestamp — skip
    if (size > best.size) {
      if (best.path) safeUnlink(best.path);
      best = { ts, size, path: candPath };
    } else {
      safeUnlink(candPath);
    }
  }

  if (!best.path) {
    console.log(`  ❌ ${slug}: no extractable frame`);
    return null;
  }

  // Upload the winner
  const key = `cinematic-thumbs/${slug}.jpg`;
  const url = await uploadR2(best.path, key);
  console.log(`  ✓ ${slug}: ts=${best.ts}s, ${(best.size/1024).toFixed(1)} KB → R2`);
  fs.unlinkSync(best.path);
  return url;
}

(async () => {
  console.log(`🎬 Regenerating ${FLAGGED.length} dark cinematic posters...\n`);
  for (const { slug, file } of FLAGGED) {
    await regenerate(slug, file);
  }
  console.log(`\n✅ Done. Hard-refresh /films to see the new posters.`);
  // Cleanup
  const tmpDir = path.join(projectRoot, ".tmp-regen");
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
})();
