# /deploy-504-creatives

Deploy the full 504-creatives campaign system: R2 upload, Marketing Hub SEO integration (12 sub-pages, manifest, structured data, sitemap), and 24-posts/day Telegram automation with caption pools for all 12 categories.

**Read this entire document before writing a single line of code.**

---

## Pre-flight: Read these files first

1. `server/_vercel/cron-master.ts` — all existing `isInWindow` slots, `hasFiredToday`, `markFired`, `tgBroadcastPhoto`, `tgBroadcastMessage`
2. `server/_vercel/_messagePools.ts` — `pickByDay`, existing caption pools, `hubBannerUrl` pattern
3. `server/_vercel/_telegram.ts` — `tgBroadcastPhoto`, `tgBroadcastMessage` (channel-only)
4. `next-app/app/creatives/page.tsx` — current category structure and how `CREATIVE_CATEGORIES` is used
5. `next-app/lib/creativesData.ts` — existing category definitions and manifest loading pattern
6. `next-app/app/sitemap.ts` — how sitemap entries are built

---

## Architecture notes (do not skip)

- **R2 base URL:** `https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev`
- **R2 campaigns prefix:** `campaigns/{category}/{filename}.png`
- **Cron runs every 5 min** via cron-job.org pinger. Each task uses `hasFiredToday(db, "task:id")` for dedup.
- **Channel-only:** All `tgBroadcastPhoto` / `tgBroadcastMessage` calls post to `TELEGRAM_CHANNEL` only — `_telegram.ts` already enforces this.
- **Live price append:** Every caption must end with a live price line fetched from `/api/token-price-history`. Use the existing `fetchPriceHistory()` pattern already in `cron-master.ts`.
- **Image rotation:** Use `daysSinceLaunch % categorySize` for deterministic non-repeating rotation. `daysSinceLaunch` = days since `2026-06-01`.
- **Caption dedup:** Each category has 12 unique captions in `_messagePools.ts`. Pick with `pickByDay(pool, daysSinceLaunch)`.
- **CLAUDE.md rule:** Never copy `cron-master.ts` or `_messagePools.ts` into `next-app/server/_vercel/`. Only `telegram-webhook.ts` and `_telegram.ts` belong there.

---

## Step 1 — Upload 504 creatives to R2

Run the upload script (already written at `scripts/upload-campaigns.mjs`):

```bash
node scripts/upload-campaigns.mjs --dir /path/to/creatives-upload
```

The script uploads all files under `campaigns/{category}/{filename}.png` with `Cache-Control: public, max-age=31536000, immutable`.

**Verify:** After upload, spot-check 3 URLs:
```
https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/campaigns/lifestyle/01_Lifestyle_Morning_Coffee_Earnings.png
https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/campaigns/token/01_Token_Launch_Story.png
https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/campaigns/objection-handler/01_Objection_Is_It_A_Scam.png
```

---

## Step 2 — Generate SEO-optimised manifest

Create `scripts/generate-campaigns-manifest.mjs` that:
1. Reads all filenames from each `campaigns/` category folder (or from a local directory listing)
2. For each file, generates:
   - `url` — full R2 public URL
   - `alt` — human-readable alt text derived from filename (strip number prefix, replace underscores with spaces, add "TurboLoop" prefix)
   - `title` — same as alt, title-cased
   - `description` — 1-sentence SEO description per category (use the templates below)
   - `keywords` — 3-5 keywords per category
   - `category` — category id
3. Writes output to `next-app/public/campaigns-manifest.json`

**Alt text templates by category:**
- `lifestyle` → `"TurboLoop passive income lifestyle — {clean_name}"`
- `token` → `"$TURBO token — {clean_name}"`
- `referral` → `"TurboLoop 20-level referral system — {clean_name}"`
- `objection-handler` → `"TurboLoop trust & transparency — {clean_name}"`
- `hindi-new` → `"TurboLoop India — {clean_name}"`
- `nigerian` → `"TurboLoop Nigeria — {clean_name}"`
- `success-story` → `"TurboLoop member success — {clean_name}"`
- `education-defi` → `"DeFi education — {clean_name}"`
- `urgency` → `"Start earning with TurboLoop — {clean_name}"`
- `buyback` → `"$TURBO daily buyback & burn — {clean_name}"`
- `comparison` → `"TurboLoop vs traditional finance — {clean_name}"`
- `community` → `"TurboLoop global community — {clean_name}"`

---

## Step 3 — Update Marketing Hub (`/creatives`)

### 3a — Add 12 new categories to `next-app/lib/creativesData.ts`

Add to the `CREATIVE_CATEGORIES` array:

```typescript
{ id: "lifestyle", label: "Lifestyle & Aspiration", description: "Passive income lifestyle banners — beach, freedom, luxury, family.", keywords: ["passive income", "financial freedom", "lifestyle", "DeFi"] },
{ id: "token", label: "$TURBO Token", description: "Token launch, tokenomics, supply, and $TURBO price banners.", keywords: ["TURBO token", "tokenomics", "DeFi token", "BSC"] },
{ id: "referral", label: "Referral & Network", description: "20-level referral system, commission tables, rank progression banners.", keywords: ["referral", "network income", "20 levels", "affiliate"] },
{ id: "objection-handler", label: "Trust & Transparency", description: "FUD-busting, smart contract proof, and objection-handling banners.", keywords: ["is it a scam", "smart contract", "DeFi trust", "transparency"] },
{ id: "hindi-new", label: "India 🇮🇳", description: "Hindi-language banners for the Indian market.", keywords: ["TurboLoop India", "DeFi India", "passive income Hindi"] },
{ id: "nigerian", label: "Nigeria 🇳🇬", description: "Nigerian-market banners in local cultural context.", keywords: ["TurboLoop Nigeria", "DeFi Nigeria", "Naija passive income"] },
{ id: "success-story", label: "Success Stories", description: "Real member withdrawal proofs, rank achievements, and testimonials.", keywords: ["success story", "withdrawal proof", "DeFi earnings"] },
{ id: "education-defi", label: "DeFi Education", description: "What is DeFi, smart contracts, blockchain, and yield farming explained.", keywords: ["what is DeFi", "smart contract", "blockchain education", "yield farming"] },
{ id: "urgency", label: "Start Today", description: "FOMO and urgency banners — every day without TurboLoop is a missed opportunity.", keywords: ["start today", "passive income now", "DeFi FOMO"] },
{ id: "buyback", label: "Buyback & Burn", description: "Daily $TURBO buyback and burn proof — deflationary mechanics.", keywords: ["buyback burn", "TURBO deflation", "token burn"] },
{ id: "comparison", label: "vs Traditional Finance", description: "TurboLoop vs banks, stocks, crypto, forex, and savings accounts.", keywords: ["DeFi vs banks", "TurboLoop vs crypto", "better than savings"] },
{ id: "community", label: "Global Community", description: "TurboLoop's worldwide community, Telegram family, and global reach.", keywords: ["TurboLoop community", "global DeFi", "Telegram group"] },
```

### 3b — Create 12 sub-pages

Create `next-app/app/creatives/[category]/page.tsx` as a dynamic route that:
1. Reads `CREATIVE_CATEGORIES` to find the category by `params.category`
2. Loads all images for that category from `campaigns-manifest.json`
3. Renders a grid of images with download buttons (same UI as the main `/creatives` page)
4. Has unique `generateMetadata()` per category:

```typescript
export async function generateMetadata({ params }: { params: { category: string } }) {
  const cat = CREATIVE_CATEGORIES.find(c => c.id === params.category);
  return {
    title: `${cat.label} Marketing Banners — Free TurboLoop Creatives`,
    description: cat.description,
    keywords: cat.keywords,
    openGraph: {
      title: `${cat.label} — TurboLoop Marketing Creatives`,
      description: cat.description,
      type: "website",
    },
  };
}
```

Also create `next-app/app/creatives/[category]/generateStaticParams.ts` to pre-render all 12 sub-pages at build time.

### 3c — Update main `/creatives` page metadata

In `next-app/app/creatives/page.tsx`, update `generateMetadata`:
```typescript
title: "504 Free TurboLoop Marketing Creatives — DeFi Banners, Referral Graphics & Education Posters",
description: "Download 504 free TurboLoop marketing banners across 12 categories: passive income lifestyle, DeFi education, objection handling, referral graphics, token charts, and more.",
openGraph: { type: "website" },
```

### 3d — Add ImageGallery structured data

In `next-app/app/creatives/page.tsx`, add a `<script type="application/ld+json">` block:
```json
{
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "TurboLoop Marketing Creatives",
  "description": "504 free DeFi marketing banners across 12 categories",
  "numberOfItems": 504,
  "url": "https://www.turboloop.tech/creatives"
}
```

### 3e — Update sitemap

In `next-app/app/sitemap.ts`, add:
- `/creatives` with `changefreq: "weekly"`, `priority: 0.8`
- All 12 sub-pages `/creatives/{category}` with `changefreq: "monthly"`, `priority: 0.7`

---

## Step 4 — Caption pools in `_messagePools.ts`

Add 12 new caption pool arrays. Each has exactly 12 unique captions. Use `pickByDay(pool, daysSinceLaunch)` for rotation.

### CAMPAIGN_LIFESTYLE_CAPTIONS (12 captions)

```typescript
export const CAMPAIGN_LIFESTYLE_CAPTIONS = [
  `Your coffee gets cold. Your TurboLoop earnings don't.\n\nWhile most people trade time for money, TurboLoop members earn 0.9% daily on deposited USDT — automatically, on-chain, every 24 hours.\n\nNo trading. No watching charts. No waiting for a salary.\n\n👉 Start your passive income: https://turboloop.tech\n\n#TurboLoop #PassiveIncome #DeFiYield #FinancialFreedom #OnChain`,
  `The beach doesn't care what time it is. Neither does your TurboLoop wallet.\n\nEvery 24 hours, your USDT earns 0.9% — whether you're working, sleeping, or on a plane.\n\nThis is what financial freedom actually looks like.\n\n👉 https://turboloop.tech\n\n#TurboLoop #BeachLife #PassiveIncome #DeFi #FreedomLifestyle`,
  `Most people work for money. TurboLoop members make money work for them.\n\n0.9% daily yield. Full capital back after 60 days. No lock-up. No volatility risk.\n\nThe math is simple. The lifestyle change is real.\n\n👉 Calculate your earnings: https://turboloop.tech/calculator\n\n#TurboLoop #MoneyMindset #DeFiYield #PassiveIncome #FinancialFreedom`,
  `Imagine waking up and your balance is already higher than when you went to sleep.\n\nThat's not a dream. That's TurboLoop — 0.9% daily yield, on-chain, transparent, and running 24/7.\n\n👉 Join today: https://turboloop.tech\n\n#TurboLoop #WakeUpRicher #PassiveIncome #DeFi #OnChain`,
  `Your 9-to-5 pays once. TurboLoop pays every single day.\n\nDeposit USDT. Earn 0.9% daily. Withdraw anytime. Get your full capital back after 60 days.\n\nOne decision. Daily rewards.\n\n👉 https://turboloop.tech\n\n#TurboLoop #9to5Escape #DeFiYield #DailyRewards #FinancialFreedom`,
  `Luxury isn't about spending more. It's about worrying less.\n\nWhen your money earns 0.9% daily on TurboLoop, the question stops being "can I afford this?" and starts being "what do I want to do today?"\n\n👉 Start building: https://turboloop.tech\n\n#TurboLoop #LuxuryMindset #PassiveIncome #DeFi #WealthBuilding`,
  `Family time is priceless. TurboLoop makes sure you have more of it.\n\nEarn 0.9% daily on your USDT without sitting at a desk. The protocol runs itself — you just live your life.\n\n👉 https://turboloop.tech\n\n#TurboLoop #FamilyFirst #PassiveIncome #DeFiYield #TimeIsWealth`,
  `The difference between people who travel freely and those who can't? Passive income.\n\nTurboLoop members earn 0.9% daily on deposited USDT — from anywhere in the world, on any device.\n\n👉 Start earning: https://turboloop.tech\n\n#TurboLoop #TravelFreedom #PassiveIncome #DeFi #LocationFree`,
  `Retirement isn't an age. It's a number.\n\nWhen your passive income covers your expenses, you're retired — regardless of how old you are. TurboLoop helps you get there faster.\n\n0.9% daily. On-chain. Transparent.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #EarlyRetirement #PassiveIncome #DeFiYield #FinancialFreedom`,
  `The best investment you can make is in a system that works while you don't.\n\nTurboLoop's smart contract runs 24/7 on BNB Smart Chain — no team intervention, no downtime, no excuses.\n\nYour money. Your rules. Your earnings.\n\n👉 https://turboloop.tech\n\n#TurboLoop #SmartMoney #DeFi #PassiveIncome #OnChain`,
  `Some people spend their whole lives working for the weekend. TurboLoop members make every day feel like the weekend.\n\n0.9% daily yield. Withdraw anytime. Full capital back at 60 days.\n\n👉 Join the movement: https://turboloop.tech\n\n#TurboLoop #EveryDayFreedom #PassiveIncome #DeFiYield #FinancialFreedom`,
  `The goal isn't to be rich. The goal is to never have to check the price before you order.\n\nTurboLoop's daily yield gets you there — one compounding day at a time.\n\n👉 https://turboloop.tech\n\n#TurboLoop #FinancialFreedom #DeFiYield #PassiveIncome #WealthBuilding`,
];
```

### CAMPAIGN_TOKEN_CAPTIONS (12 captions)

```typescript
export const CAMPAIGN_TOKEN_CAPTIONS = [
  `$TURBO isn't just a token. It's proof the protocol works.\n\nNo team mint. No admin key. Fixed supply. Every $TURBO in existence was earned by the protocol — not printed by a team.\n\n👉 Verify on-chain: https://turboloop.tech/token\n\n#TURBO #DeFiToken #BSC #Tokenomics #OnChain`,
  `The rarest tokens are the ones no one can create more of.\n\n$TURBO has a fixed supply, no mint function, and a daily buyback mechanism that permanently removes tokens from circulation.\n\nScarcity is built in.\n\n👉 https://turboloop.tech/token\n\n#TURBO #FixedSupply #Deflationary #BSC #DeFiToken`,
  `$TURBO price update: check turboloop.tech/token for the latest.\n\nEvery day, the protocol buys back $TURBO from the open market and burns it. Less supply. Same demand. You do the math.\n\n👉 https://turboloop.tech/token\n\n#TURBO #BuybackBurn #Deflationary #DeFiToken #BSC`,
  `A token backed by real protocol activity — not hype.\n\n$TURBO's value comes from daily buybacks funded by protocol fees. No team allocation. No VC dump. Just on-chain mechanics.\n\n👉 https://turboloop.tech/token\n\n#TURBO #RealYield #DeFiToken #BSC #Tokenomics`,
  `The $TURBO token was launched on June 1, 2026. No presale. No whitelist. Fair launch.\n\nEvery holder got in on the same terms. The protocol runs the buyback. The community holds the supply.\n\n👉 https://turboloop.tech/token\n\n#TURBO #FairLaunch #DeFiToken #BSC #OnChain`,
  `Locked liquidity means no one can pull the rug — not even the team.\n\n$TURBO's liquidity is locked on-chain. The LP tokens are in a contract, not a wallet. Verifiable. Permanent.\n\n👉 Verify: https://turboloop.tech/token\n\n#TURBO #LockedLiquidity #NoRugPull #DeFiToken #BSC`,
  `$TURBO tokenomics in one line: fixed supply, daily buyback, locked liquidity, no mint function.\n\nThat's it. No complex vesting schedules. No team allocation cliff. Just clean, transparent mechanics.\n\n👉 https://turboloop.tech/token\n\n#TURBO #Tokenomics #DeFi #BSC #FixedSupply`,
  `Every protocol fee goes back to $TURBO holders through the buyback mechanism.\n\nWhen the protocol earns, $TURBO gets bought and burned. When more people deposit, more $TURBO gets removed from supply.\n\nGrowth = scarcity.\n\n👉 https://turboloop.tech/token\n\n#TURBO #Deflationary #RealYield #DeFiToken #BSC`,
  `You can earn USDT yield AND hold $TURBO for price appreciation. Two income streams. One protocol.\n\nDeposit USDT → earn 0.9% daily. Hold $TURBO → benefit from daily buybacks.\n\n👉 https://turboloop.tech/token\n\n#TURBO #DualIncome #DeFiYield #BSC #PassiveIncome`,
  `$TURBO is listed on DexScreener. Every trade, every buyback, every burn — all public.\n\nNo private transactions. No hidden wallets. Just on-chain data anyone can verify in real time.\n\n👉 https://dexscreener.com/bsc/0x5bede66bb27184001960e769efab95304f0e1759\n\n#TURBO #DexScreener #OnChain #Transparency #BSC`,
  `The smart contract holds the liquidity. The smart contract runs the buyback. The smart contract is the team.\n\n$TURBO is governed by code, not promises.\n\n👉 https://turboloop.tech/token\n\n#TURBO #SmartContract #DeFi #CodeIsLaw #BSC`,
  `Most tokens go to zero because the team sells. $TURBO can't be minted — so there's nothing to sell.\n\nFixed supply. Daily buyback. Locked liquidity. This is what a clean token looks like.\n\n👉 https://turboloop.tech/token\n\n#TURBO #FixedSupply #NoMint #DeFiToken #BSC`,
];
```

### CAMPAIGN_REFERRAL_CAPTIONS (12 captions)

```typescript
export const CAMPAIGN_REFERRAL_CAPTIONS = [
  `You earn. Your team earns. Their team earns. And you earn from all of it.\n\nTurboLoop's 20-level referral system pays commissions all the way down your network — permanently.\n\n👉 Get your referral link: https://turboloop.tech/apply\n\n#TurboLoop #ReferralIncome #NetworkIncome #20Levels #PassiveIncome`,
  `One referral can change your financial life. Twenty levels of them can change your family's.\n\nTurboLoop pays network commissions on 20 levels deep — every time anyone in your downline earns, you earn too.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #20Levels #NetworkIncome #ReferralMarketing #DeFi`,
  `The most powerful income is the one that grows while you sleep — from people you've never met.\n\nYour level-5 referral's deposit earns you a commission. Automatically. On-chain. Every day.\n\n👉 Build your network: https://turboloop.tech/apply\n\n#TurboLoop #NetworkIncome #PassiveIncome #ReferralSystem #DeFi`,
  `Share once. Earn forever.\n\nYour TurboLoop referral link is permanent. Every person who joins under you — and everyone they refer — contributes to your network income for life.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #ShareAndEarn #ReferralIncome #DeFi #PassiveIncome`,
  `From Turbo Partner to Turbo Legend — every rank unlocks higher network commissions.\n\nThe more your team grows, the more you earn. The system rewards builders.\n\n👉 See all ranks: https://turboloop.tech/apply\n\n#TurboLoop #TurboLegend #RankUp #NetworkIncome #DeFi`,
  `Your upline is permanent. Your downline is permanent. Your commissions are permanent.\n\nOnce someone joins TurboLoop through your link, they're in your network forever — no transfers, no reassignments.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #PermanentNetwork #ReferralIncome #DeFi #PassiveIncome`,
  `Level 1: 10% commission. Level 2: 5%. All the way to Level 20.\n\nTurboLoop's commission table is transparent, on-chain, and pays automatically — no manual claims, no waiting.\n\n👉 See the full table: https://turboloop.tech/apply\n\n#TurboLoop #CommissionTable #NetworkIncome #20Levels #DeFi`,
  `The best time to build your TurboLoop network was at launch. The second best time is right now.\n\nEvery day you wait, someone else is building the network that could have been yours.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #BuildNow #ReferralIncome #NetworkMarketing #DeFi`,
  `Imagine 100 people in your network, each depositing $100. That's $10,000 in active deposits — and you earn commissions on all of it.\n\nTurboLoop's 20-level system makes this possible.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #NetworkMath #ReferralIncome #DeFi #PassiveIncome`,
  `You don't need to be a crypto expert to build a TurboLoop network. You just need to share.\n\nShare your link. Your referrals deposit USDT. You earn commissions. Repeat.\n\n👉 Get started: https://turboloop.tech/apply\n\n#TurboLoop #SimpleReferral #NetworkIncome #DeFi #EarnOnline`,
  `Network income is the only income that scales without more of your time.\n\nYour TurboLoop downline earns 24/7 — and so do you, from their activity.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #ScalableIncome #NetworkIncome #DeFi #PassiveIncome`,
  `The Turbo Legend rank isn't a title. It's a lifestyle.\n\nReach the top of TurboLoop's rank system and your network income alone can replace a full-time salary.\n\n👉 Start your journey: https://turboloop.tech/apply\n\n#TurboLoop #TurboLegend #NetworkIncome #DeFi #FinancialFreedom`,
];
```

### CAMPAIGN_OBJECTION_CAPTIONS (12 captions)

```typescript
export const CAMPAIGN_OBJECTION_CAPTIONS = [
  `"Is it a scam?" — The smart contract answers.\n\nEvery dollar in TurboLoop is governed by an immutable smart contract on BNB Smart Chain. No team wallet. No admin key. No rug pull mechanism. The code is the boss.\n\n👉 Read the contract: https://turboloop.tech/token\n\n#TurboLoop #NotAScam #SmartContract #DeFiTransparency #DYOR`,
  `"Too good to be true?" — Check the on-chain data.\n\n0.9% daily yield sounds extraordinary until you understand DeFi liquidity provision. The protocol earns from real trading activity. The yield is real. The math is public.\n\n👉 Verify everything: https://turboloop.tech/token\n\n#TurboLoop #TooGoodToBeTrue #DeFiYield #OnChain #Transparency`,
  `"Where does the money come from?" — Liquidity provision fees.\n\nTurboLoop provides liquidity to PancakeSwap. Trading fees fund the yield. The more volume, the more the protocol earns. It's DeFi 101.\n\n👉 https://turboloop.tech/token\n\n#TurboLoop #YieldSource #DeFiLiquidity #PancakeSwap #Transparency`,
  `"What if the team runs?" — There is no team to run.\n\nThe smart contract is autonomous. No admin can pause it, drain it, or change the rules. The protocol runs itself — permanently.\n\n👉 https://turboloop.tech/token\n\n#TurboLoop #Trustless #SmartContract #DeFi #NoTeamRisk`,
  `"Can I withdraw anytime?" — Yes. Always.\n\nTurboLoop has no lock-up period. You can withdraw your earnings at any time. Your full capital is returned after 60 days. The contract enforces this — not a promise.\n\n👉 https://turboloop.tech\n\n#TurboLoop #WithdrawAnytime #DeFi #NoLockup #Transparency`,
  `"What about impermanent loss?" — There is none.\n\nTurboLoop's yield structure is fixed at 0.9% daily on your deposited USDT. You're not exposed to token price volatility in your principal. USDT in, USDT out.\n\n👉 https://turboloop.tech\n\n#TurboLoop #NoImpermanentLoss #StableYield #DeFi #USDT`,
  `"Do I need to understand crypto?" — Not really.\n\nIf you can send a WhatsApp message, you can use TurboLoop. Deposit USDT. Watch it grow. Withdraw when you want. The complexity is in the contract — not the user experience.\n\n👉 https://turboloop.tech\n\n#TurboLoop #EasyDeFi #CryptoForEveryone #PassiveIncome #BeginnerFriendly`,
  `"Is the liquidity locked?" — Yes. Verifiably.\n\nThe LP tokens are locked in a smart contract — not held in a team wallet. Anyone can verify this on BscScan right now.\n\n👉 Verify: https://turboloop.tech/token\n\n#TurboLoop #LockedLiquidity #NoRugPull #DeFi #Transparency`,
  `"What's the minimum deposit?" — 1 USDT.\n\nThere's no barrier to entry. Start with $1. See how it works. Scale when you're confident. TurboLoop was built for everyone — not just whales.\n\n👉 https://turboloop.tech\n\n#TurboLoop #StartSmall #1USDT #DeFiForAll #PassiveIncome`,
  `"What if the smart contract gets hacked?" — It's been audited.\n\nTurboLoop's smart contract has been reviewed for vulnerabilities. The code is public. The audit is public. You don't have to trust anyone — you can verify it yourself.\n\n👉 https://turboloop.tech/token\n\n#TurboLoop #Audited #SmartContract #DeFiSecurity #DYOR`,
  `"Is the referral system a pyramid?" — No. Here's the difference.\n\nA pyramid scheme requires recruitment to pay existing members. TurboLoop pays yield from DeFi liquidity fees — referral commissions are a bonus, not the source of yield.\n\n👉 https://turboloop.tech\n\n#TurboLoop #NotAPyramid #DeFiYield #ReferralBonus #Transparency`,
  `"What if I've been burned by crypto before?" — We understand.\n\nTurboLoop was built specifically to remove the risks that burned you: no team control, no token volatility on principal, no lock-up, no hidden fees. Just on-chain yield.\n\n👉 Start with $1: https://turboloop.tech\n\n#TurboLoop #CryptoRecovery #DeFiTrust #SafeYield #OnChain`,
];
```

### CAMPAIGN_HINDI_CAPTIONS (12 captions)

```typescript
export const CAMPAIGN_HINDI_CAPTIONS = [
  `🇮🇳 India ka DeFi revolution shuru ho gaya hai.\n\nTurboLoop pe daily 0.9% yield earn karo apne USDT pe — bina kisi bank ke, bina kisi middleman ke.\n\nSmart contract pe sab kuch transparent hai. Verify karo khud.\n\n👉 Aaj hi shuru karo: https://turboloop.tech\n\n#TurboLoop #IndiaKaDeFi #PassiveIncome #DeFiIndia #USDT`,
  `Ghar baithe kamao — yeh sirf ek sapna nahi, TurboLoop ki reality hai.\n\n0.9% daily yield. 60 din mein pura capital wapas. Kabhi bhi withdraw karo.\n\nBNB Smart Chain pe immutable smart contract — koi bhi control nahi kar sakta.\n\n👉 https://turboloop.tech\n\n#TurboLoop #GharBaitheKamao #PassiveIncome #DeFi #India`,
  `Agar aapka paisa aapke liye kaam nahi kar raha, toh aap paisa ke liye kaam kar rahe ho.\n\nTurboLoop mein USDT deposit karo. Har 24 ghante mein 0.9% earn karo. Apni zindagi jiyo.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #PaisaKaamKare #PassiveIncome #DeFiIndia #FinancialFreedom`,
  `Inflation beat karo DeFi se.\n\nBank FD deta hai 6-7% per year. TurboLoop deta hai 0.9% per DAY — on-chain, transparent, aur verifiable.\n\nFark samjho. Faisla karo.\n\n👉 https://turboloop.tech\n\n#TurboLoop #InflationBeat #DeFiIndia #BankVsDeFi #PassiveIncome`,
  `Apne network se kamao — 20 levels tak.\n\nTurboLoop ka referral system India ke liye perfect hai — jitna bada aapka network, utni zyada aapki income.\n\nEk baar share karo. Hamesha ke liye kamao.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #NetworkIncome #ReferralIndia #20Levels #PassiveIncome`,
  `Scam nahi hai — smart contract hai.\n\nTurboLoop ka code BscScan pe public hai. Koi bhi verify kar sakta hai. Koi team wallet nahi. Koi admin key nahi. Sirf code.\n\n👉 Verify karo: https://turboloop.tech/token\n\n#TurboLoop #ScamNahi #SmartContract #DeFiTrust #India`,
  `Sirf 1 USDT se shuru karo.\n\nTurboLoop mein minimum deposit sirf 1 USDT hai. Chota shuru karo, bada sochho. Protocol sab ke liye banaya gaya hai.\n\n👉 https://turboloop.tech\n\n#TurboLoop #1USDT #ChhoteSeShuru #DeFiIndia #PassiveIncome`,
  `Naukri chhodo nahi — pehle passive income banao.\n\nJab aapki TurboLoop income aapki salary se zyada ho jaye, tab decide karna. Tab tak dono chalao.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #NaukriChhodo #PassiveIncome #DeFiIndia #FinancialFreedom`,
  `Aapka paisa 24/7 kaam karta hai — aap soye ho ya jaag rahe ho.\n\nTurboLoop ka smart contract kabhi band nahi hota. Har 24 ghante mein 0.9% yield — automatically.\n\n👉 https://turboloop.tech\n\n#TurboLoop #24x7Kamao #PassiveIncome #DeFi #India`,
  `Parivar ke liye kuch alag karo.\n\nTurboLoop se jo passive income aati hai, woh aapke bacchon ki education, aapke parents ki care, aapke sapnon ke liye hoti hai.\n\n👉 https://turboloop.tech\n\n#TurboLoop #ParivarKeLiye #PassiveIncome #DeFiIndia #FamilyFirst`,
  `Blockchain kya hai? Simple hai.\n\nEk public ledger jahan sab kuch record hota hai — permanently, transparently, aur without any central authority. TurboLoop isi pe chalta hai.\n\n👉 Aur seekho: https://turboloop.tech/learn\n\n#TurboLoop #BlockchainKyaHai #DeFiEducation #India #CryptoSikho`,
  `Aaj ka ek chota kadam — kal ki badi azaadi.\n\nJitna jaldi TurboLoop mein shuru karo, utna zyada compounding ka faida milega. Kal ka wait mat karo.\n\n👉 Abhi shuru karo: https://turboloop.tech\n\n#TurboLoop #AajHiShuru #Compounding #DeFiIndia #PassiveIncome`,
];
```

### CAMPAIGN_NIGERIAN_CAPTIONS (12 captions)

```typescript
export const CAMPAIGN_NIGERIAN_CAPTIONS = [
  `🇳🇬 Naija, the DeFi revolution don reach our side.\n\nTurboLoop dey pay 0.9% daily yield on your USDT — no bank, no wahala, no middleman. Just smart contract.\n\n👉 Start today: https://turboloop.tech\n\n#TurboLoop #NaijaDeFi #PassiveIncome #MakeMoneyOnline #Nigeria`,
  `Sapa no go catch you if your money dey work for you.\n\nDeposit USDT. Earn 0.9% every day. Withdraw anytime. Full capital back after 60 days.\n\nThis na real deal — verify am on BscScan.\n\n👉 https://turboloop.tech\n\n#TurboLoop #SapaNoMore #PassiveIncome #NaijaDeFi #USDT`,
  `From Danfo to Benz — one step at a time.\n\nTurboLoop's daily yield dey compound. Small small, e dey grow. Start with what you have. Scale as you go.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #DanfoToBenz #PassiveIncome #NaijaDeFi #Compounding`,
  `No be scam — na smart contract.\n\nTurboLoop code dey public on BscScan. No team wallet. No admin key. The contract dey run itself — nobody fit touch your money.\n\n👉 Verify am: https://turboloop.tech/token\n\n#TurboLoop #NoBeScam #SmartContract #DeFiTrust #Nigeria`,
  `Naija inflation dey chop your savings. DeFi yield dey beat am.\n\nBank dey give 10% per year. TurboLoop dey give 0.9% per DAY — on-chain, transparent, verifiable.\n\nDo the math.\n\n👉 https://turboloop.tech\n\n#TurboLoop #BeatInflation #NaijaDeFi #BankVsDeFi #PassiveIncome`,
  `Build your network. Earn from 20 levels.\n\nTurboLoop's referral system dey pay commissions 20 levels deep — every time anybody for your downline earn, you earn too.\n\n👉 Get your link: https://turboloop.tech/apply\n\n#TurboLoop #NetworkIncome #20Levels #NaijaHustle #PassiveIncome`,
  `You no need to understand blockchain to use TurboLoop.\n\nIf you fit send WhatsApp message, you fit use TurboLoop. Deposit USDT. Watch am grow. Withdraw when you want.\n\n👉 https://turboloop.tech\n\n#TurboLoop #EasyDeFi #NaijaDeFi #CryptoForAll #PassiveIncome`,
  `Abuja mansion, Lagos lifestyle — passive income dey make am possible.\n\nTurboLoop members dey earn 0.9% daily on their USDT. No trading. No stress. Just yield.\n\n👉 https://turboloop.tech\n\n#TurboLoop #AbujaLife #LagosLife #PassiveIncome #NaijaDeFi`,
  `Diaspora Naija — your money fit work for you from anywhere.\n\nTurboLoop dey accessible from UK, US, Canada, everywhere. Deposit USDT. Earn daily. Send back home.\n\n👉 https://turboloop.tech\n\n#TurboLoop #NaijaDiaspora #PassiveIncome #DeFi #RemittanceAlternative`,
  `Market woman, Okada rider, banker — TurboLoop dey for everybody.\n\nMinimum deposit na 1 USDT. No barrier. No discrimination. Just on-chain yield for anyone wey wan earn.\n\n👉 https://turboloop.tech\n\n#TurboLoop #DeFiForAll #NaijaDeFi #1USDT #PassiveIncome`,
  `Arise, compatriots — the financial system wey serve us don change.\n\nDeFi no need your BVN. No need your bank account. Just your wallet and your USDT.\n\n👉 https://turboloop.tech\n\n#TurboLoop #NaijaDeFi #Unbanked #FinancialInclusion #PassiveIncome`,
  `Owambe season go better when passive income dey flow.\n\nTurboLoop members dey earn every day — whether dem dey party or dem dey sleep. That na the real flex.\n\n👉 https://turboloop.tech\n\n#TurboLoop #Owambe #PassiveIncome #NaijaDeFi #DailyYield`,
];
```

### CAMPAIGN_SUCCESS_CAPTIONS (12 captions)

```typescript
export const CAMPAIGN_SUCCESS_CAPTIONS = [
  `First withdrawal hits different.\n\nThe moment you see USDT land in your wallet from TurboLoop — that's when it becomes real. Not a promise. Not a projection. Real money.\n\n👉 Start your story: https://turboloop.tech\n\n#TurboLoop #FirstWithdrawal #DeFiYield #PassiveIncome #RealResults`,
  `60 days in. Full capital back. Plus 54% earned on top.\n\nThat's what TurboLoop's 0.9% daily yield looks like after a full cycle. The math was always right — the experience confirms it.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #60DayCycle #DeFiYield #PassiveIncome #RealResults`,
  `From skeptic to believer — one withdrawal at a time.\n\nEvery TurboLoop member who doubted it changed their mind the first time they withdrew. The protocol doesn't argue. It just pays.\n\n👉 https://turboloop.tech\n\n#TurboLoop #FromSkepticToBeliever #DeFiYield #PassiveIncome #RealResults`,
  `Rank up. Earn more. Repeat.\n\nTurboLoop members who build their network don't just earn yield — they earn commissions from 20 levels of referrals. Some have replaced their full salary.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #RankUp #NetworkIncome #DeFi #SuccessStory`,
  `The best investment advice I ever got: let the smart contract work.\n\nStop timing the market. Stop chasing 100x tokens. Deposit USDT. Earn 0.9% daily. Compound. Repeat.\n\n👉 https://turboloop.tech\n\n#TurboLoop #SmartInvestment #DeFiYield #PassiveIncome #SuccessStory`,
  `She started with $100. 60 days later, she had $154 — and her $100 back.\n\nThat's TurboLoop's 0.9% daily yield in action. Small start. Real results. Compounding magic.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #StartSmall #DeFiYield #PassiveIncome #SuccessStory`,
  `Paid off debt with DeFi yield. Not clickbait — just math.\n\nWhen your passive income exceeds your monthly debt payment, you're winning. TurboLoop makes that possible.\n\n👉 https://turboloop.tech\n\n#TurboLoop #DebtFree #DeFiYield #PassiveIncome #SuccessStory`,
  `My TurboLoop earnings covered my rent this month.\n\nThat's the goal — when passive income starts covering real expenses. It starts small. It compounds. It changes everything.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #RentPaid #PassiveIncome #DeFiYield #SuccessStory`,
  `The protocol paid me while I was on holiday.\n\nI didn't check my phone once. When I came back, my TurboLoop balance was higher than when I left. That's passive income.\n\n👉 https://turboloop.tech\n\n#TurboLoop #HolidayEarnings #PassiveIncome #DeFiYield #SuccessStory`,
  `Network income changed my family's life.\n\nBuilding a TurboLoop downline took 3 months. Now the commissions come in daily — from people I've never met, in countries I've never visited.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #NetworkIncome #FamilyLife #DeFi #SuccessStory`,
  `I compounded for 6 months. The results were unbelievable.\n\nReinvesting TurboLoop earnings instead of withdrawing them creates exponential growth. 6 months of compounding at 0.9% daily is transformative.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #Compounding #DeFiYield #PassiveIncome #SuccessStory`,
  `The withdrawal proof is on-chain. Anyone can verify it.\n\nEvery TurboLoop payout is a blockchain transaction — public, permanent, and verifiable. No screenshots needed. Just BscScan.\n\n👉 https://turboloop.tech/token\n\n#TurboLoop #WithdrawalProof #OnChain #DeFiYield #Transparency`,
];
```

### CAMPAIGN_EDUCATION_CAPTIONS (12 captions)

```typescript
export const CAMPAIGN_EDUCATION_CAPTIONS = [
  `What is DeFi? — Decentralized Finance explained in one minute.\n\nDeFi is a financial system that runs on smart contracts instead of banks. No middlemen. No opening hours. No permission required. TurboLoop is DeFi.\n\n👉 Learn more: https://turboloop.tech/learn\n\n#WhatIsDeFi #DeFiEducation #TurboLoop #Blockchain #Web3`,
  `What is a smart contract? — The most important invention in finance since the ATM.\n\nA smart contract is code that executes automatically when conditions are met. No human can override it. TurboLoop's yield is paid by a smart contract — not a team.\n\n👉 https://turboloop.tech/learn\n\n#SmartContract #DeFiEducation #TurboLoop #Blockchain #Web3`,
  `What is a stablecoin? — Crypto without the volatility.\n\nUSDT is a stablecoin pegged to the US dollar. $1 of USDT is always worth $1. TurboLoop pays 0.9% daily on USDT — so your principal never loses value to crypto volatility.\n\n👉 https://turboloop.tech/learn\n\n#WhatIsUSDT #Stablecoin #DeFiEducation #TurboLoop #Crypto`,
  `What is compound interest? — Einstein called it the eighth wonder of the world.\n\nWhen you reinvest your TurboLoop earnings, your next day's yield is calculated on a larger base. Over time, this creates exponential growth.\n\n👉 See the math: https://turboloop.tech/calculator\n\n#CompoundInterest #DeFiEducation #TurboLoop #PassiveIncome #Compounding`,
  `What is a liquidity pool? — The engine behind DeFi yields.\n\nA liquidity pool is a smart contract holding pairs of tokens that traders can swap against. Liquidity providers earn fees from every trade. TurboLoop uses this mechanism to generate yield.\n\n👉 https://turboloop.tech/learn\n\n#LiquidityPool #DeFiEducation #TurboLoop #YieldFarming #DeFi`,
  `What is BNB Smart Chain? — The blockchain TurboLoop runs on.\n\nBSC is a fast, low-fee blockchain compatible with Ethereum tools. Gas fees are cents, not dollars. TurboLoop chose BSC for accessibility — so anyone can participate.\n\n👉 https://turboloop.tech/learn\n\n#BNBSmartChain #BSC #DeFiEducation #TurboLoop #Blockchain`,
  `What is yield farming? — Putting your crypto to work.\n\nYield farming means providing liquidity or capital to a DeFi protocol in exchange for returns. TurboLoop is a yield farming protocol — you provide USDT, the protocol generates returns.\n\n👉 https://turboloop.tech/learn\n\n#YieldFarming #DeFiEducation #TurboLoop #DeFiYield #Crypto`,
  `What is a crypto wallet? — Your key to DeFi.\n\nA crypto wallet stores your private keys — the passwords that prove you own your crypto. MetaMask and Trust Wallet work with TurboLoop. You control your funds, always.\n\n👉 https://turboloop.tech/learn\n\n#CryptoWallet #MetaMask #DeFiEducation #TurboLoop #Web3`,
  `DeFi vs CeFi — what's the difference?\n\nCeFi (Centralized Finance) = banks, exchanges, custodians. They hold your money. DeFi = smart contracts. The code holds your money. TurboLoop is DeFi — no one can freeze your funds.\n\n👉 https://turboloop.tech/learn\n\n#DeFiVsCeFi #DeFiEducation #TurboLoop #Blockchain #FinancialFreedom`,
  `What is ROI? — Return on Investment, explained for DeFi.\n\nROI = (Earnings / Investment) × 100. At 0.9% daily for 60 days, TurboLoop's ROI is 54% per cycle — plus your full capital back. Compare that to any bank.\n\n👉 https://turboloop.tech/calculator\n\n#ROI #DeFiEducation #TurboLoop #DeFiYield #PassiveIncome`,
  `What is decentralization? — Why it matters for your money.\n\nDecentralization means no single entity controls the system. TurboLoop's smart contract has no owner, no admin, no off switch. Your funds are governed by math, not people.\n\n👉 https://turboloop.tech/learn\n\n#Decentralization #DeFiEducation #TurboLoop #Trustless #Blockchain`,
  `What is immutability? — The property that makes DeFi trustworthy.\n\nImmutable means unchangeable. Once TurboLoop's smart contract was deployed, its rules cannot be altered — not by the team, not by anyone. The yield rate, the withdrawal rules, all permanent.\n\n👉 https://turboloop.tech/token\n\n#Immutability #DeFiEducation #TurboLoop #SmartContract #Trustless`,
];
```

### CAMPAIGN_URGENCY_CAPTIONS (12 captions)

```typescript
export const CAMPAIGN_URGENCY_CAPTIONS = [
  `Every day you wait is a day you didn't earn 0.9%.\n\nThat's not pressure — that's math. Compound interest rewards the early. The protocol doesn't wait for you.\n\n👉 Start today: https://turboloop.tech\n\n#TurboLoop #StartToday #DeFiYield #PassiveIncome #Compounding`,
  `The best time to start was yesterday. The second best time is right now.\n\nEvery TurboLoop member who waited a month to join wishes they hadn't. The compounding clock started without them.\n\n👉 https://turboloop.tech\n\n#TurboLoop #StartNow #DeFiYield #PassiveIncome #NoMoreWaiting`,
  `Your savings account earned $0.08 today. TurboLoop would have earned 0.9%.\n\nThe gap between what your bank pays and what DeFi pays is not a rounding error. It's a different financial system.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #BankVsDeFi #PassiveIncome #DeFiYield #StartToday`,
  `Inflation is running at 5-8% per year. TurboLoop pays 0.9% per day.\n\nEvery day you keep your savings in a bank account, inflation is winning. DeFi is the answer.\n\n👉 https://turboloop.tech\n\n#TurboLoop #BeatInflation #DeFiYield #PassiveIncome #StartToday`,
  `You've been thinking about it for weeks. The protocol has been paying without you.\n\nStop researching. Start earning. You can always add more later — but you can't get back the days you missed.\n\n👉 https://turboloop.tech\n\n#TurboLoop #StopWaiting #DeFiYield #PassiveIncome #StartNow`,
  `Tonight, while you sleep, TurboLoop members will earn 0.9% on their USDT.\n\nWill you be one of them?\n\n👉 Deposit before midnight: https://turboloop.tech\n\n#TurboLoop #EarnWhileYouSleep #DeFiYield #PassiveIncome #Tonight`,
  `The protocol doesn't care about market conditions. It pays 0.9% daily regardless.\n\nBull market, bear market, sideways market — TurboLoop's yield is fixed. Your USDT earns the same every day.\n\n👉 https://turboloop.tech\n\n#TurboLoop #FixedYield #DeFiYield #PassiveIncome #MarketProof`,
  `$100 deposited today = $154 in 60 days + your $100 back.\n\n$100 NOT deposited today = $100 in 60 days.\n\nThe difference is $54. The decision is yours.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #54Percent #DeFiYield #PassiveIncome #StartToday`,
  `Every hour you wait, someone else is compounding ahead of you.\n\nTurboLoop's community is growing daily. The early movers are already on their second and third cycles. Don't let the gap grow wider.\n\n👉 https://turboloop.tech\n\n#TurboLoop #DontWait #Compounding #DeFiYield #PassiveIncome`,
  `You don't need to understand everything to start. You just need to start.\n\nDeposit $10. Watch it earn 0.9% tomorrow. Then decide if you want to add more. The protocol will still be here.\n\n👉 https://turboloop.tech\n\n#TurboLoop #StartSmall #DeFiYield #PassiveIncome #JustStart`,
  `The window to earn from day one is always open — but every day you delay is a day of yield you'll never get back.\n\nCompound interest is unforgiving to procrastinators.\n\n👉 https://turboloop.tech\n\n#TurboLoop #CompoundingClock #DeFiYield #PassiveIncome #StartToday`,
  `Your future self is either thanking you for starting today, or wishing you had.\n\nWhich version do you want to be?\n\n👉 Start now: https://turboloop.tech\n\n#TurboLoop #FutureSelf #DeFiYield #PassiveIncome #StartToday`,
];
```

### CAMPAIGN_BUYBACK_CAPTIONS (12 captions)

```typescript
export const CAMPAIGN_BUYBACK_CAPTIONS = [
  `Daily buyback executed. More $TURBO removed from circulation.\n\nEvery day, TurboLoop's protocol buys $TURBO from the open market and burns it permanently. Less supply. Same demand. Deflationary by design.\n\n👉 Verify on-chain: https://turboloop.tech/token\n\n#TURBO #BuybackBurn #Deflationary #DeFiToken #BSC`,
  `The protocol bought back $TURBO again today.\n\nThis isn't marketing. It's an on-chain transaction — verifiable on BscScan right now. The buyback happens daily, automatically, from protocol fees.\n\n👉 https://turboloop.tech/token\n\n#TURBO #DailyBuyback #OnChain #Deflationary #BSC`,
  `Fewer $TURBO tokens exist today than yesterday.\n\nThat's the buyback and burn mechanism at work. Every day the protocol operates, the circulating supply decreases. Scarcity compounds over time.\n\n👉 https://turboloop.tech/token\n\n#TURBO #BurnedForever #Deflationary #DeFiToken #Scarcity`,
  `$TURBO's supply is shrinking. The protocol is working.\n\nDaily buybacks remove tokens from circulation permanently. No re-minting. No inflation. Just a smaller and smaller supply.\n\n👉 https://turboloop.tech/token\n\n#TURBO #ShrinkingSupply #Deflationary #BSC #DeFiToken`,
  `Proof of work: today's buyback is on-chain.\n\nSkeptics welcome. Every buyback transaction is public on BscScan. The protocol doesn't ask you to trust it — it shows you the receipts.\n\n👉 Verify: https://turboloop.tech/token\n\n#TURBO #ProofOfWork #BuybackBurn #OnChain #Transparency`,
  `The buyback engine never stops.\n\nWhether markets are up or down, TurboLoop's protocol executes daily buybacks from fee revenue. The mechanism is autonomous — no human decision required.\n\n👉 https://turboloop.tech/token\n\n#TURBO #AutomaticBuyback #Deflationary #DeFiToken #BSC`,
  `Every USDT deposited in TurboLoop contributes to the $TURBO buyback.\n\nProtocol fees fund the buyback. More deposits = more fees = more $TURBO bought and burned. Growth creates scarcity.\n\n👉 https://turboloop.tech/token\n\n#TURBO #BuybackMechanism #Deflationary #DeFiToken #Scarcity`,
  `$TURBO burned today: check the contract.\n\nThe burn address balance grows every day. Every token sent there is gone forever — reducing supply, increasing scarcity, rewarding holders.\n\n👉 https://turboloop.tech/token\n\n#TURBO #BurnAddress #Deflationary #DeFiToken #BSC`,
  `Most tokens inflate. $TURBO deflates.\n\nWhile other projects print new tokens for team salaries and marketing, $TURBO's supply only goes in one direction: down.\n\n👉 https://turboloop.tech/token\n\n#TURBO #Deflationary #FixedSupply #DeFiToken #BSC`,
  `The buyback is funded by real protocol activity — not promises.\n\nTurboLoop earns fees from liquidity provision. Those fees buy $TURBO. That $TURBO gets burned. Real yield. Real deflation.\n\n👉 https://turboloop.tech/token\n\n#TURBO #RealYield #BuybackBurn #Deflationary #BSC`,
  `Holders benefit from every new deposit.\n\nWhen new members deposit USDT, protocol fees increase, buybacks increase, and $TURBO supply decreases faster. Growth benefits all holders.\n\n👉 https://turboloop.tech/token\n\n#TURBO #HolderBenefit #Deflationary #DeFiToken #NetworkEffect`,
  `$TURBO: the token that gets rarer every day.\n\nFixed supply. Daily buyback. Permanent burn. No mint function. This is what a properly designed deflationary token looks like.\n\n👉 https://turboloop.tech/token\n\n#TURBO #GetsRarer #Deflationary #FixedSupply #DeFiToken`,
];
```

### CAMPAIGN_COMPARISON_CAPTIONS (12 captions)

```typescript
export const CAMPAIGN_COMPARISON_CAPTIONS = [
  `Bank savings account: 0.5% per year.\nTurboLoop: 0.9% per day.\n\nThat's not a typo. That's DeFi.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #BankVsDeFi #DeFiYield #PassiveIncome #FinancialFreedom`,
  `Stocks: average 10% per year (if you're lucky).\nTurboLoop: 0.9% per day, every day, regardless of market conditions.\n\nDifferent asset class. Different rules.\n\n👉 https://turboloop.tech\n\n#TurboLoop #StocksVsDeFi #DeFiYield #PassiveIncome #FixedYield`,
  `Crypto trading: high risk, high stress, unpredictable returns.\nTurboLoop: fixed 0.9% daily, USDT principal, no volatility exposure.\n\nSame ecosystem. Completely different risk profile.\n\n👉 https://turboloop.tech\n\n#TurboLoop #CryptoVsDeFi #StableYield #PassiveIncome #LowRisk`,
  `Forex trading: requires skill, time, and constant attention.\nTurboLoop: deposit once, earn daily, withdraw anytime.\n\nOne requires expertise. The other just requires a wallet.\n\n👉 https://turboloop.tech\n\n#TurboLoop #ForexVsDeFi #PassiveIncome #DeFiYield #NoExpertiseNeeded`,
  `Fixed deposit: 6-8% per year, locked for 1-5 years.\nTurboLoop: 54% per 60-day cycle, withdraw anytime.\n\nBetter returns. More flexibility. On-chain transparency.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #FDVsDeFi #DeFiYield #PassiveIncome #BetterReturns`,
  `Hedge funds: minimum $1M investment, 2% management fee, 20% performance fee.\nTurboLoop: minimum 1 USDT, no management fee, no performance fee.\n\nDeFi democratizes finance.\n\n👉 https://turboloop.tech\n\n#TurboLoop #HedgeFundVsDeFi #DeFiForAll #PassiveIncome #FinancialInclusion`,
  `Meme coins: 100x potential, 99% chance of going to zero.\nTurboLoop: 0.9% daily, fixed, on USDT principal.\n\nOne is gambling. The other is yield.\n\n👉 https://turboloop.tech\n\n#TurboLoop #MemeCoinsVsDeFi #StableYield #DeFi #NotGambling`,
  `Crypto lending platforms (CeFi): your funds are held by a company that can go bankrupt.\nTurboLoop (DeFi): your funds are held by a smart contract that can't go bankrupt.\n\nCustody matters.\n\n👉 https://turboloop.tech\n\n#TurboLoop #CeFiVsDeFi #SmartContract #DeFiYield #NoCounterpartyRisk`,
  `Savings challenge: save $X per month, earn nothing on it.\nTurboLoop: deposit USDT, earn 0.9% daily while it sits there.\n\nSame discipline. Completely different outcome.\n\n👉 https://turboloop.tech/calculator\n\n#TurboLoop #SavingsVsDeFi #DeFiYield #PassiveIncome #MoneyHabits`,
  `Pension fund: wait 30-40 years, get back less than inflation took.\nTurboLoop: earn 0.9% daily, compound for years, retire early.\n\nDeFi is the pension fund the system never gave you.\n\n👉 https://turboloop.tech\n\n#TurboLoop #PensionVsDeFi #EarlyRetirement #DeFiYield #FinancialFreedom`,
  `Bonds: 3-5% per year, locked, government-dependent.\nTurboLoop: 0.9% per day, no lock-up, code-dependent.\n\nTrust the math, not the government.\n\n👉 https://turboloop.tech\n\n#TurboLoop #BondsVsDeFi #DeFiYield #PassiveIncome #TrustTheMath`,
  `Traditional investment: complex, expensive, exclusive.\nTurboLoop: simple, free to use, open to anyone with 1 USDT.\n\nFinancial freedom shouldn't require a financial advisor.\n\n👉 https://turboloop.tech\n\n#TurboLoop #TraditionalVsDeFi #DeFiForAll #PassiveIncome #FinancialFreedom`,
];
```

### CAMPAIGN_COMMUNITY_CAPTIONS (12 captions)

```typescript
export const CAMPAIGN_COMMUNITY_CAPTIONS = [
  `The TurboLoop community spans 50+ countries.\n\nFrom India to Nigeria, from Germany to Brazil — TurboLoop members are earning passive income in every timezone. The protocol never sleeps, and neither does the community.\n\n👉 Join us: https://t.me/turboloopofficial\n\n#TurboLoop #GlobalCommunity #DeFi #PassiveIncome #Worldwide`,
  `You're not alone in this. 1,000+ members are earning alongside you.\n\nEvery day, the TurboLoop community grows. Every new member strengthens the protocol. Every withdrawal proves the system works.\n\n👉 https://t.me/turboloopofficial\n\n#TurboLoop #Community #DeFi #PassiveIncome #Together`,
  `The best investment community is one that shares knowledge, not just hype.\n\nTurboLoop's Telegram is full of real members sharing real withdrawals, real strategies, and real support. No bots. No fake hype.\n\n👉 https://t.me/turboloopofficial\n\n#TurboLoop #RealCommunity #DeFi #PassiveIncome #KnowledgeSharing`,
  `Your referral network is your community. Your community is your network.\n\nThe strongest TurboLoop members didn't just deposit — they built teams. Teams that earn together, grow together.\n\n👉 https://turboloop.tech/apply\n\n#TurboLoop #NetworkCommunity #DeFi #ReferralIncome #Together`,
  `From strangers to teammates — that's the TurboLoop story.\n\nMembers who found TurboLoop independently are now building networks together, sharing strategies, and growing each other's income.\n\n👉 https://t.me/turboloopofficial\n\n#TurboLoop #Teammates #DeFi #Community #NetworkIncome`,
  `The global leaderboard is live. Where does your country rank?\n\n👉 Check the rankings: https://turboloop.tech/community\n\n#TurboLoop #GlobalLeaderboard #Community #DeFi #CountryRanking`,
  `Every member who joins makes the community stronger.\n\nMore deposits = more protocol fees = more buybacks = stronger $TURBO. The community's growth directly benefits every holder.\n\n👉 https://t.me/turboloopofficial\n\n#TurboLoop #CommunityGrowth #DeFi #TURBO #NetworkEffect`,
  `Real people. Real withdrawals. Real community.\n\nNo anonymous team. No fake testimonials. Just members sharing their TurboLoop journey — transparently, on-chain.\n\n👉 https://turboloop.tech/community\n\n#TurboLoop #RealPeople #Community #DeFi #Transparency`,
  `The TurboLoop Telegram is the most active DeFi community on BSC.\n\nJoin 10,000+ members discussing strategies, sharing withdrawals, and building their networks together.\n\n👉 https://t.me/turboloopofficial\n\n#TurboLoop #ActiveCommunity #DeFi #BSC #Telegram`,
  `Community is the moat. Protocol is the foundation.\n\nTurboLoop's smart contract can't be copied without the community. And the community grows stronger every day.\n\n👉 https://t.me/turboloopofficial\n\n#TurboLoop #CommunityMoat #DeFi #PassiveIncome #NetworkEffect`,
  `Share your TurboLoop journey. Inspire the next member.\n\nEvery withdrawal you share, every rank you achieve, every milestone you post — it helps someone else take the first step.\n\n👉 https://turboloop.tech/community\n\n#TurboLoop #ShareYourJourney #Community #DeFi #Inspire`,
  `The TurboLoop family doesn't care where you're from. Just that you're in.\n\nIndia, Nigeria, Germany, Brazil, Philippines — one protocol, one community, one mission: financial freedom for everyone.\n\n👉 https://t.me/turboloopofficial\n\n#TurboLoop #GlobalFamily #DeFi #FinancialFreedom #Community`,
];
```

---

## Step 5 — Wire up 24 hourly cron tasks in `cron-master.ts`

Add the following tasks to `cron-master.ts`. Each uses `hasFiredToday(db, "campaign:{id}")` for dedup and `daysSinceLaunch % imageCount` for image rotation.

**Helper function to add at top of the campaign section:**

```typescript
// Days since token launch (June 1, 2026) — used for deterministic image rotation
const daysSinceLaunch = Math.floor((Date.now() - new Date("2026-06-01T00:00:00Z").getTime()) / 86400000);

// Campaign banner URL builder
function campaignUrl(category: string, index: number, total: number): string {
  const R2 = process.env.R2_PUBLIC_URL ?? "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";
  const i = (index % total) + 1;
  // Files are named 01_..., 02_..., etc. We need to find the correct filename.
  // Since we can't list R2 at runtime, we use a pre-built index map imported from _messagePools.ts
  return `${R2}/campaigns/${category}/${CAMPAIGN_FILE_INDEX[category][i - 1]}`;
}
```

**Add `CAMPAIGN_FILE_INDEX` to `_messagePools.ts`** — a pre-built map of all 504 filenames per category, so the cron can construct URLs without listing R2 at runtime.

**24 new task slots (filling all hours 00-23 UTC):**

| UTC Hour | Task ID | Category | Image Count | Caption Pool |
|---|---|---|---|---|
| 01:00 | `campaign:lifestyle` | lifestyle | 50 | CAMPAIGN_LIFESTYLE_CAPTIONS |
| 03:00 | `campaign:education` | education-defi | 40 | CAMPAIGN_EDUCATION_CAPTIONS |
| 05:00 | `campaign:objection` | objection-handler | 50 | CAMPAIGN_OBJECTION_CAPTIONS |
| 07:00 | `campaign:token` | token | 50 | CAMPAIGN_TOKEN_CAPTIONS |
| 09:00 | `campaign:referral` | referral | 50 | CAMPAIGN_REFERRAL_CAPTIONS |
| 12:00 | `campaign:comparison` | comparison | 30 | CAMPAIGN_COMPARISON_CAPTIONS |
| 14:00 | `campaign:success` | success-story | 40 | CAMPAIGN_SUCCESS_CAPTIONS |
| 15:00 | `campaign:hindi` | hindi-new | 50 | CAMPAIGN_HINDI_CAPTIONS |
| 21:00 | `campaign:urgency` | urgency | 34 | CAMPAIGN_URGENCY_CAPTIONS |
| 21:30 | `campaign:buyback` | buyback | 30 | CAMPAIGN_BUYBACK_CAPTIONS |
| 23:00 | `campaign:naija` | nigerian | 50 | CAMPAIGN_NIGERIAN_CAPTIONS |
| 23:30 | `campaign:community` | community | 30 | CAMPAIGN_COMMUNITY_CAPTIONS |

**Note:** The existing slots (00:00, 02:00, 04:00, 06:00, 08:00, 10:00, 11:30, 13:00, 16:00, 17:00, 18:00, 19:00, 20:00, 22:00) are kept as-is. The 12 new campaign slots fill the remaining gaps, bringing total to 24+ posts/day.

**Each task block follows this pattern:**

```typescript
// ============ CAMPAIGN: LIFESTYLE — 01:00 UTC ============
if (isInWindow(1, 0) && !(await hasFiredToday(db, "campaign:lifestyle"))) {
  try {
    const idx = daysSinceLaunch % 50;
    const imgUrl = `${R2_PUBLIC}/campaigns/lifestyle/${CAMPAIGN_FILE_INDEX.lifestyle[idx]}`;
    const caption = pickByDay(CAMPAIGN_LIFESTYLE_CAPTIONS, daysSinceLaunch);
    const priceData = await fetchPriceHistory().catch(() => null);
    const priceLine = priceData
      ? `\n\n💰 $TURBO: $${priceData.currentPrice.toFixed(6)} (+${priceData.priceChangeAllTime.toFixed(2)}% since launch)`
      : "";
    await tgBroadcastPhoto(imgUrl, caption + priceLine);
    await markFired(db, "campaign:lifestyle");
    log.push("✅ campaign:lifestyle");
  } catch (err) {
    await markError(db, "campaign:lifestyle", err).catch(() => {});
    log.push(`❌ campaign:lifestyle: ${err instanceof Error ? err.message : String(err)}`);
  }
}
```

---

## Step 6 — Build and verify

```bash
# TypeScript check
cd next-app && npx tsc --noEmit 2>&1 | grep -v node_modules | head -20

# Build API bundle
cd .. && npm run build:api 2>&1 | tail -10

# Spot-check 3 R2 URLs
curl -sI "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/campaigns/lifestyle/01_Lifestyle_Morning_Coffee_Earnings.png" | grep "HTTP\|content-type"
curl -sI "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/campaigns/token/01_Token_Launch_Story.png" | grep "HTTP\|content-type"
curl -sI "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/campaigns/objection-handler/01_Objection_Is_It_A_Scam.png" | grep "HTTP\|content-type"
```

---

## Step 7 — Commit

```bash
cd /path/to/turboloop-hub-fresh2
git add server/_vercel/_messagePools.ts server/_vercel/cron-master.ts next-app/app/creatives/ next-app/lib/creativesData.ts next-app/app/sitemap.ts next-app/public/campaigns-manifest.json scripts/generate-campaigns-manifest.mjs
git commit -m "feat: deploy 504 campaign creatives — R2 upload, Marketing Hub SEO, 24-posts/day Telegram automation"
git push
```

---

## Checklist

- [ ] 504 files uploaded to R2 under `campaigns/` prefix
- [ ] `campaigns-manifest.json` generated with alt text, titles, descriptions for all 504 images
- [ ] 12 new categories added to `creativesData.ts`
- [ ] 12 sub-pages created at `/creatives/[category]` with unique metadata
- [ ] Main `/creatives` page metadata updated
- [ ] `ImageGallery` JSON-LD structured data added
- [ ] Sitemap updated with `/creatives` + 12 sub-pages
- [ ] 12 caption pools (12 captions each) added to `_messagePools.ts`
- [ ] `CAMPAIGN_FILE_INDEX` map added to `_messagePools.ts`
- [ ] 12 new hourly cron tasks added to `cron-master.ts`
- [ ] TypeScript check passes
- [ ] API bundle builds without errors
- [ ] 3 R2 URLs spot-checked
- [ ] Committed and pushed
