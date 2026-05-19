import { pgTable, pgEnum, serial, integer, text, timestamp, varchar, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enums
export const videoCategoryEnum = pgEnum("video_category", ["presentation", "how-to-join", "withdraw-compound", "cinematic", "other"]);
export const eventStatusEnum = pgEnum("event_status", ["upcoming", "live", "completed", "recurring"]);
export const roadmapStatusEnum = pgEnum("roadmap_status", ["completed", "current", "upcoming"]);

// Admin credentials (email + bcrypt password)
export const adminCredentials = pgTable("admin_credentials", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 512 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Blog posts
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: varchar("cover_image", { length: 1000 }),
  // BCP-47-ish 2-letter language code. Defaults to 'en' so existing
  // rows keep working without a backfill — the migration sets the
  // column with a default so PostgreSQL fills nullable historical
  // rows in one shot. Translations follow a slug-suffix convention:
  // <slug>-de, <slug>-hi, <slug>-id, etc., letting us treat them as
  // independent rows that share an editorial parent.
  language: varchar("language", { length: 8 }).default("en").notNull(),
  // FK to the EN parent post when this row is a translation. NULL on
  // originals. Lets the renderer compute hreflang alternates from real
  // data instead of slug-suffix string matching. Backfilled by the 0004
  // migration for the legacy rows that pre-date this column.
  translationOf: integer("translation_of"),
  // Topic taxonomy. Postgres text[] — cheap, indexable via GIN if/when
  // we need a tag-filter index page.
  tags: text("tags").array(),
  // Bylines for long-form flagships. Falls back to "Turbo Loop Editorial"
  // on display when null. authorUrl can point at /community/<handle>
  // or an external profile.
  authorName: varchar("author_name", { length: 200 }),
  authorUrl: varchar("author_url", { length: 500 }),
  // SEO overrides — distinct from the editorial title/excerpt so we
  // can ship punchy editorial headlines + a different <title> tag
  // optimized for length (≤60 chars) and search intent.
  seoTitle: varchar("seo_title", { length: 200 }),
  seoDescription: varchar("seo_description", { length: 300 }),
  // Cached estimate (content words / 230 wpm). Computed on insert by
  // the seed/admin write path; backfilled for existing rows by the
  // 0004 migration. Display: "{readingTimeMin} min read".
  readingTimeMin: integer("reading_time_min"),
  published: boolean("published").default(false).notNull(),
  scheduledPublishAt: timestamp("scheduled_publish_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// Videos
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  // Cinematic Universe metadata — null for non-cinematic rows (existing reels/tutorials)
  slug: varchar("slug", { length: 200 }).unique(),
  description: text("description"),
  headline: varchar("headline", { length: 500 }),
  tagline: varchar("tagline", { length: 500 }),
  season: integer("season"),
  episode: integer("episode"),
  posterUrl: varchar("poster_url", { length: 1000 }),
  // End cinematic block
  youtubeUrl: varchar("youtube_url", { length: 500 }),
  directUrl: varchar("direct_url", { length: 1000 }),
  category: videoCategoryEnum("category").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  languageFlag: varchar("language_flag", { length: 10 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

// Events / Zoom meetings
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  dateTime: varchar("date_time", { length: 100 }).notNull(),
  timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
  frequency: varchar("frequency", { length: 100 }),
  meetingLink: varchar("meeting_link", { length: 1000 }).notNull(),
  passcode: varchar("passcode", { length: 50 }),
  hostName: varchar("host_name", { length: 200 }),
  language: varchar("language", { length: 50 }).default("English").notNull(),
  status: eventStatusEnum("status").default("upcoming").notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// Country leaderboard
export const countryLeaderboard = pgTable("country_leaderboard", {
  id: serial("id").primaryKey(),
  rank: integer("rank").notNull().unique(),
  country: varchar("country", { length: 100 }).notNull(),
  countryCode: varchar("country_code", { length: 5 }).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  score: integer("score").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type CountryLeaderboardEntry = typeof countryLeaderboard.$inferSelect;

// Promotions
export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  description: text("description").notNull(),
  details: jsonb("details"),
  active: boolean("active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Promotion = typeof promotions.$inferSelect;

// Roadmap phases
export const roadmapPhases = pgTable("roadmap_phases", {
  id: serial("id").primaryKey(),
  phase: integer("phase").notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  status: roadmapStatusEnum("status").default("upcoming").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export type RoadmapPhase = typeof roadmapPhases.$inferSelect;

// Presentations / PDF library
export const presentations = pgTable("presentations", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  language: varchar("language", { length: 50 }).default("English").notNull(),
  fileUrl: varchar("file_url", { length: 1000 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Presentation = typeof presentations.$inferSelect;
export type InsertPresentation = typeof presentations.$inferInsert;

// Site settings (key-value store)
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key", { length: 200 }).notNull().unique(),
  settingValue: text("setting_value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Newsletter signups — email collection with GDPR consent tracking.
// Admin exports to CSV via the streaming /api/admin/newsletter/export
// route for import into Mailchimp/Resend/Brevo. Every export filter
// respects unsubscribed_at IS NULL by default.
export const newsletterSignups = pgTable("newsletter_signups", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 100 }), // "homepage", "footer", "blog", etc
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // ─── GDPR consent record (Task B) ───
  // consent_method: how they opted in — "form-checkbox", "footer-implicit",
  //   "imported", "legacy:pre-gdpr" (back-fill for rows that pre-date this
  //   migration). NEVER write "imported" without consent_source_url.
  consentMethod: varchar("consent_method", { length: 50 }),
  // consent_text: the exact copy the user agreed to. Snapshot it so a
  //   later wording change doesn't retroactively rewrite history.
  consentText: text("consent_text"),
  // consent_source_url: page the signup happened on, e.g.
  //   "https://turboloop.tech/?utm_campaign=hub-launch"
  consentSourceUrl: text("consent_source_url"),
  // ip_country: ISO-3166 alpha-2 from Vercel's `x-vercel-ip-country`
  //   header at signup time. Used for the CRM map widget + GDPR scope.
  ipCountry: varchar("ip_country", { length: 2 }),
  // Unsubscribe: filled when the user clicks the one-click unsubscribe
  //   link in any newsletter email. Once set, all exports exclude the
  //   row by default; we keep it for audit/replay rather than hard-delete.
  unsubscribedAt: timestamp("unsubscribed_at"),
  unsubscribeReason: varchar("unsubscribe_reason", { length: 200 }),
});

export type NewsletterSignup = typeof newsletterSignups.$inferSelect;
export type InsertNewsletterSignup = typeof newsletterSignups.$inferInsert;

// Community-submitted content (testimonials, photos, reels, stories) —
// queued for admin moderation before showing on /community wall.
// Status lifecycle: pending → approved → payment_due → paid. Rejection
// is a terminal branch off any of the prior states. The payment_due /
// paid states are used by the Creator Star payout flow (admin queues a
// payout after view-count verification, marks paid once stablecoins ship).
export const contentSubmissionStatusEnum = pgEnum("content_submission_status", [
  "pending",
  "approved",
  "payment_due",
  "paid",
  "rejected",
]);

export const contentSubmissions = pgTable("content_submissions", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // testimonial | photo | reel | story | creator_apply | presenter_apply
  authorName: varchar("author_name", { length: 200 }).notNull(),
  authorContact: varchar("author_contact", { length: 320 }), // email or telegram handle
  authorCountry: varchar("author_country", { length: 100 }),
  body: text("body").notNull(),
  fileUrl: varchar("file_url", { length: 1000 }), // optional photo/video URL
  // Creator Star payout fields — set by the /submit form for
  // creator_apply submissions and updated by the 44-day reminder cron.
  walletAddress: varchar("wallet_address", { length: 100 }),
  youtubeUrl: varchar("youtube_url", { length: 500 }),
  viewCount: integer("view_count"),
  viewCountCheckedAt: timestamp("view_count_checked_at"),
  payoutAmountUsd: integer("payout_amount_usd"),
  status: contentSubmissionStatusEnum("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ContentSubmission = typeof contentSubmissions.$inferSelect;

// Event applications — Local Presenter / meetup sponsorship submissions
// from /events. Distinct table because the schema is different from
// content submissions (no body/file, but wallet address + tier + date).
export const eventApplicationStatusEnum = pgEnum("event_application_status", [
  "pending",
  "approved",
  "rejected",
]);

export const eventApplications = pgTable("event_applications", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 100 }).notNull(),
  teamSize: integer("team_size").notNull(),
  tier: varchar("tier", { length: 50 }).notNull(), // local | city | regional | national
  cityCountry: varchar("city_country", { length: 200 }).notNull(),
  expectedAttendees: integer("expected_attendees").notNull(),
  requestedDate: varchar("requested_date", { length: 100 }).notNull(),
  whatsappNumber: varchar("whatsapp_number", { length: 50 }).notNull(),
  telegramId: varchar("telegram_id", { length: 100 }).notNull(),
  status: eventApplicationStatusEnum("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EventApplication = typeof eventApplications.$inferSelect;
export type InsertEventApplication = typeof eventApplications.$inferInsert;

// Social Wall videos — community YouTube content surfaced on the
// homepage social wall. Distinct from `videos` (which holds the
// cinematic universe + production reels) because the curation flow,
// metadata, and source-of-truth (YouTube IDs) are different.
export const socialWallVideos = pgTable("social_wall_videos", {
  id: serial("id").primaryKey(),
  youtubeId: varchar("youtube_id", { length: 20 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  channelTitle: varchar("channel_title", { length: 200 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  viewCount: integer("view_count"),
  durationSec: integer("duration_sec"),
  language: varchar("language", { length: 10 }),
  approved: boolean("approved").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
});

export type SocialWallVideo = typeof socialWallVideos.$inferSelect;
export type InsertSocialWallVideo = typeof socialWallVideos.$inferInsert;

// ─── Chatbot persistence (Task A) ─────────────────────────────────────
//
// One `chat_conversations` row per cookie-tied session. `session_id` is
// a UUID set in a cookie on the first POST to /api/chat; conversations
// last as long as the user keeps chatting from the same browser. We
// don't tie to authenticated users — the public chatbot doesn't have a
// login concept.
//
// `chat_kb_version` lets us replay or filter conversations served by a
// specific KB snapshot (e.g. "all chats that ran against the May 18
// KB"). Useful for refining the KB after seeing failure patterns.

export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull().unique(),
  // ip_hash = sha256(ip + daily_salt) — never store raw IP. Salt rotates
  // daily so the same IP looks different across days; aggregate use
  // remains possible but cross-day re-identification gets harder.
  ipHash: varchar("ip_hash", { length: 64 }),
  country: varchar("country", { length: 2 }), // ISO-3166 alpha-2
  // KB version the system prompt was built against — generator script
  // writes a fingerprint (e.g. content hash) into chatbot-kb.ts that
  // we record here per conversation start.
  chatKbVersion: varchar("chat_kb_version", { length: 64 }),
  turnCount: integer("turn_count").default(0).notNull(),
  tokensIn: integer("tokens_in").default(0).notNull(),
  tokensOut: integer("tokens_out").default(0).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;

// One row per turn. `content` is the message body (already PII-scrubbed
// at write time — wallet addresses + email patterns get redacted before
// the insert in api/chat). `refused` flags assistant turns that triggered
// the off-topic / harassment filter; `thumbs_up` is the satisfaction
// signal from the chatbot UI.
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => chatConversations.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 16 }).notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  refused: boolean("refused").default(false).notNull(),
  thumbsUp: boolean("thumbs_up"), // null = no feedback yet
  tokensIn: integer("tokens_in"),
  tokensOut: integer("tokens_out"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ─── Careers CMS (Task F) ─────────────────────────────────────────────
//
// Replaces the hardcoded ROLES array in next-app/app/careers/page.tsx.
// Admin CRUDs these via the new "Careers" tab. Closed roles stay in the
// table for audit + slug-stability; `closing_at` auto-closes a role
// without manual toggling.
//
// `tg_support_link` is the Telegram handle to DM if applicants have
// questions before applying (per-role override; defaults to the global
// support channel in the UI).

export const vacancyStatusEnum = pgEnum("vacancy_status", [
  "open",
  "closed",
  "draft",
]);

export const jobVacancies = pgTable("job_vacancies", {
  id: serial("id").primaryKey(),
  // Stable slug (e.g. "presenter-de"), used as the role identifier
  // passed by CareersApplicationForm → content_submissions.
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  flag: varchar("flag", { length: 8 }), // optional emoji flag for cards
  location: varchar("location", { length: 200 }).notNull(),
  stipend: varchar("stipend", { length: 100 }).notNull(),
  // Bullet points — array of short strings, displayed as a checklist
  // on the card. JSON column keeps the schema flexible without a
  // join table for a 4-bullet payload.
  bullets: jsonb("bullets").$type<string[]>().default([]).notNull(),
  status: vacancyStatusEnum("status").default("draft").notNull(),
  // tg_support_link: optional t.me/handle (or full URL) for applicant Qs.
  tgSupportLink: varchar("tg_support_link", { length: 300 }),
  // closing_at: roles with this set in the past auto-close on read.
  closingAt: timestamp("closing_at"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type JobVacancy = typeof jobVacancies.$inferSelect;
export type InsertJobVacancy = typeof jobVacancies.$inferInsert;
