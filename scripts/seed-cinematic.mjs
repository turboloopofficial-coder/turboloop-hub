// Seeds the 20 cinematic universe films into the videos table.
// Reads scripts/cinematic-manifest.uploaded.json (must run upload + thumb scripts first).
//
// Idempotent: deletes existing rows where category='cinematic' before re-inserting,
// so re-running this picks up manifest edits cleanly. Does NOT touch reels or
// other video categories.

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) { console.error("DATABASE_URL missing"); process.exit(1); }

const db = drizzle(neon(DATABASE_URL));
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(projectRoot, "scripts/cinematic-manifest.uploaded.json");

if (!fs.existsSync(manifestPath)) {
  console.error("❌ scripts/cinematic-manifest.uploaded.json not found.");
  console.error("   Run `node scripts/upload-cinematic.mjs` and `node scripts/gen-cinematic-thumbs.mjs` first.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
const films = manifest.films;

async function main() {
  console.log(`🎬 Seeding ${films.length} cinematic films into videos table...\n`);

  // Wipe existing cinematic rows (does NOT touch reels / tutorials)
  const wipeRes = await db.execute(sql`DELETE FROM videos WHERE category = 'cinematic'`);
  console.log(`  🧹 Cleared previous cinematic rows`);

  let inserted = 0;
  for (const f of films) {
    if (!f.url) {
      console.log(`  ⚠ Skip (no R2 URL yet): ${f.title}`);
      continue;
    }
    // sort_order: season*10 + episode → 11..45 (S1E1 first, S4E5 last)
    const sortOrder = f.season * 10 + f.episode;
    await db.execute(sql`
      INSERT INTO videos (
        title, slug, description, headline, tagline,
        season, episode, poster_url, direct_url,
        category, language, language_flag,
        sort_order, published
      )
      VALUES (
        ${f.title}, ${f.slug}, ${f.description}, ${f.headline}, ${f.tagline},
        ${f.season}, ${f.episode}, ${f.posterUrl || null}, ${f.url},
        'cinematic', 'English', '🇬🇧',
        ${sortOrder}, true
      )
    `);
    console.log(`  ✓ S${f.season}E${f.episode} — ${f.title}`);
    inserted++;
  }

  console.log(`\n✅ ${inserted}/${films.length} cinematic films seeded`);
}

main().catch(err => { console.error("❌", err); process.exit(1); });
