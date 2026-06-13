-- Omni-Composer (Automation V2): custom cross-channel scheduled posts.
-- Sits alongside the hardcoded cron-master slots; the master cron polls
-- this table every 5 minutes for `status='pending' AND next_run_at <= NOW()`
-- rows and fans them out to the channels listed in the jsonb column.
--
-- Apply with: node scripts/apply-migration.mjs 0008
-- Or via Neon SQL console directly.

CREATE TYPE "public"."scheduled_post_media_type"   AS ENUM('none', 'image', 'video');
CREATE TYPE "public"."scheduled_post_schedule_type" AS ENUM('once', 'recurring');
CREATE TYPE "public"."scheduled_post_status"        AS ENUM('pending', 'running', 'completed', 'paused', 'failed');

CREATE TABLE "scheduled_posts" (
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

-- The master cron's "due now" query — keep this index in place to make
-- the every-5-min poll a cheap range-scan.
CREATE INDEX "idx_scheduled_posts_due"
  ON "scheduled_posts" ("status", "next_run_at");
