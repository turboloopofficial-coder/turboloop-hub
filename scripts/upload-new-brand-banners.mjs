// Upload all newly generated brand banners to R2
// Uploads zoom banners to zoom-banners/ prefix and hub promos to hub-promo/ prefix
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = process.env;
if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.error("Missing R2 env vars."); process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

async function uploadFile(localPath, r2Key) {
  const body = fs.readFileSync(localPath);
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: r2Key,
    Body: body,
    ContentType: "image/png",
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return body.length;
}

async function uploadDir(dir, prefix) {
  const files = fs.readdirSync(dir).filter(f => /\.png$/i.test(f)).sort();
  let ok = 0, fail = 0;
  for (const file of files) {
    const r2Key = `${prefix}${file}`;
    try {
      const bytes = await uploadFile(path.join(dir, file), r2Key);
      console.log(`  ✓ ${r2Key} (${(bytes/1024).toFixed(0)} KB)`);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${r2Key} — ${err?.message ?? err}`);
      fail++;
    }
  }
  return { ok, fail };
}

async function main() {
  console.log("📤 Uploading zoom banners...\n");
  const z = await uploadDir("/home/ubuntu/brand-kit/output/zoom", "zoom-banners/");
  console.log(`\n✅ Zoom: ${z.ok} uploaded, ${z.fail} failed\n`);

  console.log("📤 Uploading hub promo banners...\n");
  const h = await uploadDir("/home/ubuntu/brand-kit/output/hub", "hub-promo/");
  console.log(`\n✅ Hub promo: ${h.ok} uploaded, ${h.fail} failed\n`);

  console.log(`\n🎉 Total: ${z.ok + h.ok} uploaded, ${z.fail + h.fail} failed`);
  if (R2_PUBLIC_URL) {
    console.log(`\nPublic base URL: ${R2_PUBLIC_URL}`);
    console.log(`Example: ${R2_PUBLIC_URL}/zoom-banners/hub-promo-zoom-en-t60-v1.png`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
