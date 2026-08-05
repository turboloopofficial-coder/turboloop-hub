-- Migration 0010: Ranked Leaders / Hall of Fame
--
-- Creates the ranked_leaders table to store TurboLoop community leaders
-- who have achieved a rank milestone. Displayed publicly on /leaders.
-- Managed via the admin panel with photo upload to R2.

CREATE TABLE IF NOT EXISTS "ranked_leaders" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(200) NOT NULL,
  "rank" varchar(100) NOT NULL,
  "photo_url" varchar(1024),
  "team_size" varchar(50),
  "team_volume" varchar(100),
  "country" varchar(100),
  "achieved_at" varchar(50),
  "sort_order" integer DEFAULT 0 NOT NULL,
  "published" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Index for fast public listing (published only, ordered by rank then sort_order)
CREATE INDEX IF NOT EXISTS idx_ranked_leaders_published_rank
  ON ranked_leaders (published, rank, sort_order);
