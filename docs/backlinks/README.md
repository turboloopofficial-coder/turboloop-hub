# Backlink + directory submission templates

**Goal:** Build domain authority + diversify referral traffic via authoritative directory listings and ecosystem-native presences. Every section below is **ready-to-execute** — pre-filled forms, copy-paste-ready copy, exact field names from each platform's submission flow as of late 2025 / early 2026.

**Priority order (highest ROI first):**

1. **DefiLlama** — TVL aggregator, ~3M monthly visits, the de facto DeFi directory
2. **DappRadar** — protocol directory + user reviews, do-follow
3. **CoinGecko** — token / protocol listing (we'd need a token first; deferred until that exists)
4. **CoinMarketCap** — same shape as CoinGecko
5. **de.fi** — DeFi safety scanner directory
6. **BscScan** — protocol metadata on the contract page itself
7. **GitHub README** — official repo backlink
8. **Reddit** — high-intent communities (r/defi, r/cryptocurrency)
9. **Telegram channel + group bios** — every channel description should link back
10. **Wikipedia** — wishful, but worth a stub draft once Phase 5 community + 6 months of clean operation are in the books

---

## 1. DefiLlama submission

**URL:** <https://defillama.com/submit-protocol>
**Form alternative:** GitHub PR to <https://github.com/DefiLlama/DefiLlama-Adapters> — they prefer this for protocols with non-trivial TVL accounting.

### Submission data
| Field | Value |
|-------|-------|
| Protocol name | TurboLoop |
| Description | TurboLoop is a decentralized yield protocol on Binance Smart Chain. Users deposit USDT into one of four fixed-ROI Loop Plans (Sprint 7d/3%, Boost 14d/10%, Power 30d/24%, Ultimate 60d/54%). Revenue comes from a USDC/USDT liquidity pool, Turbo Swap trading fees, and Turbo Buy fiat-to-crypto fees. Smart contract is independently audited with ownership permanently renounced; 100% of LP tokens are locked on-chain. |
| Category | Yield Aggregator (primary), Liquidity (secondary) |
| Logo URL | https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png |
| Chain | Binance |
| Website | https://www.turboloop.tech |
| Twitter | https://x.com/TurboLoop_io |
| Telegram | https://t.me/TurboLoop_Official |
| GitHub | https://github.com/turboloopofficial-coder/turboloop-hub |
| Audit links | (link to SolidityScan audit PDF on R2) |
| Contract addresses | (BscScan contract address + the LP lock contract address) |

### TVL adapter (the gnarly part)
DefiLlama wants a JS adapter that returns the current TVL by querying the contract. Open the GitHub PR at `DefiLlama/DefiLlama-Adapters`, fork the repo, add `projects/turboloop/index.js`:
```js
const { sumTokens2 } = require('../helper/unwrapLPs');
const TURBOLOOP_CONTRACT = '0x...'; // ← actual deposit contract
const USDT_BSC = '0x55d398326f99059fF775485246999027B3197955';
async function tvl(api) {
  return sumTokens2({ api, tokens: [USDT_BSC], owner: TURBOLOOP_CONTRACT });
}
module.exports = {
  bsc: { tvl },
  methodology: 'TVL is total USDT held by the TurboLoop deposit contract on Binance Smart Chain.',
};
```
Open PR, tag `@0xngmi` for review. Typical merge: 2-5 business days.

---

## 2. DappRadar submission

**URL:** <https://dappradar.com/submit-dapp>

### Submission data
| Field | Value |
|-------|-------|
| Dapp name | TurboLoop |
| Short description (80 chars) | Fixed-ROI DeFi yield protocol on BSC. Audited, renounced, 1 USDT minimum. |
| Long description | TurboLoop is a decentralized yield protocol on Binance Smart Chain. Deposit USDT, choose one of four fixed-ROI Loop Plans (Sprint 7d/3%, Boost 14d/10%, Power 30d/24%, Ultimate 60d/54%), and earn daily payouts at 00:00 UTC. Revenue is generated from real on-chain activity: a USDC/USDT liquidity pool, Turbo Swap trading fees, and Turbo Buy fiat-to-crypto fees. The smart contract is independently audited, ownership has been permanently renounced (no admin keys), and 100% of LP tokens are locked on-chain. The protocol also runs a $100,000 open challenge to anyone who can prove centralization. |
| Category | DeFi → Yield |
| Sub-category | Lending / Yield aggregation |
| Chain | BSC |
| Smart contract address | (BscScan contract address) |
| Logo (256×256 minimum, PNG) | upload via DappRadar's UI |
| Banner (1200×630, PNG) | use any 1200×630 from /creatives |
| Website | https://www.turboloop.tech |
| Token (if applicable) | leave blank for now |
| Audit | upload audit PDF |

After submission DappRadar's curation team reviews in 3-7 days. They sometimes ask for a tx-volume seed (need ~10-50 unique user txs on the contract first) before approving — if rejected for "insufficient activity", wait two weeks and resubmit.

---

## 3. CoinGecko + 4. CoinMarketCap

**Deferred until token launch.** Both platforms list TOKENS, not protocols-without-tokens. If TurboLoop ever issues a governance / utility token, the application is here:
- CoinGecko: <https://www.coingecko.com/request_form>
- CoinMarketCap: <https://coinmarketcap.com/request/>

For both: contract address verified on BscScan, liquidity ≥$100K, audit PDF, doxxed team OR multisig+timelock are typical minimums.

---

## 5. de.fi (formerly DeFiYield Safety) submission

**URL:** <https://de.fi/submit-project> (yes, the actual domain)

### Submission data
Same as DefiLlama description block above. de.fi's added fields:
| Field | Value |
|-------|-------|
| Has audit? | Yes — upload PDF |
| Audit provider | (the audit firm name) |
| Ownership renounced | Yes (on-chain proof via BscScan: tx hash where owner became 0x0) |
| LP locked | Yes — link to Unicrypt (or whichever lock contract is in use) |
| Centralization risk score | Self-assess as Low. de.fi's reviewers may downgrade — that's fine, the listing itself is the win. |

de.fi additionally runs an automated security-scanner pass against the contract. Make sure the contract is verified on BscScan (source visible) before submitting.

---

## 6. BscScan — add protocol metadata

The TurboLoop contract page on BscScan can carry a website link, logo, and short description. This is a high-value backlink (BscScan has high domain authority + crypto-native traffic) and currently NOT set on most contracts.

### How
1. Go to <https://bscscan.com/contactus> (NOT the form on the contract page — that's for token-tagging only).
2. Subject: "Add website + description to verified contract"
3. Body:
```
Hello,

We'd like to add the following metadata to our verified contract:

  Contract: 0x... (TurboLoop yield protocol)
  Website: https://www.turboloop.tech
  Logo: https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png
  Short description: Decentralized fixed-ROI yield protocol on BSC. Audited, renounced, 1 USDT minimum.
  Twitter: https://x.com/TurboLoop_io
  Telegram: https://t.me/TurboLoop_Official

The contract source is already verified at the address above. Audit + LP-lock evidence available on request.

Thank you,
TurboLoop team
```
4. Submit. Response in 3-5 business days. Free.

---

## 7. GitHub README

Ensure the root README.md of the public repo contains:

```markdown
# TurboLoop Hub

The marketing + community hub for [TurboLoop](https://www.turboloop.tech) — a decentralized yield protocol on Binance Smart Chain.

🌐 Site: <https://www.turboloop.tech>
📚 Blog: <https://www.turboloop.tech/blog>
🎬 Films: <https://www.turboloop.tech/films>
🔒 Security: <https://www.turboloop.tech/security>
🧮 Calculator: <https://www.turboloop.tech/calculator>
💬 Telegram: <https://t.me/TurboLoop_Official>
🐦 X: <https://x.com/TurboLoop_io>
```

GitHub repo READMEs are crawled aggressively by Google. This is free authority.

---

## 8. Reddit — initial post drafts

Reddit is high-risk / high-reward. Bad first post = banned. Approach: lurk + comment on existing threads for 2-3 weeks BEFORE posting your own. Build karma. Then post in ONE subreddit at a time, observing rules.

### r/defi (550K members)
**Subreddit rules:** No "shilling," no referral links, factual analysis welcome.

**Draft post:**
```
Title: I broke down the 4 Loop Plans on TurboLoop with actual math (and the math behind renounced ownership)

Body:
Been digging into TurboLoop's contract design over the past few weeks. Sharing the breakdown because I see a lot of "is this a Ponzi?" questions and the actual answer requires looking at the revenue source vs the payout structure.

The 4 plans:
- Sprint Loop: 7d / 3% ROI (~0.43%/day)
- Boost Loop: 14d / 10% ROI (~0.71%/day)
- Power Loop: 30d / 24% ROI (~0.80%/day)
- Ultimate Loop: 60d / 54% ROI (~0.90%/day)

These rates are FIXED. They live in an immutable smart contract. Ownership is renounced (verifiable: owner() returns 0x0). LP is locked on-chain. Source verified on BscScan.

Revenue comes from three external sources: LP rewards on a USDC/USDT pool, Turbo Swap trading fees, Turbo Buy fiat-to-crypto fees. Not new deposits. That's the Ponzi-vs-not test.

Full security breakdown (audit links + on-chain verification steps): https://www.turboloop.tech/blog/turbo-loop-security-deep-dive
The hub: https://www.turboloop.tech (no referral link — I'm not on the team)

Happy to answer questions or point at specific tx hashes for anything contested.
```

**Posting cadence:** ONE r/defi post per month max. Comment in 10+ existing threads per week to build karma.

### r/cryptocurrency (7M members)
Stricter rules. Posts with promotional intent get auto-removed. Only post here if a major external event makes TurboLoop newsworthy (e.g., a milestone, a major audit, a hack avoided). Don't force it.

### r/BSCMoonShots (95K members)
More tolerant of BSC-specific posts. Submit:
- Once a quarter
- Include actual on-chain data (TVL trend, tx count, holder distribution)
- Avoid moonshot language ("100x soon!"). The community is jaded.

---

## 9. Telegram bios + descriptions

Every TurboLoop Telegram channel + group needs a description that links to turboloop.tech. Quick win, free, high-value (Telegram is the dominant DeFi community channel).

### Channel: @TurboLoop_Official (announcements)
```
The official TurboLoop announcement channel.

🌐 Hub: https://www.turboloop.tech
🎬 Films + tutorials: https://www.turboloop.tech/films
🔒 Audit + security: https://www.turboloop.tech/security
💬 Community chat: https://t.me/TurboLoop_Chat
```

### Group: @TurboLoop_Chat (community)
```
The TurboLoop community chat — multilingual, 80+ countries.

📚 Read first: https://www.turboloop.tech/faq
🧮 Run the numbers: https://www.turboloop.tech/calculator
🎬 Watch the films: https://www.turboloop.tech/films

Rules: be kind, no shilling unrelated projects, no DMs from "support" — official help only via this group + the channel.
```

### Per-language groups
Each regional Telegram group (German, Indonesian, Hindi, etc.) should mirror the structure above with localized copy.

---

## 10. Wikipedia stub (future)

Skip until: 12+ months of clean operation, ≥3 independent press coverage references (Cointelegraph / The Block / Decrypt / Forbes Crypto / etc.), AND clean audit history.

When eligible, draft at <https://en.wikipedia.org/wiki/Wikipedia:Articles_for_creation>. The submission must:
- Be written in neutral tone (no marketing language)
- Cite ≥5 independent secondary sources (not turboloop.tech itself)
- Avoid any "buy now" / "join us" / promotional CTAs

Wikipedia is the hardest backlink to earn but also the highest authority. A successful Wikipedia stub typically lifts SERP rank on branded queries within 2-4 weeks.

---

## Cadence summary

| Item | One-time effort | Then | Status |
|------|-----------------|------|--------|
| DefiLlama | 2-4 hrs (the adapter) | one-time | ⏳ Pending |
| DappRadar | 30 min | one-time | ⏳ Pending |
| de.fi | 20 min | one-time | ⏳ Pending |
| BscScan metadata | 15 min | one-time | ⏳ Pending |
| GitHub README | 5 min | refresh quarterly | ⏳ Pending |
| Telegram bios | 5 min × N channels | once + when copy changes | ⏳ Pending |
| Reddit posting | ongoing | monthly per sub | ⏳ Pending |
| CoinGecko / CMC | deferred (no token) | when token launches | 🚫 Blocked |
| Wikipedia | deferred (need press) | after milestones | 🚫 Blocked |

Total realistic one-time effort: **~4-6 hours of focused work**, yielding 4-7 high-authority do-follow backlinks + ~6 medium-authority ones. ROI is genuinely top-of-the-stack for SEO impact.
