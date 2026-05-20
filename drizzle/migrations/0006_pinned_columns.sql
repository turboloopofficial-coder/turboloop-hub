-- Add pinned_at + pinned_new_until to videos table.
--
-- pinned_at — when set + in future, forces this row to sort above natural
-- created_at order. Used to feature specific films/reels at the top of
-- listings regardless of their actual upload date.
--
-- pinned_new_until — when set + > now(), forces the "NEW" badge to show
-- regardless of how old the row's created_at is. Lets editorial team
-- extend the NEW status of a specific piece beyond the default 30-day
-- auto-decay window.
--
-- Both nullable. Existing rows keep their natural sort + auto NEW-badge
-- behavior. No created_at backfill needed (column is NOT NULL DEFAULT
-- now() from original schema; all rows already have valid timestamps).

ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "pinned_at" timestamp;
--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "pinned_new_until" timestamp;
--> statement-breakpoint

-- Composite expression index for the primary sort key. The query plan
-- for `ORDER BY COALESCE(pinned_at, created_at) DESC, id DESC` walks
-- this index directly instead of a sort step on every request.
CREATE INDEX IF NOT EXISTS "videos_sort_idx"
  ON "videos" ((COALESCE("pinned_at", "created_at")) DESC, "id" DESC);
