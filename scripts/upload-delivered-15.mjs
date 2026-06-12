/**
 * Upload the 15 delivered images to R2.
 * - 5 hub-promo replacements → hub-promo/
 * - 10 cinematic thumbnails  → cinematic-thumbs/
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, readdirSync } from "fs";
import { join, extname } from "path";
import dotenv from "dotenv";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
const BASE = "/home/ubuntu/zoom-replacements/TurboLoop_Rebuilt";

const uploads = [
  // Hub-promo replacements
  { local: `${BASE}/hub-promo/hub-promo-leaderboard-v1.png`, key: "hub-promo/hub-promo-leaderboard-v1.png", mime: "image/png" },
  { local: `${BASE}/hub-promo/hub-promo-leaderboard-v2.png`, key: "hub-promo/hub-promo-leaderboard-v2.png", mime: "image/png" },
  { local: `${BASE}/hub-promo/hub-promo-profile-v1.png`,     key: "hub-promo/hub-promo-profile-v1.png",     mime: "image/png" },
  { local: `${BASE}/hub-promo/hub-promo-profile-v2.png`,     key: "hub-promo/hub-promo-profile-v2.png",     mime: "image/png" },
  { local: `${BASE}/hub-promo/hub-promo-profile-v3.png`,     key: "hub-promo/hub-promo-profile-v3.png",     mime: "image/png" },
  // Cinematic thumbnails
  { local: `${BASE}/cinematic-thumbs/manifesto.jpg`,                    key: "cinematic-thumbs/manifesto.jpg",                    mime: "image/jpeg" },
  { local: `${BASE}/cinematic-thumbs/bank-is-lying.jpg`,               key: "cinematic-thumbs/bank-is-lying.jpg",               mime: "image/jpeg" },
  { local: `${BASE}/cinematic-thumbs/inflation-trap.jpg`,              key: "cinematic-thumbs/inflation-trap.jpg",              mime: "image/jpeg" },
  { local: `${BASE}/cinematic-thumbs/smart-contract-bank-manager.jpg`, key: "cinematic-thumbs/smart-contract-bank-manager.jpg", mime: "image/jpeg" },
  { local: `${BASE}/cinematic-thumbs/why-rich-stay-rich.jpg`,          key: "cinematic-thumbs/why-rich-stay-rich.jpg",          mime: "image/jpeg" },
  { local: `${BASE}/cinematic-thumbs/where-does-money-go.jpg`,         key: "cinematic-thumbs/where-does-money-go.jpg",         mime: "image/jpeg" },
  { local: `${BASE}/cinematic-thumbs/system-not-built-for-you.jpg`,    key: "cinematic-thumbs/system-not-built-for-you.jpg",    mime: "image/jpeg" },
  { local: `${BASE}/cinematic-thumbs/what-is-turboloop.jpg`,           key: "cinematic-thumbs/what-is-turboloop.jpg",           mime: "image/jpeg" },
  { local: `${BASE}/cinematic-thumbs/20-level-network.jpg`,            key: "cinematic-thumbs/20-level-network.jpg",            mime: "image/jpeg" },
  { local: `${BASE}/cinematic-thumbs/54-percent-real-math.jpg`,        key: "cinematic-thumbs/54-percent-real-math.jpg",        mime: "image/jpeg" },
];

let ok = 0, fail = 0;
for (const { local, key, mime } of uploads) {
  try {
    const body = readFileSync(local);
    await R2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: mime,
      CacheControl: "public, max-age=86400",
    }));
    console.log(`✅ ${key}`);
    ok++;
  } catch (err) {
    console.error(`❌ ${key}: ${err.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} uploaded, ${fail} failed.`);
