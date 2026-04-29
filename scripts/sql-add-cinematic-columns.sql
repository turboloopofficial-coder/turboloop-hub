-- =====================================================================
-- TurboLoop Cinematic Universe — schema migration (run via Neon console)
-- =====================================================================
-- Adds: 'cinematic' to video_category enum + 7 new columns on videos.
-- Strictly additive — no data loss. Idempotent (safe to re-run).
--
-- HOW TO APPLY:
--   1. Open Neon console (https://console.neon.tech)
--   2. Go to your turboloop-hub project → SQL Editor
--   3. Paste this entire file
--   4. Run
--   5. Verify with: SELECT column_name FROM information_schema.columns WHERE table_name='videos';
-- =====================================================================

-- 1. Extend the video_category enum (no-op if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'video_category' AND e.enumlabel = 'cinematic'
  ) THEN
    ALTER TYPE "public"."video_category" ADD VALUE 'cinematic' BEFORE 'other';
  END IF;
END $$;

-- 2. Add the 7 cinematic-related columns to videos (idempotent)
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "slug"        varchar(200);
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "headline"    varchar(500);
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "tagline"     varchar(500);
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "season"      integer;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "episode"     integer;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "poster_url"  varchar(1000);

-- 3. Unique constraint on slug (one slug per video). Skip if already exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'videos_slug_unique'
  ) THEN
    ALTER TABLE "videos" ADD CONSTRAINT "videos_slug_unique" UNIQUE ("slug");
  END IF;
END $$;

-- Verification query (run this after the migration to confirm)
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name='videos' ORDER BY ordinal_position;
