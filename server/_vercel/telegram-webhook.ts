// Telegram auto-reply webhook handler.
//
// Listens to incoming messages in the official group (and DMs) and
// fires a canned reply when the text matches one of 15 keyword
// triggers. Exposed publicly via the Next.js route handler at
// next-app/app/api/telegram-webhook/route.ts, which is a thin
// adapter that just delegates to handleTelegramWebhook().
//
// Architecture rationale:
//   • Vercel serverless function = perfect fit. Scales infinitely,
//     costs nothing when idle, sub-200ms cold start on Edge.
//   • Telegram retries non-2xx responses → we return 200 OK ASAP
//     even on internal errors so we never get a retry storm.
//   • Single reply per matched message — triggers are evaluated in
//     definition order, first match wins. Prevents the bot from
//     dumping 5 replies if a user wrote "buy + plans + audit" in one
//     message.
//
// Security:
//   • Telegram's `setWebhook` lets you set a `secret_token` that's
//     echoed back in the `X-Telegram-Bot-Api-Secret-Token` header on
//     every webhook delivery. We verify against
//     TELEGRAM_WEBHOOK_SECRET. If the env var is unset we skip the
//     check (so the bot still works in dev), but production MUST set
//     it. Without verification ANY POST to the public URL could fake
//     a Telegram update.
//
// Cooldown:
//   • In-memory Map<`${chatId}:${triggerId}`, lastFiredMs>. Survives
//     across requests on the same Vercel function instance. Multiple
//     instances each have their own map but at our traffic level this
//     is a non-issue. 60-second TTL per (chat, trigger) pair.

import { tgSendTextMessage, tgEscape } from "./_telegram";

// ─── Trigger definitions ──────────────────────────────────────────
//
// Responses are stored as HTML so we send with parse_mode=HTML
// without runtime conversion. `<b>…</b>` for bold, `<code>…</code>`
// for addresses, plain URLs auto-link in HTML mode.
//
// Pattern flags: all `i` (case-insensitive). `\b` word boundaries
// keep "scam" from matching "scamp" — except for `$turbo` where
// `\b\$` doesn't work cleanly, so that trigger uses an explicit
// non-word lookahead.

// ─── Live token price fetcher — reads from DB cache ──────────────────────
// The cron-master refreshes `cache:token_price` in siteSettings every tick.
// Reading from DB takes ~10ms vs 3-5s for a live DexScreener call, making
// all dynamic triggers (price / buy / sell / token / calculator) feel
// instant. Falls back to a direct API call if the DB cache is missing or
// stale (>5 min) — never lets a cold cache or a Neon hiccup block a reply.
async function fetchLivePrice(): Promise<string> {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      // Direct SQL via the Neon serverless HTTP driver — no ORM overhead,
      // Edge-compatible, single round-trip.
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(dbUrl);
      const rows = await sql`
        SELECT setting_value, updated_at
        FROM site_settings
        WHERE setting_key = 'cache:token_price'
        LIMIT 1
      `;
      if (rows.length > 0) {
        const cacheAge = Date.now() - new Date(rows[0].updated_at).getTime();
        // Use cache if it's less than 5 minutes old.
        if (cacheAge < 5 * 60 * 1000) {
          const d = JSON.parse(rows[0].setting_value);
          if (d?.priceUsd) {
            const price = Number(d.priceUsd).toFixed(6);
            const change = d.priceChange24h != null
              ? ` (${d.priceChange24h >= 0 ? "+" : ""}${(d.priceChange24h * 100).toFixed(2)}% 24h)`
              : "";
            return `$${price}${change}`;
          }
        }
      }
    } catch (_dbErr) {
      // DB unavailable — fall through to live fetch.
    }
  }
  // Fallback: live fetch with an 8 s timeout. Only hit when the cache
  // row is missing or older than 5 minutes — should be rare.
  try {
    const r = await fetch("https://www.turboloop.tech/api/token-price", {
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d: any = await r.json();
    if (!d?.priceUsd) return "price unavailable";
    const price = Number(d.priceUsd).toFixed(6);
    const change = d.priceChange24h != null
      ? ` (${d.priceChange24h >= 0 ? "+" : ""}${(d.priceChange24h * 100).toFixed(2)}% 24h)`
      : "";
    return `$${price}${change}`;
  } catch {
    return "price unavailable";
  }
}

interface Trigger {
  id: string;
  pattern: RegExp;
  /** Static response text, OR null if the trigger uses buildResponse() */
  response: string | null;
  /** Optional dynamic response builder — called at send time */
  buildResponse?: (text?: string) => Promise<string>;
}

const TRIGGERS: Trigger[] = [
  {
    id: "contract",
    // "ca" alone is a very short alias for contract address — common
    // shorthand in crypto chats. The `\b` keeps it from matching
    // "casual" / "scared" etc.
    pattern: /\b(contract|ca|address|token\s+address|contract\s+address)\b/i,
    response:
`Here are the Turbo Loop contract addresses:

🔹 <b>Main Protocol:</b> <code>0x67f43735898326f99059ff775485246999027b31</code>
🔹 <b>$TURBO Token:</b> <code>0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3</code>
🔹 <b>Buyback &amp; Burn:</b> <code>0xd8735b03e0b18f1e0598c211cee9558c6247b6b9</code>

All verified on BscScan: https://bscscan.com`,
  },
  {
    id: "audit",
    pattern: /\b(audit|security|verified|audited|safe)\b/i,
    response:
`Turbo Loop has been audited by reputable security firms:

🔹 <b>Haze Security Audit:</b> https://hazecrypto.net/audit/TurboLoop
🔹 <b>SolidityScan Audit:</b> https://solidityscan.com/quickscan/0xc90E5785632dAaB9Cb61F5050dA393090541A76D/bscscan/mainnet

Both contracts are renounced and immutable. Full transparency on BscScan!`,
  },
  {
    id: "buy",
    pattern: /\b(buy|purchase|how\s+to\s+buy|where\s+to\s+buy|swap)\b/i,
    response: null,
    buildResponse: async () => {
      const priceInfo = await fetchLivePrice();
      return `🛒 <b>How to Buy $TURBO</b>\n\n💰 <b>Current Price:</b> ${priceInfo}\n\n🔹 <b>TurboSwap (Recommended):</b>\nhttps://turboloop.io/dashboard/swap?from=USDT&amp;to=TURBO\n\n🔹 <b>PancakeSwap:</b>\nhttps://pancakeswap.finance/swap?outputCurrency=0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3\n\n⚠️ Make sure you're on the <b>BNB Smart Chain (BSC)</b> network!`;
    },
  },
  {
    id: "sell",
    pattern: /\b(sell|dump|exit|cash\s+out)\b/i,
    response: null,
    buildResponse: async () => {
      const priceInfo = await fetchLivePrice();
      return `💱 <b>How to Sell $TURBO</b>\n\n💰 <b>Current Price:</b> ${priceInfo}\n\n🔹 <b>TurboSwap (Recommended):</b>\nhttps://turboloop.io/dashboard/swap?from=TURBO&amp;to=USDT\n\n🔹 <b>PancakeSwap:</b>\nhttps://pancakeswap.finance/swap?inputCurrency=0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3\n\n⚠️ Make sure you're on the <b>BNB Smart Chain (BSC)</b> network!`;
    },
  },
  {
    id: "price",
    pattern: /\b(price|chart|dex|dexscreener|market)\b/i,
    response: null,
    buildResponse: async () => {
      const priceInfo = await fetchLivePrice();
      return `💰 <b>$TURBO Live Price</b>\n\n🔹 <b>Price:</b> ${priceInfo}\n\n📈 <b>Chart:</b> https://dexscreener.com/bsc/0x5bede66bb27184001960e769efab95304f0e1759\n🔗 <b>Buy:</b> https://turboloop.io/dashboard/swap?from=USDT&amp;to=TURBO`;
    },
  },
  {
    id: "plans",
    pattern: /\b(plans|roi|returns|earnings|yield|how\s+much)\b/i,
    response:
`Turbo Loop Investment Plans:

🔹 <b>Sprint Loop:</b> 7 days | 3% ROI
🔹 <b>Boost Loop:</b> 14 days | 10% ROI
🔹 <b>Power Loop:</b> 30 days | 24% ROI
🔹 <b>Ultimate Loop:</b> 60 days | 54% ROI

✅ 0% Impermanent Loss
✅ Daily Payouts at 00:00 UTC
✅ Minimum: 1 USDT

Start here: https://turboloop.io`,
  },
  {
    id: "referral",
    pattern: /\b(referral|commission|earn|affiliate|partner|bonus)\b/i,
    response:
`Join our Referral Program:

💰 <b>12% Daily Commission</b> on Level 1 referrals
💰 <b>20 Levels Deep</b> earning structure
💰 <b>Onboarding Bonus:</b>
   • $100-$199 → $3
   • $200-$499 → $5
   • $500-$999 → $10
   • $1,000-$4,999 → $20
   • $5,000-$9,999 → $30
   • $10,000-$24,999 → $50
   • $25,000+ → $100

💰 <b>Payouts:</b> Daily at 1 PM UTC

Generate your link: https://turboloop.io`,
  },
  {
    id: "docs",
    pattern: /\b(docs|documentation|help|guide|tutorial|how\s+to)\b/i,
    response:
`Here are helpful resources:

📖 <b>Full Documentation:</b> https://turboloop.io/docs
🌐 <b>Website:</b> https://turboloop.io
📣 <b>Marketing Hub:</b> https://turboloop.tech
🔒 <b>Security &amp; Audits:</b> https://turboloop.tech/security

Need more help? Ask in the group or contact support!`,
  },
  {
    id: "website",
    pattern: /\b(website|links?|telegram|twitter|social|contact|official)\b/i,
    response:
`Turbo Loop Official Links:

🌐 <b>Website:</b> https://turboloop.io
📣 <b>Marketing Hub:</b> https://turboloop.tech
📖 <b>Docs:</b> https://turboloop.io/docs
🔒 <b>Security:</b> https://turboloop.tech/security
🐦 <b>Twitter/X:</b> https://x.com/Turbo_Loop
💬 <b>Telegram:</b> https://t.me/TurboLoop_Official`,
  },
  {
    id: "turbo-token",
    // `\b` doesn't sit cleanly before `$` because `$` is a non-word
    // character — `\b\$turbo` only matches when there's a word char
    // immediately before the `$`, which is the OPPOSITE of what we
    // want. Use explicit non-word lookbehind/lookahead instead.
    pattern: /(?<![\w$])\$turbo(?![\w])|\b(turbo\s*token|token|reward\s+token)\b/i,
    response: null,
    buildResponse: async () => {
      const priceInfo = await fetchLivePrice();
      return `⚡ <b>$TURBO Token</b>\n\n💰 <b>Live Price:</b> ${priceInfo}\n\n🔹 <b>Contract:</b> <code>0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3</code>\n🔹 <b>Network:</b> BNB Smart Chain (BSC)\n🔹 <b>Buy Tax:</b> 1% | <b>Sell Tax:</b> 2%\n🔹 <b>Daily Burn:</b> 2 PM UTC (Automated)\n🔹 <b>Reward:</b> Bonus on top of fixed yield (30/60-day plans)\n\n📊 <b>Chart:</b> https://dexscreener.com/bsc/0x5bede66bb27184001960e769efab95304f0e1759\n🔗 <b>Buy:</b> https://turboloop.io/dashboard/swap?from=USDT&amp;to=TURBO`;
    },
  },
  {
    id: "deposit",
    pattern: /\b(deposit|start|begin|join|invest|how\s+to\s+start)\b/i,
    response:
`Getting Started with Turbo Loop:

1️⃣ Go to https://turboloop.io
2️⃣ Connect your wallet (MetaMask, Trust Wallet, etc.)
3️⃣ Choose your plan (7, 14, 30, or 60 days)
4️⃣ Deposit USDT (minimum 1 USDT)
5️⃣ Earn daily rewards at 00:00 UTC!

💡 <b>Pro Tip:</b> Use a referral link to earn 12% commissions!

Need help? Ask in the group!`,
  },
  {
    id: "payout",
    pattern: /\b(payout|withdraw|claim|payment|when\s+paid)\b/i,
    response:
`Turbo Loop Payouts:

💰 <b>Daily Rewards:</b> Paid at 00:00 UTC
💰 <b>Referral Commissions:</b> Paid at 1 PM UTC
💰 <b>Capital Return:</b> After your plan completes

All payouts are automatic and handled by smart contract. Check your wallet for incoming transfers!

Need help? Check BscScan: https://bscscan.com`,
  },
  {
    id: "burn",
    pattern: /\b(burn|deflationary|buyback|scarcity)\b/i,
    response:
`$TURBO Deflationary Mechanism:

🔥 <b>Daily Automated Buyback &amp; Burn:</b> 2 PM UTC
🔥 <b>Funded by:</b> 10% admin fee from the main protocol
🔥 <b>Purpose:</b> Create scarcity and support long-term value

This ensures $TURBO becomes increasingly scarce over time, supporting price appreciation for long-term holders!`,
  },
  {
    id: "zoom",
    pattern: /\b(zoom|session|webinar|live|call|meeting)\b/i,
    // Full per-region timezone list for both daily calls. One line
    // per region (flag first → scannable on mobile, no mid-entry wrap).
    // Final message ~2.4k chars, well under Telegram's 4096 sendMessage
    // limit. Zoom links + passcodes preserved from the prior reply.
    response:
`🎥 <b>Daily Zoom Community Calls</b>

━━━━━━━━━━━━━━━━━━━━━
🇬🇧 <b>English Call — 17:00 UTC</b>
━━━━━━━━━━━━━━━━━━━━━
🇬🇧 UK · 5:00 PM BST / 5:00 PM GMT
🇦🇪 UAE / Dubai · 9:00 PM GST
🇮🇳 India · 10:30 PM IST
🇵🇰 Pakistan · 10:00 PM PKT
🇳🇬 Nigeria · 6:00 PM WAT
🇰🇪 Kenya · 8:00 PM EAT
🇺🇸 USA East · 1:00 PM EDT
🇺🇸 USA West · 10:00 AM PDT
🇲🇾 Malaysia / Singapore · 1:00 AM MYT (next day)

🔗 https://us06web.zoom.us/j/8347511147?pwd=g6wTqhrngaUDNbMasv9LE8iJQOSJua.1
🔑 Passcode: <code>669529</code>

━━━━━━━━━━━━━━━━━━━━━
🇮🇳 <b>Hindi / Urdu Call — 15:30 UTC</b>
━━━━━━━━━━━━━━━━━━━━━
🇮🇳 India · 9:00 PM IST
🇵🇰 Pakistan · 8:30 PM PKT
🇧🇩 Bangladesh · 9:30 PM BST
🇳🇵 Nepal · 9:15 PM NPT
🇦🇪 UAE / Dubai · 7:30 PM GST
🇸🇦 Saudi Arabia · 6:30 PM AST
🇲🇾 Malaysia / Singapore · 11:30 PM MYT
🇮🇩 Indonesia · 10:30 PM WIB
🇬🇧 UK · 3:30 PM BST / 3:30 PM GMT
🇺🇸 USA East · 11:30 AM EDT
🇺🇸 USA West · 8:30 AM PDT
🇳🇬 Nigeria / West Africa · 4:30 PM WAT
🇰🇪 Kenya / East Africa · 6:30 PM EAT

🔗 https://us06web.zoom.us/j/4455663232?pwd=vHG9ahPKpl238DfyE0LpoRGUj91ULB.1
🔑 Passcode: <code>1234</code>

Join to ask the team directly — protocol mechanics, live data, Q&amp;A!`,
  },
  {
    id: "calculator",
    pattern: /\b(calculate|calc|how\s+much|how\s+much\s+can\s+i\s+earn|\d+\s*(usdt|usd|\$))\b/i,
    response: null,
    buildResponse: async (text?: string) => {
      // Extract a deposit amount from the user's message. Accepts plain
      // numbers, "500 USDT", "500$", and comma-formatted "1,000". Clamp
      // to [10, 1_000_000] so a stray phone number or year doesn't
      // produce a nonsense calculation.
      const match = text ? text.match(/(\d[\d,.]*)/) : null;
      const raw = match ? parseFloat(match[1].replace(/,/g, "")) : null;
      const amount = raw && raw >= 10 && raw <= 1_000_000 ? raw : null;

      if (!amount) {
        return `🧮 <b>Deposit Calculator</b>\n\nType the amount you want to deposit to see your returns.\n\n<b>Example:</b> <code>calculate 500</code>\n\n📊 <b>Full Calculator:</b> https://turboloop.tech/calculator`;
      }

      const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const sprint  = amount * 0.03;
      const boost   = amount * 0.10;
      const power   = amount * 0.24;
      const ultimate = amount * 0.54;

      return `🧮 <b>Returns on $${fmt(amount)} USDT</b>\n\n⚡ <b>Sprint</b> (7 days) → <b>+$${fmt(sprint)}</b> (3%)\n🚀 <b>Boost</b> (14 days) → <b>+$${fmt(boost)}</b> (10%)\n💪 <b>Power</b> (30 days) → <b>+$${fmt(power)}</b> (24%) + $TURBO\n🏆 <b>Ultimate</b> (60 days) → <b>+$${fmt(ultimate)}</b> (54%) + $TURBO\n\n💡 Power &amp; Ultimate also earn $TURBO token rewards on top!\n📊 <b>Full Calculator:</b> https://turboloop.tech/calculator`;
    },
  },
  {
    id: "leadership",
    pattern: /\b(leadership|leader|rank|ranks|vip|ambassador|legend|partner|builder|accelerator|director|executive)\b/i,
    response:
`🏆 <b>TurboLoop Leadership Program</b>

7 ranks from <b>Turbo Partner → Turbo Legend</b>
Earn <b>1% to 10%</b> of the leadership pool across <b>100 levels</b> of your network.

<b>The 7 Ranks:</b>
1️⃣ Turbo Partner
2️⃣ Builder
3️⃣ Accelerator
4️⃣ Director
5️⃣ Executive
6️⃣ Ambassador
7️⃣ Turbo Legend 👑

🔹 Ranks are <b>permanent</b> — no demotion once earned
🔹 Rewards paid <b>daily</b> alongside your farming yield
🔹 Extends across <b>100 levels</b> (vs 20 for standard referral)

📖 <b>Learn more:</b> https://turboloop.tech/ecosystem/leadership-program`,
  },
  {
    id: "leaderboard",
    pattern: /\b(leaderboard|top\s+country|top\s+countries|ranking|community\s+rank|which\s+country)\b/i,
    response:
`🌍 <b>TurboLoop Global Leaderboard</b>

<b>Top Communities Right Now:</b>

🥇 <b>Germany</b> — Strongest European Community
🥈 <b>Nigeria</b> — Fastest Growing in Africa
🥉 <b>Indonesia</b> — Leading Southeast Asia
4️⃣ India — Rapidly Expanding
5️⃣ Turkey — Emerging Market Leader
6️⃣ Brazil — Latin America Pioneer
7️⃣ Vietnam — Tripled in 2 months

🌐 <b>Full Leaderboard:</b> https://turboloop.tech/community`,
  },
  {
    id: "roadmap",
    pattern: /\b(roadmap|future|upcoming|next|whats\s+next|what's\s+next|plans\s+ahead)\b/i,
    response:
`🗺️ <b>TurboLoop Roadmap</b>

<b>Completed ✅</b>
🔹 Smart Contract Development
🔹 Security Audits (Haze + SolidityScan)
🔹 Platform Launch (Turbo Buy + Turbo Swap)
🔹 $TURBO Token Launch + LP Lock

<b>Upcoming 🔜</b>
🔹 CEX Listings
🔹 Mobile App
🔹 Institutional Partnerships
🔹 Cross-chain Expansion

📋 <b>Full Roadmap:</b> https://turboloop.tech/roadmap`,
  },
  {
    id: "airdrop",
    pattern: /\b(airdrop|free\s+token|free\s+turbo|giveaway|free\s+usdt|claim\s+free)\b/i,
    response:
`⚠️ <b>No Airdrops — EVER</b>

TurboLoop does <b>NOT</b> run airdrops, giveaways, or free token distributions.

❌ Any message claiming a TurboLoop airdrop is a <b>SCAM</b>
❌ Never click links from unknown sources
❌ Never connect your wallet to unverified sites

✅ <b>The only way to earn with TurboLoop is through the protocol:</b>
🔹 Deposit USDT into a Loop Plan
🔹 Build a referral network
🔹 Advance through Leadership ranks

🔗 <b>Official site only:</b> https://turboloop.io`,
  },
  {
    id: "staking",
    pattern: /\b(staking|stake|staked|lock\s+tokens|lock\s+usdt)\b/i,
    response:
`ℹ️ <b>TurboLoop is Yield Farming — not Staking</b>

The difference matters:

🔹 <b>Staking</b> = locking tokens to validate a blockchain (like ETH 2.0)
🔹 <b>Yield Farming</b> = depositing USDT into a smart contract that generates real yield from protocol fees

TurboLoop generates yield from:
💱 Turbo Swap trading fees
💳 Turbo Buy gateway fees
🔥 10% admin fee from protocol activity

Your USDT is <b>not locked</b> — it earns fixed yield over the plan period (7, 14, 30, or 60 days) then returns to you with profit.

📊 <b>See the plans:</b> https://turboloop.tech/calculator`,
  },
  {
    id: "scam",
    pattern: /\b(scam|fake|rug|rugpull|beware|warning)\b/i,
    response:
`⚠️ <b>IMPORTANT SECURITY WARNING:</b>

✅ <b>Official Turbo Loop:</b>
- Website: https://turboloop.io
- Telegram: https://t.me/TurboLoop_Official
- Twitter: https://x.com/Turbo_Loop

❌ <b>NEVER share your seed phrase or private key</b>
❌ <b>NEVER click links from unknown sources</b>
❌ <b>NEVER send funds to unknown addresses</b>

All official links are verified above. Stay safe!`,
  },
  {
    id: "support",
    pattern: /\b(support|admin|owner|help|contact|complaint|issue|problem|stuck|not\s+working)\b/i,
    response:
`Need help? Our support team is here:

🆘 <b>Support Channel:</b> https://t.me/TurboLoop_Official
💬 <b>Community Chat:</b> https://t.me/TurboLoop_Chat

📌 <b>Before contacting support, check:</b>
🔹 <b>FAQ:</b> https://turboloop.tech/faq
🔹 <b>Roadmap:</b> https://turboloop.tech/roadmap

Our team responds daily. Please include your wallet address and a description of the issue.`,
  },
];

// ─── Cooldown bookkeeping ─────────────────────────────────────────

const COOLDOWN_MS = 0; // No cooldown — every trigger always replies
// Caps the Map so a long-running instance doesn't grow without bound
// in the unlikely event our triggers stop firing reset paths.
const COOLDOWN_MAX_ENTRIES = 5000;

const lastFiredAt = new Map<string, number>();

function cooldownKey(chatId: string | number, triggerId: string): string {
  return `${chatId}:${triggerId}`;
}

function isOnCooldown(chatId: string | number, triggerId: string, now: number): boolean {
  const k = cooldownKey(chatId, triggerId);
  const t = lastFiredAt.get(k);
  return t !== undefined && now - t < COOLDOWN_MS;
}

function recordFire(chatId: string | number, triggerId: string, now: number): void {
  // Cheap defensive cleanup — purge any entry older than the cooldown
  // window once we cross the cap. Avoids a sweep-every-call cost.
  // Using forEach because the root tsconfig targets ES5 by default and
  // `for...of` on a Map needs ES2015+ iteration. forEach is fine here:
  // Map.forEach is allowed to mutate the map during iteration —
  // already-visited entries don't re-trigger.
  if (lastFiredAt.size >= COOLDOWN_MAX_ENTRIES) {
    lastFiredAt.forEach((t, k) => {
      if (now - t >= COOLDOWN_MS) lastFiredAt.delete(k);
    });
  }
  lastFiredAt.set(cooldownKey(chatId, triggerId), now);
}

// ─── Telegram Update shape (subset we actually use) ───────────────

interface TgUpdate {
  update_id?: number;
  message?: {
    message_id?: number;
    text?: string;
    chat?: { id?: number | string; type?: string };
    from?: { id?: number; is_bot?: boolean; username?: string };
    // sender_chat is set when an admin posts anonymously as the group/channel.
    // In this case `from` is the GroupAnonymousBot sentinel (is_bot: true)
    // so we must NOT skip these messages — they are real human posts.
    sender_chat?: { id?: number | string; type?: string; username?: string };
  };
  // We intentionally ignore edited_message, channel_post, etc — the bot
  // only responds to fresh user-sent text messages.
}

// ─── First-matching-trigger evaluator ─────────────────────────────

function matchTrigger(text: string): Trigger | null {
  for (const t of TRIGGERS) {
    if (t.pattern.test(text)) return t;
  }
  return null;
}

// ─── Public entry point ───────────────────────────────────────────

export async function handleTelegramWebhook(req: Request): Promise<Response> {
  // Telegram retries non-200 responses, which would flood us with
  // retries on any internal error. Always return 200 OK — log failures
  // to the function logs but don't surface them as HTTP errors.
  try {
    // Webhook secret check. Telegram echoes the secret you set when
    // calling setWebhook back in this header on every delivery. If the
    // env var is configured (production), we require a match. If it
    // isn't set (dev), we skip the check so the bot still works.
    const wantSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (wantSecret) {
      const gotSecret = req.headers.get("x-telegram-bot-api-secret-token");
      if (gotSecret !== wantSecret) {
        // Still respond 200 — surfacing a 401/403 would tell an
        // attacker the URL is real and the secret is wrong.
        return new Response(JSON.stringify({ ok: true, skipped: "auth" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.error("[telegram-webhook] TELEGRAM_BOT_TOKEN not set");
      return new Response(JSON.stringify({ ok: true, skipped: "token-missing" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    let update: TgUpdate;
    try {
      update = (await req.json()) as TgUpdate;
    } catch (e) {
      console.warn("[telegram-webhook] invalid JSON body", e);
      return new Response(JSON.stringify({ ok: true, skipped: "bad-json" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const msg = update.message;
    const text = msg?.text;
    const chatId = msg?.chat?.id;
    const messageId = msg?.message_id;
    if (!text || chatId === undefined || messageId === undefined) {
      // Not a text message we can respond to (could be a join event,
      // photo without caption, edited message, etc).
      return new Response(JSON.stringify({ ok: true, skipped: "no-text" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Ignore messages from other bots — keeps two auto-reply bots from
    // ping-ponging if anyone ever adds a sibling bot to the group.
    // EXCEPTION: Telegram uses a sentinel bot (id: 1087968824, username:
    // "GroupAnonymousBot") as the `from` field when a human admin posts
    // anonymously as the channel. We must NOT skip those — they are real
    // human posts. We identify them by the presence of `sender_chat`.
    const isRealBot =
      msg.from?.is_bot === true &&
      !msg.sender_chat; // anonymous admin posts always have sender_chat set
    if (isRealBot) {
      return new Response(JSON.stringify({ ok: true, skipped: "bot-sender" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const trigger = matchTrigger(text);
    if (!trigger) {
      return new Response(JSON.stringify({ ok: true, matched: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = Date.now();
    if (isOnCooldown(chatId, trigger.id, now)) {
      return new Response(
        JSON.stringify({ ok: true, matched: trigger.id, skipped: "cooldown" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    recordFire(chatId, trigger.id, now);

    // Guard replyToMessageId so Telegram never receives NaN — the
    // prior Number(messageId) form would silently coerce an undefined
    // message_id into NaN, which Telegram drops on the floor. Result:
    // the reply showed up as a standalone message instead of threaded
    // under the user's question.
    const safeReplyToId =
      typeof messageId === "number" && messageId > 0 ? messageId : undefined;

    // Await the build + send inline. The previous void-IIFE pattern was
    // needed when fetchLivePrice hit DexScreener at reply time (3-5 s
    // round-trip) — keeping Telegram's 60 s webhook timeout from
    // visibly lagging the user. With the price now cached in
    // site_settings and served via a ~10 ms Neon HTTP read, the inline
    // await adds only ~500 ms total (Edge + DB + Telegram send), and a
    // single try/catch around the whole thing keeps logging tight.
    try {
      const responseText = trigger.buildResponse
        ? await trigger.buildResponse(text)
        : (trigger.response ?? "");
      await tgSendTextMessage(token, {
        chatId: String(chatId),
        text: responseText,
        parseMode: "HTML",
        replyToMessageId: safeReplyToId,
        disablePreview: true,
      });
    } catch (err) {
      console.error(
        `[telegram-webhook] failed to send reply for trigger=${trigger.id}`,
        err
      );
    }

    return new Response(
      JSON.stringify({ ok: true, matched: trigger.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[telegram-webhook] unhandled error", err);
    // Still 200 — see retry rationale at the top.
    return new Response(JSON.stringify({ ok: true, error: "internal" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Re-export the trigger list + helpers so tests can drive them
// directly without going through the HTTP boundary.
export const TELEGRAM_AUTO_REPLY_TRIGGERS = TRIGGERS;
export { tgEscape };
