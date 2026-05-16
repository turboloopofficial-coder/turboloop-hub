// Upload the 6-language Educational Kit (65 banners × 6 languages = 390
// PNGs) to R2 under creatives/<lang>/<NN>.png, and emit a manifest with
// each banner's headline + caption + hashtags parsed from its matching
// .txt file.
//
// Source layout (one folder per language, parallel numbered files):
//   <root>/English/01_What_Is_TurboLoop.png
//   <root>/English/01_What_Is_TurboLoop.txt
//   <root>/Hindi/01_TurboLoop_Kya_Hai.png
//   <root>/Hindi/01_TurboLoop_Kya_Hai.txt
//   ...
//
// Output:
//   - R2 keys: creatives/en/01.png, creatives/hi/01.png, ... creatives/es/65.png
//   - next-app/lib/creatives-language-kit-manifest.json with 390 entries
//
// Usage:
//   node scripts/upload-lang-kit.mjs --root "C:/Users/DEV NARSI/Downloads/Turbo Loop Hub assts/TurboLoop_Complete_Kit"
//   node scripts/upload-lang-kit.mjs --root <path> --manifest-only   # skip upload, just rebuild manifest
//   node scripts/upload-lang-kit.mjs --root <path> --upload-only     # skip manifest write

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

const argv = process.argv.slice(2);
function arg(name) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : null;
}
const root = arg("root");
const manifestOnly = argv.includes("--manifest-only");
const uploadOnly = argv.includes("--upload-only");
/** Process ONLY this language code (e.g. --only-lang de). When set, the
 *  manifest is merged-not-replaced: existing entries for other languages
 *  stay put, only this language's entries are overwritten. Used when
 *  adding a new language without re-uploading the others. */
const onlyLang = arg("only-lang");

if (!root) {
  console.error("Required: --root <path-to-TurboLoop_Complete_Kit>");
  process.exit(1);
}
if (!fs.existsSync(root)) {
  console.error("Folder not found: " + root);
  process.exit(1);
}
if (!manifestOnly && (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL)) {
  console.error("Missing R2 env vars (or pass --manifest-only).");
  process.exit(1);
}

// Folder name (as-it-appears-on-disk) → ISO-639-style 2-char code we
// use everywhere downstream (cards, filters, R2 keys, manifest).
const LANGUAGES = {
  English: "en",
  Hindi: "hi",
  Indonesian: "id",
  French: "fr",
  Arabic: "ar",
  Spanish: "es",
  German: "de",
};

// Hard-coded palette per language for the section heading tint on the
// /creatives page. Picked to feel distinct without clashing with the
// brand cyan→purple — Arabic gets desert gold, French rouge, etc.
const LANG_PALETTES = {
  en: { from: "#0891B2", via: "#22D3EE", to: "#7C3AED" },
  hi: { from: "#F59E0B", via: "#FB923C", to: "#EF4444" },
  id: { from: "#DC2626", via: "#F87171", to: "#FBBF24" },
  fr: { from: "#1E40AF", via: "#3B82F6", to: "#EF4444" },
  ar: { from: "#92400E", via: "#D97706", to: "#FBBF24" },
  es: { from: "#B91C1C", via: "#EF4444", to: "#FBBF24" },
  de: { from: "#000000", via: "#DC2626", to: "#FCD34D" },
};

const LANG_LABELS = {
  en: "English",
  hi: "हिन्दी",
  id: "Bahasa Indonesia",
  fr: "Français",
  ar: "العربية",
  es: "Español",
  de: "Deutsch",
};

const LANG_FLAGS = {
  en: "🇬🇧",
  hi: "🇮🇳",
  id: "🇮🇩",
  fr: "🇫🇷",
  ar: "🇸🇦",
  es: "🇪🇸",
  de: "🇩🇪",
};

const s3 = !manifestOnly
  ? new S3Client({
      region: "auto",
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

/** True iff the line is purely decorative — runs of =, -, _, ., · or
 *  similar separator characters. We skip these when looking for the
 *  headline because the German kit wraps every headline in
 *  ===...=== separator bands. */
function isSeparatorLine(line) {
  const t = line.trim();
  if (!t) return false;
  // 4+ identical separator characters (covers ====, ----, ____, ····, etc.)
  return /^[=\-_·\.•─━]{4,}$/.test(t);
}

/** Parse a caption .txt into structured fields. Two source shapes are
 *  supported:
 *    - English / Spanish / Hindi / Indonesian / French / Arabic kits
 *      put the headline as line 1 (`🔷 WHAT IS TURBOLOOP?`)
 *    - German kit wraps every headline in `===...===` separator bands.
 *  We skip separator-only lines while hunting for the headline so both
 *  shapes resolve to the right headline text. Hashtags are still parsed
 *  from a trailing `#tag #tag` line if present. */
function parseCaption(text) {
  const lines = text.trim().split(/\r?\n/);

  // Headline: first line with actual content (skipping separator bands).
  let headline = "";
  for (const l of lines) {
    if (l.trim() && !isSeparatorLine(l)) {
      headline = l.trim();
      break;
    }
  }

  // Hashtags: last non-empty non-separator line that starts with #.
  // Some kits put hashtags under a `📱 HASHTAGS:` header — we don't care,
  // we just look at the last #-prefixed line.
  let hashtags = [];
  let lastHashIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    const t = lines[i].trim();
    if (!t || isSeparatorLine(t)) continue;
    if (t.startsWith("#")) {
      hashtags = t.split(/\s+/).filter(s => s.startsWith("#"));
      lastHashIdx = i;
    }
    break;
  }

  // Caption = everything before the hashtags line, with decorative
  // separator bands and the HASHTAGS section header stripped so the
  // share-sheet text reads cleanly.
  const captionLines = (lastHashIdx >= 0 ? lines.slice(0, lastHashIdx) : lines)
    .filter(l => !isSeparatorLine(l))
    .filter(l => !/^📱?\s*HASHTAGS?\s*:?\s*$/i.test(l.trim()));
  const caption = captionLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  return { headline, caption, hashtags };
}

async function uploadOne(localPath, key) {
  const body = fs.readFileSync(localPath);
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: "image/png",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return body.length;
}

async function processLanguage(folderName, langCode) {
  const langDir = path.join(root, folderName);
  if (!fs.existsSync(langDir)) {
    console.warn(`  ⚠ Skipping ${folderName}: folder not found`);
    return [];
  }
  const pngs = fs
    .readdirSync(langDir)
    .filter(f => /^\d+_.*\.png$/i.test(f))
    .sort();

  const entries = [];
  let totalBytes = 0;

  for (const png of pngs) {
    // Number prefix is the stable concept ID across languages.
    const m = png.match(/^(\d+)_(.+)\.png$/i);
    if (!m) continue;
    const num = m[1].padStart(2, "0");
    const titleSlug = m[2]
      .replace(/_/g, "-")
      .replace(/[^A-Za-z0-9-]/g, "")
      .toLowerCase();

    const txtPath = path.join(langDir, png.replace(/\.png$/i, ".txt"));
    if (!fs.existsSync(txtPath)) {
      console.warn(`  ⚠ Missing caption for ${png}`);
      continue;
    }
    const txt = fs.readFileSync(txtPath, "utf8");
    const { headline, caption, hashtags } = parseCaption(txt);

    const r2Key = `creatives/${langCode}/${num}.png`;
    if (!manifestOnly) {
      try {
        const bytes = await uploadOne(path.join(langDir, png), r2Key);
        totalBytes += bytes;
      } catch (err) {
        console.error(`  ✗ ${r2Key} — ${err?.message ?? err}`);
        continue;
      }
    }

    const url = `${R2_PUBLIC_URL.replace(/\/$/, "")}/${r2Key}`;
    entries.push({
      slug: `lang-kit-${langCode}-${num}`,
      url,
      language: langCode,
      categoryId: "lang-kit",
      categoryLabel: "Educational Kit",
      emoji: "📚",
      palette: LANG_PALETTES[langCode],
      original: png,
      headline,
      caption,
      hashtags,
      visualNumber: parseInt(num, 10),
    });
  }

  console.log(
    `  ✓ ${folderName.padEnd(12)} → ${entries.length.toString().padStart(2)} banners${
      !manifestOnly ? ` (${(totalBytes / 1024 / 1024).toFixed(1)} MB)` : ""
    }`
  );
  return entries;
}

(async () => {
  const targets = onlyLang
    ? Object.entries(LANGUAGES).filter(([, code]) => code === onlyLang)
    : Object.entries(LANGUAGES);

  if (onlyLang && targets.length === 0) {
    console.error(`No language with code "${onlyLang}" — known: ${Object.values(LANGUAGES).join(", ")}`);
    process.exit(1);
  }

  console.log(
    `${manifestOnly ? "Generating manifest from" : "Uploading + manifesting"} ${root}` +
      (onlyLang ? ` (only --lang=${onlyLang})` : "") +
      "\n"
  );

  const fresh = [];
  for (const [folder, code] of targets) {
    const entries = await processLanguage(folder, code);
    fresh.push(...entries);
  }

  if (!uploadOnly) {
    const manifestPath = path.resolve(
      "./next-app/lib/creatives-language-kit-manifest.json"
    );

    // When --only-lang is in play, merge into the existing manifest:
    // strip rows for the target language, then append the freshly-
    // produced entries. When no filter is set, rewrite from scratch.
    let priorItems = [];
    if (onlyLang && fs.existsSync(manifestPath)) {
      const existing = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      priorItems = (existing.items ?? []).filter(
        i => i.language !== onlyLang
      );
    }
    const allItems = [...priorItems, ...fresh];

    const knownCodes = onlyLang
      ? // Preserve any languages already in the manifest (so adding one
        // new language doesn't drop the others' metadata).
        Array.from(
          new Set([
            ...allItems.map(i => i.language),
            ...Object.values(LANGUAGES),
          ])
        )
      : Object.values(LANGUAGES);

    const manifest = {
      kind: "language-kit",
      generatedAt: new Date().toISOString(),
      itemCount: allItems.length,
      languages: Object.fromEntries(
        knownCodes.map(code => {
          const folder = Object.entries(LANGUAGES).find(
            ([, c]) => c === code
          )?.[0];
          return [
            code,
            {
              code,
              label: LANG_LABELS[code] ?? code,
              flag: LANG_FLAGS[code] ?? "🌐",
              folder: folder ?? null,
              count: allItems.filter(e => e.language === code).length,
            },
          ];
        })
      ),
      items: allItems,
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(
      `\n📝 Wrote ${allItems.length} entries → ${path.relative(".", manifestPath)}`
    );
  }

  const expectedPerLang = 65;
  const expected = (onlyLang ? 1 : Object.keys(LANGUAGES).length) * expectedPerLang;
  console.log(
    `\n${fresh.length === expected ? "✅" : "⚠️ "} Processed ${fresh.length}/${expected} banners this run.`
  );
})().catch(err => {
  console.error(err);
  process.exit(1);
});
