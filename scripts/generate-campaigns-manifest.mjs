#!/usr/bin/env node
/**
 * generate-campaigns-manifest.mjs
 *
 * Reads the local creatives-upload directory (or a provided --dir argument),
 * builds:
 *   1. next-app/public/campaigns-manifest.json  — 504 image records with SEO metadata
 *   2. server/_vercel/_campaignFileIndex.ts      — ordered filename map for the cron
 *
 * Usage:
 *   node scripts/generate-campaigns-manifest.mjs
 *   node scripts/generate-campaigns-manifest.mjs --dir /path/to/creatives-upload
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Parse --dir argument
const dirArgIdx = process.argv.indexOf("--dir");
const CREATIVES_DIR =
  dirArgIdx !== -1 && process.argv[dirArgIdx + 1]
    ? path.resolve(process.argv[dirArgIdx + 1])
    : path.resolve(ROOT, "..", "creatives-upload");

const R2_BASE = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

const CATEGORY_META = {
  "lifestyle": {
    label: "Lifestyle & Aspiration",
    altPrefix: "TurboLoop passive income lifestyle",
    description: "Passive income lifestyle banners — beach, freedom, luxury, family.",
    keywords: ["passive income", "financial freedom", "lifestyle", "DeFi"],
  },
  "token": {
    label: "$TURBO Token",
    altPrefix: "$TURBO token",
    description: "Token launch, tokenomics, supply, and $TURBO price banners.",
    keywords: ["TURBO token", "tokenomics", "DeFi token", "BSC"],
  },
  "referral": {
    label: "Referral & Network",
    altPrefix: "TurboLoop 20-level referral system",
    description: "20-level referral system, commission tables, rank progression banners.",
    keywords: ["referral", "network income", "20 levels", "affiliate"],
  },
  "objection-handler": {
    label: "Trust & Transparency",
    altPrefix: "TurboLoop trust & transparency",
    description: "FUD-busting, smart contract proof, and objection-handling banners.",
    keywords: ["is it a scam", "smart contract", "DeFi trust", "transparency"],
  },
  "hindi-new": {
    label: "India",
    altPrefix: "TurboLoop India",
    description: "Hindi-language banners for the Indian market.",
    keywords: ["TurboLoop India", "DeFi India", "passive income Hindi"],
  },
  "nigerian": {
    label: "Nigeria",
    altPrefix: "TurboLoop Nigeria",
    description: "Nigerian-market banners in local cultural context.",
    keywords: ["TurboLoop Nigeria", "DeFi Nigeria", "Naija passive income"],
  },
  "success-story": {
    label: "Success Stories",
    altPrefix: "TurboLoop member success",
    description: "Real member withdrawal proofs, rank achievements, and testimonials.",
    keywords: ["success story", "withdrawal proof", "DeFi earnings"],
  },
  "education-defi": {
    label: "DeFi Education",
    altPrefix: "DeFi education",
    description: "What is DeFi, smart contracts, blockchain, and yield farming explained.",
    keywords: ["what is DeFi", "smart contract", "blockchain education", "yield farming"],
  },
  "urgency": {
    label: "Start Today",
    altPrefix: "Start earning with TurboLoop",
    description: "FOMO and urgency banners — every day without TurboLoop is a missed opportunity.",
    keywords: ["start today", "passive income now", "DeFi FOMO"],
  },
  "buyback": {
    label: "Buyback & Burn",
    altPrefix: "$TURBO daily buyback & burn",
    description: "Daily $TURBO buyback and burn proof — deflationary mechanics.",
    keywords: ["buyback burn", "TURBO deflation", "token burn"],
  },
  "comparison": {
    label: "vs Traditional Finance",
    altPrefix: "TurboLoop vs traditional finance",
    description: "TurboLoop vs banks, stocks, crypto, forex, and savings accounts.",
    keywords: ["DeFi vs banks", "TurboLoop vs crypto", "better than savings"],
  },
  "community": {
    label: "Global Community",
    altPrefix: "TurboLoop global community",
    description: "TurboLoop's worldwide community, Telegram family, and global reach.",
    keywords: ["TurboLoop community", "global DeFi", "Telegram group"],
  },
};

function cleanName(filename) {
  // "01_Lifestyle_Morning_Coffee_Earnings.png" → "Morning Coffee Earnings"
  return filename
    .replace(/\.png$/i, "")
    .replace(/^\d+_[A-Za-z]+_/, "") // strip leading "01_Category_"
    .replace(/_/g, " ");
}

function toTitleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

const manifest = [];
const fileIndex = {};

for (const [catId, meta] of Object.entries(CATEGORY_META)) {
  const catDir = path.join(CREATIVES_DIR, catId);
  if (!fs.existsSync(catDir)) {
    console.warn(`⚠️  Directory not found: ${catDir}`);
    fileIndex[catId] = [];
    continue;
  }

  const files = fs
    .readdirSync(catDir)
    .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort();

  fileIndex[catId] = files;

  for (const file of files) {
    const clean = cleanName(file);
    const alt = `${meta.altPrefix} — ${clean}`;
    const title = toTitleCase(`${meta.altPrefix} — ${clean}`);
    manifest.push({
      category: catId,
      filename: file,
      url: `${R2_BASE}/campaigns/${catId}/${file}`,
      alt,
      title,
      description: meta.description,
      keywords: meta.keywords,
    });
  }

  console.log(`✅ ${catId}: ${files.length} files`);
}

// Write manifest JSON
const manifestPath = path.resolve(ROOT, "next-app/public/campaigns-manifest.json");
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`\n📄 Manifest written: ${manifestPath} (${manifest.length} records)`);

// Write TypeScript file index for cron
const tsLines = [
  `// AUTO-GENERATED by scripts/generate-campaigns-manifest.mjs — do not edit manually`,
  `// Re-run: node scripts/generate-campaigns-manifest.mjs`,
  ``,
  `export const CAMPAIGN_FILE_INDEX: Record<string, string[]> = {`,
];
for (const [catId, files] of Object.entries(fileIndex)) {
  tsLines.push(`  "${catId}": [`);
  for (const f of files) {
    tsLines.push(`    ${JSON.stringify(f)},`);
  }
  tsLines.push(`  ],`);
}
tsLines.push(`};`);
tsLines.push(``);
tsLines.push(`export function campaignBannerUrl(category: string, dayIndex: number): string {`);
tsLines.push(`  const R2 = process.env.R2_PUBLIC_URL ?? "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";`);
tsLines.push(`  const files = CAMPAIGN_FILE_INDEX[category] ?? [];`);
tsLines.push(`  if (!files.length) return "";`);
tsLines.push(`  const file = files[dayIndex % files.length];`);
tsLines.push(`  return \`\${R2}/campaigns/\${category}/\${file}\`;`);
tsLines.push(`}`);
tsLines.push(``);

const tsPath = path.resolve(ROOT, "server/_vercel/_campaignFileIndex.ts");
fs.writeFileSync(tsPath, tsLines.join("\n"));
console.log(`📄 TS index written: ${tsPath}`);

console.log(`\n🎉 Done — ${manifest.length} images across ${Object.keys(CATEGORY_META).length} categories.`);
