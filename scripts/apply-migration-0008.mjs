// Apply migration 0008 (Omni-Composer scheduled_posts table) to Neon.
// Run once with: node scripts/apply-migration-0008.mjs
//
// Idempotent — re-running is a no-op because every CREATE uses
// IF NOT EXISTS via the do-block guard at the bottom.

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const migrationPath = path.join(
  projectRoot,
  "drizzle",
  "migrations",
  "0008_omni_composer_scheduled_posts.sql"
);

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const db = drizzle(neon(DATABASE_URL));

async function run() {
  console.log("📂 Reading migration file (for reference)…");
  const fullSqlForReference = await fs.readFile(migrationPath, "utf8");
  console.log(`   (${fullSqlForReference.length} bytes)`);

  // Each statement runs through drizzle's `db.execute(sql\`…\`)`. The
  // neon-http driver requires a single statement per execute call, so we
  // run the three enums independently. The DO-block keeps each enum
  // CREATE idempotent (Postgres CREATE TYPE has no IF NOT EXISTS).

  console.log("🛡  Ensuring scheduled_post_media_type enum…");
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scheduled_post_media_type') THEN
        CREATE TYPE "public"."scheduled_post_media_type" AS ENUM('none', 'image', 'video');
      END IF;
    END $$;
  `);

  console.log("🛡  Ensuring scheduled_post_schedule_type enum…");
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scheduled_post_schedule_type') THEN
        CREATE TYPE "public"."scheduled_post_schedule_type" AS ENUM('once', 'recurring');
      END IF;
    END $$;
  `);

  console.log("🛡  Ensuring scheduled_post_status enum…");
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scheduled_post_status') THEN
        CREATE TYPE "public"."scheduled_post_status" AS ENUM('pending', 'running', 'completed', 'paused', 'failed');
      END IF;
    END $$;
  `);

  console.log("📦 Creating scheduled_posts table…");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "scheduled_posts" (
      "id"              serial PRIMARY KEY NOT NULL,
      "title"           varchar(500),
      "content"         text NOT NULL,
      "media_url"       varchar(1024),
      "media_type"      "scheduled_post_media_type" DEFAULT 'none' NOT NULL,
      "channels"        jsonb NOT NULL,
      "buttons"         jsonb DEFAULT '[]'::jsonb NOT NULL,
      "schedule_type"   "scheduled_post_schedule_type" NOT NULL,
      "cron_expression" varchar(200),
      "next_run_at"     timestamp NOT NULL,
      "status"          "scheduled_post_status" DEFAULT 'pending' NOT NULL,
      "last_error"      text,
      "fire_count"      integer DEFAULT 0 NOT NULL,
      "last_fired_at"   timestamp,
      "created_by"      varchar(320),
      "created_at"      timestamp DEFAULT now() NOT NULL,
      "updated_at"      timestamp DEFAULT now() NOT NULL
    );
  `);

  console.log("🔍 Creating idx_scheduled_posts_due…");
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "idx_scheduled_posts_due"
      ON "scheduled_posts" ("status", "next_run_at");
  `);

  console.log("🧪 Verifying…");
  const colsResult = await db.execute(sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'scheduled_posts'
    ORDER BY ordinal_position;
  `);
  const cols = colsResult.rows ?? colsResult;
  if (!cols || cols.length === 0) {
    throw new Error("scheduled_posts table not visible after migration");
  }
  console.log(`✅ scheduled_posts has ${cols.length} columns:`);
  for (const c of cols) {
    console.log(`   • ${c.column_name} (${c.data_type})`);
  }
}

run().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
