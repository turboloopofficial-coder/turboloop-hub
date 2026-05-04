import { eq, desc, asc, and, isNotNull, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  adminCredentials,
  blogPosts, type InsertBlogPost,
  videos, type InsertVideo,
  events, type InsertEvent,
  countryLeaderboard,
  promotions,
  roadmapPhases,
  presentations, type InsertPresentation,
  siteSettings,
  newsletterSignups,
  contentSubmissions,
} from "../drizzle/schema";
import bcrypt from "bcryptjs";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(url);
  _db = drizzle(sql);
  return _db;
}

// ===== Admin Auth =====
export async function getAdminByEmail(email: string) {
  const db = getDb();
  const result = await db.select().from(adminCredentials).where(eq(adminCredentials.email, email)).limit(1);
  return result[0] || undefined;
}

export async function upsertAdmin(email: string, password: string) {
  const db = getDb();
  const hash = await bcrypt.hash(password, 12);
  await db
    .insert(adminCredentials)
    .values({ email, passwordHash: hash })
    .onConflictDoUpdate({
      target: adminCredentials.email,
      set: { passwordHash: hash },
    });
}

export async function verifyAdminPassword(email: string, password: string): Promise<boolean> {
  const admin = await getAdminByEmail(email);
  if (!admin) return false;
  return bcrypt.compare(password, admin.passwordHash);
}

// ===== Blog Posts =====

/**
 * SELF-HEAL: publishes any blog post whose scheduled_publish_at <= now() and not yet published.
 *
 * Called from:
 *   1. The Vercel cron handler (api/cron/publish-blog) — primary mechanism
 *   2. The public listBlogPosts query — safety-net backup so even if Vercel cron
 *      misses a day (auth issue, infra hiccup), the next visitor triggers a catch-up.
 *
 * Idempotent — safe to call any number of times. Returns slugs that were just published.
 */
export async function publishOverdueBlogs(): Promise<string[]> {
  const db = getDb();
  const now = new Date();
  const due = await db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.published, false),
        isNotNull(blogPosts.scheduledPublishAt),
        lte(blogPosts.scheduledPublishAt, now)
      )
    );

  const published: string[] = [];
  for (const post of due) {
    await db.update(blogPosts).set({ published: true }).where(eq(blogPosts.id, post.id));
    published.push(post.slug);
  }
  return published;
}

export async function listBlogPosts(publishedOnly = true) {
  const db = getDb();
  // Self-heal on every public read — fire-and-forget, never block the response
  if (publishedOnly) {
    publishOverdueBlogs().catch((e) => console.error("[publishOverdueBlogs]", e));
    return db.select().from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.createdAt));
  }
  return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
}

export async function getBlogPostBySlug(slug: string) {
  const db = getDb();
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result[0] || undefined;
}

export async function createBlogPost(post: InsertBlogPost) {
  const db = getDb();
  const result = await db.insert(blogPosts).values(post).returning();
  return result[0];
}

export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>) {
  const db = getDb();
  await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = getDb();
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

// ===== Videos =====
export async function listVideos(publishedOnly = true) {
  const db = getDb();
  if (publishedOnly) {
    return db.select().from(videos).where(eq(videos.published, true)).orderBy(asc(videos.sortOrder), desc(videos.createdAt));
  }
  return db.select().from(videos).orderBy(asc(videos.sortOrder), desc(videos.createdAt));
}

export async function createVideo(video: InsertVideo) {
  const db = getDb();
  await db.insert(videos).values(video);
}

export async function updateVideo(id: number, data: Partial<InsertVideo>) {
  const db = getDb();
  await db.update(videos).set(data).where(eq(videos.id, id));
}

export async function deleteVideo(id: number) {
  const db = getDb();
  await db.delete(videos).where(eq(videos.id, id));
}

// ===== Events =====
export async function listEvents(publishedOnly = true) {
  const db = getDb();
  if (publishedOnly) {
    return db.select().from(events).where(eq(events.published, true)).orderBy(desc(events.createdAt));
  }
  return db.select().from(events).orderBy(desc(events.createdAt));
}

export async function createEvent(event: InsertEvent) {
  const db = getDb();
  await db.insert(events).values(event);
}

export async function updateEvent(id: number, data: Partial<InsertEvent>) {
  const db = getDb();
  await db.update(events).set(data).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  const db = getDb();
  await db.delete(events).where(eq(events.id, id));
}

// ===== Country Leaderboard =====
export async function listLeaderboard() {
  const db = getDb();
  return db.select().from(countryLeaderboard).orderBy(asc(countryLeaderboard.rank));
}

export async function upsertLeaderboardEntry(rank: number, country: string, countryCode: string, description: string, score: number) {
  const db = getDb();
  await db
    .insert(countryLeaderboard)
    .values({ rank, country, countryCode, description, score })
    .onConflictDoUpdate({
      target: countryLeaderboard.rank,
      set: { country, countryCode, description, score },
    });
}

// ===== Promotions =====
export async function listPromotions(activeOnly = true) {
  const db = getDb();
  if (activeOnly) {
    return db.select().from(promotions).where(eq(promotions.active, true)).orderBy(asc(promotions.sortOrder));
  }
  return db.select().from(promotions).orderBy(asc(promotions.sortOrder));
}

export async function updatePromotion(id: number, data: Partial<typeof promotions.$inferInsert>) {
  const db = getDb();
  await db.update(promotions).set(data).where(eq(promotions.id, id));
}

export async function createPromotion(data: typeof promotions.$inferInsert) {
  const db = getDb();
  await db.insert(promotions).values(data);
}

// ===== Roadmap =====
export async function listRoadmapPhases() {
  const db = getDb();
  return db.select().from(roadmapPhases).orderBy(asc(roadmapPhases.phase));
}

export async function updateRoadmapPhase(id: number, data: Partial<typeof roadmapPhases.$inferInsert>) {
  const db = getDb();
  await db.update(roadmapPhases).set(data).where(eq(roadmapPhases.id, id));
}

// ===== Presentations =====
export async function listPresentations(publishedOnly = true) {
  const db = getDb();
  if (publishedOnly) {
    return db.select().from(presentations).where(eq(presentations.published, true)).orderBy(asc(presentations.sortOrder), desc(presentations.createdAt));
  }
  return db.select().from(presentations).orderBy(asc(presentations.sortOrder), desc(presentations.createdAt));
}

export async function createPresentation(data: InsertPresentation) {
  const db = getDb();
  await db.insert(presentations).values(data);
}

export async function updatePresentation(id: number, data: Partial<InsertPresentation>) {
  const db = getDb();
  await db.update(presentations).set(data).where(eq(presentations.id, id));
}

export async function deletePresentation(id: number) {
  const db = getDb();
  await db.delete(presentations).where(eq(presentations.id, id));
}

// ===== Site Settings =====
export async function getSetting(key: string): Promise<string | undefined> {
  const db = getDb();
  const result = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, key)).limit(1);
  return result[0]?.settingValue;
}

export async function setSetting(key: string, value: string) {
  const db = getDb();
  await db
    .insert(siteSettings)
    .values({ settingKey: key, settingValue: value })
    .onConflictDoUpdate({
      target: siteSettings.settingKey,
      set: { settingValue: value },
    });
}

// ===== Newsletter Signups =====
export async function addNewsletterSignup(email: string, source: string | null = null) {
  const db = getDb();
  // Idempotent: ignore duplicate emails (user may submit twice — that's fine)
  await db
    .insert(newsletterSignups)
    .values({ email: email.toLowerCase().trim(), source })
    .onConflictDoNothing();
}

export async function listNewsletterSignups(limit = 1000) {
  const db = getDb();
  return await db.select().from(newsletterSignups).orderBy(desc(newsletterSignups.createdAt)).limit(limit);
}

export async function newsletterSignupCount(): Promise<number> {
  const db = getDb();
  const r = await db.select().from(newsletterSignups);
  return r.length;
}

// ===== Content Submissions =====
export async function createContentSubmission(input: {
  type: string;
  authorName: string;
  authorContact?: string | null;
  authorCountry?: string | null;
  body: string;
  fileUrl?: string | null;
}) {
  const db = getDb();
  const result = await db
    .insert(contentSubmissions)
    .values({
      type: input.type,
      authorName: input.authorName,
      authorContact: input.authorContact ?? null,
      authorCountry: input.authorCountry ?? null,
      body: input.body,
      fileUrl: input.fileUrl ?? null,
    })
    .returning();
  return result[0];
}

export async function listContentSubmissions(status?: "pending" | "approved" | "rejected") {
  const db = getDb();
  const query = db.select().from(contentSubmissions);
  if (status) {
    const r = await query.where(eq(contentSubmissions.status, status)).orderBy(desc(contentSubmissions.createdAt));
    return r;
  }
  return await query.orderBy(desc(contentSubmissions.createdAt));
}

/** Public-safe view — only approved, only fields safe to surface publicly.
 *  Excludes authorContact (PII) and adminNotes (internal). */
export async function listPublicApprovedSubmissions(limit = 12) {
  const db = getDb();
  const r = await db
    .select({
      id: contentSubmissions.id,
      type: contentSubmissions.type,
      authorName: contentSubmissions.authorName,
      authorCountry: contentSubmissions.authorCountry,
      body: contentSubmissions.body,
      fileUrl: contentSubmissions.fileUrl,
      createdAt: contentSubmissions.createdAt,
    })
    .from(contentSubmissions)
    .where(eq(contentSubmissions.status, "approved"))
    .orderBy(desc(contentSubmissions.createdAt))
    .limit(limit);
  return r;
}

export async function updateContentSubmissionStatus(id: number, status: "pending" | "approved" | "rejected", adminNotes?: string) {
  const db = getDb();
  const rows = await db
    .update(contentSubmissions)
    .set({ status, adminNotes: adminNotes ?? null })
    .where(eq(contentSubmissions.id, id))
    .returning();
  return rows[0] ?? null;
}
