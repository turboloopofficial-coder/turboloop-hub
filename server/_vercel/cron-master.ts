// Master scheduler — runs every 5 minutes via cron-job.org pinger.
//
// Daily cadence:
//   0. Hub page promotion                    — 09:00 UTC (= 2:30 PM IST)
//      Rotates 14 pages × 3 caption variants = 42-day cycle.
//   1. Campaign A — events promo             — 10:00 UTC (= 3:30 PM IST)
//      Every-other-day, A1–A8 dated for May 15→May 29; auto-quiets after.
//   2. German channel daily                  — 11:00 UTC (= 4:30 PM IST)
//      @TurboLoopDach, rotates A1–A8 visuals with German captions + BitPat CTA.
//   3. Monthly Compounding banner            — 12:00 UTC (= 5:30 PM IST)
//      Alternates EN/DE by day-of-year parity, cycles $50→$50,000.
//   4. Campaign B — Port Harcourt countdown  — 13:00 UTC (= 6:30 PM IST)
//      B1–B6 on schedule dates May 15→May 22; B7 fires at 06:00 UTC on
//      May 23 (event morning) instead of 13:00.
//   5. Daily blog publish + Telegram announce — 14:00 UTC (= 7:30 PM IST)
//   6. Hindi/Urdu Zoom T-30 reminder         — 15:00 UTC (= 8:30 PM IST)
//   7. English Zoom T-30 reminder            — 16:30 UTC (= 10:00 PM IST)
//   8. Cinematic Universe daily film         — 18:00 UTC (= 11:30 PM IST)
//   9. Creator-Star 44-day reminder          — 19:00 UTC (= 12:30 AM IST next day)
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
import { tgBroadcastPhoto, tgSendPhoto } from "./_telegram";
import { blogPostCaption, launchAnnouncementCaption, zoomReminderCaption, pickTodaysFilm, cinematicCaption, cinematicPosterUrl, pickTodaysMonthlyBanner, monthlyBannerUrl, monthlyCompoundingCaption, pickTodaysHubPromo, hubPromoBannerUrl, type ZoomLang, type ZoomTier } from "./_messagePools";
import { getZoomConfig } from "../zoom-config";
import {
  CAMPAIGN_A,
  CAMPAIGN_B,
  todaysCampaignPost,
  todaysGermanPost,
  todayUtcDate,
} from "./_campaigns";

// Public-facing host. Used in Telegram message bodies and "Visit / Read /
// Watch" buttons that point users to the live Next.js site.
const SITE = "https://turboloop.tech";

// /api/og-banner only exists on the legacy Vercel project (api.turboloop.tech),
// not on the new Next.js app at turboloop.tech. Telegram fetches photoUrl
// server-side, so it MUST resolve to the host that actually serves the PNG.
// Public-facing URLs in captions/buttons stay on SITE.
const BANNER_HOST = "https://www.turboloop.tech";

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

/** Extract a YouTube video ID from any of the common URL shapes:
 *  youtu.be/<id>, youtube.com/watch?v=<id>, youtube.com/embed/<id>,
 *  youtube.com/shorts/<id>. Returns null on no match. */
function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("youtu.be")) return u.pathname.slice(1) || null;
    const v = u.searchParams.get("v");
    if (v) return v;
    const m = u.pathname.match(/\/(embed|shorts)\/([^/?#]+)/);
    return m ? m[2] : null;
  } catch {
    return null;
  }
}

/** Star Content Creator payout tiers — must match the public table on
 *  /creatives. Returns the highest matching tier, or null if the view
 *  count is below the $5 floor. */
const CREATOR_PAYOUT_TIERS = [
  { min: 1_000_000, payout: 1000, label: "1M views" },
  { min: 500_000,   payout: 500,  label: "500k views" },
  { min: 100_000,   payout: 300,  label: "100k views" },
  { min: 10_000,    payout: 150,  label: "10k views" },
  { min: 5_000,     payout: 80,   label: "5k views" },
  { min: 2_500,     payout: 50,   label: "2.5k views" },
  { min: 1_000,     payout: 15,   label: "1k views" },
  { min: 500,       payout: 5,    label: "500 views" },
];

function payoutTierForViews(
  views: number | null
): { payout: number; label: string } | null {
  if (views === null || !Number.isFinite(views)) return null;
  for (const t of CREATOR_PAYOUT_TIERS) {
    if (views >= t.min) return { payout: t.payout, label: t.label };
  }
  return null;
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

/**
 * Telegram broadcast policy for blog announcements:
 *
 *   • EVERY post (regardless of language) → broadcast to the Official
 *     English Channel (TELEGRAM_CHANNEL) + Official English Group
 *     (TELEGRAM_CHAT) via tgBroadcastPhoto. These two are the canonical
 *     reach destinations — the broader community sees every announcement
 *     here, in their post's native language.
 *   • DE posts ADDITIONALLY → German Group (TELEGRAM_GERMAN_CHAT) via
 *     tgSendPhoto. Same caption + banner, second send. Germans get the
 *     post once in the multilingual official destinations and once in
 *     their own group.
 *
 * No other per-language destinations exist. HI/ID/future-language posts
 * are broadcast ONLY to the Official Channel + Group — they ride the
 * shared destinations. If a per-language group is ever provisioned, add
 * a parallel `else if (language === 'xx')` send below; the broadcast
 * step above stays unchanged for every language.
 *
 * Caption + button copy are still per-language (HI/ID/DE/EN) so the
 * shared destinations carry a native-language message rather than an
 * English-only mismatch with the linked article.
 */
async function announceBlogToTelegram(
  post: typeof blogPosts.$inferSelect
): Promise<string> {
  const url = `${SITE}/blog/${post.slug}`;
  const caption = blogPostCaption({
    title: post.title,
    excerpt: post.excerpt,
    url,
    slot: "evening",
    lang: post.language,
  });
  const ctaText =
    post.language === "de" ? "📖 Artikel lesen"
    : post.language === "hi" ? "📖 पूरा लेख पढ़ें"
    : post.language === "id" ? "📖 Baca artikel lengkap"
    : "📖 Read full article";
  const photoUrl = bannerUrlBlog(post.slug, post.title);
  const buttons = [{ text: ctaText, url }];

  const destinations: string[] = [];

  // STEP 1 — Always broadcast to Official English Channel + Group.
  // tgBroadcastPhoto fans out to TELEGRAM_CHANNEL + TELEGRAM_CHAT
  // internally; we don't need to compose those addresses here.
  await tgBroadcastPhoto({
    photoUrl,
    caption,
    parseMode: "HTML",
    buttons,
  });
  destinations.push("Channel+Group");

  // STEP 2 — If the post is German, also send a second copy to the
  // German Group. This is the only per-language extra destination by
  // policy.
  if (post.language === "de") {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const germanChat = process.env.TELEGRAM_GERMAN_CHAT;
    if (token && germanChat) {
      await tgSendPhoto(token, {
        chatId: germanChat,
        photoUrl,
        caption,
        parseMode: "HTML",
        buttons,
      });
      destinations.push("DE-Group");
    } else {
      // Don't fail the whole announcement if the German env is missing
      // — the post already landed in the Official destinations.
      destinations.push("DE-Group:skipped(env)");
    }
  }
  return `📖 blog announced [${post.language}] → ${destinations.join(" + ")} · ${post.slug}`;
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

    // ─── Manual force-fire overrides ────────────────────────────────
    // Allows campaign slots to fire on demand outside their normal time
    // window. Used on launch day for each campaign when the regular
    // window has already passed by the time the cron is wired up.
    //
    // Daily dedup still applies — calling `?force=campaignA` ten times
    // on the same UTC day fires the campaign ONCE. After the first
    // force-fire, hasFiredToday returns true for the rest of the day
    // and subsequent force calls (and the natural 10:00 UTC tick) are
    // no-ops. This makes the override safe to leave public-without-auth.
    const reqUrl = new URL(req.url || "/", "http://x");
    const forceSet = new Set(
      (reqUrl.searchParams.get("force") || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
    );
    const forceCampaignA = forceSet.has("campaignA");
    const forceCampaignB = forceSet.has("campaignB");
    const forceGermanDaily = forceSet.has("germanDaily");

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

    // ============ 0. HUB PROMOTION: 09:00 UTC = 2:30 PM IST ============
    // Rotates through 14 Hub pages × 3 caption variants = 42-day cycle.
    // Each post drives traffic to a specific page with a premium banner.
    if (isInWindow(9, 0) && !(await hasFiredToday(db, "hubPromo"))) {
      const promo = pickTodaysHubPromo();
      await tgBroadcastPhoto({
        photoUrl: hubPromoBannerUrl(promo),
        caption: promo.caption,
        parseMode: "HTML",
        buttons: [{ text: promo.buttonText, url: promo.buttonUrl }],
      });
      await markFired(db, "hubPromo");
      log.push(`🌐 Hub promo — ${promo.page}`);
    }

    // ============ 1. MONTHLY COMPOUNDING BANNER: 12:00 UTC = 5:30 PM IST ============
    // Cycles through 20 banners (10 EN amounts + 10 DE amounts) by
    // day-of-year. Each language routes to its own channel:
    //   EN banners → tgBroadcastPhoto (TELEGRAM_CHANNEL + TELEGRAM_CHAT, English audience)
    //   DE banners → tgSendPhoto to TELEGRAM_GERMAN_CHAT (German-only)
    // Pre-2026-05-18 fix this branch broadcast DE captions to the EN
    // channels — ~50% of monthly:compound posts were landing in the
    // wrong audience. See Task G in the 7-task plan.
    if (isInWindow(12, 0) && !(await hasFiredToday(db, "monthly:compound"))) {
      const banner = pickTodaysMonthlyBanner();
      const caption = monthlyCompoundingCaption(banner);
      const button = {
        text:
          banner.lang === "de"
            ? "💸 Yield-Rechner öffnen"
            : "💸 Open the yield calculator",
        url: `${SITE}/calculator`,
      };
      const photoUrl = monthlyBannerUrl(banner);
      const label =
        typeof banner.key === "number" ? `$${banner.key}` : banner.key;

      if (banner.lang === "de") {
        // German monthly post — German chat ONLY. If the env var isn't
        // set we skip (don't fall back to English broadcast — that's
        // the exact bug we just removed).
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const germanChat = process.env.TELEGRAM_GERMAN_CHAT;
        if (token && germanChat) {
          const r = await tgSendPhoto(token, {
            chatId: germanChat,
            photoUrl,
            caption,
            parseMode: "HTML",
            buttons: [button],
          });
          log.push(
            `💵 Monthly compound — DE ${label} → ${germanChat}` +
              (r.ok ? "" : ` (failed: ${r.error})`)
          );
        } else {
          log.push(
            `💵 Monthly compound — DE ${label} SKIPPED (TELEGRAM_GERMAN_CHAT or TELEGRAM_BOT_TOKEN missing)`
          );
        }
      } else {
        await tgBroadcastPhoto({
          photoUrl,
          caption,
          parseMode: "HTML",
          buttons: [button],
        });
        log.push(`💵 Monthly compound — EN ${label}`);
      }
      await markFired(db, "monthly:compound");
    }

    // ============ 2. DAILY BLOG: 14:00 UTC = 7:30 PM IST ============
    // Per-post language routing — announceBlogToTelegram returns a
    // status string showing which channel (EN broadcast / DE / HI / ID)
    // actually received the post, or a "skipped" notice when the lang
    // has no provisioned channel yet. The status flows into the cron
    // response body so it's visible in Vercel logs without digging.
    if (isInWindow(14, 0) && !(await hasFiredToday(db, "blog:evening"))) {
      const due = await publishOverdueBlogs(db);
      if (due.length > 0) {
        for (const post of due) {
          const status = await announceBlogToTelegram(post);
          log.push(status);
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
    // Zoom link + passcode now resolve through getZoomConfig (Task C),
    // which reads admin overrides from `site_settings` and falls back
    // to the hardcoded ZOOM_HI defaults if unset or invalid.
    if (isInWindow(15, 0) && !(await hasFiredToday(db, "zoom:hi:T30"))) {
      const cfg = await getZoomConfig("hi");
      await sendZoomReminder("hi", "T30", cfg.link, cfg.passcode, cfg.timeLabel);
      await markFired(db, "zoom:hi:T30");
      log.push("🎙 HI Zoom T-30");
    }

    // ============ 4. ENGLISH ZOOM T-30: 16:30 UTC = 10:00 PM IST ============
    if (isInWindow(16, 30) && !(await hasFiredToday(db, "zoom:en:T30"))) {
      const cfg = await getZoomConfig("en");
      await sendZoomReminder("en", "T30", cfg.link, cfg.passcode, cfg.timeLabel);
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

    // ============ 6. CREATOR STAR — 44-day view-count reminder ============
    // Fires once per approved creator_apply submission, on the first
    // cron tick after the row is 44 days old. Pulls fresh view counts
    // from YouTube, persists them, then DMs ops the suggested payout
    // tier so they can move the row to payment_due.
    //
    // Run window: 19:00 UTC (right after the cinematic post). We use
    // hasFiredEver(`creatorReminder:<id>`) so each row triggers exactly
    // once across the entire project lifetime — no daily de-dup needed.
    if (isInWindow(19, 0)) {
      const { contentSubmissions } = await import("../../drizzle/schema");
      const fortyFourDaysAgo = new Date(Date.now() - 44 * 24 * 60 * 60 * 1000);

      // Pull approved creator_apply rows ≥ 44 days old that haven't
      // had their reminder yet. Limit 25/run so a backlog doesn't
      // exhaust YouTube quota in a single tick.
      const dueRows = await db
        .select()
        .from(contentSubmissions)
        .where(
          and(
            eq(contentSubmissions.type, "creator_apply"),
            eq(contentSubmissions.status, "approved"),
            lte(contentSubmissions.createdAt, fortyFourDaysAgo)
          )
        )
        .limit(25);

      const apiKey = process.env.YOUTUBE_API_KEY;
      const tgToken = process.env.TELEGRAM_BOT_TOKEN;
      // Creator reminders go to the same submissions group as the
      // original creator_apply notification — not the support group
      // that handles event applications.
      const supportChat = process.env.TELEGRAM_SUBMISSIONS_CHAT;

      for (const row of dueRows) {
        if (await hasFiredEver(db, `creatorReminder:${row.id}`)) continue;

        // 1. Refresh view count from YouTube (if we have a URL + key).
        let viewCount: number | null = row.viewCount ?? null;
        if (apiKey && row.youtubeUrl) {
          const id = extractYoutubeId(row.youtubeUrl);
          if (id) {
            try {
              const url = new URL("https://www.googleapis.com/youtube/v3/videos");
              url.searchParams.set("part", "statistics");
              url.searchParams.set("id", id);
              url.searchParams.set("key", apiKey);
              const r = await fetch(url.toString());
              if (r.ok) {
                const j = (await r.json()) as any;
                const raw = j?.items?.[0]?.statistics?.viewCount;
                const parsed = raw ? parseInt(raw, 10) : NaN;
                if (Number.isFinite(parsed)) {
                  viewCount = parsed;
                  await db
                    .update(contentSubmissions)
                    .set({
                      viewCount: parsed,
                      viewCountCheckedAt: new Date(),
                    })
                    .where(eq(contentSubmissions.id, row.id));
                }
              }
            } catch (e) {
              // Non-fatal — we'll send the reminder with whatever the
              // last known view count was.
            }
          }
        }

        // 2. Compute suggested payout tier.
        const tier = payoutTierForViews(viewCount);

        // 3. Send the Telegram reminder.
        if (tgToken && supportChat) {
          const lines = [
            `⭐ <b>Creator 44-day check (#${row.id})</b>`,
            "",
            `<b>Name:</b> ${row.authorName}`,
            row.authorContact ? `<b>Contact:</b> ${row.authorContact}` : null,
            row.walletAddress ? `<b>Wallet:</b> <code>${row.walletAddress}</code>` : `<b>Wallet:</b> <i>none on file</i>`,
            row.youtubeUrl ? `<b>Video:</b> ${row.youtubeUrl}` : `<b>Video:</b> <i>no URL on file</i>`,
            viewCount !== null
              ? `<b>Views:</b> ${viewCount.toLocaleString()}`
              : `<b>Views:</b> <i>unknown</i>`,
            tier
              ? `<b>Suggested payout:</b> $${tier.payout} (${tier.label} tier)`
              : `<b>Suggested payout:</b> below the $5 floor — no payout yet`,
          ].filter(Boolean);
          await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: supportChat,
              text: lines.join("\n"),
              parse_mode: "HTML",
            }),
          }).catch(() => {});
        }

        await markFiredEver(db, `creatorReminder:${row.id}`);
        log.push(`⭐ Creator reminder fired — submission #${row.id}`);
      }
    }

    // ============ 7. CAMPAIGN A — events page promo, 10:00 UTC every 2 days ============
    // Picks today's scheduled A1–A8 post by exact date match (each post
    // has a fixed `date` in _campaigns.ts). The campaign self-terminates
    // after A8 fires on May 29 because todaysCampaignPost returns null
    // for any subsequent UTC date.
    if ((isInWindow(10, 0) || forceCampaignA) && !(await hasFiredToday(db, "campaignA"))) {
      const post = todaysCampaignPost(CAMPAIGN_A);
      if (post) {
        await tgBroadcastPhoto({
          photoUrl: post.photoUrl,
          caption: post.caption,
          parseMode: "HTML",
          buttons: [{ text: post.buttonText, url: post.buttonUrl }],
        });
        await markFired(db, "campaignA");
        log.push(`📣 Campaign A — ${post.id} (${post.date})`);
      } else {
        log.push(`📣 Campaign A — no post scheduled for ${todayUtcDate()}`);
        // Still mark fired so we don't re-evaluate on every 5-min tick.
        await markFired(db, "campaignA");
      }
    }

    // ============ 8. GERMAN CHANNEL DAILY — 11:00 UTC, @TurboLoopDach ============
    // Rotates the A1–A8 visuals on an 8-day cycle with German captions
    // and a BitPat referral CTA appended. Sends ONLY to the German chat
    // (TELEGRAM_GERMAN_CHAT) — bypasses tgBroadcastPhoto's default
    // channel/chat pair on purpose so the English channels don't see
    // duplicate German content.
    if ((isInWindow(11, 0) || forceGermanDaily) && !(await hasFiredToday(db, "germanDaily"))) {
      const post = todaysGermanPost();
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const germanChat = process.env.TELEGRAM_GERMAN_CHAT;
      if (token && germanChat) {
        const r = await tgSendPhoto(token, {
          chatId: germanChat,
          photoUrl: post.photoUrl,
          caption: post.caption,
          parseMode: "HTML",
          buttons: [{ text: post.buttonText, url: post.buttonUrl }],
        });
        await markFired(db, "germanDaily");
        log.push(
          `🇩🇪 German daily — ${post.id}` +
            (r.ok ? "" : ` (failed: ${r.error})`)
        );
      } else {
        log.push(
          "🇩🇪 German daily — skipped (TELEGRAM_GERMAN_CHAT or TELEGRAM_BOT_TOKEN missing)"
        );
      }
    }

    // ============ 9. CAMPAIGN B — Port Harcourt countdown ============
    //   Standard slot: 13:00 UTC for B1–B6
    //   Event-day slot: 06:00 UTC for B7 only (event-morning post)
    //
    // We branch on the today's scheduled post's id so the data file
    // remains the single source of truth for which post fires when.
    {
      const post = todaysCampaignPost(CAMPAIGN_B);
      if (post) {
        const isEventMorning = post.id === "B7";
        const slot = isEventMorning ? { h: 6, m: 0 } : { h: 13, m: 0 };
        if (
          (isInWindow(slot.h, slot.m) || forceCampaignB) &&
          !(await hasFiredToday(db, "campaignB"))
        ) {
          await tgBroadcastPhoto({
            photoUrl: post.photoUrl,
            caption: post.caption,
            parseMode: "HTML",
            buttons: [{ text: post.buttonText, url: post.buttonUrl }],
          });
          await markFired(db, "campaignB");
          log.push(`🇳🇬 Campaign B — ${post.id} (${post.date})`);
        }
      }
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, ranAt: new Date().toISOString(), fired: log }));
  } catch (err: any) {
    console.error("[cron-master]", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: String(err?.message || err), log }));
  }
}
