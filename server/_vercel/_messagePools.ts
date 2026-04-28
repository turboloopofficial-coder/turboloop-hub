// Message pools for Telegram automations.
// Calmer, clearer, more professional copy. One message per Zoom per day (T-30 only).
// Multiple variations per type, picked deterministically by day-of-year so each day cycles.

import { tgEscape } from "./_telegram";

/** Pick item N from an array based on day-of-year — deterministic, daily-rotating */
export function pickByDay<T>(arr: T[], offset = 0): T {
  if (arr.length === 0) throw new Error("Empty pool");
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return arr[(day + offset) % arr.length];
}

// =========================================================
// BLOG POSTING TEMPLATES (1 per day, evening only — calmer copy)
// =========================================================

const BLOG_HEADLINES = [
  "📖 Today's read",
  "📖 New on the blog",
  "📖 Article of the day",
  "📖 Fresh from the editorial",
  "📖 Today's deep-dive",
  "📖 Worth your evening",
  "📖 Today's piece",
  "📖 Just published",
];

export function blogPostCaption(opts: { title: string; excerpt: string | null; url: string; slot?: "morning" | "evening" }): string {
  const headline = pickByDay(BLOG_HEADLINES);
  const title = tgEscape(opts.title);
  const excerpt = opts.excerpt ? tgEscape(opts.excerpt.slice(0, 280)) : "";
  return `<b>${headline}</b>\n\n<b>${title}</b>${excerpt ? `\n\n${excerpt}` : ""}\n\nturboloop.tech`;
}

// =========================================================
// ZOOM REMINDER TEMPLATES — T-30 only, calmer + clearer
// =========================================================

// English Zoom T-30 — "Daily English Call · live in 30"
// Each variant: short setup + clear value + clear CTA. No emoji walls.
const EN_T30 = [
  `<b>Daily English Call — live in 30 minutes.</b>

A 30-minute community session. Drop in, ask anything, leave when you're ready.

Today's room is open for: ecosystem questions, security walkthroughs, and strategy talk.`,

  `<b>The Daily English Call begins in 30 minutes.</b>

Same Zoom every day at 5 PM UTC. Bring whatever's on your mind — security, math, strategy, the contract, anything. We answer it in plain English.`,

  `<b>30 minutes to the Daily Call.</b>

This is the room where new community members get oriented and existing ones get questions answered. No script, no pitch — just real conversation.`,

  `<b>Live in 30 minutes — Daily English Community Call.</b>

What people usually walk away with: a clearer understanding of how the protocol actually works, and faces to put to the names in the channel.`,

  `<b>Daily English Call — 30 minutes.</b>

If there's something you've been meaning to ask but haven't, today's a good day. Free, public, no agenda.`,

  `<b>The community room opens in 30 minutes.</b>

5 PM UTC. Same link every day. People drop in for 5 minutes or stay the whole 30. Your call.`,

  `<b>30 minute countdown — Daily English Call.</b>

Whether you're new to Turbo Loop or a regular, the door's open. Real questions, real answers, every weekday.`,
];

// Hindi/Urdu Zoom T-30 — "Hindi/Urdu Daily Call · live in 30"
const HI_T30 = [
  `<b>Hindi/Urdu Daily Call — 30 minute mein live.</b>

Apne sawaal, apni zubaan mein. 30 minutes max. Aaiye, baat karte hain.

Aaj ka topic: aap jo bhi sawaal layein, hum jawab denge.`,

  `<b>30 minute mein Hindi/Urdu Daily Call shuru ho raha hai.</b>

9 PM IST, har din. Real conversation — security, math, strategy, contract, sab kuch Hindi/Urdu mein. Free aur sab ke liye.`,

  `<b>Aadha ghanta — community room khulta hai.</b>

Daily Hindi/Urdu Zoom call. Naye members ke liye orientation, existing ke liye doubts clear. Aap jo bhi sawaal layein, aaj poochiye.`,

  `<b>Hindi/Urdu Daily Call — 30 minutes to live.</b>

Yeh wo room hai jahan log Turbo Loop ke baare mein actually samajh paate hain — bina marketing, bina hype.`,

  `<b>30 minute baad live — Hindi/Urdu Community Call.</b>

Same Zoom, same time, har din. Sawaal aap layein, hum jawab denge. Pehli baar aa rahe hain? Drop in karo, sun lo.`,

  `<b>Daily Hindi/Urdu Zoom — 30 minute mein live.</b>

DeFi seekhne ka best place — koi script nahin, koi pitch nahin. Just real conversation in your language.`,

  `<b>Hindi/Urdu Community Call — 30 min countdown.</b>

Members har desh se aate hain. Aaiye, judiye, sawaal poochiye. Free aur open to everyone.`,
];

export type ZoomLang = "en" | "hi";
export type ZoomTier = "T30" | "T60" | "T15" | "LIVE"; // kept for back-compat; only T30 is used now

const POOLS: Record<ZoomLang, string[]> = {
  en: EN_T30,
  hi: HI_T30,
};

export function zoomReminderCaption(opts: { lang: ZoomLang; tier: ZoomTier; meetingLink: string; passcode: string; timeLabel: string }): string {
  const body = pickByDay(POOLS[opts.lang]);
  return `${body}

🔗 ${tgEscape(opts.meetingLink)}
🔐 Passcode: <code>${tgEscape(opts.passcode)}</code>
⏰ ${tgEscape(opts.timeLabel)}`;
}
