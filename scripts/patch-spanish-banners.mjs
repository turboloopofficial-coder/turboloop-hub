// Surgical fixup for upload-lang-kit.mjs: re-uploads Spanish banners
// 54..65 (lost to a DNS blip during the initial bulk upload) and patches
// them into the existing creatives-language-kit-manifest.json.
//
// Idempotent — R2 PUT overwrites in place; manifest dedupe is by slug.
// Safe to run multiple times.
//
// Delete this file once the lang-kit manifest is fully populated and
// we no longer need to recover from a partial upload.

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const {
  R2_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

const SPANISH_DIR =
  "C:/Users/DEV NARSI/Downloads/Turbo Loop Hub assts/TurboLoop_Complete_Kit/Spanish";
const MISSING = [54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65];
const LANG_PALETTE = { from: "#B91C1C", via: "#EF4444", to: "#FBBF24" };

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

function findFile(num) {
  const pad = String(num).padStart(2, "0");
  const all = fs.readdirSync(SPANISH_DIR);
  const png = all.find(f => f.startsWith(pad + "_") && f.endsWith(".png"));
  if (!png) throw new Error(`No PNG for Spanish ${pad}`);
  return {
    png,
    txt: png.replace(/\.png$/, ".txt"),
  };
}

function parseCaption(text) {
  const lines = text.trim().split(/\r?\n/);
  let headline = "";
  for (const l of lines) {
    if (l.trim()) {
      headline = l.trim();
      break;
    }
  }
  let hashtags = [];
  let lastHashIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    const t = lines[i].trim();
    if (!t) continue;
    if (t.startsWith("#")) {
      hashtags = t.split(/\s+/).filter(s => s.startsWith("#"));
      lastHashIdx = i;
    }
    break;
  }
  const captionLines =
    lastHashIdx >= 0 ? lines.slice(0, lastHashIdx) : lines.slice();
  return { headline, caption: captionLines.join("\n").trim(), hashtags };
}

(async () => {
  console.log(`Patching ${MISSING.length} missing Spanish banners…\n`);

  const manifestPath = path.resolve(
    "./next-app/lib/creatives-language-kit-manifest.json"
  );
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  // Strip any stale partial Spanish entries we're about to re-add, so
  // we don't end up with duplicates if this is a re-run.
  const newEntries = [];
  for (const num of MISSING) {
    const pad = String(num).padStart(2, "0");
    const { png, txt } = findFile(num);
    const r2Key = `creatives/es/${pad}.png`;
    const body = fs.readFileSync(path.join(SPANISH_DIR, png));

    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: r2Key,
        Body: body,
        ContentType: "image/png",
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const captionTxt = fs.readFileSync(
      path.join(SPANISH_DIR, txt),
      "utf8"
    );
    const { headline, caption, hashtags } = parseCaption(captionTxt);

    const url = `${R2_PUBLIC_URL.replace(/\/$/, "")}/${r2Key}`;
    const slug = `lang-kit-es-${pad}`;

    newEntries.push({
      slug,
      url,
      language: "es",
      categoryId: "lang-kit",
      categoryLabel: "Educational Kit",
      emoji: "📚",
      palette: LANG_PALETTE,
      original: png,
      headline,
      caption,
      hashtags,
      visualNumber: num,
    });

    console.log(`  ✓ ${r2Key} (${(body.length / 1024).toFixed(0)} KB)`);
  }

  // Merge: drop any existing entries with the same slug, then append.
  const newSlugs = new Set(newEntries.map(e => e.slug));
  manifest.items = manifest.items.filter(i => !newSlugs.has(i.slug));
  manifest.items.push(...newEntries);

  // Refresh top-level metadata.
  manifest.generatedAt = new Date().toISOString();
  manifest.itemCount = manifest.items.length;
  manifest.languages.es.count = manifest.items.filter(
    i => i.language === "es"
  ).length;

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(
    `\n✅ Patched. itemCount: ${manifest.itemCount} (es: ${manifest.languages.es.count}/65)`
  );
})().catch(err => {
  console.error(err);
  process.exit(1);
});
