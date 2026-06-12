import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, readdirSync } from "fs";
import { join, extname, basename } from "path";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env") });

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
const SOURCE_DIR = "/home/ubuntu/cinematic-fixed";

const files = readdirSync(SOURCE_DIR).filter(f => f.endsWith(".jpg"));

console.log(`Uploading ${files.length} fixed cinematic thumbnails to R2...`);

let ok = 0, fail = 0;
for (const file of files) {
  const filePath = join(SOURCE_DIR, file);
  const key = `cinematic-thumbs/${file}`;
  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: readFileSync(filePath),
      ContentType: "image/jpeg",
      CacheControl: "public, max-age=31536000",
    }));
    console.log(`  ✅ ${key}`);
    ok++;
  } catch (e) {
    console.error(`  ❌ ${key}: ${e.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} uploaded, ${fail} failed.`);
