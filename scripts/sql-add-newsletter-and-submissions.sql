-- =====================================================================
-- Newsletter signups + Community content submissions — schema migration
-- =====================================================================
-- Strictly additive — no data loss. Idempotent (safe to re-run).
--
-- HOW TO APPLY:
--   1. Open Neon console → Turboloop-hub project → SQL Editor
--   2. Paste this entire file → Run
--   3. Verify with the queries at the bottom
-- =====================================================================

-- 1. Newsletter signups table
CREATE TABLE IF NOT EXISTS "newsletter_signups" (
  "id"         SERIAL PRIMARY KEY,
  "email"      VARCHAR(320) NOT NULL UNIQUE,
  "source"     VARCHAR(100),
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 2. Content submission status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_submission_status') THEN
    CREATE TYPE "public"."content_submission_status" AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

-- 3. Content submissions table
CREATE TABLE IF NOT EXISTS "content_submissions" (
  "id"             SERIAL PRIMARY KEY,
  "type"           VARCHAR(50)  NOT NULL,
  "author_name"    VARCHAR(200) NOT NULL,
  "author_contact" VARCHAR(320),
  "author_country" VARCHAR(100),
  "body"           TEXT         NOT NULL,
  "file_url"       VARCHAR(1000),
  "status"         "public"."content_submission_status" DEFAULT 'pending' NOT NULL,
  "admin_notes"    TEXT,
  "created_at"     TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Verification (run after migration to confirm)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'newsletter_signups';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'content_submissions';
