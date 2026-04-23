import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const {
  R2_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  console.error("Missing R2 env vars. Check .env");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function upload(localPath, key, contentType) {
  const body = fs.readFileSync(localPath);
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  const url = `${R2_PUBLIC_URL}/${key}`;
  console.log(`  ✓ ${key} → ${url} (${(body.length / 1024 / 1024).toFixed(1)} MB)`);
  return url;
}

// Language → country flag code (matches LANGUAGE_FLAGS in constants.ts)
const LANGUAGE_FLAGS = {
  English: "gb", Amharic: "et", Arabic: "sa", Azerbaijani: "az",
  Bengali: "bd", "Chinese (Simplified)": "cn", "Chinese (Traditional)": "tw",
  Czech: "cz", Dutch: "nl", Filipino: "ph", French: "fr",
  Georgian: "ge", German: "de", Greek: "gr", Gujarati: "in",
  Hausa: "ng", Hebrew: "il", Hindi: "in", Hungarian: "hu",
  Indonesian: "id", Italian: "it", Japanese: "jp", Kannada: "in",
  Kazakh: "kz", Khmer: "kh", Korean: "kr", Malay: "my",
  Malayalam: "in", Marathi: "in", Myanmar: "mm",
  Pashto: "af", Persian: "ir", Polish: "pl", Portuguese: "br",
  Romanian: "ro", Russian: "ru", Sinhala: "lk", Spanish: "es",
  Swedish: "se", Tamil: "in", Telugu: "in", Thai: "th",
  Turkish: "tr", Ukrainian: "ua", Urdu: "pk", Uzbek: "uz",
  Vietnamese: "vn", Yoruba: "ng",
};

function parseLanguageFromFilename(filename) {
  // e.g. "Chinese_Simplified_简体中文-TURBO_LOOP.pdf" → "Chinese (Simplified)"
  const prefix = filename.split("-TURBO_LOOP")[0];
  const parts = prefix.split("_");

  if (parts[0] === "Chinese" && parts[1] === "Simplified") return "Chinese (Simplified)";
  if (parts[0] === "Chinese" && parts[1] === "Traditional") return "Chinese (Traditional)";
  if (parts[0] === "Filipino") return "Filipino";
  if (parts[0] === "Indonesian") return "Indonesian";
  if (parts[0] === "Malay") return "Malay";
  if (parts[0] === "Vietnamese") return "Vietnamese";
  return parts[0];
}

function slugify(language) {
  return language.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const downloads = "C:/Users/DEV NARSI/Downloads";
  const logoPath = path.join(downloads, "TurboLoop Logo/turboloop_logo_premium_v2.png");
  const englishPdfPath = path.join(downloads, "English - TURBO_LOOP_—_The_Complete_DeFi_Ecosystem (2).pdf");
  const pdfsDir = path.join(projectRoot, "_r2_upload_staging/pdfs");

  console.log("🚀 Uploading assets to Cloudflare R2 bucket:", R2_BUCKET_NAME);
  console.log("    Public URL base:", R2_PUBLIC_URL);
  console.log();

  const manifest = {
    logo: null,
    deck: null,
    presentations: [],
  };

  console.log("📸 Branding assets:");
  manifest.logo = await upload(logoPath, "branding/turboloop-logo.png", "image/png");
  manifest.deck = await upload(englishPdfPath, "branding/turboloop-deck.pdf", "application/pdf");

  console.log("\n📄 Language presentations:");
  manifest.presentations.push({
    language: "English",
    flag: "gb",
    url: manifest.deck,
    filename: "english",
  });

  const files = fs.readdirSync(pdfsDir).filter(f => f.endsWith(".pdf"));
  for (const file of files) {
    const size = fs.statSync(path.join(pdfsDir, file)).size;
    if (size < 1024) {
      console.log(`  ⚠ Skipping ${file} (corrupted, ${size} bytes)`);
      continue;
    }
    const language = parseLanguageFromFilename(file);
    const flag = LANGUAGE_FLAGS[language];
    if (!flag) {
      console.log(`  ⚠ No flag code for language "${language}", skipping`);
      continue;
    }
    const slug = slugify(language);
    const url = await upload(
      path.join(pdfsDir, file),
      `presentations/${slug}.pdf`,
      "application/pdf",
    );
    manifest.presentations.push({ language, flag, url, filename: slug });
  }

  const manifestPath = path.join(projectRoot, "scripts/r2-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\n✅ Uploaded ${manifest.presentations.length} presentations + logo + deck`);
  console.log(`📝 Manifest saved to: scripts/r2-manifest.json`);
}

main().catch(err => {
  console.error("❌ Upload failed:", err);
  process.exit(1);
});
