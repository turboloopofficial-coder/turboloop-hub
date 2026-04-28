// Master scheduler — runs every 5 minutes via Vercel cron, decides what to fire.
//
// Handles ALL scheduled automations in one cron slot:
//   1. Blog publishing (2 slots per day): 04:00 UTC + 14:00 UTC
//   2. Telegram blog announcement (immediately after publish)
//   3. Zoom reminders (4 tiers × 2 languages = 8 reminders/day):
//      - English Zoom (5 PM UTC = 17:00 UTC):
//          T-60 → 16:00 UTC
//          T-30 → 16:30 UTC
//          T-15 → 16:45 UTC
//          T-0  → 17:00 UTC
//      - Hindi/Urdu Zoom (9 PM IST = 15:30 UTC):
//          T-60 → 14:30 UTC
//          T-30 → 15:00 UTC
//          T-15 → 15:15 UTC
//          T-0  → 15:30 UTC
//
// De-duplication: stores "lastFired:<key>:YYYY-MM-DD" in site_settings table.
// If today's key already exists, skip. So even if cron fires multiple times in
// the same window, each task only sends once per day.

import type { IncomingMessage, ServerResponse } from "node:http";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq, lte, isNotNull } from "drizzle-orm";
import { blogPosts, siteSettings } from "../../drizzle/schema";
import { tgBroadcastPhoto } from "./_telegram";
import { blogPostCaption, zoomReminderCaption, type ZoomLang, type ZoomTier } from "./_messagePools";

const SITE = "https://turboloop.tech";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

async function hasFiredToday(db: ReturnType<typeof drizzle>, key: string): Promise<boolean> {
  const fullKey = `lastFired:${key}:${todayKey()}`;
  const r = await db.select().from(siteSettings).where(eq(siteSettings.key, fullKey)).limit(1);
  return r.length > 0;
}

async function markFired(db: ReturnType<typeof drizzle>, key: string): Promise<void> {
  const fullKey = `lastFired:${key}:${todayKey()}`;
  await db
    .insert(siteSettings)
    .values({ key: fullKey, value: new Date().toISOString() })
    .onConflictDoNothing();
}

/**
 * Did the current UTC time cross a given target window?
 * Returns true if we're WITHIN the window (target ± grace) — for a cron running every 5 min,
 * grace=4 minutes catches the fire even if cron runs slightly off-schedule.
 */
function isInWindow(targetHour: number, targetMin: number, graceMin = 4): boolean {
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(targetHour, targetMin, 0, 0);
  const diffMin = Math.abs((now.getTime() - target.getTime()) / 60_000);
  return diffMin <= graceMin && now >= target;
}

/** Publish overdue scheduled blogs (idempotent — only those due) */
async function publishOverdueBlogs(db: ReturnType<typeof drizzle>): Promise<typeof blogPosts.$inferSelect[]> {
  const now = new Date();
  const due = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.published, false), isNotNull(blogPosts.scheduledPublishAt), lte(blogPosts.scheduledPublishAt, now)));

  for (const post of due) {
    await db.update(blogPosts).set({ published: true }).where(eq(blogPosts.id, post.id));
  }
  return due;
}

async function announceBlogToTelegram(post: typeof blogPosts.$inferSelect, slot: "morning" | "evening"): Promise<void> {
  const url = `${SITE}/blog/${post.slug}`;
  const photoUrl = `${SITE}/api/og?slug=${encodeURIComponent(post.slug)}`;
  const caption = blogPostCaption({
    title: post.title,
    excerpt: post.excerpt,
    url,
    slot,
  });
  await tgBroadcastPhoto({
    photoUrl,
    caption,
    parseMode: "HTML",
    buttons: [{ text: "📖 Read full article", url }],
  });
}

async function sendZoomReminder(lang: ZoomLang, tier: ZoomTier, meetingLink: string, passcode: string, timeLabel: string): Promise<void> {
  const photoUrl = `${SITE}/api/og-zoom?lang=${lang}&tier=${tier}`;
  const caption = zoomReminderCaption({ lang, tier, meetingLink, passcode, timeLabel });
  await tgBroadcastPhoto({
    photoUrl,
    caption,
    parseMode: "HTML",
    buttons: [{ text: "🎙 Join Zoom now", url: meetingLink }],
  });
}

const ZOOM_EN = {
  link: "https://us06web.zoom.us/j/8347511147?pwd=g6wTqhrngaUDNbMasv9LE8iJQOSJua.1",
  passcode: "669529",
  timeLabel: "5:00 PM UTC daily · 30 min",
};
const ZOOM_HI = {
  link: "https://us06web.zoom.us/j/4455663232?pwd=vHG9ahPKpl238DfyE0LpoRGUj91ULB.1",
  passcode: "1234",
  timeLabel: "9:00 PM IST daily · 30 min",
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const log: string[] = [];
  res.setHeader("Content-Type", "application/json");
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL missing");
    const db = drizzle(neon(dbUrl));

    // ============ 1. BLOG PUBLISHING + TELEGRAM ANNOUNCE ============
    // Morning slot: 04:00 UTC = 9:30 AM IST
    if (isInWindow(4, 0)) {
      if (!await hasFiredToday(db, "blog:morning")) {
        const due = await publishOverdueBlogs(db);
        if (due.length > 0) {
          for (const post of due) {
            await announceBlogToTelegram(post, "morning");
            log.push(`📰 Morning blog → ${post.slug}`);
          }
        } else {
          log.push("📰 Morning slot: no overdue posts");
        }
        await markFired(db, "blog:morning");
      }
    }

    // Evening slot: 14:00 UTC = 7:30 PM IST
    if (isInWindow(14, 0)) {
      if (!await hasFiredToday(db, "blog:evening")) {
        const due = await publishOverdueBlogs(db);
        if (due.length > 0) {
          for (const post of due) {
            await announceBlogToTelegram(post, "evening");
            log.push(`🌙 Evening blog → ${post.slug}`);
          }
        } else {
          log.push("🌙 Evening slot: no overdue posts");
        }
        await markFired(db, "blog:evening");
      }
    }

    // Safety net: ALWAYS catch up overdue posts even outside slots (publishing is idempotent)
    // Won't announce again because hasFiredToday is per-slot
    await publishOverdueBlogs(db);

    // ============ 2. ZOOM REMINDERS ============

    // Hindi/Urdu Zoom: 9 PM IST = 15:30 UTC
    if (isInWindow(14, 30) && !await hasFiredToday(db, "zoom:hi:T60")) {
      await sendZoomReminder("hi", "T60", ZOOM_HI.link, ZOOM_HI.passcode, ZOOM_HI.timeLabel);
      await markFired(db, "zoom:hi:T60");
      log.push("🎙 HI T-60");
    }
    if (isInWindow(15, 0) && !await hasFiredToday(db, "zoom:hi:T30")) {
      await sendZoomReminder("hi", "T30", ZOOM_HI.link, ZOOM_HI.passcode, ZOOM_HI.timeLabel);
      await markFired(db, "zoom:hi:T30");
      log.push("🎙 HI T-30");
    }
    if (isInWindow(15, 15) && !await hasFiredToday(db, "zoom:hi:T15")) {
      await sendZoomReminder("hi", "T15", ZOOM_HI.link, ZOOM_HI.passcode, ZOOM_HI.timeLabel);
      await markFired(db, "zoom:hi:T15");
      log.push("🎙 HI T-15");
    }
    if (isInWindow(15, 30) && !await hasFiredToday(db, "zoom:hi:LIVE")) {
      await sendZoomReminder("hi", "LIVE", ZOOM_HI.link, ZOOM_HI.passcode, ZOOM_HI.timeLabel);
      await markFired(db, "zoom:hi:LIVE");
      log.push("🔴 HI LIVE");
    }

    // English Zoom: 5 PM UTC = 17:00 UTC
    if (isInWindow(16, 0) && !await hasFiredToday(db, "zoom:en:T60")) {
      await sendZoomReminder("en", "T60", ZOOM_EN.link, ZOOM_EN.passcode, ZOOM_EN.timeLabel);
      await markFired(db, "zoom:en:T60");
      log.push("🎙 EN T-60");
    }
    if (isInWindow(16, 30) && !await hasFiredToday(db, "zoom:en:T30")) {
      await sendZoomReminder("en", "T30", ZOOM_EN.link, ZOOM_EN.passcode, ZOOM_EN.timeLabel);
      await markFired(db, "zoom:en:T30");
      log.push("🎙 EN T-30");
    }
    if (isInWindow(16, 45) && !await hasFiredToday(db, "zoom:en:T15")) {
      await sendZoomReminder("en", "T15", ZOOM_EN.link, ZOOM_EN.passcode, ZOOM_EN.timeLabel);
      await markFired(db, "zoom:en:T15");
      log.push("🎙 EN T-15");
    }
    if (isInWindow(17, 0) && !await hasFiredToday(db, "zoom:en:LIVE")) {
      await sendZoomReminder("en", "LIVE", ZOOM_EN.link, ZOOM_EN.passcode, ZOOM_EN.timeLabel);
      await markFired(db, "zoom:en:LIVE");
      log.push("🔴 EN LIVE");
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, ranAt: new Date().toISOString(), fired: log }));
  } catch (err: any) {
    console.error("[cron-master]", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: String(err?.message || err), log }));
  }
}
