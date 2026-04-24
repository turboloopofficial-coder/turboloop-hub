import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const {
  R2_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

async function uploadR2(localPath, key, contentType) {
  const body = fs.readFileSync(localPath);
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return `${R2_PUBLIC_URL}/${key}`;
}

/** Get video duration in seconds using ffprobe (bundled with ffmpeg-static? — fallback to ffmpeg parse) */
function getDuration(videoPath) {
  try {
    // Use ffmpeg -i to get duration line; parse from stderr
    const out = execSync(`"${ffmpegPath}" -i "${videoPath}" 2>&1 || true`, { encoding: "utf8" });
    const m = out.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (!m) return null;
    return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
  } catch {
    return null;
  }
}

/** Extract a thumbnail using ffmpeg's `thumbnail` filter (auto-picks best frame from a window).
 *  Strategy: probe the middle 60% of the video (skipping first 20% intro and last 20% outro),
 *  letting ffmpeg pick the most representative frame.
 */
function extractSmartThumb(videoPath, thumbPath, duration) {
  // Decide where to start scanning
  const startTime = duration && duration > 6 ? Math.max(2, duration * 0.25) : 1;
  const scanWindow = duration && duration > 6 ? Math.min(duration * 0.5, 8) : 4;

  // thumbnail filter: analyze N frames, pick the most "different" (most interesting) one
  // -ss BEFORE -i seeks fast (keyframe-accurate), -t limits the window we scan
  // scale=720:-2 produces a higher-resolution thumb (720 wide, height auto for 9:16 → 1280)
  const cmd = `"${ffmpegPath}" -y -ss ${startTime.toFixed(2)} -t ${scanWindow.toFixed(2)} -i "${videoPath}" -vf "thumbnail=120,scale=720:-2,format=yuvj420p" -frames:v 1 -q:v 2 "${thumbPath}"`;

  try {
    execSync(cmd, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/** Fallback: try a few specific timestamps (avoiding the intro). */
function extractFallbackThumb(videoPath, thumbPath, duration) {
  const candidates = duration
    ? [duration * 0.4, duration * 0.5, duration * 0.3, duration * 0.6, 3, 2]
    : [3, 5, 2, 1.2];

  for (const ts of candidates) {
    if (ts < 0.5) continue;
    const cmd = `"${ffmpegPath}" -y -ss ${ts.toFixed(2)} -i "${videoPath}" -vf "scale=720:-2,format=yuvj420p" -frames:v 1 -q:v 2 "${thumbPath}"`;
    try {
      execSync(cmd, { stdio: "pipe" });
      // Quick sanity check: file should be > 5 KB (a black frame at 720p is usually ~3 KB)
      const size = fs.existsSync(thumbPath) ? fs.statSync(thumbPath).size : 0;
      if (size > 5000) return true;
    } catch {}
  }
  return false;
}

/** Detect if a thumbnail is mostly black (very dark, low information).
 *  Uses ffmpeg signalstats to compute average luma (Y).
 *  Returns true if the frame is too dark to be useful.
 */
function isThumbTooDark(thumbPath) {
  try {
    const out = execSync(
      `"${ffmpegPath}" -i "${thumbPath}" -vf "signalstats" -f null - 2>&1`,
      { encoding: "utf8" }
    );
    const m = out.match(/YAVG:(\d+(?:\.\d+)?)/);
    if (!m) return false;
    const yavg = parseFloat(m[1]);
    // Y range is 0-255. Below ~30 = effectively black/dark intro card.
    return yavg < 28;
  } catch {
    return false;
  }
}

async function main() {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const downloads = "C:/Users/DEV NARSI/Downloads";
  const tmpDir = path.join(projectRoot, ".tmp-thumbs");
  fs.mkdirSync(tmpDir, { recursive: true });

  const reels = JSON.parse(fs.readFileSync(path.join(projectRoot, "scripts/reels-manifest.json"), "utf-8")).reels;

  console.log(`🖼  Generating ${reels.length} smart thumbnails using ffmpeg at ${ffmpegPath}\n`);

  const updated = [];
  let regenerated = 0;
  let skipped = 0;

  for (const reel of reels) {
    const videoPath = path.join(downloads, reel.file);
    const thumbPath = path.join(tmpDir, `${reel.slug}.jpg`);

    if (!fs.existsSync(videoPath)) {
      console.log(`  ⚠ Missing video: ${reel.file} — keeping existing thumb`);
      updated.push(reel);
      skipped++;
      continue;
    }

    const duration = getDuration(videoPath);
    const durStr = duration ? `${duration.toFixed(1)}s` : "?";

    // 1. Try smart `thumbnail` filter on middle of video
    let ok = extractSmartThumb(videoPath, thumbPath, duration);

    // 2. If smart fails or thumb is too dark, fall back to fixed timestamps
    if (!ok || isThumbTooDark(thumbPath)) {
      ok = extractFallbackThumb(videoPath, thumbPath, duration);
    }

    if (!ok) {
      console.log(`  ❌ ${reel.slug} (${durStr}) — could not extract a non-black frame`);
      updated.push(reel);
      continue;
    }

    const tooDark = isThumbTooDark(thumbPath);
    const size = fs.statSync(thumbPath).size;

    // Upload
    const key = `reel-thumbs/${reel.slug}.jpg`;
    const url = await uploadR2(thumbPath, key, "image/jpeg");
    const flag = tooDark ? "⚠ DARK" : "✓";
    console.log(`  ${flag} ${reel.slug}.jpg (${durStr}, ${(size / 1024).toFixed(1)} KB) → ${url}`);

    updated.push({ ...reel, thumbUrl: url });
    regenerated++;
  }

  // Update manifest with thumb URLs
  const manifestPath = path.join(projectRoot, "scripts/reels-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify({ reels: updated }, null, 2));
  console.log(`\n✅ Done — ${regenerated} regenerated, ${skipped} skipped (missing source video)`);

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

main().catch(err => { console.error("❌", err); process.exit(1); });
