// Upload + seed the 10 English Season-2 reels (R01-R10).
//
// Reads:
//   • Videos:     C:\Users\DEV NARSI\Downloads\TURBOLOOP_S2_ENGLISH (1)\TURBOLOOP_S2_ENGLISH\videos\R*.mp4
//   • Thumbnails: C:\Users\DEV NARSI\Downloads\TURBOLOOP_S2_ENGLISH (1)\TURBOLOOP_S2_ENGLISH\thumbnails\R*.png
//   • Writeups:   same folder's WRITEUPS.md (parsed for the "## The 15 Reels (Short Form)"
//                 section — titles + bodies + CTAs)
//
// Uploads to R2:
//   • /reels/<slug>.mp4
//   • /reel-thumbs/<slug>.jpg     (PNG → re-encoded JPEG? No — keep PNG, just use
//                                  .png extension. HomeReelsSection's thumbForReel()
//                                  maps .mp4 → .jpg, so we either rename PNG→JPG at
//                                  R2 OR update the helper. We use .jpg in R2 by
//                                  re-uploading the PNG bytes as a .jpg key — works
//                                  because the existing thumb code reads it back as
//                                  an image-type response regardless of extension.)
//
// Seeds DB:
//   • category='presentation', language='English', language_flag='🇬🇧'
//   • direct_url = R2_PUBLIC_URL + '/reels/<slug>.mp4'
//   • sort_order = 100 + <reel-number>  (so old reels at 0-99 stay first, OR
//                                         change to 200+ to push S2 reels above
//                                         existing 8 — see SORT_ORDER_BASE below)
//   • published = true
//
// "Add — keep both" per the user's choice: the existing 8 EN reels remain
// untouched. These 10 new ones get inserted alongside. SORT_ORDER_BASE controls
// the carousel order.
//
// Re-run safety: this script is idempotent by slug. If a row with the same
// slug already exists, it's left alone (ON CONFLICT DO NOTHING). Uploads to
// R2 always overwrite (the same key gets the new bytes).

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(ROOT, "..");

// ── Config ─────────────────────────────────────────────────────────────────

const SOURCE_FOLDER =
  "C:\\Users\\DEV NARSI\\Downloads\\TURBOLOOP_S2_ENGLISH (1)\\TURBOLOOP_S2_ENGLISH";
const VIDEOS_DIR = path.join(SOURCE_FOLDER, "videos");
const THUMBS_DIR = path.join(SOURCE_FOLDER, "thumbnails");
const WRITEUPS = path.join(SOURCE_FOLDER, "WRITEUPS.md");

// Insert these so they sort AFTER the existing 8 reels in the carousel.
// The homepage shows the first 8 by sort_order; setting base to 200 means
// the existing reels (sort_order 0-100) still surface first. If the user
// later wants S2 to lead, swap this to 0.
const SORT_ORDER_BASE = 200;

const {
  DATABASE_URL,
  R2_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

for (const [k, v] of Object.entries({
  DATABASE_URL,
  R2_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
})) {
  if (!v) {
    console.error(`Missing env: ${k}`);
    process.exit(1);
  }
}

const sql = neon(DATABASE_URL);
const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// ── WRITEUPS.md parser ─────────────────────────────────────────────────────
//
// The reels section sits below "## The 15 Reels (Short Form)" with subsections
// shaped like:
//
//     ### Reel 1: Title here
//     **Hook:** ...
//     **CTA:** ...
//
// We only need the title — the homepage carousel uses post.title for the card
// label, and reel detail pages render the full body. Body+CTA captured for
// completeness so the seeded row's description field is meaningful.

function parseWriteups(markdown) {
  const reelsHeaderIdx = markdown.search(/##\s+The\s+15\s+Reels/i);
  if (reelsHeaderIdx < 0) {
    throw new Error("WRITEUPS.md: missing '## The 15 Reels' section");
  }
  const reelsSection = markdown.slice(reelsHeaderIdx);
  const reels = [];
  // Match either "### Reel N:" or "### Reel N -" or "### R0N:"
  const blockRe =
    /###\s+(?:Reel|R)\s*0?(\d+)\s*[:\-–—]\s*([^\n]+)\n([\s\S]*?)(?=\n###\s+|\n##\s+|$)/g;
  let m;
  while ((m = blockRe.exec(reelsSection)) !== null) {
    const num = parseInt(m[1], 10);
    const title = m[2].trim();
    const body = m[3].trim();
    reels.push({ num, title, body });
  }
  return reels;
}

// ── Slug helper ────────────────────────────────────────────────────────────
//
// Convert a filename like "R01_001_vs_54_percent.mp4" or a writeup title to
// a kebab-case slug. The slug becomes part of the R2 path AND the public URL
// (/reels/<slug>) so we want it readable + stable.

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function slugFromVideoFilename(filename) {
  // R01_001_vs_54_percent.mp4 → 001-vs-54-percent
  const base = filename.replace(/\.(mp4|MP4)$/, "").replace(/^R\d+_/i, "");
  return slugify(base);
}

// ── R2 upload helper ───────────────────────────────────────────────────────

async function uploadToR2(key, body, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `${R2_PUBLIC_URL}/${key}`;
}

// ── Main flow ──────────────────────────────────────────────────────────────

async function main() {
  console.log("📖 Parsing WRITEUPS.md…");
  const md = fs.readFileSync(WRITEUPS, "utf-8");
  const writeups = parseWriteups(md);
  console.log(`  Found ${writeups.length} reel writeups`);

  console.log("\n📁 Listing video files…");
  const videoFiles = fs
    .readdirSync(VIDEOS_DIR)
    .filter(f => /^R\d+_.+\.mp4$/i.test(f))
    .sort();
  console.log(`  Found ${videoFiles.length} R-prefix video files`);

  if (videoFiles.length === 0) {
    console.error("❌ No R*.mp4 files found in videos/");
    process.exit(1);
  }

  console.log("\n🚀 Uploading + seeding…\n");
  let uploaded = 0;
  let seeded = 0;

  for (const videoFile of videoFiles) {
    const reelNum = parseInt(videoFile.match(/^R0?(\d+)/i)[1], 10);
    const slug = slugFromVideoFilename(videoFile);
    const writeup = writeups.find(w => w.num === reelNum);
    const title = writeup?.title ?? videoFile.replace(/\.mp4$/, "").replace(/_/g, " ");
    const description = writeup?.body ?? "";

    // Upload video
    const videoBuf = fs.readFileSync(path.join(VIDEOS_DIR, videoFile));
    const videoKey = `reels/${slug}.mp4`;
    const videoUrl = await uploadToR2(videoKey, videoBuf, "video/mp4");
    console.log(`  R${String(reelNum).padStart(2, "0")} ▶  ${videoFile}`);
    console.log(`        ↳ ${videoUrl}`);
    uploaded++;

    // Upload thumbnail (PNG file, stored at .jpg key to match
    // HomeReelsSection's thumbForReel() expectation. R2 serves the PNG bytes
    // with whatever Content-Type we tag — image/jpeg is fine because the
    // browser sniffs the magic bytes anyway, but image/png is more honest.)
    const thumbFilename = videoFile.replace(/\.mp4$/, ".png");
    const thumbPath = path.join(THUMBS_DIR, thumbFilename);
    if (fs.existsSync(thumbPath)) {
      const thumbBuf = fs.readFileSync(thumbPath);
      const thumbKey = `reel-thumbs/${slug}.jpg`;
      await uploadToR2(thumbKey, thumbBuf, "image/png");
      console.log(`        ↳ thumb /${thumbKey}`);
    } else {
      console.log(`        ⚠ thumb missing for ${videoFile}`);
    }

    // Seed DB row (idempotent by slug)
    const sortOrder = SORT_ORDER_BASE + reelNum;
    const inserted = await sql`
      INSERT INTO videos
        (title, slug, description, direct_url, category, language,
         language_flag, sort_order, published)
      VALUES
        (${title}, ${slug}, ${description}, ${videoUrl}, 'presentation',
         'English', '🇬🇧', ${sortOrder}, true)
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `;
    if (inserted.length > 0) {
      console.log(`        ↳ db id=${inserted[0].id} (sort_order=${sortOrder})`);
      seeded++;
    } else {
      console.log(`        ↳ slug "${slug}" already in DB — skipped`);
    }
    console.log("");
  }

  console.log(`\n✅ Done. Uploaded ${uploaded} videos + thumbs. Seeded ${seeded} rows.`);

  // Sanity-check final state
  const total = await sql`SELECT COUNT(*)::int AS n FROM videos WHERE direct_url IS NOT NULL`;
  console.log(`   videos with direct_url: ${total[0].n} (was 8 before this run)`);
}

main().catch(err => {
  console.error("❌", err);
  process.exit(1);
});
