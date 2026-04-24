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
  console.error("Missing R2 env vars");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

async function upload(localPath, key, contentType) {
  if (!fs.existsSync(localPath)) {
    console.log(`  ⚠ Missing: ${localPath}`);
    return null;
  }
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

const reels = [
  {
    title: "The Safest Number in DeFi",
    slug: "safest-number-in-defi",
    file: "TurboLoop_TheSafestNumberinDeFi_1080p_THUMB.mp4",
    description: "Why the math behind Turbo Loop makes it statistically the safest yield farming number in DeFi.",
  },
  {
    title: "The Blockchain Never Lies",
    slug: "blockchain-never-lies",
    file: "TurboLoop_TheBlockchainNeverLies_1080p_THUMB.mp4",
    description: "Every transaction, every reward, every contract call — publicly verifiable on BscScan.",
  },
  {
    title: "Global Momentum",
    slug: "global-momentum",
    file: "TurboLoopGlobalMomentumReel_1080p(1)_THUMB.mp4",
    description: "Communities growing across 6+ continents. The Turbo Loop movement, in motion.",
  },
  {
    title: "Cryptographically Impossible Rug-Pull",
    slug: "rug-pull-proof",
    file: "TurboLoop_TheCryptographicallyImpossibleRug-PullProofArchitecture_1080p_THUMB.mp4",
    description: "Renounced ownership + locked LP + verified contract = rug-pull is cryptographically impossible.",
  },
  {
    title: "90-Day Math",
    slug: "90-day-math",
    file: "TurboLoop90-DayMathReel_1080p_THUMB.mp4",
    description: "Follow the math — 90 days of compound yield modeled on the blockchain.",
  },
  {
    title: "3 Streams of Income",
    slug: "3-streams-of-income",
    file: "TurboLoop_3StreamsofIncome_1080p_THUMB.mp4",
    description: "Yield, referrals, leadership — three independent income streams from a single deposit.",
  },
  {
    title: "The Leadership Journey",
    slug: "leadership-journey",
    file: "TurboLoop_TheLeadershipJourney_1080p_THUMB.mp4",
    description: "From Turbo Partner to Turbo Legend — seven ranks, unlimited earning potential.",
  },
];

async function main() {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const downloads = "C:/Users/DEV NARSI/Downloads";

  console.log("🎬 Uploading reels to R2...\n");

  const manifest = { reels: [] };

  for (const reel of reels) {
    const localPath = path.join(downloads, reel.file);
    const key = `reels/${reel.slug}.mp4`;
    const url = await upload(localPath, key, "video/mp4");
    if (url) {
      manifest.reels.push({ ...reel, url });
    }
  }

  const manifestPath = path.join(projectRoot, "scripts/reels-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\n✅ Uploaded ${manifest.reels.length}/${reels.length} reels`);
  console.log(`📝 Manifest: scripts/reels-manifest.json`);
}

main().catch(err => { console.error("❌", err); process.exit(1); });
