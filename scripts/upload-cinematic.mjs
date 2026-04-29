// Uploads the 20 TurboLoop Cinematic Universe MP4s to R2.
// Reads scripts/cinematic-manifest.json — uploads each film at cinematic/{slug}.mp4.
// Outputs cinematic-manifest.uploaded.json with URLs (so seed-cinematic.mjs can use it).
//
// Idempotent: checks if the R2 key already exists (HEAD request) and skips if so.
// Use --dry-run to print what would happen without uploading.
// Use --force to re-upload even if already present.

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const DRY = argv.includes("--dry-run") || argv.includes("-n");
const FORCE = argv.includes("--force") || argv.includes("-f");

const {
  R2_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

if (!DRY && (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL)) {
  console.error("❌ Missing R2 env vars (set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL).");
  console.error("   Or run with --dry-run to preview without env.");
  process.exit(1);
}

const s3 = !DRY ? new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
}) : null;

async function existsInR2(key) {
  if (!s3) return false;
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function upload(localPath, key, contentType) {
  if (!fs.existsSync(localPath)) {
    console.log(`  ⚠ MISSING source file: ${localPath}`);
    return null;
  }
  const stats = fs.statSync(localPath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(1);

  if (!FORCE && (await existsInR2(key))) {
    const url = `${R2_PUBLIC_URL}/${key}`;
    console.log(`  ↺ skip (already uploaded): ${key} → ${url}`);
    return url;
  }

  if (DRY) {
    console.log(`  → would upload ${key} (${sizeMB} MB)`);
    return `${R2_PUBLIC_URL}/${key}`;
  }

  console.log(`  ↑ uploading ${key} (${sizeMB} MB) ...`);
  const body = fs.readFileSync(localPath);
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  const url = `${R2_PUBLIC_URL}/${key}`;
  console.log(`  ✓ ${key} → ${url}`);
  return url;
}

async function main() {
  const manifestPath = path.join(projectRoot, "scripts/cinematic-manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const downloads = manifest.downloadsRoot;
  const films = manifest.films;

  console.log(`🎬 TurboLoop Cinematic Universe — ${films.length} films`);
  console.log(`Source: ${downloads}`);
  console.log(`Mode: ${DRY ? "DRY RUN" : (FORCE ? "FORCE re-upload" : "incremental (skip uploaded)")}\n`);

  // Pre-flight: total size estimate
  let totalMB = 0;
  for (const f of films) {
    const p = path.join(downloads, f.file);
    if (fs.existsSync(p)) totalMB += fs.statSync(p).size / 1024 / 1024;
  }
  console.log(`Total source size: ${totalMB.toFixed(1)} MB across ${films.length} files\n`);

  const enriched = [];
  for (const film of films) {
    const localPath = path.join(downloads, film.file);
    const key = `cinematic/${film.slug}.mp4`;
    const url = await upload(localPath, key, "video/mp4");
    enriched.push({ ...film, url, posterUrl: `${R2_PUBLIC_URL}/cinematic-thumbs/${film.slug}.jpg` });
  }

  // Write enriched manifest with URLs
  const out = {
    ...manifest,
    films: enriched,
    uploadedAt: new Date().toISOString(),
  };
  const outPath = path.join(projectRoot, "scripts/cinematic-manifest.uploaded.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

  const successCount = enriched.filter(f => f.url).length;
  console.log(`\n✅ Done — ${successCount}/${films.length} films processed`);
  console.log(`📝 Output manifest: scripts/cinematic-manifest.uploaded.json`);
  if (DRY) console.log(`   (dry run — re-run without --dry-run to actually upload)`);
}

main().catch(err => { console.error("❌", err); process.exit(1); });
