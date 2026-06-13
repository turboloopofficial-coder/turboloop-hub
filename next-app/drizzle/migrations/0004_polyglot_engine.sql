-- Phase A/B/C — multilingual blog infrastructure.
--
-- Adds 7 columns to blog_posts:
--   • translation_of   → FK self-ref pointing at the EN parent row.
--                        Lets the renderer compute hreflang alternates
--                        from data, not from slug-suffix string matching.
--   • tags             → text[] for topic taxonomy (security, math, etc.)
--                        Cheap Postgres array; no join table until volume
--                        forces one.
--   • author_name      → bylines for long-form flagships. Falls back to
--                        "Turbo Loop Editorial" on display when null.
--   • author_url       → e.g. /community/contributors/<handle>. Null OK.
--   • seo_title        → override the display title in <title> when the
--                        editorial title is too long (>60 chars).
--   • seo_description  → override the excerpt in meta description.
--   • reading_time_min → cached estimate (content words / 230 wpm).
--
-- All seven are NULLABLE — existing rows continue to work unchanged.
-- The backfills at the bottom set reading_time_min for every row and
-- wire up translation_of for the 6 existing translation pairs (4 DE +
-- 2 ID) by matching slug suffix to parent.

ALTER TABLE "blog_posts" ADD COLUMN "translation_of" integer;
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "tags" text[];
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "author_name" varchar(200);
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "author_url" varchar(500);
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "seo_title" varchar(200);
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "seo_description" varchar(300);
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "reading_time_min" smallint;
--> statement-breakpoint

-- Self-referencing FK with ON DELETE SET NULL so if a parent is deleted
-- the translations don't cascade-delete (they become orphaned originals).
ALTER TABLE "blog_posts"
  ADD CONSTRAINT "blog_posts_translation_of_fk"
  FOREIGN KEY ("translation_of") REFERENCES "blog_posts"("id")
  ON DELETE SET NULL;
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "blog_posts_translation_of_idx"
  ON "blog_posts" ("translation_of");
--> statement-breakpoint

-- Backfill 1: translation_of from slug-suffix convention.
-- Matches every non-EN row whose slug equals "<parent.slug>-<lang>".
-- Safe to re-run — only updates rows where translation_of IS NULL.
UPDATE "blog_posts" AS t
SET "translation_of" = p.id
FROM "blog_posts" AS p
WHERE t."translation_of" IS NULL
  AND t.language IN ('de','hi','id','es','fr','pt','ru','ar','tr')
  AND p.language = 'en'
  AND t.slug = p.slug || '-' || t.language;
--> statement-breakpoint

-- Backfill 2: reading_time_min from content word count.
-- 230 wpm is the median English reading speed (Brysbaert 2019).
-- GREATEST(1, ...) so a 50-word stub still shows "1 min read" instead
-- of "0 min". CEIL so we round up, never under-promise.
UPDATE "blog_posts"
SET "reading_time_min" = GREATEST(1, CEIL(
  ARRAY_LENGTH(
    STRING_TO_ARRAY(
      REGEXP_REPLACE("content", '\s+', ' ', 'g'),
      ' '
    ),
    1
  )::numeric / 230
))
WHERE "reading_time_min" IS NULL;
