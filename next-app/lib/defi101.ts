// Source of truth for /learn and /learn/:slug — beginner DeFi explainers.
// Designed to capture broad educational search traffic from non-crypto-native
// visitors and funnel them toward TurboLoop's specific value proposition.
//
// Each lesson is short (300-600 words), assumes zero crypto knowledge, and
// ends with a "Why this matters for TurboLoop" anchor that links to relevant
// hub pages.

export type Lesson = {
  slug: string;
  title: string;
  /** Browser tab title + OG title — should include "DeFi 101" for SEO grouping */
  seoTitle: string;
  emoji: string;
  /** One-sentence summary, used as OG description and on the index page */
  summary: string;
  /** Estimated read time in minutes */
  readTime: number;
  /** Difficulty: 1 = absolute beginner, 5 = intermediate */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Markdown content — sections with ## H2s */
  content: string;
  /** Where to send readers next */
  nextLessons?: string[]; // slugs
  /** TurboLoop-specific CTA at the end */
  whyItMatters: { text: string; ctaLabel: string; ctaHref: string };
};

export const LESSONS: Lesson[] = [
  {
    slug: "what-is-defi",
    title: "What is DeFi?",
    seoTitle: "What is DeFi? — DeFi 101 explained simply",
    emoji: "🌐",
    summary: "Decentralized finance, in plain English. Why your phone can replace a bank.",
    readTime: 3,
    difficulty: 1,
    content: `## The simplest possible answer

DeFi stands for **Decentralized Finance**. It means doing the things banks do — lending, borrowing, earning interest, swapping currencies — without a bank in the middle.

Instead of trusting a person, an institution, or a government, you trust **code that runs on a blockchain**. The code is public. Anyone can read it. Once it's running, no one can secretly change it.

## Why it matters

A traditional bank does three things:
- Holds your money
- Decides who can borrow it (and at what rate)
- Takes most of the profit, gives you a tiny slice

In DeFi, you skip the middleman. The code holds your money. The code matches you with borrowers or traders. The code returns the profit to you. There's no CEO. There's no quarterly earnings call. There's no "we're closed for the weekend."

## What it looks like in practice

- You connect a crypto wallet (like MetaMask) to a DeFi app
- You deposit some stablecoins (digital dollars that don't fluctuate in value)
- The app's smart contract puts your deposit to work — lending it, providing liquidity to traders, earning fees
- You earn yield, paid out continuously, that you can withdraw anytime

That's it. No application form. No credit check. No "your account is being reviewed."

## What's the catch?

Three real risks:
1. **Smart contract bugs** — bad code can lock or lose your funds. That's why audits and renounced ownership matter.
2. **Volatility** — most crypto goes up and down a lot. Stablecoins solve this for the principal you deposit, but yield can vary.
3. **You're your own bank** — lose your wallet keys, lose your money. No one can recover them for you.

These are not small risks. But they're knowable, and they're nothing like the hidden, opaque risks of the legacy banking system.`,
    nextLessons: ["what-is-a-smart-contract", "what-is-a-stablecoin"],
    whyItMatters: {
      text: "TurboLoop is one specific application of DeFi: a renounced smart contract that takes your stablecoins and earns yield from PancakeSwap V3 trading fees. No bank, no admin, no withdrawal limits. Code is law.",
      ctaLabel: "See how TurboLoop fits in",
      ctaHref: "/ecosystem",
    },
  },
  {
    slug: "what-is-a-smart-contract",
    title: "What is a smart contract?",
    seoTitle: "What is a smart contract? — DeFi 101 explained simply",
    emoji: "📜",
    summary: "It's just code that runs on a blockchain. But that code can replace lawyers, bankers, and middlemen.",
    readTime: 4,
    difficulty: 1,
    content: `## A vending machine that handles money

The simplest way to think about a smart contract: imagine a vending machine.

You put in $2. You press B4. The machine gives you a Snickers. Nobody's behind the curtain deciding whether you deserve the candy. The rule was set in advance — money in, candy out. Every time.

A **smart contract** is the same idea, applied to financial transactions. It's a program that lives on a blockchain (a kind of public, tamper-proof database). When the conditions you defined are met, it automatically does what it's programmed to do.

## Why this is a big deal

Today, almost everything financial requires trust in a third party:
- A bank holds your money — you trust them not to misuse it
- A lawyer drafts contracts — you trust their interpretation
- A broker executes trades — you trust them not to front-run you

A smart contract removes that trust requirement. Once deployed, the code does exactly what it says. No discretion. No CEO call. No "we'll need to review this case-by-case."

## The "renounced" superpower

Most apps have a CEO who can update the code, freeze accounts, or change the rules. A **renounced smart contract** is one where the deployer has thrown away the keys. Even *they* can't change it now.

This sounds risky — what if there's a bug? — but it's also the highest possible guarantee that the rules can never change against you. The code you read today is the code that will run forever.

## How to verify a smart contract is real

You don't have to trust anyone. You can verify yourself:
1. Look up the contract address on a blockchain explorer (e.g. BscScan for Binance Smart Chain)
2. Confirm the source code is "Verified" (matches the public code claim)
3. Check the ownership status — is it renounced? (look for the OwnershipTransferred event with address 0x000...)
4. Audit reports — has it been reviewed by an independent firm?

This is what people mean by "don't trust, verify."`,
    nextLessons: ["what-is-yield-farming", "how-to-verify-on-bscscan"],
    whyItMatters: {
      text: "TurboLoop's smart contract is renounced — the developers literally cannot change the code or freeze your funds. You can verify this yourself on BscScan.",
      ctaLabel: "See the security pillars",
      ctaHref: "/security",
    },
  },
  {
    slug: "what-is-a-stablecoin",
    title: "What is a stablecoin?",
    seoTitle: "What is a stablecoin? — DeFi 101 explained simply",
    emoji: "💵",
    summary: "Crypto pegged to the US dollar. The boring, useful foundation of DeFi.",
    readTime: 3,
    difficulty: 1,
    content: `## The dollar, on a blockchain

A stablecoin is a cryptocurrency designed to **always be worth $1**. While Bitcoin and Ethereum bounce around in price, a stablecoin like USDT or USDC stays pegged to the dollar — give or take a few cents.

How? Each stablecoin is backed (in theory) by a real dollar held in reserve. Issue $1 of USDT, hold $1 of USD in a bank. The peg holds because anyone can redeem 1 USDT for 1 USD at any time.

## Why this matters for DeFi

Crypto is volatile. Bitcoin can drop 30% in a week. That's exciting if you're trading, but useless if you want to:
- Earn predictable yield
- Lend money without watching the price tick
- Send remittances internationally
- Just... save

Stablecoins solve this. They give you the **infrastructure** of crypto (instant transfers, smart contracts, 24/7 access, no banks) without the **volatility** of crypto.

When a DeFi yield protocol says "deposit USDT and earn 12% APY," your **principal stays at $1 per token**. You're earning yield on top of a stable base. No surprises.

## The most-used stablecoins

- **USDT (Tether)** — biggest, oldest, most widely accepted
- **USDC (USD Coin)** — issued by Circle, generally seen as more transparent
- **BUSD (Binance USD)** — Binance's stablecoin, popular on BNB Chain
- **DAI** — fully decentralized, backed by crypto collateral instead of bank dollars

For TurboLoop, USDT is the primary asset.

## What can go wrong?

Stablecoins are *generally* very safe, but the peg can break:
- 2022: Terra USD (UST) collapsed entirely — but it wasn't backed by dollars, only by an algorithm
- 2023: USDC briefly dropped to $0.87 when Silicon Valley Bank failed (bounced back within 48 hours)

Lessons: stick to **fiat-backed** stablecoins (USDT, USDC) and avoid algorithmic ones for serious savings.`,
    nextLessons: ["what-is-yield-farming", "what-is-defi"],
    whyItMatters: {
      text: "TurboLoop operates exclusively on stablecoins. Your principal stays at $1 per token. The 54% target yield is calculated on top of that stable base — not on a volatile crypto rollercoaster.",
      ctaLabel: "See the math",
      ctaHref: "/films/54-percent-real-math",
    },
  },
  {
    slug: "what-is-yield-farming",
    title: "What is yield farming?",
    seoTitle: "What is yield farming? — DeFi 101 explained simply",
    emoji: "🌾",
    summary: "Earning rewards by putting your crypto to work. The simple version, with the catches.",
    readTime: 4,
    difficulty: 2,
    content: `## The two-sentence version

Yield farming = lending or providing liquidity in DeFi protocols, in exchange for rewards. Think of it as putting your savings to work in code-mediated investments instead of letting them sit in a bank account at 0.01%.

## How it actually works

There are roughly four ways to earn yield in DeFi:

**1. Lending**
You deposit a token. Borrowers pay interest to use it. You earn a slice of that interest. Simple and well-understood — Aave and Compound pioneered this model.

**2. Liquidity providing (LP)**
You put two tokens into a "pool" that lets others trade between them. Every trade pays a small fee, and that fee is shared with you (the LP). PancakeSwap and Uniswap work this way.

**3. Staking**
You lock your tokens to help secure a blockchain (Proof of Stake networks). The network pays you rewards. Examples: ETH staking on Ethereum, BNB staking on BNB Chain.

**4. Yield aggregators**
A smart contract automatically moves your funds between the highest-yielding strategies, harvesting and re-depositing rewards. Yearn Finance pioneered this.

## What does APY actually mean?

APY = Annual Percentage Yield. It tells you how much you'd earn in a year if the current rate held constant.

Be skeptical of huge APYs:
- 5-15% on stablecoins from blue-chip lending = sustainable
- 50%+ requires a real revenue source (high trading volume, scarce liquidity, etc.) — possible but verify the source
- 1000%+ on a brand-new token = ponzi-shaped, almost always

## The risks nobody mentions

- **Impermanent loss** — for two-token LP positions, you can lose value vs just holding the tokens. Doesn't apply to stablecoin-only pools.
- **Smart contract risk** — the code can be exploited. Always check audits and renouncement status.
- **APY decay** — high yields attract competitors. The 50% APY today might be 10% in 6 months.
- **Token volatility** — if you're farming a volatile token's price drop can wipe out your earnings.

## How to evaluate any yield source

Three questions, every time:
1. **Where does the yield actually come from?** Real fees? Token inflation? New deposits? (The last one is a red flag.)
2. **Is the smart contract verified and renounced?** Verify on a block explorer.
3. **What happens if no new users join tomorrow?** If the yield depends on growth, it's unsustainable.`,
    nextLessons: ["what-is-a-stablecoin", "what-is-a-smart-contract"],
    whyItMatters: {
      text: "TurboLoop's yield comes from PancakeSwap V3 trading fees — real revenue from real trades. If no new TurboLoop users join tomorrow, existing positions still earn. That's the difference between revenue-backed yield and recruitment-dependent yield.",
      ctaLabel: "Watch: Ponzi vs Real Yield",
      ctaHref: "/films/myth-buster-ponzi",
    },
  },
  {
    slug: "how-to-verify-on-bscscan",
    title: "How to verify a TurboLoop transaction on BscScan",
    seoTitle: "How to verify a TurboLoop transaction on BscScan — DeFi 101",
    emoji: "🔍",
    summary: "Step-by-step: prove every claim TurboLoop makes, on the public blockchain.",
    readTime: 5,
    difficulty: 2,
    content: `## Why this matters

DeFi's superpower is **verifiability**. Every claim a DeFi protocol makes — about deposits, withdrawals, yield rates, contract ownership — can be checked by anyone, with no special access. You don't need permission. You don't need an account. You just need a block explorer.

For BNB Smart Chain, the explorer is **BscScan** (bscscan.com). Free, public, no signup required.

## What you can verify

- Contract source code matches what's claimed
- Ownership status (renounced or not)
- Every deposit, every withdrawal, every yield distribution
- Total value locked in the contract
- Audit log of every interaction since deployment

## Step-by-step: verify a transaction

Let's say you just deposited 100 USDT into TurboLoop. You want to confirm it actually went where you think it went.

1. **Get your transaction hash** — your wallet (MetaMask, Trust Wallet, etc) shows it after the transaction
2. **Open BscScan** — go to bscscan.com
3. **Paste the hash** in the search bar at the top, hit Enter
4. **Read the result** — you'll see:
   - Status: Success / Failed
   - From: your wallet address
   - To: the TurboLoop contract address
   - Value: the amount of USDT transferred
   - Token Transfers: shows the USDT moved from you to the contract

That's it. The blockchain confirms what happened, with no human in the loop.

## Step-by-step: verify the contract is renounced

1. Open the TurboLoop contract page on BscScan
2. Click the "Contract" tab
3. Look for the "Read Contract" sub-tab — find the \`owner()\` function, click it
4. If it returns \`0x0000000000000000000000000000000000000000\` — the contract is **renounced**
5. Confirm with the OwnershipTransferred event in the contract's history

A renounced contract means even the developers can't change the code or freeze funds. The rules are locked.

## Step-by-step: verify total value locked

1. Open the TurboLoop contract page
2. Look at the "Holdings" or "Token" sections — shows the USDT balance held by the contract
3. Compare to publicly stated TVL — they should match

## What if something doesn't match?

If a project's claims don't match BscScan, that's a red flag. Walk away. Real projects welcome verification. Sketchy ones make verification hard.

That's why TurboLoop publishes its contract address publicly — verification is the whole point.`,
    nextLessons: ["what-is-a-smart-contract", "what-is-yield-farming"],
    whyItMatters: {
      text: "TurboLoop's contract is verified, renounced, and every line of activity lives on BscScan. Don't trust us — go verify.",
      ctaLabel: "Watch: Code is Law",
      ctaHref: "/films/code-is-law",
    },
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}
