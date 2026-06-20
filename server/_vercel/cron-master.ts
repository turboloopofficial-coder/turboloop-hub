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
import { and, asc, eq, like, lte, isNotNull } from "drizzle-orm";
import { blogPosts, siteSettings, scheduledPosts } from "../../drizzle/schema";
import { tgBroadcastPhoto, tgSendPhoto, tgBroadcastVideo, tgSendVideo, tgBroadcastMessage } from "./_telegram";
// _campaignSchedule is no longer imported — campaign slots are defined inline below
import { blogPostCaption, launchAnnouncementCaption, zoomReminderCaption, pickTodaysFilm, cinematicCaption, cinematicPosterUrl, pickTodaysMonthlyBanner, monthlyBannerUrl, monthlyCompoundingCaption, pickTodaysHubPromo, hubPromoBannerUrl, pickHubPromoByPages, MONTHLY_COMPOUND_BANNERS, pickByDay, campaignBannerUrl, CAMPAIGN_LIFESTYLE_CAPTIONS, CAMPAIGN_TOKEN_CAPTIONS, CAMPAIGN_REFERRAL_CAPTIONS, CAMPAIGN_OBJECTION_CAPTIONS, CAMPAIGN_HINDI_CAPTIONS, CAMPAIGN_NIGERIAN_CAPTIONS, CAMPAIGN_SUCCESS_CAPTIONS, CAMPAIGN_EDUCATION_CAPTIONS, CAMPAIGN_URGENCY_CAPTIONS, CAMPAIGN_BUYBACK_CAPTIONS, CAMPAIGN_COMPARISON_CAPTIONS, CAMPAIGN_COMMUNITY_CAPTIONS, CAMPAIGN_SPANISH_CAPTIONS, CAMPAIGN_INDONESIAN_CAPTIONS, CAMPAIGN_CHINESE_CAPTIONS, CAMPAIGN_ITALIAN_CAPTIONS, CAMPAIGN_ARABIC_CAPTIONS, CAMPAIGN_URDU_CAPTIONS, CAMPAIGN_GERMAN_CAPTIONS, type ZoomLang, type ZoomTier } from "./_messagePools";
import { getZoomConfig } from "../zoom-config";
import {
  CAMPAIGN_A,
  CAMPAIGN_B,
  todaysCampaignPost,
  todaysGermanPost,
  todayUtcDate,
} from "./_campaigns";

// --- Manus API Milestone Banner Generator ---
// Triggers a silent background task in Manus to generate the banner using the turboloop-imagegen skill,
// upload it to R2, and post it to Telegram.
async function triggerManusMilestoneTask(milestoneType: string, milestoneValue: number, filename: string): Promise<string | null> {
  if (!process.env.MANUS_API_KEY || !process.env.MANUS_PROJECT_ID) {
    console.error("[cron-master] MANUS_API_KEY or MANUS_PROJECT_ID missing, cannot trigger Manus");
    return null;
  }

  const prompt = `A new milestone has been crossed: ${milestoneValue} ${milestoneType}!

Please generate a cinematic milestone banner using the exact turboloop-imagegen skill rules.
You MUST use the generate_image tool with the gpt-image-2 model.

CRITICAL LOGO RULE:
You MUST pass this exact reference file to the generate_image tool:
references: ["/home/ubuntu/skills/turboloop-imagegen/templates/turboloop_logo_official.png"]

PROMPT TEMPLATE TO USE FOR THE IMAGE:
\"\"\"
Ultra-premium DeFi milestone celebration banner 16:9.
DESIGN SYSTEM: Style=CINEMATIC, Palette=NAVY-GOLD, Layout=HERO-CENTER.
The TurboLoop logo (exact spiral swirl icon in teal/cyan/purple gradient + 'Turbo' in white bold + 'Loop' in cyan bold) placed small and clean in the TOP-LEFT corner, directly on the dark background — NO box, NO panel, NO rectangle behind it.
BOTTOM-RIGHT: small text 'turboloop.io' in white.
A massive, glowing, cinematic 3D rendering of the number "${milestoneValue}" in the center, surrounded by gold and cyan energy particles.
Below the number, bold glowing text: "${milestoneType}".
This banner must be visually DISTINCT from all others — unique style, unique palette, unique composition.
Ultra premium, cinematic quality.
\"\"\"

STEP 1: Generate the image using the generate_image tool as described above.

STEP 2: Upload the generated PNG to R2.
- Use boto3 with credentials from /home/ubuntu/.turboloop/secrets.env
- Upload to key: brand/milestones/${filename}
- The public URL will be: https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/brand/milestones/${filename}

That is all. Do NOT post to Telegram.`;

  try {
    console.log(`[cron-master] Triggering Manus API for ${milestoneValue} ${milestoneType}...`);
    const res = await fetch("https://api.manus.ai/v2/task.create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-manus-api-key": process.env.MANUS_API_KEY,
      },
      body: JSON.stringify({
        message: { content: prompt },
        project_id: process.env.MANUS_PROJECT_ID,
        hide_in_task_list: true,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error("[cron-master] Manus API error:", await res.text());
      return null;
    }

    const data = await res.json();
    console.log(`[cron-master] Manus task created successfully: ${data.task_id}`);
    return data.task_id;
  } catch (err) {
    console.error("[cron-master] Failed to trigger Manus API:", err);
    return null;
  }
}

// Helper to poll R2 until the image is ready, then post to Telegram
async function pollAndPostMilestone(filename: string, caption: string): Promise<void> {
  const url = `https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/brand/milestones/${filename}`;
  console.log(`[cron-master] Polling R2 for ${filename}...`);
  
  // Poll every 10 seconds for up to 3 minutes (18 attempts)
  for (let i = 0; i < 18; i++) {
    await new Promise(r => setTimeout(r, 10000));
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) {
        console.log(`[cron-master] Image found on R2! Posting to Telegram...`);
        await tgBroadcastPhoto({ photoUrl: url, caption, parseMode: "HTML" });
        console.log(`[cron-master] Telegram post successful.`);
        return;
      }
    } catch (e) {
      // ignore fetch errors during polling
    }
  }
  console.error(`[cron-master] Timed out waiting for ${filename} on R2. Telegram post aborted.`);
}
// --------------------------------------------------

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

// Temporary EN Zoom time override — set to a UTC date string (YYYY-MM-DD) to shift
// the EN call 1 hour earlier on that specific day. Automatically reverts the next day.
// Set to null to always use the normal 17:00 UTC schedule.
const EN_ZOOM_EARLY_DATE: string | null = null; // Set to "YYYY-MM-DD" on early-session days only

/** Returns true if today (UTC) matches the early-zoom override date. */
function isEnZoomEarlyToday(): boolean {
  if (!EN_ZOOM_EARLY_DATE) return false;
  return new Date().toISOString().slice(0, 10) === EN_ZOOM_EARLY_DATE;
}

// Real PNG banner endpoints (Edge runtime, @vercel/og generates fresh PNG per request).
// Daily palette rotation = "different banner every day" automatically.
function bannerUrlBlog(slug: string, title: string): string {
  return `${BANNER_HOST}/api/og-banner?type=blog&slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(title)}`;
}
// Static R2 zoom banners — 3 variants per tier/lang, rotated by day-of-year.
// Generated with cairosvg locally and uploaded to R2 for reliable Telegram delivery.
const R2_ZOOM = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo";
function bannerUrlZoom(lang: ZoomLang, tier: "T60"|"T30"|"T15"|"LIVE"|"T0" = "T30"): string {
  const t = tier === "T0" ? "live" : tier.toLowerCase(); // normalise T0→live
  const v = (Math.floor(Date.now() / 86_400_000) % 3) + 1; // 1-3 daily rotation
  return `${R2_ZOOM}/hub-promo-zoom-${lang}-${t}-v${v}.png`;
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

/** Record a per-task failure so the admin Automation tab can surface
 *  the broken slot in red. Key shape mirrors `lastFired:`:
 *  `cronError:<task>:<YYYY-MM-DD>`. We use upsert (`onConflictDoUpdate`)
 *  so a task that fails multiple times in the same UTC day keeps
 *  only the most recent error rather than rapidly growing rows.
 *  Truncates messages to 800 chars defensively — the
 *  setting_value column is `text` so this is just a sanity cap
 *  against runaway stack traces. */
async function markError(
  db: ReturnType<typeof drizzle>,
  key: string,
  err: unknown
): Promise<void> {
  const fullKey = `cronError:${key}:${todayKey()}`;
  const msg = (() => {
    if (err instanceof Error) return err.message || err.toString();
    if (typeof err === "string") return err;
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  })();
  const value = `${new Date().toISOString()} | ${msg.slice(0, 800)}`;
  await db
    .insert(siteSettings)
    .values({ settingKey: fullKey, settingValue: value })
    .onConflictDoUpdate({
      target: siteSettings.settingKey,
      set: { settingValue: value },
    });
}

// ─── Omni-Composer dispatch (scheduled_posts → channels) ────────
// Each channel id maps to one fan-out call. We use the existing
// tgBroadcastPhoto / tgSendPhoto helpers for image posts and the
// new tgBroadcastVideo / tgSendVideo for `mediaType='video'`. Text-
// only posts (mediaType='none') fall through to sendMessage via the
// underlying Bot API — Telegram doesn't allow inline keyboards on
// sendMessage with parse_mode HTML without a chat_id, so we use
// tgBroadcastMessage's underlying sendMessage path indirectly by
// composing a minimal HTML photo card when no media is attached.
// Practically: every Omni-Composer Telegram post should have media,
// and the UI nudges the user that way. Text-only is supported but
// gracefully degrades to a sendMessage call.

/** Derive a URL-safe blog slug from a title. Guarantees a non-empty
 *  return — falls back to `omni-post-<timestamp>` when title is blank. */
function slugifyTitle(title: string | null): string {
  if (!title) return `omni-post-${Date.now()}`;
  const s = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return s || `omni-post-${Date.now()}`;
}

/** Convert Markdown to a Telegram-safe HTML caption.
 *  This is intentionally minimal — Telegram's HTML parse_mode supports
 *  a tiny subset of tags. We do:
 *    • escape <, >, & first (against injection)
 *    • **bold** → <b>…</b>
 *    • *italic* → <i>…</i>
 *    • `code` → <code>…</code>
 *    • [text](url) → <a href="url">text</a>
 *  Anything else passes through as plain text (newlines preserved). */
function markdownToTelegramHtml(md: string): string {
  let s = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  s = s.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<i>$2</i>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return s;
}

/** Build the Telegram caption used by every telegram_* channel. Title
 *  (if any) becomes a bold first line; content is rendered MD→HTML
 *  and truncated at the 1000-char mark (Telegram caps captions at
 *  1024 chars including HTML tags). */
function buildTelegramCaption(title: string | null, content: string): string {
  const body = markdownToTelegramHtml(content);
  const head = title ? `<b>${title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</b>\n\n` : "";
  const full = head + body;
  if (full.length <= 1000) return full;
  return full.slice(0, 997) + "…";
}

/** Fan a single scheduled_post out to all its channels. Returns a
 *  list of per-channel status strings (for logging) and throws on
 *  the FIRST channel-level failure — the caller's try/catch will
 *  then mark the whole post failed. We could attempt partial
 *  delivery, but for V2 we want the admin to see a clear pass/fail
 *  per post rather than reasoning about "5 of 7 sent". */
async function dispatchScheduledPost(
  db: ReturnType<typeof drizzle>,
  post: typeof scheduledPosts.$inferSelect
): Promise<string[]> {
  const log: string[] = [];
  const buttons = (post.buttons as Array<{ text: string; url: string }>) || [];
  const channels = (post.channels as string[]) || [];
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const germanChat = process.env.TELEGRAM_GERMAN_CHAT;
  const caption = buildTelegramCaption(post.title, post.content);

  for (const ch of channels) {
    if (ch === "blog") {
      // Blog channel writes a published blog_posts row immediately.
      // Skipping `scheduledPublishAt` keeps publishOverdueBlogs hands-
      // off (Omni-Composer is the source of truth for THIS post).
      if (!post.title) {
        log.push(`📰 blog SKIPPED (no title) — post #${post.id}`);
        continue;
      }
      const slug = slugifyTitle(post.title);
      const excerpt = post.content
        .replace(/[#*`>_-]/g, "")
        .trim()
        .slice(0, 220);
      await db.insert(blogPosts).values({
        title: post.title,
        slug,
        excerpt,
        content: post.content,
        coverImage: post.mediaUrl ?? null,
        published: true,
      });
      log.push(`📰 blog → /blog/${slug}`);
      continue;
    }
    if (ch === "telegram_en") {
      if (post.mediaType === "video" && post.mediaUrl) {
        await tgBroadcastVideo({ videoUrl: post.mediaUrl, caption, parseMode: "HTML", buttons });
      } else if (post.mediaUrl) {
        await tgBroadcastPhoto({ photoUrl: post.mediaUrl, caption, parseMode: "HTML", buttons });
      } else {
        // Text-only fallback — Telegram bot API sendMessage.
        if (!token) {
          log.push(`📡 telegram_en SKIPPED (no TELEGRAM_BOT_TOKEN) — post #${post.id}`);
          continue;
        }
        const dests = [process.env.TELEGRAM_CHANNEL].filter(Boolean) as string[] // TELEGRAM_CHAT removed — channel auto-forward handles group;
        for (const chatId of dests) {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: caption,
              parse_mode: "HTML",
              reply_markup: buttons.length > 0
                ? { inline_keyboard: [buttons.map(b => ({ text: b.text, url: b.url }))] }
                : undefined,
            }),
          });
        }
      }
      log.push("📡 telegram_en");
      continue;
    }
    if (ch === "telegram_de") {
      if (!token || !germanChat) {
        log.push(`📡 telegram_de SKIPPED (TELEGRAM_GERMAN_CHAT or token missing) — post #${post.id}`);
        continue;
      }
      if (post.mediaType === "video" && post.mediaUrl) {
        await tgSendVideo(token, { chatId: germanChat, videoUrl: post.mediaUrl, caption, parseMode: "HTML", buttons });
      } else if (post.mediaUrl) {
        await tgSendPhoto(token, { chatId: germanChat, photoUrl: post.mediaUrl, caption, parseMode: "HTML", buttons });
      } else {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: germanChat,
            text: caption,
            parse_mode: "HTML",
            reply_markup: buttons.length > 0
              ? { inline_keyboard: [buttons.map(b => ({ text: b.text, url: b.url }))] }
              : undefined,
          }),
        });
      }
      log.push("📡 telegram_de");
      continue;
    }
    if (ch === "telegram_hi" || ch === "telegram_id") {
      // No per-language groups exist yet — broadcast to default
      // Channel + Group with the (already language-tagged) caption.
      // When a HI/ID group is provisioned, swap this to tgSendPhoto
      // against the new env var.
      if (post.mediaType === "video" && post.mediaUrl) {
        await tgBroadcastVideo({ videoUrl: post.mediaUrl, caption, parseMode: "HTML", buttons });
      } else if (post.mediaUrl) {
        await tgBroadcastPhoto({ photoUrl: post.mediaUrl, caption, parseMode: "HTML", buttons });
      } else if (token) {
        const dests = [process.env.TELEGRAM_CHANNEL].filter(Boolean) as string[] // TELEGRAM_CHAT removed — channel auto-forward handles group;
        for (const chatId of dests) {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: caption,
              parse_mode: "HTML",
              reply_markup: buttons.length > 0
                ? { inline_keyboard: [buttons.map(b => ({ text: b.text, url: b.url }))] }
                : undefined,
            }),
          });
        }
      }
      log.push(`📡 ${ch}`);
      continue;
    }
    log.push(`⚠️ unknown channel "${ch}" — post #${post.id}`);
  }
  return log;
}

/** Compute the next firing time for a recurring scheduled post using
 *  the standard 5-field UTC cron expression. Anchored to NOW so a long
 *  outage doesn't replay a backlog of skipped slots. */
async function nextCronFire(expr: string): Promise<Date> {
  const { CronExpressionParser } = await import("cron-parser");
  const it = CronExpressionParser.parse(expr, { tz: "UTC", currentDate: new Date() });
  return it.next().toDate();
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

function isInWindow(targetHour: number, targetMin: number, graceMin = 25): boolean {
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(targetHour, targetMin, 0, 0);
  const diffMin = (now.getTime() - target.getTime()) / 60_000;
  // Fire if we are within [0, graceMin] minutes AFTER the target (never before)
  return diffMin >= 0 && diffMin <= graceMin;
}

/**
 * Catch-up guard: returns true if the target time has passed today (by up to catchupMin)
 * but the task has NOT yet fired. Used as a fallback for missed windows.
 * Combined with hasFiredToday, this ensures we never double-fire.
 */
function isMissedToday(targetHour: number, targetMin: number, catchupMin = 90): boolean {
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(targetHour, targetMin, 0, 0);
  const diffMin = (now.getTime() - target.getTime()) / 60_000;
  // True if target has passed by more than the grace window but less than catchupMin
  return diffMin > 25 && diffMin <= catchupMin;
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
  // bannerUrlZoom picks a static R2 PNG (3 variants, daily rotation)
  await tgBroadcastPhoto({
    photoUrl: bannerUrlZoom(lang, tier),
    caption,
    parseMode: "HTML",
    buttons: [{ text: "🎤 Join Zoom now", url: meetingLink }],
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const log: string[] = [];
  res.setHeader("Content-Type", "application/json");

  // ─── Authentication ─────────────────────────────────────────────────
  // Vercel automatically sends `Authorization: Bearer <CRON_SECRET>`
  // for scheduled cron jobs. Manual calls must also include this header.
  // If CRON_SECRET env var is not set, auth is bypassed (dev mode).
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (token !== cronSecret) {
      res.statusCode = 401;
      res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
      return;
    }
  }

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL missing");
    const db = drizzle(neon(dbUrl));

    // ─── Debug: ?checkdb=1 returns today's lastFired keys ──────────
    const reqUrlDebug = new URL(req.url || "/", "http://x");
    if (reqUrlDebug.searchParams.get("checkdb") === "1") {
      const today = new Date().toISOString().slice(0, 10);
      const rows = await db
        .select()
        .from(siteSettings)
        .where(like(siteSettings.settingKey, `lastFired:%:${today}`))
        .orderBy(siteSettings.settingKey);
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, today, firedKeys: rows.map(r => r.settingKey) }));
      return;
    }

    // ─── Debug: ?setcommands=1 registers all bot commands with Telegram ──────
    if (reqUrlDebug.searchParams.get("setcommands") === "1") {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: "TELEGRAM_BOT_TOKEN not set" }));
        return;
      }
      const commands = [
        { command: "ask",        description: "Ask the AI anything about TurboLoop" },
        { command: "price",      description: "Live $TURBO price" },
        { command: "burns",      description: "Latest buyback & burn data" },
        { command: "stats",      description: "Live protocol stats" },
        { command: "top",        description: "Global community leaderboard" },
        { command: "plans",      description: "All 4 Loop Plans overview" },
        { command: "referral",   description: "20-level referral system" },
        { command: "payout",     description: "Payout schedule & timing" },
        { command: "calculator", description: "Yield calculator link" },
        { command: "zoom",       description: "Next Zoom session info" },
        { command: "contract",   description: "Smart contract address" },
      ];
      const tgRes = await fetch(
        `https://api.telegram.org/bot${botToken}/setMyCommands`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commands }),
        }
      );
      const tgData = await tgRes.json();
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, telegram: tgData, registered: commands.map(c => c.command) }));
      return;
    }

    // ─── Debug: ?uploadbanner=<name> fetches a public image and puts it into R2 ──
    // Usage: ?uploadbanner=social-wall&src=https://...url-to-png...
    // Puts the file at hub-promo/hub-promo-<name>.png with immutable cache.
    const uploadBannerName = reqUrlDebug.searchParams.get("uploadbanner");
    if (uploadBannerName) {
      const srcUrl = reqUrlDebug.searchParams.get("src");
      if (!srcUrl) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: "Missing ?src= param" }));
        return;
      }
      try {
        const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
        const r2Endpoint = process.env.R2_ENDPOINT;
        const r2Key = process.env.R2_ACCESS_KEY_ID;
        const r2Secret = process.env.R2_SECRET_ACCESS_KEY;
        const r2Bucket = process.env.R2_BUCKET_NAME;
        const r2Public = process.env.R2_PUBLIC_URL;
        if (!r2Endpoint || !r2Key || !r2Secret || !r2Bucket) {
          res.statusCode = 500;
          res.end(JSON.stringify({ ok: false, error: "R2 env vars not set" }));
          return;
        }
        const imgRes = await fetch(srcUrl, { signal: AbortSignal.timeout(30000) });
        if (!imgRes.ok) throw new Error(`Fetch failed: ${imgRes.status}`);
        const imgBuf = Buffer.from(await imgRes.arrayBuffer());
        const s3 = new S3Client({
          region: "auto",
          endpoint: r2Endpoint,
          credentials: { accessKeyId: r2Key, secretAccessKey: r2Secret },
        });
        const r2ObjectKey = `hub-promo/hub-promo-${uploadBannerName}.png`;
        await s3.send(new PutObjectCommand({
          Bucket: r2Bucket,
          Key: r2ObjectKey,
          Body: imgBuf,
          ContentType: "image/png",
          CacheControl: "public, max-age=31536000, immutable",
        }));
        const publicUrl = `${r2Public}/${r2ObjectKey}`;
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, key: r2ObjectKey, url: publicUrl, bytes: imgBuf.length }));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err?.message ?? String(err) }));
      }
      return;
    }

    // ─── Manual broadcast: ?broadcastphoto=1&photoUrl=...&caption=... ────────────
    // Immediately sends a photo to TELEGRAM_CHANNEL with the given caption.
    // Usage: ?broadcastphoto=1&photoUrl=https://...&caption=Your+caption+here
    if (reqUrlDebug.searchParams.get("broadcastphoto") === "1") {
      const photoUrl = reqUrlDebug.searchParams.get("photoUrl") || "";
      const caption = reqUrlDebug.searchParams.get("caption") || "";
      const buttonsParam = reqUrlDebug.searchParams.get("buttons") || "";
      if (!photoUrl) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: "Missing ?photoUrl= param" }));
        return;
      }
      const buttons = buttonsParam
        ? buttonsParam.split(",").map((b: string) => { const [text, url] = b.split("|"); return { text: text || "", url: url || "" }; }).filter((b: {text:string;url:string}) => b.text && b.url)
        : [];
      const results = await tgBroadcastPhoto({ photoUrl, caption, parseMode: "HTML", buttons: buttons.length ? buttons : undefined });
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, results }));
      return;
    }

    // ─── Price cache refresh (runs every cron tick) ──────────────
    // Pulls fresh DexScreener data via our own /api/token-price proxy
    // and writes it into site_settings under `cache:token_price`. The
    // Telegram auto-reply webhook reads this row instead of hitting
    // DexScreener at reply time — turns a 3-5s round-trip into a ~10ms
    // DB read for the price / buy / sell / token / calculator triggers.
    //
    // Runs UNCONDITIONALLY on every tick — no hasFiredToday gate —
    // because we want the cached price to stay as fresh as possible
    // (cadence is bounded by the cron interval). Failures are
    // non-fatal: a stale cache is far better than a broken bot, and
    // the webhook has a live-fetch fallback when the cache is missing
    // or >5 minutes old.
    try {
      const priceRes = await fetch("https://www.turboloop.tech/api/token-price", {
        signal: AbortSignal.timeout(8000),
      });
      if (priceRes.ok) {
        const priceData = await priceRes.json();
        const value = JSON.stringify(priceData);
        await db
          .insert(siteSettings)
          .values({ settingKey: "cache:token_price", settingValue: value })
          .onConflictDoUpdate({
            target: siteSettings.settingKey,
            set: { settingValue: value, updatedAt: new Date() },
          });
      }
    } catch (_priceErr) {
      // Non-fatal — stale cache is fine, bot will use last known price.
    }

    // ─── Holder count refresh (runs every cron tick) ────────────────
    // Scrapes BscScan for the current $TURBO holder count and writes it
    // into site_settings under `cache:token_holders`. Runs unconditionally
    // on every tick so the token page always shows a fresh count.
    // Non-fatal — a stale cache is better than a broken cron.
    try {
      const TURBO_CONTRACT = "0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3";
      const USER_AGENTS = [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
      ];
      const _uaIdx = new Date().getMinutes() % USER_AGENTS.length;
      const _bscHeaders: Record<string, string> = {
        "User-Agent": USER_AGENTS[_uaIdx],
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Referer": "https://www.google.com/",
      };
      let _bscHtml = "";
      const _bscRes = await fetch(`https://bscscan.com/token/${TURBO_CONTRACT}`, {
        headers: _bscHeaders,
        signal: AbortSignal.timeout(20000),
      });
      if (_bscRes.status === 403) {
        // Retry once with a different user agent
        const _retryHeaders = { ..._bscHeaders, "User-Agent": USER_AGENTS[(_uaIdx + 2) % USER_AGENTS.length], "Referer": "https://etherscan.io/" };
        const _retryRes = await fetch(`https://bscscan.com/token/${TURBO_CONTRACT}`, {
          headers: _retryHeaders,
          signal: AbortSignal.timeout(20000),
        });
        if (_retryRes.ok) _bscHtml = await _retryRes.text();
      } else if (_bscRes.ok) {
        _bscHtml = await _bscRes.text();
      }
      if (_bscHtml) {
        // Primary pattern: "Holders: 1,234" or "Holders 1,234"
        const _holdersMatch = _bscHtml.match(/Holders[:\s]*([\d,]+)/i)
          || _bscHtml.match(/"holdersCount"\s*:\s*"?([\d,]+)"?/);
        if (_holdersMatch) {
          const _holdersNum = parseInt(_holdersMatch[1].replace(/,/g, ""), 10);
          if (_holdersNum > 0) {
            const _holdersValue = JSON.stringify({
              holders: _holdersNum.toLocaleString("en-US"),
              holdersNum: _holdersNum,
              fetchedAt: new Date().toISOString(),
              fresh: true,
              source: "bscscan-scrape",
            });
            await db
              .insert(siteSettings)
              .values({ settingKey: "cache:token_holders", settingValue: _holdersValue })
              .onConflictDoUpdate({
                target: siteSettings.settingKey,
                set: { settingValue: _holdersValue, updatedAt: new Date() },
              });
            console.log(`[cron-master] holder count refreshed: ${_holdersNum.toLocaleString("en-US")}`);
          }
        }
      }
    } catch (_holderErr) {
      // Non-fatal — stale cache is fine.
      console.error("[cron-master] holder count refresh error:", _holderErr);
    }

    // ─── Days Since Launch Milestone ─────────────────────────────────
    // Celebrates major time milestones (e.g., 100 Days, 6 Months, 1 Year).
    // Deploy date: March 10, 2026 (Block 85,676,981).
    try {
      const DEPLOY_DATE = new Date("2026-03-10T00:00:00Z");
      const daysSinceLaunch = Math.floor((Date.now() - DEPLOY_DATE.getTime()) / 86_400_000);
      
      // Milestones to celebrate (in days)
      const TIME_MILESTONES = [100, 150, 180, 200, 250, 300, 365, 500, 730, 1000];
      const R2_BASE = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

      // Read last celebrated time milestone from DB
      const _lastTimeRows = await db
        .select({ settingValue: siteSettings.settingValue })
        .from(siteSettings)
        .where(eq(siteSettings.settingKey, "milestone:last_time_celebrated"))
        .limit(1);
      const _lastTimeCelebrated: number = _lastTimeRows[0]
        ? (parseInt(_lastTimeRows[0].settingValue, 10) || 0)
        : 0;

      // Find the highest milestone crossed that hasn't been celebrated yet
      const _nextTimeMilestone = TIME_MILESTONES
        .filter(m => m > _lastTimeCelebrated && daysSinceLaunch >= m)
        .pop(); // highest crossed

      if (_nextTimeMilestone) {
        // Build the celebration caption using Claude
        let _timeCaption = `🎉 <b>${_nextTimeMilestone} Days of TurboLoop!</b>\n\nIt's been ${_nextTimeMilestone} days since the smart contract was deployed. Thank you to everyone building the future of DeFi with us! 🚀\n\n<b>Join the revolution:</b> https://www.turboloop.tech`;
        try {
          const _claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.ANTHROPIC_API_KEY || "",
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-haiku-4-5",
              max_tokens: 300,
              system: "You write short, exciting Telegram celebration posts for TurboLoop, a DeFi yield protocol on BSC. Use Telegram HTML formatting (<b>bold</b>, <i>italic</i>). Always include the website link https://www.turboloop.tech. Keep it under 250 characters. No hashtags. End with a rocket or fire emoji.",
              messages: [{ role: "user", content: `Write a celebration post for reaching ${_nextTimeMilestone} days since the TurboLoop smart contract was deployed. Current days: ${daysSinceLaunch}.` }],
            }),
            signal: AbortSignal.timeout(15000),
          });
          if (_claudeRes.ok) {
            const _claudeData: any = await _claudeRes.json();
            const _claudeText: string = _claudeData?.content?.[0]?.text ?? "";
            if (_claudeText) _timeCaption = _claudeText;
          }
        } catch { /* Use fallback caption */ }

        // Trigger Manus to generate banner via turboloop-imagegen skill, upload to R2, and post to Telegram
        const taskId = await triggerManusMilestoneTask("Days Since Launch", _nextTimeMilestone, `${_nextTimeMilestone}-days.png`);
        if (taskId) {
          // Do not await polling so cron can finish
          pollAndPostMilestone(`${_nextTimeMilestone}-days.png`, _timeCaption).catch(console.error);
        }

        // Record the celebrated milestone so we don't post again
        await db
          .insert(siteSettings)
          .values({ settingKey: "milestone:last_time_celebrated", settingValue: String(_nextTimeMilestone) })
          .onConflictDoUpdate({
            target: siteSettings.settingKey,
            set: { settingValue: String(_nextTimeMilestone), updatedAt: new Date() },
          });

        console.log(`[cron-master] 🎉 Time Milestone celebrated: ${_nextTimeMilestone} days (current: ${daysSinceLaunch})`);
      }
    } catch (_timeMilestoneErr) {
      console.error("[cron-master] time milestone detection error:", _timeMilestoneErr);
    }

    // ─── Unique Depositors Milestone ─────────────────────────────────
    // Celebrates major unique depositor milestones (e.g., 1000, 2000, 5000).
    // The cron-master does not count depositors itself (too heavy for Edge).
    // Instead, a background worker updates `cache:unique_depositors` in DB.
    try {
      const DEPOSITOR_MILESTONES = [500, 1000, 1500, 2000, 2500, 3000, 5000, 10000];
      const R2_BASE = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

      // Read current unique depositors from DB cache
      const _depRows = await db
        .select({ settingValue: siteSettings.settingValue })
        .from(siteSettings)
        .where(eq(siteSettings.settingKey, "cache:unique_depositors"))
        .limit(1);
      const _currentDepositors: number = _depRows[0]
        ? (parseInt(_depRows[0].settingValue, 10) || 0)
        : 0;

      // Read last celebrated depositor milestone from DB
      const _lastDepRows = await db
        .select({ settingValue: siteSettings.settingValue })
        .from(siteSettings)
        .where(eq(siteSettings.settingKey, "milestone:last_depositor_celebrated"))
        .limit(1);
      const _lastDepCelebrated: number = _lastDepRows[0]
        ? (parseInt(_lastDepRows[0].settingValue, 10) || 0)
        : 0;

      // Find the highest milestone crossed that hasn't been celebrated yet
      const _nextDepMilestone = DEPOSITOR_MILESTONES
        .filter(m => m > _lastDepCelebrated && _currentDepositors >= m)
        .pop(); // highest crossed

      if (_nextDepMilestone && _currentDepositors > 0) {
        // Build the celebration caption using Claude
        let _depCaption = `🎉 <b>${_nextDepMilestone.toLocaleString("en-US")} Unique Depositors!</b>\n\nOur protocol just crossed ${_nextDepMilestone.toLocaleString("en-US")} unique wallets actively earning yield. The network effect is real. 🚀\n\n<b>Start earning today:</b> https://www.turboloop.tech`;
        try {
          const _claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.ANTHROPIC_API_KEY || "",
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-haiku-4-5",
              max_tokens: 300,
              system: "You write short, exciting Telegram celebration posts for TurboLoop, a DeFi yield protocol on BSC. Use Telegram HTML formatting (<b>bold</b>, <i>italic</i>). Always include the website link https://www.turboloop.tech. Keep it under 250 characters. No hashtags. End with a rocket or fire emoji.",
              messages: [{ role: "user", content: `Write a celebration post for reaching ${_nextDepMilestone.toLocaleString("en-US")} unique depositors (wallets actively earning yield). Current count: ${_currentDepositors.toLocaleString("en-US")}.` }],
            }),
            signal: AbortSignal.timeout(15000),
          });
          if (_claudeRes.ok) {
            const _claudeData: any = await _claudeRes.json();
            const _claudeText: string = _claudeData?.content?.[0]?.text ?? "";
            if (_claudeText) _depCaption = _claudeText;
          }
        } catch { /* Use fallback caption */ }

        // Trigger Manus to generate banner via turboloop-imagegen skill, upload to R2, and post to Telegram
        const taskId = await triggerManusMilestoneTask("Unique Depositors", _nextDepMilestone, `${_nextDepMilestone}-depositors.png`);
        if (taskId) {
          pollAndPostMilestone(`${_nextDepMilestone}-depositors.png`, _depCaption).catch(console.error);
        }

        // Record the celebrated milestone so we don't post again
        await db
          .insert(siteSettings)
          .values({ settingKey: "milestone:last_depositor_celebrated", settingValue: String(_nextDepMilestone) })
          .onConflictDoUpdate({
            target: siteSettings.settingKey,
            set: { settingValue: String(_nextDepMilestone), updatedAt: new Date() },
          });

        console.log(`[cron-master] 🎉 Depositor Milestone celebrated: ${_nextDepMilestone} depositors (current: ${_currentDepositors})`);
      }
    } catch (_depMilestoneErr) {
      console.error("[cron-master] depositor milestone detection error:", _depMilestoneErr);
    }

    // ─── Milestone auto-detection & auto-post ────────────────────────
    // Checks if the current holder count has crossed a milestone threshold
    // that hasn't been celebrated yet. If so, posts a pre-generated
    // milestone banner to Telegram automatically.
    //
    // Milestones: 1100, 1200, 1500, 2000, 2500, 3000, 5000, 10000
    // State: stored in site_settings as `milestone:last_celebrated` (integer)
    // Banners: stored on R2 under brand/milestones/{N}-holders.png
    //          Falls back to brand/milestones/generic-milestone.png if not found.
    try {
      const MILESTONES = [1100, 1200, 1500, 2000, 2500, 3000, 5000, 10000];
      const R2_BASE = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

      // Read current holder count from DB cache
      const _holderRows = await db
        .select({ settingValue: siteSettings.settingValue })
        .from(siteSettings)
        .where(eq(siteSettings.settingKey, "cache:token_holders"))
        .limit(1);
      const _currentHolders: number = _holderRows[0]
        ? (JSON.parse(_holderRows[0].settingValue)?.holdersNum ?? 0)
        : 0;

      // Read last celebrated milestone from DB
      const _lastRows = await db
        .select({ settingValue: siteSettings.settingValue })
        .from(siteSettings)
        .where(eq(siteSettings.settingKey, "milestone:last_celebrated"))
        .limit(1);
      const _lastCelebrated: number = _lastRows[0]
        ? (parseInt(_lastRows[0].settingValue, 10) || 0)
        : 0;

      // Find the highest milestone crossed that hasn't been celebrated yet
      const _nextMilestone = MILESTONES
        .filter(m => m > _lastCelebrated && _currentHolders >= m)
        .pop(); // highest crossed

      if (_nextMilestone && _currentHolders > 0) {
        // Build the celebration caption using Claude
        let _milestoneCaption = `🎉 <b>${_nextMilestone.toLocaleString("en-US")} Unique $TURBO Token Holders!</b>\n\nOur community keeps growing stronger. Thank you to every holder who believes in TurboLoop! 🚀\n\n<b>Join the revolution:</b> https://www.turboloop.tech`;
        try {
          const _claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.ANTHROPIC_API_KEY || "",
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-haiku-4-5",
              max_tokens: 300,
              system: "You write short, exciting Telegram celebration posts for TurboLoop, a DeFi yield protocol on BSC. Use Telegram HTML formatting (<b>bold</b>, <i>italic</i>). Always include the website link https://www.turboloop.tech. Keep it under 250 characters. No hashtags. End with a rocket or fire emoji.",
              messages: [{ role: "user", content: `Write a celebration post for reaching ${_nextMilestone.toLocaleString("en-US")} unique $TURBO token holders. Current count: ${_currentHolders.toLocaleString("en-US")}.` }],
            }),
            signal: AbortSignal.timeout(15000),
          });
          if (_claudeRes.ok) {
            const _claudeData: any = await _claudeRes.json();
            const _claudeText: string = _claudeData?.content?.[0]?.text ?? "";
            if (_claudeText) _milestoneCaption = _claudeText;
          }
        } catch { /* Use fallback caption */ }

        // Trigger Manus to generate banner via turboloop-imagegen skill, upload to R2, and post to Telegram
        const taskId = await triggerManusMilestoneTask("Token Holders", _nextMilestone, `${_nextMilestone}-holders.png`);
        if (taskId) {
          pollAndPostMilestone(`${_nextMilestone}-holders.png`, _milestoneCaption).catch(console.error);
        }

        // Record the celebrated milestone so we don't post again
        await db
          .insert(siteSettings)
          .values({ settingKey: "milestone:last_celebrated", settingValue: String(_nextMilestone) })
          .onConflictDoUpdate({
            target: siteSettings.settingKey,
            set: { settingValue: String(_nextMilestone), updatedAt: new Date() },
          });

        console.log(`[cron-master] 🎉 Milestone celebrated: ${_nextMilestone} holders (current: ${_currentHolders})`);
      }
    } catch (_milestoneErr) {
      // Non-fatal — milestone detection failure should never break the cron.
      console.error("[cron-master] milestone detection error:", _milestoneErr);
    }

    // ─── Manual force-fire overrides ────────────────────────────────
    // Allows campaign slots to fire on demand outside their normal time
    // window. Used on launch day for each campaign when the regular
    // window has already passed by the time the cron is wired up.
    //
    // force= bypasses BOTH the time-window check AND the daily dedup,
    // so ?force=midnight:math always fires immediately even if it already
    // fired earlier today. This makes manual testing reliable.
    // reset= clears the dedup key without firing (useful for pre-clearing
    // before a scheduled window arrives).
    const reqUrl = new URL(req.url || "/", "http://x");
    const forceSet = new Set(
      (reqUrl.searchParams.get("force") || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
    );
    const resetSet = new Set(
      (reqUrl.searchParams.get("reset") || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
    );
    // Handle ?reset= — clear dedup keys and return immediately
    if (resetSet.size > 0) {
      const today = new Date().toISOString().slice(0, 10);
      const cleared: string[] = [];
      for (const key of Array.from(resetSet)) {
        const fullKey = `lastFired:${key}:${today}`;
        await db.delete(siteSettings).where(eq(siteSettings.settingKey, fullKey)).catch(() => {});
        cleared.push(fullKey);
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, cleared }));
      return;
    }
    const forceCampaignA = forceSet.has("campaignA");
    const forceCampaignB = forceSet.has("campaignB");
    const forceGermanDaily = forceSet.has("germanDaily");
    const forceMidnightMath = forceSet.has("midnight:math");
    const forceGlobalReach = forceSet.has("global:reach");
    const forceSecurityPromo = forceSet.has("security:promo");
    const forceMorningHook = forceSet.has("morning:hook");
    const forceEcosystemPromo = forceSet.has("ecosystem:promo");
    const forceBurnProof = forceSet.has("burn:proof");
    const forceCommunityPromo = forceSet.has("community:promo");
    const forceLiveStats = forceSet.has("live:stats");
    const forceNightlyEducation = forceSet.has("nightly:education");
    const forceBotCommands = forceSet.has("bot:commands");
    const forceZoomHiT60 = forceSet.has("zoom:hi:T60");
    const forceZoomHiT10 = forceSet.has("zoom:hi:T10");
    const forceZoomHiT0  = forceSet.has("zoom:hi:T0");
    const forceZoomEnT60 = forceSet.has("zoom:en:T60");
    const forceZoomEnT10 = forceSet.has("zoom:en:T10");
    const forceZoomEnT0  = forceSet.has("zoom:en:T0");
    const forceZoomHiT30 = forceSet.has("zoom:hi:T30");
    const forceZoomEnT30 = forceSet.has("zoom:en:T30");
    const forceCampaignLifestyle   = forceSet.has("campaign:lifestyle");
    const forceCampaignToken        = forceSet.has("campaign:token");
    const forceCampaignReferral     = forceSet.has("campaign:referral");
    const forceCampaignObjection    = forceSet.has("campaign:objection");
    const forceCampaignHindi        = forceSet.has("campaign:hindi");
    const forceCampaignNigerian     = forceSet.has("campaign:nigerian");
    const forceCampaignSuccess      = forceSet.has("campaign:success");
    const forceCampaignEducation    = forceSet.has("campaign:education");
    const forceCampaignUrgency      = forceSet.has("campaign:urgency");
    const forceCampaignBuyback      = forceSet.has("campaign:buyback");
    const forceCampaignComparison   = forceSet.has("campaign:comparison");
    const forceCampaignCommunity   = forceSet.has("campaign:community");
    const forceCreativesPromoA      = forceSet.has("creatives:promo:A");
    const forceCreativesPromoB      = forceSet.has("creatives:promo:B");

    // ============ 0. ONE-SHOT: SITE LAUNCH ANNOUNCEMENT ============
    // Fires once when current time >= LAUNCH_FIRE_AT_UTC and within grace window,
    // then never again (de-duplicated via oneShot:launch:announcement key).
    // Scheduled in the morning (12:00 UTC) so it doesn't collide with the
    // 14:00/15:00/16:30 UTC evening cluster.
    try {
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
    } catch (err) {
      await markError(db, "launch:announcement", err).catch(() => {});
      console.error("[cron-master] task launch:announcement failed", err);
      log.push(`❌ launch:announcement failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ 0. HUB PROMOTION: 09:00 UTC = 2:30 PM IST ============
    // Rotates through 14 Hub pages × 3 caption variants = 42-day cycle.
    // Each post drives traffic to a specific page with a premium banner.
    try {
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
    } catch (err) {
      await markError(db, "hubPromo", err).catch(() => {});
      console.error("[cron-master] task hubPromo failed", err);
      log.push(`❌ hubPromo failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ 1. MONTHLY COMPOUNDING BANNER: 12:00 UTC = 5:30 PM IST ============
    // Cycles through 20 banners (10 EN amounts + 10 DE amounts) by
    // day-of-year. Each language routes to its own channel:
    //   EN banners → tgBroadcastPhoto (TELEGRAM_CHANNEL + TELEGRAM_CHAT, English audience)
    //   DE banners → tgSendPhoto to TELEGRAM_GERMAN_CHAT (German-only)
    // Pre-2026-05-18 fix this branch broadcast DE captions to the EN
    // channels — ~50% of monthly:compound posts were landing in the
    // wrong audience. See Task G in the 7-task plan.
    try {
      if (isInWindow(12, 0) && !(await hasFiredToday(db, "monthly:compound"))) {
        const banner = pickTodaysMonthlyBanner();
        let mcCaption = monthlyCompoundingCaption(banner);
        // Append live price + all-time change to ground the compounding
        // projection in the current token value.
        try {
          const [rp4, rh4] = await Promise.all([
            fetch("https://www.turboloop.tech/api/token-price", { signal: AbortSignal.timeout(5000) }),
            fetch("https://www.turboloop.tech/api/token-price-history", { signal: AbortSignal.timeout(5000) }),
          ]);
          const dp4: any = rp4.ok ? await rp4.json() : null;
          const dh4: any = rh4.ok ? await rh4.json() : null;
          const mcPrice = dp4?.priceUsd ? `$${Number(dp4.priceUsd).toFixed(6)}` : null;
          const mcAt = dh4?.priceChangeAllTime != null
            ? `${dh4.priceChangeAllTime >= 0 ? "+" : ""}${(dh4.priceChangeAllTime * 100).toFixed(2)}%`
            : null;
          if (mcPrice) {
            const priceLine = banner.lang === "de"
              ? `\n\n💰 <b>Aktueller $TURBO-Preis:</b> ${mcPrice}${mcAt ? ` (<b>${mcAt}</b> seit Launch)` : ""}`
              : `\n\n💰 <b>Current $TURBO price:</b> ${mcPrice}${mcAt ? ` (<b>${mcAt}</b> since launch)` : ""}`;
            mcCaption = mcCaption + priceLine;
          }
        } catch { /* skip */ }
        const caption = mcCaption;
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
    } catch (err) {
      await markError(db, "monthly:compound", err).catch(() => {});
      console.error("[cron-master] task monthly:compound failed", err);
      log.push(`❌ monthly:compound failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ 2. DAILY BLOG: 14:00 UTC = 7:30 PM IST ============
    // Per-post language routing — announceBlogToTelegram returns a
    // status string showing which channel (EN broadcast / DE / HI / ID)
    // actually received the post, or a "skipped" notice when the lang
    // has no provisioned channel yet. The status flows into the cron
    // response body so it's visible in Vercel logs without digging.
    try {
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
    } catch (err) {
      await markError(db, "blog:evening", err).catch(() => {});
      console.error("[cron-master] task blog:evening failed", err);
      log.push(`❌ blog:evening failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Safety net: always catch up overdue posts (idempotent — won't double-announce
    // because hasFiredToday gates the Telegram call). Wrapped so a transient
    // DB blip here doesn't sink the rest of the run.
    try {
      await publishOverdueBlogs(db);
    } catch (err) {
      console.error("[cron-master] safety-net publishOverdueBlogs failed", err);
    }

    // ============ 3. HINDI/URDU ZOOM — 4-tier reminder sequence ============
    // HI call is at 16:00 UTC (9:30 PM IST)
    // T-60 → 15:00 UTC | T-30 → 15:30 UTC | T-10 → 15:50 UTC | T-0 → 16:00 UTC

    // HI T-60: 15:00 UTC
    try {
      if ((isInWindow(15, 0) || isMissedToday(15, 0) || forceZoomHiT60) && (forceZoomHiT60 || !(await hasFiredToday(db, "zoom:hi:T60")))) {
        const cfg = await getZoomConfig("hi");
        await sendZoomReminder("hi", "T60", cfg.link, cfg.passcode, cfg.timeLabel);
        await markFired(db, "zoom:hi:T60");
        log.push("🎙 HI Zoom T-60");
      }
    } catch (err) {
      await markError(db, "zoom:hi:T60", err).catch(() => {});
      log.push(`❌ zoom:hi:T60 failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // HI T-30: 15:30 UTC
    try {
      if ((isInWindow(15, 30) || isMissedToday(15, 30) || forceZoomHiT30) && (forceZoomHiT30 || !(await hasFiredToday(db, "zoom:hi:T30")))) {
        const cfg = await getZoomConfig("hi");
        await sendZoomReminder("hi", "T30", cfg.link, cfg.passcode, cfg.timeLabel);
        await markFired(db, "zoom:hi:T30");
        log.push("🎙 HI Zoom T-30");
      }
    } catch (err) {
      await markError(db, "zoom:hi:T30", err).catch(() => {});
      log.push(`❌ zoom:hi:T30 failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // HI T-15: 15:45 UTC (15 minutes before 16:00 UTC call)
    try {
      if ((isInWindow(15, 45) || isMissedToday(15, 45) || forceZoomHiT10) && (forceZoomHiT10 || !(await hasFiredToday(db, "zoom:hi:T10")))) {
        const cfg = await getZoomConfig("hi");
        await sendZoomReminder("hi", "T15", cfg.link, cfg.passcode, cfg.timeLabel);
        await markFired(db, "zoom:hi:T10");
        log.push("🎙 HI Zoom T-10");
      }
    } catch (err) {
      await markError(db, "zoom:hi:T10", err).catch(() => {});
      log.push(`❌ zoom:hi:T10 failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // HI T-0 LIVE: 16:00 UTC
    try {
      if ((isInWindow(16, 0) || isMissedToday(16, 0) || forceZoomHiT0) && (forceZoomHiT0 || !(await hasFiredToday(db, "zoom:hi:T0")))) {
        const cfg = await getZoomConfig("hi");
        await sendZoomReminder("hi", "LIVE", cfg.link, cfg.passcode, cfg.timeLabel);
        await markFired(db, "zoom:hi:T0");
        log.push("🎙 HI Zoom T-0 LIVE");
      }
    } catch (err) {
      await markError(db, "zoom:hi:T0", err).catch(() => {});
      log.push(`❌ zoom:hi:T0 failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ 4. ENGLISH ZOOM — 4-tier reminder sequence ============
    // Normal schedule: EN call at 17:00 UTC — T-60=16:00, T-30=16:30, T-10=16:50, T-0=17:00
    // Override: if EN_ZOOM_EARLY_DATE matches today, shift all windows -1h (16:00 UTC call).
    // Auto-reverts the next day — no manual cleanup needed.
    {
      const early = isEnZoomEarlyToday();
      const [h60, m60] = early ? [15,  0] : [16,  0];
      const [h30, m30] = early ? [15, 30] : [16, 30];
      const [h10, m10] = early ? [15, 45] : [16, 45]; // T-15: fires 15 min before call
      const [h0,  m0 ] = early ? [16,  0] : [17,  0];

      // EN T-60
      try {
        if ((isInWindow(h60, m60) || isMissedToday(h60, m60) || forceZoomEnT60) && (forceZoomEnT60 || !(await hasFiredToday(db, "zoom:en:T60")))) {
          const cfg = await getZoomConfig("en");
          await sendZoomReminder("en", "T60", cfg.link, cfg.passcode, cfg.timeLabel);
          await markFired(db, "zoom:en:T60");
          log.push(`\uD83C\uDFA4 EN Zoom T-60${early ? " (early)" : ""}`);
        }
      } catch (err) {
        await markError(db, "zoom:en:T60", err).catch(() => {});
        log.push(`❌ zoom:en:T60 failed: ${err instanceof Error ? err.message : String(err)}`);
      }

      // EN T-30
      try {
        if ((isInWindow(h30, m30) || isMissedToday(h30, m30) || forceZoomEnT30) && (forceZoomEnT30 || !(await hasFiredToday(db, "zoom:en:T30")))) {
          const cfg = await getZoomConfig("en");
          await sendZoomReminder("en", "T30", cfg.link, cfg.passcode, cfg.timeLabel);
          await markFired(db, "zoom:en:T30");
          log.push(`\uD83C\uDFA4 EN Zoom T-30${early ? " (early)" : ""}`);
        }
      } catch (err) {
        await markError(db, "zoom:en:T30", err).catch(() => {});
        log.push(`❌ zoom:en:T30 failed: ${err instanceof Error ? err.message : String(err)}`);
      }

      // EN T-10
      try {
        if ((isInWindow(h10, m10) || isMissedToday(h10, m10) || forceZoomEnT10) && (forceZoomEnT10 || !(await hasFiredToday(db, "zoom:en:T10")))) {
          const cfg = await getZoomConfig("en");
          await sendZoomReminder("en", "T15", cfg.link, cfg.passcode, cfg.timeLabel);
          await markFired(db, "zoom:en:T10");
          log.push(`\uD83C\uDFA4 EN Zoom T-10${early ? " (early)" : ""}`);
        }
      } catch (err) {
        await markError(db, "zoom:en:T10", err).catch(() => {});
        log.push(`❌ zoom:en:T10 failed: ${err instanceof Error ? err.message : String(err)}`);
      }

      // EN T-0 LIVE
      try {
        if ((isInWindow(h0, m0) || isMissedToday(h0, m0) || forceZoomEnT0) && (forceZoomEnT0 || !(await hasFiredToday(db, "zoom:en:T0")))) {
          const cfg = await getZoomConfig("en");
          await sendZoomReminder("en", "LIVE", cfg.link, cfg.passcode, cfg.timeLabel);
          await markFired(db, "zoom:en:T0");
          log.push(`\uD83C\uDFA4 EN Zoom T-0 LIVE${early ? " (early)" : ""}`);
        }
      } catch (err) {
        await markError(db, "zoom:en:T0", err).catch(() => {});
        log.push(`❌ zoom:en:T0 failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // ============ 5. CINEMATIC FILM (rotates daily): 18:00 UTC = 11:30 PM IST ============
    try {
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
    } catch (err) {
      await markError(db, "cinematic:daily", err).catch(() => {});
      console.error("[cron-master] task cinematic:daily failed", err);
      log.push(`❌ cinematic:daily failed: ${err instanceof Error ? err.message : String(err)}`);
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
    try {
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
    } catch (err) {
      await markError(db, "creatorReminder", err).catch(() => {});
      console.error("[cron-master] task creatorReminder failed", err);
      log.push(`❌ creatorReminder failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ════════════════════════════════════════════════════════════════
    //  EXPANDED CONTENT SCHEDULE — 8 additional slots
    //  Brings the total to 12 posts/day (one every 2 hours UTC).
    //  Each slot has its own dedup key + per-task try/catch so a
    //  failure here can't poison the cron's other work.
    // ════════════════════════════════════════════════════════════════

    // ============ A. MIDNIGHT MATH: 00:00 UTC = 5:30 AM IST ============
    // Compounding projection banner. Uses an offset of +10 against
    // pickTodaysMonthlyBanner so this slot never collides with the
    // 12:00 monthly:compound slot on the same UTC day.
    try {
      if ((isInWindow(0, 0) || forceMidnightMath) && (forceMidnightMath || !(await hasFiredToday(db, "midnight:math")))) {
        const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
        const banner = MONTHLY_COMPOUND_BANNERS[(day + 10) % MONTHLY_COMPOUND_BANNERS.length];
        let baseCaption = monthlyCompoundingCaption(banner);
        // Append live price + all-time change so the compounding message
        // is grounded in the current token value.
        try {
          const [rp3, rh3] = await Promise.all([
            fetch("https://www.turboloop.tech/api/token-price", { signal: AbortSignal.timeout(5000) }),
            fetch("https://www.turboloop.tech/api/token-price-history", { signal: AbortSignal.timeout(5000) }),
          ]);
          const dp3: any = rp3.ok ? await rp3.json() : null;
          const dh3: any = rh3.ok ? await rh3.json() : null;
          const mmPrice = dp3?.priceUsd ? `$${Number(dp3.priceUsd).toFixed(6)}` : null;
          const mmAt = dh3?.priceChangeAllTime != null
            ? `${dh3.priceChangeAllTime >= 0 ? "+" : ""}${(dh3.priceChangeAllTime * 100).toFixed(2)}%`
            : null;
          if (mmPrice) {
            const priceLine = banner.lang === "de"
              ? `\n\n💰 <b>Aktueller $TURBO-Preis:</b> ${mmPrice}${mmAt ? ` (<b>${mmAt}</b> seit Launch)` : ""}`
              : `\n\n💰 <b>Current $TURBO price:</b> ${mmPrice}${mmAt ? ` (<b>${mmAt}</b> since launch)` : ""}`;
            baseCaption = baseCaption + priceLine;
          }
        } catch { /* skip */ }
        const caption = baseCaption;
        const photoUrl = monthlyBannerUrl(banner);
        if (banner.lang === "de") {
          const token = process.env.TELEGRAM_BOT_TOKEN;
          const germanChat = process.env.TELEGRAM_GERMAN_CHAT;
          if (token && germanChat) {
            await tgSendPhoto(token, {
              chatId: germanChat,
              photoUrl,
              caption,
              parseMode: "HTML",
              buttons: [{ text: "🧮 Jetzt berechnen", url: "https://turboloop.tech/calculator" }],
            });
          }
        } else {
          await tgBroadcastPhoto({
            photoUrl,
            caption,
            parseMode: "HTML",
            buttons: [{ text: "🧮 Run your projection", url: "https://turboloop.tech/calculator" }],
          });
        }
        await markFired(db, "midnight:math");
        const label = typeof banner.key === "number" ? `$${banner.key}` : banner.key;
        log.push(`🌙 Midnight math — ${banner.lang} ${label}`);
      }
    } catch (err) {
      await markError(db, "midnight:math", err).catch(() => {});
      console.error("[cron-master] task midnight:math failed", err);
      log.push(`❌ midnight:math failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ B. GLOBAL REACH: 02:00 UTC = 7:30 AM IST ============
    // Live top-3 country leaderboard pulled from Neon. Rotates through
    // 3 caption framings by day so the same wording isn't reused
    // back-to-back if a reader is paying close attention.
    try {
      if ((isInWindow(2, 0) || forceGlobalReach) && (forceGlobalReach || !(await hasFiredToday(db, "global:reach")))) {
        const { neon } = await import("@neondatabase/serverless");
        const sql2 = neon(process.env.DATABASE_URL!);
        const leaderRows = await sql2`
          SELECT country, score
          FROM country_leaderboard
          ORDER BY score DESC
          LIMIT 3
        `;
        if (leaderRows.length > 0) {
          const medals = ["🥇", "🥈", "🥉"];
          const lines = leaderRows.map((r: any, i: number) =>
            `${medals[i]} <b>${r.country}</b> — ${Number(r.score).toLocaleString()} members`
          ).join("\n");
          const captions = [
            `🌍 <b>The TurboLoop movement is global.</b>\n\nTop communities right now:\n\n${lines}\n\nEvery country on this list started with one person who decided to build differently.\n\n🔗 https://www.turboloop.tech/community`,
            `📡 <b>Where is TurboLoop growing fastest?</b>\n\nCurrent top 3:\n\n${lines}\n\nThe leaderboard updates live. Your country could be next.\n\n🔗 https://www.turboloop.tech/community`,
            `🌐 <b>100,000+ wallets. Dozens of countries. One protocol.</b>\n\nLeading communities today:\n\n${lines}\n\nJoin the global network.\n\n🔗 https://www.turboloop.tech/community`,
            `🗺️ <b>Geography no longer determines your financial destiny.</b>\n\nLeading the charge today:\n\n${lines}\n\n14+ countries. 6 continents. 12+ languages. One protocol.\n\n🔗 https://www.turboloop.tech/community`,
            `🚀 <b>The network effect in real time.</b>\n\nTop 3 regions by community strength:\n\n${lines}\n\nFrom local Zoom calls to global impact. See where your country ranks.\n\n🔗 https://www.turboloop.tech/community`,
          ];
          const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
          const caption = captions[day % captions.length];
          await tgBroadcastMessage({
            text: caption,
            parseMode: "HTML",
            disablePreview: true,
            buttons: [{ text: "🌍 See full leaderboard", url: "https://www.turboloop.tech/community" }],
          });
          await markFired(db, "global:reach");
          log.push(`🌍 Global reach — top: ${leaderRows[0]?.country}`);
        }
      }
    } catch (err) {
      await markError(db, "global:reach", err).catch(() => {});
      console.error("[cron-master] task global:reach failed", err);
      log.push(`❌ global:reach failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ C. SECURITY FIRST: 04:00 UTC = 9:30 AM IST ============
    // Hub promo rotating through security / code-is-law pages.
    try {
      if ((isInWindow(4, 0) || forceSecurityPromo) && (forceSecurityPromo || !(await hasFiredToday(db, "security:promo")))) {
        const promo = pickHubPromoByPages(["security", "code-is-law"]);
        await tgBroadcastPhoto({
          photoUrl: hubPromoBannerUrl(promo),
          caption: promo.caption,
          parseMode: "HTML",
          buttons: [{ text: promo.buttonText, url: promo.buttonUrl }],
        });
        await markFired(db, "security:promo");
        log.push(`🔐 Security promo — ${promo.page}`);
      }
    } catch (err) {
      await markError(db, "security:promo", err).catch(() => {});
      console.error("[cron-master] task security:promo failed", err);
      log.push(`❌ security:promo failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ D. MORNING HOOK: 06:00 UTC = 11:30 AM IST ============
    // Hub promo — calculator / apply (highest conversion intent).
    try {
      if ((isInWindow(6, 0) || forceMorningHook) && (forceMorningHook || !(await hasFiredToday(db, "morning:hook")))) {
        const promo = pickHubPromoByPages(["calculator", "apply"]);
        await tgBroadcastPhoto({
          photoUrl: hubPromoBannerUrl(promo),
          caption: promo.caption,
          parseMode: "HTML",
          buttons: [{ text: promo.buttonText, url: promo.buttonUrl }],
        });
        await markFired(db, "morning:hook");
        log.push(`⚡ Morning hook — ${promo.page}`);
      }
    } catch (err) {
      await markError(db, "morning:hook", err).catch(() => {});
      console.error("[cron-master] task morning:hook failed", err);
      log.push(`❌ morning:hook failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ E. ECOSYSTEM: 08:00 UTC = 1:30 PM IST ============
    // Hub promo — ecosystem / leaderboard (community + scale).
    try {
      if ((isInWindow(8, 0) || forceEcosystemPromo) && (forceEcosystemPromo || !(await hasFiredToday(db, "ecosystem:promo")))) {
        const promo = pickHubPromoByPages(["ecosystem", "leaderboard"]);
        await tgBroadcastPhoto({
          photoUrl: hubPromoBannerUrl(promo),
          caption: promo.caption,
          parseMode: "HTML",
          buttons: [{ text: promo.buttonText, url: promo.buttonUrl }],
        });
        await markFired(db, "ecosystem:promo");
        log.push(`🌐 Ecosystem promo — ${promo.page}`);
      }
    } catch (err) {
      await markError(db, "ecosystem:promo", err).catch(() => {});
      console.error("[cron-master] task ecosystem:promo failed", err);
      log.push(`❌ ecosystem:promo failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ F. LIVE BURN PROOF: 10:00 UTC = 3:30 PM IST ============
    // Live buyback receipt + running totals. Note: 10:00 UTC also runs
    // campaignA every 2 days, but the dedup keys differ so both can
    // fire on the same day.
    try {
      if ((isInWindow(10, 0) || forceBurnProof) && (forceBurnProof || !(await hasFiredToday(db, "burn:proof")))) {
        const r = await fetch("https://turboloop.io/api/proxy/buybacks?limit=100", {
          signal: AbortSignal.timeout(8000),
        });
        if (r.ok) {
          const d: any = await r.json();
          const items: any[] = d?.data?.items ?? [];
          if (items.length > 0) {
            const latest = items[0];
            const latestTokens = (parseFloat(latest.tokens_burned) / 1e18).toLocaleString("en-US", { maximumFractionDigits: 0 });
            const latestUsdt = (parseInt(latest.usdt_spent, 10) / 1e18).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
            const totalUsdt = items.reduce((s: number, i: any) => s + parseInt(i.usdt_spent, 10) / 1e18, 0);
            const totalTokens = items.reduce((s: number, i: any) => s + parseFloat(i.tokens_burned) / 1e18, 0);
            // Fetch current price + all-time change — ties deflation to price appreciation
            let burnPriceFooter = "";
            try {
              const [rp2, rh2] = await Promise.all([
                fetch("https://www.turboloop.tech/api/token-price", { signal: AbortSignal.timeout(5000) }),
                fetch("https://www.turboloop.tech/api/token-price-history", { signal: AbortSignal.timeout(5000) }),
              ]);
              const dp2: any = rp2.ok ? await rp2.json() : null;
              const dh2: any = rh2.ok ? await rh2.json() : null;
              const bPrice = dp2?.priceUsd ? `$${Number(dp2.priceUsd).toFixed(6)}` : null;
              const bAt = dh2?.priceChangeAllTime != null
                ? `${dh2.priceChangeAllTime >= 0 ? "+" : ""}${(dh2.priceChangeAllTime * 100).toFixed(2)}%`
                : null;
              if (bPrice) burnPriceFooter = `\n\n💰 <b>Current $TURBO:</b> ${bPrice}${bAt ? ` (<b>${bAt}</b> since launch)` : ""}`;
            } catch { /* skip */ }
            const captions = [
              `🔥 <b>Deflation in action.</b>\n\nBuyback #${latest.execution_number} just completed:\n💵 ${latestUsdt} USDT used to buy and burn <b>${latestTokens} TURBO</b>.\n\n📊 <b>All-time totals:</b>\n🔥 ${totalTokens.toLocaleString("en-US", { maximumFractionDigits: 0 })} TURBO burned\n💵 $${totalUsdt.toLocaleString("en-US", { maximumFractionDigits: 0 })} USDT committed\n\nEvery buyback makes the remaining supply more scarce.${burnPriceFooter}\n\n🔗 https://www.turboloop.tech/token`,
              `📉 <b>Supply is shrinking.</b>\n\nThe most recent buyback burned <b>${latestTokens} TURBO</b> using ${latestUsdt} of protocol revenue.\n\nRunning total: <b>${totalTokens.toLocaleString("en-US", { maximumFractionDigits: 0 })} TURBO</b> permanently removed from circulation.\n\nThis is not a promise. It's an on-chain fact.${burnPriceFooter}\n\n🔗 https://www.turboloop.tech/token`,
              `💡 <b>How the burn works.</b>\n\n10% of all admin fees go to the Buyback &amp; Burn contract. It executes automatically \u2014 no team approval needed.\n\nLatest execution #${latest.execution_number}: ${latestUsdt} \u2192 <b>${latestTokens} TURBO</b> burned.\nTotal burned to date: <b>${totalTokens.toLocaleString("en-US", { maximumFractionDigits: 0 })} TURBO</b>.${burnPriceFooter}\n\n🔗 https://www.turboloop.tech/token`,
              `⚙️ <b>Automated scarcity.</b>\n\nNo manual intervention. The smart contract just executed buyback #${latest.execution_number}.\n\n💵 ${latestUsdt} USDT deployed\n🔥 <b>${latestTokens} TURBO</b> destroyed forever\n\nTotal burned so far: <b>${totalTokens.toLocaleString("en-US", { maximumFractionDigits: 0 })} TURBO</b>.${burnPriceFooter}\n\n🔗 https://www.turboloop.tech/token`,
              `🔒 <b>Verifiable deflation.</b>\n\nDon't trust us, check the blockchain. Buyback #${latest.execution_number} is complete.\n\n🔥 <b>${latestTokens} TURBO</b> burned using ${latestUsdt} from protocol fees.\n\nTotal supply reduced by: <b>${totalTokens.toLocaleString("en-US", { maximumFractionDigits: 0 })} TURBO</b>.${burnPriceFooter}\n\n🔗 https://www.turboloop.tech/token`,
            ];
            const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
            const caption = captions[day % captions.length];
            await tgBroadcastMessage({
              text: caption,
              parseMode: "HTML",
              disablePreview: true,
              buttons: [{ text: "🔥 View burn history", url: "https://www.turboloop.tech/token" }],
            });
            await markFired(db, "burn:proof");
            log.push(`🔥 Burn proof — #${latest.execution_number}, ${latestTokens} TURBO`);
          }
        }
      }
    } catch (err) {
      await markError(db, "burn:proof", err).catch(() => {});
      console.error("[cron-master] task burn:proof failed", err);
      log.push(`❌ burn:proof failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ G. COMMUNITY VOICE: 16:00 UTC = 9:30 PM IST ============
    // Hub promo — community / FAQ (trust + belonging).
    try {
      if ((isInWindow(17, 15) || forceCommunityPromo) && (forceCommunityPromo || !(await hasFiredToday(db, "community:promo")))) { // moved from 16:00 — clear Zoom window
        const promo = pickHubPromoByPages(["community", "faq"]);
        await tgBroadcastPhoto({
          photoUrl: hubPromoBannerUrl(promo),
          caption: promo.caption,
          parseMode: "HTML",
          buttons: [{ text: promo.buttonText, url: promo.buttonUrl }],
        });
        await markFired(db, "community:promo");
        log.push(`🤝 Community promo — ${promo.page}`);
      }
    } catch (err) {
      await markError(db, "community:promo", err).catch(() => {});
      console.error("[cron-master] task community:promo failed", err);
      log.push(`❌ community:promo failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ H. LIVE STATS: 20:00 UTC = 1:30 AM IST next day ============
    // DexScreener end-of-day snapshot. Same 3-caption rotation pattern
    // as global:reach and burn:proof.
    try {
      if ((isInWindow(20, 0) || forceLiveStats) && (forceLiveStats || !(await hasFiredToday(db, "live:stats")))) {
        const PAIR = "0x5bede66bb27184001960e769efab95304f0e1759";
        // Fetch 7d / all-time price change from our own cached history endpoint
        // (GeckoTerminal OHLCV, 5-min cache). Runs in parallel with DexScreener.
        let change7d: number | null = null;
        let changeAllTime: number | null = null;
        let daysSinceLaunch = 0;
        try {
          const rh = await fetch("https://www.turboloop.tech/api/token-price-history", {
            signal: AbortSignal.timeout(6000),
          });
          if (rh.ok) {
            const dh: any = await rh.json();
            change7d = dh?.priceChange7d ?? null;
            changeAllTime = dh?.priceChangeAllTime ?? null;
            daysSinceLaunch = dh?.daysSinceLaunch ?? 0;
          }
        } catch { /* history unavailable — omit extended lines */ }
        // Format helper: decimal fraction → "+12.34%" string
        const fmtPct = (v: number | null): string | null =>
          v === null ? null : `${v >= 0 ? "+" : ""}${(v * 100).toFixed(2)}%`;
        const change7dStr = daysSinceLaunch >= 7 ? fmtPct(change7d) : null;
        const changeAllTimeStr = fmtPct(changeAllTime);
        // Extended change block appended after 24h line (only shown when data available)
        const extBlock = [
          change7dStr ? `📅 7d: <b>${change7dStr}</b>` : null,
          changeAllTimeStr ? `🚀 Since launch: <b>${changeAllTimeStr}</b>` : null,
        ].filter(Boolean).join("\n");
        const r = await fetch(`https://api.dexscreener.com/latest/dex/pairs/bsc/${PAIR}`, {
          signal: AbortSignal.timeout(8000),
        });
        if (r.ok) {
          const d: any = await r.json();
          const pair = d?.pairs?.[0];
          if (pair) {
            const price = Number(pair.priceUsd ?? 0).toFixed(6);
            const liq = Number(pair.liquidity?.usd ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
            const vol24h = Number(pair.volume?.h24 ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
            const change24h = pair.priceChange?.h24 ?? 0;
            const changeStr = `${change24h >= 0 ? "+" : ""}${Number(change24h).toFixed(2)}%`;
            // ext suffix: blank line + extended block if available, else empty string
            const ext = extBlock ? `\n${extBlock}` : "";
            const captions = [
              `📊 <b>$TURBO — end of day snapshot.</b>\n\n💰 Price: <b>$${price}</b>\n📈 24h: <b>${changeStr}</b>${ext}\n\n💧 Liquidity: <b>${liq}</b>\n📊 Volume 24h: <b>${vol24h}</b>\n\nThe protocol is open. The numbers are public. The liquidity is locked.\n\n🔗 https://dexscreener.com/bsc/${PAIR}`,
              `🔍 <b>Transparency check.</b>\n\nEvery number below is verifiable on-chain, right now:\n\n💰 $TURBO price: <b>$${price}</b>\n📈 24h: <b>${changeStr}</b>${ext}\n\n💧 Locked liquidity: <b>${liq}</b>\n📊 24h volume: <b>${vol24h}</b>\n\nNo team can move the liquidity. No one controls the price.\n\n🔗 https://dexscreener.com/bsc/${PAIR}`,
              `💡 <b>What does a healthy DeFi protocol look like?</b>\n\nThis:\n\n💰 Price: <b>$${price}</b>\n📈 24h: <b>${changeStr}</b>${ext}\n\n💧 Liquidity: <b>${liq}</b> — 100% locked\n📊 Volume: <b>${vol24h}</b> in 24h\n\nReal volume. Real liquidity. Real yield.\n\n🔗 https://www.turboloop.tech/token`,
              `📈 <b>The numbers don't lie.</b>\n\nLive metrics straight from the blockchain:\n\n💰 Price: <b>$${price}</b>\n📈 24h: <b>${changeStr}</b>${ext}\n\n💧 Liquidity: <b>${liq}</b>\n📊 24h Volume: <b>${vol24h}</b>\n\nNo hidden wallets. No admin keys. Just code.\n\n🔗 https://dexscreener.com/bsc/${PAIR}`,
              `⚡ <b>$TURBO Daily Pulse</b>\n\n💰 Price: <b>$${price}</b>\n📈 24h: <b>${changeStr}</b>${ext}\n\n💧 Liquidity: <b>${liq}</b>\n📊 24h Volume: <b>${vol24h}</b>\n\n100% of LP tokens are locked on-chain. Verify it yourself.\n\n🔗 https://www.turboloop.tech/security`,
            ];
            const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
            const caption = captions[day % captions.length];
            await tgBroadcastMessage({
              text: caption,
              parseMode: "HTML",
              disablePreview: true,
              buttons: [{ text: "📊 Live chart", url: `https://dexscreener.com/bsc/${PAIR}` }],
            });
            await markFired(db, "live:stats");
            log.push(`📊 Live stats — $${price} (${changeStr})`);
          }
        }
      }
    } catch (err) {
      await markError(db, "live:stats", err).catch(() => {});
      console.error("[cron-master] task live:stats failed", err);
      log.push(`❌ live:stats failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ I. NIGHTLY EDUCATION: 22:00 UTC = 3:30 AM IST next day ============
    // Hub promo — learn / blog / roadmap (long-term conviction).
    try {
      if ((isInWindow(22, 0) || forceNightlyEducation) && (forceNightlyEducation || !(await hasFiredToday(db, "nightly:education")))) {
        const promo = pickHubPromoByPages(["learn", "blog", "roadmap"]);
        await tgBroadcastPhoto({
          photoUrl: hubPromoBannerUrl(promo),
          caption: promo.caption,
          parseMode: "HTML",
          buttons: [{ text: promo.buttonText, url: promo.buttonUrl }],
        });
        await markFired(db, "nightly:education");
        log.push(`📚 Nightly education — ${promo.page}`);
      }
    } catch (err) {
      await markError(db, "nightly:education", err).catch(() => {});
      console.error("[cron-master] task nightly:education failed", err);
      log.push(`❌ nightly:education failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ J. BOT COMMANDS GUIDE: 11:30 UTC = 5:00 PM IST ============
    // Rotates through 3 caption variants (by day-of-week % 3) so it never
    // feels repetitive. Teaches the community about /ask and all commands.
    try {
      if ((isInWindow(11, 30) || forceBotCommands) && (forceBotCommands || !(await hasFiredToday(db, "bot:commands")))) {
        const variant = new Date().getUTCDay() % 5; // 0, 1, 2, 3, or 4
        const captions = [
          // Variant 0 — spotlight /ask AI
          `🤖 <b>Meet Your TurboLoop AI Assistant</b>\n\nType <code>/ask</code> followed by any question and our AI answers instantly using the full TurboLoop knowledge base.\n\n<b>Try it now:</b>\n\u2022 <code>/ask how does the referral system work?</code>\n\u2022 <code>/ask what is the Ultimate Loop plan?</code>\n\u2022 <code>/ask how do I set up MetaMask for BSC?</code>\n\nNo waiting. No searching. Just ask. 💡`,
          // Variant 1 — full command list
          `💬 <b>TurboLoop Bot Commands</b>\n\nGet instant answers:\n\n🔹 <code>/ask [question]</code> — AI answers anything about TurboLoop\n🔹 <code>/price</code> — Live $TURBO price\n🔹 <code>/burns</code> — Latest buyback &amp; burn data\n🔹 <code>/stats</code> — Live protocol stats\n🔹 <code>/top</code> — Global community leaderboard\n🔹 <code>/plans</code> — All 4 Loop Plans\n🔹 <code>/referral</code> — 20-level referral system\n🔹 <code>/payout</code> — Payout schedule\n🔹 <code>/calculator</code> — Yield calculator\n\nType any keyword and the bot responds automatically too. ⚡`,
          // Variant 2 — FOMO angle
          `❓ <b>Have a question about TurboLoop?</b>\n\nDon't scroll through old messages. Just type:\n\n<code>/ask your question here</code>\n\nOur AI has read every article, every plan detail, every security audit, and every FAQ. It answers in seconds — right here in this chat.\n\nOther quick commands: <code>/price</code> <code>/burns</code> <code>/stats</code> <code>/plans</code> <code>/referral</code>\n\n💬 Ask anything. We built this for you.`,
          // Variant 3 — security and transparency focus
          `🛡️ <b>Verify everything instantly.</b>\n\nWant to check the contract? See the audit? Understand the LP lock?\n\nType <code>/ask where is the audit?</code> or <code>/ask how is the LP locked?</code>\n\nOur AI pulls direct links to BscScan, SolidityScan, and the official documentation. Don't trust. Verify.\n\nOther commands: <code>/contract</code> <code>/stats</code> <code>/burns</code>`,
          // Variant 4 — earning focus
          `💰 <b>Maximize your yield.</b>\n\nNot sure which plan is right for you? Want to understand the $TURBO token rewards?\n\nType <code>/ask how do token rewards work?</code> or <code>/ask what is the difference between Power and Ultimate?</code>\n\nGet instant clarity on how to compound your returns.\n\nQuick links: <code>/plans</code> <code>/calculator</code> <code>/payout</code>`,
        ];
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const channelId = process.env.TELEGRAM_CHANNEL;
        if (token && channelId) {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: channelId,
              text: captions[variant],
              parse_mode: "HTML",
            }),
          });
        }
        await markFired(db, "bot:commands");
        log.push(`🤖 Bot commands guide — variant ${variant}`);
      }
    } catch (err) {
      await markError(db, "bot:commands", err).catch(() => {});
      console.error("[cron-master] task bot:commands failed", err);
      log.push(`❌ bot:commands failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ K. SOCIAL WALL: 13:00 UTC = 6:30 PM IST ============
    // Hub promo — social-wall / submit (creator focus).
    try {
      const forceSocialWall = reqUrl.searchParams.get("force") === "social:wall";
      if ((isInWindow(13, 0) || forceSocialWall) && (forceSocialWall || !(await hasFiredToday(db, "social:wall")))) {
        const promo = pickHubPromoByPages(["social-wall", "submit"]);
        const photoUrl = hubPromoBannerUrl(promo);
        const tgResults = await tgBroadcastPhoto({
          photoUrl,
          caption: promo.caption,
          parseMode: "HTML",
          buttons: [{ text: promo.buttonText, url: promo.buttonUrl }],
        });
        const tgSummary = tgResults.map(r => `${r.chatId}:${r.ok ? 'ok' : r.error}`).join(', ');
        await markFired(db, "social:wall");
        log.push(`📱 Social wall promo — ${promo.page} | banner: ${photoUrl} | tg: ${tgSummary}`);
      }
    } catch (err) {
      await markError(db, "social:wall", err).catch(() => {});
      console.error("[cron-master] task social:wall failed", err);
      log.push(`❌ social:wall failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ L. EVENTS PROMO: 17:00 UTC = 10:30 PM IST ============
    // Hub promo — events / apply (offline community focus).
    try {
      const forceEventsPromo = reqUrl.searchParams.get("force") === "events:promo";
      if ((isInWindow(17, 30) || forceEventsPromo) && (forceEventsPromo || !(await hasFiredToday(db, "events:promo")))) { // moved from 17:00 — clear Zoom window
        const promo = pickHubPromoByPages(["events", "apply"]);
        await tgBroadcastPhoto({
          photoUrl: hubPromoBannerUrl(promo),
          caption: promo.caption,
          parseMode: "HTML",
          buttons: [{ text: promo.buttonText, url: promo.buttonUrl }],
        });
        await markFired(db, "events:promo");
        log.push(`🎟️ Events promo — ${promo.page}`);
      }
    } catch (err) {
      await markError(db, "events:promo", err).catch(() => {});
      console.error("[cron-master] task events:promo failed", err);
      log.push(`❌ events:promo failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ════════════════════════════════════════════════════════════════
    //  End of expanded schedule. Existing slots resume below.
    // ════════════════════════════════════════════════════════════════

    // (Creatives promo slots moved below — they need daysSinceLaunch which is declared at line ~1838)

    // ============ 7. CAMPAIGN A — events page promo, 10:00 UTC every 2 days ============
    // Picks today's scheduled A1–A8 post by exact date match (each post
    // has a fixed `date` in _campaigns.ts). The campaign self-terminates
    // after A8 fires on May 29 because todaysCampaignPost returns null
    // for any subsequent UTC date.
    try {
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
    } catch (err) {
      await markError(db, "campaignA", err).catch(() => {});
      console.error("[cron-master] task campaignA failed", err);
      log.push(`❌ campaignA failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ 8. GERMAN CHANNEL DAILY — 11:00 UTC, @TurboLoopDach ============
    // Rotates the A1–A8 visuals on an 8-day cycle with German captions
    // and a BitPat referral CTA appended. Sends ONLY to the German chat
    // (TELEGRAM_GERMAN_CHAT) — bypasses tgBroadcastPhoto's default
    // channel/chat pair on purpose so the English channels don't see
    // duplicate German content.
    try {
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
    } catch (err) {
      await markError(db, "germanDaily", err).catch(() => {});
      console.error("[cron-master] task germanDaily failed", err);
      log.push(`❌ germanDaily failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ 9. CAMPAIGN B — Port Harcourt countdown ============
    //   Standard slot: 13:00 UTC for B1–B6
    //   Event-day slot: 06:00 UTC for B7 only (event-morning post)
    //
    // We branch on the today's scheduled post's id so the data file
    // remains the single source of truth for which post fires when.
    try {
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
    } catch (err) {
      await markError(db, "campaignB", err).catch(() => {});
      console.error("[cron-master] task campaignB failed", err);
      log.push(`❌ campaignB failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ 11. OMNI-COMPOSER SCHEDULED POSTS (Automation V2) ============
    // Process anything in `scheduled_posts` with status='pending' AND
    // next_run_at <= now. Each post wraps in its own try/catch — one
    // bad post can't sink the queue or the hardcoded slots above.
    // Limit 25/tick keeps function timeout in check; if more are due
    // they'll pick up on the next 5-min tick.
    try {
      const dueRows = await db
        .select()
        .from(scheduledPosts)
        .where(
          and(
            eq(scheduledPosts.status, "pending"),
            lte(scheduledPosts.nextRunAt, new Date())
          )
        )
        .orderBy(asc(scheduledPosts.nextRunAt))
        .limit(25);

      for (const post of dueRows) {
        try {
          // Mark running to claim the row — a concurrent 5-min tick
          // (rare but possible if Vercel doubles up) won't re-pick it.
          await db
            .update(scheduledPosts)
            .set({ status: "running" })
            .where(eq(scheduledPosts.id, post.id));

          const channelLog = await dispatchScheduledPost(db, post);

          // Success — branch on schedule type.
          if (post.scheduleType === "once") {
            await db
              .update(scheduledPosts)
              .set({
                status: "completed",
                fireCount: (post.fireCount ?? 0) + 1,
                lastFiredAt: new Date(),
                lastError: null,
              })
              .where(eq(scheduledPosts.id, post.id));
          } else {
            // Recurring — recompute nextRunAt from the cron expression.
            // If the expression is missing/invalid (shouldn't happen
            // because tRPC validated at create time, but defensive),
            // mark failed so the admin can fix it.
            if (!post.cronExpression) {
              throw new Error("Recurring post is missing cronExpression");
            }
            const next = await nextCronFire(post.cronExpression);
            await db
              .update(scheduledPosts)
              .set({
                status: "pending",
                nextRunAt: next,
                fireCount: (post.fireCount ?? 0) + 1,
                lastFiredAt: new Date(),
                lastError: null,
              })
              .where(eq(scheduledPosts.id, post.id));
          }

          log.push(
            `🧩 omni #${post.id} → ${channelLog.join(", ")}` +
              (post.scheduleType === "recurring" ? " (recurring, next scheduled)" : " (once-completed)")
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          await db
            .update(scheduledPosts)
            .set({ status: "failed", lastError: msg.slice(0, 1000) })
            .where(eq(scheduledPosts.id, post.id))
            .catch(() => {});
          console.error(`[cron-master] omni post #${post.id} failed`, err);
          log.push(`❌ omni #${post.id} failed: ${msg.slice(0, 200)}`);
        }
      }
    } catch (err) {
      await markError(db, "omniComposer", err).catch(() => {});
      console.error("[cron-master] omniComposer queue scan failed", err);
      log.push(`❌ omniComposer queue scan failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============================================================
    // CAMPAIGN CREATIVES — 12 hourly slots, one category per slot
    // ============================================================
    // Each slot pulls today's banner from R2 (rotation = daysSinceLaunch
    // mod the category file count, so every banner fires deterministically
    // and no two days repeat within a full cycle), picks today's caption
    // from the matching 12-entry pool (also `pickByDay`-rotated), appends
    // a one-line live $TURBO price + all-time change, and fans out via
    // tgBroadcastPhoto (channel-only — the channel's native auto-forward
    // handles the linked group).
    //
    // Slot picks intentionally avoid existing windows to prevent
    // double-posts:
    //   12:30 not 12:00 → avoids monthly:compound
    //   13:30 not 15:00 → avoids zoom:hi T-60 (Hindi audience would see
    //                     both the campaign and the zoom reminder back-
    //                     to-back if they shared the 15:00 slot)
    //   14:30 not 14:00 → avoids blog:evening
    //   09:30 not 09:00 → avoids hubPromo
    const daysSinceLaunch = Math.max(
      0,
      Math.floor(
        (Date.now() - new Date("2026-06-01T00:00:00Z").getTime()) / 86_400_000
      )
    );

    // Build the live-price suffix once per cron tick. If the upstream
    // routes are flapping we just omit the line — the caption alone is
    // still on-brand and useful.
    let campaignPriceLine = "";
    try {
      const [rpc, rhc] = await Promise.all([
        fetch("https://www.turboloop.tech/api/token-price", {
          signal: AbortSignal.timeout(5000),
        }).catch(() => null),
        fetch("https://www.turboloop.tech/api/token-price-history", {
          signal: AbortSignal.timeout(5000),
        }).catch(() => null),
      ]);
      const dpc: any = rpc && rpc.ok ? await rpc.json() : null;
      const dhc: any = rhc && rhc.ok ? await rhc.json() : null;
      const priceStr = dpc?.priceUsd
        ? `$${Number(dpc.priceUsd).toFixed(6)}`
        : null;
      // 24h change — from token-price endpoint (priceChange24h is a decimal, e.g. 0.1791 = +17.91%)
      const change24h: number | null = dpc?.priceChange24h != null ? Number(dpc.priceChange24h) : null;
      const change24hStr = change24h != null
        ? `${change24h >= 0 ? "📈" : "📉"} 24h: <b>${change24h >= 0 ? "+" : ""}${(change24h * 100).toFixed(2)}%</b>`
        : null;
      // 7d change — from token-price-history endpoint (priceChange7d is a decimal)
      const change7d: number | null = dhc?.priceChange7d != null ? Number(dhc.priceChange7d) : null;
      const change7dStr = change7d != null
        ? `📅 7d: <b>${change7d >= 0 ? "+" : ""}${(change7d * 100).toFixed(2)}%</b>`
        : null;
      // All-time change
      const atStr =
        dhc?.priceChangeAllTime != null
          ? `${dhc.priceChangeAllTime >= 0 ? "+" : ""}${(dhc.priceChangeAllTime * 100).toFixed(2)}%`
          : null;
      if (priceStr) {
        const changeParts = [change24hStr, change7dStr].filter(Boolean).join("  ");
        campaignPriceLine =
          `\n\n💰 <b>$TURBO:</b> ${priceStr}${atStr ? ` (<b>${atStr}</b> since launch)` : ""}` +
          (changeParts ? `\n${changeParts}` : "");
      }
    } catch {
      // Price feeds down — fall through with no price suffix.
    }


    // ════════════════════════════════════════════════════════════════
    //  CREATIVES PAGE PROMO — 07:30 UTC (Slot A) + 20:30 UTC (Slot B)
    //  10 rotating banners + 10 rotating captions
    //  Each post = photo + caption + inline button to /creatives
    // ════════════════════════════════════════════════════════════════
    const CREATIVES_PROMO_BANNERS = [
      "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/creatives-promo/banner-01.png",
      "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/creatives-promo/banner-02.png",
      "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/creatives-promo/banner-03.png",
      "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/creatives-promo/banner-04.png",
      "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/creatives-promo/banner-05.png",
      "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/creatives-promo/banner-06.png",
      "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/creatives-promo/banner-07.png",
      "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/creatives-promo/banner-08.png",
      "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/creatives-promo/banner-09.png",
      "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/creatives-promo/banner-10.png",
    ];
    const CREATIVES_PROMO_CAPTIONS = [
      `🎨 <b>1,134+ free marketing banners. Right now.</b>\n\nEvery category. Every language. Every format.\nLifestyle. Token. Referral. Objection-handler. Success stories. And more.\n\nDownload any banner in one tap — no login, no design skills needed.\n\n👉 https://turboloop.tech/creatives\n\n#TurboLoop #MarketingKit #FreeResources #DeFiMarketing`,
      `🚀 <b>Your community is your marketing team.</b>\n\nGive them the tools to spread the word.\nTurboLoop's free creatives library has 1,134+ banners across 28 categories — ready to share on Telegram, WhatsApp, Instagram, and everywhere else.\n\nNo watermarks. No fees. Just results.\n\n👉 https://turboloop.tech/creatives\n\n#TurboLoop #CommunityGrowth #ShareAndEarn #DeFi`,
      `📂 <b>28 categories. One place.</b>\n\nLifestyle ✦ Token ✦ Referral ✦ Objection Handler\nSuccess Stories ✦ Education ✦ Urgency ✦ Buyback\nComparison ✦ Community ✦ Hindi ✦ Nigerian\n\nEvery banner is premium, on-brand, and ready to post.\n\n👉 https://turboloop.tech/creatives\n\n#TurboLoop #MarketingBanners #FreeKit #BSC`,
      `📲 <b>Download. Share. Done.</b>\n\nNo Canva. No Photoshop. No waiting.\nPick a banner, tap download, post it.\nEvery image is sized perfectly for Telegram and WhatsApp.\n\nThe fastest way to market TurboLoop to your network.\n\n👉 https://turboloop.tech/creatives\n\n#TurboLoop #EasyMarketing #ShareToEarn #DeFiTools`,
      `🌍 <b>7 languages. One brand.</b>\n\nEnglish. Hindi. Yoruba. Igbo. Hausa. And more.\nTurboLoop's creatives library speaks your community's language — so your message lands every time.\n\nBrowse by language or category and find the perfect banner in seconds.\n\n👉 https://turboloop.tech/creatives\n\n#TurboLoop #MultiLanguage #GlobalDeFi #MarketingKit`,
      `⚡ <b>Every post you don't share is a missed invite.</b>\n\nYour network is growing. Or someone else's is.\nTurboLoop's free banner library makes it effortless to stay visible, stay relevant, and keep your referral pipeline full.\n\n1,134+ banners. Zero excuses.\n\n👉 https://turboloop.tech/creatives\n\n#TurboLoop #ReferralMarketing #DeFiGrowth #TakeAction`,
      `🏆 <b>The banners your top referrers use — now available to everyone.</b>\n\nPremium marketing materials used to be reserved for the top of the network.\nNot anymore. TurboLoop's entire creative library is free, open, and updated regularly.\n\nBrowse 28 categories. Download anything. Share everywhere.\n\n👉 https://turboloop.tech/creatives\n\n#TurboLoop #LevelUp #FreeMarketing #DeFiCommunity`,
      `📊 <b>The numbers behind the library.</b>\n\n🖼️ 1,134+ banners\n📁 28 categories\n🌍 7 languages\n✅ 100% free · No login · Instant download\n\nEvery banner is on-brand, premium quality, and ready to post right now.\n\n👉 https://turboloop.tech/creatives\n\n#TurboLoop #MarketingHub #FreeTools #DeFi`,
      `🤝 <b>Share a banner. Grow your network.</b>\n\nEvery banner in the TurboLoop library is a referral tool.\nShare one today and let the content do the work.\n\nNo design needed. No cost. Just results.\n\n👉 https://turboloop.tech/creatives\n\n#TurboLoop #ReferralTools #PassiveGrowth #DeFiMarketing`,
      `✨ <b>Free. Premium. Yours.</b>\n\n1,134+ marketing banners built for the TurboLoop community.\nCinematic quality. Professional design. Zero cost.\n\nThe marketing toolkit your uplines never told you existed.\n\n👉 https://turboloop.tech/creatives\n\n#TurboLoop #PremiumFree #MarketingArsenal #DeFiCommunity`,
    ];

    // Slot A — 07:30 UTC (India 1:00 PM, Europe morning)
    try {
      if (
        (forceCreativesPromoA || isInWindow(7, 30) || isMissedToday(7, 30, 90)) &&
        (forceCreativesPromoA || !(await hasFiredToday(db, "creatives:promo:A")))
      ) {
        const bannerUrl = pickByDay(CREATIVES_PROMO_BANNERS, daysSinceLaunch);
        const caption   = pickByDay(CREATIVES_PROMO_CAPTIONS, daysSinceLaunch);
        await tgBroadcastPhoto({ photoUrl: bannerUrl, caption, parseMode: "HTML",
          buttons: [{ text: "🎨 Browse Free Banners →", url: "https://turboloop.tech/creatives" }] });
        await markFired(db, "creatives:promo:A");
        log.push("🎨 creatives:promo:A fired");
      }
    } catch (err) {
      await markError(db, "creatives:promo:A", err).catch(() => {});
      console.error("[cron-master] creatives:promo:A failed", err);
      log.push(`❌ creatives:promo:A failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Slot B — 20:30 UTC (India 2:00 AM IST+1, Americas afternoon)
    try {
      if (
        (forceCreativesPromoB || isInWindow(20, 30) || isMissedToday(20, 30, 90)) &&
        (forceCreativesPromoB || !(await hasFiredToday(db, "creatives:promo:B")))
      ) {
        // Offset by 5 so Slot B banner/caption is always different from Slot A on the same day
        const bannerUrl = pickByDay(CREATIVES_PROMO_BANNERS, daysSinceLaunch + 5);
        const caption   = pickByDay(CREATIVES_PROMO_CAPTIONS, daysSinceLaunch + 5);
        await tgBroadcastPhoto({ photoUrl: bannerUrl, caption, parseMode: "HTML",
          buttons: [{ text: "🎨 Browse Free Banners →", url: "https://turboloop.tech/creatives" }] });
        await markFired(db, "creatives:promo:B");
        log.push("🎨 creatives:promo:B fired");
      }
    } catch (err) {
      await markError(db, "creatives:promo:B", err).catch(() => {});
      console.error("[cron-master] creatives:promo:B failed", err);
      log.push(`❌ creatives:promo:B failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ── 48-slot campaign schedule ─────────────────────────────────────────────
    // One campaign post every 30 minutes, 00:00–23:30 UTC.
    // 12 categories cycle across all 48 slots (each category fires 4×/day).
    // Each slot has a unique taskId (campaign:c01..c48) so dedup is per-slot.
    // slotOffset: per-category occurrence index (0,1,2,3) used to spread
    // banner rotation across the day so no two slots of the same category
    // show the same image. Banner index = daysSinceLaunch * 4 + slotOffset.
    type CampaignSlot = {
      hour: number;
      minute: number;
      taskId: string;
      category: string;
      captions: string[];
      slotOffset: number; // 0-3: which of the 4 daily occurrences this is
    };
    const CAMPAIGN_SLOTS: CampaignSlot[] = [
      // ── 00:xx ──
      { hour:  0, minute:  0, taskId: "campaign:c01", category: "lifestyle",         captions: CAMPAIGN_LIFESTYLE_CAPTIONS,  slotOffset: 0 },
      { hour:  0, minute: 30, taskId: "campaign:c02", category: "token",             captions: CAMPAIGN_TOKEN_CAPTIONS,       slotOffset: 0 },
      // ── 01:xx ──
      { hour:  1, minute:  0, taskId: "campaign:c03", category: "referral",          captions: CAMPAIGN_REFERRAL_CAPTIONS,    slotOffset: 0 },
      { hour:  1, minute: 30, taskId: "campaign:c04", category: "objection-handler", captions: CAMPAIGN_OBJECTION_CAPTIONS,   slotOffset: 0 },
      // ── 02:xx ──
      { hour:  2, minute:  0, taskId: "campaign:c05", category: "hindi-new",         captions: CAMPAIGN_HINDI_CAPTIONS,       slotOffset: 0 },
      { hour:  2, minute: 30, taskId: "campaign:c06", category: "nigerian",          captions: CAMPAIGN_NIGERIAN_CAPTIONS,    slotOffset: 0 },
      // ── 03:xx ──
      { hour:  3, minute:  0, taskId: "campaign:c07", category: "success-story",     captions: CAMPAIGN_SUCCESS_CAPTIONS,     slotOffset: 0 },
      { hour:  3, minute: 30, taskId: "campaign:c08", category: "education-defi",    captions: CAMPAIGN_EDUCATION_CAPTIONS,   slotOffset: 0 },
      // ── 04:xx ──
      { hour:  4, minute:  0, taskId: "campaign:c09", category: "urgency",           captions: CAMPAIGN_URGENCY_CAPTIONS,     slotOffset: 0 },
      { hour:  4, minute: 30, taskId: "campaign:c10", category: "buyback",           captions: CAMPAIGN_BUYBACK_CAPTIONS,     slotOffset: 0 },
      // ── 05:xx ──
      { hour:  5, minute:  0, taskId: "campaign:c11", category: "comparison",        captions: CAMPAIGN_COMPARISON_CAPTIONS,  slotOffset: 0 },
      { hour:  5, minute: 30, taskId: "campaign:c12", category: "community",         captions: CAMPAIGN_COMMUNITY_CAPTIONS,   slotOffset: 0 },
      // ── 06:xx ──
      { hour:  6, minute:  0, taskId: "campaign:c13", category: "lifestyle",         captions: CAMPAIGN_LIFESTYLE_CAPTIONS,  slotOffset: 1 },
      { hour:  6, minute: 30, taskId: "campaign:c14", category: "token",             captions: CAMPAIGN_TOKEN_CAPTIONS,       slotOffset: 1 },
      // ── 07:xx ──
      { hour:  7, minute:  0, taskId: "campaign:c15", category: "referral",          captions: CAMPAIGN_REFERRAL_CAPTIONS,    slotOffset: 1 },
      { hour:  7, minute: 30, taskId: "campaign:c16", category: "objection-handler", captions: CAMPAIGN_OBJECTION_CAPTIONS,   slotOffset: 1 },
      // ── 08:xx ──
      { hour:  8, minute:  0, taskId: "campaign:c17", category: "hindi-new",         captions: CAMPAIGN_HINDI_CAPTIONS,       slotOffset: 1 },      // ── 09:xx ──
      { hour:  9, minute:  0, taskId: "campaign:c19", category: "success-story",     captions: CAMPAIGN_SUCCESS_CAPTIONS,     slotOffset: 1 },
      { hour:  9, minute: 30, taskId: "campaign:c20", category: "education-defi",    captions: CAMPAIGN_EDUCATION_CAPTIONS,   slotOffset: 1 },
      // ── 10:xx ──
      { hour: 10, minute:  0, taskId: "campaign:c21", category: "urgency",           captions: CAMPAIGN_URGENCY_CAPTIONS,     slotOffset: 1 },
      { hour: 10, minute: 30, taskId: "campaign:c22", category: "buyback",           captions: CAMPAIGN_BUYBACK_CAPTIONS,     slotOffset: 1 },
      // ── 11:xx ──
      { hour: 11, minute:  0, taskId: "campaign:c23", category: "comparison",        captions: CAMPAIGN_COMPARISON_CAPTIONS,  slotOffset: 1 },
      { hour: 11, minute: 30, taskId: "campaign:c24", category: "community",         captions: CAMPAIGN_COMMUNITY_CAPTIONS,   slotOffset: 1 },
      // ── 12:xx ──
      { hour: 12, minute:  0, taskId: "campaign:c25", category: "lifestyle",         captions: CAMPAIGN_LIFESTYLE_CAPTIONS,  slotOffset: 2 },
      { hour: 12, minute: 30, taskId: "campaign:c26", category: "token",             captions: CAMPAIGN_TOKEN_CAPTIONS,       slotOffset: 2 },
      // ── 13:xx ──
      { hour: 13, minute:  0, taskId: "campaign:c27", category: "referral",          captions: CAMPAIGN_REFERRAL_CAPTIONS,    slotOffset: 2 },
      { hour: 13, minute: 30, taskId: "campaign:c28", category: "objection-handler", captions: CAMPAIGN_OBJECTION_CAPTIONS,   slotOffset: 2 },
      // ── 14:xx ──
      { hour: 14, minute:  0, taskId: "campaign:c29", category: "hindi-new",         captions: CAMPAIGN_HINDI_CAPTIONS,       slotOffset: 2 },      // ── 14:xx (moved from 15:xx — clear Zoom window 15:00–17:00 UTC) ──
      { hour: 14, minute: 45, taskId: "campaign:c31", category: "success-story",     captions: CAMPAIGN_SUCCESS_CAPTIONS,     slotOffset: 2 },
      // ── 15:xx — ZOOM WINDOW (HI T-60 @ 15:00, T-30 @ 15:30, T-15 @ 15:45, LIVE @ 16:00) ──
      // No campaign posts in this window — keep Zoom sequence clean
      // ── 16:xx — ZOOM WINDOW (EN T-60 @ 16:00, T-30 @ 16:30, T-15 @ 16:45, LIVE @ 17:00) ──
      // No campaign posts in this window — keep Zoom sequence clean
      // ── 17:xx (moved from 15:30, 16:00, 16:30 — after Zoom window ends) ──
      { hour: 17, minute: 15, taskId: "campaign:c32", category: "education-defi",    captions: CAMPAIGN_EDUCATION_CAPTIONS,   slotOffset: 2 },
      { hour: 17, minute: 30, taskId: "campaign:c33", category: "urgency",           captions: CAMPAIGN_URGENCY_CAPTIONS,     slotOffset: 2 },
      { hour: 17, minute: 45, taskId: "campaign:c34", category: "buyback",           captions: CAMPAIGN_BUYBACK_CAPTIONS,     slotOffset: 2 },
      // ── 18:xx (moved from 17:00, 17:30) ──
      { hour: 18, minute:  0, taskId: "campaign:c35", category: "comparison",        captions: CAMPAIGN_COMPARISON_CAPTIONS,  slotOffset: 2 },
      { hour: 18, minute: 15, taskId: "campaign:c36", category: "community",         captions: CAMPAIGN_COMMUNITY_CAPTIONS,   slotOffset: 2 },
      // ── 18:xx (c37/c38 shifted to avoid collision with c35/c36) ──
      { hour: 18, minute: 30, taskId: "campaign:c37", category: "lifestyle",         captions: CAMPAIGN_LIFESTYLE_CAPTIONS,  slotOffset: 3 },
      { hour: 18, minute: 45, taskId: "campaign:c38", category: "token",             captions: CAMPAIGN_TOKEN_CAPTIONS,       slotOffset: 3 },
      // ── 19:xx ──
      { hour: 19, minute:  0, taskId: "campaign:c39", category: "referral",          captions: CAMPAIGN_REFERRAL_CAPTIONS,    slotOffset: 3 },
      { hour: 19, minute: 30, taskId: "campaign:c40", category: "objection-handler", captions: CAMPAIGN_OBJECTION_CAPTIONS,   slotOffset: 3 },
      // ── 20:xx ──
      { hour: 20, minute:  0, taskId: "campaign:c41", category: "hindi-new",         captions: CAMPAIGN_HINDI_CAPTIONS,       slotOffset: 3 },      // ── 21:xx ──
      { hour: 21, minute:  0, taskId: "campaign:c43", category: "success-story",     captions: CAMPAIGN_SUCCESS_CAPTIONS,     slotOffset: 3 },
      { hour: 21, minute: 30, taskId: "campaign:c44", category: "education-defi",    captions: CAMPAIGN_EDUCATION_CAPTIONS,   slotOffset: 3 },
      // ── 22:xx ──
      { hour: 22, minute:  0, taskId: "campaign:c45", category: "urgency",           captions: CAMPAIGN_URGENCY_CAPTIONS,     slotOffset: 3 },
      { hour: 22, minute: 30, taskId: "campaign:c46", category: "buyback",           captions: CAMPAIGN_BUYBACK_CAPTIONS,     slotOffset: 3 },
      // ── 23:xx ──
      { hour: 23, minute:  0, taskId: "campaign:c47", category: "comparison",        captions: CAMPAIGN_COMPARISON_CAPTIONS,  slotOffset: 3 },
      { hour: 23, minute: 30, taskId: "campaign:c48", category: "community",         captions: CAMPAIGN_COMMUNITY_CAPTIONS,   slotOffset: 3 },
      // ── Spanish / LATAM slots — peak times for UTC-6 to UTC-3 timezones ──
      // 12:00 UTC = 06:00 AM Mexico / 08:00 AM Buenos Aires (morning)
      // 16:00 UTC = 10:00 AM Mexico / 12:00 PM Buenos Aires (mid-morning) — outside Zoom window
      // 21:00 UTC = 15:00 PM Mexico / 17:00 PM Buenos Aires (afternoon peak)
      // 23:30 UTC = 17:30 PM Mexico / 19:30 PM Buenos Aires (evening prime)
      { hour: 12, minute: 45, taskId: "campaign:es01", category: "spanish", captions: CAMPAIGN_SPANISH_CAPTIONS, slotOffset: 0 },      // Indonesian — 4 daily slots (staggered)
      { hour: 1, minute: 45, taskId: "campaign:id01", category: "indonesian", captions: CAMPAIGN_INDONESIAN_CAPTIONS, slotOffset: 0 },      // Chinese — 4 daily slots
      { hour:  2, minute: 15, taskId: "campaign:zh01", category: "chinese", captions: CAMPAIGN_CHINESE_CAPTIONS, slotOffset: 0 },      // Italian — 4 daily slots
      { hour:  3, minute: 15, taskId: "campaign:it01", category: "italian", captions: CAMPAIGN_ITALIAN_CAPTIONS, slotOffset: 0 },      // Arabic — 4 daily slots
      { hour:  4, minute: 15, taskId: "campaign:ar01", category: "arabic", captions: CAMPAIGN_ARABIC_CAPTIONS, slotOffset: 0 },      // Urdu — 4 daily slots
      { hour:  4, minute: 45, taskId: "campaign:ur01", category: "urdu", captions: CAMPAIGN_URDU_CAPTIONS, slotOffset: 0 },      // German — 4 daily slots (DACH timezone friendly)
      { hour:  6, minute: 45, taskId: "campaign:de01", category: "german", captions: CAMPAIGN_GERMAN_CAPTIONS, slotOffset: 0 },    ];

    // Force-fire map: ?force=campaign:c01,campaign:c02 etc.
    // Legacy named keys still work for manual triggers.
    const campaignForceSet = new Set(
      forceSet.has("campaign:all")
        ? CAMPAIGN_SLOTS.map(s => s.taskId)
        : CAMPAIGN_SLOTS.map(s => s.taskId).filter(id => forceSet.has(id))
    );
    // Also support legacy named forces (e.g. ?force=campaign:lifestyle fires c01,c13,c25,c37)
    const legacyCategoryForce: Record<string, string[]> = {
      "campaign:lifestyle":  ["campaign:c01","campaign:c13","campaign:c25","campaign:c37"],
      "campaign:token":      ["campaign:c02","campaign:c14","campaign:c26","campaign:c38"],
      "campaign:referral":   ["campaign:c03","campaign:c15","campaign:c27","campaign:c39"],
      "campaign:objection":  ["campaign:c04","campaign:c16","campaign:c28","campaign:c40"],
      "campaign:hindi":      ["campaign:c05","campaign:c17","campaign:c29","campaign:c41"],
      "campaign:naija":      ["campaign:c06","campaign:c18","campaign:c30","campaign:c42"],
      "campaign:success":    ["campaign:c07","campaign:c19","campaign:c31","campaign:c43"],
      "campaign:education":  ["campaign:c08","campaign:c20","campaign:c32","campaign:c44"],
      "campaign:urgency":    ["campaign:c09","campaign:c21","campaign:c33","campaign:c45"],
      "campaign:buyback":    ["campaign:c10","campaign:c22","campaign:c34","campaign:c46"],
      "campaign:comparison": ["campaign:c11","campaign:c23","campaign:c35","campaign:c47"],
      "campaign:community":  ["campaign:c12","campaign:c24","campaign:c36","campaign:c48"],
    };
    for (const [legacyKey, slotIds] of Object.entries(legacyCategoryForce)) {
      if (forceSet.has(legacyKey)) slotIds.forEach(id => campaignForceSet.add(id));
    }

    // ── TG delivery verification helper ──────────────────────────────────────
    // Calls tgBroadcastPhoto, checks every channel result, retries once on
    // failure, logs delivery status to DB so the admin panel can surface it.
    const sendCampaignWithVerification = async (
      taskId: string,
      imgUrl: string,
      caption: string
    ): Promise<{ delivered: number; channels: number; failed: number }> => {
      const attempt = async () =>
        tgBroadcastPhoto({ photoUrl: imgUrl, caption, parseMode: "HTML" });

      let results = await attempt();

      // Retry any failed channels once after 3 s
      const failedChannels = results.filter(r => !r.ok);
      if (failedChannels.length > 0) {
        await new Promise(r => setTimeout(r, 3000));
        const retryResults = await attempt();
        // Merge: prefer retry result for each chatId
        const retryMap = new Map(retryResults.map(r => [r.chatId, r]));
        results = results.map(r => retryMap.get(r.chatId) ?? r);
      }

      const delivered = results.filter(r => r.ok).length;
      const failed    = results.filter(r => !r.ok).length;

      // Log delivery status to DB (tgDelivery:<taskId>:<date>)
      const deliveryKey = `tgDelivery:${taskId}:${todayKey()}`;
      const deliveryVal = JSON.stringify({
        at: new Date().toISOString(),
        delivered,
        failed,
        channels: results.map(r => ({ id: r.chatId, ok: r.ok, err: r.error })),
      });
      await db
        .insert(siteSettings)
        .values({ settingKey: deliveryKey, settingValue: deliveryVal })
        .onConflictDoUpdate({ target: siteSettings.settingKey, set: { settingValue: deliveryVal } })
        .catch(() => {});

      // If ALL channels failed, throw so markError is called and slot can retry
      if (delivered === 0 && results.length > 0) {
        const errMsg = results.map(r => `${r.chatId}: ${r.error}`).join("; ");
        throw new Error(`TG delivery failed on all channels — ${errMsg}`);
      }

      return { delivered, channels: results.length, failed };
    };

    for (const slot of CAMPAIGN_SLOTS) {
      const forceSlot = campaignForceSet.has(slot.taskId);
      try {
        const shouldFire =
          forceSlot ||
          isInWindow(slot.hour, slot.minute) ||
          isMissedToday(slot.hour, slot.minute, 90);
        if (!shouldFire || (!forceSlot && (await hasFiredToday(db, slot.taskId)))) {
          continue;
        }
        // Use daysSinceLaunch * 4 + slotOffset as the rotation index so that
        // all 4 daily occurrences of the same category show DIFFERENT banners.
        // With 30-50 banners per category this gives 7.5-12.5 days before any repeat.
        const rotationIndex = daysSinceLaunch * 4 + slot.slotOffset;
        const imgUrl  = campaignBannerUrl(slot.category, rotationIndex);
        // Price line only on token posts — other categories don't need it
        const priceSuffix = slot.category === "token" ? campaignPriceLine : "";
        const caption = pickByDay(slot.captions, rotationIndex) + priceSuffix;
        const { delivered, channels, failed } =
          await sendCampaignWithVerification(slot.taskId, imgUrl, caption);
        // Only mark fired if at least one channel received the post
        await markFired(db, slot.taskId);
        log.push(`📣 ${slot.taskId} → ${slot.category} (✅ ${delivered}/${channels} channels)`);
        if (failed > 0) {
          log.push(`⚠️ ${slot.taskId}: ${failed} channel(s) failed but ${delivered} delivered`);
        }
      } catch (err) {
        await markError(db, slot.taskId, err).catch(() => {});
        console.error(`[cron-master] ${slot.taskId} failed`, err);
        log.push(
          `❌ ${slot.taskId} failed: ${err instanceof Error ? err.message : String(err)}`
        );
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
