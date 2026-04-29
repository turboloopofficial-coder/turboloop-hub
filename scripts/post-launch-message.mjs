// One-shot launch announcement: posts the refined "TurboLoop.tech is live" message
// to @TurboLoop_Official (broadcast) and @TurboLoop_Chat (group) with the dynamic
// launch banner attached, then prints destination links.
//
// Usage:
//   node scripts/post-launch-message.mjs --dry-run     # prints what would be sent, no API calls
//   node scripts/post-launch-message.mjs               # actually posts (requires confirmation prompt)
//   node scripts/post-launch-message.mjs --yes         # posts without prompt (CI/scripted)
//
// Env required (loaded from .env):
//   TELEGRAM_BOT_TOKEN — the bot's API token
//
// Targets are hard-coded below — change here if the channel/chat handles ever shift.

import "dotenv/config";
import readline from "node:readline";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL = "@TurboLoop_Official";
const CHAT = "@TurboLoop_Chat";
const SITE = "https://turboloop.tech";
const BANNER = `${SITE}/api/og-banner?type=launch`;

// ---- The refined launch message (matches plan v3) ----
// Telegram caption limit is 1024 chars. This message is ~640 chars including HTML.
// Uses HTML parse_mode (matches existing _telegram.ts default).
const CAPTION = [
  "<b>TurboLoop.tech is live.</b>",
  "",
  "For the first time everything we've built — the protocol, the community, the security work, the creator network — has a home of its own. Not a landing page. A hub.",
  "",
  "<b>A few rooms worth visiting:</b>",
  "",
  "▸ <a href=\"https://turboloop.tech/ecosystem\">/ecosystem</a> — the six pillars, each with a deep-dive",
  "▸ <a href=\"https://turboloop.tech/security\">/security</a> — what's locked, what's audited, what's verifiable",
  "▸ <a href=\"https://turboloop.tech/community\">/community</a> — leaderboard, social wall, country leaders",
  "▸ <a href=\"https://turboloop.tech/creatives\">/creatives</a> — 141 ready-to-share banners with captions in 48 languages",
  "▸ <a href=\"https://turboloop.tech/feed\">/feed</a> — long-form blog, updated weekly",
  "",
  "We didn't build this to look at. We built it so you have something to send when someone asks <i>\"what is TurboLoop, really?\"</i>",
  "",
  "Send it. Share it. Use the creatives. Translate them. Make it yours.",
].join("\n");

// CTA buttons appear under the banner — Telegram renders them as inline pills
const BUTTONS = [
  [{ text: "🌐 Visit turboloop.tech", url: SITE }],
  [
    { text: "🛡 Security", url: `${SITE}/security` },
    { text: "🎨 Creatives", url: `${SITE}/creatives` },
  ],
];

// ---- CLI parse ----
const argv = process.argv.slice(2);
const DRY = argv.includes("--dry-run") || argv.includes("-n");
const SKIP_PROMPT = argv.includes("--yes") || argv.includes("-y");

function fmtPreview() {
  // Strip HTML tags for terminal preview only (not what gets sent)
  const plain = CAPTION
    .replace(/<a [^>]+>([^<]+)<\/a>/g, "$1")
    .replace(/<[^>]+>/g, "");
  return plain;
}

async function tgSendPhoto(chatId) {
  const body = {
    chat_id: chatId,
    photo: BANNER,
    caption: CAPTION,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: BUTTONS },
  };
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

function ask(q) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, (a) => { rl.close(); resolve(a.trim().toLowerCase()); });
  });
}

(async () => {
  console.log("🚀 TurboLoop.tech launch announcement");
  console.log("─────────────────────────────────────");
  console.log(`Banner:   ${BANNER}`);
  console.log(`Targets:  ${CHANNEL} (broadcast)  +  ${CHAT} (group)`);
  console.log(`Buttons:  ${BUTTONS.flat().map((b) => b.text).join(" · ")}`);
  console.log("");
  console.log("─── caption preview (plain text) ───");
  console.log(fmtPreview());
  console.log("─────────────────────────────────────");
  console.log("");

  if (DRY) {
    console.log("✅ Dry run — no Telegram calls made.");
    console.log("   Re-run without --dry-run to actually post.");
    process.exit(0);
  }

  if (!TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN not set in env.");
    process.exit(1);
  }

  if (!SKIP_PROMPT) {
    const a = await ask("Post this NOW to both destinations? (yes/no) ");
    if (a !== "yes" && a !== "y") {
      console.log("Aborted.");
      process.exit(0);
    }
  }

  for (const dest of [CHANNEL, CHAT]) {
    console.log(`→ ${dest} ...`);
    const r = await tgSendPhoto(dest);
    if (r.ok) {
      const messageId = r.result?.message_id;
      const link = dest.startsWith("@")
        ? `https://t.me/${dest.slice(1)}/${messageId}`
        : `(message_id=${messageId})`;
      console.log(`  ✅ sent — ${link}`);
    } else {
      console.log(`  ❌ ${r.description || JSON.stringify(r)}`);
    }
  }

  console.log("");
  console.log("📌 Next manual step: PIN the message in @TurboLoop_Official for 7 days.");
  console.log("   Telegram → message → ⋮ → Pin → 'Notify all members' = ON");
  console.log("");
  console.log("📊 Track: GA4 acquisition (source=telegram), `/` page views, time-on-site.");
})();
