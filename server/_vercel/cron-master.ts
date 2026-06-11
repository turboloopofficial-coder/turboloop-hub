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
import { blogPostCaption, launchAnnouncementCaption, zoomReminderCaption, pickTodaysFilm, cinematicCaption, cinematicPosterUrl, pickTodaysMonthlyBanner, monthlyBannerUrl, monthlyCompoundingCaption, pickTodaysHubPromo, hubPromoBannerUrl, pickHubPromoByPages, MONTHLY_COMPOUND_BANNERS, type ZoomLang, type ZoomTier } from "./_messagePools";
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

function isInWindow(targetHour: number, targetMin: number, graceMin = 7): boolean {
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
      for (const key of resetSet) {
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

    // ============ 3. HINDI/URDU ZOOM T-30: 15:00 UTC = 8:30 PM IST ============
    // Zoom link + passcode now resolve through getZoomConfig (Task C),
    // which reads admin overrides from `site_settings` and falls back
    // to the hardcoded ZOOM_HI defaults if unset or invalid.
    try {
      if (isInWindow(15, 0) && !(await hasFiredToday(db, "zoom:hi:T30"))) {
        const cfg = await getZoomConfig("hi");
        await sendZoomReminder("hi", "T30", cfg.link, cfg.passcode, cfg.timeLabel);
        await markFired(db, "zoom:hi:T30");
        log.push("🎙 HI Zoom T-30");
      }
    } catch (err) {
      await markError(db, "zoom:hi:T30", err).catch(() => {});
      console.error("[cron-master] task zoom:hi:T30 failed", err);
      log.push(`❌ zoom:hi:T30 failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ============ 4. ENGLISH ZOOM T-30: 16:30 UTC = 10:00 PM IST ============
    try {
      if (isInWindow(16, 30) && !(await hasFiredToday(db, "zoom:en:T30"))) {
        const cfg = await getZoomConfig("en");
        await sendZoomReminder("en", "T30", cfg.link, cfg.passcode, cfg.timeLabel);
        await markFired(db, "zoom:en:T30");
        log.push("🎙 EN Zoom T-30");
      }
    } catch (err) {
      await markError(db, "zoom:en:T30", err).catch(() => {});
      console.error("[cron-master] task zoom:en:T30 failed", err);
      log.push(`❌ zoom:en:T30 failed: ${err instanceof Error ? err.message : String(err)}`);
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
        const caption = monthlyCompoundingCaption(banner);
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
            const captions = [
              `🔥 <b>Deflation in action.</b>\n\nBuyback #${latest.execution_number} just completed:\n💵 ${latestUsdt} USDT used to buy and burn <b>${latestTokens} TURBO</b>.\n\n📊 <b>All-time totals:</b>\n🔥 ${totalTokens.toLocaleString("en-US", { maximumFractionDigits: 0 })} TURBO burned\n💵 $${totalUsdt.toLocaleString("en-US", { maximumFractionDigits: 0 })} USDT committed\n\nEvery buyback makes the remaining supply more scarce.\n\n🔗 https://www.turboloop.tech/token`,
              `📉 <b>Supply is shrinking.</b>\n\nThe most recent buyback burned <b>${latestTokens} TURBO</b> using ${latestUsdt} of protocol revenue.\n\nRunning total: <b>${totalTokens.toLocaleString("en-US", { maximumFractionDigits: 0 })} TURBO</b> permanently removed from circulation.\n\nThis is not a promise. It's an on-chain fact.\n\n🔗 https://www.turboloop.tech/token`,
              `💡 <b>How the burn works.</b>\n\n10% of all admin fees go to the Buyback &amp; Burn contract. It executes automatically — no team approval needed.\n\nLatest execution #${latest.execution_number}: ${latestUsdt} → <b>${latestTokens} TURBO</b> burned.\nTotal burned to date: <b>${totalTokens.toLocaleString("en-US", { maximumFractionDigits: 0 })} TURBO</b>.\n\n🔗 https://www.turboloop.tech/token`,
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
      if ((isInWindow(16, 0) || forceCommunityPromo) && (forceCommunityPromo || !(await hasFiredToday(db, "community:promo")))) {
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
            const captions = [
              `📊 <b>$TURBO — end of day snapshot.</b>\n\n💰 Price: <b>$${price}</b> (${changeStr} 24h)\n💧 Liquidity: <b>${liq}</b>\n📈 Volume 24h: <b>${vol24h}</b>\n\nThe protocol is open. The numbers are public. The liquidity is locked.\n\n🔗 https://dexscreener.com/bsc/${PAIR}`,
              `🔍 <b>Transparency check.</b>\n\nEvery number below is verifiable on-chain, right now:\n\n💰 $TURBO price: <b>$${price}</b>\n💧 Locked liquidity: <b>${liq}</b>\n📈 24h volume: <b>${vol24h}</b>\n\nNo team can move the liquidity. No one controls the price.\n\n🔗 https://dexscreener.com/bsc/${PAIR}`,
              `💡 <b>What does a healthy DeFi protocol look like?</b>\n\nThis:\n\n💰 Price: <b>$${price}</b> (${changeStr})\n💧 Liquidity: <b>${liq}</b> — 100% locked\n📈 Volume: <b>${vol24h}</b> in 24h\n\nReal volume. Real liquidity. Real yield.\n\n🔗 https://www.turboloop.tech/token`,
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
        const variant = new Date().getUTCDay() % 3; // 0, 1, or 2
        const captions = [
          // Variant 0 — spotlight /ask AI
          `🤖 <b>Meet Your TurboLoop AI Assistant</b>\n\nType <code>/ask</code> followed by any question and our AI answers instantly using the full TurboLoop knowledge base.\n\n<b>Try it now:</b>\n\u2022 <code>/ask how does the referral system work?</code>\n\u2022 <code>/ask what is the Ultimate Loop plan?</code>\n\u2022 <code>/ask how do I set up MetaMask for BSC?</code>\n\nNo waiting. No searching. Just ask. 💡`,
          // Variant 1 — full command list
          `💬 <b>TurboLoop Bot Commands</b>\n\nGet instant answers:\n\n🔹 <code>/ask [question]</code> — AI answers anything about TurboLoop\n🔹 <code>/price</code> — Live $TURBO price\n🔹 <code>/burns</code> — Latest buyback &amp; burn data\n🔹 <code>/stats</code> — Live protocol stats\n🔹 <code>/top</code> — Global community leaderboard\n🔹 <code>/plans</code> — All 4 Loop Plans\n🔹 <code>/referral</code> — 20-level referral system\n🔹 <code>/payout</code> — Payout schedule\n🔹 <code>/calculator</code> — Yield calculator\n\nType any keyword and the bot responds automatically too. ⚡`,
          // Variant 2 — FOMO angle
          `❓ <b>Have a question about TurboLoop?</b>\n\nDon't scroll through old messages. Just type:\n\n<code>/ask your question here</code>\n\nOur AI has read every article, every plan detail, every security audit, and every FAQ. It answers in seconds — right here in this chat.\n\nOther quick commands: <code>/price</code> <code>/burns</code> <code>/stats</code> <code>/plans</code> <code>/referral</code>\n\n💬 Ask anything. We built this for you.`,
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

    // ════════════════════════════════════════════════════════════════
    //  End of expanded schedule. Existing slots resume below.
    // ════════════════════════════════════════════════════════════════

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

    // ============ 10. OMNI-COMPOSER SCHEDULED POSTS (Automation V2) ============
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

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, ranAt: new Date().toISOString(), fired: log }));
  } catch (err: any) {
    console.error("[cron-master]", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: String(err?.message || err), log }));
  }
}
