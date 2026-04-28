// One-off script: fires today's evening blog announcement + sets up scheduled
// Zoom reminders for the rest of today. Used to bootstrap automation on launch day.

import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL = "@TurboLoop_Official";
const CHAT = "@TurboLoop_Chat";
const SITE = "https://turboloop.tech";
const LOGO = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png";

const sql = neon(process.env.DATABASE_URL);

async function tgPhoto(chatId, photoUrl, caption, button) {
  const body = {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
  };
  if (button) body.reply_markup = { inline_keyboard: [[button]] };
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  return data;
}

// ============ FIRE TODAY'S EVENING BLOG ============
async function fireEveningBlog() {
  const due = await sql`SELECT slug, title, excerpt FROM blog_posts WHERE published=true ORDER BY scheduled_publish_at DESC NULLS LAST LIMIT 1`;
  const post = due[0];
  if (!post) { console.log("No published post"); return; }

  console.log(`\n📰 Announcing evening blog: ${post.slug}`);
  const url = `${SITE}/blog/${post.slug}`;
  const caption = `<b>🌙 Evening read</b>\n\n<b>${post.title}</b>\n\n${(post.excerpt || "").slice(0, 220)}\n\n#TurboLoop #DeFi #BSC`;
  const button = { text: "📖 Read full article", url };

  for (const dest of [CHANNEL, CHAT]) {
    const r = await tgPhoto(dest, LOGO, caption, button);
    console.log(`  ${dest}: ${r.ok ? "✅ sent" : "❌ " + r.description}`);
  }

  // Mark as fired so the cron doesn't double-post at 14:00 UTC
  const today = new Date().toISOString().slice(0, 10);
  await sql`INSERT INTO site_settings (key, value) VALUES (${'lastFired:blog:evening:' + today}, ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
  console.log(`  Marked lastFired:blog:evening:${today}`);
}

await fireEveningBlog();
process.exit(0);
