// Uploads the 10 user-provided TurboLoop Creatives Page Promo banners to R2.
// Stores them at: creatives-promo/banner-01.png ... banner-10.png
import "dotenv/config";
import fs from "node:fs";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const FORCE = process.argv.includes("--force");
const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = process.env;
if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  console.error("❌ Missing R2 env vars"); process.exit(1);
}
const s3 = new S3Client({
  region: "auto", endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const BANNERS = [
  { file: "banner-01-arsenal.png",       key: "creatives-promo/banner-01.png" },
  { file: "banner-02-vault.png",         key: "creatives-promo/banner-02.png" },
  { file: "banner-03-language-map.png",  key: "creatives-promo/banner-03.png" },
  { file: "banner-04-download.png",      key: "creatives-promo/banner-04.png" },
  { file: "banner-05-categories.png",    key: "creatives-promo/banner-05.png" },
  { file: "banner-06-community-wall.png",key: "creatives-promo/banner-06.png" },
  { file: "banner-07-stats.png",         key: "creatives-promo/banner-07.png" },
  { file: "banner-08-referral.png",      key: "creatives-promo/banner-08.png" },
  { file: "banner-09-spotlight.png",     key: "creatives-promo/banner-09.png" },
  { file: "banner-10-cinematic.png",     key: "creatives-promo/banner-10.png" },
];

async function existsInR2(key) {
  try { await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key })); return true; }
  catch { return false; }
}

const urls = [];
for (const { file, key } of BANNERS) {
  const localPath = `/home/ubuntu/creatives-promo-user/${file}`;
  if (!fs.existsSync(localPath)) { console.error(`❌ Missing: ${localPath}`); continue; }
  const exists = !FORCE && await existsInR2(key);
  if (exists) {
    const url = `${R2_PUBLIC_URL}/${key}`;
    console.log(`⏭️  Already exists: ${url}`);
    urls.push(url); continue;
  }
  const body = fs.readFileSync(localPath);
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME, Key: key, Body: body, ContentType: "image/png",
    CacheControl: "public, max-age=31536000",
  }));
  const url = `${R2_PUBLIC_URL}/${key}`;
  console.log(`✅ Uploaded: ${url}`);
  urls.push(url);
}
console.log("\n=== URLs ===");
urls.forEach(u => console.log(u));
