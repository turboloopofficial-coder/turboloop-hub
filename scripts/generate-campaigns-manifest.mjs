// generate-campaigns-manifest.mjs
//
// Lists every object under campaigns/{category}/ in R2 and emits:
//
//   1. next-app/public/campaigns-manifest.json — full SEO manifest used
//      by the public /creatives page + the per-category sub-pages.
//   2. server/_vercel/_campaignFileIndex.ts — the lightweight
//      CAMPAIGN_FILE_INDEX map the cron-master uses to construct R2
//      URLs without re-listing the bucket at runtime.
//
// Run after every R2 upload run:
//   node scripts/generate-campaigns-manifest.mjs

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

const {
  R2_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

if (
  !R2_ENDPOINT ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME ||
  !R2_PUBLIC_URL
) {
  console.error("Missing R2 env vars in .env");
  process.exit(1);
}

// Category descriptors — id, label, alt-text template, SEO description,
// keywords. Kept in lockstep with CREATIVE_CATEGORIES in
// next-app/lib/creativesData.ts. Change one → update the other.
const CATEGORIES = [
  {
    id: "lifestyle",
    label: "Lifestyle & Aspiration",
    altTemplate: "TurboLoop passive income lifestyle — %s",
    description:
      "Passive income lifestyle banners — beach, freedom, luxury, family.",
    keywords: ["passive income", "financial freedom", "lifestyle", "DeFi"],
  },
  {
    id: "token",
    label: "$TURBO Token",
    altTemplate: "$TURBO token — %s",
    description: "Token launch, tokenomics, supply, and $TURBO price banners.",
    keywords: ["TURBO token", "tokenomics", "DeFi token", "BSC"],
  },
  {
    id: "referral",
    label: "Referral & Network",
    altTemplate: "TurboLoop 20-level referral system — %s",
    description:
      "20-level referral system, commission tables, rank progression banners.",
    keywords: ["referral", "network income", "20 levels", "affiliate"],
  },
  {
    id: "objection-handler",
    label: "Trust & Transparency",
    altTemplate: "TurboLoop trust & transparency — %s",
    description:
      "FUD-busting, smart contract proof, and objection-handling banners.",
    keywords: ["is it a scam", "smart contract", "DeFi trust", "transparency"],
  },
  {
    id: "hindi-new",
    label: "India 🇮🇳",
    altTemplate: "TurboLoop India — %s",
    description: "Hindi-language banners for the Indian market.",
    keywords: ["TurboLoop India", "DeFi India", "passive income Hindi"],
  },
  {
    id: "nigerian",
    label: "Nigeria 🇳🇬",
    altTemplate: "TurboLoop Nigeria — %s",
    description: "Nigerian-market banners in local cultural context.",
    keywords: ["TurboLoop Nigeria", "DeFi Nigeria", "Naija passive income"],
  },
  {
    id: "success-story",
    label: "Success Stories",
    altTemplate: "TurboLoop member success — %s",
    description:
      "Real member withdrawal proofs, rank achievements, and testimonials.",
    keywords: ["success story", "withdrawal proof", "DeFi earnings"],
  },
  {
    id: "education-defi",
    label: "DeFi Education",
    altTemplate: "DeFi education — %s",
    description:
      "What is DeFi, smart contracts, blockchain, and yield farming explained.",
    keywords: [
      "what is DeFi",
      "smart contract",
      "blockchain education",
      "yield farming",
    ],
  },
  {
    id: "urgency",
    label: "Start Today",
    altTemplate: "Start earning with TurboLoop — %s",
    description:
      "FOMO and urgency banners — every day without TurboLoop is a missed opportunity.",
    keywords: ["start today", "passive income now", "DeFi FOMO"],
  },
  {
    id: "buyback",
    label: "Buyback & Burn",
    altTemplate: "$TURBO daily buyback & burn — %s",
    description:
      "Daily $TURBO buyback and burn proof — deflationary mechanics.",
    keywords: ["buyback burn", "TURBO deflation", "token burn"],
  },
  {
    id: "comparison",
    label: "vs Traditional Finance",
    altTemplate: "TurboLoop vs traditional finance — %s",
    description:
      "TurboLoop vs banks, stocks, crypto, forex, and savings accounts.",
    keywords: ["DeFi vs banks", "TurboLoop vs crypto", "better than savings"],
  },
  {
    id: "community",
    label: "Global Community",
    altTemplate: "TurboLoop global community — %s",
    description: "TurboLoop's worldwide community, Telegram family, and global reach.",
    keywords: ["TurboLoop community", "global DeFi", "Telegram group"],
  },
];

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function listCategory(category) {
  const prefix = `campaigns/${category}/`;
  let token;
  const keys = [];
  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: token,
      })
    );
    for (const obj of res.Contents ?? []) {
      if (!obj.Key) continue;
      keys.push(obj.Key.slice(prefix.length));
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  // Stable sort by leading number prefix when present, else
  // lexicographic. Keeps `01_..., 02_...` in numeric order.
  keys.sort((a, b) => {
    const ai = parseInt(a, 10);
    const bi = parseInt(b, 10);
    if (Number.isFinite(ai) && Number.isFinite(bi) && ai !== bi) {
      return ai - bi;
    }
    return a.localeCompare(b);
  });
  return keys;
}

function cleanName(filename) {
  // 01_Lifestyle_Morning_Coffee_Earnings.png →
  //   "Morning Coffee Earnings"
  // 01_Token_Launch_Story.png → "Launch Story"
  const noExt = filename.replace(/\.[a-z]+$/i, "");
  const noNum = noExt.replace(/^\d+[_\s-]*/, "");
  // Drop the category-prefix word (Lifestyle, Token, etc.) when it
  // matches a category-id-ish prefix.
  const tokens = noNum.split(/[_\s-]+/).filter(Boolean);
  return tokens
    .map((t, i) =>
      // Title-case each word; preserve $TURBO and dollar-prefixed words
      t.startsWith("$") ? t : t[0]?.toUpperCase() + t.slice(1).toLowerCase()
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(s) {
  return s
    .split(" ")
    .map(w =>
      w.startsWith("$") ? w : w[0]?.toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
}

async function main() {
  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl: `${R2_PUBLIC_URL}/campaigns`,
    categories: [],
  };

  const fileIndex = {}; // { [categoryId]: string[] }

  let total = 0;
  for (const cat of CATEGORIES) {
    const files = await listCategory(cat.id);
    fileIndex[cat.id] = files;
    total += files.length;

    const images = files.map(filename => {
      const clean = cleanName(filename);
      const alt = cat.altTemplate.replace("%s", clean);
      return {
        filename,
        url: `${R2_PUBLIC_URL}/campaigns/${cat.id}/${filename}`,
        alt,
        title: titleCase(alt),
        description: cat.description,
        keywords: cat.keywords,
        category: cat.id,
      };
    });

    manifest.categories.push({
      id: cat.id,
      label: cat.label,
      description: cat.description,
      keywords: cat.keywords,
      count: images.length,
      images,
    });

    console.log(`  ${cat.id.padEnd(20)} ${images.length} files`);
  }

  // Write manifest JSON
  const manifestPath = path.join(
    REPO_ROOT,
    "next-app",
    "public",
    "campaigns-manifest.json"
  );
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✅ Wrote ${manifestPath} (${total} images)`);

  // Write CAMPAIGN_FILE_INDEX TS source. Imported by both
  // cron-master.ts and _messagePools.ts via `_campaignFileIndex.ts`.
  const tsLines = [
    "// AUTO-GENERATED by scripts/generate-campaigns-manifest.mjs — do not edit by hand.",
    "// Source of truth: R2 bucket campaigns/<category>/ listing.",
    "//",
    "// Each entry is an ORDERED list of filenames for the category. Cron tasks",
    "// index this with `daysSinceLaunch % count` for deterministic rotation.",
    "",
    "export const CAMPAIGN_FILE_INDEX: Record<string, string[]> = {",
  ];
  for (const cat of CATEGORIES) {
    tsLines.push(`  "${cat.id}": [`);
    for (const f of fileIndex[cat.id]) {
      tsLines.push(`    ${JSON.stringify(f)},`);
    }
    tsLines.push(`  ],`);
  }
  tsLines.push("};");
  tsLines.push("");

  const tsPath = path.join(
    REPO_ROOT,
    "server",
    "_vercel",
    "_campaignFileIndex.ts"
  );
  fs.writeFileSync(tsPath, tsLines.join("\n"));
  console.log(`✅ Wrote ${tsPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
