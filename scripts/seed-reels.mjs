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
const manifestPath = path.join(projectRoot, "scripts/reels-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

async function main() {
  console.log("🎬 Seeding reels into database...");

  // Delete any existing reels (videos with directUrl set)
  await db.execute(sql`DELETE FROM videos WHERE direct_url IS NOT NULL`);

  for (let i = 0; i < manifest.reels.length; i++) {
    const r = manifest.reels[i];
    await db.execute(sql`
      INSERT INTO videos (title, direct_url, category, language, language_flag, sort_order, published)
      VALUES (${r.title}, ${r.url}, 'presentation', 'English', '🇬🇧', ${100 + i}, true)
    `);
    console.log(`  ✓ ${r.title}`);
  }

  console.log(`\n✅ ${manifest.reels.length} reels seeded`);
}

main().catch(err => { console.error("❌", err); process.exit(1); });
