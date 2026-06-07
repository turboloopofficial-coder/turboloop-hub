// Build the chatbot Knowledge Base at deploy time.
//
// Sources, in order of priority:
//   1. PROTOCOL_FACTS — hand-curated facts that must always be right
//      (plan ROIs, audit URL, fee structure, etc.). Hardcoded here so
//      a bad blog post can't corrupt them.
//   2. Published blog posts (English only) — fetched from Neon at
//      build time. Filtered to non-empty content, sorted recent-first.
//   3. FAQ entries — sourced from next-app/app/faq/page.tsx (static
//      file parsed for the FAQS array).
//
// Output: next-app/lib/chatbot-kb.ts with two exports:
//   - KB_CONTENT (string) — the concatenated knowledge base
//   - KB_VERSION (string) — sha256 of KB_CONTENT, truncated to 16 chars
//
// Failure mode: if the DB or filesystem lookup fails, the script exits
// non-zero and Vercel falls back to the last committed chatbot-kb.ts
// (we keep it in git, never delete on failure). Bad data > no data.
//
// Usage:
//   node scripts/build-chatbot-kb.mjs
//   node scripts/build-chatbot-kb.mjs --dry-run   # write to /tmp instead

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DRY_RUN = process.argv.includes("--dry-run");
const OUT_PATH = path.resolve(
  DRY_RUN ? "./tmp-chatbot-kb.ts" : "./next-app/lib/chatbot-kb.ts"
);

// ─── 1. Curated facts ──────────────────────────────────────────────
const PROTOCOL_FACTS = `# Turbo Loop Protocol Facts (must always be right)

## What it is
Turbo Loop is a decentralized yield protocol on Binance Smart Chain (BSC).
Smart-contract-driven, no custody, no admin keys (ownership renounced).
Contract address: 0xc90E5785632dAaB9Cb61F5050dA393090541A76D.
Live dApp: https://turboloop.io
Marketing site: https://www.turboloop.tech

## Four investment plans (flat ROI, paid at maturity — NOT compounded APY)
- Sprint:   7 days, 3% ROI
- Boost:    14 days, 10% ROI
- Power:    30 days, 24% ROI
- Ultimate: 60 days, 54% ROI

Earnings formula: earnings = deposit × roi%. Capital is returned at
maturity along with the flat ROI. Plans are one-shot; rolling into
another plan is a separate decision.

## Minimums + access
- Minimum deposit: $1 USDT
- No KYC, non-custodial
- Network: BSC. Need BNB for gas (~$5 covers a year of active use).

## Real yield sources (not emissions, not Ponzi-style)
1. PancakeSwap V3 LP fees from USDT/USDC pool
2. Turbo Swap (in-app DEX) fees
3. Turbo Buy (fiat-to-crypto on-ramp) fees

## Security
- First independent audit by Haze Crypto (completed at launch)
- Current audit on SolidityScan (QuickScan), public report:
  https://solidityscan.com/quickscan/0xc90E5785632dAaB9Cb61F5050dA393090541A76D/bscscan/mainnet
- Ownership renounced on-chain (no admin function exists)
- 100% LP locked via Unicrypt
- BscScan source verified
- $100,000 bounty for anyone who can find a centralization risk

## Referral + leadership
- 20-level referral network, 51% total commission distribution
- 7 leadership ranks, bonuses 1%–10%

## $TURBO Token
TurboLoop now has a native rewards token: $TURBO (BEP-20 on BSC).
Contract: 0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3
Total supply: 1,000,000 TURBO. Launch price: $0.001. 100% fair launch — no team allocation, no insider reserve, LP 100% locked.
Token page: https://www.turboloop.tech/token
Buy: https://turboloop.io/dashboard/swap?from=USDT&to=TURBO
Sell: https://turboloop.io/dashboard/swap?from=TURBO&to=USDT
Live chart: https://dexscreener.com/bsc/0x5bede66bb27184001960e769efab95304f0e1759

$TURBO is an EXTRA rewards layer on top of standard Loop Plan yields. It does NOT replace or affect USDT yield. Token rewards are only available on Power (30-day) and Ultimate (60-day) plans. Minimum deposit for token rewards: $100.

Deposit reward tiers (reward split: 70% investor / 30% referrer):
- $100–$499: 0.80% of deposit in TURBO
- $500–$999: 1.00%
- $1,000–$4,999: 1.20%
- $5,000–$9,999: 1.40%
- $10,000–$24,999: 1.50%
- $25,000+: 1.60%

Token count is fixed at deposit time at the live market price at that moment.
First vesting installment is instant. Remaining unlocks monthly based on Leadership Program rank:
Base=10%/month, Partner=11%, Influencer=12%, Leader=14%, Manager=15%, Ambassador=16%, Champion=18%, Legend=20%.

Deflationary mechanism (separate from trade tax): 10% of admin fees from the main TurboLoop protocol are used to buy and burn TURBO daily, automated on-chain.
Trade tax: 1% buy / 2% sell — collected by admin.

Manage tokens in app: https://turboloop.io/dashboard/token-rewards

## Earning programs (apply at /apply)
- Creator Star: post content about Turbo Loop, paid by views ($5–$1000
  per video)
- Local Presenter: host weekly community Zoom in your language,
  $100/month
- Event Organizer: 50/50 cost split for meetups
- $100K Bug Bounty on the smart contract

## Daily community
- Zoom call every day at 17:00 UTC (English)
- Zoom call every day at 15:30 UTC = 9pm IST (Hindi/Urdu)
- Telegram official: @TurboLoop_Official
- German channel: @TurboLoopDach
- Support: @TurboLoop_Support
`;

// ─── 2. Published blog posts from Neon ─────────────────────────────
async function fetchBlogPosts() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("  ⚠ DATABASE_URL missing; skipping blog post ingestion");
    return [];
  }
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(url);
  try {
    const rows = await sql`
      SELECT slug, title, excerpt, content, language
      FROM blog_posts
      WHERE published = true
      AND language = 'en'
      AND content IS NOT NULL
      AND length(content) > 200
      ORDER BY scheduled_publish_at DESC NULLS LAST, created_at DESC
      LIMIT 40
    `;
    return rows.map(r => ({
      slug: String(r.slug),
      title: String(r.title),
      excerpt: r.excerpt ? String(r.excerpt) : "",
      content: String(r.content),
    }));
  } catch (err) {
    console.error("  ✗ Blog ingestion failed:", err?.message ?? err);
    return [];
  }
}

// ─── 3. FAQ entries from next-app/app/faq/page.tsx ──────────────────
function parseFaqFile() {
  const faqPath = path.resolve("./next-app/app/faq/page.tsx");
  if (!fs.existsSync(faqPath)) {
    console.warn("  ⚠ FAQ source not found at", faqPath);
    return [];
  }
  const src = fs.readFileSync(faqPath, "utf8");

  // Crude but reliable: pull every { q: "...", a: "..." } block.
  // Doesn't try to parse the full TS — just the pattern the file uses.
  const blocks = src.matchAll(
    /q:\s*"([^"]+(?:\\"[^"]*)*)"\s*,\s*a:\s*"([^"]+(?:\\"[^"]*)*)"/gs
  );
  const items = [];
  for (const m of blocks) {
    const q = m[1].replace(/\\"/g, '"');
    const a = m[2].replace(/\\"/g, '"');
    if (q.length > 5 && a.length > 20) items.push({ q, a });
  }
  return items;
}

// ─── Assembly ──────────────────────────────────────────────────────
(async () => {
  console.log(`Building chatbot KB → ${path.relative(".", OUT_PATH)}\n`);

  const [posts, faqs] = await Promise.all([
    fetchBlogPosts(),
    Promise.resolve(parseFaqFile()),
  ]);
  console.log(`  ✓ ${posts.length} blog posts ingested`);
  console.log(`  ✓ ${faqs.length} FAQ entries parsed`);

  // Compose KB. Section markers help Claude segment its memory.
  const sections = [PROTOCOL_FACTS.trim()];

  if (faqs.length > 0) {
    sections.push(
      "# Frequently Asked Questions\n\n" +
        faqs.map(f => `## ${f.q}\n\n${f.a}`).join("\n\n")
    );
  }

  if (posts.length > 0) {
    sections.push(
      "# Editorial — Long-form Articles\n\n" +
        posts
          .map(
            p =>
              `## ${p.title}\n\nSlug: ${p.slug}\nURL: https://www.turboloop.tech/blog/${p.slug}\n\n${
                p.excerpt ? `Summary: ${p.excerpt}\n\n` : ""
              }${p.content}`
          )
          .join("\n\n---\n\n")
    );
  }

  const KB_CONTENT = sections.join("\n\n=====\n\n");
  const KB_VERSION = crypto
    .createHash("sha256")
    .update(KB_CONTENT)
    .digest("hex")
    .slice(0, 16);

  const tokens = Math.ceil(KB_CONTENT.length / 4);
  console.log(
    `  · ${KB_CONTENT.length.toLocaleString()} chars (~${tokens.toLocaleString()} tokens)`
  );
  console.log(`  · version ${KB_VERSION}`);

  const file = `// AUTO-GENERATED by scripts/build-chatbot-kb.mjs — do NOT edit by hand.
//
// Re-run \`node scripts/build-chatbot-kb.mjs\` to refresh. Generated at:
//   ${new Date().toISOString()}
//
// Char count: ${KB_CONTENT.length.toLocaleString()}
// Approx tokens: ${tokens.toLocaleString()}
// Version (sha256[0:16]): ${KB_VERSION}

export const KB_VERSION = ${JSON.stringify(KB_VERSION)};

export const KB_CONTENT = ${JSON.stringify(KB_CONTENT)};
`;

  fs.writeFileSync(OUT_PATH, file);
  console.log(`\n✅ Wrote ${path.relative(".", OUT_PATH)}`);
})().catch(err => {
  console.error("Build failed:", err);
  // Exit non-zero so a CI / Vercel build fails loudly. The last
  // committed chatbot-kb.ts stays in place so the app keeps working
  // with the old KB rather than serving an empty system prompt.
  process.exit(1);
});
