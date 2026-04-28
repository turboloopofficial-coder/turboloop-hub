// Message pools for Telegram automations.
// Multiple variations per reminder type, picked deterministically by day-of-year
// so each day cycles to a different message. After the pool is exhausted, it loops.

import { tgEscape } from "./_telegram";

/** Helper — replaces {placeholders} with actual values */
function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

/** Pick item N from an array based on the current day-of-year — deterministic, daily-rotating */
export function pickByDay<T>(arr: T[], offset = 0): T {
  if (arr.length === 0) throw new Error("Empty pool");
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return arr[(day + offset) % arr.length];
}

// =========================================================
// BLOG POSTING TEMPLATES (different per day, 2 slots: morning/evening)
// =========================================================

const BLOG_HEADLINES_MORNING = [
  "📰 New on the blog this morning",
  "☕ Today's read",
  "📖 Fresh post — start your day with this",
  "🌅 Morning drop",
  "✨ Just published",
  "📚 Today's deep dive",
  "🆕 Fresh from the editorial",
  "🔥 New this morning",
  "💡 Today's lesson",
  "🎯 Read of the day",
];

const BLOG_HEADLINES_EVENING = [
  "🌙 Evening read",
  "🆕 Fresh on the blog tonight",
  "📖 Wrap up your day with this",
  "✍️ Just published",
  "🌆 Evening drop",
  "📚 Tonight's deep dive",
  "💭 Worth your evening",
  "🔥 New tonight",
  "🎯 End-of-day read",
  "📰 Late edition",
];

export function blogPostCaption(opts: { title: string; excerpt: string | null; url: string; slot: "morning" | "evening" }): string {
  const pool = opts.slot === "morning" ? BLOG_HEADLINES_MORNING : BLOG_HEADLINES_EVENING;
  const headline = pickByDay(pool, opts.slot === "morning" ? 0 : 7);
  const title = tgEscape(opts.title);
  const excerpt = opts.excerpt ? tgEscape(opts.excerpt.slice(0, 220)) : "";
  return `<b>${headline}</b>\n\n<b>${title}</b>${excerpt ? `\n\n${excerpt}` : ""}\n\n#TurboLoop #DeFi #BSC`;
}

// =========================================================
// ZOOM REMINDER TEMPLATES — 4 timing slots × 2 languages
// =========================================================

// English Zoom — Tier 1: T-60 (one hour out, low urgency teaser)
const EN_T60 = [
  "🌍 <b>One hour to the daily community call</b>\n\nNothing scheduled. No pitch deck. Just real questions, real answers, every day at 5 PM UTC.\n\nGrab a coffee. We'll see you there.",
  "📣 <b>The community room opens in 1 hour</b>\n\nDaily, 5 PM UTC, English. 30 minutes max. Bring whatever's on your mind — security questions, math, strategy, the contract, anything.",
  "⏰ <b>1 hour countdown — global community Zoom</b>\n\nSame link, same time, every day. People drop in for 5 minutes or stay the whole 30. Your call.",
  "🎙 <b>60 minutes until live</b>\n\nThis is where new community members get oriented and existing ones get questions answered. No filler.",
  "🌐 <b>Heads-up — daily call in 60 min</b>\n\nIf you've been meaning to ask something but haven't, today's the day. We answer everything.",
  "💡 <b>1 hour to the daily Zoom</b>\n\nOne of those rare crypto sessions that's actually about teaching, not shilling. Free, public, every day.",
];

// English Zoom — Tier 2: T-30 (30 min out, getting more direct)
const EN_T30 = [
  "🎙 <b>Live in 30 minutes</b>\n\nGlobal English daily call. 5 PM UTC. Same Zoom every day. New conversations.",
  "⏰ <b>30 minutes — community room opens</b>\n\nTopics today are usually whatever the community brings. Bring yours.",
  "🌍 <b>30 min countdown</b>\n\nThe daily English Zoom is where Turbo Loop community members from every continent meet. Tap to join.",
  "🚀 <b>Half an hour to live</b>\n\nThe Zoom that actually answers your questions. No script, just real conversation.",
  "📣 <b>30 minutes</b>\n\nIf you've never been on one of these calls before, today's a good day to drop in and listen.",
  "💬 <b>Daily English call — 30 min away</b>\n\nQuestions, contract walkthroughs, strategy, community updates. Pick what you came for.",
];

// English Zoom — Tier 3: T-15 (15 min, high urgency)
const EN_T15 = [
  "⚡ <b>15 minutes to live</b>\n\nIf you want to join today, now's the time to grab the link.",
  "🔥 <b>Daily call goes live in 15</b>\n\nGet your Zoom open. Coffee in hand. Questions ready.",
  "⏰ <b>15 minutes — community room opens</b>\n\nLast call before we go live.",
  "🚀 <b>Quarter hour to live</b>\n\nTap the link below. We start at the top of the hour, English, every day.",
  "💬 <b>15 min countdown</b>\n\nThe community is gathering. Don't be the one who saw the message after.",
  "🎙 <b>15 minutes</b>\n\nDaily community call about to start. Open the link and you're in.",
];

// English Zoom — Tier 4: T-0 LIVE (we are live now)
const EN_LIVE = [
  "🔴 <b>WE ARE LIVE</b>\n\nDaily community call has started. Tap the link below and join the room.",
  "🎙 <b>LIVE NOW — Daily English Zoom</b>\n\nDoors are open. Walk in.",
  "🚨 <b>Going live right now</b>\n\nGlobal English community call. Tap to join.",
  "🟢 <b>The room is open</b>\n\nDaily Zoom is live. Drop in anytime in the next 30 min.",
  "🔴 <b>STARTING NOW</b>\n\nDaily community call. English. Free. Open. Join.",
  "🎬 <b>Live</b>\n\nTap to join the daily community Zoom — happening right now.",
];

// Hindi/Urdu Zoom — Tier 1: T-60
const HI_T60 = [
  "🌏 <b>1 ghante mein daily Hindi/Urdu Zoom</b>\n\nApne sawaal, apni zubaan mein. 9 PM IST, har din. Coffee taiyaar rakho.",
  "📣 <b>Hindi/Urdu community call — 1 hour countdown</b>\n\nSame link, same time, har din. 9 baje. Aaiye, baat karte hain.",
  "⏰ <b>1 ghanta — daily Zoom call</b>\n\nReal questions, real answers, sab kuch Hindi/Urdu mein. Free aur sab ke liye.",
  "🎙 <b>60 minutes to live — Hindi/Urdu</b>\n\nNew members ke liye orientation, existing ke liye doubts clear. Drop in karein.",
  "🌐 <b>Heads-up — Hindi/Urdu Zoom in 60 min</b>\n\nAgar koi sawaal pucha nahin hai abhi tak, aaj ka din sahi hai.",
  "💡 <b>1 ghante mein live</b>\n\nDaily Hindi/Urdu Zoom — DeFi seekhne ka best place, bina kisi marketing ke.",
];

// Hindi/Urdu Zoom — Tier 2: T-30
const HI_T30 = [
  "🎙 <b>30 minutes mein live</b>\n\nDaily Hindi/Urdu Zoom — 9 PM IST. Same Zoom har din.",
  "⏰ <b>Aadha ghanta — community room khulta hai</b>\n\nAap jo bhi sawaal layein, aaj poochiye.",
  "🌏 <b>30 min countdown</b>\n\nHindi/Urdu community call mein members har desh se aate hain. Aap bhi judiye.",
  "🚀 <b>Half hour to live</b>\n\nZoom jisme actually questions answer hote hain — bina script ke.",
  "📣 <b>30 minutes</b>\n\nPehli baar aa rahe hain? Aaj ka day perfect hai, aaiye sun lijiye.",
  "💬 <b>Daily Hindi/Urdu call — 30 min away</b>\n\nQuestions, contract walkthrough, strategy — jo chahiye sab.",
];

// Hindi/Urdu Zoom — Tier 3: T-15
const HI_T15 = [
  "⚡ <b>15 minutes to live</b>\n\nAaj judna hai toh link abhi grab kar lijiye.",
  "🔥 <b>Daily Zoom 15 min mein</b>\n\nZoom open kar lijiye. Sawaal taiyaar rakhiye.",
  "⏰ <b>15 minutes — Hindi/Urdu room opens</b>\n\nLast call before live.",
  "🚀 <b>Quarter hour to live</b>\n\nLink tap kariye. Hum 9 baje shuru karte hain, har din.",
  "💬 <b>15 min countdown</b>\n\nCommunity gathering ho rahi hai. Aaiye.",
  "🎙 <b>15 minutes</b>\n\nDaily community call shuru hone wala hai. Link below.",
];

// Hindi/Urdu Zoom — Tier 4: LIVE
const HI_LIVE = [
  "🔴 <b>HUM LIVE HAIN</b>\n\nDaily Hindi/Urdu call shuru ho gaya. Link tap kariye.",
  "🎙 <b>LIVE NOW — Hindi/Urdu Zoom</b>\n\nDoors are open. Aaiye.",
  "🚨 <b>Abhi live ja rahe hain</b>\n\nDaily Hindi/Urdu community call. Tap to join.",
  "🟢 <b>Room is open</b>\n\nZoom live hai. Agle 30 min mein kabhi bhi aa sakte ho.",
  "🔴 <b>STARTING NOW</b>\n\nDaily community call — Hindi/Urdu. Aaiye.",
  "🎬 <b>Live</b>\n\nDaily Zoom abhi live hai — tap karke join ho jayein.",
];

export type ZoomLang = "en" | "hi";
export type ZoomTier = "T60" | "T30" | "T15" | "LIVE";

const POOLS: Record<ZoomLang, Record<ZoomTier, string[]>> = {
  en: { T60: EN_T60, T30: EN_T30, T15: EN_T15, LIVE: EN_LIVE },
  hi: { T60: HI_T60, T30: HI_T30, T15: HI_T15, LIVE: HI_LIVE },
};

export function zoomReminderCaption(opts: { lang: ZoomLang; tier: ZoomTier; meetingLink: string; passcode: string; timeLabel: string }): string {
  const pool = POOLS[opts.lang][opts.tier];
  // Different offset per tier so the same day shows different copy across tiers
  const offset = { T60: 0, T30: 11, T15: 23, LIVE: 47 }[opts.tier];
  const body = pickByDay(pool, offset);
  return `${body}\n\n🔗 ${tgEscape(opts.meetingLink)}\n🔐 Passcode: <code>${tgEscape(opts.passcode)}</code>\n⏰ ${tgEscape(opts.timeLabel)}`;
}
