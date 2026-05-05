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
        turboloop: "100% locked via Unicrypt",
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
];

export const getComparison = (slug: string) =>
  COMPARISONS.find(c => c.slug === slug);
