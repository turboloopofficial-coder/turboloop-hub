// YouTube Shorts uploader — pushes existing reels + cinematic films to YouTube
// for free distribution + Google Video search indexing.
//
// SCOPE (intentionally simple):
//   - Reads scripts/reels-manifest.json + scripts/cinematic-manifest.uploaded.json
//   - For each video, prints the metadata (title, description, hashtags, file path)
//   - You upload manually via YouTube Studio (5 min per batch, browser-based, no API key needed)
//
// WHY NOT FULL AUTO?
//   YouTube Data API requires OAuth flow + manual app verification (Google review,
//   takes weeks for new apps). For a one-time / occasional upload run, manual is faster.
//   When we hit ~50+ videos / continuous publishing, revisit the API path.
//
// Usage:
//   node scripts/upload-to-youtube.mjs [--type=reels|films|all]
//   node scripts/upload-to-youtube.mjs --copy-clipboard  (also pipes to clipboard for paste)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const typeArg = (argv.find((a) => a.startsWith("--type=")) || "--type=all").split("=")[1];
const SHOULD_COPY = argv.includes("--copy-clipboard");

const reelsManifest = JSON.parse(fs.readFileSync(path.join(projectRoot, "scripts/reels-manifest.json"), "utf-8"));
const cinematicManifest = fs.existsSync(path.join(projectRoot, "scripts/cinematic-manifest.uploaded.json"))
  ? JSON.parse(fs.readFileSync(path.join(projectRoot, "scripts/cinematic-manifest.uploaded.json"), "utf-8"))
  : { films: [] };

const TAGS_BASE = ["TurboLoop", "DeFi", "BSC", "BinanceSmartChain", "YieldFarming", "Crypto", "PassiveIncome"];

// Build YouTube-ready metadata for one video
function buildMeta(item, kind) {
  const title = `${item.title} | TurboLoop ${kind === "film" ? "Cinematic Universe" : "Short Reel"}`.slice(0, 100);

  let description = "";
  if (kind === "film") {
    description = [
      `${item.headline || ""}`,
      "",
      item.description || item.title,
      "",
      `🎬 Watch all 20 films: https://turboloop.tech/films`,
      `🌐 Hub: https://turboloop.tech`,
      `🎥 This film: https://turboloop.tech/films/${item.slug}`,
      "",
      "TurboLoop is the complete DeFi ecosystem on Binance Smart Chain — sustainable yield farming, decentralized swaps, and fiat onramp, all on one audited, renounced smart contract.",
      "",
      `#TurboLoop #DeFi #BSC #YieldFarming #Crypto #PassiveIncome #Web3`,
    ].join("\n");
  } else {
    description = [
      item.description || item.title,
      "",
      `🌐 Full hub: https://turboloop.tech`,
      `🎬 More videos: https://turboloop.tech/library`,
      `📖 Read the deep-dives: https://turboloop.tech/feed`,
      "",
      "TurboLoop is the complete DeFi ecosystem on Binance Smart Chain.",
      "",
      `#TurboLoop #DeFi #BSC #YieldFarming #Crypto #Shorts`,
    ].join("\n");
  }

  return { title, description };
}

console.log("📺 YouTube upload manifest\n");
console.log("INSTRUCTIONS:");
console.log("  1. Open https://studio.youtube.com → Create → Upload videos");
console.log("  2. Select the .mp4 file from C:\\Users\\DEV NARSI\\Downloads\\");
console.log("  3. Paste the title + description from below");
console.log("  4. Set visibility = Public, category = Science & Tech");
console.log("  5. For reels (vertical 9:16): YouTube auto-detects + adds #Shorts tag");
console.log("  6. Repeat for next video");
console.log("\n──────────────────────────────────────────────────────────────\n");

const downloads = "C:/Users/DEV NARSI/Downloads";

let count = 0;

if (typeArg === "reels" || typeArg === "all") {
  console.log("=== SHORT REELS (vertical 9:16, become YouTube Shorts) ===\n");
  for (const reel of reelsManifest.reels) {
    const meta = buildMeta(reel, "reel");
    const filePath = path.join(downloads, reel.file);
    const exists = fs.existsSync(filePath);
    console.log(`[${++count}] ${reel.slug} ${exists ? "✓ file present" : "⚠ MISSING file"}`);
    console.log(`     File: ${filePath}`);
    console.log(`     Title: ${meta.title}`);
    console.log(`     ──`);
    console.log(meta.description.split("\n").map((l) => `     ${l}`).join("\n"));
    console.log("");
  }
}

if (typeArg === "films" || typeArg === "all") {
  console.log("=== CINEMATIC FILMS (16:9 landscape, become regular YouTube videos) ===\n");
  for (const film of cinematicManifest.films) {
    const meta = buildMeta(film, "film");
    const filePath = path.join(downloads, film.file);
    const exists = fs.existsSync(filePath);
    console.log(`[${++count}] ${film.slug} ${exists ? "✓ file present" : "⚠ MISSING file"}`);
    console.log(`     File: ${filePath}`);
    console.log(`     Title: ${meta.title}`);
    console.log(`     ──`);
    console.log(meta.description.split("\n").map((l) => `     ${l}`).join("\n"));
    console.log("");
  }
}

console.log(`\n✅ ${count} videos ready to upload to YouTube.`);
console.log(`   Pro tip: upload one per day, not all at once. YouTube algorithm rewards consistency.`);
console.log(`   Add to YouTube Playlists: "TurboLoop Cinematic Universe" + "TurboLoop Short Reels"`);

if (SHOULD_COPY) {
  console.log(`\n   --copy-clipboard not implemented in this build (would need clipboardy dep)`);
  console.log(`   For now, copy/paste from terminal manually.`);
}
