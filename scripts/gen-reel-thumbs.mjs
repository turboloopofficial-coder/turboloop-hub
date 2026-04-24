import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const {
  R2_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

async function uploadR2(localPath, key, contentType) {
  const body = fs.readFileSync(localPath);
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return `${R2_PUBLIC_URL}/${key}`;
}

async function main() {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const downloads = "C:/Users/DEV NARSI/Downloads";
  const tmpDir = path.join(projectRoot, ".tmp-thumbs");
  fs.mkdirSync(tmpDir, { recursive: true });

  const reels = JSON.parse(fs.readFileSync(path.join(projectRoot, "scripts/reels-manifest.json"), "utf-8")).reels;

  console.log(`🖼  Generating ${reels.length} thumbnails using ffmpeg at ${ffmpegPath}\n`);

  const updated = [];
  for (const reel of reels) {
    const videoPath = path.join(downloads, reel.file);
    const thumbPath = path.join(tmpDir, `${reel.slug}.jpg`);
    if (!fs.existsSync(videoPath)) {
      console.log(`  ⚠ Missing video: ${reel.file}`);
      updated.push(reel);
      continue;
    }

    // Grab frame at 1.2s (skip intro black frames), scale to 540x960 (9:16), quality 4 (good)
    const cmd = `"${ffmpegPath}" -y -ss 00:00:01.2 -i "${videoPath}" -frames:v 1 -vf "scale=540:-2" -q:v 4 "${thumbPath}"`;
    try {
      execSync(cmd, { stdio: "pipe" });
    } catch (e) {
      // Some reels may be shorter than 1.2s — retry from start
      try {
        const cmd2 = `"${ffmpegPath}" -y -i "${videoPath}" -frames:v 1 -vf "scale=540:-2" -q:v 4 "${thumbPath}"`;
        execSync(cmd2, { stdio: "pipe" });
      } catch {
        console.log(`  ❌ Failed to extract frame for ${reel.slug}`);
        updated.push(reel);
        continue;
      }
    }

    const key = `reel-thumbs/${reel.slug}.jpg`;
    const url = await uploadR2(thumbPath, key, "image/jpeg");
    const size = fs.statSync(thumbPath).size;
    console.log(`  ✓ ${reel.slug}.jpg → ${url} (${(size / 1024).toFixed(1)} KB)`);
    updated.push({ ...reel, thumbUrl: url });
  }

  // Update manifest with thumb URLs
  const manifestPath = path.join(projectRoot, "scripts/reels-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify({ reels: updated }, null, 2));
  console.log(`\n✅ Manifest updated with thumbUrl for each reel`);

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

main().catch(err => { console.error("❌", err); process.exit(1); });
