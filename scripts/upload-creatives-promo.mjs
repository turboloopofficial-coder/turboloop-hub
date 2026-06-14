// Uploads the 10 TurboLoop Creatives Page Promo banners to R2.
// Stores them at: creatives-promo/banner-01.jpg ... banner-10.jpg
// Outputs public URLs for use in cron-master.ts
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FORCE = process.argv.includes("--force");

const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = process.env;
if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  console.error("❌ Missing R2 env vars"); process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const BANNERS = [
  { file: "banner-01-arsenal.jpg",    key: "creatives-promo/banner-01.jpg" },
  { file: "banner-02-vault.jpg",      key: "creatives-promo/banner-02.jpg" },
  { file: "banner-03-languages.jpg",  key: "creatives-promo/banner-03.jpg" },
  { file: "banner-04-download.jpg",   key: "creatives-promo/banner-04.jpg" },
  { file: "banner-05-categories.jpg", key: "creatives-promo/banner-05.jpg" },
  { file: "banner-06-wall.jpg",       key: "creatives-promo/banner-06.jpg" },
  { file: "banner-07-stats.jpg",      key: "creatives-promo/banner-07.jpg" },
  { file: "banner-08-referral.jpg",   key: "creatives-promo/banner-08.jpg" },
  { file: "banner-09-spotlight.jpg",  key: "creatives-promo/banner-09.jpg" },
  { file: "banner-10-cinematic.jpg",  key: "creatives-promo/banner-10.jpg" },
];

async function existsInR2(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    return true;
  } catch { return false; }
}

const urls = [];
for (const { file, key } of BANNERS) {
  const localPath = path.join("/home/ubuntu/creatives-promo-banners", file);
  if (!fs.existsSync(localPath)) { console.error(`❌ Missing: ${localPath}`); continue; }
  const exists = !FORCE && await existsInR2(key);
  if (exists) {
    const url = `${R2_PUBLIC_URL}/${key}`;
    console.log(`⏭️  Already exists: ${url}`);
    urls.push(url);
    continue;
  }
  const body = fs.readFileSync(localPath);
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME, Key: key, Body: body, ContentType: "image/jpeg",
    CacheControl: "public, max-age=31536000",
  }));
  const url = `${R2_PUBLIC_URL}/${key}`;
  console.log(`✅ Uploaded: ${url}`);
  urls.push(url);
}

console.log("\n=== CREATIVES_PROMO_BANNER_URLS ===");
console.log(JSON.stringify(urls, null, 2));
