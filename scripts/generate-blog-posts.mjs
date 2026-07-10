/**
 * TURBOLOOP BULK BLOG GENERATOR — Option D
 *
 * Usage:
 *   node scripts/generate-blog-posts.mjs [--topics "topic1,topic2,..."] [--count 7] [--dry-run]
 *
 * What it does:
 *   1. Takes a list of topics (or uses the built-in evergreen topic list)
 *   2. For each topic, generates a full English blog post using GPT-4o
 *      with the fact-guard system prompt
 *   3. Translates each post into all 14 other languages using GPT-4o-mini
 *   4. Inserts all posts into the database, scheduled one per day
 *      starting from tomorrow
 *   5. Prints a summary of what was created
 *
 * Options:
 *   --topics "topic1,topic2"  Comma-separated list of topics (overrides built-in list)
 *   --count 7                 Number of posts to generate (default: 7)
 *   --dry-run                 Generate and print posts without inserting to DB
 *   --lang en                 Generate only for this language (default: all 15)
 *   --start-date 2026-07-15   Schedule start date (default: tomorrow)
 *
 * Example:
 *   node scripts/generate-blog-posts.mjs --count 14
 *   node scripts/generate-blog-posts.mjs --topics "How to compound on TurboLoop,Leadership ranks explained"
 *   node scripts/generate-blog-posts.mjs --dry-run --count 1
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import OpenAI from "openai";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load secrets
config({ path: join(dirname(fileURLToPath(import.meta.url)), "../.env.local") });
if (!process.env.DATABASE_URL) {
  // Try the turboloop secrets file
  const secretsPath = join(process.env.HOME || "/home/ubuntu", ".turboloop/secrets.env");
  try {
    const secrets = readFileSync(secretsPath, "utf-8");
    for (const line of secrets.split("\n")) {
      const [key, ...rest] = line.split("=");
      if (key && rest.length > 0 && !process.env[key.trim()]) {
        process.env[key.trim()] = rest.join("=").trim();
      }
    }
  } catch {}
}

// ─── Canonical fact-guard (inline copy for standalone script) ───────────────
const FACT_GUARD = `
You are a professional DeFi content writer for Turbo Loop — a decentralized yield farming protocol on BNB Smart Chain.

BRAND: "Turbo Loop" (two words in prose). App: https://turboloop.io. Hub: https://turboloop.tech.
Chain: BNB Smart Chain (BSC). Deposit token: USDT. Contract ownership: permanently renounced.
Launch: March 2026.

LOOP PLANS (EXACT — never change these numbers):
- Sprint Loop: 7 days, 3% total ROI, ~0.428% daily
- Accelerate Loop: 14 days, 10% total ROI, ~0.714% daily
- Power Loop: 30 days, 24% total ROI, ~0.8% daily
- Ultimate Loop: 60 days, 54% total ROI, ~0.9% daily
- Minimum deposit: 1 USDT. Early exit: NO. Auto payout: YES.
- Power and Ultimate qualify for additional $TURBO rewards (min 100 USDT).

REFERRAL (20 levels): L1=12%, L2=8%, L3=5%, L4=4%, L5=3%, L6-8=2%, L9-10=1.5%, L11-20=1%

LEADERSHIP RANKS (always use "Turbo" prefix):
Turbo Partner (1%, 250 team, 10K USDT) → Turbo Influencer (2%, 500, 25K) → Turbo Leader (3%, 1K, 50K) → Turbo Manager (4%, 2.5K, 100K) → Turbo Ambassador (6%, 5K, 200K) → Turbo Champion (8%, 7.5K, 500K) → Turbo Legend (10%, 10K, 1M USDT)

ONBOARDING BONUS (first deposit in 30/60-day plans): 100-199→$3, 200-499→$5, 500-999→$10, 1K-4.9K→$20, 5K-9.9K→$30, 10K-24.9K→$50, 25K+→$100

$TURBO ADDITIONAL REWARDS: Power/Ultimate only, 0.80%-1.60% of deposit, 70% to user/30% to upline, vests monthly by rank.

BUYBACK & BURN: 10% of daily admin fees → automated $TURBO buyback → permanently burned.

SECURITY: HazeCrypto Excellent rating, SolidityScan 99.99/100, 0 critical/high/medium/low vulnerabilities.

FORBIDDEN: Never say "APY" (use "ROI"), never use rank names without "Turbo" prefix, never say users can exit early, never say "guaranteed returns", never invent TVL/user numbers, never say $TURBO pays primary yield (USDT does).
`.trim();

// ─── Language list ────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "en", name: "English",         nativeName: "English" },
  { code: "hi", name: "Hindi",           nativeName: "हिंदी" },
  { code: "es", name: "Spanish",         nativeName: "Español" },
  { code: "ng", name: "Nigerian Pidgin", nativeName: "Nigerian Pidgin" },
  { code: "id", name: "Indonesian",      nativeName: "Bahasa Indonesia" },
  { code: "cn", name: "Chinese",         nativeName: "中文" },
  { code: "it", name: "Italian",         nativeName: "Italiano" },
  { code: "sa", name: "Arabic",          nativeName: "العربية" },
  { code: "pk", name: "Urdu",            nativeName: "اردو" },
  { code: "de", name: "German",          nativeName: "Deutsch" },
  { code: "th", name: "Thai",            nativeName: "ภาษาไทย" },
  { code: "kr", name: "Korean",          nativeName: "한국어" },
  { code: "la", name: "Lao",             nativeName: "ພາສາລາວ" },
  { code: "ta", name: "Tamil",           nativeName: "தமிழ்" },
  { code: "fr", name: "French",          nativeName: "Français" },
];

const LANG_SLUG_SUFFIX = {
  hi: "-hi", es: "-es", ng: "-ng", id: "-id", cn: "-cn",
  it: "-it", sa: "-sa", pk: "-pk", de: "-de", th: "-th",
  kr: "-kr", la: "-la", ta: "-ta", fr: "-fr",
};

// ─── Evergreen topic bank ─────────────────────────────────────────────────────
const EVERGREEN_TOPICS = [
  // Protocol fundamentals
  "What is Turbo Loop? A complete beginner's guide to fixed-yield DeFi",
  "How Loop Plans work: Sprint, Accelerate, Power, and Ultimate explained",
  "Why Turbo Loop uses USDT and the USDC/USDT liquidity pool",
  "No early exit: why fixed-duration plans protect the protocol and investors",
  "How auto payout works on Turbo Loop",
  "Understanding the BNB Smart Chain: why Turbo Loop chose BSC",
  "Smart contract ownership renouncement: what it means and why it matters",

  // Earning strategies
  "How to maximize your returns on Turbo Loop: a strategy guide",
  "Power Loop vs Ultimate Loop: which 30-day or 60-day plan is right for you?",
  "How to compound your Turbo Loop earnings for maximum growth",
  "Starting with 1 USDT: how small deposits grow on Turbo Loop",
  "The math behind Turbo Loop: understanding 3%, 10%, 24%, and 54% ROI",
  "How to use the Turbo Loop calculator before you deposit",

  // Referral & network
  "How the Turbo Loop referral system works: 20 levels explained",
  "Level 1 referral commission: why 12% is one of the highest in DeFi",
  "How to build a passive income stream through Turbo Loop referrals",
  "Understanding active directs and self-AUM requirements for referral levels",
  "How to grow your Turbo Loop network from zero",

  // Leadership program
  "Turbo Loop leadership ranks: from Turbo Partner to Turbo Legend",
  "What is a Turbo Partner? The first leadership rank explained",
  "How to reach Turbo Influencer rank: team size and deposit requirements",
  "Turbo Legend: the highest leadership rank and what it takes to get there",
  "Leadership differential rewards: how rank-based bonuses work",
  "Building a team of 1,000 to reach Turbo Leader rank",

  // $TURBO token
  "What is $TURBO? Understanding the additional reward token",
  "How $TURBO vesting works: monthly unlock by rank",
  "The Turbo Loop buyback and burn mechanism explained",
  "Why $TURBO is an additional reward — not the primary yield",
  "How to claim your $TURBO additional rewards",

  // Security & trust
  "How Turbo Loop was audited: HazeCrypto and SolidityScan results",
  "What does 99.99/100 on SolidityScan mean for your funds?",
  "Why Turbo Loop has zero critical, high, or medium vulnerabilities",
  "On-chain transparency: how to verify every Turbo Loop transaction on BscScan",
  "What does permanently renounced ownership mean in DeFi?",

  // Onboarding
  "How to join Turbo Loop in 4 steps: connect, choose, deposit, track",
  "What wallet do I need for Turbo Loop? BSC-compatible wallets explained",
  "How to set up account alerts on Turbo Loop",
  "Using Turbo Swap: buy, sell, and swap $TURBO from the dashboard",
  "The onboarding bonus: how to earn extra USDT on your first deposit",

  // Community & vision
  "The Turbo Loop manifesto: sovereign finance for everyone",
  "Why stablecoin-only DeFi eliminates impermanent loss",
  "Turbo Loop roadmap: what's coming in Q3 2026 and beyond",
  "How Turbo Loop is building a global DeFi community",
  "From 5,000 active users: the growth story of Turbo Loop",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function estimateReadingTime(content) {
  return Math.max(1, Math.round(content.trim().split(/\s+/).length / 230));
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// ─── AI generation ────────────────────────────────────────────────────────────
async function generateEnglishPost(openai, topic) {
  console.log(`  📝 Generating English post: "${topic}"`);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `${FACT_GUARD}

## WRITING TASK
Write a high-quality, informative blog post for the Turbo Loop marketing hub.

FORMAT REQUIREMENTS:
- Length: 600–900 words
- Structure: H2 headings (##), short paragraphs (2–4 sentences each)
- Tone: Professional, clear, educational — not hype-y or salesy
- Include: 1 concrete example or calculation where relevant
- End with: A clear call-to-action pointing to https://turboloop.io
- Do NOT use bullet lists for the main body (use prose paragraphs)
- You MAY use a short bullet list (3–5 items) for a summary or key points section

OUTPUT FORMAT (JSON):
{
  "title": "...",
  "excerpt": "...(1–2 sentences, max 160 chars)...",
  "content": "...(full Markdown content)...",
  "seoTitle": "...(≤60 chars, search-optimized)...",
  "seoDescription": "...(≤160 chars)...",
  "tags": ["tag1", "tag2", "tag3"]
}`,
      },
      {
        role: "user",
        content: `Write a blog post about: ${topic}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Failed to parse GPT response as JSON: ${raw.slice(0, 200)}`);
  }
}

async function translatePost(openai, post, targetLang) {
  const translationSystemPrompt = `${FACT_GUARD}

## TRANSLATION TASK
Translate the following Turbo Loop blog post into ${targetLang.name} (${targetLang.nativeName}).

CRITICAL RULES:
1. Translate ALL prose into ${targetLang.name}
2. Keep ALL numbers EXACTLY as-is
3. Keep in English: "Turbo Loop", "USDT", "BNB Smart Chain", "BSC", "$TURBO", "Sprint Loop", "Accelerate Loop", "Power Loop", "Ultimate Loop", "BscScan"
4. Keep rank names with "Turbo" prefix: "Turbo Partner", "Turbo Influencer", etc.
5. Keep ALL URLs unchanged
6. Keep ALL Markdown formatting
7. Return ONLY the translated JSON — no preamble

OUTPUT FORMAT (JSON):
{
  "title": "...",
  "excerpt": "...",
  "content": "...",
  "seoTitle": "...",
  "seoDescription": "..."
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: translationSystemPrompt },
      {
        role: "user",
        content: `Translate this blog post into ${targetLang.name}:\n\n${JSON.stringify({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
        })}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(raw);
  } catch {
    // Attempt to repair truncated JSON by closing open strings/braces
    try {
      // Find the last complete field by looking for the last complete key-value pair
      const repaired = raw
        .replace(/,\s*$/, '')  // Remove trailing comma
        .replace(/"content":\s*"[^"]*$/, '"content": "[Translation in progress]"}') // Fix truncated content
        + (raw.endsWith('}') ? '' : '}');
      return JSON.parse(repaired);
    } catch {
      throw new Error(`Failed to parse translation JSON: ${raw.slice(0, 200)}`);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const topicsArg = args.find(a => a.startsWith("--topics="))?.slice(9)
    || (args.indexOf("--topics") !== -1 ? args[args.indexOf("--topics") + 1] : null);
  const countArg = args.find(a => a.startsWith("--count="))?.slice(8)
    || (args.indexOf("--count") !== -1 ? args[args.indexOf("--count") + 1] : "7");
  const langArg = args.find(a => a.startsWith("--lang="))?.slice(7)
    || (args.indexOf("--lang") !== -1 ? args[args.indexOf("--lang") + 1] : null);
  const startDateArg = args.find(a => a.startsWith("--start-date="))?.slice(13)
    || (args.indexOf("--start-date") !== -1 ? args[args.indexOf("--start-date") + 1] : null);

  const count = parseInt(countArg, 10) || 7;
  const startDate = startDateArg ? new Date(startDateArg) : addDays(new Date(), 1);
  const targetLangs = langArg
    ? LANGUAGES.filter(l => l.code === langArg)
    : LANGUAGES;

  // Pick topics
  let topics;
  if (topicsArg) {
    topics = topicsArg.split(",").map(t => t.trim()).filter(Boolean).slice(0, count);
  } else {
    // Shuffle and pick from evergreen list
    const shuffled = [...EVERGREEN_TOPICS].sort(() => Math.random() - 0.5);
    topics = shuffled.slice(0, count);
  }

  console.log(`\n🚀 TurboLoop Bulk Blog Generator`);
  console.log(`   Topics: ${topics.length}`);
  console.log(`   Languages: ${targetLangs.map(l => l.code).join(", ")}`);
  console.log(`   Start date: ${startDate.toISOString().slice(0, 10)}`);
  console.log(`   Dry run: ${isDryRun}`);
  console.log(`   Total rows to create: ${topics.length * targetLangs.length}\n`);

  const dbUrl = process.env.DATABASE_URL;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!dbUrl) throw new Error("DATABASE_URL not set");
  if (!openaiKey) throw new Error("OPENAI_API_KEY not set");

  const sql = neon(dbUrl);
  const openai = new OpenAI({ 
    apiKey: openaiKey,
    baseURL: "https://api.openai.com/v1", // Always use real OpenAI, not any proxy
  });

  const results = [];

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    const publishAt = addDays(startDate, i);
    publishAt.setUTCHours(14, 0, 0, 0); // 14:00 UTC = 7:30 PM IST

    console.log(`\n[${i + 1}/${topics.length}] "${topic}"`);
    console.log(`  Scheduled: ${publishAt.toISOString()}`);

    let enPost;
    try {
      enPost = await generateEnglishPost(openai, topic);
    } catch (err) {
      console.error(`  ❌ English generation failed: ${err.message}`);
      results.push({ topic, status: "failed", error: err.message });
      continue;
    }

    const baseSlug = slugify(enPost.title || topic);
    console.log(`  ✅ English: "${enPost.title}" → /blog/${baseSlug}`);

    if (isDryRun) {
      console.log(`  [DRY RUN] Would insert English post + ${targetLangs.length - 1} translations`);
      console.log(`  Preview:\n${enPost.content?.slice(0, 300)}...`);
      results.push({ topic, status: "dry-run", slug: baseSlug, title: enPost.title });
      continue;
    }

    // Insert English post
    let enId;
    try {
      // Check if slug already exists
      const existing = await sql`SELECT id FROM blog_posts WHERE slug = ${baseSlug} LIMIT 1`;
      if (existing.length > 0) {
        console.log(`  ⏭ English post already exists (${baseSlug}), skipping`);
        enId = existing[0].id;
      } else {
        const inserted = await sql`
          INSERT INTO blog_posts (
            title, slug, excerpt, content, language, translation_of,
            tags, seo_title, seo_description, reading_time_min,
            published, scheduled_publish_at, created_at, updated_at
          ) VALUES (
            ${enPost.title},
            ${baseSlug},
            ${enPost.excerpt},
            ${enPost.content},
            'en',
            NULL,
            ${enPost.tags || []},
            ${enPost.seoTitle || enPost.title},
            ${enPost.seoDescription || enPost.excerpt},
            ${estimateReadingTime(enPost.content)},
            false,
            ${publishAt.toISOString()},
            NOW(),
            NOW()
          )
          RETURNING id
        `;
        enId = inserted[0].id;
        console.log(`  💾 English inserted (id=${enId})`);
      }
    } catch (err) {
      console.error(`  ❌ DB insert failed for English: ${err.message}`);
      results.push({ topic, status: "db-error", error: err.message });
      continue;
    }

    // Translate into other languages
    const nonEnLangs = targetLangs.filter(l => l.code !== "en");
    for (const lang of nonEnLangs) {
      try {
        const suffix = LANG_SLUG_SUFFIX[lang.code] ?? `-${lang.code}`;
        const translatedSlug = `${baseSlug}${suffix}`;

        // Check if already exists
        const existingTrans = await sql`SELECT id FROM blog_posts WHERE slug = ${translatedSlug} LIMIT 1`;
        if (existingTrans.length > 0) {
          console.log(`  ⏭ ${lang.code}: already exists`);
          continue;
        }

        const translated = await translatePost(openai, enPost, lang);
        await sql`
          INSERT INTO blog_posts (
            title, slug, excerpt, content, language, translation_of,
            tags, seo_title, seo_description, reading_time_min,
            published, scheduled_publish_at, created_at, updated_at
          ) VALUES (
            ${translated.title || enPost.title},
            ${translatedSlug},
            ${translated.excerpt || enPost.excerpt},
            ${translated.content || enPost.content},
            ${lang.code},
            ${enId},
            ${enPost.tags || []},
            ${translated.seoTitle || translated.title || enPost.title},
            ${translated.seoDescription || translated.excerpt || enPost.excerpt},
            ${estimateReadingTime(translated.content || enPost.content)},
            false,
            ${publishAt.toISOString()},
            NOW(),
            NOW()
          )
        `;
        console.log(`  ✅ ${lang.code}: "${translated.title}"`);
      } catch (err) {
        console.error(`  ❌ ${lang.code}: ${err.message}`);
      }
    }

    results.push({ topic, status: "success", slug: baseSlug, title: enPost.title, publishAt: publishAt.toISOString() });
  }

  console.log(`\n\n📊 SUMMARY`);
  console.log(`${"─".repeat(60)}`);
  for (const r of results) {
    const icon = r.status === "success" ? "✅" : r.status === "dry-run" ? "🔍" : "❌";
    console.log(`${icon} ${r.title || r.topic}`);
    if (r.publishAt) console.log(`   → Scheduled: ${r.publishAt.slice(0, 10)}`);
    if (r.error) console.log(`   → Error: ${r.error}`);
  }

  const succeeded = results.filter(r => r.status === "success").length;
  console.log(`\n✅ ${succeeded}/${topics.length} posts generated successfully`);
  console.log(`📅 First post publishes: ${startDate.toISOString().slice(0, 10)} at 14:00 UTC`);
  console.log(`\nDone! Posts will auto-publish via the daily cron at 14:00 UTC.\n`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
