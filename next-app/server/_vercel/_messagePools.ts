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
//
// Four headline pools — one per supported language. The cron-master
// passes the post's `language` value into blogPostCaption and the
// caption picks from the matching pool. Per-language copy means
// announcements actually read like they were written by a native
// speaker, not auto-translated from English.
//
// Each pool is sized large enough that the day-of-year cycle doesn't
// repeat for at least three weeks, matching the cadence of the
// scheduled-post queue.

const BLOG_HEADLINES_EN = [
  "📖 Today's read",
  "📖 New on the blog",
  "📖 Article of the day",
  "📖 Fresh from the editorial",
  "📖 Today's deep-dive",
  "📖 Worth your evening",
  "📖 Today's piece",
  "📖 Just published",
  "📖 Hot off the editor",
  "📖 Today's long-read",
  "📖 The story today",
  "📖 New chapter — TurboLoop blog",
  "📖 Evening read",
  "📖 Today's perspective",
  "📖 New essay live",
  "📖 The TurboLoop blog — today's piece",
  "📖 Just dropped",
  "📖 New on turboloop.tech",
  "📖 Today's editorial",
  "📖 Fresh perspective",
  "📖 The Daily Read",
];

const BLOG_HEADLINES_DE = [
  "📖 Heute lesen",
  "📖 Neu im Blog",
  "📖 Artikel des Tages",
  "📖 Frisch aus der Redaktion",
  "📖 Heutiger Deep-Dive",
  "📖 Lesenswert heute Abend",
  "📖 Heutiger Beitrag",
  "📖 Soeben veröffentlicht",
  "📖 Direkt aus der Redaktion",
  "📖 Die heutige Lange-Lese",
  "📖 Die Geschichte heute",
  "📖 Neues Kapitel — TurboLoop Blog",
  "📖 Abendlektüre",
  "📖 Heutige Perspektive",
  "📖 Neuer Essay live",
  "📖 Der TurboLoop-Blog — heutiger Beitrag",
  "📖 Gerade erschienen",
  "📖 Neu auf turboloop.tech",
  "📖 Heutige Redaktion",
  "📖 Frische Perspektive",
  "📖 Die tägliche Lektüre",
];

const BLOG_HEADLINES_HI = [
  "📖 आज का लेख",
  "📖 ब्लॉग पर नया",
  "📖 आज का आर्टिकल",
  "📖 ताज़ा संपादकीय",
  "📖 आज का गहन विश्लेषण",
  "📖 आज शाम पढ़ने योग्य",
  "📖 आज का टुकड़ा",
  "📖 अभी प्रकाशित",
  "📖 संपादक की कलम से",
  "📖 आज की लंबी कहानी",
  "📖 आज की बात",
  "📖 नया अध्याय — TurboLoop ब्लॉग",
  "📖 शाम की पढ़ाई",
  "📖 आज का नज़रिया",
  "📖 नया निबंध लाइव",
  "📖 TurboLoop ब्लॉग — आज का लेख",
  "📖 अभी रिलीज़",
  "📖 turboloop.tech पर नया",
  "📖 आज का संपादकीय",
  "📖 नई सोच",
  "📖 दैनिक पठन",
];

const BLOG_HEADLINES_ID = [
  "📖 Bacaan hari ini",
  "📖 Artikel terbaru",
  "📖 Artikel pilihan hari ini",
  "📖 Fresh dari editorial",
  "📖 Deep-dive hari ini",
  "📖 Layak dibaca malam ini",
  "📖 Tulisan hari ini",
  "📖 Baru saja terbit",
  "📖 Langsung dari editor",
  "📖 Bacaan panjang hari ini",
  "📖 Cerita hari ini",
  "📖 Bab baru — Blog TurboLoop",
  "📖 Bacaan sore",
  "📖 Perspektif hari ini",
  "📖 Esai baru live",
  "📖 Blog TurboLoop — tulisan hari ini",
  "📖 Baru saja rilis",
  "📖 Baru di turboloop.tech",
  "📖 Editorial hari ini",
  "📖 Sudut pandang baru",
  "📖 Bacaan harian",
];

const HEADLINE_POOLS = {
  en: BLOG_HEADLINES_EN,
  de: BLOG_HEADLINES_DE,
  hi: BLOG_HEADLINES_HI,
  id: BLOG_HEADLINES_ID,
} as const;

/** Per-language footer line. Keeps the trailing brand mention native to
 *  the audience rather than always reading "turboloop.tech" in Latin
 *  script (which is fine but a translated tagline reads more natural). */
const FOOTER_BY_LANG = {
  en: "turboloop.tech",
  de: "turboloop.tech — sicher und transparent",
  hi: "turboloop.tech — सुरक्षित और पारदर्शी",
  id: "turboloop.tech — aman & transparan",
} as const;

export type BlogLang = keyof typeof HEADLINE_POOLS;

/** Pick a language pool by ISO code, falling back to English if the
 *  caller passes a language we haven't translated copy for yet (e.g. a
 *  future Spanish post). This is the safe-default branch — better to
 *  announce a Spanish post in the English channel than to silently drop
 *  it. The routing layer can still skip the announcement if it prefers.
 */
function poolFor(lang: string): readonly string[] {
  return HEADLINE_POOLS[lang as BlogLang] ?? BLOG_HEADLINES_EN;
}

function footerFor(lang: string): string {
  return FOOTER_BY_LANG[lang as BlogLang] ?? FOOTER_BY_LANG.en;
}

/**
 * Build a Telegram caption for a blog announcement.
 *
 * Takes an optional `lang` arg so the caption is written in the same
 * language as the post itself. When omitted (legacy callers), defaults
 * to English to preserve existing behaviour.
 *
 * The 280-char excerpt cap lines up with Telegram's caption length
 * limit (1024 total) minus headers + title + URL.
 */
export function blogPostCaption(opts: {
  title: string;
  excerpt: string | null;
  url: string;
  slot?: "morning" | "evening";
  /** ISO 639-1 code matching the post's language column. */
  lang?: string;
}): string {
  const lang = opts.lang ?? "en";
  const headline = pickByDay(poolFor(lang) as string[]);
  const title = tgEscape(opts.title);
  const excerpt = opts.excerpt ? tgEscape(opts.excerpt.slice(0, 280)) : "";
  const footer = footerFor(lang);
  return `<b>${headline}</b>\n\n<b>${title}</b>${excerpt ? `\n\n${excerpt}` : ""}\n\n${footer}`;
}

// =========================================================
// ZOOM REMINDER TEMPLATES — T-30 only, calmer + clearer
// =========================================================

// English Zoom reminder — fires shortly before the daily call.
// Calmer, clearer copy. No fixed-length references — calls run open-ended.
// 21 variants — pool cycles every ~3 weeks before repeating.
const EN_T30 = [
  `<b>The Daily English Call is starting soon.</b>

Drop in, ask anything, stay as long as you like. Open room for ecosystem questions, security walkthroughs, and strategy talk.`,

  `<b>The Daily English Call is about to begin.</b>

Same Zoom, every day. Bring whatever's on your mind — security, math, strategy, the contract, anything. We answer it in plain English.`,

  `<b>Daily Community Call — going live shortly.</b>

This is the room where new members get oriented and existing ones get their questions answered. No script. No pitch. Just real conversation.`,

  `<b>Daily English Community Call — live shortly.</b>

What people usually walk away with: a clearer understanding of how the protocol actually works, and faces to put to the names in the channel.`,

  `<b>Daily English Call — about to begin.</b>

If there's something you've been meaning to ask but haven't, today's a good day. Free, public, no agenda.`,

  `<b>The community room opens shortly.</b>

Same link, every day. Drop in for a few minutes, or stay the whole call. Your choice.`,

  `<b>Daily English Call — kicks off soon.</b>

Whether you're new to Turbo Loop or a regular, the door's open. Real questions, real answers — every day.`,

  `<b>The English community room is about to open.</b>

Most days, someone asks a question that everyone in the room was secretly wondering. Bring yours.`,

  `<b>Daily English Call — almost live.</b>

Direct line to the team, every single day. Use it.`,

  `<b>The community Zoom is starting up.</b>

We don't do scripts. We don't do hype. We do honest answers to whatever you bring.`,

  `<b>English Daily Call — coming up.</b>

A few minutes from now, there'll be ten or twenty people on Zoom, talking about TurboLoop in plain English. That should be you.`,

  `<b>Daily English Call — door is opening.</b>

Bring questions. Bring scepticism. Bring a friend who needs convincing. We'll handle all three.`,

  `<b>Live shortly — English Community Call.</b>

The deeper you dig, the better TurboLoop holds up. Today's a good day to dig.`,

  `<b>The Daily English Call is lining up.</b>

Whether you've been here for years or you joined yesterday, you'll learn something today.`,

  `<b>English Community Call — going live.</b>

This is where strategy gets sharper, and confusion gets cleared up. Real-time.`,

  `<b>Daily English Call — kicks off in moments.</b>

Bring the question you'd ask if you had the founder's number. That's basically what this is.`,

  `<b>The English Daily Zoom — about to start.</b>

Five minutes of your time today saves you five hours of guessing later. See you there.`,

  `<b>Open room — Daily English Call.</b>

Members from twenty-plus countries drop into this Zoom every day. Add your voice.`,

  `<b>Daily English Call — almost live.</b>

What's holding you back from going deeper on TurboLoop? Today's the day to find out.`,

  `<b>The community Zoom opens shortly.</b>

This is the simplest, most direct way to get a real answer about anything TurboLoop. Use it daily.`,

  `<b>English Community Call — starting now.</b>

Real conversation, real questions, real answers. No bots, no scripts, no marketing voice.`,
];

// Hindi/Urdu Zoom reminder — fires shortly before the daily call.
// Calmer, clearer copy. No fixed-length references — calls run open-ended.
// 21 variants — pool cycles every ~3 weeks before repeating.
//
// First 5 variants carry an explicit multi-country footer so readers
// across IN/PK/BD/NP/AE can see at a glance that the room is for
// them. The per-region clock times still live in ZOOM_HI.timeLabel
// and surface through zoomReminderCaption's ⏰ line — this footer
// is the country-recognition badge, not the time table.
const HI_T30 = [
  `<b>Hindi/Urdu Daily Call thodi der mein live hoga.</b>

Apne sawaal, apni zubaan mein. Aaiye, baat karte hain.

Aaj ka topic: aap jo bhi sawaal layein, hum jawab denge.

🇮🇳 India · 🇵🇰 Pakistan · 🇧🇩 Bangladesh · 🇳🇵 Nepal · 🇦🇪 Dubai`,

  `<b>Hindi/Urdu Daily Call shuru hone wala hai.</b>

Har din. Real conversation — security, math, strategy, contract, sab kuch Hindi/Urdu mein. Free aur sab ke liye.

🇮🇳 India · 🇵🇰 Pakistan · 🇧🇩 Bangladesh · 🇳🇵 Nepal · 🇦🇪 Dubai`,

  `<b>Community room thodi der mein khulta hai.</b>

Daily Hindi/Urdu Zoom call. Naye members ke liye orientation, existing ke liye doubts clear. Aap jo bhi sawaal layein, aaj poochiye.

🇮🇳 India · 🇵🇰 Pakistan · 🇧🇩 Bangladesh · 🇳🇵 Nepal · 🇦🇪 Dubai`,

  `<b>Hindi/Urdu Daily Call — live hone wala hai.</b>

Yeh wo room hai jahan log Turbo Loop ke baare mein actually samajh paate hain — bina marketing, bina hype.

🇮🇳 India · 🇵🇰 Pakistan · 🇧🇩 Bangladesh · 🇳🇵 Nepal · 🇦🇪 Dubai`,

  `<b>Hindi/Urdu Community Call — abhi live hoga.</b>

Same Zoom, same time, har din. Sawaal aap layein, hum jawab denge. Pehli baar aa rahe hain? Drop in karo, sun lo.

🇮🇳 India · 🇵🇰 Pakistan · 🇧🇩 Bangladesh · 🇳🇵 Nepal · 🇦🇪 Dubai`,

  `<b>Daily Hindi/Urdu Zoom — live shortly.</b>

DeFi seekhne ka best place — koi script nahin, koi pitch nahin. Just real conversation in your language.`,

  `<b>Hindi/Urdu Community Call — shuru hone wala hai.</b>

Members har desh se aate hain. Aaiye, judiye, sawaal poochiye. Free aur open to everyone.`,

  `<b>Hindi/Urdu Daily Zoom — abhi shuru.</b>

Apne dosto ko bhi le aaiye. Jitne zyada questions, utna behtar conversation.`,

  `<b>Daily Hindi/Urdu Call — door khulne wala hai.</b>

Roz wahi link. Roz wahi waqt. Aaj wahi sawaal jo aap kal poochna chahte the — leke aaiye.`,

  `<b>Hindi/Urdu Community Call — live hone wala hai.</b>

Strategy, security, contract — sab kuch apne language mein discuss karte hain. Bina kisi pressure ke.`,

  `<b>Aaiye Hindi/Urdu Daily Zoom mein.</b>

20+ countries ke members aate hain. Kahan se ho aap? Aaj batao.`,

  `<b>Daily Hindi/Urdu Call — live ho raha hai.</b>

Sab se direct answer paane ka tareeka. Bina YouTube, bina Twitter, bina kisi cheese ke beech mein.`,

  `<b>Hindi/Urdu Daily Community — shuru hone ko hai.</b>

Beginners ke liye welcome. Experienced members ke liye deep questions. Sab ke liye.`,

  `<b>Hindi/Urdu Zoom — abhi live.</b>

Sahi sawaal poocho, sahi jawab milega. Bilkul sidhi baat.`,

  `<b>Daily Hindi/Urdu Call — about to begin.</b>

Yahan log doubts clear karte hain, strategies share karte hain, aur naye dosto se milte hain.`,

  `<b>Community room — Hindi/Urdu — open ho raha hai.</b>

Apne family member ya dost ko jo TurboLoop samajhna chahta hai, aaj le aaiye. Best onboarding.`,

  `<b>Hindi/Urdu Daily Zoom — kuch hi der mein.</b>

Roz ek ya do questions aate hain jo aapke bhi mind mein hote hain. Aaj waala aap lekar aaiye.`,

  `<b>Daily Hindi/Urdu Community Call — live shortly.</b>

Trust through transparency. Hum samjhate hain, aap verify karte ho. Bilkul DeFi spirit.`,

  `<b>Hindi/Urdu Zoom Community — abhi shuru.</b>

Apni speed se seekho. Sun lo, samjho, sawaal pucho. Koi judgment nahin.`,

  `<b>Hindi/Urdu Daily Call — live hone wala hai.</b>

DeFi seekhna ho ya strategy refine karni ho — yahan dono milega. Free, sabke liye.`,

  `<b>Daily Hindi/Urdu Zoom — shuru hone ko hai.</b>

Number, math, contract — jo kuch bhi confuse karta hai, aaj poochiye. Real time, real answers.`,
];

export type ZoomLang = "en" | "hi" | "af";
export type ZoomTier = "T30" | "T60" | "T15" | "LIVE";

// ── English T-60 pool (1 hour before) ─────────────────────────────────────
const EN_T60 = [
  `<b>English Community Call — in 1 hour.</b>

Mark your calendar. One hour from now, the daily Zoom opens. Bring your questions, bring a friend.`,

  `<b>Daily English Call — 1 hour away.</b>

If you've been meaning to join but keep missing it — today's your day. One hour.`,

  `<b>The English Community Zoom opens in 60 minutes.</b>

Same link, every day. Real answers, no scripts. See you there.`,

  `<b>60 minutes until the Daily English Call.</b>

Get your questions ready. The room opens in one hour — free, open, no agenda.`,

  `<b>English Daily Call — 1 hour to go.</b>

Members from 20+ countries join this call every day. Add your voice in 60 minutes.`,
];

// ── English T-10 pool (10 minutes before) ─────────────────────────────────
const EN_T10 = [
  `<b>English Community Call — 10 minutes.</b>

The room is filling up. Join now and get a front-row seat.`,

  `<b>10 minutes to the Daily English Call.</b>

Last call. The Zoom opens in 10 minutes — don't miss it.`,

  `<b>Almost live — English Community Call.</b>

Final reminder. 10 minutes. Bring your best question.`,

  `<b>Daily English Call — 10 min away.</b>

The door opens in 10 minutes. Real conversation, real answers.`,

  `<b>English Zoom — starting in 10 minutes.</b>

Wrap up what you're doing. The daily call is about to begin.`,
];

// ── English T-0 LIVE pool ─────────────────────────────────────────────────
const EN_LIVE = [
  `🔴 <b>English Community Call — WE ARE LIVE.</b>

The room is open right now. Click the link and join.`,

  `🔴 <b>LIVE NOW — Daily English Call.</b>

Don't wait. The call is live. Join now.`,

  `🔴 <b>The English Community Zoom is LIVE.</b>

Real-time answers, real people. The room is open — come in.`,

  `🔴 <b>Daily English Call — GOING LIVE NOW.</b>

This is it. The room is open. See you inside.`,

  `🔴 <b>WE'RE LIVE — English Community Call.</b>

Join now. The conversation has started.`,
];

// ── Hindi T-60 pool ────────────────────────────────────────────────────────
const HI_T60 = [
  `<b>Hindi/Urdu Daily Call — 1 ghante mein.</b>

Ek ghante mein room khulega. Apne sawaal tayaar rakho.

🇮🇳 India · 🇵🇰 Pakistan · 🇧🇩 Bangladesh · 🇳🇵 Nepal · 🇦🇪 Dubai`,

  `<b>Hindi/Urdu Community Call — 60 minute baad.</b>

Aaj ka call 1 ghante mein live hoga. Dosto ko bhi bata do.

🇮🇳 India · 🇵🇰 Pakistan · 🇧🇩 Bangladesh · 🇳🇵 Nepal · 🇦🇪 Dubai`,

  `<b>1 ghante mein Hindi/Urdu Zoom.</b>

Sawaal, strategy, security — sab kuch apni zubaan mein. Ek ghante mein milte hain.`,
];

// ── Hindi T-10 pool ────────────────────────────────────────────────────────
const HI_T10 = [
  `<b>Hindi/Urdu Daily Call — sirf 10 minute.</b>

Room 10 minute mein khulega. Abhi join karne ki tayaari karo.

🇮🇳 India · 🇵🇰 Pakistan · 🇧🇩 Bangladesh · 🇳🇵 Nepal · 🇦🇪 Dubai`,

  `<b>10 minute baad — Hindi/Urdu Zoom.</b>

Aakhri reminder. 10 minute mein live ho raha hai. Aao.

🇮🇳 India · 🇵🇰 Pakistan · 🇧🇩 Bangladesh · 🇳🇵 Nepal · 🇦🇪 Dubai`,

  `<b>Hindi/Urdu Call — 10 min mein shuru.</b>

Ab waqt aa gaya. 10 minute mein room open hoga.`,
];

// ── Hindi T-0 LIVE pool ───────────────────────────────────────────────────
const HI_LIVE = [
  `🔴 <b>Hindi/Urdu Daily Call — ABHI LIVE HAI.</b>

Room khul gaya hai. Abhi join karo.

🇮🇳 India · 🇵🇰 Pakistan · 🇧🇩 Bangladesh · 🇳🇵 Nepal · 🇦🇪 Dubai`,

  `🔴 <b>LIVE — Hindi/Urdu Community Call.</b>

Call shuru ho gaya hai. Der mat karo — join karo abhi.

🇮🇳 India · 🇵🇰 Pakistan · 🇧🇩 Bangladesh · 🇳🇵 Nepal · 🇦🇪 Dubai`,

  `🔴 <b>Hindi/Urdu Zoom — LIVE HO GAYA.</b>

Ab aur intezaar mat karo. Room open hai.`,
];


// ── African Community Zoom message pools ────────────────────────────────────
const AF_T60 = [
  `<b>African Community Call — in 1 hour.</b>

Tonight's call covers overview, security, transparency and opportunities in TurboLoop. Bring your questions.

🇳🇬 Nigeria · 🇬🇭 Ghana · 🇿🇦 South Africa · 🇰🇪 Kenya · 🇬🇧 UK`,

  `<b>African TurboLoop Zoom — 1 hour away.</b>

Hosts: Sammywealth, Eloho & Amb. Eddie. Real answers, no scripts. One hour.

🇳🇬 Nigeria · 🇬🇭 Ghana · 🇿🇦 South Africa · 🇰🇪 Kenya · 🇬🇧 UK`,

  `<b>60 minutes — African Community Call.</b>

Security, transparency, opportunities. Everything you need to know. One hour.

🇳🇬 Nigeria · 🇬🇭 Ghana · 🇿🇦 South Africa · 🇰🇪 Kenya · 🇬🇧 UK`,
];

const AF_T30 = [
  `<b>African Community Call — 30 minutes.</b>

Don't miss this one. Sammywealth, Eloho & Amb. Eddie are hosting tonight. 30 minutes.

🇳🇬 Nigeria · 🇬🇭 Ghana · 🇿🇦 South Africa · 🇰🇪 Kenya · 🇬🇧 UK`,

  `<b>30 minutes — African TurboLoop Zoom.</b>

Overview, security, transparency and opportunities. The room opens in 30 minutes.

🇳🇬 Nigeria · 🇬🇭 Ghana · 🇿🇦 South Africa · 🇰🇪 Kenya · 🇬🇧 UK`,

  `<b>African Community Call — half an hour away.</b>

Bring your questions. The hosts are ready. 30 minutes.

🇳🇬 Nigeria · 🇬🇭 Ghana · 🇿🇦 South Africa · 🇰🇪 Kenya · 🇬🇧 UK`,
];

const AF_T10 = [
  `<b>African Community Call — 10 minutes.</b>

The room is filling up. Join now and get a front-row seat.

🇳🇬 Nigeria · 🇬🇭 Ghana · 🇿🇦 South Africa · 🇰🇪 Kenya · 🇬🇧 UK`,

  `<b>10 minutes — African TurboLoop Zoom.</b>

Last call. Sammywealth, Eloho & Amb. Eddie are going live in 10 minutes.

🇳🇬 Nigeria · 🇬🇭 Ghana · 🇿🇦 South Africa · 🇰🇪 Kenya · 🇬🇧 UK`,

  `<b>Almost live — African Community Call.</b>

Final reminder. 10 minutes. Don't miss it.

🇳🇬 Nigeria · 🇬🇭 Ghana · 🇿🇦 South Africa · 🇰🇪 Kenya · 🇬🇧 UK`,
];

const AF_LIVE = [
  `🔴 <b>African Community Call — WE ARE LIVE.</b>

The room is open right now. Sammywealth, Eloho & Amb. Eddie are hosting. Click the link and join.

🇳🇬 Nigeria · 🇬🇭 Ghana · 🇿🇦 South Africa · 🇰🇪 Kenya · 🇬🇧 UK`,

  `🔴 <b>LIVE NOW — African TurboLoop Zoom.</b>

Don't wait. The call is live. Join now.

🇳🇬 Nigeria · 🇬🇭 Ghana · 🇿🇦 South Africa · 🇰🇪 Kenya · 🇬🇧 UK`,

  `🔴 <b>GOING LIVE — African Community Call.</b>

This is it. The room is open. See you inside.

🇳🇬 Nigeria · 🇬🇭 Ghana · 🇿🇦 South Africa · 🇰🇪 Kenya · 🇬🇧 UK`,
];

const POOLS: Record<ZoomLang, Record<ZoomTier, string[]>> = {
  en: { T60: EN_T60, T30: EN_T30, T15: EN_T10, LIVE: EN_LIVE },
  hi: { T60: HI_T60, T30: HI_T30, T15: HI_T10, LIVE: HI_LIVE },
  af: { T60: AF_T60, T30: AF_T30, T15: AF_T10, LIVE: AF_LIVE },
};

// ── 4-Month Celebration overlay (July 8 2026 only) ──────────────────────────
// Prepended to every zoom reminder today to announce the celebration + $100 USDT giveaway.
const CELEBRATION_OVERLAY_EN = `🎉 <b>4TH MONTH CELEBRATION — TODAY'S CALL IS SPECIAL!</b>

🏆 We are celebrating <b>4 months of TurboLoop</b> — 4 months of growth, trust, and on-chain returns!

💰 <b>$100 USDT GIVEAWAY</b> happening LIVE on today's call — join and win!`;

const CELEBRATION_OVERLAY_HI = `🎉 <b>4 महीने की सफलता — आज का ZOOM SPECIAL है!</b>

🏆 TurboLoop के <b>4 महीने पूरे</b> हो गए!

💰 <b>$100 USDT इनाम</b> आज LIVE Zoom में — आएं और जीतें!`;

export function zoomReminderCaption(opts: { lang: ZoomLang; tier: ZoomTier; meetingLink: string; passcode: string; timeLabel: string }): string {
  const body = pickByDay(POOLS[opts.lang][opts.tier]);

  // Inject 4-month celebration overlay for July 8 2026 only
  const todayStr = new Date().toISOString().slice(0, 10);
  const celebrationOverlay = todayStr === "2026-07-08"
    ? (opts.lang === "hi" ? CELEBRATION_OVERLAY_HI : CELEBRATION_OVERLAY_EN) + "\n\n"
    : "";

  // For LIVE posts, drop the passcode/time footer — they're already in the room
  if (opts.tier === "LIVE") {
    return `${celebrationOverlay}${body}\n\n🔗 ${tgEscape(opts.meetingLink)}`;
  }
  return `${celebrationOverlay}${body}\n\n🔗 ${tgEscape(opts.meetingLink)}\n🔐 Passcode: <code>${tgEscape(opts.passcode)}</code>\n⏰ ${tgEscape(opts.timeLabel)}`;
}

// =========================================================
// CINEMATIC UNIVERSE — daily film broadcast (1 per day, rotates through all 20)
// =========================================================
// 20 films. cron picks films[dayOfYear % 20]. Same lineup as
// client/src/lib/cinematicUniverse.ts — kept in sync manually for now.

export type CinematicFilm = {
  slug: string;
  title: string;
  headline: string;
  tagline: string;
  description: string;
  season: 1 | 2 | 3 | 4;
  episode: number;
};

const R2_BASE_FOR_CINEMATIC = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

export const CINEMATIC_FILMS: CinematicFilm[] = [
  { season: 1, episode: 1, slug: "bank-is-lying", title: "Your Bank is Lying to You", headline: "🚨 THE 0.01% LIE 🚨", tagline: "They make billions. You make pennies.", description: "They tell you your money is safe. They tell you 0.01% is a 'good return.' But while your money sits in their vault losing value to inflation, they lend it out at 15%, 20%, even 30%. They make billions. You make pennies. This isn't a service — it's extraction. Decentralized finance has removed the middleman." },
  { season: 1, episode: 2, slug: "where-does-money-go", title: "Where Does Your Money Actually Go?", headline: "📊 THE 99.9% PROFIT SPLIT 📊", tagline: "You take the risk. They take the profit.", description: "The bank earns $10-$20 on your money. They pay for skyscrapers and CEO bonuses. They give you 1 cent. You take 100% of the inflation risk; they take 99.9% of the profit. TurboLoop flips the equation." },
  { season: 1, episode: 3, slug: "inflation-trap", title: "The Inflation Trap", headline: "🕵️ THE INVISIBLE THIEF 🕵️", tagline: "Your savings account is a slow-motion losing trade.", description: "If inflation is 5% and your bank pays you 1%, you are losing 4% of your wealth every single year. You aren't saving money — you are slowly going broke safely." },
  { season: 1, episode: 4, slug: "why-rich-stay-rich", title: "Why the Rich Stay Rich and You Don't", headline: "🚪 THE GATEKEEPERS ARE GONE 🚪", tagline: "Same yield strategies. No minimums. No gatekeepers.", description: "You were given a savings account at 0.01% and told investing is 'too risky.' That wasn't protection. That was gatekeeping." },
  { season: 1, episode: 5, slug: "system-not-built-for-you", title: "The System Was Never Built for You", headline: "📰 BREAKING THE OLD SYSTEM 📰", tagline: "Designed in 1913. By the powerful. For the powerful.", description: "The traditional financial system was designed in 1913 by the powerful, for the powerful. You were never meant to win. But a new system has emerged — built on blockchain, governed by code, open 24/7/365." },
  { season: 2, episode: 1, slug: "what-is-turboloop", title: "What is TurboLoop?", headline: "⚡ THE DEFI ENGINE ⚡", tagline: "No bank. No broker. Just you and the code.", description: "You deposit stablecoins. The smart contract deploys them into optimized liquidity positions. Trading fees flow back to you as yield — up to 54% annually. This is not trust. This is math." },
  { season: 2, episode: 2, slug: "smart-contract-bank-manager", title: "The Smart Contract — Your New Bank Manager", headline: "🤖 CODE > CEOs 🤖", tagline: "It cannot be bribed. It cannot make mistakes.", description: "A smart contract replaces ALL of them. It's a self-executing program on the blockchain that follows exact rules, every time, without exception." },
  { season: 2, episode: 3, slug: "54-percent-real-math", title: "How 54% is Real Math, Not Magic", headline: "🧮 THE MATH BEHIND 54% 🧮", tagline: "Concentrated liquidity. 10x to 50x amplified fees.", description: "TurboLoop uses concentrated liquidity, targeting where 90% of trades happen. This amplifies fee earnings by 10x to 50x. 54% isn't a promise — it's financial engineering." },
  { season: 2, episode: 4, slug: "20-level-network", title: "The 20-Level Network — Your Digital Empire", headline: "🌐 BUILD YOUR DIGITAL EMPIRE 🌐", tagline: "You build it once. It generates while you sleep.", description: "Every person in your network who earns yield generates a small percentage that flows up to you — generated additionally by the protocol, not taken from them." },
  { season: 2, episode: 5, slug: "stablecoins-stay-safe", title: "Stablecoins — Why Your Money Stays Safe", headline: "🛡️ STABILITY MEETS GROWTH 🛡️", tagline: "Pegged to the dollar. Built for boring stability.", description: "TurboLoop operates exclusively with stablecoins. Your principal remains stable, and the 54% yield is earned ON TOP of that stable base." },
  { season: 3, episode: 1, slug: "code-is-law", title: "Code is Law — The Transparency Promise", headline: "📜 CODE IS LAW 📜", tagline: "You don't trust. You verify.", description: "TurboLoop operates in the open. Every line of code is public. Every transaction is traceable on the blockchain. You don't need to trust anyone — you verify everything yourself." },
  { season: 3, episode: 2, slug: "myth-buster-ponzi", title: "The Myth Buster — Ponzi vs. Real Yield", headline: "🛑 BUSTING THE PONZI MYTH 🛑", tagline: "Yield comes from real trades. Not recruitment.", description: "Your yield comes from PancakeSwap V3 trading fees — generated by millions of real trades every day. The system is self-sustaining because the revenue comes from the market, not from recruitment." },
  { season: 3, episode: 3, slug: "blockchain-never-lies-film", title: "The Blockchain Never Lies", headline: "🔗 THE INCORRUPTIBLE WITNESS 🔗", tagline: "Most complete financial record in human history.", description: "With TurboLoop, you can verify every deposit, yield distribution, and withdrawal in real-time on BscScan. Because blockchain records cannot be changed, no one can falsify your earnings." },
  { season: 3, episode: 4, slug: "unbreakable-vault", title: "Security, Audits, and the Unbreakable Vault", headline: "🔐 THE UNBREAKABLE VAULT 🔐", tagline: "Immutable. Renounced. No backdoor. No kill switch.", description: "Three pillars of security: immutable smart contract, decentralized liquidity pools, NO ADMIN KEYS. Your bank can freeze your account. TurboLoop cannot." },
  { season: 3, episode: 5, slug: "defi-vs-banks", title: "DeFi vs. Banks — The Final Comparison", headline: "⚖️ THE FINAL COMPARISON ⚖️", tagline: "Open 24/7/365. 3-5 seconds. Up to 54%. You keep it all.", description: "BANKS: 8 hours, 3-5 days, 0.01%, can freeze you. DEFI: 24/7/365, 3-5 seconds, up to 54%, total control. The choice is clear." },
  { season: 4, episode: 1, slug: "global-revolution-lagos-london", title: "The Global Revolution — From Lagos to London", headline: "🌍 THE GLOBAL REVOLUTION 🌍", tagline: "Geography no longer determines your destiny.", description: "The same smart contract. The same math. The same opportunity. For the first time in financial history, geography does not determine your economic destiny." },
  { season: 4, episode: 2, slug: "compounding-secret", title: "The Compounding Secret — Time is Your Weapon", headline: "⏳ TIME IS YOUR WEAPON ⏳", tagline: "Your yield earns yield. The math accelerates.", description: "Year 1: $1,540. Year 2: $2,372. Year 3: $3,652. Your money didn't just grow. It accelerated. The best time to start was yesterday. The second best time is now." },
  { season: 4, episode: 3, slug: "build-your-legacy", title: "Build Your Legacy — Generational Wealth", headline: "🌳 BUILD YOUR LEGACY 🌳", tagline: "An inheritance that cannot be seized or inflated.", description: "TurboLoop offers a digital asset that works for your family 24/7. This is not just an investment. It is an inheritance. A gift to the future." },
  { season: 4, episode: 4, slug: "leadership-path", title: "The Leadership Path — From Member to Leader", headline: "👑 THE LEADERSHIP PATH 👑", tagline: "Educate before you recruit. Create more leaders, not followers.", description: "Earn 5% bonuses on levels 1-10, and 10% on levels 11-20. But true leadership is about integrity. The best leaders educate before they recruit." },
  { season: 4, episode: 5, slug: "manifesto", title: "The TurboLoop Manifesto — Join the Sovereign Movement", headline: "⚡ THE SOVEREIGN MOVEMENT ⚡", tagline: "Your Money. Your Power. Your Future.", description: "TurboLoop is a declaration of financial independence. The math is proven. The code is live. The community is growing. The only thing missing is you." },
];

/** Pick today's film deterministically from day-of-year. Cycles through all 20 every 20 days. */
export function pickTodaysFilm(): CinematicFilm {
  return pickByDay(CINEMATIC_FILMS);
}

export function cinematicCaption(film: CinematicFilm): string {
  const headline = tgEscape(film.headline);
  const title = tgEscape(film.title);
  const tagline = tgEscape(film.tagline);
  const desc = tgEscape(film.description.slice(0, 600));
  return `<b>${headline}</b>

<b>${title}</b>
<i>S${film.season} · E${film.episode} — ${tagline}</i>

${desc}

🎬 <b>Watch the full film:</b> https://turboloop.tech/films/${film.slug}`;
}

export function cinematicPosterUrl(film: CinematicFilm): string {
  // ?v=2 forces Telegram to bypass its image cache after we regenerated the
  // dark/bad posters. Bump if we ever regenerate again.
  return `${R2_BASE_FOR_CINEMATIC}/cinematic-thumbs/${film.slug}.jpg?v=2`;
}

// =========================================================
// MONTHLY COMPOUNDING — daily projection banner
// =========================================================
// 20 pre-rendered 1200x630 PNGs live in R2 under monthly-banners/.
// 10 keys × 2 languages (English / German):
//   50, 100, 500, 1000, 1500, 2000, 5000, 10000, 50000, grand-master.
//
// The pool is ordered EN-50, EN-100, ..., EN-grand-master, DE-50, ...,
// DE-grand-master. The cron picks `pool[dayOfYear % 20]` so every banner
// fires once per 20-day cycle in a strict, predictable sequence — no
// language gets skipped, no amount gets skipped. Source files & upload
// tooling: scripts/upload-monthly-banners.mjs.

export type MonthlyBannerLang = "en" | "de";

/** Special filename suffix reserved for the aspirational top tier. Has
 *  no numeric monthly amount; rendered as "Grand Master" in any UI. */
export const GRAND_MASTER_KEY = "grand-master" as const;

/** Filename suffix after "monthly-<lang>-". A number means the banner
 *  shows that monthly contribution; "grand-master" is the finale tier. */
export type MonthlyBannerKey = number | typeof GRAND_MASTER_KEY;

export interface MonthlyCompoundBanner {
  lang: MonthlyBannerLang;
  /** Numeric monthly amount in USD, or "grand-master" for the finale */
  key: MonthlyBannerKey;
  /** R2 object key under monthly-banners/, e.g. "monthly-en-50.png" */
  filename: string;
}

const MONTHLY_KEYS: MonthlyBannerKey[] = [
  50,
  100,
  500,
  1000,
  1500,
  2000,
  5000,
  10000,
  50000,
  GRAND_MASTER_KEY,
];

function fileKey(k: MonthlyBannerKey): string {
  return typeof k === "number" ? String(k) : k;
}

export const MONTHLY_COMPOUND_BANNERS: MonthlyCompoundBanner[] = [
  ...MONTHLY_KEYS.map<MonthlyCompoundBanner>(k => ({
    lang: "en",
    key: k,
    filename: `monthly-en-${fileKey(k)}.png`,
  })),
  ...MONTHLY_KEYS.map<MonthlyCompoundBanner>(k => ({
    lang: "de",
    key: k,
    filename: `monthly-de-${fileKey(k)}.png`,
  })),
];

const R2_BASE_FOR_BANNERS = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

export function monthlyBannerUrl(b: MonthlyCompoundBanner): string {
  return `${R2_BASE_FOR_BANNERS}/monthly-banners/${b.filename}`;
}

/** Pick today's monthly banner. Walks the full ordered pool sequentially
 *  by day-of-year — every one of the 20 banners fires exactly once per
 *  20-day cycle, no language or amount ever gets skipped. */
export function pickTodaysMonthlyBanner(): MonthlyCompoundBanner {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return MONTHLY_COMPOUND_BANNERS[day % MONTHLY_COMPOUND_BANNERS.length];
}

// Calmer, premium register. Each variant emphasises one of the three
// pillars the user asked us to lead with: sustainable yield, on-chain
// transparency, the geometry of compounding. No hype words, no caps lock,
// no "guaranteed returns" — every line is a sentence the founder could
// stand behind on a podcast.
const MONTHLY_CAPTION_EN = [
  `<b>Compounding has a shape. This is what it looks like.</b>

The curve above is a projection from the public TurboLoop model — stablecoin LP fees from PancakeSwap V3, reinvested monthly, with the same renounced contract every depositor uses.

We didn't pick a flattering chart. We picked the math. Run it for your own number.`,

  `<b>Sustainable yield isn't loud — it accumulates.</b>

What you're looking at is one monthly figure, compounded inside a transparent on-chain system for the long term. Every line of that curve is verifiable on BscScan.

No promises. No team-controlled levers. Just the geometry of a discipline that works.`,

  `<b>The gap between 0.01 % and a real DeFi yield isn't a percentage — it's a lifetime.</b>

Hold your monthly contribution next to a savings account for ten years and the difference is where most people learn — too late — what compounding really means.

Different system. Different curve. Same monthly behaviour from you.`,

  `<b>This is the projection — not the pitch.</b>

A renounced smart contract, immutable since launch. 100 % LP-locked liquidity. Yield generated by real on-chain trading volume, not by recruitment. The chart above is the natural output of those three facts plus time.

Verify any of them. Then look at the chart again.`,

  `<b>Monthly discipline + transparent on-chain yield. The rest is patience.</b>

Most projects sell you the destination. We're showing you the slope.

If the math holds — and it's open for any of the 100,000+ on-chain wallets to audit — the destination follows automatically.`,

  `<b>What does serious capital actually do here?</b>

The same thing the smaller deposits do, scaled. Same renounced contract, same liquidity pool, same compounding rules. Wealth in a transparent system isn't a different game — it's the same game played longer.

Above is one of those longer games drawn out on paper.`,

  `<b>The image above is a calculation, not a forecast.</b>

Inputs: a fixed monthly deposit, the public stablecoin yield band TurboLoop has run since launch, and the rule of compounding applied to both.

Outputs: the line on the right. None of the three inputs require trust — only the patience to let them run.`,
];

const MONTHLY_CAPTION_DE = [
  `<b>Zinseszins hat eine Form. Das hier ist sie.</b>

Die Kurve oben ist eine Projektion aus dem öffentlichen TurboLoop-Modell — stabile LP-Gebühren auf PancakeSwap V3, monatlich reinvestiert, im selben verzichteten Smart Contract, den jeder Anleger nutzt.

Wir haben uns kein schmeichelhaftes Diagramm ausgesucht. Wir haben die Mathematik genommen. Rechne nach mit deiner eigenen Zahl.`,

  `<b>Nachhaltige Rendite ist nicht laut — sie sammelt sich an.</b>

Was du siehst, ist ein einziger Monatsbeitrag, langfristig in einem transparenten On-Chain-System reinvestiert. Jede Linie dieser Kurve ist auf BscScan überprüfbar.

Keine Versprechen. Keine team-gesteuerten Hebel. Nur die Geometrie einer Disziplin, die funktioniert.`,

  `<b>Der Unterschied zwischen 0,01 % und echtem DeFi-Yield ist kein Prozentsatz — er ist ein Lebenswerk.</b>

Lege deinen Monatsbeitrag zehn Jahre lang neben ein Tagesgeldkonto, und der Abstand ist genau dort, wo die meisten Menschen — zu spät — verstehen, was Zinseszins wirklich bedeutet.

Anderes System. Andere Kurve. Gleiches Sparverhalten von dir.`,

  `<b>Das ist die Hochrechnung — kein Verkaufsargument.</b>

Ein verzichteter Smart Contract, seit Launch unveränderlich. 100 % LP-Lock. Rendite aus echtem On-Chain-Handelsvolumen, nicht aus Anwerbung. Die Grafik oben ist das natürliche Ergebnis dieser drei Fakten plus Zeit.

Prüfe jeden Punkt. Dann schau dir die Grafik nochmal an.`,

  `<b>Monatliche Disziplin + transparenter On-Chain-Yield. Der Rest ist Geduld.</b>

Die meisten Projekte verkaufen dir das Ziel. Wir zeigen dir die Steigung.

Wenn die Mathematik aufgeht — und sie steht jeder der 100.000+ On-Chain-Wallets zur Prüfung offen — folgt das Ziel von selbst.`,

  `<b>Was macht ernstes Kapital eigentlich hier?</b>

Dasselbe wie kleinere Einlagen, nur skaliert. Gleicher verzichteter Contract, gleicher Liquiditätspool, gleiche Zinseszins-Regeln. Vermögen in einem transparenten System ist kein anderes Spiel — es ist dasselbe Spiel, länger gespielt.

Oben ist eines dieser längeren Spiele auf Papier gezeichnet.`,

  `<b>Die Grafik oben ist eine Rechnung, keine Prognose.</b>

Eingaben: ein fester Monatsbeitrag, das öffentliche Stablecoin-Yield-Band, das TurboLoop seit Launch fährt, und die Regel des Zinseszinses auf beide.

Ergebnis: die Linie rechts. Keine der drei Eingaben verlangt Vertrauen — nur die Geduld, sie laufen zu lassen.`,
];

// Dedicated caption for the "grand-master" finale tier — different
// register from the numeric tiers because there's no fixed monthly
// figure on the image, just the aspirational ceiling.
const MONTHLY_CAPTION_GRAND_MASTER_EN = `<b>The Grand Master tier — what compounding looks like at full conviction.</b>

This isn't an entry projection. It's the slope at the top of the curve, where decades of monthly discipline meet a transparent on-chain system that never changes its rules.

Same renounced contract. Same liquidity pool. Same math. Just held longer than most people are willing to hold anything.`;

const MONTHLY_CAPTION_GRAND_MASTER_DE = `<b>Die Grand-Master-Stufe — wie Zinseszins mit voller Überzeugung aussieht.</b>

Das ist keine Einstiegs-Projektion. Das ist die Steigung am oberen Ende der Kurve, dort wo Jahrzehnte monatlicher Disziplin auf ein transparentes On-Chain-System treffen, das seine Regeln nie ändert.

Gleicher verzichteter Contract. Gleicher Liquiditätspool. Gleiche Mathematik. Nur länger gehalten als die meisten Menschen bereit sind, irgendetwas zu halten.`;

// Hashtag stacks. Ordered most-on-brand → most-discovery so Telegram's
// auto-link previews still highlight the strongest tags if the message
// gets clipped. EN and DE pools mirror each other in topic but speak to
// the search behaviours of each audience.
const MONTHLY_HASHTAGS_EN = [
  "#TurboLoop",
  "#Compounding",
  "#StableYield",
  "#OnChain",
  "#DeFi",
  "#PancakeSwapV3",
  "#Transparency",
  "#WealthBuilding",
  "#MonthlyDiscipline",
];
const MONTHLY_HASHTAGS_DE = [
  "#TurboLoop",
  "#Zinseszins",
  "#StabilerYield",
  "#OnChain",
  "#DeFi",
  "#PancakeSwapV3",
  "#Transparenz",
  "#Vermögensaufbau",
  "#Sparplan",
];

export function monthlyCompoundingCaption(b: MonthlyCompoundBanner): string {
  let body: string;
  if (b.key === GRAND_MASTER_KEY) {
    body =
      b.lang === "en"
        ? MONTHLY_CAPTION_GRAND_MASTER_EN
        : MONTHLY_CAPTION_GRAND_MASTER_DE;
  } else {
    const pool = b.lang === "en" ? MONTHLY_CAPTION_EN : MONTHLY_CAPTION_DE;
    body = pickByDay(pool);
  }
  // Body is pre-formatted with <b> / paragraph breaks; the banner image
  // above the message carries the dollar figure so the body stays
  // high-signal. CTA → yield calculator. Hashtag block on a dedicated
  // line so Telegram can highlight each one as a chip.
  const cta =
    b.lang === "en"
      ? `\n\n💸 Run your numbers: https://turboloop.tech/calculator`
      : `\n\n💸 Rechne deine Zahlen: https://turboloop.tech/calculator`;
  const tags =
    "\n\n" +
    (b.lang === "en" ? MONTHLY_HASHTAGS_EN : MONTHLY_HASHTAGS_DE).join(" ");
  return body + cta + tags;
}

// =========================================================
// SITE LAUNCH ANNOUNCEMENT — fires once via cron-master
// =========================================================
// Refined v3 message: confident, premium, community-first. No timeline anchors,
// no emoji walls, one CTA. ~640 chars in HTML — well under Telegram's 1024 limit.

export function launchAnnouncementCaption(): string {
  return `<b>TurboLoop.tech is live.</b>

For the first time everything we've built — the protocol, the community, the security work, the creator network — has a home of its own. Not a landing page. A hub.

<b>A few rooms worth visiting:</b>

▸ <a href="https://turboloop.tech/ecosystem">/ecosystem</a> — the six pillars, each with a deep-dive
▸ <a href="https://turboloop.tech/security">/security</a> — what's locked, what's audited, what's verifiable
▸ <a href="https://turboloop.tech/community">/community</a> — leaderboard, social wall, country leaders
▸ <a href="https://turboloop.tech/creatives">/creatives</a> — 141 ready-to-share banners with captions in 48 languages
▸ <a href="https://turboloop.tech/feed">/feed</a> — long-form blog, updated weekly

We didn't build this to look at. We built it so you have something to send when someone asks <i>"what is TurboLoop, really?"</i>

Send it. Share it. Use the creatives. Translate them. Make it yours.`;
}

// =========================================================
// HUB PROMOTION — daily page spotlight (14 pages × 3 variants = 42 total)
// =========================================================
// Premium banners stored in R2 under hub-promo/ folder. Each entry has:
// page slug, url path, banner filename, pre-formatted HTML caption, and
// the inline-keyboard button copy. pickByDay cycles through the full
// 42-entry pool, so the rotation repeats every 6 weeks.

const R2_BASE_HUB_PROMO = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

export interface HubPromoEntry {
  page: string;
  url: string;
  /** filename inside the hub-promo/ folder on R2 */
  banner: string;
  /** pre-formatted HTML body (rendered with parseMode: "HTML") */
  caption: string;
  buttonText: string;
  buttonUrl: string;
}

export const HUB_PROMOTION_POOL: HubPromoEntry[] = [
  // ── Day 1: Yield Calculator (Variant A) ──
  {
    page: "calculator",
    url: "/calculator",
    banner: "hub-promo-calculator-v1.png",
    caption: `<b>📊 WHAT DOES YOUR NUMBER LOOK LIKE?</b>

Everyone talks about compounding. Few actually run the numbers for their own situation.

$100/month. $500/month. $5,000/month.
The math doesn't care about your starting point — it rewards consistency.

#TurboLoop #YieldCalculator #Compounding #DeFi #OnChain #FinancialFreedom`,
    buttonText: "📊 Run your projection",
    buttonUrl: "https://turboloop.tech/calculator",
  },
  // ── Day 1: Yield Calculator (Variant B) ──
  {
    page: "calculator",
    url: "/calculator",
    banner: "hub-promo-calculator-v2.png",
    caption: `<b>⚡ THE CALCULATOR DOESN'T LIE</b>

No promises. No projections we control. Just the public yield model from PancakeSwap V3 — applied to whatever amount you choose.

Pick your deposit. See the curve. Decide for yourself.

#TurboLoop #Compounding #StableYield #Transparency #Calculator`,
    buttonText: "⚡ See the curve",
    buttonUrl: "https://turboloop.tech/calculator",
  },
  // ── Day 1: Yield Calculator (Variant C) ──
  {
    page: "calculator",
    url: "/calculator",
    banner: "hub-promo-calculator-v3.png",
    caption: `<b>🧮 MOST PEOPLE GUESS. SMART PEOPLE CALCULATE.</b>

What does $1,000/month look like after 12 months of compounding at stable LP fees?

The answer isn't what you expect.
It's better.

#TurboLoop #CompoundInterest #DeFi #WealthBuilding #Mathematics`,
    buttonText: "🧮 Calculate now",
    buttonUrl: "https://turboloop.tech/calculator",
  },
  // ── Day 2: Security Architecture (Variant A) ──
  {
    page: "security",
    url: "/security",
    banner: "hub-promo-security-v1.png",
    caption: `<b>🔐 THREE QUESTIONS BEFORE YOU TRUST ANYTHING WITH YOUR MONEY:</b>

1. Can anyone freeze your funds?
2. Is the code public and audited?
3. Are there admin keys?

TurboLoop: No. Yes. No.

#TurboLoop #Security #SmartContract #Audited #Renounced #DeFiSafety`,
    buttonText: "🔐 See security architecture",
    buttonUrl: "https://turboloop.tech/security",
  },
  // ── Day 2: Security Architecture (Variant B) ──
  {
    page: "security",
    url: "/security",
    banner: "hub-promo-security-v2.png",
    caption: `<b>🛡️ YOUR BANK CAN FREEZE YOUR ACCOUNT TOMORROW.</b>

No warning. No explanation. Legal in most countries.

TurboLoop's smart contract is renounced. Immutable. No admin keys. No kill switch. No one — including us — can touch your funds.

#TurboLoop #Decentralized #NoAdminKeys #Immutable #OnChain`,
    buttonText: "🛡️ Verify it yourself",
    buttonUrl: "https://turboloop.tech/security",
  },
  // ── Day 2: Security Architecture (Variant C) ──
  {
    page: "security",
    url: "/security",
    banner: "hub-promo-security-v3.png",
    caption: `<b>⚖️ "BUT IS IT SAFE?"</b>

The most important question. And the one most projects avoid answering clearly.

We don't avoid it. We built an entire page around it.

Audits. Renounced ownership. Locked liquidity. Zero admin access.

#TurboLoop #Security #Transparency #Audited #TrustVerify`,
    buttonText: "⚖️ Read the breakdown",
    buttonUrl: "https://turboloop.tech/security",
  },
  // ── Day 3: Global Community (Variant A) ──
  {
    page: "community",
    url: "/community",
    banner: "hub-promo-community-v1.png",
    caption: `<b>🌍 14+ COUNTRIES. 6 CONTINENTS. ONE PROTOCOL.</b>

From Lagos to London. From Jakarta to São Paulo. The same smart contract serves everyone equally.

No geographic restrictions. No tier-based access. Same math, same opportunity.

#TurboLoop #GlobalCommunity #DeFi #FinancialInclusion #Borderless`,
    buttonText: "🌍 See the global map",
    buttonUrl: "https://turboloop.tech/community",
  },
  // ── Day 3: Global Community (Variant B) ──
  {
    page: "community",
    url: "/community",
    banner: "hub-promo-community-v2.png",
    caption: `<b>📡 THE MAP IS GROWING EVERY WEEK.</b>

Germany leads Europe. Nigeria leads Africa. Indonesia leads Southeast Asia. India is accelerating.

Where does your country stand?

#TurboLoop #Community #Global #Leaderboard #Growth`,
    buttonText: "📡 Check the leaderboard",
    buttonUrl: "https://turboloop.tech/community",
  },
  // ── Day 3: Global Community (Variant C) ──
  {
    page: "community",
    url: "/community",
    banner: "hub-promo-community-v3.png",
    caption: `<b>🤝 YOU'RE NOT ALONE IN THIS.</b>

Thousands of people across 14+ countries made the same decision you're considering.

They verified. They calculated. They joined.

#TurboLoop #Community #SocialProof #Together #DeFi`,
    buttonText: "🤝 Meet the community",
    buttonUrl: "https://turboloop.tech/community",
  },
  // ── Day 4: Cinematic Films (Variant A) ──
  {
    page: "films",
    url: "/films",
    banner: "hub-promo-films-v1.png",
    caption: `<b>🎬 HAVE YOU WATCHED THE FILMS YET?</b>

20 episodes. 4 seasons. Each one explains a different piece of the TurboLoop system — in cinematic quality.

Not a webinar. Not a slideshow. A film series.

#TurboLoop #CinematicUniverse #DeFiFilms #Education #Watch`,
    buttonText: "🎬 Watch now",
    buttonUrl: "https://turboloop.tech/films",
  },
  // ── Day 4: Cinematic Films (Variant B) ──
  {
    page: "films",
    url: "/films",
    banner: "hub-promo-films-v2.png",
    caption: `<b>🎥 MOST PROJECTS WRITE WHITEPAPERS.</b>

We made films.

4 seasons of cinematic content explaining compounding, security, network effects, and the global revolution — in a format you actually want to watch.

#TurboLoop #Films #CinematicSeries #DeFiEducation #Visual`,
    buttonText: "🎥 Start Season 1",
    buttonUrl: "https://turboloop.tech/films",
  },
  // ── Day 4: Cinematic Films (Variant C) ──
  {
    page: "films",
    url: "/films",
    banner: "hub-promo-films-v3.png",
    caption: `<b>📽️ 60 SECONDS TO UNDERSTAND TURBOLOOP.</b>

Don't read. Watch.

Each film is crafted to explain one concept clearly, beautifully, and without jargon.

#TurboLoop #ShortFilms #Cinematic #LearnDeFi #Visual`,
    buttonText: "📽️ Pick any episode",
    buttonUrl: "https://turboloop.tech/films",
  },
  // ── Day 5: Creative Banners (Variant A) ──
  {
    page: "creatives",
    url: "/creatives",
    banner: "hub-promo-creatives-v1.png",
    caption: `<b>🎨 161 BANNERS. READY TO SHARE.</b>

Monthly projections. Security visuals. Community graphics. Ecosystem explainers.

Download any banner. Share it with your network. The message is already written for you.

#TurboLoop #Creatives #Marketing #ShareReady #Community`,
    buttonText: "🎨 Browse all",
    buttonUrl: "https://turboloop.tech/creatives",
  },
  // ── Day 5: Creative Banners (Variant B) ──
  {
    page: "creatives",
    url: "/creatives",
    banner: "hub-promo-creatives-v2.png",
    caption: `<b>📱 YOUR NEXT WHATSAPP STATUS IS READY.</b>

Pick a banner. Tap share. Done.

161 premium visuals with pre-written captions — designed for Telegram, WhatsApp, Instagram, and X.

No design skills needed.

#TurboLoop #Banners #SocialMedia #ShareReady #Premium`,
    buttonText: "📱 Get yours",
    buttonUrl: "https://turboloop.tech/creatives",
  },
  // ── Day 5: Creative Banners (Variant C) ──
  {
    page: "creatives",
    url: "/creatives",
    banner: "hub-promo-creatives-v3.png",
    caption: `<b>🖼️ WANT TO SHARE TURBOLOOP BUT DON'T KNOW WHAT TO SAY?</b>

We solved that.

Every banner comes with a compelling caption, hashtags, and a clear message. Just tap Share and pick where to send it.

161 options waiting.

#TurboLoop #Creatives #EasySharing #Community #Marketing`,
    buttonText: "🖼️ Pick a banner",
    buttonUrl: "https://turboloop.tech/creatives",
  },
  // ── Day 6: Ecosystem (Variant A) ──
  {
    page: "ecosystem",
    url: "/ecosystem",
    banner: "hub-promo-ecosystem-v1.png",
    caption: `<b>🔄 THE FULL PICTURE — IN ONE PAGE.</b>

How does the yield come from PancakeSwap V3?
How does the 20-level network work?
Where does every dollar flow?

One page. Complete clarity.

#TurboLoop #Ecosystem #HowItWorks #Transparency #DeFi`,
    buttonText: "🔄 Explore",
    buttonUrl: "https://turboloop.tech/ecosystem",
  },
  // ── Day 6: Ecosystem (Variant B) ──
  {
    page: "ecosystem",
    url: "/ecosystem",
    banner: "hub-promo-ecosystem-v2.png",
    caption: `<b>🧩 EVER WONDER WHERE THE YIELD ACTUALLY COMES FROM?</b>

Not from new deposits. Not from recruitment. From PancakeSwap V3 trading fees — generated by millions of real trades every day.

The ecosystem page breaks it all down. Visually.

#TurboLoop #RealYield #PancakeSwap #Ecosystem #Transparency`,
    buttonText: "🧩 See the flow",
    buttonUrl: "https://turboloop.tech/ecosystem",
  },
  // ── Day 6: Ecosystem (Variant C) ──
  {
    page: "ecosystem",
    url: "/ecosystem",
    banner: "hub-promo-ecosystem-v3.png",
    caption: `<b>⚙️ MOST PROTOCOLS HIDE THE PLUMBING.</b>

We made it the main page.

Smart contract → PancakeSwap V3 → LP fees → Auto-compound → Your wallet. Every step visible. Every transaction traceable.

#TurboLoop #Ecosystem #OnChain #Verifiable #DeFi`,
    buttonText: "⚙️ See how it works",
    buttonUrl: "https://turboloop.tech/ecosystem",
  },
  // ── Day 7: Blog (Variant A) ──
  {
    page: "blog",
    url: "/blog",
    banner: "hub-promo-learn-v1.png",
    caption: `<b>📚 DEEP DIVES THAT ACTUALLY MATTER.</b>

Not fluff. Not hype. Real analysis of stablecoin yields, compounding mathematics, and on-chain transparency.

Written for people who think before they invest.

#TurboLoop #Blog #DeFiEducation #Research #Knowledge`,
    buttonText: "📚 Read",
    buttonUrl: "https://turboloop.tech/blog",
  },
  // ── Day 7: Blog (Variant B) ──
  {
    page: "blog",
    url: "/blog",
    banner: "hub-promo-learn-v2.png",
    caption: `<b>🔬 RESEARCH YOU CAN ACTUALLY VERIFY.</b>

Every claim in our blog links to an on-chain source. Every number is traceable. Every statement is falsifiable.

That's the standard we hold ourselves to.

#TurboLoop #Blog #OnChain #Transparency #Research`,
    buttonText: "🔬 Read the latest",
    buttonUrl: "https://turboloop.tech/blog",
  },
  // ── Day 7: Blog (Variant C) ──
  {
    page: "blog",
    url: "/blog",
    banner: "hub-promo-learn-v3.png",
    caption: `<b>📖 THE BLOG ISN'T MARKETING. IT'S EDUCATION.</b>

We write about what matters: how compounding works, why security architecture matters, what makes real yield different from Ponzi yield.

No sales pitch. Just signal.

#TurboLoop #Blog #Education #Signal #DeFi`,
    buttonText: "📖 Start reading",
    buttonUrl: "https://turboloop.tech/blog",
  },
  // ── Day 8: Roadmap (Variant A) ──
  {
    page: "roadmap",
    url: "/roadmap",
    banner: "hub-promo-roadmap-v1.png",
    caption: `<b>🗺️ WHAT'S COMING NEXT?</b>

The Hub is live. The calculator works. The films are streaming. The community is growing.

But we're just getting started.

#TurboLoop #Roadmap #Future #Building #DeFi`,
    buttonText: "🗺️ See the roadmap",
    buttonUrl: "https://turboloop.tech/roadmap",
  },
  // ── Day 8: Roadmap (Variant B) ──
  {
    page: "roadmap",
    url: "/roadmap",
    banner: "hub-promo-roadmap-v2.png",
    caption: `<b>🚧 BUILT IN PUBLIC. SHIPPED IN PUBLIC.</b>

Every milestone we hit, you see it. Every feature we plan, you know about it before it ships.

That's what "built in public" actually means.

#TurboLoop #Roadmap #BuildInPublic #Transparency #Shipping`,
    buttonText: "🚧 See what's next",
    buttonUrl: "https://turboloop.tech/roadmap",
  },
  // ── Day 8: Roadmap (Variant C) ──
  {
    page: "roadmap",
    url: "/roadmap",
    banner: "hub-promo-roadmap-v3.png",
    caption: `<b>📍 THE JOURNEY ISN'T OVER. IT'S ACCELERATING.</b>

Phase 1: Protocol live ✓
Phase 2: Hub launched ✓
Phase 3: Global expansion ← you are here

What comes after? The roadmap tells all.

#TurboLoop #Roadmap #Growth #Milestones #DeFi`,
    buttonText: "📍 View the timeline",
    buttonUrl: "https://turboloop.tech/roadmap",
  },
  // ── Day 9: FAQ (Variant A) ──
  {
    page: "faq",
    url: "/faq",
    banner: "hub-promo-faq-v1.png",
    caption: `<b>❓ EVERY QUESTION. ANSWERED.</b>

"Is it a Ponzi?" — No. Here's why.
"Can I lose my money?" — Here's the risk breakdown.
"How do I withdraw?" — Anytime. No lock-up.

40+ questions, zero BS.

#TurboLoop #FAQ #Questions #Transparency #Honest`,
    buttonText: "❓ Read the FAQ",
    buttonUrl: "https://turboloop.tech/faq",
  },
  // ── Day 9: FAQ (Variant B) ──
  {
    page: "faq",
    url: "/faq",
    banner: "hub-promo-faq-v2.png",
    caption: `<b>🤔 STILL HAVE DOUBTS? GOOD.</b>

Doubt is healthy. Skepticism is smart. We don't want blind believers — we want informed participants.

That's why we answered 40+ hard questions publicly. Including the uncomfortable ones.

#TurboLoop #FAQ #Skepticism #DYOR #Transparency`,
    buttonText: "🤔 Get answers",
    buttonUrl: "https://turboloop.tech/faq",
  },
  // ── Day 9: FAQ (Variant C) ──
  {
    page: "faq",
    url: "/faq",
    banner: "hub-promo-faq-v3.png",
    caption: `<b>💬 THE QUESTIONS EVERYONE ASKS (BUT FEW PROJECTS ANSWER)</b>

"Where does the yield come from?"
"What happens if PancakeSwap goes down?"
"Can the team rug?"

We answer them all. Publicly. Permanently.

#TurboLoop #FAQ #HardQuestions #Transparency #DeFi`,
    buttonText: "💬 See all answers",
    buttonUrl: "https://turboloop.tech/faq",
  },
  // ── Day 10: Leaderboard (Variant A) ──
  {
    page: "leaderboard",
    url: "/#leaderboard",
    banner: "hub-promo-leaderboard-v1.png",
    caption: `<b>🏆 WHO'S LEADING THIS WEEK?</b>

The global leaderboard updates in real-time. Countries competing. Communities growing. Numbers climbing.

Is your country on the board?

#TurboLoop #Leaderboard #Competition #Global #Community`,
    buttonText: "🏆 Check rankings",
    buttonUrl: "https://turboloop.tech/#leaderboard",
  },
  // ── Day 10: Leaderboard (Variant B) ──
  {
    page: "leaderboard",
    url: "/#leaderboard",
    banner: "hub-promo-leaderboard-v2.png",
    caption: `<b>📊 THE NUMBERS DON'T LIE. THE LEADERBOARD PROVES IT.</b>

Real deposits. Real countries. Real growth — tracked live on the homepage.

Some countries are sprinting. Others are just waking up. Where's yours?

#TurboLoop #Leaderboard #LiveData #Global #Growth`,
    buttonText: "📊 See live rankings",
    buttonUrl: "https://turboloop.tech/#leaderboard",
  },
  // ── Day 10: Leaderboard (Variant C) ──
  {
    page: "leaderboard",
    url: "/#leaderboard",
    banner: "hub-promo-leaderboard-v3.png",
    caption: `<b>🥇 FRIENDLY COMPETITION. GLOBAL SCALE.</b>

Germany vs Nigeria. Indonesia vs Turkey. India vs Brazil.

The leaderboard isn't just numbers — it's communities proving what's possible.

#TurboLoop #Leaderboard #Countries #Competition #DeFi`,
    buttonText: "🥇 Join the race",
    buttonUrl: "https://turboloop.tech/#leaderboard",
  },
  // ── Day 11: Calculator German (Variant A) ──
  {
    page: "calculator-de",
    url: "/calculator",
    banner: "hub-promo-calculator-v1.png",
    caption: `<b>🇩🇪 RECHNE SELBST NACH.</b>

Kein Versprechen. Keine Garantie. Nur die öffentliche Rendite aus PancakeSwap V3 — angewandt auf deinen Betrag.

Wähle deine Einzahlung. Sieh die Kurve. Entscheide selbst.

#TurboLoop #Zinseszins #Rendite #DeFi #Transparenz #Rechner`,
    buttonText: "💸 Rendite-Rechner öffnen",
    buttonUrl: "https://turboloop.tech/calculator",
  },
  // ── Day 11: Calculator German (Variant B) ──
  {
    page: "calculator-de",
    url: "/calculator",
    banner: "hub-promo-calculator-v2.png",
    caption: `<b>🇩🇪 DIE MEISTEN RATEN. KLUGE LEUTE RECHNEN.</b>

Was passiert mit 500€/Monat nach 12 Monaten Zinseszins bei stabilen LP-Gebühren?

Die Antwort überrascht. Positiv.

#TurboLoop #Zinseszins #Rechner #DeFi #Rendite #Deutschland`,
    buttonText: "🧮 Jetzt berechnen",
    buttonUrl: "https://turboloop.tech/calculator",
  },
  // ── Day 11: Calculator German (Variant C) ──
  {
    page: "calculator-de",
    url: "/calculator",
    banner: "hub-promo-calculator-v3.png",
    caption: `<b>🇩🇪 DEINE ZAHLEN. DEINE ENTSCHEIDUNG.</b>

Der Rendite-Rechner zeigt dir genau, was Zinseszins mit deinem Betrag macht. Keine Versprechen — nur Mathematik.

100€, 500€ oder 5.000€/Monat? Die Kurve spricht für sich.

#TurboLoop #Zinseszins #Mathematik #DeFi #Transparenz #Rechner`,
    buttonText: "📊 Rechner öffnen",
    buttonUrl: "https://turboloop.tech/calculator",
  },
  // ── Day 12: Code Is Law Film (Variant A) ──
  {
    page: "code-is-law",
    url: "/films/code-is-law",
    banner: "hub-promo-security-v1.png",
    caption: `<b>🎬 EMPFEHLUNG: "CODE IS LAW"</b>

Season 3, Episode 1.

"You don't trust. You verify."

Every line of code is public. Every transaction is traceable. This film explains why that matters more than any promise ever could.

#TurboLoop #CodeIsLaw #Transparency #Film #Verify`,
    buttonText: "🎬 Watch now",
    buttonUrl: "https://turboloop.tech/films/code-is-law",
  },
  // ── Day 12: Code Is Law Film (Variant B) ──
  {
    page: "code-is-law",
    url: "/films/code-is-law",
    banner: "hub-promo-security-v2.png",
    caption: `<b>📜 "YOU DON'T TRUST. YOU VERIFY."</b>

The single most important principle in DeFi — explained in under 2 minutes.

If you watch one TurboLoop film, make it this one.

#TurboLoop #CodeIsLaw #Verify #DeFi #Film #Trust`,
    buttonText: "📜 Watch the film",
    buttonUrl: "https://turboloop.tech/films/code-is-law",
  },
  // ── Day 12: Code Is Law Film (Variant C) ──
  {
    page: "code-is-law",
    url: "/films/code-is-law",
    banner: "hub-promo-security-v3.png",
    caption: `<b>⚖️ IN DEFI, THE CODE IS THE CONTRACT.</b>

No lawyers. No fine print. No "terms may change." The smart contract does exactly what it says — forever.

This film shows you why that's revolutionary.

#TurboLoop #CodeIsLaw #SmartContract #Immutable #Film`,
    buttonText: "⚖️ Watch",
    buttonUrl: "https://turboloop.tech/films/code-is-law",
  },
  // ── Day 13: Apply / Join (Variant A) ──
  {
    page: "apply",
    url: "/apply",
    banner: "hub-promo-profile-v1.png",
    caption: `<b>🚀 YOUR SPOT IS OPEN.</b>

The protocol doesn't wait. The yield compounds daily. The community grows hourly.

The only thing missing is your decision.

#TurboLoop #JoinNow #DeFi #Opportunity #StartToday`,
    buttonText: "🚀 Apply now",
    buttonUrl: "https://turboloop.tech/apply",
  },
  // ── Day 13: Apply / Join (Variant B) ──
  {
    page: "apply",
    url: "/apply",
    banner: "hub-promo-profile-v2.png",
    caption: `<b>🚪 THE DOOR IS OPEN. BUT NOT FOREVER.</b>

Every day you wait, the compounding curve starts one day later. The math is simple: earlier = more.

The application takes 2 minutes.

#TurboLoop #Apply #Compounding #DeFi #StartNow`,
    buttonText: "🚪 Start your application",
    buttonUrl: "https://turboloop.tech/apply",
  },
  // ── Day 13: Apply / Join (Variant C) ──
  {
    page: "apply",
    url: "/apply",
    banner: "hub-promo-profile-v3.png",
    caption: `<b>⏰ THE BEST TIME WAS YESTERDAY. THE SECOND BEST IS NOW.</b>

You've read the blog. You've watched the films. You've run the calculator.

Now what?

#TurboLoop #Apply #Decision #DeFi #Action`,
    buttonText: "⏰ Take the next step",
    buttonUrl: "https://turboloop.tech/apply",
  },
  // ── Day 14: Learn Hub (Variant A) ──
  {
    page: "learn",
    url: "/learn",
    banner: "hub-promo-learn-v1.png",
    caption: `<b>🎓 NEW HERE? START WITH THIS.</b>

The Learn Hub walks you through everything — step by step. No jargon. No assumptions. Just clarity.

From "What is DeFi?" to "How do I compound?" — all covered.

#TurboLoop #Learn #Education #Beginner #DeFi #StartHere`,
    buttonText: "🎓 Begin learning",
    buttonUrl: "https://turboloop.tech/learn",
  },
  // ── Day 14: Learn Hub (Variant B) ──
  {
    page: "learn",
    url: "/learn",
    banner: "hub-promo-learn-v2.png",
    caption: `<b>📘 DON'T INVEST IN WHAT YOU DON'T UNDERSTAND.</b>

That's rule #1. And we take it seriously.

The Learn Hub exists so you never have to invest blind. Every concept, explained simply.

#TurboLoop #Learn #DYOR #Education #Understanding`,
    buttonText: "📘 Start here",
    buttonUrl: "https://turboloop.tech/learn",
  },
  // ── Day 14: Learn Hub (Variant C) ──
  {
    page: "learn",
    url: "/learn",
    banner: "hub-promo-learn-v3.png",
    caption: `<b>🧠 FROM ZERO TO DEFI IN 10 MINUTES.</b>

The Learn Hub is designed for complete beginners. No crypto jargon. No assumed knowledge. Just a clear path from "I'm curious" to "I understand."

#TurboLoop #Learn #Beginner #DeFi #Education #FromZero`,
    buttonText: "🧠 Start your journey",
    buttonUrl: "https://turboloop.tech/learn",
  },
  // ── Day 15: Social Wall (Variant A) ──
  {
    page: "social-wall",
    url: "/social-wall",
    banner: "hub-promo-community-v1.png",
    caption: `<b>📱 VOICES FROM EVERYWHERE.</b>

Every community-made TurboLoop video, in one place. Stories, tutorials, recaps — curated by the team, free to watch, ready to share.

Submit your own and join the wall.

#TurboLoop #Community #SocialWall #Creators #Stories`,
    buttonText: "📱 Watch the wall",
    buttonUrl: "https://turboloop.tech/social-wall",
  },
  // ── Day 15: Social Wall (Variant B) ──
  {
    page: "social-wall",
    url: "/social-wall",
    banner: "hub-promo-community-v2.png",
    caption: `<b>🎥 YOUR TURN ON THE WALL.</b>

Made a TurboLoop video? Share the link — approved submissions are featured here within 48 hours and may qualify for Creator Star payouts.

#TurboLoop #CreatorStar #SocialWall #Earn #Community`,
    buttonText: "🎥 Submit your story",
    buttonUrl: "https://turboloop.tech/submit",
  },
  // ── Day 15: Social Wall (Variant C) ──
  {
    page: "social-wall",
    url: "/social-wall",
    banner: "hub-promo-community-v3.png",
    caption: `<b>🌍 REAL PEOPLE. REAL STORIES.</b>

Don't just take our word for it. Watch the Social Wall to see how the TurboLoop ecosystem is changing lives across 14+ countries.

#TurboLoop #SocialWall #Global #Testimonials #Community`,
    buttonText: "🌍 See the stories",
    buttonUrl: "https://turboloop.tech/social-wall",
  },
  // ── Day 16: Events (Variant A) ──
  {
    page: "events",
    url: "/events",
    banner: "hub-promo-referral-v1.png",
    caption: `<b>🎟️ REAL MEETUPS. REAL PEOPLE. REAL FUNDING.</b>

Join physical TurboLoop meetups in 14+ countries, or get funded to host your own. We pay you to grow the ecosystem.

From local coffee shops to national summits.

#TurboLoop #Events #Meetups #Community #Global`,
    buttonText: "🎟️ Find an event",
    buttonUrl: "https://turboloop.tech/events",
  },
  // ── Day 16: Events (Variant B) ──
  {
    page: "events",
    url: "/events",
    banner: "hub-promo-referral-v2.png",
    caption: `<b>💰 GET FUNDED TO HOST.</b>

Want to build your local community? We provide the budget, the presentation deck, and the merch designs.

You receive 50% as an advance to book your venue, and 50% after a successful event.

#TurboLoop #Events #Funding #Leadership #Community`,
    buttonText: "💰 Apply to host",
    buttonUrl: "https://turboloop.tech/events",
  },
  // ── Day 16: Events (Variant C) ──
  {
    page: "events",
    url: "/events",
    banner: "hub-promo-referral-v3.png",
    caption: `<b>📈 UNLOCK OFFICIAL ROLES.</b>

Every event you host stacks toward a permanent monthly stipend. From City Ambassador ($250/mo) to Global Presenter ($2,500/mo).

Build your team. Grow your rank. Get paid.

#TurboLoop #Leadership #Events #Career #Growth`,
    buttonText: "📈 See the career path",
    buttonUrl: "https://turboloop.tech/events",
  },

  // ── Day 17: Compound (Variant A) ──
  {
    page: "compound",
    url: "/compound",
    banner: "hub-promo-compound-v1.png",
    caption: `<b>🔄 REINVEST. REPEAT. ACCELERATE.</b>

The compound calculator shows you exactly what happens when you roll your yield back into a new plan instead of withdrawing it.

The math is simple. The results are not.

#TurboLoop #Compound #Reinvest #DeFi #YieldStrategy`,
    buttonText: "🔄 Run the compound calculator",
    buttonUrl: "https://turboloop.tech/compound",
  },
  // ── Day 17: Compound (Variant B) ──
  {
    page: "compound",
    url: "/compound",
    banner: "hub-promo-compound-v2.png",
    caption: `<b>📈 SMALL DEPOSITS. COMPOUNDED. BECOME LARGE DEPOSITS.</b>

Every plan that completes and gets reinvested multiplies your base. The TurboLoop compound tool maps out every cycle so you can see the full trajectory before you commit.

#TurboLoop #Compound #DeFi #Reinvest #GrowthStrategy`,
    buttonText: "📈 See your compound curve",
    buttonUrl: "https://turboloop.tech/compound",
  },
  // ── Day 17: Compound (Variant C) ──
  {
    page: "compound",
    url: "/compound",
    banner: "hub-promo-compound-v3.png",
    caption: `<b>💡 WITHDRAW ONCE. OR COMPOUND FOREVER.</b>

Most participants withdraw after their first plan. The ones who compound are in a different category by month three.

See the difference for yourself.

#TurboLoop #Compound #Strategy #DeFi #USDT`,
    buttonText: "💡 Compare withdraw vs compound",
    buttonUrl: "https://turboloop.tech/compound",
  },

  // ── Day 18: Dashboard (Variant A) ──
  {
    page: "dashboard",
    url: "/dashboard",
    banner: "hub-promo-dashboard-v1.png",
    caption: `<b>📊 YOUR ENTIRE DEFI POSITION. ONE SCREEN.</b>

Active plans, earned yield, referral earnings, network depth — all live, all on-chain, all in one dashboard.

No spreadsheets. No guessing.

#TurboLoop #Dashboard #DeFi #OnChain #Portfolio`,
    buttonText: "📊 Open your dashboard",
    buttonUrl: "https://turboloop.tech/dashboard",
  },
  // ── Day 18: Dashboard (Variant B) ──
  {
    page: "dashboard",
    url: "/dashboard",
    banner: "hub-promo-dashboard-v2.png",
    caption: `<b>⚡ REAL-TIME. VERIFIED. YOURS.</b>

Every number on the TurboLoop dashboard is pulled directly from the BSC smart contract. No estimates. No delays. No intermediary.

#TurboLoop #Dashboard #BSC #SmartContract #DeFi`,
    buttonText: "⚡ View live dashboard",
    buttonUrl: "https://turboloop.tech/dashboard",
  },
  // ── Day 18: Dashboard (Variant C) ──
  {
    page: "dashboard",
    url: "/dashboard",
    banner: "hub-promo-dashboard-v3.png",
    caption: `<b>🎯 TRACK EVERY DOLLAR. EVERY PLAN. EVERY REFERRAL.</b>

The dashboard is your command center. See what's active, what's earned, and what's coming — updated in real time from the blockchain.

#TurboLoop #Dashboard #Tracking #DeFi #USDT`,
    buttonText: "🎯 Track your portfolio",
    buttonUrl: "https://turboloop.tech/dashboard",
  },

  // ── Day 19: Deposit (Variant A) ──
  {
    page: "deposit",
    url: "/deposit",
    banner: "hub-promo-deposit-v1.png",
    caption: `<b>💰 CONNECT. CHOOSE. DEPOSIT. DONE.</b>

No paperwork. No approval. No waiting period. Connect your BSC wallet, pick a plan, deposit USDT. The smart contract does the rest — no human involved, no approval needed.

#TurboLoop #Deposit #USDT #BSC #DeFi #StartSmall`,
    buttonText: "💰 Make your first deposit",
    buttonUrl: "https://turboloop.tech/deposit",
  },
  // ── Day 19: Deposit (Variant B) ──
  {
    page: "deposit",
    url: "/deposit",
    banner: "hub-promo-deposit-v2.png",
    caption: `<b>🏦 YOUR BANK REQUIRES PAPERWORK. WE REQUIRE A WALLET.</b>

No ID. No credit check. No waiting period. Connect your BSC wallet, choose a plan, deposit USDT. The contract activates in seconds.

#TurboLoop #Deposit #NoKYC #DeFi #BSC #Permissionless`,
    buttonText: "🏦 Deposit now",
    buttonUrl: "https://turboloop.tech/deposit",
  },
  // ── Day 19: Deposit (Variant C) ──
  {
    page: "deposit",
    url: "/deposit",
    banner: "hub-promo-deposit-v3.png",
    caption: `<b>⏱️ 3 STEPS. 30 SECONDS. YOUR YIELD STARTS IMMEDIATELY.</b>

1. Connect wallet. 2. Choose plan. 3. Deposit USDT.

That's it. The 0.9% daily ROI clock starts on the next block.

#TurboLoop #Deposit #Simple #DeFi #USDT #Instant`,
    buttonText: "⏱️ Start in 30 seconds",
    buttonUrl: "https://turboloop.tech/deposit",
  },

  // ── Day 20: Homepage (Variant A) ──
  {
    page: "homepage",
    url: "/",
    banner: "hub-promo-homepage-v1.png",
    caption: `<b>🌐 THE TURBOLOOP HUB IS LIVE.</b>

Everything in one place — yield calculator, cinematic films, community leaderboard, token data, and the full protocol documentation.

This is what DeFi infrastructure looks like.

#TurboLoop #Hub #DeFi #Ecosystem #Launch`,
    buttonText: "🌐 Explore the hub",
    buttonUrl: "https://turboloop.tech",
  },
  // ── Day 20: Homepage (Variant B) ──
  {
    page: "homepage",
    url: "/",
    banner: "hub-promo-homepage-v2.png",
    caption: `<b>⚡ ONE PROTOCOL. ONE HUB. EVERYTHING YOU NEED.</b>

The TurboLoop hub brings together every tool, resource, and community feature in a single premium interface. Built for the serious DeFi participant.

#TurboLoop #Hub #DeFi #Premium #Ecosystem`,
    buttonText: "⚡ Visit the hub",
    buttonUrl: "https://turboloop.tech",
  },
  // ── Day 20: Homepage (Variant C) ──
  {
    page: "homepage",
    url: "/",
    banner: "hub-promo-homepage-v3.png",
    caption: `<b>🚀 THE FUTURE OF DEFI HAS A HOME.</b>

turboloop.tech — the official hub for the TurboLoop protocol. Real-time token data, yield projections, community rankings, and cinematic education. All on-chain. All verified.

#TurboLoop #Hub #DeFi #OnChain #Official`,
    buttonText: "🚀 Go to turboloop.tech",
    buttonUrl: "https://turboloop.tech",
  },

  // ── Day 21: Plans (Variant A) ──
  {
    page: "plans",
    url: "/plans",
    banner: "hub-promo-plans-v1.png",
    caption: `<b>📋 FOUR PLANS. ONE PROTOCOL. YOUR CHOICE.</b>

7 days (3% total) · 14 days (10% total) · 30 days (24% total) · 60 days (54% total).

Full principal returned at the end of every plan. No lock-in beyond the plan term.

#TurboLoop #Plans #ROI #USDT #DeFi #StableYield`,
    buttonText: "📋 Compare all plans",
    buttonUrl: "https://turboloop.tech/plans",
  },
  // ── Day 21: Plans (Variant B) ──
  {
    page: "plans",
    url: "/plans",
    banner: "hub-promo-plans-v2.png",
    caption: `<b>🎯 START SHORT. SCALE LONG.</b>

The 7-day plan is the entry point. The 60-day plan is where the math compounds hardest. Most serious participants start with the 7-day to verify, then scale into the 60-day.

#TurboLoop #Plans #Strategy #DeFi #Compounding`,
    buttonText: "🎯 Choose your plan",
    buttonUrl: "https://turboloop.tech/plans",
  },
  // ── Day 21: Plans (Variant C) ──
  {
    page: "plans",
    url: "/plans",
    banner: "hub-promo-plans-v3.png",
    caption: `<b>💎 54% TOTAL ROI. 60 DAYS. STABLECOIN ONLY.</b>

No price volatility. No impermanent loss. No liquidation risk. Just USDT in — USDT + yield out. The 60-day Ultimate plan is the flagship.

#TurboLoop #Plans #54ROI #USDT #NoRisk #DeFi`,
    buttonText: "💎 See the Ultimate plan",
    buttonUrl: "https://turboloop.tech/plans",
  },

  // ── Day 22: Withdraw (Variant A) ──
  {
    page: "withdraw",
    url: "/withdraw",
    banner: "hub-promo-withdraw-v1.png",
    caption: `<b>💸 YOUR MONEY. YOUR TIMELINE. YOUR CALL.</b>

When your plan completes, your principal and yield are available to withdraw instantly. No waiting. No approval. No middleman. The smart contract releases it automatically.

#TurboLoop #Withdraw #Instant #DeFi #YourMoney`,
    buttonText: "💸 See how withdrawals work",
    buttonUrl: "https://turboloop.tech/withdraw",
  },
  // ── Day 22: Withdraw (Variant B) ──
  {
    page: "withdraw",
    url: "/withdraw",
    banner: "hub-promo-withdraw-v2.png",
    caption: `<b>⚡ PLAN ENDS. FUNDS RELEASE. INSTANTLY.</b>

The moment your plan term completes, the contract makes your full balance withdrawable. No queue. No delay. No human in the loop. That's what "trustless" means.

#TurboLoop #Withdraw #Trustless #BSC #DeFi #Instant`,
    buttonText: "⚡ Withdraw your yield",
    buttonUrl: "https://turboloop.tech/withdraw",
  },
  // ── Day 22: Withdraw (Variant C) ──
  {
    page: "withdraw",
    url: "/withdraw",
    banner: "hub-promo-withdraw-v3.png",
    caption: `<b>🔓 FULL PRINCIPAL BACK. PLUS YIELD. EVERY TIME.</b>

Unlike most DeFi protocols, TurboLoop returns your full principal at the end of every plan — plus the earned yield on top. Your capital is never consumed.

#TurboLoop #Withdraw #FullPrincipal #DeFi #USDT #Safe`,
    buttonText: "🔓 Understand withdrawals",
    buttonUrl: "https://turboloop.tech/withdraw",
  },
];

/** Pick today's hub promo — cycles through all 60 entries deterministically
 *  via pickByDay so each entry fires exactly once per 60-day window. */
export function pickTodaysHubPromo(): HubPromoEntry {
  return pickByDay(HUB_PROMOTION_POOL);
}

/** Pick a hub promo from a specific subset of pages, rotating by day.
 *  Used by the themed cron slots (security, calculator, etc.) so a
 *  given slot only ever surfaces banners that fit its narrative.
 *  Falls back to the full-pool rotation when the page filter yields
 *  nothing — better to ship a generic promo than a silent slot. */
export function pickHubPromoByPages(pages: string[]): HubPromoEntry {
  const subset = HUB_PROMOTION_POOL.filter((e) => pages.includes(e.page));
  if (subset.length === 0) return pickTodaysHubPromo();
  return pickByDay(subset);
}

/** R2 URL for an entry's banner (CDN-cached, 1y immutable). */
export function hubPromoBannerUrl(promo: HubPromoEntry): string {
  return `${R2_BASE_HUB_PROMO}/hub-promo/${promo.banner}`;
}

// =========================================================
// CAMPAIGN CREATIVES (504 banners across 12 categories)
// =========================================================
// All 12 caption pools below are paired with the matching image
// rotation in cron-master.ts. Each pool has exactly 12 unique entries
// so a `pickByDay(pool, daysSinceLaunch)` index never repeats on the
// same day within a 12-day window — long enough that even the heaviest
// daily slot stays fresh through a deposit cycle.
//
// Image filename rotation is driven by CAMPAIGN_FILE_INDEX, re-exported
// below from the auto-generated _campaignFileIndex.ts. Regenerate that
// file (npm script: generate-campaigns-manifest) whenever new files
// land in R2.
import { CAMPAIGN_FILE_INDEX } from "./_campaignFileIndex";
export { CAMPAIGN_FILE_INDEX };

/** Pool for `campaigns/lifestyle/` — passive-income / aspirational. */
export const CAMPAIGN_LIFESTYLE_CAPTIONS = [
  `Your coffee gets cold. Your TurboLoop earnings don't.\n\nWhile most people trade time for money, TurboLoop members earn 0.9% daily on deposited USDT — automatically, on-chain, every 24 hours.\n\nNo trading. No watching charts. No waiting for a salary.\n\n👉 Start your passive income: https://turboloop.tech\n\n#TurboLoop #PassiveIncome #DeFiYield #FinancialFreedom #OnChain`,
  `The beach doesn't care what time it is. Neither does your TurboLoop wallet.\n\nEvery 24 hours, your USDT earns 0.9% — whether you're working, sleeping, or on a plane.\n\nThis is what financial freedom actually looks like.\n\n👉 https://turboloop.tech\n\n#TurboLoop #BeachLife #PassiveIncome #DeFi #FreedomLifestyle`,
  `Most people work for money. TurboLoop members make money work for them.\n\n0.9% daily yield. Full capital back after 60 days. No lock-up. No volatility risk.\n\nThe math is simple. The lifestyle change is real.\n\n👉 Calculate your earnings: https://turboloop.tech/calculator\n\n#TurboLoop #MoneyMindset #DeFiYield #PassiveIncome #FinancialFreedom`,
  `Imagine waking up and your balance is already higher than when you went to sleep.\n\nThat's not a dream. That's TurboLoop — 0.9% daily yield, on-chain, transparent, and running 24/7.\n\n👉 Join today: https://turboloop.tech\n\n#TurboLoop #WakeUpRicher #PassiveIncome #DeFi #OnChain`,
  `Your 9-to-5 pays once. TurboLoop pays every single day.\n\nDeposit USDT. Earn 0.9% daily. Withdraw anytime. Get your full capital back after 60 days.\n\nOne decision. Daily rewards.\n\n👉 https://turboloop.tech\n\n#TurboLoop #9to5Escape #DeFiYield #DailyRewards #FinancialFreedom`,
  `Luxury isn't about spending more. It's about worrying less.\n\nWhen your money earns 0.9% daily on TurboLoop, the question stops being "can I afford this?" and starts being "what do I want to do today?"\n\n👉 Start building: https://turboloop.tech\n\n#TurboLoop #LuxuryMindset #PassiveIncome #DeFi #WealthBuilding`,
  `Family time is priceless. TurboLoop makes sure you have more of it.\n\nEarn 0.9% daily on your USDT without sitting at a desk. The protocol runs itself — you just live your life.\n\n👉 https://turboloop.tech\n\n#TurboLoop #FamilyFirst #PassiveIncome #DeFiYield #TimeIsWealth`,
  `The difference between people who travel freely and those who can't? Passive income.\n\nTurboLoop members earn 0.9% daily on deposited USDT — from anywhere in the world, on any device.\n\n👉 Start earning: https://turboloop.tech\n\n#TurboLoop #TravelFreedom #PassiveIncome #DeFi #LocationFree`,
  `Retirement isn't an age. It's a number.\n\nWhen your passive income covers your expenses, you're retired — regardless of how old you are. TurboLoop helps you get there faster.\n\n0.9% daily. On-chain. Transparent.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #EarlyRetirement #PassiveIncome #DeFiYield #FinancialFreedom`,
  `The best investment you can make is in a system that works while you don't.\n\nTurboLoop's smart contract runs 24/7 on BNB Smart Chain — no team intervention, no downtime, no excuses.\n\nYour money. Your rules. Your earnings.\n\n👉 https://turboloop.tech\n\n#TurboLoop #SmartMoney #DeFi #PassiveIncome #OnChain`,
  `Some people spend their whole lives working for the weekend. TurboLoop members make every day feel like the weekend.\n\n0.9% daily yield. Withdraw anytime. Full capital back at 60 days.\n\n👉 Join the movement: https://turboloop.tech\n\n#TurboLoop #EveryDayFreedom #PassiveIncome #DeFiYield #FinancialFreedom`,
  `The goal isn't to be rich. The goal is to never have to check the price before you order.\n\nTurboLoop's daily yield gets you there — one compounding day at a time.\n\n👉 https://turboloop.tech\n\n#TurboLoop #FinancialFreedom #DeFiYield #PassiveIncome #WealthBuilding`,
];

/** Pool for `campaigns/token/` — $TURBO tokenomics + DexScreener. */
export const CAMPAIGN_TOKEN_CAPTIONS = [
  `$TURBO isn't just a token. It's proof the protocol works.\n\nNo team mint. No admin key. Fixed supply. Every $TURBO in existence was earned by the protocol — not printed by a team.\n\n👉 Verify on-chain: https://turboloop.tech/token\n\n#TURBO #DeFiToken #BSC #Tokenomics #OnChain`,
  `The rarest tokens are the ones no one can create more of.\n\n$TURBO has a fixed supply, no mint function, and a daily buyback mechanism that permanently removes tokens from circulation.\n\nScarcity is built in.\n\n👉 https://turboloop.tech/token\n\n#TURBO #FixedSupply #Deflationary #BSC #DeFiToken`,
  `$TURBO price update: check turboloop.tech/token for the latest.\n\nEvery day, the protocol buys back $TURBO from the open market and burns it. Less supply. Same demand. You do the math.\n\n👉 https://turboloop.tech/token\n\n#TURBO #BuybackBurn #Deflationary #DeFiToken #BSC`,
  `A token backed by real protocol activity — not hype.\n\n$TURBO's value comes from daily buybacks funded by protocol fees. No team allocation. No VC dump. Just on-chain mechanics.\n\n👉 https://turboloop.tech/token\n\n#TURBO #RealYield #DeFiToken #BSC #Tokenomics`,
  `The $TURBO token was launched on June 1, 2026. No presale. No whitelist. Fair launch.\n\nEvery holder got in on the same terms. The protocol runs the buyback. The community holds the supply.\n\n👉 https://turboloop.tech/token\n\n#TURBO #FairLaunch #DeFiToken #BSC #OnChain`,
  `Locked liquidity means no one can pull the rug — not even the team.\n\n$TURBO's liquidity is locked on-chain. The LP tokens are in a contract, not a wallet. Verifiable. Permanent.\n\n👉 Verify: https://turboloop.tech/token\n\n#TURBO #LockedLiquidity #NoRugPull #DeFiToken #BSC`,
  `$TURBO tokenomics in one line: fixed supply, daily buyback, locked liquidity, no mint function.\n\nThat's it. No complex vesting schedules. No team allocation cliff. Just clean, transparent mechanics.\n\n👉 https://turboloop.tech/token\n\n#TURBO #Tokenomics #DeFi #BSC #FixedSupply`,
  `Every protocol fee goes back to $TURBO holders through the buyback mechanism.\n\nWhen the protocol earns, $TURBO gets bought and burned. When more people deposit, more $TURBO gets removed from supply.\n\nGrowth = scarcity.\n\n👉 https://turboloop.tech/token\n\n#TURBO #Deflationary #RealYield #DeFiToken #BSC`,
  `You can earn USDT yield AND hold $TURBO for price appreciation. Two income streams. One protocol.\n\nDeposit USDT → earn 0.9% daily. Hold $TURBO → benefit from daily buybacks.\n\n👉 https://turboloop.tech/token\n\n#TURBO #DualIncome #DeFiYield #BSC #PassiveIncome`,
  `$TURBO is listed on DexScreener. Every trade, every buyback, every burn — all public.\n\nNo private transactions. No hidden wallets. Just on-chain data anyone can verify in real time.\n\n👉 https://dexscreener.com/bsc/0x5bede66bb27184001960e769efab95304f0e1759\n\n#TURBO #DexScreener #OnChain #Transparency #BSC`,
  `The smart contract holds the liquidity. The smart contract runs the buyback. The smart contract is the team.\n\n$TURBO is governed by code, not promises.\n\n👉 https://turboloop.tech/token\n\n#TURBO #SmartContract #DeFi #CodeIsLaw #BSC`,
  `Most tokens go to zero because the team sells. $TURBO can't be minted — so there's nothing to sell.\n\nFixed supply. Daily buyback. Locked liquidity. This is what a clean token looks like.\n\n👉 https://turboloop.tech/token\n\n#TURBO #FixedSupply #NoMint #DeFiToken #BSC`,
];

/** Pool for `campaigns/referral/` — 20-level network income. */
export const CAMPAIGN_REFERRAL_CAPTIONS = [
  `You earn. Your team earns. Their team earns. And you earn from all of it.\n\nTurboLoop's 20-level referral system pays commissions all the way down your network — permanently.\n\n👉 Get your referral link: https://turboloop.tech/apply\n\n#TurboLoop #ReferralIncome #NetworkIncome #20Levels #PassiveIncome`,
  `One referral can change your financial life. Twenty levels of them can change your family's.\n\nTurboLoop pays network commissions on 20 levels deep — every time anyone in your downline earns, you earn too.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #20Levels #NetworkIncome #ReferralMarketing #DeFi`,
  `The most powerful income is the one that grows while you sleep — from people you've never met.\n\nYour level-5 referral's deposit earns you a commission. Automatically. On-chain. Every day.\n\n👉 Build your network: https://turboloop.tech/apply\n\n#TurboLoop #NetworkIncome #PassiveIncome #ReferralSystem #DeFi`,
  `Share once. Earn forever.\n\nYour TurboLoop referral link is permanent. Every person who joins under you — and everyone they refer — contributes to your network income for life.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #ShareAndEarn #ReferralIncome #DeFi #PassiveIncome`,
  `From Turbo Partner to Turbo Legend — every rank unlocks higher network commissions.\n\nThe more your team grows, the more you earn. The system rewards builders.\n\n👉 See all ranks: https://turboloop.tech/apply\n\n#TurboLoop #TurboLegend #RankUp #NetworkIncome #DeFi`,
  `Your upline is permanent. Your downline is permanent. Your commissions are permanent.\n\nOnce someone joins TurboLoop through your link, they're in your network forever — no transfers, no reassignments.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #PermanentNetwork #ReferralIncome #DeFi #PassiveIncome`,
  `Level 1: 10% commission. Level 2: 5%. All the way to Level 20.\n\nTurboLoop's commission table is transparent, on-chain, and pays automatically — no manual claims, no waiting.\n\n👉 See the full table: https://turboloop.tech/apply\n\n#TurboLoop #CommissionTable #NetworkIncome #20Levels #DeFi`,
  `The best time to build your TurboLoop network was at launch. The second best time is right now.\n\nEvery day you wait, someone else is building the network that could have been yours.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #BuildNow #ReferralIncome #NetworkMarketing #DeFi`,
  `Imagine 100 people in your network, each depositing $100. That's $10,000 in active deposits — and you earn commissions on all of it.\n\nTurboLoop's 20-level system makes this possible.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #NetworkMath #ReferralIncome #DeFi #PassiveIncome`,
  `You don't need to be a crypto expert to build a TurboLoop network. You just need to share.\n\nShare your link. Your referrals deposit USDT. You earn commissions. Repeat.\n\n👉 Get started: https://turboloop.tech/apply\n\n#TurboLoop #SimpleReferral #NetworkIncome #DeFi #EarnOnline`,
  `Network income is the only income that scales without more of your time.\n\nYour TurboLoop downline earns 24/7 — and so do you, from their activity.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #ScalableIncome #NetworkIncome #DeFi #PassiveIncome`,
  `The Turbo Legend rank isn't a title. It's a lifestyle.\n\nReach the top of TurboLoop's rank system and your network income alone can replace a full-time salary.\n\n👉 Start your journey: https://turboloop.tech/apply\n\n#TurboLoop #TurboLegend #NetworkIncome #DeFi #FinancialFreedom`,
];

/** Pool for `campaigns/objection-handler/` — FUD/trust answers. */
export const CAMPAIGN_OBJECTION_CAPTIONS = [
  `"Is it a scam?" — The smart contract answers.\n\nEvery dollar in TurboLoop is governed by an immutable smart contract on BNB Smart Chain. No team wallet. No admin key. No rug pull mechanism. The code is the boss.\n\n👉 Read the contract: https://turboloop.tech/token\n\n#TurboLoop #NotAScam #SmartContract #DeFiTransparency #DYOR`,
  `"Too good to be true?" — Check the on-chain data.\n\n0.9% daily yield sounds extraordinary until you understand DeFi liquidity provision. The protocol earns from real trading activity. The yield is real. The math is public.\n\n👉 Verify everything: https://turboloop.tech/token\n\n#TurboLoop #TooGoodToBeTrue #DeFiYield #OnChain #Transparency`,
  `"Where does the money come from?" — Liquidity provision fees.\n\nTurboLoop provides liquidity to PancakeSwap. Trading fees fund the yield. The more volume, the more the protocol earns. It's DeFi 101.\n\n👉 https://turboloop.tech/token\n\n#TurboLoop #YieldSource #DeFiLiquidity #PancakeSwap #Transparency`,
  `"What if the team runs?" — There is no team to run.\n\nThe smart contract is autonomous. No admin can pause it, drain it, or change the rules. The protocol runs itself — permanently.\n\n👉 https://turboloop.tech/token\n\n#TurboLoop #Trustless #SmartContract #DeFi #NoTeamRisk`,
  `"Can I withdraw anytime?" — Yes. Always.\n\nTurboLoop has no lock-up period. You can withdraw your earnings at any time. Your full capital is returned after 60 days. The contract enforces this — not a promise.\n\n👉 https://turboloop.tech\n\n#TurboLoop #WithdrawAnytime #DeFi #NoLockup #Transparency`,
  `"What about impermanent loss?" — There is none.\n\nTurboLoop's yield structure is fixed at 0.9% daily on your deposited USDT. You're not exposed to token price volatility in your principal. USDT in, USDT out.\n\n👉 https://turboloop.tech\n\n#TurboLoop #NoImpermanentLoss #StableYield #DeFi #USDT`,
  `"Do I need to understand crypto?" — Not really.\n\nIf you can send a WhatsApp message, you can use TurboLoop. Deposit USDT. Watch it grow. Withdraw when you want. The complexity is in the contract — not the user experience.\n\n👉 https://turboloop.tech\n\n#TurboLoop #EasyDeFi #CryptoForEveryone #PassiveIncome #BeginnerFriendly`,
  `"Is the liquidity locked?" — Yes. Verifiably.\n\nThe LP tokens are locked in a smart contract — not held in a team wallet. Anyone can verify this on BscScan right now.\n\n👉 Verify: https://turboloop.tech/token\n\n#TurboLoop #LockedLiquidity #NoRugPull #DeFi #Transparency`,
  `"What's the minimum deposit?" — 1 USDT.\n\nThere's no barrier to entry. Start with $1. See how it works. Scale when you're confident. TurboLoop was built for everyone — not just whales.\n\n👉 https://turboloop.tech\n\n#TurboLoop #StartSmall #1USDT #DeFiForAll #PassiveIncome`,
  `"What if the smart contract gets hacked?" — It's been audited.\n\nTurboLoop's smart contract has been reviewed for vulnerabilities. The code is public. The audit is public. You don't have to trust anyone — you can verify it yourself.\n\n👉 https://turboloop.tech/token\n\n#TurboLoop #Audited #SmartContract #DeFiSecurity #DYOR`,
  `"Is the referral system a pyramid?" — No. Here's the difference.\n\nA pyramid scheme requires recruitment to pay existing members. TurboLoop pays yield from DeFi liquidity fees — referral commissions are a bonus, not the source of yield.\n\n👉 https://turboloop.tech\n\n#TurboLoop #NotAPyramid #DeFiYield #ReferralBonus #Transparency`,
  `"What if I've been burned by crypto before?" — We understand.\n\nTurboLoop was built specifically to remove the risks that burned you: no team control, no token volatility on principal, no lock-up, no hidden fees. Just on-chain yield.\n\n👉 Start with $1: https://turboloop.tech\n\n#TurboLoop #CryptoRecovery #DeFiTrust #SafeYield #OnChain`,
];

/** Pool for `campaigns/hindi-new/` — India market, Hinglish. */
export const CAMPAIGN_HINDI_CAPTIONS = [
  `🇮🇳 India ka DeFi revolution shuru ho gaya hai.\n\nTurboLoop pe daily 0.9% yield earn karo apne USDT pe — bina kisi bank ke, bina kisi middleman ke.\n\nSmart contract pe sab kuch transparent hai. Verify karo khud.\n\n👉 Aaj hi shuru karo: https://turboloop.tech\n\n#TurboLoop #IndiaKaDeFi #PassiveIncome #DeFiIndia #USDT`,
  `Ghar baithe kamao — yeh sirf ek sapna nahi, TurboLoop ki reality hai.\n\n0.9% daily yield. 60 din mein pura capital wapas. Kabhi bhi withdraw karo.\n\nBNB Smart Chain pe immutable smart contract — koi bhi control nahi kar sakta.\n\n👉 https://turboloop.tech\n\n#TurboLoop #GharBaitheKamao #PassiveIncome #DeFi #India`,
  `Agar aapka paisa aapke liye kaam nahi kar raha, toh aap paisa ke liye kaam kar rahe ho.\n\nTurboLoop mein USDT deposit karo. Har 24 ghante mein 0.9% earn karo. Apni zindagi jiyo.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #PaisaKaamKare #PassiveIncome #DeFiIndia #FinancialFreedom`,
  `Inflation beat karo DeFi se.\n\nBank FD deta hai 6-7% per year. TurboLoop deta hai 0.9% per DAY — on-chain, transparent, aur verifiable.\n\nFark samjho. Faisla karo.\n\n👉 https://turboloop.tech\n\n#TurboLoop #InflationBeat #DeFiIndia #BankVsDeFi #PassiveIncome`,
  `Apne network se kamao — 20 levels tak.\n\nTurboLoop ka referral system India ke liye perfect hai — jitna bada aapka network, utni zyada aapki income.\n\nEk baar share karo. Hamesha ke liye kamao.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #NetworkIncome #ReferralIndia #20Levels #PassiveIncome`,
  `Scam nahi hai — smart contract hai.\n\nTurboLoop ka code BscScan pe public hai. Koi bhi verify kar sakta hai. Koi team wallet nahi. Koi admin key nahi. Sirf code.\n\n👉 Verify karo: https://turboloop.tech/token\n\n#TurboLoop #ScamNahi #SmartContract #DeFiTrust #India`,
  `Sirf 1 USDT se shuru karo.\n\nTurboLoop mein minimum deposit sirf 1 USDT hai. Chota shuru karo, bada sochho. Protocol sab ke liye banaya gaya hai.\n\n👉 https://turboloop.tech\n\n#TurboLoop #1USDT #ChhoteSeShuru #DeFiIndia #PassiveIncome`,
  `Naukri chhodo nahi — pehle passive income banao.\n\nJab aapki TurboLoop income aapki salary se zyada ho jaye, tab decide karna. Tab tak dono chalao.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #NaukriChhodo #PassiveIncome #DeFiIndia #FinancialFreedom`,
  `Aapka paisa 24/7 kaam karta hai — aap soye ho ya jaag rahe ho.\n\nTurboLoop ka smart contract kabhi band nahi hota. Har 24 ghante mein 0.9% yield — automatically.\n\n👉 https://turboloop.tech\n\n#TurboLoop #24x7Kamao #PassiveIncome #DeFi #India`,
  `Parivar ke liye kuch alag karo.\n\nTurboLoop se jo passive income aati hai, woh aapke bacchon ki education, aapke parents ki care, aapke sapnon ke liye hoti hai.\n\n👉 https://turboloop.tech\n\n#TurboLoop #ParivarKeLiye #PassiveIncome #DeFiIndia #FamilyFirst`,
  `Blockchain kya hai? Simple hai.\n\nEk public ledger jahan sab kuch record hota hai — permanently, transparently, aur without any central authority. TurboLoop isi pe chalta hai.\n\n👉 Aur seekho: https://turboloop.tech/learn\n\n#TurboLoop #BlockchainKyaHai #DeFiEducation #India #CryptoSikho`,
  `Aaj ka ek chota kadam — kal ki badi azaadi.\n\nJitna jaldi TurboLoop mein shuru karo, utna zyada compounding ka faida milega. Kal ka wait mat karo.\n\n👉 Abhi shuru karo: https://turboloop.tech\n\n#TurboLoop #AajHiShuru #Compounding #DeFiIndia #PassiveIncome`,
];

/** Pool for `campaigns/nigerian/` — Nigeria market, Pidgin-flavoured. */
export const CAMPAIGN_NIGERIAN_CAPTIONS = [
  `🇳🇬 Naija, the DeFi revolution don reach our side.\n\nTurboLoop dey pay 0.9% daily yield on your USDT — no bank, no wahala, no middleman. Just smart contract.\n\n👉 Start today: https://turboloop.tech\n\n#TurboLoop #NaijaDeFi #PassiveIncome #MakeMoneyOnline #Nigeria`,
  `Sapa no go catch you if your money dey work for you.\n\nDeposit USDT. Earn 0.9% every day. Withdraw anytime. Full capital back after 60 days.\n\nThis na real deal — verify am on BscScan.\n\n👉 https://turboloop.tech\n\n#TurboLoop #SapaNoMore #PassiveIncome #NaijaDeFi #USDT`,
  `From Danfo to Benz — one step at a time.\n\nTurboLoop's daily yield dey compound. Small small, e dey grow. Start with what you have. Scale as you go.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #DanfoToBenz #PassiveIncome #NaijaDeFi #Compounding`,
  `No be scam — na smart contract.\n\nTurboLoop code dey public on BscScan. No team wallet. No admin key. The contract dey run itself — nobody fit touch your money.\n\n👉 Verify am: https://turboloop.tech/token\n\n#TurboLoop #NoBeScam #SmartContract #DeFiTrust #Nigeria`,
  `Naija inflation dey chop your savings. DeFi yield dey beat am.\n\nBank dey give 10% per year. TurboLoop dey give 0.9% per DAY — on-chain, transparent, verifiable.\n\nDo the math.\n\n👉 https://turboloop.tech\n\n#TurboLoop #BeatInflation #NaijaDeFi #BankVsDeFi #PassiveIncome`,
  `Build your network. Earn from 20 levels.\n\nTurboLoop's referral system dey pay commissions 20 levels deep — every time anybody for your downline earn, you earn too.\n\n👉 Get your link: https://turboloop.tech/apply\n\n#TurboLoop #NetworkIncome #20Levels #NaijaHustle #PassiveIncome`,
  `You no need to understand blockchain to use TurboLoop.\n\nIf you fit send WhatsApp message, you fit use TurboLoop. Deposit USDT. Watch am grow. Withdraw when you want.\n\n👉 https://turboloop.tech\n\n#TurboLoop #EasyDeFi #NaijaDeFi #CryptoForAll #PassiveIncome`,
  `Abuja mansion, Lagos lifestyle — passive income dey make am possible.\n\nTurboLoop members dey earn 0.9% daily on their USDT. No trading. No stress. Just yield.\n\n👉 https://turboloop.tech\n\n#TurboLoop #AbujaLife #LagosLife #PassiveIncome #NaijaDeFi`,
  `Diaspora Naija — your money fit work for you from anywhere.\n\nTurboLoop dey accessible from UK, US, Canada, everywhere. Deposit USDT. Earn daily. Send back home.\n\n👉 https://turboloop.tech\n\n#TurboLoop #NaijaDiaspora #PassiveIncome #DeFi #RemittanceAlternative`,
  `Market woman, Okada rider, banker — TurboLoop dey for everybody.\n\nMinimum deposit na 1 USDT. No barrier. No discrimination. Just on-chain yield for anyone wey wan earn.\n\n👉 https://turboloop.tech\n\n#TurboLoop #DeFiForAll #NaijaDeFi #1USDT #PassiveIncome`,
  `Arise, compatriots — the financial system wey serve us don change.\n\nDeFi no need your BVN. No need your bank account. Just your wallet and your USDT.\n\n👉 https://turboloop.tech\n\n#TurboLoop #NaijaDeFi #Unbanked #FinancialInclusion #PassiveIncome`,
  `Owambe season go better when passive income dey flow.\n\nTurboLoop members dey earn every day — whether dem dey party or dem dey sleep. That na the real flex.\n\n👉 https://turboloop.tech\n\n#TurboLoop #Owambe #PassiveIncome #NaijaDeFi #DailyYield`,
];

/** Pool for `campaigns/success-story/` — withdrawal proof, results. */
export const CAMPAIGN_SUCCESS_CAPTIONS = [
  `First withdrawal hits different.\n\nThe moment you see USDT land in your wallet from TurboLoop — that's when it becomes real. Not a promise. Not a projection. Real money.\n\n👉 Start your story: https://turboloop.tech\n\n#TurboLoop #FirstWithdrawal #DeFiYield #PassiveIncome #RealResults`,
  `60 days in. Full capital back. Plus 54% earned on top.\n\nThat's what TurboLoop's 0.9% daily yield looks like after a full cycle. The math was always right — the experience confirms it.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #60DayCycle #DeFiYield #PassiveIncome #RealResults`,
  `From skeptic to believer — one withdrawal at a time.\n\nEvery TurboLoop member who doubted it changed their mind the first time they withdrew. The protocol doesn't argue. It just pays.\n\n👉 https://turboloop.tech\n\n#TurboLoop #FromSkepticToBeliever #DeFiYield #PassiveIncome #RealResults`,
  `Rank up. Earn more. Repeat.\n\nTurboLoop members who build their network don't just earn yield — they earn commissions from 20 levels of referrals. Some have replaced their full salary.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #RankUp #NetworkIncome #DeFi #SuccessStory`,
  `The best investment advice I ever got: let the smart contract work.\n\nStop timing the market. Stop chasing 100x tokens. Deposit USDT. Earn 0.9% daily. Compound. Repeat.\n\n👉 https://turboloop.tech\n\n#TurboLoop #SmartInvestment #DeFiYield #PassiveIncome #SuccessStory`,
  `She started with $100. 60 days later, she had $154 — and her $100 back.\n\nThat's TurboLoop's 0.9% daily yield in action. Small start. Real results. Compounding magic.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #StartSmall #DeFiYield #PassiveIncome #SuccessStory`,
  `Paid off debt with DeFi yield. Not clickbait — just math.\n\nWhen your passive income exceeds your monthly debt payment, you're winning. TurboLoop makes that possible.\n\n👉 https://turboloop.tech\n\n#TurboLoop #DebtFree #DeFiYield #PassiveIncome #SuccessStory`,
  `My TurboLoop earnings covered my rent this month.\n\nThat's the goal — when passive income starts covering real expenses. It starts small. It compounds. It changes everything.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #RentPaid #PassiveIncome #DeFiYield #SuccessStory`,
  `The protocol paid me while I was on holiday.\n\nI didn't check my phone once. When I came back, my TurboLoop balance was higher than when I left. That's passive income.\n\n👉 https://turboloop.tech\n\n#TurboLoop #HolidayEarnings #PassiveIncome #DeFiYield #SuccessStory`,
  `Network income changed my family's life.\n\nBuilding a TurboLoop downline took 3 months. Now the commissions come in daily — from people I've never met, in countries I've never visited.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #NetworkIncome #FamilyLife #DeFi #SuccessStory`,
  `I compounded for 6 months. The results were unbelievable.\n\nReinvesting TurboLoop earnings instead of withdrawing them creates exponential growth. 6 months of compounding at 0.9% daily is transformative.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #Compounding #DeFiYield #PassiveIncome #SuccessStory`,
  `The withdrawal proof is on-chain. Anyone can verify it.\n\nEvery TurboLoop payout is a blockchain transaction — public, permanent, and verifiable. No screenshots needed. Just BscScan.\n\n👉 https://turboloop.tech/token\n\n#TurboLoop #WithdrawalProof #OnChain #DeFiYield #Transparency`,
];

/** Pool for `campaigns/education-defi/` — explainers. */
export const CAMPAIGN_EDUCATION_CAPTIONS = [
  `What is DeFi? — Decentralized Finance explained in one minute.\n\nDeFi is a financial system that runs on smart contracts instead of banks. No middlemen. No opening hours. No permission required. TurboLoop is DeFi.\n\n👉 Learn more: https://turboloop.tech/learn\n\n#WhatIsDeFi #DeFiEducation #TurboLoop #Blockchain #Web3`,
  `What is a smart contract? — The most important invention in finance since the ATM.\n\nA smart contract is code that executes automatically when conditions are met. No human can override it. TurboLoop's yield is paid by a smart contract — not a team.\n\n👉 https://turboloop.tech/learn\n\n#SmartContract #DeFiEducation #TurboLoop #Blockchain #Web3`,
  `What is a stablecoin? — Crypto without the volatility.\n\nUSDT is a stablecoin pegged to the US dollar. $1 of USDT is always worth $1. TurboLoop pays 0.9% daily on USDT — so your principal never loses value to crypto volatility.\n\n👉 https://turboloop.tech/learn\n\n#WhatIsUSDT #Stablecoin #DeFiEducation #TurboLoop #Crypto`,
  `What is compound interest? — Einstein called it the eighth wonder of the world.\n\nWhen you reinvest your TurboLoop earnings, your next day's yield is calculated on a larger base. Over time, this creates exponential growth.\n\n👉 See the math: https://turboloop.tech/calculator\n\n#CompoundInterest #DeFiEducation #TurboLoop #PassiveIncome #Compounding`,
  `What is a liquidity pool? — The engine behind DeFi yields.\n\nA liquidity pool is a smart contract holding pairs of tokens that traders can swap against. Liquidity providers earn fees from every trade. TurboLoop uses this mechanism to generate yield.\n\n👉 https://turboloop.tech/learn\n\n#LiquidityPool #DeFiEducation #TurboLoop #YieldFarming #DeFi`,
  `What is BNB Smart Chain? — The blockchain TurboLoop runs on.\n\nBSC is a fast, low-fee blockchain compatible with Ethereum tools. Gas fees are cents, not dollars. TurboLoop chose BSC for accessibility — so anyone can participate.\n\n👉 https://turboloop.tech/learn\n\n#BNBSmartChain #BSC #DeFiEducation #TurboLoop #Blockchain`,
  `What is yield farming? — Putting your crypto to work.\n\nYield farming means providing liquidity or capital to a DeFi protocol in exchange for returns. TurboLoop is a yield farming protocol — you provide USDT, the protocol generates returns.\n\n👉 https://turboloop.tech/learn\n\n#YieldFarming #DeFiEducation #TurboLoop #DeFiYield #Crypto`,
  `What is a crypto wallet? — Your key to DeFi.\n\nA crypto wallet stores your private keys — the passwords that prove you own your crypto. MetaMask and Trust Wallet work with TurboLoop. You control your funds, always.\n\n👉 https://turboloop.tech/learn\n\n#CryptoWallet #MetaMask #DeFiEducation #TurboLoop #Web3`,
  `DeFi vs CeFi — what's the difference?\n\nCeFi (Centralized Finance) = banks, exchanges, custodians. They hold your money. DeFi = smart contracts. The code holds your money. TurboLoop is DeFi — no one can freeze your funds.\n\n👉 https://turboloop.tech/learn\n\n#DeFiVsCeFi #DeFiEducation #TurboLoop #Blockchain #FinancialFreedom`,
  `What is ROI? — Return on Investment, explained for DeFi.\n\nROI = (Earnings / Investment) × 100. At 0.9% daily for 60 days, TurboLoop's ROI is 54% per cycle — plus your full capital back. Compare that to any bank.\n\n👉 https://turboloop.tech/calculator\n\n#ROI #DeFiEducation #TurboLoop #DeFiYield #PassiveIncome`,
  `What is decentralization? — Why it matters for your money.\n\nDecentralization means no single entity controls the system. TurboLoop's smart contract has no owner, no admin, no off switch. Your funds are governed by math, not people.\n\n👉 https://turboloop.tech/learn\n\n#Decentralization #DeFiEducation #TurboLoop #Trustless #Blockchain`,
  `What is immutability? — The property that makes DeFi trustworthy.\n\nImmutable means unchangeable. Once TurboLoop's smart contract was deployed, its rules cannot be altered — not by the team, not by anyone. The yield rate, the withdrawal rules, all permanent.\n\n👉 https://turboloop.tech/token\n\n#Immutability #DeFiEducation #TurboLoop #SmartContract #Trustless`,
];

/** Pool for `campaigns/urgency/` — FOMO / "start today". */
export const CAMPAIGN_URGENCY_CAPTIONS = [
  `Every day you wait is a day you didn't earn 0.9%.\n\nThat's not pressure — that's math. Compound interest rewards the early. The protocol doesn't wait for you.\n\n👉 Start today: https://turboloop.tech\n\n#TurboLoop #StartToday #DeFiYield #PassiveIncome #Compounding`,
  `The best time to start was yesterday. The second best time is right now.\n\nEvery TurboLoop member who waited a month to join wishes they hadn't. The compounding clock started without them.\n\n👉 https://turboloop.tech\n\n#TurboLoop #StartNow #DeFiYield #PassiveIncome #NoMoreWaiting`,
  `Your savings account earned $0.08 today. TurboLoop would have earned 0.9%.\n\nThe gap between what your bank pays and what DeFi pays is not a rounding error. It's a different financial system.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #BankVsDeFi #PassiveIncome #DeFiYield #StartToday`,
  `Inflation is running at 5-8% per year. TurboLoop pays 0.9% per day.\n\nEvery day you keep your savings in a bank account, inflation is winning. DeFi is the answer.\n\n👉 https://turboloop.tech\n\n#TurboLoop #BeatInflation #DeFiYield #PassiveIncome #StartToday`,
  `You've been thinking about it for weeks. The protocol has been paying without you.\n\nStop researching. Start earning. You can always add more later — but you can't get back the days you missed.\n\n👉 https://turboloop.tech\n\n#TurboLoop #StopWaiting #DeFiYield #PassiveIncome #StartNow`,
  `Tonight, while you sleep, TurboLoop members will earn 0.9% on their USDT.\n\nWill you be one of them?\n\n👉 Deposit before midnight: https://turboloop.tech\n\n#TurboLoop #EarnWhileYouSleep #DeFiYield #PassiveIncome #Tonight`,
  `The protocol doesn't care about market conditions. It pays 0.9% daily regardless.\n\nBull market, bear market, sideways market — TurboLoop's yield is fixed. Your USDT earns the same every day.\n\n👉 https://turboloop.tech\n\n#TurboLoop #FixedYield #DeFiYield #PassiveIncome #MarketProof`,
  `$100 deposited today = $154 in 60 days + your $100 back.\n\n$100 NOT deposited today = $100 in 60 days.\n\nThe difference is $54. The decision is yours.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #54Percent #DeFiYield #PassiveIncome #StartToday`,
  `Every hour you wait, someone else is compounding ahead of you.\n\nTurboLoop's community is growing daily. The early movers are already on their second and third cycles. Don't let the gap grow wider.\n\n👉 https://turboloop.tech\n\n#TurboLoop #DontWait #Compounding #DeFiYield #PassiveIncome`,
  `You don't need to understand everything to start. You just need to start.\n\nDeposit $10. Watch it earn 0.9% tomorrow. Then decide if you want to add more. The protocol will still be here.\n\n👉 https://turboloop.tech\n\n#TurboLoop #StartSmall #DeFiYield #PassiveIncome #JustStart`,
  `The window to earn from day one is always open — but every day you delay is a day of yield you'll never get back.\n\nCompound interest is unforgiving to procrastinators.\n\n👉 https://turboloop.tech\n\n#TurboLoop #CompoundingClock #DeFiYield #PassiveIncome #StartToday`,
  `Your future self is either thanking you for starting today, or wishing you had.\n\nWhich version do you want to be?\n\n👉 Start now: https://turboloop.tech\n\n#TurboLoop #FutureSelf #DeFiYield #PassiveIncome #StartToday`,
];

/** Pool for `campaigns/buyback/` — daily buyback + burn. */
export const CAMPAIGN_BUYBACK_CAPTIONS = [
  `Daily buyback executed. More $TURBO removed from circulation.\n\nEvery day, TurboLoop's protocol buys $TURBO from the open market and burns it permanently. Less supply. Same demand. Deflationary by design.\n\n👉 Verify on-chain: https://turboloop.tech/token\n\n#TURBO #BuybackBurn #Deflationary #DeFiToken #BSC`,
  `The protocol bought back $TURBO again today.\n\nThis isn't marketing. It's an on-chain transaction — verifiable on BscScan right now. The buyback happens daily, automatically, from protocol fees.\n\n👉 https://turboloop.tech/token\n\n#TURBO #DailyBuyback #OnChain #Deflationary #BSC`,
  `Fewer $TURBO tokens exist today than yesterday.\n\nThat's the buyback and burn mechanism at work. Every day the protocol operates, the circulating supply decreases. Scarcity compounds over time.\n\n👉 https://turboloop.tech/token\n\n#TURBO #BurnedForever #Deflationary #DeFiToken #Scarcity`,
  `$TURBO's supply is shrinking. The protocol is working.\n\nDaily buybacks remove tokens from circulation permanently. No re-minting. No inflation. Just a smaller and smaller supply.\n\n👉 https://turboloop.tech/token\n\n#TURBO #ShrinkingSupply #Deflationary #BSC #DeFiToken`,
  `Proof of work: today's buyback is on-chain.\n\nSkeptics welcome. Every buyback transaction is public on BscScan. The protocol doesn't ask you to trust it — it shows you the receipts.\n\n👉 Verify: https://turboloop.tech/token\n\n#TURBO #ProofOfWork #BuybackBurn #OnChain #Transparency`,
  `The buyback engine never stops.\n\nWhether markets are up or down, TurboLoop's protocol executes daily buybacks from fee revenue. The mechanism is autonomous — no human decision required.\n\n👉 https://turboloop.tech/token\n\n#TURBO #AutomaticBuyback #Deflationary #DeFiToken #BSC`,
  `Every USDT deposited in TurboLoop contributes to the $TURBO buyback.\n\nProtocol fees fund the buyback. More deposits = more fees = more $TURBO bought and burned. Growth creates scarcity.\n\n👉 https://turboloop.tech/token\n\n#TURBO #BuybackMechanism #Deflationary #DeFiToken #Scarcity`,
  `$TURBO burned today: check the contract.\n\nThe burn address balance grows every day. Every token sent there is gone forever — reducing supply, increasing scarcity, rewarding holders.\n\n👉 https://turboloop.tech/token\n\n#TURBO #BurnAddress #Deflationary #DeFiToken #BSC`,
  `Most tokens inflate. $TURBO deflates.\n\nWhile other projects print new tokens for team salaries and marketing, $TURBO's supply only goes in one direction: down.\n\n👉 https://turboloop.tech/token\n\n#TURBO #Deflationary #FixedSupply #DeFiToken #BSC`,
  `The buyback is funded by real protocol activity — not promises.\n\nTurboLoop earns fees from liquidity provision. Those fees buy $TURBO. That $TURBO gets burned. Real yield. Real deflation.\n\n👉 https://turboloop.tech/token\n\n#TURBO #RealYield #BuybackBurn #Deflationary #BSC`,
  `Holders benefit from every new deposit.\n\nWhen new members deposit USDT, protocol fees increase, buybacks increase, and $TURBO supply decreases faster. Growth benefits all holders.\n\n👉 https://turboloop.tech/token\n\n#TURBO #HolderBenefit #Deflationary #DeFiToken #NetworkEffect`,
  `$TURBO: the token that gets rarer every day.\n\nFixed supply. Daily buyback. Permanent burn. No mint function. This is what a properly designed deflationary token looks like.\n\n👉 https://turboloop.tech/token\n\n#TURBO #GetsRarer #Deflationary #FixedSupply #DeFiToken`,
];

/** Pool for `campaigns/comparison/` — TurboLoop vs TradFi/CeFi. */
export const CAMPAIGN_COMPARISON_CAPTIONS = [
  `Bank savings account: 0.5% per year.\nTurboLoop: 0.9% per day.\n\nThat's not a typo. That's DeFi.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #BankVsDeFi #DeFiYield #PassiveIncome #FinancialFreedom`,
  `Stocks: average 10% per year (if you're lucky).\nTurboLoop: 0.9% per day, every day, regardless of market conditions.\n\nDifferent asset class. Different rules.\n\n👉 https://turboloop.tech\n\n#TurboLoop #StocksVsDeFi #DeFiYield #PassiveIncome #FixedYield`,
  `Crypto trading: high risk, high stress, unpredictable returns.\nTurboLoop: fixed 0.9% daily, USDT principal, no volatility exposure.\n\nSame ecosystem. Completely different risk profile.\n\n👉 https://turboloop.tech\n\n#TurboLoop #CryptoVsDeFi #StableYield #PassiveIncome #LowRisk`,
  `Forex trading: requires skill, time, and constant attention.\nTurboLoop: deposit once, earn daily, withdraw anytime.\n\nOne requires expertise. The other just requires a wallet.\n\n👉 https://turboloop.tech\n\n#TurboLoop #ForexVsDeFi #PassiveIncome #DeFiYield #NoExpertiseNeeded`,
  `Fixed deposit: 6-8% per year, locked for 1-5 years.\nTurboLoop: 54% per 60-day cycle, withdraw anytime.\n\nBetter returns. More flexibility. On-chain transparency.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #FDVsDeFi #DeFiYield #PassiveIncome #BetterReturns`,
  `Hedge funds: minimum $1M investment, 2% management fee, 20% performance fee.\nTurboLoop: minimum 1 USDT, no management fee, no performance fee.\n\nDeFi democratizes finance.\n\n👉 https://turboloop.tech\n\n#TurboLoop #HedgeFundVsDeFi #DeFiForAll #PassiveIncome #FinancialInclusion`,
  `Meme coins: 100x potential, 99% chance of going to zero.\nTurboLoop: 0.9% daily, fixed, on USDT principal.\n\nOne is gambling. The other is yield.\n\n👉 https://turboloop.tech\n\n#TurboLoop #MemeCoinsVsDeFi #StableYield #DeFi #NotGambling`,
  `Crypto lending platforms (CeFi): your funds are held by a company that can go bankrupt.\nTurboLoop (DeFi): your funds are held by a smart contract that can't go bankrupt.\n\nCustody matters.\n\n👉 https://turboloop.tech\n\n#TurboLoop #CeFiVsDeFi #SmartContract #DeFiYield #NoCounterpartyRisk`,
  `Savings challenge: save $X per month, earn nothing on it.\nTurboLoop: deposit USDT, earn 0.9% daily while it sits there.\n\nSame discipline. Completely different outcome.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #SavingsVsDeFi #DeFiYield #PassiveIncome #MoneyHabits`,
  `Pension fund: wait 30-40 years, get back less than inflation took.\nTurboLoop: earn 0.9% daily, compound for years, retire early.\n\nDeFi is the pension fund the system never gave you.\n\n👉 https://turboloop.tech\n\n#TurboLoop #PensionVsDeFi #EarlyRetirement #DeFiYield #FinancialFreedom`,
  `Bonds: 3-5% per year, locked, government-dependent.\nTurboLoop: 0.9% per day, no lock-up, code-dependent.\n\nTrust the math, not the government.\n\n👉 https://turboloop.tech\n\n#TurboLoop #BondsVsDeFi #DeFiYield #PassiveIncome #TrustTheMath`,
  `Traditional investment: complex, expensive, exclusive.\nTurboLoop: simple, free to use, open to anyone with 1 USDT.\n\nFinancial freedom shouldn't require a financial advisor.\n\n👉 https://turboloop.tech\n\n#TurboLoop #TraditionalVsDeFi #DeFiForAll #PassiveIncome #FinancialFreedom`,
];

/** Pool for `campaigns/community/` — global TurboLoop family. */
export const CAMPAIGN_COMMUNITY_CAPTIONS = [
  `The TurboLoop community spans 50+ countries.\n\nFrom India to Nigeria, from Germany to Brazil — TurboLoop members are earning passive income in every timezone. The protocol never sleeps, and neither does the community.\n\n👉 Join us: https://t.me/turboloopofficial\n\n#TurboLoop #GlobalCommunity #DeFi #PassiveIncome #Worldwide`,
  `You're not alone in this. 1,000+ members are earning alongside you.\n\nEvery day, the TurboLoop community grows. Every new member strengthens the protocol. Every withdrawal proves the system works.\n\n👉 https://t.me/turboloopofficial\n\n#TurboLoop #Community #DeFi #PassiveIncome #Together`,
  `The best investment community is one that shares knowledge, not just hype.\n\nTurboLoop's Telegram is full of real members sharing real withdrawals, real strategies, and real support. No bots. No fake hype.\n\n👉 https://t.me/turboloopofficial\n\n#TurboLoop #RealCommunity #DeFi #PassiveIncome #KnowledgeSharing`,
  `Your referral network is your community. Your community is your network.\n\nThe strongest TurboLoop members didn't just deposit — they built teams. Teams that earn together, grow together.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #NetworkCommunity #DeFi #ReferralIncome #Together`,
  `From strangers to teammates — that's the TurboLoop story.\n\nMembers who found TurboLoop independently are now building networks together, sharing strategies, and growing each other's income.\n\n👉 https://t.me/turboloopofficial\n\n#TurboLoop #Teammates #DeFi #Community #NetworkIncome`,
  `The global leaderboard is live. Where does your country rank?\n\n👉 Check the rankings: https://turboloop.tech/community\n\n#TurboLoop #GlobalLeaderboard #Community #DeFi #CountryRanking`,
  `Every member who joins makes the community stronger.\n\nMore deposits = more protocol fees = more buybacks = stronger $TURBO. The community's growth directly benefits every holder.\n\n👉 https://t.me/turboloopofficial\n\n#TurboLoop #CommunityGrowth #DeFi #TURBO #NetworkEffect`,
  `Real people. Real withdrawals. Real community.\n\nNo anonymous team. No fake testimonials. Just members sharing their TurboLoop journey — transparently, on-chain.\n\n👉 https://turboloop.tech/community\n\n#TurboLoop #RealPeople #Community #DeFi #Transparency`,
  `The TurboLoop Telegram is the most active DeFi community on BSC.\n\nJoin 10,000+ members discussing strategies, sharing withdrawals, and building their networks together.\n\n👉 https://t.me/turboloopofficial\n\n#TurboLoop #ActiveCommunity #DeFi #BSC #Telegram`,
  `Community is the moat. Protocol is the foundation.\n\nTurboLoop's smart contract can't be copied without the community. And the community grows stronger every day.\n\n👉 https://t.me/turboloopofficial\n\n#TurboLoop #CommunityMoat #DeFi #PassiveIncome #NetworkEffect`,
  `Share your TurboLoop journey. Inspire the next member.\n\nEvery withdrawal you share, every rank you achieve, every milestone you post — it helps someone else take the first step.\n\n👉 https://turboloop.tech/community\n\n#TurboLoop #ShareYourJourney #Community #DeFi #Inspire`,
  `The TurboLoop family doesn't care where you're from. Just that you're in.\n\nIndia, Nigeria, Germany, Brazil, Philippines — one protocol, one community, one mission: financial freedom for everyone.\n\n👉 https://t.me/turboloopofficial\n\n#TurboLoop #GlobalFamily #DeFi #FinancialFreedom #Community`,
];

/** Public URL builder for a campaign image. Used by cron-master to
 *  pick today's banner. `index` is the rotation offset (typically
 *  `daysSinceLaunch`); the function takes care of wrapping it modulo
 *  the category's actual file count from CAMPAIGN_FILE_INDEX. */
export function campaignBannerUrl(category: string, index: number): string {
  const R2 = process.env.R2_PUBLIC_URL ?? "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";
  const files = CAMPAIGN_FILE_INDEX[category] ?? [];
  if (!files.length) {
    throw new Error(`No campaign files indexed for category "${category}"`);
  }
  const i = Math.abs(index) % files.length;
  return `${R2}/campaigns/${category}/${files[i]}`;
}
