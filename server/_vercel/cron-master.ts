// Master scheduler — runs every 5 minutes via cron-job.org pinger.
//
// Daily cadence (5 messages/day):
//   1. Monthly Compounding banner            — 12:00 UTC (= 5:30 PM IST)
//      Alternates EN/DE by day-of-year parity, cycles $50→$50,000.
//   2. Daily blog publish + Telegram announce — 14:00 UTC (= 7:30 PM IST)
//   3. Hindi/Urdu Zoom T-30 reminder         — 15:00 UTC (= 8:30 PM IST)
//   4. English Zoom T-30 reminder            — 16:30 UTC (= 10:00 PM IST)
//   5. Cinematic Universe daily film         — 18:00 UTC (= 11:30 PM IST)
//
// One-shot tasks (fire once total, ever):
//   - Site launch announcement: targets LAUNCH_FIRE_AT_UTC (set below)
//
// De-duplication via site_settings table — each task has a key like
// `lastFired:zoom:en:T30:2026-04-29` so each task only sends once per day.
// One-shot tasks use a date-less key so they only fire once across all time.

import type { IncomingMessage, ServerResponse } from "node:http";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq, lte, isNotNull } from "drizzle-orm";
import { blogPosts, siteSettings } from "../../drizzle/schema";
import { tgBroadcastPhoto } from "./_telegram";
import { blogPostCaption, launchAnnouncementCaption, zoomReminderCaption, pickTodaysFilm, cinematicCaption, cinematicPosterUrl, pickTodaysMonthlyBanner, monthlyBannerUrl, monthlyCompoundingCaption, type ZoomLang, type ZoomTier } from "./_messagePools";
import { ZOOM_EN, ZOOM_HI } from "../../shared/zoomEvents";

// Public-facing host. Used in Telegram message bodies and "Visit / Read /
// Watch" buttons that point users to the live Next.js site.
const SITE = "https://turboloop.tech";

// /api/og-banner only exists on the legacy Vercel project (api.turboloop.tech),
// not on the new Next.js app at turboloop.tech. Telegram fetches photoUrl
// server-side, so it MUST resolve to the host that actually serves the PNG.
// Public-facing URLs in captions/buttons stay on SITE.
const BANNER_HOST = "https://api.turboloop.tech";

// One-shot launch announcement target — fires at this UTC moment, then never again.
// Format: ISO 8601. The cron pings every 5 min so actual fire is within 5 min of this.
const LAUNCH_FIRE_AT_UTC = "2026-04-29T12:00:00.000Z";
const LAUNCH_GRACE_HOURS = 6; // window after target during which we still fire (in case of deploy delays)

// Real PNG banner endpoints (Edge runtime, @vercel/og generates fresh PNG per request).
// Daily palette rotation = "different banner every day" automatically.
function bannerUrlBlog(slug: string, title: string): string {
  return `${BANNER_HOST}/api/og-banner?type=blog&slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(title)}`;
}
function bannerUrlZoom(lang: ZoomLang): string {
  return `${BANNER_HOST}/api/og-banner?type=zoom&lang=${lang}`;
}
function bannerUrlLaunch(): string {
  return `${BANNER_HOST}/api/og-banner?type=launch`;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

async function hasFiredToday(db: ReturnType<typeof drizzle>, key: string): Promise<boolean> {
  const fullKey = `lastFired:${key}:${todayKey()}`;
  const r = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, fullKey)).limit(1);
  return r.length > 0;
}

async function markFired(db: ReturnType<typeof drizzle>, key: string): Promise<void> {
  const fullKey = `lastFired:${key}:${todayKey()}`;
  await db
    .insert(siteSettings)
    .values({ settingKey: fullKey, settingValue: new Date().toISOString() })
    .onConflictDoNothing();
}

// One-shot variants (no date suffix — fires once total, ever)
async function hasFiredEver(db: ReturnType<typeof drizzle>, key: string): Promise<boolean> {
  const fullKey = `oneShot:${key}`;
  const r = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, fullKey)).limit(1);
  return r.length > 0;
}

async function markFiredEver(db: ReturnType<typeof drizzle>, key: string): Promise<void> {
  const fullKey = `oneShot:${key}`;
  await db
    .insert(siteSettings)
    .values({ settingKey: fullKey, settingValue: new Date().toISOString() })
    .onConflictDoNothing();
}

function isInWindow(targetHour: number, targetMin: number, graceMin = 4): boolean {
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(targetHour, targetMin, 0, 0);
  const diffMin = Math.abs((now.getTime() - target.getTime()) / 60_000);
  return diffMin <= graceMin && now >= target;
}

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

async function announceBlogToTelegram(post: typeof blogPosts.$inferSelect): Promise<void> {
  const url = `${SITE}/blog/${post.slug}`;
  const caption = blogPostCaption({
    title: post.title,
    excerpt: post.excerpt,
    url,
    slot: "evening",
  });
  await tgBroadcastPhoto({
    photoUrl: bannerUrlBlog(post.slug, post.title),
    caption,
    parseMode: "HTML",
    buttons: [{ text: "📖 Read full article", url }],
  });
}

async function sendZoomReminder(lang: ZoomLang, tier: ZoomTier, meetingLink: string, passcode: string, timeLabel: string): Promise<void> {
  const caption = zoomReminderCaption({ lang, tier, meetingLink, passcode, timeLabel });
  await tgBroadcastPhoto({
    photoUrl: bannerUrlZoom(lang),
    caption,
    parseMode: "HTML",
    buttons: [{ text: "🎙 Join Zoom now", url: meetingLink }],
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const log: string[] = [];
  res.setHeader("Content-Type", "application/json");
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL missing");
    const db = drizzle(neon(dbUrl));

    // ============ 0. ONE-SHOT: SITE LAUNCH ANNOUNCEMENT ============
    // Fires once when current time >= LAUNCH_FIRE_AT_UTC and within grace window,
    // then never again (de-duplicated via oneShot:launch:announcement key).
    // Scheduled in the morning (12:00 UTC) so it doesn't collide with the
    // 14:00/15:00/16:30 UTC evening cluster.
    {
      const fireAt = new Date(LAUNCH_FIRE_AT_UTC);
      const now = new Date();
      const graceEnd = new Date(fireAt.getTime() + LAUNCH_GRACE_HOURS * 60 * 60 * 1000);
      const inWindow = now >= fireAt && now <= graceEnd;
      if (inWindow && !(await hasFiredEver(db, "launch:announcement"))) {
        const caption = launchAnnouncementCaption();
        await tgBroadcastPhoto({
          photoUrl: bannerUrlLaunch(),
          caption,
          parseMode: "HTML",
          buttons: [{ text: "🌐 Visit turboloop.tech", url: SITE }],
        });
        await markFiredEver(db, "launch:announcement");
        log.push(`🚀 Launch announcement fired (target ${LAUNCH_FIRE_AT_UTC})`);
      }
    }

    // ============ 1. MONTHLY COMPOUNDING BANNER: 12:00 UTC = 5:30 PM IST ============
    // Alternates EN/DE by day-of-year parity; cycles through 10 amounts each.
    if (isInWindow(12, 0) && !(await hasFiredToday(db, "monthly:compound"))) {
      const banner = pickTodaysMonthlyBanner();
      const caption = monthlyCompoundingCaption(banner);
      await tgBroadcastPhoto({
        photoUrl: monthlyBannerUrl(banner),
        caption,
        parseMode: "HTML",
        buttons: [
          {
            text: banner.lang === "de"
              ? "💸 Yield-Rechner öffnen"
              : "💸 Open the yield calculator",
            url: `${SITE}/yield-calculator`,
          },
        ],
      });
      await markFired(db, "monthly:compound");
      log.push(`💵 Monthly compound — ${banner.lang.toUpperCase()} $${banner.monthly}`);
    }

    // ============ 2. DAILY BLOG: 14:00 UTC = 7:30 PM IST ============
    if (isInWindow(14, 0) && !(await hasFiredToday(db, "blog:evening"))) {
      const due = await publishOverdueBlogs(db);
      if (due.length > 0) {
        for (const post of due) {
          await announceBlogToTelegram(post);
          log.push(`📰 Daily blog → ${post.slug}`);
        }
      } else {
        log.push("📰 No overdue blog posts to publish");
      }
      await markFired(db, "blog:evening");
    }

    // Safety net: always catch up overdue posts (idempotent — won't double-announce
    // because hasFiredToday gates the Telegram call)
    await publishOverdueBlogs(db);

    // ============ 3. HINDI/URDU ZOOM T-30: 15:00 UTC = 8:30 PM IST ============
    if (isInWindow(15, 0) && !(await hasFiredToday(db, "zoom:hi:T30"))) {
      await sendZoomReminder("hi", "T30", ZOOM_HI.link, ZOOM_HI.passcode, ZOOM_HI.timeLabel);
      await markFired(db, "zoom:hi:T30");
      log.push("🎙 HI Zoom T-30");
    }

    // ============ 4. ENGLISH ZOOM T-30: 16:30 UTC = 10:00 PM IST ============
    if (isInWindow(16, 30) && !(await hasFiredToday(db, "zoom:en:T30"))) {
      await sendZoomReminder("en", "T30", ZOOM_EN.link, ZOOM_EN.passcode, ZOOM_EN.timeLabel);
      await markFired(db, "zoom:en:T30");
      log.push("🎙 EN Zoom T-30");
    }

    // ============ 5. CINEMATIC FILM (rotates daily): 18:00 UTC = 11:30 PM IST ============
    if (isInWindow(18, 0) && !(await hasFiredToday(db, "cinematic:daily"))) {
      const film = pickTodaysFilm();
      await tgBroadcastPhoto({
        photoUrl: cinematicPosterUrl(film),
        caption: cinematicCaption(film),
        parseMode: "HTML",
        buttons: [{ text: "🎬 Watch full film", url: `${SITE}/films/${film.slug}` }],
      });
      await markFired(db, "cinematic:daily");
      log.push(`🎬 Cinematic — S${film.season}E${film.episode}: ${film.slug}`);
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, ranAt: new Date().toISOString(), fired: log }));
  } catch (err: any) {
    console.error("[cron-master]", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: String(err?.message || err), log }));
  }
}
