// One-shot manual fire for a Campaign A or B post. Used when we're past
// the cron's scheduled fire time for today and need to push the post
// out by hand (e.g. May 15: A1's 10:00 UTC slot + B1's 13:00 UTC slot
// were both behind us when the cron was wired up).
//
// Reads .env for TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL, TELEGRAM_CHAT.
// Sends to BOTH the channel and the chat — same broadcast pattern as
// tgBroadcastPhoto in server/_vercel/_telegram.ts.
//
// Usage:
//   node scripts/fire-campaign-now.mjs --post A1
//   node scripts/fire-campaign-now.mjs --post B1
//   node scripts/fire-campaign-now.mjs --post A1 --post B1
//
// The post-id list is canonical with server/_vercel/_campaigns.ts — if
// you edit captions in one place, update the other too. We intentionally
// duplicated rather than import-from-TS so this stays a zero-dependency
// .mjs that runs without a transpiler.

// dotenv/config loaded conditionally so callers using Node's native
// --env-file flag aren't fighting empty values in .env. If both are
// present we prefer the externally-passed env (--env-file=...).
if (!process.env.TELEGRAM_BOT_TOKEN) {
  await import("dotenv/config");
}

const R2 = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

const POSTS = {
  A1: {
    photoUrl: `${R2}/campaign-banners/A1.png`,
    caption:
      "🌍 <b>DISCOVER TURBOLOOP EVENTS NEAR YOU</b> 🌍\n\n" +
      "From Lagos to Berlin, Dubai to Port Harcourt — the TurboLoop community is meeting up globally. Find an event in your city or apply to host one!\n\n" +
      "👉 <b>Explore all events:</b> https://turboloop.tech/events",
    buttonText: "🌍 Explore events",
    buttonUrl: "https://turboloop.tech/events",
  },
  B1: {
    photoUrl: `${R2}/campaign-banners/B1.png`,
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
};

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL = process.env.TELEGRAM_CHANNEL;
const CHAT = process.env.TELEGRAM_CHAT;

if (!TOKEN) {
  console.error("Missing TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}
const destinations = [CHANNEL, CHAT].filter(Boolean);
if (destinations.length === 0) {
  console.error("No destinations — set TELEGRAM_CHANNEL and/or TELEGRAM_CHAT in .env");
  process.exit(1);
}

const argv = process.argv.slice(2);
const requested = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--post" && argv[i + 1]) {
    requested.push(argv[i + 1].toUpperCase());
    i++;
  }
}
if (requested.length === 0) {
  console.error("Required: --post <id> (one or more). Known ids: " + Object.keys(POSTS).join(", "));
  process.exit(1);
}

async function sendPhoto(chatId, post) {
  const body = {
    chat_id: chatId,
    photo: post.photoUrl,
    caption: post.caption,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: post.buttonText, url: post.buttonUrl }]],
    },
  };
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  return { ok: data?.ok === true, error: data?.description, status: r.status };
}

(async () => {
  for (const id of requested) {
    const post = POSTS[id];
    if (!post) {
      console.error(`  ✗ ${id} — not in POSTS map`);
      continue;
    }
    console.log(`\nFiring ${id}…`);
    for (const chatId of destinations) {
      const result = await sendPhoto(chatId, post);
      const mark = result.ok ? "✓" : "✗";
      const detail = result.ok ? "" : ` — ${result.error ?? `HTTP ${result.status}`}`;
      console.log(`  ${mark} → ${chatId}${detail}`);
    }
  }
  console.log("");
})().catch(err => {
  console.error(err);
  process.exit(1);
});
