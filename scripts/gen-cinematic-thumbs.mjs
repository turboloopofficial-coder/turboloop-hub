// Generates 16:9 landscape thumbnails for the 20 cinematic films.
// Uses ffmpeg-static + the same "smart frame" strategy as gen-reel-thumbs.mjs:
//   1. Try ffmpeg's `thumbnail` filter on the middle 50% of the video
//   2. If that fails or the frame is too dark, fall back to fixed timestamps
//
// Outputs:
//   - tmp/.tmp-cinematic-thumbs/{slug}.jpg (1280x720)
//   - Uploads to R2 at cinematic-thumbs/{slug}.jpg
//   - Updates scripts/cinematic-manifest.uploaded.json with posterUrl

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const FORCE = argv.includes("--force") || argv.includes("-f");

const {
  R2_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  console.error("❌ Missing R2 env vars.");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

async function existsInR2(key) {
  try { await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key })); return true; }
  catch { return false; }
}

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

function getDuration(videoPath) {
  try {
    const out = execSync(`"${ffmpegPath}" -i "${videoPath}" 2>&1 || true`, { encoding: "utf8" });
    const m = out.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (!m) return null;
    return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
  } catch { return null; }
}

function extractSmartThumb(videoPath, thumbPath, duration) {
  const startTime = duration && duration > 6 ? Math.max(2, duration * 0.25) : 1;
  const scanWindow = duration && duration > 6 ? Math.min(duration * 0.5, 8) : 4;
  // Landscape 16:9 — scale to 1280x720 (-2 for height auto-derives)
  const cmd = `"${ffmpegPath}" -y -ss ${startTime.toFixed(2)} -t ${scanWindow.toFixed(2)} -i "${videoPath}" -vf "thumbnail=120,scale=1280:-2,format=yuvj420p" -frames:v 1 -q:v 2 "${thumbPath}"`;
  try { execSync(cmd, { stdio: "pipe" }); return true; }
  catch { return false; }
}

function extractFallbackThumb(videoPath, thumbPath, duration) {
  const candidates = duration
    ? [duration * 0.4, duration * 0.5, duration * 0.3, duration * 0.6, 3, 2.5]
    : [3, 5, 2, 1.5];
  for (const ts of candidates) {
    if (ts < 0.5) continue;
    const cmd = `"${ffmpegPath}" -y -ss ${ts.toFixed(2)} -i "${videoPath}" -vf "scale=1280:-2,format=yuvj420p" -frames:v 1 -q:v 2 "${thumbPath}"`;
    try {
      execSync(cmd, { stdio: "pipe" });
      const size = fs.existsSync(thumbPath) ? fs.statSync(thumbPath).size : 0;
      if (size > 8000) return true; // 1280p frame should be more than 8KB if not solid black
    } catch {}
  }
  return false;
}

function isThumbTooDark(thumbPath) {
  try {
    const out = execSync(
      `"${ffmpegPath}" -i "${thumbPath}" -vf "signalstats" -f null - 2>&1`,
      { encoding: "utf8" }
    );
    const m = out.match(/YAVG:(\d+(?:\.\d+)?)/);
    if (!m) return false;
    return parseFloat(m[1]) < 28;
  } catch { return false; }
}

async function main() {
  const downloads = "C:/Users/DEV NARSI/Downloads";
  const tmpDir = path.join(projectRoot, ".tmp-cinematic-thumbs");
  fs.mkdirSync(tmpDir, { recursive: true });

  // Prefer the uploaded manifest if present (has URLs); otherwise fall back to source manifest
  const uploadedPath = path.join(projectRoot, "scripts/cinematic-manifest.uploaded.json");
  const sourcePath = path.join(projectRoot, "scripts/cinematic-manifest.json");
  const manifestPath = fs.existsSync(uploadedPath) ? uploadedPath : sourcePath;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const films = manifest.films;

  console.log(`🖼  Generating ${films.length} cinematic thumbnails (1280x720)`);
  console.log(`Source manifest: ${path.basename(manifestPath)}`);
  console.log(`ffmpeg: ${ffmpegPath}\n`);

  const enriched = [];
  let regenerated = 0, skipped = 0;

  for (const film of films) {
    const videoPath = path.join(downloads, film.file);
    const thumbPath = path.join(tmpDir, `${film.slug}.jpg`);
    const r2Key = `cinematic-thumbs/${film.slug}.jpg`;

    if (!fs.existsSync(videoPath)) {
      console.log(`  ⚠ Missing source: ${film.file}`);
      enriched.push(film);
      skipped++;
      continue;
    }

    if (!FORCE && (await existsInR2(r2Key))) {
      const url = `${R2_PUBLIC_URL}/${r2Key}`;
      console.log(`  ↺ skip (already exists): ${film.slug}.jpg → ${url}`);
      enriched.push({ ...film, posterUrl: url });
      continue;
    }

    const duration = getDuration(videoPath);
    const durStr = duration ? `${duration.toFixed(1)}s` : "?";

    let ok = extractSmartThumb(videoPath, thumbPath, duration);
    if (!ok || isThumbTooDark(thumbPath)) {
      ok = extractFallbackThumb(videoPath, thumbPath, duration);
    }

    if (!ok) {
      console.log(`  ❌ ${film.slug} (${durStr}) — could not extract`);
      enriched.push(film);
      continue;
    }

    const tooDark = isThumbTooDark(thumbPath);
    const size = fs.statSync(thumbPath).size;
    const url = await uploadR2(thumbPath, r2Key, "image/jpeg");
    const flag = tooDark ? "⚠ DARK" : "✓";
    console.log(`  ${flag} ${film.slug}.jpg (${durStr}, ${(size / 1024).toFixed(1)} KB) → ${url}`);

    enriched.push({ ...film, posterUrl: url });
    regenerated++;
  }

  // Write back to uploaded manifest (or create it)
  const out = { ...manifest, films: enriched, thumbsAt: new Date().toISOString() };
  fs.writeFileSync(uploadedPath, JSON.stringify(out, null, 2));

  console.log(`\n✅ Done — ${regenerated} generated, ${skipped} skipped (missing source)`);
  console.log(`📝 Manifest: scripts/cinematic-manifest.uploaded.json`);
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

main().catch(err => { console.error("❌", err); process.exit(1); });
