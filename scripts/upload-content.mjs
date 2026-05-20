// scripts/upload-content.mjs — unified content uploader.
//
// One command for all future film + reel uploads. Replaces the three
// previous one-off scripts:
//   - scripts/seed-reels.mjs
//   - scripts/upload-and-seed-reels-s2.mjs
//   - scripts/upload-and-seed-films-s2.mjs
//
// Usage:
//   node scripts/upload-content.mjs --type=film  --lang=en --dir="<path>"
//   node scripts/upload-content.mjs --type=film  --lang=de --dir="<path>"
//   node scripts/upload-content.mjs --type=reel  --lang=en --dir="<path>"
//
// Folder convention (matches the existing TURBOLOOP_S2_* bundles):
//   <dir>/
//     videos/        R*.mp4 (reels) or V*.mp4 (films)
//     thumbnails/    matching R*.png / V*.png
//     WRITEUPS.md    metadata (both format A and format B parsed)
//
// What it does:
//   1. Parse WRITEUPS.md → { num: { title, headline, body, cta } }
//   2. Upload each video to R2 (reels: /reels/<slug>.mp4, films:
//      /films-s2/<lang>/<slug>.mp4)
//   3. Upload each thumbnail to R2 (reels: /reel-thumbs/<slug>.jpg,
//      films: /film-thumbs-s2/<lang>/<slug>.jpg). Falls back to EN
//      thumbnails for non-EN runs if the language folder lacks them.
//   4. Insert DB rows in the videos table with:
//        - created_at = now() (automatic newest-first sorting)
//        - published = true
//        - canonical_slug (films: shared across all 4 languages)
//        - language + language_flag
//        - title, description, headline, tagline from the writeup
//   5. Idempotent: ON CONFLICT (slug) DO NOTHING. Re-running is safe.
//
// Future content pipeline:
//   - Drop new files into a fresh content folder
//   - Run this script with the right --type / --lang / --dir
//   - Content automatically appears at the top of /films or homepage
//     reels carousel (created_at DESC sort)
//   - NEW badge auto-shows for 30 days
//   - No manual code changes needed

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// ── Arg parsing ────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
function arg(name) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : null;
}
const type = arg("type");
const langInput = arg("lang");
const dir = arg("dir");

if (type !== "film" && type !== "reel") {
  console.error("Required: --type=film|reel");
  process.exit(1);
}

const LANG_MAP = {
  en: { label: "English", flag: "🇬🇧" },
  de: { label: "German", flag: "🇩🇪" },
  hi: { label: "Hindi", flag: "🇮🇳" },
  id: { label: "Indonesian", flag: "🇮🇩" },
};
if (!langInput || !LANG_MAP[langInput]) {
  console.error("Required: --lang=en|de|hi|id");
  process.exit(1);
}
const langCode = langInput;
const { label: langLabel, flag: langFlag } = LANG_MAP[langCode];

if (!dir || !fs.existsSync(dir)) {
  console.error(`Required: --dir=<folder>  (got: ${dir})`);
  process.exit(1);
}

// Reels are English-only per the design (R-prefix files). Reject
// non-EN reel runs explicitly so a misconfigured invocation doesn't
// silently spread reels across languages.
if (type === "reel" && langCode !== "en") {
  console.error("Reels are English-only. Run with --lang=en or upload films instead.");
  process.exit(1);
}

// ── Env ────────────────────────────────────────────────────────────────────

const {
  DATABASE_URL,
  R2_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;
for (const [k, v] of Object.entries({
  DATABASE_URL, R2_ENDPOINT, R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL,
})) {
  if (!v) { console.error(`Missing env: ${k}`); process.exit(1); }
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

// ── WRITEUPS.md parser — handles both formats ──────────────────────────────

function parseWriteups(markdown, prefix) {
  // prefix = 'V' for films, 'R' for reels
  const out = new Map();
  const labelChar = prefix === "V" ? "Video" : "Reel";

  // Format A — markdown heading
  const fA = new RegExp(
    `###\\s+(?:${labelChar}|${prefix})\\s*0?(\\d+)\\s*[:\\-–—]\\s*([^\\n]+)\\n([\\s\\S]*?)(?=\\n###\\s+|\\n##\\s+|\\n---|\\n\\*\\*(?:${labelChar}|${prefix})\\s|$)`,
    "g"
  );
  let m;
  while ((m = fA.exec(markdown)) !== null) {
    const num = parseInt(m[1], 10);
    if (num < 1 || num > 30) continue;
    if (out.has(num)) continue;
    const title = m[2].trim();
    const body = m[3].trim();
    const headlineMatch = body.match(/\*\*Headline:\*\*\s*([^\n]+)/);
    const bodyMatch = body.match(/\*\*Body:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/);
    const ctaMatch = body.match(/\*\*CTA:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/);
    out.set(num, {
      title,
      headline: headlineMatch?.[1].trim() ?? title,
      body: bodyMatch?.[1].trim() ?? body,
      cta: ctaMatch?.[1].trim() ?? "",
    });
  }

  // Format B — bold-text inline
  const fB = new RegExp(
    `\\*\\*(?:${labelChar}|${prefix})\\s+0?(\\d+)\\s*[:\\-–—]\\s*([^*]+?)\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*(?:${labelChar}|${prefix})\\s+|\\n##\\s+|\\n---|$)`,
    "g"
  );
  while ((m = fB.exec(markdown)) !== null) {
    const num = parseInt(m[1], 10);
    if (num < 1 || num > 30) continue;
    if (out.has(num)) continue;
    const title = m[2].trim();
    const raw = m[3].trim();
    const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
    const headlineLine = lines[0] ?? "";
    const headline =
      headlineLine
        .replace(/\*\*/g, "")
        .replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+/u, "")
        .trim() || title;
    const ctaLine = lines[lines.length - 1] ?? "";
    const cta = /👉|🔗|→/.test(ctaLine)
      ? ctaLine.replace(/\*\*/g, "").trim()
      : "";
    const bodyLines = cta ? lines.slice(1, -1) : lines.slice(1);
    const body = bodyLines.join(" ").trim();
    out.set(num, { title, headline, body, cta });
  }
  return out;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

async function uploadToR2(key, body, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    // Setting Content-Disposition: attachment at R2 storage time means
    // any direct R2 URL access also triggers download (defense in depth
    // alongside the /api/download proxy).
    ContentDisposition: `attachment; filename="${path.basename(key)}"`,
  }));
  return `${R2_PUBLIC_URL}/${key}`;
}

// ── Film-specific: resolve canonical slug ─────────────────────────────────
//
// Films share a canonical_slug across all 4 language versions.
// - EN run: derive from the EN writeup title (canonical source).
// - Non-EN run: look up the EN row for this video number to get its
//   canonical_slug, reuse it.

async function resolveFilmCanonicalSlug(videoNum, enTitle) {
  if (langCode === "en") {
    return `v${String(videoNum).padStart(2, "0")}-${slugify(enTitle)}`;
  }
  const r = await sql`
    SELECT canonical_slug FROM videos
    WHERE category = 'cinematic'
      AND language = 'English'
      AND canonical_slug LIKE ${`v${String(videoNum).padStart(2, "0")}-%`}
    LIMIT 1
  `;
  if (r.length === 0) {
    throw new Error(`No EN canonical_slug for V${videoNum}. Run --lang=en first.`);
  }
  return r[0].canonical_slug;
}

// ── Thumb resolution: prefix-match + EN fallback ──────────────────────────

function findThumb(thumbsDir, prefix, num, enFallbackDir) {
  const vPrefix = `${prefix}${String(num).padStart(2, "0")}_`;
  if (fs.existsSync(thumbsDir)) {
    const local = fs.readdirSync(thumbsDir).filter(
      f => f.startsWith(vPrefix) && /\.png$/i.test(f)
    );
    if (local.length > 0) return path.join(thumbsDir, local[0]);
  }
  if (enFallbackDir && fs.existsSync(enFallbackDir)) {
    const en = fs.readdirSync(enFallbackDir).filter(
      f => f.startsWith(vPrefix) && /\.png$/i.test(f)
    );
    if (en.length > 0) return path.join(enFallbackDir, en[0]);
  }
  return null;
}

// ── Reel-specific: slug from filename ─────────────────────────────────────

function slugFromReelFilename(filename) {
  const base = filename.replace(/\.(mp4|MP4)$/, "").replace(/^R\d+_/i, "");
  return slugify(base);
}

// ── Main ──────────────────────────────────────────────────────────────────

async function uploadFilms() {
  const videosDir = path.join(dir, "videos");
  const thumbsDir = path.join(dir, "thumbnails");
  const writeupsPath = path.join(dir, "WRITEUPS.md");
  if (!fs.existsSync(writeupsPath)) {
    console.error(`Missing ${writeupsPath}`); process.exit(1);
  }
  const writeups = parseWriteups(fs.readFileSync(writeupsPath, "utf-8"), "V");
  console.log(`📖 Parsed ${writeups.size} film writeups`);

  const videoFiles = fs.readdirSync(videosDir)
    .filter(f => /^V\d+_.+\.mp4$/i.test(f))
    .sort();
  console.log(`📁 ${videoFiles.length} V-prefix .mp4 files in ${videosDir}\n`);

  const enThumbsDir = langCode === "en"
    ? null
    : "C:/Users/DEV NARSI/Downloads/TURBOLOOP_S2_ENGLISH (1)/TURBOLOOP_S2_ENGLISH/thumbnails";

  let inserted = 0, skipped = 0;
  for (const file of videoFiles) {
    const num = parseInt(file.match(/^V0?(\d+)/i)[1], 10);
    const writeup = writeups.get(num);
    if (!writeup) {
      console.log(`  ⚠ V${num}: no writeup, skipping`);
      continue;
    }

    const canonicalSlug = await resolveFilmCanonicalSlug(num, writeup.title);
    const slug = langCode === "en" ? canonicalSlug : `${canonicalSlug}-${langCode}`;

    const videoBuf = fs.readFileSync(path.join(videosDir, file));
    const videoKey = `films-s2/${langCode}/${canonicalSlug}.mp4`;
    const videoUrl = await uploadToR2(videoKey, videoBuf, "video/mp4");
    console.log(`  V${String(num).padStart(2,"0")} [${langCode}] ▶ ${file}`);

    const thumbPath = findThumb(thumbsDir, "V", num, enThumbsDir);
    let thumbUrl = null;
    if (thumbPath) {
      const thumbBuf = fs.readFileSync(thumbPath);
      const thumbKey = `film-thumbs-s2/${langCode}/${canonicalSlug}.jpg`;
      thumbUrl = await uploadToR2(thumbKey, thumbBuf, "image/png");
    }

    const r = await sql`
      INSERT INTO videos
        (title, slug, canonical_slug, description, headline, tagline,
         direct_url, poster_url, category, language, language_flag,
         sort_order, published, created_at)
      VALUES
        (${writeup.title}, ${slug}, ${canonicalSlug}, ${writeup.body},
         ${writeup.headline}, ${writeup.cta || writeup.title.slice(0,200)},
         ${videoUrl}, ${thumbUrl}, 'cinematic', ${langLabel}, ${langFlag},
         ${num}, true, NOW())
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `;
    if (r.length > 0) {
      console.log(`     ↳ db id=${r[0].id}\n`);
      inserted++;
    } else {
      console.log(`     ↳ slug "${slug}" exists — skipped\n`);
      skipped++;
    }
  }
  console.log(`✅ ${langLabel} films done. Inserted ${inserted}, skipped ${skipped}.`);
}

async function uploadReels() {
  const videosDir = path.join(dir, "videos");
  const thumbsDir = path.join(dir, "thumbnails");
  const writeupsPath = path.join(dir, "WRITEUPS.md");
  if (!fs.existsSync(writeupsPath)) {
    console.error(`Missing ${writeupsPath}`); process.exit(1);
  }
  const writeups = parseWriteups(fs.readFileSync(writeupsPath, "utf-8"), "R");
  console.log(`📖 Parsed ${writeups.size} reel writeups`);

  const videoFiles = fs.readdirSync(videosDir)
    .filter(f => /^R\d+_.+\.mp4$/i.test(f))
    .sort();
  console.log(`📁 ${videoFiles.length} R-prefix .mp4 files\n`);

  let inserted = 0, skipped = 0;
  for (const file of videoFiles) {
    const num = parseInt(file.match(/^R0?(\d+)/i)[1], 10);
    const slug = slugFromReelFilename(file);
    const writeup = writeups.get(num);
    const title = writeup?.title ?? file.replace(/\.mp4$/, "").replace(/_/g, " ");
    const description = writeup?.body ?? "";
    const tagline = writeup?.cta || writeup?.headline || "";

    const videoBuf = fs.readFileSync(path.join(videosDir, file));
    const videoKey = `reels/${slug}.mp4`;
    const videoUrl = await uploadToR2(videoKey, videoBuf, "video/mp4");
    console.log(`  R${String(num).padStart(2,"0")} ▶ ${file}`);

    const thumbPath = findThumb(thumbsDir, "R", num, null);
    if (thumbPath) {
      const thumbBuf = fs.readFileSync(thumbPath);
      await uploadToR2(`reel-thumbs/${slug}.jpg`, thumbBuf, "image/png");
    }

    const r = await sql`
      INSERT INTO videos
        (title, slug, description, tagline, direct_url, category,
         language, language_flag, sort_order, published, created_at)
      VALUES
        (${title}, ${slug}, ${description}, ${tagline}, ${videoUrl},
         'presentation', 'English', '🇬🇧', 0, true, NOW())
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `;
    if (r.length > 0) {
      console.log(`     ↳ db id=${r[0].id}\n`);
      inserted++;
    } else {
      console.log(`     ↳ slug "${slug}" exists — skipped\n`);
      skipped++;
    }
  }
  console.log(`✅ Reels done. Inserted ${inserted}, skipped ${skipped}.`);
}

(async () => {
  console.log(`\n🎬 Uploading ${type}s (${langLabel}) from:\n   ${dir}\n`);
  if (type === "film") await uploadFilms();
  else await uploadReels();

  console.log("\n=== POST-RUN STATE ===");
  if (type === "film") {
    const r = await sql`
      SELECT language, COUNT(*)::int AS n
      FROM videos WHERE category = 'cinematic'
      GROUP BY language ORDER BY language
    `;
    for (const row of r) console.log(`  cinematic / ${row.language}: ${row.n}`);
  } else {
    const r = await sql`
      SELECT COUNT(*)::int AS n FROM videos
      WHERE category = 'presentation' AND direct_url IS NOT NULL
    `;
    console.log(`  presentation rows with direct_url: ${r[0].n}`);
  }
})().catch(err => { console.error("❌", err); process.exit(1); });
