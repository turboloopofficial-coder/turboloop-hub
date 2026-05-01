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

// Newsletter signups — simple email collection. No service integration yet;
// admin can export to CSV via Neon and import into Mailchimp/Resend/Brevo later.
export const newsletterSignups = pgTable("newsletter_signups", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 100 }), // "homepage", "footer", "blog", etc
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NewsletterSignup = typeof newsletterSignups.$inferSelect;

// Community-submitted content (testimonials, photos, reels, stories) —
// queued for admin moderation before showing on /community wall.
export const contentSubmissionStatusEnum = pgEnum("content_submission_status", ["pending", "approved", "rejected"]);

export const contentSubmissions = pgTable("content_submissions", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // testimonial | photo | reel | story
  authorName: varchar("author_name", { length: 200 }).notNull(),
  authorContact: varchar("author_contact", { length: 320 }), // email or telegram handle
  authorCountry: varchar("author_country", { length: 100 }),
  body: text("body").notNull(),
  fileUrl: varchar("file_url", { length: 1000 }), // optional photo/video URL
  status: contentSubmissionStatusEnum("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ContentSubmission = typeof contentSubmissions.$inferSelect;
