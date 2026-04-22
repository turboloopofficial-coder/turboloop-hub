import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Admin credentials table (separate from OAuth users)
export const adminCredentials = mysqlTable("admin_credentials", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 512 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Blog posts
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: varchar("coverImage", { length: 1000 }),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// Videos
export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  youtubeUrl: varchar("youtubeUrl", { length: 500 }),
  directUrl: varchar("directUrl", { length: 1000 }),
  category: mysqlEnum("category", ["presentation", "how-to-join", "withdraw-compound", "other"]).notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  languageFlag: varchar("languageFlag", { length: 10 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

// Events / Zoom meetings
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  dateTime: varchar("dateTime", { length: 100 }).notNull(),
  timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
  frequency: varchar("frequency", { length: 100 }),
  meetingLink: varchar("meetingLink", { length: 1000 }).notNull(),
  passcode: varchar("passcode", { length: 50 }),
  hostName: varchar("hostName", { length: 200 }),
  language: varchar("language", { length: 50 }).default("English").notNull(),
  status: mysqlEnum("status", ["upcoming", "live", "completed", "recurring"]).default("upcoming").notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// Country leaderboard
export const countryLeaderboard = mysqlTable("country_leaderboard", {
  id: int("id").autoincrement().primaryKey(),
  rank: int("rank").notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  countryCode: varchar("countryCode", { length: 5 }).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  score: int("score").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CountryLeaderboardEntry = typeof countryLeaderboard.$inferSelect;

// Promotions
export const promotions = mysqlTable("promotions", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  description: text("description").notNull(),
  details: json("details"),
  active: boolean("active").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Promotion = typeof promotions.$inferSelect;

// Roadmap phases
export const roadmapPhases = mysqlTable("roadmap_phases", {
  id: int("id").autoincrement().primaryKey(),
  phase: int("phase").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["completed", "current", "upcoming"]).default("upcoming").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export type RoadmapPhase = typeof roadmapPhases.$inferSelect;

// Presentations / PDF library
export const presentations = mysqlTable("presentations", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  language: varchar("language", { length: 50 }).default("English").notNull(),
  fileUrl: varchar("fileUrl", { length: 1000 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Presentation = typeof presentations.$inferSelect;
export type InsertPresentation = typeof presentations.$inferInsert;

// Site settings (key-value store for deck URL, etc.)
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 200 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
