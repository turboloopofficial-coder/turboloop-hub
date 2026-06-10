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

interface Trigger {
  id: string;
  pattern: RegExp;
  response: string;
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
    response:
`You can buy $TURBO on our TurboSwap:

🔹 <b>Buy $TURBO:</b> https://turboloop.io/dashboard/swap?from=USDT&amp;to=TURBO

Or trade on PancakeSwap:
🔹 <b>PancakeSwap:</b> https://pancakeswap.finance/swap?outputCurrency=0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3

Make sure you're on the BNB Smart Chain (BSC) network!`,
  },
  {
    id: "sell",
    pattern: /\b(sell|dump|exit|cash\s+out)\b/i,
    response:
`You can sell $TURBO on our TurboSwap:

🔹 <b>Sell $TURBO:</b> https://turboloop.io/dashboard/swap?from=TURBO&amp;to=USDT

Or trade on PancakeSwap:
🔹 <b>PancakeSwap:</b> https://pancakeswap.finance/swap?inputCurrency=0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3
`,
  },
  {
    id: "price",
    pattern: /\b(price|chart|dex|dexscreener|market)\b/i,
    response:
`Check the live $TURBO price and chart:

🔹 <b>Dexscreener:</b> https://dexscreener.com/bsc/0x5bede66bb27184001960e769efab95304f0e1759

Real-time data, volume, liquidity, and holder info all available!`,
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
    response:
`About $TURBO Token:

🔹 <b>Contract:</b> <code>0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3</code>
🔹 <b>Network:</b> BNB Smart Chain (BSC)
🔹 <b>Buy Tax:</b> 1% | <b>Sell Tax:</b> 2%
🔹 <b>Daily Burn:</b> 2 PM UTC (Automated)
🔹 <b>Reward:</b> Earn as monthly reward in 30/60-day plans

📊 <b>Chart:</b> https://dexscreener.com/bsc/0x5bede66bb27184001960e769efab95304f0e1759
🔗 <b>Buy:</b> https://turboloop.io/dashboard/swap?from=USDT&amp;to=TURBO`,
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
    response:
`Daily Zoom Technical Sessions:

📅 <b>Time:</b> 5:00 PM UTC (Daily)
📍 <b>Topics:</b> Protocol mechanics, live data, Q&amp;A
🎥 <b>Link:</b> Shared in Telegram pinned messages

Join to learn how the protocol works and ask the team directly!`,
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
    if (msg.from?.is_bot) {
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

    // Fire-and-forget the actual send. We don't await before returning
    // 200 to Telegram — the response is what tells Telegram the
    // webhook was accepted. A slow sendMessage would otherwise eat
    // into Telegram's 60s webhook timeout and trigger spurious retries.
    void tgSendTextMessage(token, {
      chatId: String(chatId),
      text: trigger.response,
      parseMode: "HTML",
      replyToMessageId: Number(messageId),
      disablePreview: true,
    }).catch((err) => {
      console.error(
        `[telegram-webhook] failed to send reply for trigger=${trigger.id}`,
        err
      );
    });

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
