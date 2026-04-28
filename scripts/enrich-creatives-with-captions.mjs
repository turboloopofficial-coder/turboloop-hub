// Map each banner image to its corresponding writeup section ("Visual N")
// from the source .md files in TURBOLOOP_SOVEREIGN_WEALTH_FRAMEWORK.
// Updates client/src/lib/creatives-manifest.json with `headline`, `caption`,
// `fact`, `hashtags`, and `visualNumber` per banner.

import fs from "node:fs";
import path from "node:path";

const SRC = "C:/Users/DEV NARSI/Downloads/TURBOLOOP_SOVEREIGN_WEALTH_FRAMEWORK";
const MANIFEST_PATH = "C:/Users/DEV NARSI/Downloads/turboloop-hub handoff/client/src/lib/creatives-manifest.json";

// Map: writeup .md file → category prefix used in original PNG filenames
const WRITEUP_MAP = {
  "pillar1_math_of_sustainability_writeup.md": "pillar1_math_of_sustainability",
  "pillar2_psychology_of_ownership_writeup.md": "pillar2_psychology_of_ownership",
  "pillar3_20_level_multiplier_writeup.md": "pillar3_20_level_multiplier",
  "pillar4_risk_management_writeup.md": "pillar4_risk_management",
  "pillar5_velocity_of_compounding_writeup.md": "pillar5_velocity_of_compounding",
  "pillar6_decentralized_trust_writeup.md": "pillar6_decentralized_trust",
  "pillar7_global_arbitrage_writeup.md": "pillar7_global_arbitrage",
  "pillar8_legacy_inheritance_writeup.md": "pillar8_legacy_inheritance",
  "pillar9_anti_inflation_shield_writeup.md": "pillar9_anti_inflation_shield",
  "pillar10_leadership_ethics_writeup.md": "pillar10_leadership_ethics",
  "myth_buster_writeup.md": "myth_buster",
  "product_bible_writeup.md": "product_bible",
  "quick_start_writeup.md": "quick_start",
};

/** Parse a writeup .md and return an array of {visualNumber, headline, body, fact, hashtags} */
function parseWriteup(text) {
  // Each visual section is delimited by `---` and starts with `### **... (Visual N)**`
  const sections = text.split(/^---\s*$/m).map(s => s.trim()).filter(s => s.length > 50);
  const out = [];

  for (const section of sections) {
    // Extract Visual number from heading
    const visMatch = section.match(/Visual\s+(\d+)/i);
    if (!visMatch) continue;
    const visualNumber = parseInt(visMatch[1], 10);

    const lines = section.split("\n");

    // Find the headline — first **bold** line after the meta heading
    // Skip the "### **... (Visual N)**" heading and "**WhatsApp/Telegram Version:**" line
    let headline = null;
    let bodyLines = [];
    let fact = null;
    let hashtags = [];
    let inBody = false;

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) {
        if (inBody) bodyLines.push("");
        continue;
      }
      if (line.startsWith("###")) continue;
      if (/^\*\*WhatsApp\/Telegram/i.test(line)) continue;

      // Hashtags line
      if (/^#\w/.test(line) && line.split(" ").every(w => w.startsWith("#"))) {
        hashtags = line.split(/\s+/).filter(Boolean);
        continue;
      }

      // First bold line is the headline
      if (!headline && line.startsWith("**") && line.endsWith("**") && line.length > 4) {
        headline = line.replace(/^\*+|\*+$/g, "").replace(/^[^\w]+/, "").trim();
        inBody = true;
        continue;
      }

      // Fact line
      if (line.startsWith("**The Fact:**")) {
        fact = line.replace(/^\*\*The Fact:\*\*\s*/, "").trim();
        continue;
      }

      // Skip the call-to-share line
      if (line.startsWith("**💡") || line.includes("Share this with") || line.includes("Explain to a friend")) {
        continue;
      }

      if (inBody) bodyLines.push(line);
    }

    const body = bodyLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
    out.push({ visualNumber, headline, body, fact, hashtags });
  }

  return out;
}

/** Find the matching writeup section for a banner filename */
function findCaptionForBanner(originalFilename, writeupsByCategory) {
  for (const [prefix, sections] of Object.entries(writeupsByCategory)) {
    if (!originalFilename.startsWith(prefix)) continue;
    const rest = originalFilename.slice(prefix.length);
    // Filenames like "_visual.png", "_visual2.png", "_visual10.png"
    const m = rest.match(/_visual(\d*)\.png$/i);
    if (!m) continue;
    const visualNum = m[1] === "" ? 1 : parseInt(m[1], 10);
    const found = sections.find(s => s.visualNumber === visualNum);
    return found || null;
  }
  return null;
}

function main() {
  // Parse all writeups
  const writeups = {};
  for (const [file, prefix] of Object.entries(WRITEUP_MAP)) {
    const filepath = path.join(SRC, file);
    if (!fs.existsSync(filepath)) {
      console.log(`  ⚠ Missing writeup: ${file}`);
      continue;
    }
    const text = fs.readFileSync(filepath, "utf8");
    const sections = parseWriteup(text);
    writeups[prefix] = sections;
    console.log(`  ${prefix}: parsed ${sections.length} visual sections`);
  }

  // Load manifest
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  console.log(`\nEnriching ${manifest.items.length} banner entries...\n`);

  let matched = 0;
  let missed = 0;

  for (const item of manifest.items) {
    const cap = findCaptionForBanner(item.original, writeups);
    if (!cap) {
      missed++;
      // Fallback: use category label as headline
      item.headline = item.categoryLabel;
      item.caption = "";
      item.fact = null;
      item.hashtags = ["#TurboLoop", "#DeFi", "#BSC"];
      item.visualNumber = null;
      continue;
    }
    item.headline = cap.headline || item.categoryLabel;
    item.caption = cap.body;
    item.fact = cap.fact;
    item.hashtags = cap.hashtags;
    item.visualNumber = cap.visualNumber;
    matched++;
  }

  // Write enriched manifest back
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  // Also update the scripts/ copy so it stays in sync
  const scriptsCopy = "C:/Users/DEV NARSI/Downloads/turboloop-hub handoff/scripts/creatives-manifest.json";
  fs.writeFileSync(scriptsCopy, JSON.stringify(manifest, null, 2));

  console.log(`\n✅ Enrichment done:`);
  console.log(`  matched: ${matched}`);
  console.log(`  missed: ${missed}`);
  console.log(`  → ${MANIFEST_PATH}`);

  // Sample one matched entry
  const sample = manifest.items.find(i => i.caption && i.caption.length > 50);
  if (sample) {
    console.log(`\nSample matched entry (${sample.original}):`);
    console.log(`  headline: ${sample.headline}`);
    console.log(`  caption: ${sample.caption.slice(0, 200)}...`);
    console.log(`  hashtags: ${(sample.hashtags || []).join(" ")}`);
  }
}

main();
