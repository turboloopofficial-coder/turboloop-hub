# /activate-new-hub-pages

Add 6 new hub pages to the `HUB_PROMOTION_POOL` in `server/_vercel/_messagePools.ts`.
These banners are already uploaded to R2 but have no pool entries — they are never posted to Telegram.

---

## Context

The `HUB_PROMOTION_POOL` in `server/_vercel/_messagePools.ts` currently has 42 entries (14 pages × 3 variants).
Six new pages have banners in R2 but are missing from the pool:

| Page | R2 Banner Keys | Hub URL |
|------|---------------|---------|
| Compound | `hub-promo-compound-v1/v2/v3.png` | `https://turboloop.tech/compound` |
| Dashboard | `hub-promo-dashboard-v1/v2/v3.png` | `https://turboloop.tech/dashboard` |
| Deposit | `hub-promo-deposit-v1/v2/v3.png` | `https://turboloop.tech/deposit` |
| Homepage | `hub-promo-homepage-v1/v2/v3.png` | `https://turboloop.tech/` |
| Plans | `hub-promo-plans-v1/v2/v3.png` | `https://turboloop.tech/plans` |
| Withdraw | `hub-promo-withdraw-v1/v2/v3.png` | `https://turboloop.tech/withdraw` |

All 18 banners are confirmed live at `https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-{page}-v{n}.png`.

---

## What to Build

### 1. Append 18 new entries to `HUB_PROMOTION_POOL`

Open `server/_vercel/_messagePools.ts`. Find the closing `];` of `HUB_PROMOTION_POOL` (currently after the "Events Variant C" entry, around line 1605). Insert the following 18 entries **before** the closing `];`.

Use the existing entry format exactly:
```typescript
{
  page: "compound",
  url: "/compound",
  banner: "hub-promo-compound-v1.png",
  caption: `...`,
  buttonText: "...",
  buttonUrl: "https://turboloop.tech/compound",
},
```

### Captions to use (brand-approved, no APY, no hype)

**Compound page (3 variants)**

Variant A:
```
caption: `<b>📈 THE SNOWBALL EFFECT — EXPLAINED IN NUMBERS.</b>
Compounding isn't a concept. It's a mechanism. Every yield you earn gets added to your principal — and the next cycle earns on the larger base.
Month 1 looks small. Month 12 looks different.
#TurboLoop #Compounding #DeFi #StableYield #Mathematics`,
buttonText: "📈 See the compound curve",
```

Variant B:
```
caption: `<b>⚡ REINVEST ONCE. EARN FOREVER.</b>
The compound page shows you exactly what happens when you stop withdrawing and start stacking. The math is exponential. The system is on-chain. The decision is yours.
#TurboLoop #Compounding #Reinvest #Exponential #DeFi`,
buttonText: "⚡ Run the compound model",
```

Variant C:
```
caption: `<b>🔁 YIELD ON YIELD. THE GEOMETRY OF PATIENCE.</b>
Most people understand interest. Few understand compounding. The difference is the shape of the curve — and where you end up after 12 months.
#TurboLoop #Compound #YieldOnYield #DeFi #LongGame`,
buttonText: "🔁 Explore compounding",
```

**Dashboard page (3 variants)**

Variant A:
```
caption: `<b>📊 YOUR ENTIRE DEFI POSITION. ONE SCREEN.</b>
Deposits, active plans, referral earnings, withdrawal history — all in one place. No spreadsheets. No guessing. Just your live on-chain data.
#TurboLoop #Dashboard #DeFi #Transparency #OnChain`,
buttonText: "📊 Open your dashboard",
```

Variant B:
```
caption: `<b>🔍 EVERY NUMBER. LIVE. ON-CHAIN.</b>
The TurboLoop dashboard pulls your data directly from the BSC blockchain. What you see is what the contract holds — no intermediary, no delay, no manipulation.
#TurboLoop #Dashboard #BSC #LiveData #Verify`,
buttonText: "🔍 View live data",
```

Variant C:
```
caption: `<b>⚙️ CONTROL PANEL FOR YOUR FINANCIAL FUTURE.</b>
Deposit. Track. Compound. Withdraw. Repeat. The dashboard puts every action one tap away — with full on-chain verification behind every number.
#TurboLoop #Dashboard #DeFi #Control #OnChain`,
buttonText: "⚙️ Access your dashboard",
```

**Deposit page (3 variants)**

Variant A:
```
caption: `<b>💰 FROM 1 USDT. NO MINIMUM. NO MAXIMUM.</b>
The deposit page is where the math begins. Choose your plan. Set your amount. The smart contract does the rest — no human involved, no approval needed.
#TurboLoop #Deposit #USDT #BSC #DeFi #StartSmall`,
buttonText: "💰 Make your first deposit",
```

Variant B:
```
caption: `<b>🏦 YOUR BANK REQUIRES PAPERWORK. WE REQUIRE A WALLET.</b>
No ID. No credit check. No waiting period. Connect your BSC wallet, choose a plan, deposit USDT. The contract activates in seconds.
#TurboLoop #Deposit #NoKYC #DeFi #BSC #Permissionless`,
buttonText: "🏦 Deposit now",
```

Variant C:
```
caption: `<b>⏱️ 3 STEPS. 30 SECONDS. YOUR YIELD STARTS IMMEDIATELY.</b>
1. Connect wallet. 2. Choose plan. 3. Deposit USDT.
That's it. The 0.9% daily ROI clock starts on the next block.
#TurboLoop #Deposit #Simple #DeFi #USDT #Instant`,
buttonText: "⏱️ Start in 30 seconds",
```

**Homepage (3 variants)**

Variant A:
```
caption: `<b>🌐 THE TURBOLOOP HUB IS LIVE.</b>
Everything in one place — yield calculator, cinematic films, community leaderboard, token data, and the full protocol documentation.
This is what DeFi infrastructure looks like.
#TurboLoop #Hub #DeFi #Ecosystem #Launch`,
buttonText: "🌐 Explore the hub",
```

Variant B:
```
caption: `<b>⚡ ONE PROTOCOL. ONE HUB. EVERYTHING YOU NEED.</b>
The TurboLoop hub brings together every tool, resource, and community feature in a single premium interface. Built for the serious DeFi participant.
#TurboLoop #Hub #DeFi #Premium #Ecosystem`,
buttonText: "⚡ Visit the hub",
```

Variant C:
```
caption: `<b>🚀 THE FUTURE OF DEFI HAS A HOME.</b>
turboloop.tech — the official hub for the TurboLoop protocol. Real-time token data, yield projections, community rankings, and cinematic education. All on-chain. All verified.
#TurboLoop #Hub #DeFi #OnChain #Official`,
buttonText: "🚀 Go to turboloop.tech",
```

**Plans page (3 variants)**

Variant A:
```
caption: `<b>📋 FOUR PLANS. ONE PROTOCOL. YOUR CHOICE.</b>
7 days (3% total) · 14 days (10% total) · 30 days (24% total) · 60 days (54% total).
Full principal returned at the end of every plan. No lock-in beyond the plan term.
#TurboLoop #Plans #ROI #USDT #DeFi #StableYield`,
buttonText: "📋 Compare all plans",
```

Variant B:
```
caption: `<b>🎯 START SHORT. SCALE LONG.</b>
The 7-day plan is the entry point. The 60-day plan is where the math compounds hardest. Most serious participants start with the 7-day to verify, then scale into the 60-day.
#TurboLoop #Plans #Strategy #DeFi #Compounding`,
buttonText: "🎯 Choose your plan",
```

Variant C:
```
caption: `<b>💎 54% TOTAL ROI. 60 DAYS. STABLECOIN ONLY.</b>
No price volatility. No impermanent loss. No liquidation risk. Just USDT in — USDT + yield out. The 60-day Ultimate plan is the flagship.
#TurboLoop #Plans #54ROI #USDT #NoRisk #DeFi`,
buttonText: "💎 See the Ultimate plan",
```

**Withdraw page (3 variants)**

Variant A:
```
caption: `<b>💸 YOUR MONEY. YOUR TIMELINE. YOUR CALL.</b>
When your plan completes, your principal and yield are available to withdraw instantly. No waiting. No approval. No middleman. The smart contract releases it automatically.
#TurboLoop #Withdraw #Instant #DeFi #YourMoney`,
buttonText: "💸 See how withdrawals work",
```

Variant B:
```
caption: `<b>⚡ PLAN ENDS. FUNDS RELEASE. INSTANTLY.</b>
The moment your plan term completes, the contract makes your full balance withdrawable. No queue. No delay. No human in the loop. That's what "trustless" means.
#TurboLoop #Withdraw #Trustless #BSC #DeFi #Instant`,
buttonText: "⚡ Withdraw your yield",
```

Variant C:
```
caption: `<b>🔓 FULL PRINCIPAL BACK. PLUS YIELD. EVERY TIME.</b>
Unlike most DeFi protocols, TurboLoop returns your full principal at the end of every plan — plus the earned yield on top. Your capital is never consumed.
#TurboLoop #Withdraw #FullPrincipal #DeFi #USDT #Safe`,
buttonText: "🔓 Understand withdrawals",
```

---

## Implementation Steps

1. Open `server/_vercel/_messagePools.ts`
2. Find the closing `];` of `HUB_PROMOTION_POOL` (search for `// ── Day 16: Events (Variant C) ──`)
3. Insert all 18 new entries **before** the `];` — add comment headers like `// ── Day 17: Compound (Variant A) ──`
4. The pool will grow from 42 to 60 entries (20 pages × 3 variants)
5. Update the comment on `pickTodaysHubPromo()` to say "60 entries" instead of "42 entries"

---

## Build & Deploy

```bash
npm run build
git add server/_vercel/_messagePools.ts dist/
git commit -m "feat: add compound/dashboard/deposit/homepage/plans/withdraw to hub promo pool (42→60 entries)"
git push
```

---

## Acceptance Criteria

- [ ] All 18 new entries are present in `HUB_PROMOTION_POOL`
- [ ] Each entry has correct `page`, `url`, `banner`, `caption`, `buttonText`, `buttonUrl`
- [ ] Banner filenames match exactly: `hub-promo-{page}-v{1,2,3}.png`
- [ ] No APY, no "guaranteed", no fake features in any caption
- [ ] `pickTodaysHubPromo()` comment updated to reflect new pool size
- [ ] Build passes without TypeScript errors
