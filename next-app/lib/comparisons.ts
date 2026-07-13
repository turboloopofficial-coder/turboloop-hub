// Comparison content for /vs/[slug] pages.
// Each entry feeds a head-to-head row table + narrative summary.

export type ComparisonRow = {
  metric: string;
  turboloop: string;
  competitor: string;
  /** Which side wins (which gets the green checkmark). "tie" hides both. */
  winner: "turboloop" | "competitor" | "tie";
};

export type Comparison = {
  slug: string;
  competitorName: string;
  /** SEO title (short — appears in search) */
  seoTitle: string;
  /** Headline on the page */
  heading: string;
  /** Short description used in OG + meta description */
  summary: string;
  /** Long-form intro paragraph */
  intro: string;
  rows: ComparisonRow[];
  /** Closing argument */
  closing: string;
};

export const COMPARISONS: Comparison[] = [
  // ── Existing entries ────────────────────────────────────────────────────
  {
    slug: "banks",
    competitorName: "Traditional Banks",
    seoTitle: "TurboLoop vs Banks — Where Your Money Actually Goes",
    heading: "TurboLoop vs traditional banks.",
    summary:
      "Side-by-side: yield, transparency, control, hours. The bank wins exactly nothing — and we'll show you the math.",
    intro:
      "Your bank lends out your deposit at 15-30% and pays you 0.01%. TurboLoop pools the same dollars into PancakeSwap V3 liquidity and returns virtually 100% of the trading-fee yield to you. Same dollars, ~5,400× the share. Here's the head-to-head.",
    rows: [
      {
        metric: "Annual yield on stablecoins",
        turboloop: "Up to 54% APY (PancakeSwap V3 fees)",
        competitor: "0.01% – 4% (savings account / CD)",
        winner: "turboloop",
      },
      {
        metric: "Hours of operation",
        turboloop: "24/7/365 — never closes",
        competitor: "8 hr/day, closed weekends + holidays",
        winner: "turboloop",
      },
      {
        metric: "Transfer settlement",
        turboloop: "3-5 seconds (on-chain)",
        competitor: "1-5 business days",
        winner: "turboloop",
      },
      {
        metric: "Who can freeze your funds",
        turboloop: "Nobody — ownership renounced on-chain",
        competitor: "The bank, courts, government, sanctions",
        winner: "turboloop",
      },
      {
        metric: "Where your deposit physically lives",
        turboloop: "On-chain LP, verifiable on BscScan",
        competitor: "Bank's general ledger, lent out 10× via fractional reserve",
        winner: "turboloop",
      },
      {
        metric: "Minimum deposit",
        turboloop: "$50 USDT",
        competitor: "$1 (but no real yield until $10K+)",
        winner: "turboloop",
      },
      {
        metric: "FDIC / deposit insurance",
        turboloop: "No — relies on smart-contract security + audit + LP lock",
        competitor: "Yes — up to $250K per account in the US",
        winner: "competitor",
      },
      {
        metric: "Customer support phone line",
        turboloop: "Telegram community + presenters",
        competitor: "Phone + branch + chat",
        winner: "competitor",
      },
      {
        metric: "Inflation protection",
        turboloop: "54% > 5% inflation = real wealth growth",
        competitor: "0.01% << 5% inflation = silent loss",
        winner: "turboloop",
      },
    ],
    closing:
      "The bank wins on insurance + phone support — both real. Everything else, TurboLoop. If your reserve fund needs to sit FDIC-insured, keep that piece in the bank. For the part you actually want to grow, the math is one-sided.",
  },
  {
    slug: "defi",
    competitorName: "Other DeFi Yield Protocols",
    seoTitle: "TurboLoop vs Other DeFi — Why Audits + Renouncement Matter",
    heading: "TurboLoop vs other DeFi yield.",
    summary:
      "Why we removed every backdoor most DeFi protocols still keep, and what that means for your risk.",
    intro:
      "DeFi yield comes in three risk tiers: anonymous-team rugs, audited-but-upgradable contracts, and immutably-locked code. TurboLoop is the third tier. Most competitors stop at the second. Here's why the difference matters.",
    rows: [
      {
        metric: "Smart contract upgradability",
        turboloop: "Renounced — code is final",
        competitor: "Usually upgradable via proxy admin keys",
        winner: "turboloop",
      },
      {
        metric: "LP rug-pull mechanism",
        turboloop: "100% locked on-chain (verifiable on BscScan)",
        competitor: "Variable — many keep team withdrawal access",
        winner: "turboloop",
      },
      {
        metric: "Independent audit",
        turboloop: "Haze Crypto, public report",
        competitor: "Half audit, half don't",
        winner: "turboloop",
      },
      {
        metric: "Source verification on explorer",
        turboloop: "Verified on BscScan",
        competitor: "Common but not universal",
        winner: "tie",
      },
      {
        metric: "Yield source",
        turboloop: "PancakeSwap V3 trading fees (real revenue)",
        competitor: "Mix: fees, token emissions (inflationary), or new deposits",
        winner: "turboloop",
      },
      {
        metric: "Bug bounty",
        turboloop: "$100,000 open, no NDA",
        competitor: "Sometimes; sizes vary",
        winner: "turboloop",
      },
      {
        metric: "Withdrawal lockups",
        turboloop: "Plan-based (7/30/60/90 days)",
        competitor: "0-365 days, varies wildly",
        winner: "tie",
      },
    ],
    closing:
      "The differentiator isn't yield — many protocols target high APY. The differentiator is what happens when the team disappears. With renounced ownership and locked LP, TurboLoop keeps running with or without us. That's the bar.",
  },
  {
    slug: "inflation",
    competitorName: "Inflation",
    seoTitle: "TurboLoop vs Inflation — How to Outpace the Invisible Tax",
    heading: "TurboLoop vs inflation.",
    summary:
      "Your savings account is losing 4-7% per year to inflation. Here's the math on how TurboLoop's yield outpaces it.",
    intro:
      "Inflation is the silent thief. If you keep $10,000 in a 0.5% savings account while inflation runs 5%, you lose 4.5% of your wealth every year — not in dollars, but in what those dollars buy. TurboLoop's yield is the shield.",
    rows: [
      {
        metric: "Year-1 nominal balance ($10K start)",
        turboloop: "$15,400 (54% APY compounded)",
        competitor: "$10,050 (0.5% savings)",
        winner: "turboloop",
      },
      {
        metric: "Year-1 real (inflation-adjusted) balance",
        turboloop: "$14,667 (5% inflation)",
        competitor: "$9,571 (5% inflation)",
        winner: "turboloop",
      },
      {
        metric: "Year-3 nominal balance",
        turboloop: "$36,520",
        competitor: "$10,151",
        winner: "turboloop",
      },
      {
        metric: "Year-3 real balance",
        turboloop: "$31,548",
        competitor: "$8,769",
        winner: "turboloop",
      },
      {
        metric: "What you can buy in year 5",
        turboloop: "5.4× more than today",
        competitor: "27% less than today",
        winner: "turboloop",
      },
    ],
    closing:
      "Doing nothing isn't safe — it's a guaranteed loss to inflation. Even a 10% allocation into TurboLoop yield, with the rest in a savings account, beats 100% in savings every realistic year. Run your own numbers in our calculator.",
  },

  // ── New entries ─────────────────────────────────────────────────────────

  {
    slug: "pancakeswap",
    competitorName: "PancakeSwap",
    seoTitle: "TurboLoop vs PancakeSwap — Passive Income vs Active Farming",
    heading: "TurboLoop vs PancakeSwap.",
    summary:
      "PancakeSwap is the DEX TurboLoop earns from. But using it directly means active management, impermanent loss, and no fixed return. Here's the difference.",
    intro:
      "TurboLoop is built on top of PancakeSwap V3 — it uses PancakeSwap's liquidity pools as its yield engine. But there's a critical difference between providing liquidity directly on PancakeSwap and depositing into TurboLoop. One requires active management, exposes you to impermanent loss, and pays variable fees. The other gives you a fixed-term plan, a predictable return, and zero active management. Here's the full breakdown.",
    rows: [
      {
        metric: "Yield type",
        turboloop: "Fixed-term plans: 3%, 10%, 24%, 54% per cycle",
        competitor: "Variable trading fees — changes daily with volume",
        winner: "turboloop",
      },
      {
        metric: "Impermanent loss exposure",
        turboloop: "None — you deposit USDT, you withdraw USDT",
        competitor: "Yes — price divergence between paired assets reduces your position",
        winner: "turboloop",
      },
      {
        metric: "Active management required",
        turboloop: "Zero — deposit once, collect at maturity",
        competitor: "Yes — must rebalance tick ranges in V3 to stay in range",
        winner: "turboloop",
      },
      {
        metric: "Minimum deposit",
        turboloop: "$50 USDT",
        competitor: "No minimum, but gas + rebalancing cost makes small positions uneconomic",
        winner: "turboloop",
      },
      {
        metric: "Smart contract audit",
        turboloop: "Haze Crypto audit, public report",
        competitor: "Multiple audits (CertiK, PeckShield) — well-established",
        winner: "competitor",
      },
      {
        metric: "Referral / affiliate income",
        turboloop: "20-level referral system, up to 51% total commissions",
        competitor: "None",
        winner: "turboloop",
      },
      {
        metric: "Token buyback mechanism",
        turboloop: "Daily $TURBO buyback from protocol fees",
        competitor: "CAKE buyback via revenue share — established but diluted by emissions",
        winner: "tie",
      },
      {
        metric: "Chain",
        turboloop: "BNB Smart Chain (BSC)",
        competitor: "BSC, Ethereum, Aptos, zkSync, Arbitrum, Base",
        winner: "competitor",
      },
      {
        metric: "Ownership renounced",
        turboloop: "Yes — contract is immutable",
        competitor: "No — upgradable proxy contracts, team retains admin keys",
        winner: "turboloop",
      },
      {
        metric: "Who it's for",
        turboloop: "Passive income seekers — set and forget",
        competitor: "Active DeFi users comfortable with LP management",
        winner: "tie",
      },
    ],
    closing:
      "PancakeSwap is the infrastructure TurboLoop earns from — it's not a competitor in the traditional sense. If you want to actively manage liquidity positions and are comfortable with impermanent loss, PancakeSwap directly is powerful. If you want fixed-term passive income with zero management, TurboLoop is the wrapper that makes PancakeSwap's yield accessible to everyone.",
  },

  {
    slug: "aave",
    competitorName: "Aave",
    seoTitle: "TurboLoop vs Aave — Fixed Passive Income vs Variable Lending Rates",
    heading: "TurboLoop vs Aave.",
    summary:
      "Aave is the gold standard of DeFi lending. TurboLoop is a fixed-term yield protocol. Different tools for different goals — here's the honest comparison.",
    intro:
      "Aave is one of the most trusted DeFi protocols in existence — billions in TVL, multiple audits, and a battle-tested track record since 2017. TurboLoop is a newer, smaller protocol with a different model: fixed-term plans, a referral network, and a single-chain focus on BSC. This comparison is honest about both sides.",
    rows: [
      {
        metric: "Yield type",
        turboloop: "Fixed-term: 3%, 10%, 24%, 54% per cycle (predictable)",
        competitor: "Variable supply APY — changes with utilisation rate (currently 3-8% on USDC/USDT)",
        winner: "turboloop",
      },
      {
        metric: "Yield source",
        turboloop: "PancakeSwap V3 LP trading fees",
        competitor: "Borrower interest payments",
        winner: "tie",
      },
      {
        metric: "TVL / track record",
        turboloop: "Newer protocol, smaller TVL",
        competitor: "$10B+ TVL, 7+ years live, zero major exploits",
        winner: "competitor",
      },
      {
        metric: "Smart contract risk",
        turboloop: "Audited (Haze Crypto), ownership renounced, LP locked",
        competitor: "Extensively audited, upgradable governance — mature but complex",
        winner: "tie",
      },
      {
        metric: "Chains supported",
        turboloop: "BSC only",
        competitor: "Ethereum, Polygon, Avalanche, Arbitrum, Optimism, Base, and more",
        winner: "competitor",
      },
      {
        metric: "Minimum deposit",
        turboloop: "$50 USDT",
        competitor: "No minimum (but gas on Ethereum makes small deposits expensive)",
        winner: "tie",
      },
      {
        metric: "Withdrawal flexibility",
        turboloop: "Locked until plan maturity (7/30/60/90 days)",
        competitor: "Instant withdrawal anytime (subject to liquidity)",
        winner: "competitor",
      },
      {
        metric: "Referral income",
        turboloop: "20-level referral system — earn on your network",
        competitor: "None",
        winner: "turboloop",
      },
      {
        metric: "Maximum yield potential",
        turboloop: "54% per 60-day cycle (Ultimate plan)",
        competitor: "3-8% APY on stablecoins (variable)",
        winner: "turboloop",
      },
      {
        metric: "Governance token",
        turboloop: "$TURBO — daily buyback from protocol fees",
        competitor: "$AAVE — governance + safety module staking",
        winner: "tie",
      },
    ],
    closing:
      "Aave wins on trust, chain diversity, and withdrawal flexibility. TurboLoop wins on yield ceiling and referral income. They serve different risk profiles: Aave is the conservative, liquid option; TurboLoop is the higher-yield, fixed-term option for capital you can lock for a cycle. Many serious DeFi users hold both.",
  },

  {
    slug: "compound",
    competitorName: "Compound Finance",
    seoTitle: "TurboLoop vs Compound Finance — BSC Yield vs Ethereum Lending",
    heading: "TurboLoop vs Compound Finance.",
    summary:
      "Compound pioneered DeFi lending on Ethereum. TurboLoop brings fixed-term yield to BSC. Here's how they stack up for passive income.",
    intro:
      "Compound Finance invented the concept of algorithmic interest rates in DeFi — it's the protocol that launched the yield farming era in 2020. Today it's a mature, conservative protocol with modest but reliable yields on Ethereum. TurboLoop takes a different approach: fixed-term plans, a BSC focus, and a referral network designed for community growth. Here's the honest comparison.",
    rows: [
      {
        metric: "Current stablecoin APY",
        turboloop: "3% – 54% depending on plan and cycle length",
        competitor: "2-5% on USDC/USDT (variable, algorithmic)",
        winner: "turboloop",
      },
      {
        metric: "Yield predictability",
        turboloop: "Fixed at deposit — you know exactly what you'll earn",
        competitor: "Variable — rate changes every block with supply/demand",
        winner: "turboloop",
      },
      {
        metric: "Protocol age / track record",
        turboloop: "Newer protocol",
        competitor: "Live since 2018 — one of the oldest DeFi protocols",
        winner: "competitor",
      },
      {
        metric: "TVL",
        turboloop: "Smaller, growing",
        competitor: "$2B+ TVL across markets",
        winner: "competitor",
      },
      {
        metric: "Chain",
        turboloop: "BSC — fast, cheap transactions",
        competitor: "Ethereum mainnet — higher gas costs",
        winner: "turboloop",
      },
      {
        metric: "Transaction fees",
        turboloop: "BSC: $0.05-0.20 per tx",
        competitor: "Ethereum: $5-50+ per tx depending on gas",
        winner: "turboloop",
      },
      {
        metric: "Withdrawal",
        turboloop: "At plan maturity (7/30/60/90 days)",
        competitor: "Instant — supply and withdraw any time",
        winner: "competitor",
      },
      {
        metric: "Referral / community income",
        turboloop: "20-level referral system, 51% total commissions",
        competitor: "None",
        winner: "turboloop",
      },
      {
        metric: "Governance",
        turboloop: "$TURBO — daily buyback from fees",
        competitor: "$COMP — governance token, distributed to suppliers/borrowers",
        winner: "tie",
      },
      {
        metric: "Minimum deposit",
        turboloop: "$50 USDT",
        competitor: "No minimum (but Ethereum gas makes <$500 deposits uneconomic)",
        winner: "turboloop",
      },
    ],
    closing:
      "Compound is the safer, more liquid choice with a 6-year track record. TurboLoop offers higher yields, lower transaction costs, and a referral income layer that Compound doesn't have. If you're on Ethereum and want conservative, liquid yield, Compound is solid. If you're on BSC and want fixed-term passive income with a community multiplier, TurboLoop is built for you.",
  },

  {
    slug: "venus",
    competitorName: "Venus Protocol",
    seoTitle: "TurboLoop vs Venus Protocol — BSC Yield Comparison",
    heading: "TurboLoop vs Venus Protocol.",
    summary:
      "Both protocols live on BSC. Venus is a lending market. TurboLoop is a fixed-term yield protocol. Here's the head-to-head for BSC passive income.",
    intro:
      "Venus Protocol is the largest lending market on BNB Smart Chain — it lets you supply assets to earn interest and borrow against your collateral. TurboLoop is a different type of protocol: no lending, no borrowing, just fixed-term yield from PancakeSwap V3 liquidity fees. Both live on BSC, both target passive income. Here's how they compare.",
    rows: [
      {
        metric: "Protocol type",
        turboloop: "Fixed-term yield protocol (LP fees)",
        competitor: "Lending market (supply/borrow)",
        winner: "tie",
      },
      {
        metric: "Stablecoin supply APY",
        turboloop: "3% – 54% (fixed per plan)",
        competitor: "2-8% on USDT/USDC (variable, utilisation-based)",
        winner: "turboloop",
      },
      {
        metric: "Liquidation risk",
        turboloop: "None — you're not borrowing against collateral",
        competitor: "Yes — if you borrow and collateral drops, you get liquidated",
        winner: "turboloop",
      },
      {
        metric: "Smart contract audit",
        turboloop: "Haze Crypto, ownership renounced",
        competitor: "Multiple audits, but Venus had a $200M exploit in 2021 (BNB oracle manipulation)",
        winner: "turboloop",
      },
      {
        metric: "Yield predictability",
        turboloop: "Fixed at deposit",
        competitor: "Variable — changes with market utilisation",
        winner: "turboloop",
      },
      {
        metric: "Withdrawal",
        turboloop: "At plan maturity",
        competitor: "Instant (subject to pool liquidity)",
        winner: "competitor",
      },
      {
        metric: "Referral income",
        turboloop: "20-level referral system",
        competitor: "None",
        winner: "turboloop",
      },
      {
        metric: "Token buyback",
        turboloop: "Daily $TURBO buyback from protocol fees",
        competitor: "$XVS — distributed as supply/borrow incentives, inflationary",
        winner: "turboloop",
      },
      {
        metric: "Minimum deposit",
        turboloop: "$50 USDT",
        competitor: "No minimum",
        winner: "tie",
      },
      {
        metric: "Complexity",
        turboloop: "Simple: deposit USDT, choose plan, collect at maturity",
        competitor: "More complex: supply, borrow, manage collateral ratio, avoid liquidation",
        winner: "turboloop",
      },
    ],
    closing:
      "Venus is a powerful lending market for users who want to borrow against their crypto holdings. TurboLoop is for users who want passive income without the complexity of collateral management or liquidation risk. If you just want to earn on your USDT without touching leverage, TurboLoop is the simpler, higher-ceiling option on BSC.",
  },

  {
    slug: "staking",
    competitorName: "Crypto Staking (ETH/BNB)",
    seoTitle: "TurboLoop vs Crypto Staking — Which Earns More Passive Income?",
    heading: "TurboLoop vs crypto staking.",
    summary:
      "Staking ETH or BNB earns 3-5% APY in the native token. TurboLoop earns up to 54% in stablecoins. Here's the full comparison.",
    intro:
      "Staking is the most popular form of passive income in crypto — lock your ETH or BNB, help secure the network, earn ~3-5% per year in the same token. It's simple, relatively safe, and widely available. TurboLoop takes a different approach: stablecoin deposits, fixed-term plans, and yield from real trading fees rather than token issuance. Here's how the two models compare.",
    rows: [
      {
        metric: "Maximum annual yield",
        turboloop: "Up to 54% per 60-day cycle (stablecoins)",
        competitor: "3-5% APY on ETH; 2-4% APY on BNB",
        winner: "turboloop",
      },
      {
        metric: "Currency risk",
        turboloop: "None — deposit USDT, earn USDT",
        competitor: "Yes — if ETH/BNB price drops 30%, your 4% yield is wiped out",
        winner: "turboloop",
      },
      {
        metric: "Yield source",
        turboloop: "PancakeSwap V3 trading fees (real revenue)",
        competitor: "New token issuance (inflationary) + transaction fees",
        winner: "turboloop",
      },
      {
        metric: "Lock-up period",
        turboloop: "7, 30, 60, or 90 days (your choice)",
        competitor: "ETH: ~27 days withdrawal queue; BNB: 7 days",
        winner: "tie",
      },
      {
        metric: "Network security contribution",
        turboloop: "None — you're providing LP liquidity, not validating",
        competitor: "Yes — stakers secure the proof-of-stake network",
        winner: "competitor",
      },
      {
        metric: "Minimum deposit",
        turboloop: "$50 USDT",
        competitor: "ETH: 32 ETH (~$80K) to solo stake; liquid staking from $1",
        winner: "turboloop",
      },
      {
        metric: "Referral income",
        turboloop: "20-level referral system — earn on your network",
        competitor: "None",
        winner: "turboloop",
      },
      {
        metric: "Smart contract risk",
        turboloop: "Audited, renounced, LP locked",
        competitor: "Liquid staking (Lido, Rocket Pool): audited but complex multi-contract systems",
        winner: "tie",
      },
      {
        metric: "Slashing risk",
        turboloop: "None",
        competitor: "Yes — validator misbehaviour can slash your stake (rare but real)",
        winner: "turboloop",
      },
      {
        metric: "Tax treatment (general)",
        turboloop: "Yield typically treated as income at receipt",
        competitor: "Staking rewards typically treated as income at receipt",
        winner: "tie",
      },
    ],
    closing:
      "Staking is a great way to earn on assets you already hold and believe in long-term. But if ETH drops 20%, your 4% staking yield is irrelevant. TurboLoop earns in stablecoins — the yield is the yield, regardless of market conditions. For capital you want to protect and grow in real terms, TurboLoop's stablecoin yield model is structurally superior to token-denominated staking.",
  },

  {
    slug: "p2p-lending",
    competitorName: "P2P Crypto Lending (Nexo, Celsius, BlockFi)",
    seoTitle: "TurboLoop vs Crypto Lending Platforms — On-Chain vs Custodial Yield",
    heading: "TurboLoop vs crypto lending platforms.",
    summary:
      "Nexo, Celsius, and BlockFi promised high yields on crypto deposits. Two went bankrupt. Here's why on-chain transparency changes everything.",
    intro:
      "Celsius Network collapsed in 2022 with $4.7B in user funds frozen. BlockFi filed for bankruptcy months later. Nexo survived but faced regulatory pressure in multiple jurisdictions. All three promised high yields on crypto deposits — and all three operated as black boxes where user funds were lent to third parties with no on-chain visibility. TurboLoop is the opposite: every dollar is traceable on BscScan, the LP is locked, and ownership is renounced. Here's the comparison.",
    rows: [
      {
        metric: "Where your funds actually go",
        turboloop: "On-chain PancakeSwap V3 LP — verifiable on BscScan in real time",
        competitor: "Off-chain lending to institutions, hedge funds, and retail borrowers — opaque",
        winner: "turboloop",
      },
      {
        metric: "Custody",
        turboloop: "Non-custodial — smart contract holds funds, not a company",
        competitor: "Custodial — the company holds your funds",
        winner: "turboloop",
      },
      {
        metric: "Bankruptcy risk",
        turboloop: "None — no company holds your funds; contract runs autonomously",
        competitor: "Real — Celsius and BlockFi both went bankrupt, users lost funds",
        winner: "turboloop",
      },
      {
        metric: "Yield on stablecoins",
        turboloop: "3% – 54% per cycle (fixed, on-chain)",
        competitor: "Was 8-18% (now 3-10% post-collapse, heavily restricted by jurisdiction)",
        winner: "turboloop",
      },
      {
        metric: "Regulatory risk",
        turboloop: "Smart contract operates autonomously — no centralised entity to shut down",
        competitor: "High — BlockFi fined $100M by SEC; Nexo exited US market",
        winner: "turboloop",
      },
      {
        metric: "Withdrawal",
        turboloop: "At plan maturity (7/30/60/90 days)",
        competitor: "Varies — Celsius froze withdrawals entirely before collapse",
        winner: "tie",
      },
      {
        metric: "Transparency",
        turboloop: "100% on-chain — every transaction visible on BscScan",
        competitor: "Quarterly reports at best; no real-time on-chain visibility",
        winner: "turboloop",
      },
      {
        metric: "Referral income",
        turboloop: "20-level referral system, 51% total commissions",
        competitor: "Basic referral bonuses (1-2 levels)",
        winner: "turboloop",
      },
      {
        metric: "Insurance / FDIC",
        turboloop: "No government insurance",
        competitor: "No FDIC — some offered private insurance (which also failed)",
        winner: "tie",
      },
      {
        metric: "Minimum deposit",
        turboloop: "$50 USDT",
        competitor: "Typically $0 minimum",
        winner: "competitor",
      },
    ],
    closing:
      "The Celsius and BlockFi collapses were a watershed moment for crypto yield: custodial, opaque platforms are structurally dangerous regardless of their yield promises. TurboLoop's on-chain model — where every dollar is traceable and no company can freeze your funds — is the direct answer to that failure. The lesson from 2022 is simple: if you can't verify it on-chain, you don't own it.",
  },

  {
    slug: "alpaca",
    competitorName: "Alpaca Finance",
    seoTitle: "TurboLoop vs Alpaca Finance — BSC Yield Farming Comparison",
    heading: "TurboLoop vs Alpaca Finance.",
    summary:
      "Alpaca Finance is BSC's leading leveraged yield farming protocol. TurboLoop is a fixed-term passive income protocol. Different risk profiles, different users.",
    intro:
      "Alpaca Finance is one of BSC's most sophisticated DeFi protocols — it lets you lend assets to yield farmers who use leverage to amplify their returns. The lenders earn interest; the farmers earn amplified yield but take on liquidation risk. TurboLoop is a simpler model: fixed-term plans, stablecoin deposits, no leverage, no liquidation risk. Here's the honest comparison for BSC passive income.",
    rows: [
      {
        metric: "Yield model",
        turboloop: "Fixed-term plans: 3%, 10%, 24%, 54% per cycle",
        competitor: "Variable lending APY (3-15%) + ALPACA token rewards",
        winner: "turboloop",
      },
      {
        metric: "Leverage / liquidation risk",
        turboloop: "None — no leverage, no liquidation",
        competitor: "Lenders are safe; borrowers face liquidation risk",
        winner: "turboloop",
      },
      {
        metric: "Complexity",
        turboloop: "Simple: deposit USDT, choose plan, collect at maturity",
        competitor: "Complex: multiple vault strategies, leveraged positions, rebalancing",
        winner: "turboloop",
      },
      {
        metric: "Smart contract audit",
        turboloop: "Haze Crypto, ownership renounced",
        competitor: "Multiple audits (PeckShield, Inspex) — well-audited for BSC",
        winner: "tie",
      },
      {
        metric: "Token emissions",
        turboloop: "$TURBO — deflationary (daily buyback + burn)",
        competitor: "$ALPACA — inflationary emissions as farming rewards",
        winner: "turboloop",
      },
      {
        metric: "Referral income",
        turboloop: "20-level referral system, 51% total commissions",
        competitor: "None",
        winner: "turboloop",
      },
      {
        metric: "Withdrawal",
        turboloop: "At plan maturity (7/30/60/90 days)",
        competitor: "Instant for lenders (subject to utilisation)",
        winner: "competitor",
      },
      {
        metric: "Stablecoin focus",
        turboloop: "Yes — USDT deposits, USDT returns",
        competitor: "Supports BNB, ETH, stablecoins — more asset variety",
        winner: "competitor",
      },
      {
        metric: "Minimum deposit",
        turboloop: "$50 USDT",
        competitor: "No minimum",
        winner: "tie",
      },
      {
        metric: "Who it's for",
        turboloop: "Passive income seekers — no DeFi experience required",
        competitor: "Experienced DeFi users comfortable with leveraged strategies",
        winner: "tie",
      },
    ],
    closing:
      "Alpaca Finance is a sophisticated protocol for experienced DeFi users who want to maximise yield through leverage. TurboLoop is for anyone who wants fixed, predictable passive income without the complexity of leveraged farming. If you're new to DeFi or want a set-and-forget model, TurboLoop is the right tool. If you're an experienced farmer comfortable with leverage, Alpaca offers more flexibility — but more risk.",
  },
  // ── New entries added 2026-07-11 ───────────────────────────────────────
  {
    slug: "pendle",
    competitorName: "Pendle Finance",
    seoTitle: "TurboLoop vs Pendle Finance — Fixed Yield on BSC Compared",
    heading: "TurboLoop vs Pendle Finance.",
    summary:
      "Both promise fixed yield. Pendle tokenises future yield into tradable assets. TurboLoop locks your USDT into a fixed-term plan. One is a DeFi trading desk; the other is a passive income machine.",
    intro:
      "Pendle Finance is one of DeFi's most innovative protocols — it splits yield-bearing tokens into Principal Tokens (PT) and Yield Tokens (YT), letting you trade future yield like a commodity. It's powerful but complex. TurboLoop takes the opposite approach: deposit USDT, choose a plan (7/30/60/90 days), collect your fixed return at maturity. No tokenomics to understand, no yield curves to navigate.",
    rows: [
      { metric: "Yield type", turboloop: "Fixed-term: 3%, 10%, 24%, 54% per cycle", competitor: "Variable PT discount rate + YT speculation", winner: "turboloop" },
      { metric: "Complexity", turboloop: "Simple: deposit USDT, choose plan, collect", competitor: "High: PT/YT mechanics, AMM curves, expiry dates", winner: "turboloop" },
      { metric: "Chains", turboloop: "BNB Smart Chain", competitor: "Ethereum, Arbitrum, BSC, Mantle, Base", winner: "competitor" },
      { metric: "Minimum deposit", turboloop: "$50 USDT", competitor: "No minimum (gas cost is the practical floor)", winner: "tie" },
      { metric: "Referral income", turboloop: "20-level referral, 51% total commissions", competitor: "None", winner: "turboloop" },
      { metric: "Smart contract audit", turboloop: "Haze Crypto, ownership renounced", competitor: "Multiple audits (Ackee, Dedaub) — well-audited", winner: "tie" },
      { metric: "Who it's for", turboloop: "Passive income seekers — no DeFi experience required", competitor: "Yield traders and DeFi power users", winner: "tie" },
    ],
    closing:
      "Pendle is a sophisticated yield-trading protocol for DeFi power users who want to speculate on or hedge future yield. TurboLoop is for anyone who wants predictable, fixed passive income without trading complexity. If you want to trade yield like a commodity, use Pendle. If you want to set it and forget it, TurboLoop is the better fit.",
  },
  {
    slug: "radiant",
    competitorName: "Radiant Capital",
    seoTitle: "TurboLoop vs Radiant Capital — BSC Lending vs Fixed Yield",
    heading: "TurboLoop vs Radiant Capital.",
    summary:
      "Radiant is a cross-chain lending market. TurboLoop is a fixed-yield passive income protocol. Different tools for different goals.",
    intro:
      "Radiant Capital is a cross-chain money market built on LayerZero — it lets you deposit assets on one chain and borrow on another. TurboLoop is laser-focused on one thing: giving you the highest fixed yield on USDT with the simplest possible experience on BSC.",
    rows: [
      { metric: "Yield type", turboloop: "Fixed: 3%, 10%, 24%, 54% per cycle", competitor: "Variable lending APY + RDNT token emissions", winner: "turboloop" },
      { metric: "Cross-chain", turboloop: "BNB Smart Chain only", competitor: "Arbitrum, BSC, Ethereum, Base — true cross-chain", winner: "competitor" },
      { metric: "Liquidation risk", turboloop: "None — no borrowing, no leverage", competitor: "Borrowers face liquidation; lenders are safe", winner: "turboloop" },
      { metric: "Token inflation", turboloop: "$TURBO — deflationary (daily buyback + burn)", competitor: "$RDNT — inflationary emissions as rewards", winner: "turboloop" },
      { metric: "Referral income", turboloop: "20-level referral, 51% total commissions", competitor: "None", winner: "turboloop" },
      { metric: "Minimum deposit", turboloop: "$50 USDT", competitor: "No minimum", winner: "tie" },
      { metric: "Who it's for", turboloop: "Passive income seekers — no DeFi experience required", competitor: "DeFi users who want cross-chain capital efficiency", winner: "tie" },
    ],
    closing:
      "Radiant Capital is a powerful cross-chain lending market for DeFi users who want to maximise capital efficiency across chains. TurboLoop is for anyone who wants fixed, predictable USDT yield on BSC without the complexity of cross-chain borrowing.",
  },
  {
    slug: "beefy",
    competitorName: "Beefy Finance",
    seoTitle: "TurboLoop vs Beefy Finance — Auto-Compounding vs Fixed Yield",
    heading: "TurboLoop vs Beefy Finance.",
    summary:
      "Beefy auto-compounds your yield farming rewards. TurboLoop gives you a fixed return. One maximises variable APY; the other guarantees a predictable number.",
    intro:
      "Beefy Finance is the most popular yield aggregator on BSC — it takes your LP tokens and auto-compounds the farming rewards to maximise APY. TurboLoop is different: deposit USDT, choose a fixed-term plan, receive a guaranteed percentage return at maturity. No impermanent loss, no variable APY swings.",
    rows: [
      { metric: "Yield type", turboloop: "Fixed: 3%, 10%, 24%, 54% per cycle", competitor: "Variable auto-compounded APY (highly variable)", winner: "turboloop" },
      { metric: "Impermanent loss risk", turboloop: "None — stablecoin only, no IL", competitor: "Yes — LP positions are exposed to IL", winner: "turboloop" },
      { metric: "Asset variety", turboloop: "USDT only", competitor: "Hundreds of vaults across dozens of tokens", winner: "competitor" },
      { metric: "Complexity", turboloop: "Simple: deposit USDT, choose plan", competitor: "Moderate: choose vault, understand underlying strategy", winner: "turboloop" },
      { metric: "Referral income", turboloop: "20-level referral, 51% total commissions", competitor: "None", winner: "turboloop" },
      { metric: "Smart contract audit", turboloop: "Haze Crypto, ownership renounced", competitor: "Multiple audits — well-established protocol", winner: "tie" },
      { metric: "Who it's for", turboloop: "Passive income seekers — no DeFi experience required", competitor: "Yield farmers who want auto-compounding across many assets", winner: "tie" },
    ],
    closing:
      "Beefy Finance is the best auto-compounder on BSC for yield farmers who want to maximise variable APY across many assets. TurboLoop is for anyone who wants a fixed, predictable USDT return without impermanent loss or variable APY uncertainty.",
  },
  {
    slug: "fixed-deposits",
    competitorName: "Bank Fixed Deposits",
    seoTitle: "TurboLoop vs Fixed Deposits — DeFi vs Traditional Savings",
    heading: "TurboLoop vs bank fixed deposits.",
    summary:
      "Bank FDs offer 4-7% per year with capital protection. TurboLoop offers up to 54% per cycle with on-chain transparency. The math is stark.",
    intro:
      "Bank fixed deposits are the world's most popular savings instrument — deposit money for a fixed term, earn a guaranteed interest rate, get your principal back. TurboLoop is the DeFi equivalent: deposit USDT for a fixed term (7/30/60/90 days), earn a guaranteed yield from PancakeSwap V3 trading fees, withdraw at maturity. The concept is identical. The yield is not.",
    rows: [
      { metric: "Annual yield", turboloop: "Up to 54% per 90-day cycle (~216% annualised)", competitor: "4–7% per year (best case, developed markets)", winner: "turboloop" },
      { metric: "Minimum deposit", turboloop: "$50 USDT", competitor: "Varies: $500–$10,000 (most banks)", winner: "turboloop" },
      { metric: "Access", turboloop: "Global — anyone with a crypto wallet", competitor: "Requires bank account, citizenship, credit history", winner: "turboloop" },
      { metric: "Transparency", turboloop: "100% on-chain — verify every transaction", competitor: "Opaque — bank decides how your money is used", winner: "turboloop" },
      { metric: "Capital protection", turboloop: "Smart contract risk (audited, ownership renounced)", competitor: "Government deposit insurance (up to local limit)", winner: "competitor" },
      { metric: "Referral income", turboloop: "20-level referral, 51% total commissions", competitor: "None", winner: "turboloop" },
      { metric: "Hours of operation", turboloop: "24/7/365", competitor: "Business hours only", winner: "turboloop" },
    ],
    closing:
      "Bank fixed deposits are safe, government-insured, and familiar. TurboLoop offers dramatically higher yield with full on-chain transparency. For anyone comfortable with DeFi, TurboLoop's fixed-term model delivers the same predictability as a bank FD — at a fraction of the waiting time and a multiple of the yield.",
  },
  {
    slug: "savings-accounts",
    competitorName: "High-Yield Savings Accounts",
    seoTitle: "TurboLoop vs High-Yield Savings Accounts — The Real Numbers",
    heading: "TurboLoop vs high-yield savings accounts.",
    summary:
      "High-yield savings accounts offer 4-5% APY. TurboLoop offers up to 54% per 90-day cycle. Here's the honest comparison.",
    intro:
      "High-yield savings accounts (HYSAs) are the best traditional savings product available — they offer 4-5% APY with full liquidity and FDIC/FSCS insurance. They're excellent for emergency funds. TurboLoop is a fixed-term DeFi protocol that offers dramatically higher yield by channelling your USDT into PancakeSwap V3 liquidity.",
    rows: [
      { metric: "Annual yield", turboloop: "Up to 54% per 90-day cycle", competitor: "4–5% APY (best HYSA rates, 2026)", winner: "turboloop" },
      { metric: "Liquidity", turboloop: "Locked until maturity (7/30/60/90 days)", competitor: "Fully liquid — withdraw any time", winner: "competitor" },
      { metric: "Deposit insurance", turboloop: "None (smart contract risk)", competitor: "FDIC/FSCS insured up to local limit", winner: "competitor" },
      { metric: "Minimum deposit", turboloop: "$50 USDT", competitor: "$0 (most HYSAs)", winner: "tie" },
      { metric: "Global access", turboloop: "Anyone with a crypto wallet", competitor: "Requires US/UK bank account", winner: "turboloop" },
      { metric: "Referral income", turboloop: "20-level referral, 51% total commissions", competitor: "Occasional referral bonuses ($50–$300 one-time)", winner: "turboloop" },
      { metric: "Transparency", turboloop: "100% on-chain", competitor: "Opaque — bank decides how your money is used", winner: "turboloop" },
    ],
    closing:
      "High-yield savings accounts are the best traditional savings product — safe, liquid, and insured. TurboLoop offers dramatically higher yield at the cost of liquidity and deposit insurance. For emergency funds, use a HYSA. For surplus capital you don't need for 30-90 days, TurboLoop's fixed-term plans deliver returns that no savings account can match.",
  },
  {
    slug: "yearn",
    competitorName: "Yearn Finance",
    seoTitle: "TurboLoop vs Yearn Finance (2026) — Which Earns More?",
    heading: "TurboLoop vs Yearn Finance.",
    summary:
      "Yearn Finance automates DeFi yield strategies. TurboLoop offers fixed 54% ROI per 90-day cycle with a simpler, audited BSC contract. Here's the full comparison.",
    intro:
      "Yearn Finance is one of DeFi's most respected yield aggregators — it automatically moves your funds between the highest-yielding strategies on Ethereum and other chains. TurboLoop takes a different approach: a single, audited fixed-term liquidity pool on BSC that delivers predictable returns without strategy complexity.",
    rows: [
      { metric: "Yield type", turboloop: "Fixed ROI (up to 54% per 90-day cycle)", competitor: "Variable — depends on market conditions", winner: "turboloop" },
      { metric: "Predictability", turboloop: "Fully predictable at deposit", competitor: "Fluctuates daily with market rates", winner: "turboloop" },
      { metric: "Chain", turboloop: "BNB Smart Chain (BSC)", competitor: "Ethereum, Arbitrum, Optimism, Fantom", winner: "tie" },
      { metric: "Gas fees", turboloop: "Very low (BSC)", competitor: "High on Ethereum mainnet", winner: "turboloop" },
      { metric: "Minimum deposit", turboloop: "$50 USDT", competitor: "No minimum (but gas costs apply)", winner: "turboloop" },
      { metric: "Smart contract audit", turboloop: "Audited, ownership renounced", competitor: "Audited by multiple firms", winner: "tie" },
      { metric: "LP lock", turboloop: "100% LP locked", competitor: "N/A (yield aggregator model)", winner: "turboloop" },
      { metric: "Referral programme", turboloop: "20-level, 51% total commissions", competitor: "None", winner: "turboloop" },
      { metric: "Complexity", turboloop: "Deposit USDT, choose plan, collect ROI", competitor: "Requires understanding of vault strategies", winner: "turboloop" },
    ],
    closing:
      "Yearn Finance is a powerful tool for experienced DeFi users who want automated yield optimisation across multiple protocols. TurboLoop is the better choice for users who want a simple, fixed, high-yield product on BSC with predictable returns and no strategy management required.",
  },
];
export const getComparison = (slug: string) =>
  COMPARISONS.find(c => c.slug === slug);
