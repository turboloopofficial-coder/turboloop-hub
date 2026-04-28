// Compress + upload all 141 brand banner PNGs from the Sovereign Wealth Framework folder.
// Output: web-friendly JPGs in R2 under creatives/<category>/<slug>.jpg
// Plus a manifest JSON the CreativesHubSection can consume.

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const SRC_DIR = "C:/Users/DEV NARSI/Downloads/TURBOLOOP_SOVEREIGN_WEALTH_FRAMEWORK";
const TARGET_W = 1200;
const TARGET_QUALITY = 82;

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

// Map filename prefix → category metadata
const CATEGORIES = {
  myth_buster: { id: "mythbuster", label: "Myth Busters", emoji: "🛡", palette: { from: "#EF4444", via: "#F59E0B", to: "#7C3AED" } },
  product_bible: { id: "product", label: "Product Bible", emoji: "💎", palette: { from: "#0891B2", via: "#22D3EE", to: "#7C3AED" } },
  quick_start: { id: "quickstart", label: "Quick Start", emoji: "📘", palette: { from: "#10B981", via: "#34D399", to: "#0891B2" } },
  pillar1_math_of_sustainability: { id: "p1-math", label: "P1 · Math of Sustainability", emoji: "📐", palette: { from: "#0891B2", via: "#10B981", to: "#22D3EE" } },
  pillar2_psychology_of_ownership: { id: "p2-psychology", label: "P2 · Psychology of Ownership", emoji: "🧠", palette: { from: "#7C3AED", via: "#A78BFA", to: "#EC4899" } },
  pillar3_20_level_multiplier: { id: "p3-multiplier", label: "P3 · 20-Level Multiplier", emoji: "🌐", palette: { from: "#EC4899", via: "#F472B6", to: "#7C3AED" } },
  pillar4_risk_management: { id: "p4-risk", label: "P4 · Risk Management", emoji: "🛡", palette: { from: "#0F172A", via: "#475569", to: "#7C3AED" } },
  pillar5_velocity_of_compounding: { id: "p5-velocity", label: "P5 · Velocity of Compounding", emoji: "⚡", palette: { from: "#F59E0B", via: "#FBBF24", to: "#EC4899" } },
  pillar6_decentralized_trust: { id: "p6-trust", label: "P6 · Decentralized Trust", emoji: "🔗", palette: { from: "#0EA5E9", via: "#0891B2", to: "#10B981" } },
  pillar7_global_arbitrage: { id: "p7-arbitrage", label: "P7 · Global Arbitrage", emoji: "🌍", palette: { from: "#10B981", via: "#0891B2", to: "#7C3AED" } },
  pillar8_legacy_inheritance: { id: "p8-legacy", label: "P8 · Legacy & Inheritance", emoji: "🏛", palette: { from: "#D97706", via: "#FBBF24", to: "#7C3AED" } },
  pillar9_anti_inflation_shield: { id: "p9-inflation", label: "P9 · Anti-Inflation Shield", emoji: "💎", palette: { from: "#1E40AF", via: "#0891B2", to: "#22D3EE" } },
  pillar10_leadership_ethics: { id: "p10-ethics", label: "P10 · Leadership Ethics", emoji: "🎯", palette: { from: "#7C3AED", via: "#EC4899", to: "#F59E0B" } },
};

function categorize(filename) {
  // Sort prefixes longest first so pillar10_... matches before pillar1_
  const prefixes = Object.keys(CATEGORIES).sort((a, b) => b.length - a.length);
  for (const prefix of prefixes) {
    if (filename.startsWith(prefix)) return prefix;
  }
  return null;
}

async function uploadR2(localBuf, key) {
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: localBuf,
    ContentType: "image/jpeg",
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return `${R2_PUBLIC_URL}/${key}`;
}

async function main() {
  const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith(".png") && !f.includes("logo"));
  console.log(`📦 Processing ${files.length} banner images...\n`);

  const manifest = [];
  let processed = 0;
  let skipped = 0;

  for (const file of files) {
    const cat = categorize(file);
    if (!cat) {
      console.log(`  ⚠ no category match: ${file}`);
      skipped++;
      continue;
    }
    const meta = CATEGORIES[cat];
    const baseName = file.replace(/\.png$/i, "").replace(/^[^_]*_/, "").replace(/_/g, "-");
    const slug = `${meta.id}-${baseName.replace(/[^a-z0-9-]/gi, "-").toLowerCase()}`;
    const r2Key = `creatives/${meta.id}/${slug}.jpg`;
    const srcPath = path.join(SRC_DIR, file);

    try {
      const buf = await sharp(srcPath)
        .resize({ width: TARGET_W, height: TARGET_W, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: TARGET_QUALITY, progressive: true, mozjpeg: true })
        .toBuffer();

      const url = await uploadR2(buf, r2Key);
      const sizeKB = (buf.length / 1024).toFixed(1);
      processed++;
      console.log(`  ✓ [${processed}/${files.length}] ${slug} (${sizeKB} KB)`);

      manifest.push({
        slug,
        url,
        categoryId: meta.id,
        categoryLabel: meta.label,
        emoji: meta.emoji,
        palette: meta.palette,
        original: file,
      });
    } catch (err) {
      console.log(`  ❌ ${file}: ${err.message}`);
      skipped++;
    }
  }

  // Write manifest
  const manifestPath = path.join(process.cwd(), "scripts", "creatives-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify({ generatedAt: new Date().toISOString(), count: manifest.length, items: manifest }, null, 2));
  console.log(`\n✅ Done — ${processed} processed, ${skipped} skipped`);
  console.log(`Manifest: ${manifestPath}`);
}

main().catch(err => { console.error("❌", err); process.exit(1); });
