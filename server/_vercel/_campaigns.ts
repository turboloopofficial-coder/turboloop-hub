// May 2026 campaign data — Port Harcourt event countdown (Campaign B,
// B1–B7) + ongoing Events page promotion (Campaign A, A1–A8) + a
// daily German channel slot that rotates the Campaign A creative with
// German captions and a BitPat referral CTA.
//
// Banners are R2-hosted at /campaign-banners/<id>.png — uploaded in one
// shot via scripts/upload-campaign-banners.mjs. URLs are stable; if a
// banner is ever re-rendered we bump the suffix (e.g. B1-v2.png) rather
// than mutating in place, so Telegram + browser caches don't serve the
// old image.
//
// Scheduling is keyed by the calendar date (YYYY-MM-DD) of the post,
// not by sequence number — that keeps the gap days (B5 fires May 20 not
// May 19) and the every-other-day cadence of Campaign A explicit and
// auditable in source, with no off-by-one risk in the cron evaluator.

const R2 = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

function bannerUrl(id: string): string {
  return `${R2}/campaign-banners/${id}.png`;
}

export interface CampaignPost {
  /** Canonical id (B1, A3, …) — used as the cron dedup key suffix. */
  id: string;
  /** ISO date YYYY-MM-DD — the day this post should fire. */
  date: string;
  /** Public R2 URL of the banner PNG. */
  photoUrl: string;
  /** Telegram caption — HTML parse-mode safe (single &lt;b&gt; tag at most). */
  caption: string;
  /** CTA button text. */
  buttonText: string;
  /** CTA button URL. */
  buttonUrl: string;
}

// ─── Campaign B · Port Harcourt countdown (May 15 → May 23) ────────────
//
// Seven posts on the run-up to the May 23 meetup. Note the gap days
// (May 19, May 21) are intentional — the README/print artwork is built
// around "5 days to go", "3 days left", "TOMORROW" framing that requires
// those exact send dates.
//
// B7 fires at 06:00 UTC on event day (the morning of the meetup) rather
// than 13:00 UTC like the others — see the cron-master slot.

export const CAMPAIGN_B: CampaignPost[] = [
  {
    id: "B1",
    date: "2026-05-15",
    photoUrl: bannerUrl("B1"),
    caption:
      "🇳🇬 <b>PORT HARCOURT — WE ARE COMING!</b> 🇳🇬\n\n" +
      "The TurboLoop Community Meetup is officially landing in Port Harcourt!\n\n" +
      "📅 <b>Date:</b> May 23, 2026\n" +
      "📍 <b>Location:</b> Port Harcourt, Nigeria\n\n" +
      "Mark your calendars. This is going to be massive.\n\n" +
      "👉 <b>Save the date &amp; apply now:</b> https://turboloop.tech/events",
    buttonText: "📅 Save the date",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "B2",
    date: "2026-05-16",
    photoUrl: bannerUrl("B2"),
    caption:
      "🤝 <b>MEET THE TURBOLOOP COMMUNITY</b> 🤝\n\n" +
      "Port Harcourt, get ready to connect with builders, investors, and DeFi enthusiasts in your city. Real conversations, zero pressure.\n\n" +
      "📅 <b>May 23, 2026</b>\n\n" +
      "👉 <b>Join the movement:</b> https://turboloop.tech/events",
    buttonText: "🤝 Join the movement",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "B3",
    date: "2026-05-17",
    photoUrl: bannerUrl("B3"),
    caption:
      "🚀 <b>WHAT TO EXPECT IN PORT HARCOURT</b> 🚀\n\n" +
      "• Live DeFi Demos &amp; Yield Strategies\n" +
      "• High-value Networking\n" +
      "• Exclusive Community Insights\n\n" +
      "Don't miss out on the biggest DeFi meetup in the city.\n\n" +
      "👉 <b>Secure your spot:</b> https://turboloop.tech/events",
    buttonText: "🎟 Secure your spot",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "B4",
    date: "2026-05-18",
    photoUrl: bannerUrl("B4"),
    caption:
      "⏳ <b>5 DAYS TO GO!</b> ⏳\n\n" +
      "The countdown is on! Only 5 days left until the TurboLoop Port Harcourt Meetup. Have you secured your spot yet?\n\n" +
      "📅 <b>May 23, 2026</b>\n\n" +
      "👉 <b>Apply before it's full:</b> https://turboloop.tech/events",
    buttonText: "⏳ Apply now",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "B5",
    date: "2026-05-20",
    photoUrl: bannerUrl("B5"),
    caption:
      "⚡ <b>3 DAYS LEFT!</b> ⚡\n\n" +
      "The energy is building. Port Harcourt is about to experience the TurboLoop ecosystem live. This is your last chance to apply!\n\n" +
      "👉 <b>Final call:</b> https://turboloop.tech/events",
    buttonText: "⚡ Final call",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "B6",
    date: "2026-05-22",
    photoUrl: bannerUrl("B6"),
    caption:
      "🔥 <b>TOMORROW IS THE DAY!</b> 🔥\n\n" +
      "Port Harcourt, we are ready! The venue is set, the community is buzzing. See you tomorrow for an unforgettable DeFi experience.\n\n" +
      "👉 <b>Event details:</b> https://turboloop.tech/events",
    buttonText: "🔥 See event details",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "B7",
    date: "2026-05-23",
    photoUrl: bannerUrl("B7"),
    caption:
      "🎉 <b>IT IS HAPPENING TODAY!</b> 🎉\n\n" +
      "The TurboLoop Port Harcourt Meetup is LIVE TODAY! We can't wait to meet all of you. Let's build the future of DeFi together.\n\n" +
      "👉 <b>Follow live updates:</b> https://turboloop.tech/events",
    buttonText: "🎉 Live updates",
    buttonUrl: "https://turboloop.tech/events",
  },
];

// ─── Campaign A · Events page promo (May 15 → May 29) ──────────────────
//
// Every-other-day cadence, 10:00 UTC. Once A8 fires (May 29) the
// campaign is done; the cron stops finding eligible posts and the slot
// goes quiet naturally.

export const CAMPAIGN_A: CampaignPost[] = [
  {
    id: "A1",
    date: "2026-05-15",
    photoUrl: bannerUrl("A1"),
    caption:
      "🌍 <b>DISCOVER TURBOLOOP EVENTS NEAR YOU</b> 🌍\n\n" +
      "From Lagos to Berlin, Dubai to Port Harcourt — the TurboLoop community is meeting up globally. Find an event in your city or apply to host one!\n\n" +
      "👉 <b>Explore all events:</b> https://turboloop.tech/events",
    buttonText: "🌍 Explore events",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "A2",
    date: "2026-05-17",
    photoUrl: bannerUrl("A2"),
    caption:
      "🤝 <b>WHERE THE COMMUNITY MEETS</b> 🤝\n\n" +
      "Free entry. Real conversations. DeFi education. TurboLoop events are designed for builders and believers.\n\n" +
      "👉 <b>See upcoming events:</b> https://turboloop.tech/events",
    buttonText: "🤝 See upcoming",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "A3",
    date: "2026-05-19",
    photoUrl: bannerUrl("A3"),
    caption:
      "🎤 <b>HOST A TURBOLOOP EVENT IN YOUR CITY</b> 🎤\n\n" +
      "Want to bring the TurboLoop community to your city? Apply to become an official Event Organizer. We provide the resources, you bring the energy.\n\n" +
      "👉 <b>Apply to host:</b> https://turboloop.tech/events",
    buttonText: "🎤 Apply to host",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "A4",
    date: "2026-05-21",
    photoUrl: bannerUrl("A4"),
    caption:
      "🇳🇬 <b>LAGOS WAS JUST THE BEGINNING</b> 🇳🇬\n\n" +
      "100+ attendees, live demos, and incredible community energy. Now, we're taking it global. Next stop: Port Harcourt!\n\n" +
      "👉 <b>Don't miss the next one:</b> https://turboloop.tech/events",
    buttonText: "🇳🇬 Next stop",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "A5",
    date: "2026-05-23",
    photoUrl: bannerUrl("A5"),
    caption:
      "📚 <b>LEARN DeFi FROM THE COMMUNITY</b> 📚\n\n" +
      "Live workshops, expert panels, and hands-on demos. TurboLoop events are the best place to level up your DeFi knowledge.\n\n" +
      "👉 <b>Find an event:</b> https://turboloop.tech/events",
    buttonText: "📚 Find an event",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "A6",
    date: "2026-05-25",
    photoUrl: bannerUrl("A6"),
    caption:
      "🌐 <b>A GLOBAL MOVEMENT</b> 🌐\n\n" +
      "TurboLoop isn't just a platform; it's a worldwide community. Be part of something bigger.\n\n" +
      "👉 <b>Join the movement:</b> https://turboloop.tech/events",
    buttonText: "🌐 Join the movement",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "A7",
    date: "2026-05-27",
    photoUrl: bannerUrl("A7"),
    caption:
      "💼 <b>NETWORK WITH BUILDERS</b> 💼\n\n" +
      "Connect with developers, investors, and community leaders. Real connections lead to real opportunities.\n\n" +
      "👉 <b>See who is attending:</b> https://turboloop.tech/events",
    buttonText: "💼 See attendees",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "A8",
    date: "2026-05-29",
    photoUrl: bannerUrl("A8"),
    caption:
      "🎟️ <b>FREE ENTRY. REAL VALUE.</b> 🎟️\n\n" +
      "No fees. No tickets. Just show up, learn, and connect. TurboLoop events are always free for the community.\n\n" +
      "👉 <b>Apply for free:</b> https://turboloop.tech/events",
    buttonText: "🎟 Apply for free",
    buttonUrl: "https://turboloop.tech/events",
  },
];

// ─── German channel daily content (@TurboLoopDach) ─────────────────────
//
// Reuses the A1–A8 visuals but pairs each with a German caption + a
// referral CTA pointing at turboloop.io?ref=BitPat. The daily cron picks
// today's slot by (UTC day-of-year mod 8) so the channel always has
// fresh content even when the English Campaign A isn't firing that day.
//
// Translations are intentionally direct (no marketing-y reword) — the
// existing English copy is already tight, and German members benefit
// from getting the same message at the same time as the global comms.
// Every caption ends with the same brand-cyan-rocket BitPat CTA.

const DE_REF_CTA =
  "\n\n🚀 <b>Jetzt starten:</b> https://turboloop.io?ref=BitPat";

export const CAMPAIGN_DE_DAILY: Array<Omit<CampaignPost, "date">> = [
  {
    id: "DE-A1",
    photoUrl: bannerUrl("A1"),
    caption:
      "🌍 <b>ENTDECKE TURBOLOOP EVENTS IN DEINER NÄHE</b> 🌍\n\n" +
      "Von Lagos bis Berlin, von Dubai bis Port Harcourt — die TurboLoop-Community trifft sich weltweit. Finde ein Event in deiner Stadt oder bewirb dich, eines zu veranstalten." +
      DE_REF_CTA,
    buttonText: "🌍 Alle Events ansehen",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "DE-A2",
    photoUrl: bannerUrl("A2"),
    caption:
      "🤝 <b>WO DIE COMMUNITY ZUSAMMENKOMMT</b> 🤝\n\n" +
      "Kostenloser Eintritt. Ehrliche Gespräche. DeFi-Wissen aus erster Hand. TurboLoop-Events sind für Bauer und Überzeugte gemacht." +
      DE_REF_CTA,
    buttonText: "🤝 Nächste Events",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "DE-A3",
    photoUrl: bannerUrl("A3"),
    caption:
      "🎤 <b>VERANSTALTE EIN TURBOLOOP-EVENT IN DEINER STADT</b> 🎤\n\n" +
      "Bring die TurboLoop-Community in deine Stadt. Bewirb dich als offizieller Event-Organisator — wir stellen die Ressourcen, du bringst die Energie." +
      DE_REF_CTA,
    buttonText: "🎤 Als Host bewerben",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "DE-A4",
    photoUrl: bannerUrl("A4"),
    caption:
      "🇳🇬 <b>LAGOS WAR ERST DER ANFANG</b> 🇳🇬\n\n" +
      "Über 100 Teilnehmer, Live-Demos und unglaubliche Community-Energie. Jetzt wird es global. Nächster Stopp: Port Harcourt!" +
      DE_REF_CTA,
    buttonText: "🇳🇬 Nächster Stopp",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "DE-A5",
    photoUrl: bannerUrl("A5"),
    caption:
      "📚 <b>LERNE DeFi VON DER COMMUNITY</b> 📚\n\n" +
      "Live-Workshops, Experten-Panels und Hands-on-Demos. TurboLoop-Events sind der beste Ort, um dein DeFi-Wissen zu vertiefen." +
      DE_REF_CTA,
    buttonText: "📚 Event finden",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "DE-A6",
    photoUrl: bannerUrl("A6"),
    caption:
      "🌐 <b>EINE GLOBALE BEWEGUNG</b> 🌐\n\n" +
      "TurboLoop ist nicht nur eine Plattform — es ist eine weltweite Community. Sei Teil von etwas Größerem." +
      DE_REF_CTA,
    buttonText: "🌐 Mitmachen",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "DE-A7",
    photoUrl: bannerUrl("A7"),
    caption:
      "💼 <b>VERNETZE DICH MIT BUILDERN</b> 💼\n\n" +
      "Lerne Entwickler, Investoren und Community-Leiter kennen. Echte Verbindungen führen zu echten Möglichkeiten." +
      DE_REF_CTA,
    buttonText: "💼 Teilnehmer ansehen",
    buttonUrl: "https://turboloop.tech/events",
  },
  {
    id: "DE-A8",
    photoUrl: bannerUrl("A8"),
    caption:
      "🎟️ <b>FREIER EINTRITT. ECHTER MEHRWERT.</b> 🎟️\n\n" +
      "Keine Gebühren. Keine Tickets. Komm einfach vorbei, lerne und vernetze dich. TurboLoop-Events sind immer kostenlos für die Community." +
      DE_REF_CTA,
    buttonText: "🎟 Kostenlos anmelden",
    buttonUrl: "https://turboloop.tech/events",
  },
];

// ─── German Educational Kit rotation (post-May 29) ─────────────────────
//
// Once Campaign A finishes its run (last fire May 29 = A8), the German
// daily slot switches from the A1–A8 cycle above to a 65-day rotation
// through the German educational banner kit uploaded to r2://creatives/de/.
// Each post pairs the captioned German banner from the kit with a
// topically-relevant TurboLoop hub page, plus the same BitPat referral
// CTA appended at the end of the caption.
//
// We import the manifest as a build-time JSON resource — esbuild bundles
// it into the cron lambda. If a banner is somehow missing from the
// manifest (e.g. a partial upload), the function falls back to the
// existing CAMPAIGN_DE_DAILY rotation so the slot never goes silent.

import langKitManifest from "../../next-app/lib/creatives-language-kit-manifest.json";

/** Date the post-Campaign-A rotation activates (inclusive). May 29 is
 *  A8's fire date; May 30 onward the German cron uses the kit. */
const GERMAN_KIT_ACTIVE_FROM_UTC = Date.UTC(2026, 4, 30); // 2026-05-30

/** Per-banner topical CTA. Each entry maps a banner number (01–65) to
 *  the hub page that's most relevant to its concept and a German button
 *  label. Unmapped numbers fall back to the homepage / "Mehr erfahren". */
const GERMAN_KIT_TOPICAL: Record<
  number,
  { url: string; buttonText: string }
> = {
  // 01–11: fundamentals — homepage + ecosystem + DeFi 101 explainers
  1:  { url: "https://turboloop.tech/",          buttonText: "🌐 Mehr erfahren" },
  2:  { url: "https://turboloop.tech/ecosystem", buttonText: "🌐 Ökosystem entdecken" },
  3:  { url: "https://turboloop.tech/learn",     buttonText: "📚 DeFi 101 lesen" },
  4:  { url: "https://turboloop.tech/security",  buttonText: "🛡 Sicherheit ansehen" },
  5:  { url: "https://turboloop.tech/security",  buttonText: "🛡 Sicherheit ansehen" },
  6:  { url: "https://turboloop.tech/learn",     buttonText: "📚 Stablecoins erklärt" },
  7:  { url: "https://turboloop.tech/learn",     buttonText: "📚 BSC verstehen" },
  8:  { url: "https://turboloop.tech/learn",     buttonText: "📚 Liquidity Pools" },
  9:  { url: "https://turboloop.tech/learn",     buttonText: "📚 DeFi vs Bank" },
  10: { url: "https://turboloop.tech/calculator",buttonText: "🧮 Compound-Rechner" },
  11: { url: "https://turboloop.tech/learn",     buttonText: "📚 Wallet einrichten" },

  // 12–19: plans + earnings — calculator
  12: { url: "https://turboloop.tech/calculator",buttonText: "🧮 Pläne vergleichen" },
  13: { url: "https://turboloop.tech/calculator",buttonText: "🧮 Sprint berechnen" },
  14: { url: "https://turboloop.tech/calculator",buttonText: "🧮 Boost berechnen" },
  15: { url: "https://turboloop.tech/calculator",buttonText: "🧮 Power berechnen" },
  16: { url: "https://turboloop.tech/calculator",buttonText: "🧮 Ultimate berechnen" },
  17: { url: "https://turboloop.tech/learn",     buttonText: "📚 So funktioniert es" },
  18: { url: "https://turboloop.tech/calculator",buttonText: "🧮 $100 simulieren" },
  19: { url: "https://turboloop.tech/calculator",buttonText: "🧮 $1k über 12 Monate" },

  // 20–23: income streams + referral + leadership + bonus
  20: { url: "https://turboloop.tech/ecosystem", buttonText: "🌐 3 Einkommensquellen" },
  21: { url: "https://turboloop.tech/ecosystem", buttonText: "🤝 20-Level System" },
  22: { url: "https://turboloop.tech/ecosystem", buttonText: "🏆 Leadership-Ränge" },
  23: { url: "https://turboloop.tech/promotions",buttonText: "🎁 Onboarding-Bonus" },

  // 24–26: paid programs + bug bounty
  24: { url: "https://turboloop.tech/apply#creator",   buttonText: "⭐ Creator werden" },
  25: { url: "https://turboloop.tech/apply#presenter", buttonText: "🎙 Presenter werden" },
  26: { url: "https://turboloop.tech/security",  buttonText: "💰 $100k Challenge" },

  // 27–28: products
  27: { url: "https://turboloop.tech/ecosystem", buttonText: "💳 Turbo Buy" },
  28: { url: "https://turboloop.tech/ecosystem", buttonText: "🔁 Turbo Swap" },

  // 29–34: security pillars
  29: { url: "https://turboloop.tech/security",  buttonText: "🛡 Audit lesen" },
  30: { url: "https://turboloop.tech/security",  buttonText: "🛡 Ownership renounced" },
  31: { url: "https://turboloop.tech/security",  buttonText: "🛡 LP-Lock prüfen" },
  32: { url: "https://turboloop.tech/security",  buttonText: "🛡 Kein KYC" },
  33: { url: "https://turboloop.tech/security",  buttonText: "🛡 Code verifiziert" },
  34: { url: "https://turboloop.tech/security",  buttonText: "🛡 Deine Mittel" },

  // 35–37: earnings vibe
  35: { url: "https://turboloop.tech/calculator",buttonText: "📈 Tägliche Renditen" },
  36: { url: "https://turboloop.tech/apply",     buttonText: "💎 Ab $1 starten" },
  37: { url: "https://turboloop.tech/calculator",buttonText: "📈 Passives Einkommen" },

  // 38–43: referral / leadership / compound deep-dives
  38: { url: "https://turboloop.tech/ecosystem", buttonText: "🤝 Empfehlungssystem" },
  39: { url: "https://turboloop.tech/ecosystem", buttonText: "🤝 Level 1–5" },
  40: { url: "https://turboloop.tech/ecosystem", buttonText: "🤝 Level 6–20" },
  41: { url: "https://turboloop.tech/ecosystem", buttonText: "🏆 Leadership-Ränge" },
  42: { url: "https://turboloop.tech/calculator",buttonText: "🧮 Compound-Power" },
  43: { url: "https://turboloop.tech/ecosystem", buttonText: "🌐 3 Einkommensquellen" },

  // 44–47: plan deep-dives
  44: { url: "https://turboloop.tech/calculator",buttonText: "🧮 Sprint Detail" },
  45: { url: "https://turboloop.tech/calculator",buttonText: "🧮 Boost Detail" },
  46: { url: "https://turboloop.tech/calculator",buttonText: "🧮 Power Detail" },
  47: { url: "https://turboloop.tech/calculator",buttonText: "🧮 Ultimate Detail" },

  // 48–51: programs + bug bounty (second pass)
  48: { url: "https://turboloop.tech/promotions",buttonText: "🎁 Onboarding-Bonus" },
  49: { url: "https://turboloop.tech/apply#creator",   buttonText: "⭐ Creator werden" },
  50: { url: "https://turboloop.tech/apply#presenter", buttonText: "🎙 Presenter werden" },
  51: { url: "https://turboloop.tech/security",  buttonText: "💰 $100k Challenge" },

  // 52–53: products (second pass)
  52: { url: "https://turboloop.tech/ecosystem", buttonText: "💳 Turbo Buy" },
  53: { url: "https://turboloop.tech/ecosystem", buttonText: "🔁 Turbo Swap" },

  // 54–59: security (second pass)
  54: { url: "https://turboloop.tech/security",  buttonText: "🛡 Audit-Report" },
  55: { url: "https://turboloop.tech/security",  buttonText: "🛡 Renounced TX" },
  56: { url: "https://turboloop.tech/security",  buttonText: "🛡 LP gesperrt" },
  57: { url: "https://turboloop.tech/security",  buttonText: "🛡 Kein KYC" },
  58: { url: "https://turboloop.tech/security",  buttonText: "🛡 Quellcode" },
  59: { url: "https://turboloop.tech/security",  buttonText: "🛡 Selbstverwahrung" },

  // 60–63: earnings + community
  60: { url: "https://turboloop.tech/calculator",buttonText: "📈 Tägliche Renditen" },
  61: { url: "https://turboloop.tech/calculator",buttonText: "📈 Passives Einkommen" },
  62: { url: "https://turboloop.tech/ecosystem", buttonText: "🤝 Empfehlungssystem" },
  63: { url: "https://turboloop.tech/ecosystem", buttonText: "🏆 Leadership Detail" },

  // 64–65: closer CTAs
  64: { url: "https://turboloop.tech/",          buttonText: "🌐 Der Loop läuft" },
  65: { url: "https://turboloop.tech/apply",     buttonText: "🚀 Jetzt anmelden" },
};

/** Lookup table built from the language-kit manifest: banner number →
 *  the corresponding German manifest entry. Built once at module load
 *  (not per-call). */
interface LangKitManifestItem {
  slug: string;
  url: string;
  language: string;
  caption?: string;
  visualNumber?: number;
}
const DE_KIT_BY_NUMBER: Map<number, LangKitManifestItem> = new Map();
for (const item of (langKitManifest.items as LangKitManifestItem[]) ?? []) {
  if (item.language === "de" && typeof item.visualNumber === "number") {
    DE_KIT_BY_NUMBER.set(item.visualNumber, item);
  }
}

/** Build today's German-kit post by picking banner (day-of-year mod 65)
 *  + 1, looking up its German caption from the manifest, appending the
 *  BitPat referral CTA, and pairing it with the topical CTA button.
 *  Returns null if the kit isn't populated yet (caller falls back). */
function buildGermanKitPost(): Omit<CampaignPost, "date"> | null {
  if (DE_KIT_BY_NUMBER.size === 0) return null;
  const now = new Date();
  const startOfYear = Date.UTC(now.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear) / 86_400_000
  );
  // Pick by day-of-year so the cron is deterministic per UTC day and
  // restartable without state. The +1 keeps the result in [1, 65].
  const num = (dayOfYear % 65) + 1;
  const pad = String(num).padStart(2, "0");
  const item = DE_KIT_BY_NUMBER.get(num);
  if (!item) return null;

  const topical = GERMAN_KIT_TOPICAL[num] ?? {
    url: "https://turboloop.tech/",
    buttonText: "🌐 Mehr erfahren",
  };
  return {
    id: `DE-KIT-${pad}`,
    photoUrl: item.url,
    caption: (item.caption ?? "") + DE_REF_CTA,
    buttonText: topical.buttonText,
    buttonUrl: topical.url,
  };
}

// ─── Lookup helpers ────────────────────────────────────────────────────

/** Returns today's UTC date in YYYY-MM-DD form. */
export function todayUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Find the Campaign A or B post (if any) scheduled for today's UTC date.
 *  Returns null if today isn't on the schedule. */
export function todaysCampaignPost(
  campaign: CampaignPost[]
): CampaignPost | null {
  const today = todayUtcDate();
  return campaign.find(p => p.date === today) ?? null;
}

/** Pick today's German daily slot. Two phases:
 *
 *   Phase 1 (until 2026-05-29 inclusive): rotates through the 8 A1–A8
 *   visuals with German captions — see CAMPAIGN_DE_DAILY above.
 *
 *   Phase 2 (from 2026-05-30): rotates through the 65 educational
 *   banners in the German kit on a day-of-year mod 65 cycle. Each post
 *   gets the German caption from the manifest + the BitPat referral CTA
 *   appended + a topical CTA button (calculator/security/ecosystem/etc).
 *
 *   The post-cutover path falls through to Phase 1 if the German kit
 *   manifest isn't populated, so the slot stays alive even mid-rollout. */
export function todaysGermanPost(): Omit<CampaignPost, "date"> {
  if (Date.now() >= GERMAN_KIT_ACTIVE_FROM_UTC) {
    const kit = buildGermanKitPost();
    if (kit) return kit;
    // Fall through to phase 1 if the kit isn't yet populated.
  }
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start) / 86_400_000);
  const idx =
    ((dayOfYear % CAMPAIGN_DE_DAILY.length) +
      CAMPAIGN_DE_DAILY.length) %
    CAMPAIGN_DE_DAILY.length;
  return CAMPAIGN_DE_DAILY[idx];
}
