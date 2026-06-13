CREATE TYPE "public"."vacancy_status" AS ENUM('open', 'closed', 'draft');--> statement-breakpoint
CREATE TABLE "chat_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(64) NOT NULL,
	"ip_hash" varchar(64),
	"country" varchar(2),
	"chat_kb_version" varchar(64),
	"turn_count" integer DEFAULT 0 NOT NULL,
	"tokens_in" integer DEFAULT 0 NOT NULL,
	"tokens_out" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chat_conversations_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" varchar(16) NOT NULL,
	"content" text NOT NULL,
	"refused" boolean DEFAULT false NOT NULL,
	"thumbs_up" boolean,
	"tokens_in" integer,
	"tokens_out" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_vacancies" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(200) NOT NULL,
	"flag" varchar(8),
	"location" varchar(200) NOT NULL,
	"stipend" varchar(100) NOT NULL,
	"bullets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "vacancy_status" DEFAULT 'draft' NOT NULL,
	"tg_support_link" varchar(300),
	"closing_at" timestamp,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "job_vacancies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "newsletter_signups" ADD COLUMN "consent_method" varchar(50);--> statement-breakpoint
ALTER TABLE "newsletter_signups" ADD COLUMN "consent_text" text;--> statement-breakpoint
ALTER TABLE "newsletter_signups" ADD COLUMN "consent_source_url" text;--> statement-breakpoint
ALTER TABLE "newsletter_signups" ADD COLUMN "ip_country" varchar(2);--> statement-breakpoint
ALTER TABLE "newsletter_signups" ADD COLUMN "unsubscribed_at" timestamp;--> statement-breakpoint
ALTER TABLE "newsletter_signups" ADD COLUMN "unsubscribe_reason" varchar(200);--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE cascade ON UPDATE no action;