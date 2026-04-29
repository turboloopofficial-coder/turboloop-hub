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
  return `${R2_BASE_FOR_CINEMATIC}/cinematic-thumbs/${film.slug}.jpg`;
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
