// Upload all 504 campaign creatives to R2 under campaigns/{category}/ prefix.
// Usage: node scripts/upload-campaigns.mjs --dir /home/ubuntu/creatives-upload
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = process.env;

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  console.error("Missing R2 env vars in .env");
  process.exit(1);
}

const argv = process.argv.slice(2);
const dirArg = argv[argv.indexOf("--dir") + 1];
if (!dirArg || !fs.existsSync(dirArg)) {
  console.error("Required: --dir <folder containing category subfolders>");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const categories = fs.readdirSync(dirArg).filter(f => fs.statSync(path.join(dirArg, f)).isDirectory());
let total = 0, uploaded = 0, failed = 0;

for (const category of categories) {
  const catDir = path.join(dirArg, category);
  const files = fs.readdirSync(catDir).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
  console.log(`\n📁 ${category}/ — ${files.length} files`);

  for (const file of files) {
    total++;
    const filePath = path.join(catDir, file);
    const key = `campaigns/${category}/${file}`;
    const body = fs.readFileSync(filePath);
    const ext = path.extname(file).toLowerCase();
    const contentType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

    try {
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }));
      uploaded++;
      process.stdout.write(`  ✅ ${file}\n`);
    } catch (err) {
      failed++;
      console.error(`  ❌ ${file}: ${err.message}`);
    }
  }
}

console.log(`\n🎉 Done — ${uploaded}/${total} uploaded, ${failed} failed`);
console.log(`📦 Base URL: ${R2_PUBLIC_URL}/campaigns/`);
