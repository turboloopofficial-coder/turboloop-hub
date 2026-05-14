ALTER TYPE "public"."content_submission_status" ADD VALUE 'payment_due' BEFORE 'rejected';--> statement-breakpoint
ALTER TYPE "public"."content_submission_status" ADD VALUE 'paid' BEFORE 'rejected';--> statement-breakpoint
CREATE TABLE "social_wall_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"youtube_id" varchar(20) NOT NULL,
	"title" varchar(500) NOT NULL,
	"channel_title" varchar(200),
	"thumbnail_url" varchar(500),
	"view_count" integer,
	"duration_sec" integer,
	"language" varchar(10),
	"approved" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	CONSTRAINT "social_wall_videos_youtube_id_unique" UNIQUE("youtube_id")
);
--> statement-breakpoint
ALTER TABLE "content_submissions" ADD COLUMN "wallet_address" varchar(100);--> statement-breakpoint
ALTER TABLE "content_submissions" ADD COLUMN "youtube_url" varchar(500);--> statement-breakpoint
ALTER TABLE "content_submissions" ADD COLUMN "view_count" integer;--> statement-breakpoint
ALTER TABLE "content_submissions" ADD COLUMN "view_count_checked_at" timestamp;--> statement-breakpoint
ALTER TABLE "content_submissions" ADD COLUMN "payout_amount_usd" integer;