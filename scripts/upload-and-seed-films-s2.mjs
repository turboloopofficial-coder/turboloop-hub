// Upload + seed Season-2 Sovereign Series films for ONE language at a time.
//
// Usage:
//   node scripts/upload-and-seed-films-s2.mjs --lang English  --dir "<path-to-english-folder>"
//   node scripts/upload-and-seed-films-s2.mjs --lang German   --dir "<path-to-german-folder>"
//   node scripts/upload-and-seed-films-s2.mjs --lang Hindi    --dir "<path-to-hindi-folder>"
//   node scripts/upload-and-seed-films-s2.mjs --lang Indonesian --dir "<path-to-indonesian-folder>"
//
// What it does, per language:
//   1. Parses WRITEUPS.md → 20 entries with { videoNum, title, headline, body, cta }
//   2. Uploads V01..V20 .mp4 to R2 under /films-s2/<lang-code>/<canonical-slug>.mp4
//   3. Uploads V01..V20 .png to R2 under /film-thumbs-s2/<lang-code>/<canonical-slug>.jpg
//   4. Seeds the videos table:
//      • category = 'cinematic'
//      • language = <full English label> ('English' | 'German' | 'Hindi' | 'Indonesian')
//      • canonical_slug = `v<NN>-<slugified-title>` (SAME across all 4 languages)
//      • slug = canonical_slug for EN; canonical_slug + '-<lang>' for non-EN
//      • direct_url + poster_url = R2 public URLs
//      • published = true, sort_order = video number
//
// The EN run MUST be done first because the canonical slug (V01..V20) is
// derived from the EN writeup titles. Subsequent language runs reuse those
// canonical slugs by mapping the same video number to the EN row's slug.
//
// Idempotent: ON CONFLICT (slug) DO NOTHING. Re-running for the same lang
// is safe; existing rows preserved, R2 uploads overwrite the bytes.

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
const langLabel = arg("lang");
const dir = arg("dir");

const LANG_MAP = {
  English: { code: "en", flag: "🇬🇧" },
  German: { code: "de", flag: "🇩🇪" },
  Hindi: { code: "hi", flag: "🇮🇳" },
  Indonesian: { code: "id", flag: "🇮🇩" },
};
if (!langLabel || !LANG_MAP[langLabel]) {
  console.error("Required: --lang English|German|Hindi|Indonesian");
  process.exit(1);
}
if (!dir || !fs.existsSync(dir)) {
  console.error(`Required: --dir <folder> (got: ${dir})`);
  process.exit(1);
}
const { code: langCode, flag: langFlag } = LANG_MAP[langLabel];

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

// ── WRITEUPS parser ────────────────────────────────────────────────────────
//
// Each language's WRITEUPS.md is structured as:
//   ## Block N: <theme>
//   ### Video M: <title>
//   **Headline:** ...
//   **Body:** ...
//   **CTA:** ...
//
// Video numbers run 1..20 (5 per block × 4 blocks). We extract by video number,
// not by block, so the mapping is consistent across languages.

// Two writeup formats exist across the four language folders:
//
// FORMAT A — English / labeled fields:
//   ### Video 7: Title
//   **Headline:** ...
//   **Body:** ...
//   **CTA:** ...
//
// FORMAT B — DE/HI/ID / inline emoji style:
//   **Video 7: Titel**
//   🌍 **Headline-Linie**
//   Body-Absatz...
//   👉 **turboloop.io**
//
// Try format A first; for any video number not found, fall back to format B.

function parseWriteups(markdown) {
  const out = new Map();

  // FORMAT A — markdown heading-based
  const formatA =
    /###\s+(?:Video|V)\s*0?(\d+)\s*[:\-–—]\s*([^\n]+)\n([\s\S]*?)(?=\n###\s+|\n##\s+|\n---|\n\*\*Video\s|$)/g;
  let m;
  while ((m = formatA.exec(markdown)) !== null) {
    const num = parseInt(m[1], 10);
    if (num < 1 || num > 20) continue;
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

  // FORMAT B — bold-text inline blocks
  const formatB =
    /\*\*Video\s+0?(\d+)\s*[:\-–—]\s*([^*]+?)\*\*\s*\n([\s\S]*?)(?=\n\*\*Video\s+|\n##\s+|\n---|$)/g;
  while ((m = formatB.exec(markdown)) !== null) {
    const num = parseInt(m[1], 10);
    if (num < 1 || num > 20) continue;
    if (out.has(num)) continue;
    const title = m[2].trim();
    const raw = m[3].trim();
    const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
    // First non-empty line typically the emoji-prefixed "headline"
    // (e.g. "🌍 **Die Bewegung ist real.**"). Strip the bold + emoji to get
    // just the headline text.
    const headlineLine = lines[0] ?? "";
    const headline =
      headlineLine
        .replace(/\*\*/g, "")
        .replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+/u, "")
        .trim() || title;
    // Last line typically the CTA (starts with 👉 or similar)
    const ctaLine = lines[lines.length - 1] ?? "";
    const cta = /👉|👉|🔗|→/.test(ctaLine)
      ? ctaLine.replace(/\*\*/g, "").trim()
      : "";
    // Body = everything between headline (line 0) and CTA (last line),
    // or everything after headline if no CTA detected.
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

// ── Canonical-slug resolution ──────────────────────────────────────────────
//
// For EN runs: derive from the EN writeup title (canonical source of truth).
// For non-EN runs: look up the EN canonical_slug already in DB for the same
// video number. This way translations always group correctly even if the
// translator's title slugifies differently from the EN equivalent.

async function resolveCanonicalSlug(videoNum, enTitle) {
  if (langLabel === "English") {
    return `v${String(videoNum).padStart(2, "0")}-${slugify(enTitle)}`;
  }
  // Look up the EN row for this video number.
  const r = await sql`
    SELECT canonical_slug
    FROM videos
    WHERE category = 'cinematic'
      AND language = 'English'
      AND canonical_slug LIKE ${`v${String(videoNum).padStart(2, "0")}-%`}
    LIMIT 1
  `;
  if (r.length === 0) {
    throw new Error(
      `No EN canonical_slug found for V${videoNum}. Run --lang English first.`
    );
  }
  return r[0].canonical_slug;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🎬 Uploading + seeding ${langLabel} films from:\n   ${dir}\n`);

  const videosDir = path.join(dir, "videos");
  const thumbsDir = path.join(dir, "thumbnails");
  const writeupsPath = path.join(dir, "WRITEUPS.md");

  if (!fs.existsSync(writeupsPath)) {
    console.error(`Missing WRITEUPS.md at ${writeupsPath}`);
    process.exit(1);
  }
  const writeups = parseWriteups(fs.readFileSync(writeupsPath, "utf-8"));
  console.log(`📖 Parsed ${writeups.size} film writeups`);

  const videoFiles = fs
    .readdirSync(videosDir)
    .filter(f => /^V\d+_.+\.mp4$/i.test(f))
    .sort();
  console.log(`📁 Found ${videoFiles.length} V-prefix video files\n`);

  if (videoFiles.length !== 20) {
    console.warn(`⚠ Expected 20 V-prefix videos, got ${videoFiles.length}. Continuing anyway.`);
  }

  let uploaded = 0;
  let seeded = 0;
  let skipped = 0;

  for (const videoFile of videoFiles) {
    const videoNum = parseInt(videoFile.match(/^V0?(\d+)/i)[1], 10);
    const writeup = writeups.get(videoNum);
    if (!writeup) {
      console.warn(`  ⚠ V${videoNum}: no writeup found for "${videoFile}", skipping`);
      continue;
    }

    const canonicalSlug = await resolveCanonicalSlug(videoNum, writeup.title);
    const slug = langCode === "en" ? canonicalSlug : `${canonicalSlug}-${langCode}`;

    // Upload video
    const videoBuf = fs.readFileSync(path.join(videosDir, videoFile));
    const videoKey = `films-s2/${langCode}/${canonicalSlug}.mp4`;
    const videoUrl = await uploadToR2(videoKey, videoBuf, "video/mp4");
    console.log(`  V${String(videoNum).padStart(2, "0")} [${langCode}] ▶  ${videoFile}`);
    console.log(`         ↳ ${videoUrl}`);

    // Upload thumbnail. The DE/HI/ID bundles ship English-named thumbnail
    // files (poster art is shared across languages — no translated text on
    // the image itself), so match by V-number prefix rather than exact
    // filename. Falls back to the EN folder's matching V-thumbnail if the
    // current language folder doesn't have it.
    const vPrefix = `V${String(videoNum).padStart(2, "0")}_`;
    let thumbPath = null;
    const localCandidates = fs.existsSync(thumbsDir)
      ? fs.readdirSync(thumbsDir).filter(f => f.startsWith(vPrefix) && /\.png$/i.test(f))
      : [];
    if (localCandidates.length > 0) {
      thumbPath = path.join(thumbsDir, localCandidates[0]);
    } else if (langCode !== "en") {
      // Fall back to the English folder's thumbnail.
      const enThumbsDir =
        "C:/Users/DEV NARSI/Downloads/TURBOLOOP_S2_ENGLISH (1)/TURBOLOOP_S2_ENGLISH/thumbnails";
      const enCandidates = fs.existsSync(enThumbsDir)
        ? fs.readdirSync(enThumbsDir).filter(f => f.startsWith(vPrefix) && /\.png$/i.test(f))
        : [];
      if (enCandidates.length > 0) {
        thumbPath = path.join(enThumbsDir, enCandidates[0]);
      }
    }
    let thumbUrl = null;
    if (thumbPath && fs.existsSync(thumbPath)) {
      const thumbBuf = fs.readFileSync(thumbPath);
      const thumbKey = `film-thumbs-s2/${langCode}/${canonicalSlug}.jpg`;
      thumbUrl = await uploadToR2(thumbKey, thumbBuf, "image/png");
      console.log(`         ↳ thumb /${thumbKey} (from ${path.basename(thumbPath)})`);
    } else {
      console.log(`         ⚠ thumb missing for V${videoNum}`);
    }
    uploaded++;

    // Seed DB row
    const inserted = await sql`
      INSERT INTO videos
        (title, slug, canonical_slug, description, headline, tagline,
         direct_url, poster_url, category, language, language_flag,
         sort_order, published)
      VALUES
        (${writeup.title}, ${slug}, ${canonicalSlug}, ${writeup.body},
         ${writeup.headline}, ${writeup.cta || writeup.title.slice(0, 200)},
         ${videoUrl}, ${thumbUrl}, 'cinematic', ${langLabel}, ${langFlag},
         ${videoNum}, true)
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `;
    if (inserted.length > 0) {
      console.log(`         ↳ db id=${inserted[0].id}`);
      seeded++;
    } else {
      console.log(`         ↳ slug "${slug}" already in DB — skipped`);
      skipped++;
    }
    console.log("");
  }

  console.log(
    `\n✅ ${langLabel} done. Uploaded ${uploaded} videos. Seeded ${seeded} new rows (${skipped} already existed).`
  );

  const summary = await sql`
    SELECT language, COUNT(*)::int AS n
    FROM videos
    WHERE category = 'cinematic'
    GROUP BY language
    ORDER BY language
  `;
  console.log("\n=== cinematic rows by language ===");
  for (const r of summary) console.log(`  ${r.language}: ${r.n}`);
}

main().catch(err => {
  console.error("❌", err);
  process.exit(1);
});
