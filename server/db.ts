import { eq, desc, asc, and, isNotNull, isNull, or, lte, gt, gte } from "drizzle-orm";
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
  eventApplications, type InsertEventApplication,
  socialWallVideos, type InsertSocialWallVideo,
  jobVacancies, type InsertJobVacancy,
  chatConversations, chatMessages,
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

/** Automation log entry — one row of the admin Automation tab's
 *  Activity Log section. Aggregates `lastFired:*`, `oneShot:*`, and
 *  `cronError:*` rows from site_settings into a typed shape the
 *  client can render without parsing key formats inline. */
export interface AutomationLogEntry {
  /** Raw setting key — preserved so the client can show the exact
   *  string when needed (debugging, manual mark-fired, etc.). */
  settingKey: string;
  /** Parsed kind from the key prefix. */
  kind: "lastFired" | "oneShot" | "cronError";
  /** Task identifier (the middle segment of a `lastFired:<task>:<date>`
   *  key, or the only segment of a `oneShot:<task>` key). */
  taskName: string;
  /** ISO date suffix from `lastFired:*:YYYY-MM-DD` and
   *  `cronError:*:YYYY-MM-DD` — null for oneShot keys. */
  dateKey: string | null;
  /** Stored value — usually the ISO timestamp when the task fired
   *  (for lastFired / oneShot) OR the error message (for cronError). */
  value: string;
  /** When the row was last touched. */
  updatedAt: Date;
}

/** Aggregate the automation log for the Activity Log + Telegram
 *  Health + Campaign Tracker sections of the admin Automation tab.
 *  Returns rows sorted by `settingValue` (the timestamp) descending,
 *  newest first. */
export async function listAutomationLog(
  limit = 100
): Promise<AutomationLogEntry[]> {
  const db = getDb();
  // drizzle-orm's `like` operator is the safest way to match the
  // key prefixes — no SQL injection risk and the index on
  // settingKey covers the prefix scan.
  const { like } = await import("drizzle-orm");
  const rows = await db
    .select()
    .from(siteSettings)
    .where(
      or(
        like(siteSettings.settingKey, "lastFired:%"),
        like(siteSettings.settingKey, "oneShot:%"),
        like(siteSettings.settingKey, "cronError:%"),
      )
    )
    .orderBy(desc(siteSettings.settingValue))
    .limit(limit);

  return rows.map((r): AutomationLogEntry => {
    const key = r.settingKey;
    let kind: AutomationLogEntry["kind"] = "lastFired";
    if (key.startsWith("oneShot:")) kind = "oneShot";
    else if (key.startsWith("cronError:")) kind = "cronError";

    // For `lastFired:<task>:<YYYY-MM-DD>` we split out the date suffix.
    // For `cronError:<task>:<YYYY-MM-DD>` same shape.
    // For `oneShot:<task>` there's no date suffix.
    const parts = key.split(":");
    let taskName: string;
    let dateKey: string | null = null;
    if (kind === "oneShot") {
      // `oneShot:<task>` — sometimes <task> itself has colons (e.g.
      // `creatorReminder:42`). Join everything after the prefix.
      taskName = parts.slice(1).join(":");
    } else {
      // Last segment looks like a date if it's YYYY-MM-DD.
      const tail = parts[parts.length - 1] ?? "";
      const isDate = /^\d{4}-\d{2}-\d{2}$/.test(tail);
      if (isDate) {
        dateKey = tail;
        taskName = parts.slice(1, -1).join(":");
      } else {
        taskName = parts.slice(1).join(":");
      }
    }

    return {
      settingKey: key,
      kind,
      taskName,
      dateKey,
      value: r.settingValue,
      updatedAt: r.updatedAt as Date,
    };
  });
}

// ===== Newsletter Signups =====
export interface NewsletterSignupInput {
  source?: string | null;
  consentMethod?: string | null;
  consentText?: string | null;
  consentSourceUrl?: string | null;
  ipCountry?: string | null;
}

export async function addNewsletterSignup(
  email: string,
  opts: NewsletterSignupInput | (string | null) = {}
) {
  const db = getDb();
  // Support the legacy signature `addNewsletterSignup(email, source)`
  // (string|null as second arg) — that's what server/routers.ts passed
  // before the GDPR upgrade. New callers should pass an options object.
  const o: NewsletterSignupInput =
    typeof opts === "string" || opts === null
      ? { source: opts }
      : opts;
  await db
    .insert(newsletterSignups)
    .values({
      email: email.toLowerCase().trim(),
      source: o.source ?? null,
      consentMethod: o.consentMethod ?? null,
      consentText: o.consentText ?? null,
      consentSourceUrl: o.consentSourceUrl ?? null,
      ipCountry: o.ipCountry ?? null,
    })
    .onConflictDoNothing();
}

/** Public list with optional filters. Used by CRM Newsletter tab.
 *  excludeUnsubscribed defaults to true to match GDPR-safe export
 *  semantics — passing false explicitly returns the full corpus. */
export async function listNewsletterSignups(opts: {
  limit?: number;
  excludeUnsubscribed?: boolean;
} | number = {}) {
  const db = getDb();
  // Backward-compat: previously the function took a number directly.
  const o = typeof opts === "number" ? { limit: opts } : opts;
  const limit = o.limit ?? 1000;
  if (o.excludeUnsubscribed === false) {
    return await db
      .select()
      .from(newsletterSignups)
      .orderBy(desc(newsletterSignups.createdAt))
      .limit(limit);
  }
  return await db
    .select()
    .from(newsletterSignups)
    .where(isNull(newsletterSignups.unsubscribedAt))
    .orderBy(desc(newsletterSignups.createdAt))
    .limit(limit);
}

/** Single-row aggregate count — Drizzle's count() pushes aggregation
 *  into Postgres rather than materializing every row in the lambda
 *  just to call .length on the array. (Anti-pattern fix flagged in the
 *  v7 plan review.) */
export async function newsletterSignupCount(): Promise<number> {
  const { count } = await import("drizzle-orm");
  const db = getDb();
  const [row] = await db
    .select({ n: count() })
    .from(newsletterSignups);
  return row?.n ?? 0;
}

/** Mark a signup as unsubscribed. Idempotent — no-op if the row is
 *  already unsubscribed or the email doesn't exist. */
export async function unsubscribeNewsletter(
  email: string,
  reason: string | null = null
) {
  const db = getDb();
  await db
    .update(newsletterSignups)
    .set({ unsubscribedAt: new Date(), unsubscribeReason: reason })
    .where(
      and(
        eq(newsletterSignups.email, email.toLowerCase().trim()),
        isNull(newsletterSignups.unsubscribedAt)
      )
    );
}

// ===== Content Submissions =====
export async function createContentSubmission(input: {
  type: string;
  authorName: string;
  authorContact?: string | null;
  authorCountry?: string | null;
  body: string;
  fileUrl?: string | null;
  // Structured contact fields added 2026-05-22. whatsappNumber is
  // required for any new submission (router zod schema enforces);
  // typed optional here because the function signature also serves
  // historical/internal callers that don't pass it.
  whatsappNumber?: string | null;
  email?: string | null;
  telegramHandle?: string | null;
  otherSocial?: string | null;
  walletAddress?: string | null;
  youtubeUrl?: string | null;
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
      whatsappNumber: input.whatsappNumber ?? null,
      email: input.email ?? null,
      telegramHandle: input.telegramHandle ?? null,
      otherSocial: input.otherSocial ?? null,
      walletAddress: input.walletAddress ?? null,
      youtubeUrl: input.youtubeUrl ?? null,
    })
    .returning();
  return result[0];
}

export async function listContentSubmissions(
  status?: "pending" | "approved" | "payment_due" | "paid" | "rejected"
) {
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

export async function updateContentSubmissionStatus(
  id: number,
  status: "pending" | "approved" | "payment_due" | "paid" | "rejected",
  adminNotes?: string
) {
  const db = getDb();
  const rows = await db
    .update(contentSubmissions)
    .set({ status, adminNotes: adminNotes ?? null })
    .where(eq(contentSubmissions.id, id))
    .returning();
  return rows[0] ?? null;
}

// ===== Event Applications (Local Presenter / meetup sponsorship) =====
export async function createEventApplication(input: InsertEventApplication) {
  const db = getDb();
  const result = await db.insert(eventApplications).values(input).returning();
  return result[0];
}

export async function listEventApplications(
  status?: "pending" | "approved" | "rejected"
) {
  const db = getDb();
  if (status) {
    return db
      .select()
      .from(eventApplications)
      .where(eq(eventApplications.status, status))
      .orderBy(desc(eventApplications.createdAt));
  }
  return db
    .select()
    .from(eventApplications)
    .orderBy(desc(eventApplications.createdAt));
}

export async function updateEventApplicationStatus(
  id: number,
  status: "pending" | "approved" | "rejected",
  adminNotes?: string
) {
  const db = getDb();
  const rows = await db
    .update(eventApplications)
    .set({ status, adminNotes: adminNotes ?? null })
    .where(eq(eventApplications.id, id))
    .returning();
  return rows[0] ?? null;
}

// ===== Social Wall (YouTube videos) =====
export async function listSocialWallVideos(opts?: {
  approvedOnly?: boolean;
}) {
  const db = getDb();
  const rows = opts?.approvedOnly
    ? await db
        .select()
        .from(socialWallVideos)
        .where(eq(socialWallVideos.approved, true))
        .orderBy(
          desc(socialWallVideos.featured),
          asc(socialWallVideos.sortOrder),
          desc(socialWallVideos.fetchedAt)
        )
    : await db
        .select()
        .from(socialWallVideos)
        .orderBy(
          desc(socialWallVideos.featured),
          asc(socialWallVideos.sortOrder),
          desc(socialWallVideos.fetchedAt)
        );
  return rows;
}

export async function upsertSocialWallVideo(input: InsertSocialWallVideo) {
  const db = getDb();
  // ON CONFLICT (youtube_id) → update the metadata fields we always
  // have fresh from the API. Curation flags (approved/featured/sortOrder)
  // are preserved if the row already exists.
  const result = await db
    .insert(socialWallVideos)
    .values(input)
    .onConflictDoUpdate({
      target: socialWallVideos.youtubeId,
      set: {
        title: input.title,
        channelTitle: input.channelTitle,
        thumbnailUrl: input.thumbnailUrl,
        viewCount: input.viewCount,
        durationSec: input.durationSec,
        language: input.language,
      },
    })
    .returning();
  return result[0];
}

export async function updateSocialWallVideo(
  id: number,
  patch: {
    approved?: boolean;
    featured?: boolean;
    sortOrder?: number;
  }
) {
  const db = getDb();
  const setValues: Record<string, unknown> = { ...patch };
  if (patch.approved === true) setValues.approvedAt = new Date();
  if (patch.approved === false) setValues.approvedAt = null;
  const rows = await db
    .update(socialWallVideos)
    .set(setValues)
    .where(eq(socialWallVideos.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteSocialWallVideo(id: number) {
  const db = getDb();
  await db.delete(socialWallVideos).where(eq(socialWallVideos.id, id));
}

// ===== Content submission Creator Star fields =====
export async function updateContentSubmissionPayout(
  id: number,
  patch: {
    walletAddress?: string | null;
    youtubeUrl?: string | null;
    viewCount?: number | null;
    viewCountCheckedAt?: Date | null;
    payoutAmountUsd?: number | null;
  }
) {
  const db = getDb();
  const rows = await db
    .update(contentSubmissions)
    .set(patch)
    .where(eq(contentSubmissions.id, id))
    .returning();
  return rows[0] ?? null;
}

// ===== Job Vacancies (Task F — Careers CMS) =====
//
// Public read returns only roles that are:
//   - status = 'open'
//   - closing_at IS NULL OR closing_at > now()
// Admin read returns everything (drafts + closed) ordered by sortOrder.

/** Public list — only currently-applicable roles. Sorted by sortOrder
 *  asc, then by createdAt desc as a stable tiebreak. */
export async function listOpenJobVacancies() {
  const db = getDb();
  const now = new Date();
  return await db
    .select()
    .from(jobVacancies)
    .where(
      and(
        eq(jobVacancies.status, "open"),
        or(isNull(jobVacancies.closingAt), gt(jobVacancies.closingAt, now))
      )
    )
    .orderBy(asc(jobVacancies.sortOrder), desc(jobVacancies.createdAt));
}

/** Admin list — every row including drafts and closed. */
export async function listAllJobVacancies() {
  const db = getDb();
  return await db
    .select()
    .from(jobVacancies)
    .orderBy(asc(jobVacancies.sortOrder), desc(jobVacancies.createdAt));
}

/** Fetch one row by slug — used by the application form to attach the
 *  role title + slug to submissions. Returns null if missing. */
export async function getJobVacancyBySlug(slug: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(jobVacancies)
    .where(eq(jobVacancies.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function createJobVacancy(input: InsertJobVacancy) {
  const db = getDb();
  const [row] = await db.insert(jobVacancies).values(input).returning();
  return row;
}

export async function updateJobVacancy(
  id: number,
  patch: Partial<InsertJobVacancy>
) {
  const db = getDb();
  const [row] = await db
    .update(jobVacancies)
    .set(patch)
    .where(eq(jobVacancies.id, id))
    .returning();
  return row ?? null;
}

export async function deleteJobVacancy(id: number) {
  const db = getDb();
  await db.delete(jobVacancies).where(eq(jobVacancies.id, id));
}

// ===== CRM aggregates (Task B) =====
//
// Top-level metrics + cross-table activity feed for the admin
// dashboard's CRM Overview tab. Counts use SQL aggregates (not
// materialized arrays in JS) so growth past 10K rows doesn't degrade
// page load.

// `eventApplications` is already imported at the top of this file.
// Aliased here to a local name so we don't shadow the variable in case
// future helpers want both spellings.
const eventApplicationsTbl = eventApplications;

export async function crmOverviewMetrics(): Promise<{
  newsletterTotal: number;
  newsletterUnsubscribed: number;
  pendingSubmissions: number;
  pendingEventApplications: number;
  chatConversationsLast7d: number;
  chatMessagesLast7d: number;
}> {
  const { count, gte: gteOp } = await import("drizzle-orm");
  const db = getDb();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    [nsTotal],
    [nsUnsub],
    [pendingSubs],
    [pendingApps],
    [chatConvs],
    [chatMsgs],
  ] = await Promise.all([
    db.select({ n: count() }).from(newsletterSignups).where(isNull(newsletterSignups.unsubscribedAt)),
    db.select({ n: count() }).from(newsletterSignups).where(isNotNull(newsletterSignups.unsubscribedAt)),
    db.select({ n: count() }).from(contentSubmissions).where(eq(contentSubmissions.status, "pending")),
    db.select({ n: count() }).from(eventApplicationsTbl).where(eq(eventApplicationsTbl.status, "pending")),
    db.select({ n: count() }).from(chatConversations).where(gteOp(chatConversations.startedAt, sevenDaysAgo)),
    db.select({ n: count() }).from(chatMessages).where(gteOp(chatMessages.createdAt, sevenDaysAgo)),
  ]);

  return {
    newsletterTotal: nsTotal?.n ?? 0,
    newsletterUnsubscribed: nsUnsub?.n ?? 0,
    pendingSubmissions: pendingSubs?.n ?? 0,
    pendingEventApplications: pendingApps?.n ?? 0,
    chatConversationsLast7d: chatConvs?.n ?? 0,
    chatMessagesLast7d: chatMsgs?.n ?? 0,
  };
}

/** Cross-table activity feed. Returns the most-recent N events across:
 *  newsletter signups, content submissions, event applications, chat
 *  conversations. Uses one round-trip per source then JS-merges — at
 *  N=50 per source × 4 sources = 200 rows max, JS sort is faster than
 *  a SQL UNION + ORDER BY. */
export async function crmRecentActivity(perSource = 25): Promise<
  Array<{
    type: "newsletter" | "submission" | "event_app" | "chat";
    id: number;
    label: string;
    detail: string;
    createdAt: Date;
  }>
> {
  const db = getDb();
  const [news, subs, apps, convs] = await Promise.all([
    db
      .select()
      .from(newsletterSignups)
      .orderBy(desc(newsletterSignups.createdAt))
      .limit(perSource),
    db
      .select()
      .from(contentSubmissions)
      .orderBy(desc(contentSubmissions.createdAt))
      .limit(perSource),
    db
      .select()
      .from(eventApplicationsTbl)
      .orderBy(desc(eventApplicationsTbl.createdAt))
      .limit(perSource),
    db
      .select()
      .from(chatConversations)
      .orderBy(desc(chatConversations.startedAt))
      .limit(perSource),
  ]);

  const merged: Array<{
    type: "newsletter" | "submission" | "event_app" | "chat";
    id: number;
    label: string;
    detail: string;
    createdAt: Date;
  }> = [];

  for (const r of news) {
    merged.push({
      type: "newsletter",
      id: r.id,
      label: r.email,
      detail: r.source ? `via ${r.source}` : "signup",
      createdAt: r.createdAt,
    });
  }
  for (const r of subs) {
    merged.push({
      type: "submission",
      id: r.id,
      label: r.authorName,
      detail: `${r.type} · ${r.status}`,
      createdAt: r.createdAt,
    });
  }
  for (const r of apps) {
    // The eventApplications schema uses cityCountry + telegramId, not
    // a single name field. Fall back to telegram handle for the label.
    merged.push({
      type: "event_app",
      id: r.id,
      label: r.telegramId || `Application #${r.id}`,
      detail: `${r.cityCountry ?? "unknown location"} · ${r.status}`,
      createdAt: r.createdAt,
    });
  }
  for (const r of convs) {
    merged.push({
      type: "chat",
      id: r.id,
      label: `Chat ${r.sessionId.slice(0, 8)}…`,
      detail: `${r.turnCount} turn${r.turnCount === 1 ? "" : "s"} · ${r.country ?? "??"}`,
      createdAt: r.startedAt,
    });
  }

  merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return merged.slice(0, perSource * 2);
}

// ===== Chat conversations + messages (Task B Chats tab) =====
export async function listRecentChatConversations(limit = 100) {
  const db = getDb();
  return await db
    .select()
    .from(chatConversations)
    .orderBy(desc(chatConversations.lastActivityAt))
    .limit(limit);
}

export async function getChatMessages(conversationId: number) {
  const db = getDb();
  return await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(asc(chatMessages.createdAt));
}

/** Per-UTC-day chat traffic for the last 14 days — sparkline data
 *  for the Chats tab. Returns [{ date, conversations, messages, tokensIn,
 *  tokensOut }]. */
export async function chatActivityLast14Days(): Promise<
  Array<{
    date: string;
    conversations: number;
    messages: number;
    tokensIn: number;
    tokensOut: number;
  }>
> {
  const db = getDb();
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const convs = await db
    .select()
    .from(chatConversations)
    .where(gte(chatConversations.startedAt, since));
  const msgs = await db
    .select()
    .from(chatMessages)
    .where(gte(chatMessages.createdAt, since));

  const buckets: Record<
    string,
    { conversations: number; messages: number; tokensIn: number; tokensOut: number }
  > = {};
  const isoDay = (d: Date) => d.toISOString().slice(0, 10);

  for (let i = 0; i < 14; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    buckets[isoDay(d)] = {
      conversations: 0,
      messages: 0,
      tokensIn: 0,
      tokensOut: 0,
    };
  }
  for (const c of convs) {
    const k = isoDay(c.startedAt);
    if (buckets[k]) buckets[k].conversations += 1;
  }
  for (const m of msgs) {
    const k = isoDay(m.createdAt);
    if (buckets[k]) {
      buckets[k].messages += 1;
      buckets[k].tokensIn += m.tokensIn ?? 0;
      buckets[k].tokensOut += m.tokensOut ?? 0;
    }
  }
  return Object.entries(buckets)
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}
