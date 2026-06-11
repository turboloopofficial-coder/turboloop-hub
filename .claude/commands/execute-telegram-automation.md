# /execute-telegram-automation

Implement the full Turbo Loop Telegram automation system in three stages. Read this entire document before writing a single line of code. Each stage is self-contained and must be completed, tested, and committed before moving to the next.

---

## Pre-flight: Read these files first

Before touching any code, read the following files to understand the current state:

1. `server/_vercel/telegram-webhook.ts` — existing triggers, `matchTrigger`, `TRIGGERS` array, `fetchLivePrice` pattern
2. `server/_vercel/cron-master.ts` — all existing `isInWindow` slots, `hasFiredToday`, `markFired`, `tgBroadcastPhoto`, `tgBroadcastMessage`, `markdownToTelegramHtml`
3. `server/_vercel/_messagePools.ts` — `pickByDay`, `HUB_PROMOTION_POOL`, `MONTHLY_COMPOUND_BANNERS`, `pickTodaysHubPromo`, `hubPromoBannerUrl`, `pickTodaysMonthlyBanner`, `monthlyBannerUrl`
4. `server/_vercel/_telegram.ts` — `tgBroadcastMessage`, `tgBroadcastPhoto`, `tgSendTextMessage`
5. `next-app/lib/chatbot-kb.ts` — `KB_CONTENT`, `KB_VERSION` (398KB, 40 articles)
6. `next-app/app/api/chat/route.ts` — `SYSTEM_BEHAVIOR` prompt, `MODEL = "claude-haiku-4-5"`

---

## Architecture notes (do not skip)

- `telegram-webhook.ts` lives at `server/_vercel/telegram-webhook.ts` AND is mirrored to `next-app/server/_vercel/telegram-webhook.ts`. **Both files must be kept identical.** After editing, copy: `cp server/_vercel/telegram-webhook.ts next-app/server/_vercel/telegram-webhook.ts`
- `cron-master.ts` lives only at `server/_vercel/cron-master.ts`. After editing, run `npm run build:api` and commit the regenerated `api/cron/master.js`.
- `_messagePools.ts` lives only at `server/_vercel/_messagePools.ts`. After editing, run `npm run build:api`.
- The cron is triggered every 5 minutes by an external pinger (cron-job.org) hitting `/api/cron/master`. The `isInWindow(h, m)` function returns true if `now` is within 4 minutes of the target UTC time. `hasFiredToday(db, key)` / `markFired(db, key)` dedup via `site_settings` rows.
- The telegram-webhook runs as an Edge function in `next-app`. It imports `KB_CONTENT` via `@lib/chatbot-kb` (alias resolves to `next-app/lib/chatbot-kb.ts`). The `@ai-sdk/anthropic` package is already installed in `next-app/package.json`.
- **CLAUDE.md rule**: if you change `>1 file in server/_vercel/` at once, pause and confirm with user. Do each stage as a separate commit.

---

## Stage 1: Live Data Triggers in the Webhook

**Goal:** Add four new slash commands to `telegram-webhook.ts` so users can type `/burns`, `/top`, `/stats`, `/price` in the group and get live data back.

**File to edit:** `server/_vercel/telegram-webhook.ts`

**What to add to the `TRIGGERS` array** (add after the last existing trigger, before the closing `]`):

### `/burns` trigger

```typescript
{
  id: "burns",
  pattern: /\b(burn|burns|buyback|buybacks|deflat)\b|^\/burns(@\w+)?$/i,
  response: null,
  buildResponse: async () => {
    try {
      const r = await fetch("https://turboloop.io/api/proxy/buybacks?limit=100", {
        signal: AbortSignal.timeout(8000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d: any = await r.json();
      const items: any[] = d?.data?.items ?? [];
      if (items.length === 0) return "🔥 <b>Burn data unavailable right now.</b> Try again shortly.";
      const totalUsdt = items.reduce((s: number, i: any) => s + parseInt(i.usdt_spent, 10) / 1e18, 0);
      const totalTokens = items.reduce((s: number, i: any) => s + parseFloat(i.tokens_burned) / 1e18, 0);
      const recent = items.slice(0, 3);
      const rows = recent.map((i: any) => {
        const tokens = (parseFloat(i.tokens_burned) / 1e18).toLocaleString("en-US", { maximumFractionDigits: 0 });
        const usdt = (parseInt(i.usdt_spent, 10) / 1e18).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
        const hash = String(i.tx_hash).slice(0, 10) + "…";
        return `  #${i.execution_number} — <b>${tokens} TURBO</b> | ${usdt} | <code>${hash}</code>`;
      }).join("\n");
      return `🔥 <b>$TURBO Buyback &amp; Burn</b>\n\n<b>Last 3 executions:</b>\n${rows}\n\n📊 <b>All-time totals:</b>\n🔥 <b>${totalTokens.toLocaleString("en-US", { maximumFractionDigits: 0 })} TURBO</b> burned\n💵 <b>$${totalUsdt.toLocaleString("en-US", { maximumFractionDigits: 0 })} USDT</b> committed to deflation\n\n🔗 https://www.turboloop.tech/token`;
    } catch {
      return "🔥 <b>Burn data unavailable right now.</b> Try again shortly.";
    }
  },
},
```

### `/stats` trigger

```typescript
{
  id: "stats",
  pattern: /\b(stats|tvl|liquidity|volume|market\s*cap|mcap)\b|^\/stats(@\w+)?$/i,
  response: null,
  buildResponse: async () => {
    try {
      const PAIR = "0x5bede66bb27184001960e769efab95304f0e1759";
      const r = await fetch(`https://api.dexscreener.com/latest/dex/pairs/bsc/${PAIR}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d: any = await r.json();
      const pair = d?.pairs?.[0];
      if (!pair) return "📊 <b>Stats unavailable right now.</b> Try again shortly.";
      const price = Number(pair.priceUsd ?? 0).toFixed(6);
      const liq = Number(pair.liquidity?.usd ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
      const vol24h = Number(pair.volume?.h24 ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
      const mcap = pair.marketCap ? Number(pair.marketCap).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "N/A";
      const change24h = pair.priceChange?.h24 ?? 0;
      const changeStr = `${change24h >= 0 ? "+" : ""}${Number(change24h).toFixed(2)}%`;
      return `📊 <b>$TURBO Live Stats</b>\n\n💰 <b>Price:</b> $${price} (${changeStr} 24h)\n💧 <b>Liquidity:</b> ${liq}\n📈 <b>Volume 24h:</b> ${vol24h}\n🏦 <b>Market Cap:</b> ${mcap}\n\n🔗 Chart: https://dexscreener.com/bsc/${PAIR}`;
    } catch {
      return "📊 <b>Stats unavailable right now.</b> Try again shortly.";
    }
  },
},
```

### `/top` trigger

```typescript
{
  id: "top",
  pattern: /\b(top|leaderboard|countries|community\s*rank|global)\b|^\/top(@\w+)?$/i,
  response: null,
  buildResponse: async () => {
    try {
      const { neon } = await import("@neondatabase/serverless");
      const DATABASE_URL = process.env.DATABASE_URL;
      if (!DATABASE_URL) return "🌍 <b>Leaderboard unavailable right now.</b>";
      const sql = neon(DATABASE_URL);
      const rows = await sql`
        SELECT country_name, member_count
        FROM country_leaderboard
        ORDER BY member_count DESC
        LIMIT 5
      `;
      if (rows.length === 0) return "🌍 <b>Leaderboard data not available yet.</b>";
      const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
      const lines = rows.map((r: any, i: number) => `${medals[i]} <b>${r.country_name}</b> — ${Number(r.member_count).toLocaleString()} members`).join("\n");
      return `🌍 <b>TurboLoop Global Leaderboard</b>\n\nTop 5 communities by size:\n\n${lines}\n\n🔗 Full leaderboard: https://www.turboloop.tech/community`;
    } catch {
      return "🌍 <b>Leaderboard unavailable right now.</b> Try again shortly.";
    }
  },
},
```

**After editing:**
1. Copy to mirror: `cp server/_vercel/telegram-webhook.ts next-app/server/_vercel/telegram-webhook.ts`
2. Run `npm run check` — must pass with zero TypeScript errors
3. Test the `/burns` trigger manually: `curl -s https://www.turboloop.tech/api/token-burns` to verify the upstream data is live
4. Commit: `git add server/_vercel/telegram-webhook.ts next-app/server/_vercel/telegram-webhook.ts && git commit -m "feat(telegram): add /burns, /stats, /top live data triggers"`
5. Push and wait ~90s for Vercel deploy
6. Smoke test: `curl -sI https://www.turboloop.tech/api/telegram-webhook` — must return `200`

---

## Stage 2: Ask AI in Telegram

**Goal:** Users type `/ask <question>` in the group and the bot answers using the full 40-article knowledge base via Claude Haiku 4.5.

**File to edit:** `server/_vercel/telegram-webhook.ts`

**Step 1:** Add the rate-limit map at the top of the file (after the imports, before `TRIGGERS`):

```typescript
// Per-user rate limit for /ask — 1 response per 60 seconds.
// In-memory Map is fine for Edge: each invocation is stateless,
// so this only prevents rapid-fire within a single request burst.
const ASK_COOLDOWN_MS = 60_000;
const askLastFired = new Map<number, number>();
```

**Step 2:** Add the `buildAskResponse` helper function (after `fetchLivePrice`, before `TRIGGERS`):

```typescript
async function buildAskResponse(question: string): Promise<string> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return "🤖 AI assistant is temporarily unavailable. For support: @TurboLoop_Support";
  // Inline the KB_CONTENT — import at top of file:
  // import { KB_CONTENT, KB_VERSION } from "../../lib/chatbot-kb";
  const SYSTEM = `${KB_CONTENT}\n\n=====\n\nYou are the TurboLoop Assistant in a Telegram group. Answer questions about TurboLoop's protocol, yield plans, security, community programs, and how to participate. Be concise — Telegram messages should be under 800 characters when possible. Use Telegram HTML formatting: <b>bold</b>, <i>italic</i>, <code>code</code>, <a href="url">link</a>. Always include this disclaimer for any plan/ROI/earning question: "This is protocol information, not financial advice." If unsure, say so and direct to @TurboLoop_Support. NEVER fabricate facts not in the knowledge base. KB version: ${KB_VERSION}`;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system: SYSTEM,
        messages: [{ role: "user", content: question }],
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!r.ok) throw new Error(`Anthropic HTTP ${r.status}`);
    const d: any = await r.json();
    const text: string = d?.content?.[0]?.text ?? "";
    if (!text) throw new Error("Empty response");
    // Truncate at 3800 chars (Telegram message limit is 4096, leave room for header)
    const truncated = text.length > 3800 ? text.slice(0, 3797) + "…" : text;
    return `🤖 <b>TurboLoop AI</b>\n\n${truncated}`;
  } catch (err) {
    console.error("[telegram-webhook] /ask failed", err);
    return "🤖 <b>TurboLoop AI</b>\n\nI couldn't process that right now. For official support: @TurboLoop_Support";
  }
}
```

**Step 3:** Add the import at the top of `telegram-webhook.ts` (after existing imports):

```typescript
import { KB_CONTENT, KB_VERSION } from "../../lib/chatbot-kb";
```

**Step 4:** Add the `/ask` trigger to the `TRIGGERS` array:

```typescript
{
  id: "ask",
  pattern: /^\/ask(@\w+)?(\s+.+)?$/i,
  response: null,
  buildResponse: async (text?: string) => {
    const question = (text ?? "").replace(/^\/ask(@\w+)?\s*/i, "").trim();
    if (!question) return "🤖 <b>How to use:</b> <code>/ask your question here</code>\n\nExample: <code>/ask how does the 20-level referral work?</code>";
    return buildAskResponse(question);
  },
},
```

**Step 5:** In the main handler, add the per-user rate limit check for the `ask` trigger. Find the block that calls `isOnCooldown` and add this BEFORE the existing cooldown check:

```typescript
// Extra rate limit for /ask — prevent API abuse
if (trigger.id === "ask") {
  const userId = msg.from?.id;
  if (userId !== undefined) {
    const last = askLastFired.get(userId) ?? 0;
    if (now - last < ASK_COOLDOWN_MS) {
      return new Response(
        JSON.stringify({ ok: true, matched: "ask", skipped: "ask-cooldown" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    askLastFired.set(userId, now);
  }
}
```

**After editing:**
1. Copy to mirror: `cp server/_vercel/telegram-webhook.ts next-app/server/_vercel/telegram-webhook.ts`
2. Run `npm run check` — must pass with zero TypeScript errors
3. Verify `ANTHROPIC_API_KEY` is set in Vercel env: `curl -s "https://www.turboloop.tech/api/telegram-webhook?debug=env"` — look for `ANTHROPIC_API_KEY` in the keys list
4. Commit: `git add server/_vercel/telegram-webhook.ts next-app/server/_vercel/telegram-webhook.ts && git commit -m "feat(telegram): add /ask AI trigger backed by 40-article knowledge base"`
5. Push and wait ~90s
6. Test by sending `/ask what is the Ultimate Loop plan?` in the Telegram group

---

## Stage 3: 12-Slot Automated Content Schedule

**Goal:** Add 8 new time slots to `cron-master.ts` (the 4 existing slots at 09:00, 12:00, 14:00, 18:00 stay untouched). This gives 12 posts/day total, one every 2 hours.

**File to edit:** `server/_vercel/cron-master.ts`

**Step 1:** Add a new helper to `_messagePools.ts` for themed hub promo selection:

```typescript
/** Pick a hub promo from a specific subset of pages, rotating by day.
 *  Used by the themed cron slots (security, calculator, etc.) */
export function pickHubPromoByPages(pages: string[]): HubPromoEntry {
  const subset = HUB_PROMOTION_POOL.filter(e => pages.includes(e.page));
  if (subset.length === 0) return pickTodaysHubPromo(); // fallback
  return pickByDay(subset);
}
```

After editing `_messagePools.ts`, run `npm run build:api` and commit the regenerated `api/cron/master.js`.

**Step 2:** Add the import for `pickHubPromoByPages` in `cron-master.ts`:

Find the existing import line that imports from `./_messagePools` and add `pickHubPromoByPages` to it.

**Step 3:** Add the following 8 new slots to `cron-master.ts`. Insert them AFTER the existing slot 9 (Creator-Star at 19:00) and BEFORE the Omni-Composer block. Each slot follows the exact same pattern as existing slots.

### Slot A — 00:00 UTC: Midnight Math (Compounding banner)
```typescript
// ============ A. MIDNIGHT MATH: 00:00 UTC = 5:30 AM IST ============
// Compounding projection banner — rotates through all 20 banners (10 EN tiers × 10 DE tiers).
// Uses an offset of +10 so it never shows the same banner as the 12:00 slot on the same day.
try {
  if (isInWindow(0, 0) && !(await hasFiredToday(db, "midnight:math"))) {
    const banner = MONTHLY_COMPOUND_BANNERS[
      (Math.floor(Date.now() / (1000 * 60 * 60 * 24)) + 10) % MONTHLY_COMPOUND_BANNERS.length
    ];
    // Only broadcast EN banners to the main channel; DE banners to German chat
    if (banner.lang === "en") {
      const caption = monthlyCompoundCaption({ lang: "en" });
      await tgBroadcastPhoto({
        photoUrl: monthlyBannerUrl(banner),
        caption,
        parseMode: "HTML",
        buttons: [{ text: "🧮 Run your projection", url: "https://turboloop.tech/calculator" }],
      });
    } else {
      const token = process.env.TELEGRAM_BOT_TOKEN!;
      const chatId = process.env.TELEGRAM_GERMAN_CHAT!;
      const caption = monthlyCompoundCaption({ lang: "de" });
      await tgSendPhoto(token, {
        chatId,
        photoUrl: monthlyBannerUrl(banner),
        caption,
        parseMode: "HTML",
        buttons: [{ text: "🧮 Jetzt berechnen", url: "https://turboloop.tech/calculator" }],
      });
    }
    await markFired(db, "midnight:math");
    log.push(`🌙 Midnight math — ${banner.lang} ${banner.key}`);
  }
} catch (err) {
  await markError(db, "midnight:math", err).catch(() => {});
  console.error("[cron-master] task midnight:math failed", err);
  log.push(`❌ midnight:math failed: ${err instanceof Error ? err.message : String(err)}`);
}
```

### Slot B — 02:00 UTC: Global Reach (Live leaderboard)
```typescript
// ============ B. GLOBAL REACH: 02:00 UTC = 7:30 AM IST ============
// Live country leaderboard — top 3 countries by member count.
try {
  if (isInWindow(2, 0) && !(await hasFiredToday(db, "global:reach"))) {
    const rows = await db.select({
      country_name: siteSettings.settingKey, // placeholder — use raw sql
    }).from(siteSettings).limit(1); // dummy query to test DB
    // Use raw neon for the leaderboard query
    const { neon } = await import("@neondatabase/serverless");
    const sql2 = neon(process.env.DATABASE_URL!);
    const leaderRows = await sql2`
      SELECT country_name, member_count
      FROM country_leaderboard
      ORDER BY member_count DESC
      LIMIT 3
    `;
    if (leaderRows.length > 0) {
      const medals = ["🥇", "🥈", "🥉"];
      const lines = leaderRows.map((r: any, i: number) =>
        `${medals[i]} <b>${r.country_name}</b> — ${Number(r.member_count).toLocaleString()} members`
      ).join("\n");
      const captions = [
        `🌍 <b>The TurboLoop movement is global.</b>\n\nTop communities right now:\n\n${lines}\n\nEvery country on this list started with one person who decided to build differently.\n\n🔗 https://www.turboloop.tech/community`,
        `📡 <b>Where is TurboLoop growing fastest?</b>\n\nCurrent top 3:\n\n${lines}\n\nThe leaderboard updates live. Your country could be next.\n\n🔗 https://www.turboloop.tech/community`,
        `🌐 <b>100,000+ wallets. Dozens of countries. One protocol.</b>\n\nLeading communities today:\n\n${lines}\n\nJoin the global network.\n\n🔗 https://www.turboloop.tech/community`,
      ];
      const caption = captions[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % captions.length];
      await tgBroadcastMessage({
        text: caption,
        parseMode: "HTML",
        disablePreview: true,
        buttons: [{ text: "🌍 See full leaderboard", url: "https://www.turboloop.tech/community" }],
      });
      await markFired(db, "global:reach");
      log.push(`🌍 Global reach — top: ${leaderRows[0]?.country_name}`);
    }
  }
} catch (err) {
  await markError(db, "global:reach", err).catch(() => {});
  console.error("[cron-master] task global:reach failed", err);
  log.push(`❌ global:reach failed: ${err instanceof Error ? err.message : String(err)}`);
}
```

### Slot C — 04:00 UTC: Security First (Hub promo)
```typescript
// ============ C. SECURITY FIRST: 04:00 UTC = 9:30 AM IST ============
// Hub promo rotating through security and code-is-law pages.
try {
  if (isInWindow(4, 0) && !(await hasFiredToday(db, "security:promo"))) {
    const promo = pickHubPromoByPages(["security", "code-is-law"]);
    await tgBroadcastPhoto({
      photoUrl: hubPromoBannerUrl(promo),
      caption: promo.caption,
      parseMode: "HTML",
      buttons: [{ text: promo.buttonText, url: promo.buttonUrl }],
    });
    await markFired(db, "security:promo");
    log.push(`🔐 Security promo — ${promo.page}`);
  }
} catch (err) {
  await markError(db, "security:promo", err).catch(() => {});
  console.error("[cron-master] task security:promo failed", err);
  log.push(`❌ security:promo failed: ${err instanceof Error ? err.message : String(err)}`);
}
```

### Slot D — 06:00 UTC: Morning Hook (Hub promo — Calculator / Apply)
```typescript
// ============ D. MORNING HOOK: 06:00 UTC = 11:30 AM IST ============
// Hub promo for calculator and apply pages — highest conversion intent.
try {
  if (isInWindow(6, 0) && !(await hasFiredToday(db, "morning:hook"))) {
    const promo = pickHubPromoByPages(["calculator", "apply"]);
    await tgBroadcastPhoto({
      photoUrl: hubPromoBannerUrl(promo),
      caption: promo.caption,
      parseMode: "HTML",
      buttons: [{ text: promo.buttonText, url: promo.buttonUrl }],
    });
    await markFired(db, "morning:hook");
    log.push(`⚡ Morning hook — ${promo.page}`);
  }
} catch (err) {
  await markError(db, "morning:hook", err).catch(() => {});
  console.error("[cron-master] task morning:hook failed", err);
  log.push(`❌ morning:hook failed: ${err instanceof Error ? err.message : String(err)}`);
}
```

### Slot E — 08:00 UTC: Ecosystem (Hub promo — Ecosystem / Leaderboard)
```typescript
// ============ E. ECOSYSTEM: 08:00 UTC = 1:30 PM IST ============
// Hub promo for ecosystem and leaderboard pages — community and scale.
try {
  if (isInWindow(8, 0) && !(await hasFiredToday(db, "ecosystem:promo"))) {
    const promo = pickHubPromoByPages(["ecosystem", "leaderboard"]);
    await tgBroadcastPhoto({
      photoUrl: hubPromoBannerUrl(promo),
      caption: promo.caption,
      parseMode: "HTML",
      buttons: [{ text: promo.buttonText, url: promo.buttonUrl }],
    });
    await markFired(db, "ecosystem:promo");
    log.push(`🌐 Ecosystem promo — ${promo.page}`);
  }
} catch (err) {
  await markError(db, "ecosystem:promo", err).catch(() => {});
  console.error("[cron-master] task ecosystem:promo failed", err);
  log.push(`❌ ecosystem:promo failed: ${err instanceof Error ? err.message : String(err)}`);
}
```

### Slot F — 10:00 UTC: Live Burn Proof
```typescript
// ============ F. LIVE BURN PROOF: 10:00 UTC = 3:30 PM IST ============
// Live buyback data — most recent execution + running totals.
// NOTE: 10:00 UTC collides with campaignA. campaignA fires only every 2 days
// and is time-limited. This slot fires every day. They share the same window
// but use different dedup keys so they can both fire on the same day.
try {
  if (isInWindow(10, 0) && !(await hasFiredToday(db, "burn:proof"))) {
    const r = await fetch("https://turboloop.io/api/proxy/buybacks?limit=100", {
      signal: AbortSignal.timeout(8000),
    });
    if (r.ok) {
      const d: any = await r.json();
      const items: any[] = d?.data?.items ?? [];
      if (items.length > 0) {
        const latest = items[0];
        const latestTokens = (parseFloat(latest.tokens_burned) / 1e18).toLocaleString("en-US", { maximumFractionDigits: 0 });
        const latestUsdt = (parseInt(latest.usdt_spent, 10) / 1e18).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
        const totalUsdt = items.reduce((s: number, i: any) => s + parseInt(i.usdt_spent, 10) / 1e18, 0);
        const totalTokens = items.reduce((s: number, i: any) => s + parseFloat(i.tokens_burned) / 1e18, 0);
        const captions = [
          `🔥 <b>Deflation in action.</b>\n\nBuyback #${latest.execution_number} just completed:\n💵 ${latestUsdt} USDT used to buy and burn <b>${latestTokens} TURBO</b>.\n\n📊 <b>All-time totals:</b>\n🔥 ${totalTokens.toLocaleString("en-US", { maximumFractionDigits: 0 })} TURBO burned\n💵 $${totalUsdt.toLocaleString("en-US", { maximumFractionDigits: 0 })} USDT committed\n\nEvery buyback makes the remaining supply more scarce.\n\n🔗 https://www.turboloop.tech/token`,
          `📉 <b>Supply is shrinking.</b>\n\nThe most recent buyback burned <b>${latestTokens} TURBO</b> using ${latestUsdt} of protocol revenue.\n\nRunning total: <b>${totalTokens.toLocaleString("en-US", { maximumFractionDigits: 0 })} TURBO</b> permanently removed from circulation.\n\nThis is not a promise. It's an on-chain fact.\n\n🔗 https://www.turboloop.tech/token`,
          `💡 <b>How the burn works.</b>\n\n10% of all admin fees go to the Buyback &amp; Burn contract. It executes automatically — no team approval needed.\n\nLatest execution #${latest.execution_number}: ${latestUsdt} → <b>${latestTokens} TURBO</b> burned.\nTotal burned to date: <b>${totalTokens.toLocaleString("en-US", { maximumFractionDigits: 0 })} TURBO</b>.\n\n🔗 https://www.turboloop.tech/token`,
        ];
        const caption = captions[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % captions.length];
        await tgBroadcastMessage({
          text: caption,
          parseMode: "HTML",
          disablePreview: true,
          buttons: [{ text: "🔥 View burn history", url: "https://www.turboloop.tech/token" }],
        });
        await markFired(db, "burn:proof");
        log.push(`🔥 Burn proof — #${latest.execution_number}, ${latestTokens} TURBO`);
      }
    }
  }
} catch (err) {
  await markError(db, "burn:proof", err).catch(() => {});
  console.error("[cron-master] task burn:proof failed", err);
  log.push(`❌ burn:proof failed: ${err instanceof Error ? err.message : String(err)}`);
}
```

### Slot G — 16:00 UTC: Community Voice (Hub promo — Community / FAQ)
```typescript
// ============ G. COMMUNITY VOICE: 16:00 UTC = 9:30 PM IST ============
// Hub promo for community and FAQ pages — trust and belonging.
try {
  if (isInWindow(16, 0) && !(await hasFiredToday(db, "community:promo"))) {
    const promo = pickHubPromoByPages(["community", "faq"]);
    await tgBroadcastPhoto({
      photoUrl: hubPromoBannerUrl(promo),
      caption: promo.caption,
      parseMode: "HTML",
      buttons: [{ text: promo.buttonText, url: promo.buttonUrl }],
    });
    await markFired(db, "community:promo");
    log.push(`🤝 Community promo — ${promo.page}`);
  }
} catch (err) {
  await markError(db, "community:promo", err).catch(() => {});
  console.error("[cron-master] task community:promo failed", err);
  log.push(`❌ community:promo failed: ${err instanceof Error ? err.message : String(err)}`);
}
```

### Slot H — 20:00 UTC: Live Stats Broadcast
```typescript
// ============ H. LIVE STATS: 20:00 UTC = 1:30 AM IST next day ============
// Live DexScreener stats — price, liquidity, volume.
try {
  if (isInWindow(20, 0) && !(await hasFiredToday(db, "live:stats"))) {
    const PAIR = "0x5bede66bb27184001960e769efab95304f0e1759";
    const r = await fetch(`https://api.dexscreener.com/latest/dex/pairs/bsc/${PAIR}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (r.ok) {
      const d: any = await r.json();
      const pair = d?.pairs?.[0];
      if (pair) {
        const price = Number(pair.priceUsd ?? 0).toFixed(6);
        const liq = Number(pair.liquidity?.usd ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
        const vol24h = Number(pair.volume?.h24 ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
        const change24h = pair.priceChange?.h24 ?? 0;
        const changeStr = `${change24h >= 0 ? "+" : ""}${Number(change24h).toFixed(2)}%`;
        const captions = [
          `📊 <b>$TURBO — end of day snapshot.</b>\n\n💰 Price: <b>$${price}</b> (${changeStr} 24h)\n💧 Liquidity: <b>${liq}</b>\n📈 Volume 24h: <b>${vol24h}</b>\n\nThe protocol is open. The numbers are public. The liquidity is locked.\n\n🔗 https://dexscreener.com/bsc/${PAIR}`,
          `🔍 <b>Transparency check.</b>\n\nEvery number below is verifiable on-chain, right now:\n\n💰 $TURBO price: <b>$${price}</b>\n💧 Locked liquidity: <b>${liq}</b>\n📈 24h volume: <b>${vol24h}</b>\n\nNo team can move the liquidity. No one controls the price.\n\n🔗 https://dexscreener.com/bsc/${PAIR}`,
          `💡 <b>What does a healthy DeFi protocol look like?</b>\n\nThis:\n\n💰 Price: <b>$${price}</b> (${changeStr})\n💧 Liquidity: <b>${liq}</b> — 100% locked\n📈 Volume: <b>${vol24h}</b> in 24h\n\nReal volume. Real liquidity. Real yield.\n\n🔗 https://www.turboloop.tech/token`,
        ];
        const caption = captions[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % captions.length];
        await tgBroadcastMessage({
          text: caption,
          parseMode: "HTML",
          disablePreview: true,
          buttons: [{ text: "📊 Live chart", url: `https://dexscreener.com/bsc/${PAIR}` }],
        });
        await markFired(db, "live:stats");
        log.push(`📊 Live stats — $${price} (${changeStr})`);
      }
    }
  }
} catch (err) {
  await markError(db, "live:stats", err).catch(() => {});
  console.error("[cron-master] task live:stats failed", err);
  log.push(`❌ live:stats failed: ${err instanceof Error ? err.message : String(err)}`);
}
```

### Slot I — 22:00 UTC: Nightly Education (Hub promo — Learn / Blog / Roadmap)
```typescript
// ============ I. NIGHTLY EDUCATION: 22:00 UTC = 3:30 AM IST next day ============
// Hub promo for learn, blog, and roadmap pages — long-term conviction.
try {
  if (isInWindow(22, 0) && !(await hasFiredToday(db, "nightly:education"))) {
    const promo = pickHubPromoByPages(["learn", "blog", "roadmap"]);
    await tgBroadcastPhoto({
      photoUrl: hubPromoBannerUrl(promo),
      caption: promo.caption,
      parseMode: "HTML",
      buttons: [{ text: promo.buttonText, url: promo.buttonUrl }],
    });
    await markFired(db, "nightly:education");
    log.push(`📚 Nightly education — ${promo.page}`);
  }
} catch (err) {
  await markError(db, "nightly:education", err).catch(() => {});
  console.error("[cron-master] task nightly:education failed", err);
  log.push(`❌ nightly:education failed: ${err instanceof Error ? err.message : String(err)}`);
}
```

**After editing both files:**
1. Run `npm run check` — must pass with zero TypeScript errors
2. Run `npm run build:api` — must succeed and regenerate `api/cron/master.js`
3. Commit all three files: `git add server/_vercel/cron-master.ts server/_vercel/_messagePools.ts api/cron/master.js && git commit -m "feat(cron): add 8 new daily slots — 12 posts/day total (00,02,04,06,08,10,16,20,22 UTC)"`
4. Push and wait ~90s
5. Smoke test: `curl -s https://www.turboloop.tech/api/cron/master` — should return `200` with a log array

---

## Final verification

After all 3 stages are deployed:

```bash
# 1. Webhook health
curl -sI https://www.turboloop.tech/api/telegram-webhook

# 2. Token burns API (used by /burns trigger and 10:00 slot)
curl -s https://www.turboloop.tech/api/token-burns | python3 -c "import sys,json; d=json.load(sys.stdin); print('burns:', len(d['burns']), 'total:', d['totalBurned'])"

# 3. Cron master health
curl -s https://www.turboloop.tech/api/cron/master

# 4. Verify all new dedup keys exist in site_settings after first fire
# (Check Neon DB: SELECT setting_key FROM site_settings WHERE setting_key LIKE 'lastFired:%' ORDER BY setting_key)
```

Report: which stages completed, which tests passed, any errors encountered.
