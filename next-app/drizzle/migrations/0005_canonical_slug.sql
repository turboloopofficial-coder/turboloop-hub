-- Add canonical_slug to videos for multilingual film grouping.
--
-- The original Cinematic Universe (20 EN-only films) uses slug as both
-- the URL identifier and the language-agnostic ID. For the Sovereign
-- Series S2 (20 films × 4 languages = 80 rows), each row's `slug` is
-- language-suffixed (e.g. v01-...-de) so the existing unique constraint
-- on slug doesn't break — and `canonical_slug` is the shared key
-- pointing all 4 language rows back to one identifier (v01-...).
--
-- The /films/<slug>?lang=xx route resolves a request by:
--   SELECT ... FROM videos WHERE canonical_slug = $1 AND language = $2
-- defaulting to 'English' when no ?lang= is set.
--
-- Backfill: for existing cinematic rows, canonical_slug = slug.

ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "canonical_slug" varchar(200);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "videos_canonical_lang_idx"
  ON "videos" ("canonical_slug", "language");
--> statement-breakpoint
UPDATE "videos"
SET "canonical_slug" = "slug"
WHERE category = 'cinematic'
  AND canonical_slug IS NULL
  AND slug IS NOT NULL;
