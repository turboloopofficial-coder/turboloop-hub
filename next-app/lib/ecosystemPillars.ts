// Ecosystem pillar metadata — used by the main /ecosystem page + 6 sub-pages.
// Each pillar has a slug (for the URL), display info, and rich content (long-form
// description with H2 sections + key facts + CTAs).

export type EcosystemPillar = {
  slug: string;
  title: string;
  subtitle: string;
  emoji: string;
  /** Short tagline for cards */
  tagline: string;
  /** Card icon hint */
  icon: "buy" | "swap" | "yield" | "users" | "award" | "shield";
  /** Primary palette */
  palette: { from: string; via: string; to: string };
  /** Long-form sections (rendered as H2 + body markdown on the sub-page) */
  sections: Array<{ heading: string; body: string }>;
  /** Key facts shown on the sub-page */
  facts: string[];
  /** Related blog post slugs to link to */
  relatedBlogs?: string[];
};

export const ECOSYSTEM_PILLARS: EcosystemPillar[] = [
  {
    slug: "turbo-buy",
    title: "Turbo Buy",
    subtitle: "Fiat-to-Crypto Gateway",
    emoji: "💳",
    tagline: "Buy USDT directly with local currency. No third-party exchange.",
    icon: "buy",
    palette: { from: "#0891B2", via: "#22D3EE", to: "#10B981" },
    sections: [
      {
        heading: "What it is",
        body: "Turbo Buy is the fiat-to-crypto on-ramp built directly into the Turbo Loop ecosystem. It removes the centralized exchange step that traditionally separates regular savers from DeFi yield. You enter local currency on one side, USDT lands in your self-custodied wallet on the other side — and that wallet is the same wallet you use to deposit into Turbo Loop's farming contract. One flow, no friction, no KYC delays you didn't sign up for.",
      },
      {
        heading: "Why it matters",
        body: "The single biggest reason people don't enter DeFi isn't yield doubt — it's the on-ramp. Setting up an exchange account, waiting for KYC approval, depositing fiat, buying USDT, withdrawing to a wallet — it takes most newcomers 3-5 days. Turbo Buy compresses that into minutes. And because the conversion fees feed back into the protocol's Revenue Flywheel, every time someone uses Turbo Buy, every existing depositor benefits.",
      },
      {
        heading: "How the math works",
        body: "Turbo Buy charges a small fee on every fiat-to-crypto conversion. That fee is one of the three real revenue streams that feed the yield pool (alongside swap fees and LP rewards). More on-ramp activity → more yield for everyone in the pool. It's the exact opposite of how centralized exchanges work, where on-ramp profits go to executive bonuses and shareholder dividends.",
      },
    ],
    facts: [
      "Direct fiat → USDT in your wallet",
      "Powered by MoonPay integration",
      "On-ramp fees flow into the yield pool",
      "Same wallet works for deposits, swaps, and farming",
    ],
    relatedBlogs: ["turbo-buy-fiat-to-crypto-gateway", "why-moonpay-is-the-right-onramp"],
  },
  {
    slug: "turbo-swap",
    title: "Turbo Swap",
    subtitle: "Decentralized Exchange",
    emoji: "💱",
    tagline: "Instant token swaps with low fees, built into the ecosystem.",
    icon: "swap",
    palette: { from: "#7C3AED", via: "#A78BFA", to: "#EC4899" },
    sections: [
      {
        heading: "What it is",
        body: "Turbo Swap is the in-ecosystem decentralized exchange that lets you swap any BSC token for any other BSC token without leaving Turbo Loop. It aggregates liquidity from PancakeSwap V3 and other major BSC DEXs, finds the best route, and executes — all in a single transaction.",
      },
      {
        heading: "Why it matters",
        body: "Centralized exchanges siphon billions in trading fees every year. Turbo Swap captures that activity for the Turbo Loop ecosystem instead. The swap fee (typically 0.3% per trade) is one of the three real revenue streams powering daily yield distribution. Every trade made on Turbo Swap pays a tiny dividend back to every USDT depositor in the protocol.",
      },
      {
        heading: "Why PancakeSwap V3 specifically",
        body: "PancakeSwap V3 brings concentrated liquidity — liquidity providers can target specific price ranges instead of spreading capital across the full curve. This means deeper liquidity at the prices that matter, lower slippage for traders, and better fee capture per dollar of LP. Turbo Swap routes through V3 pools whenever they offer the best rate, which is most of the time on stablecoin pairs.",
      },
    ],
    facts: [
      "Aggregated routing across BSC DEXs",
      "0.3% per trade — feeds the yield pool",
      "Built on PancakeSwap V3 concentrated liquidity",
      "No registration, no KYC, instant settlement",
    ],
    relatedBlogs: ["turbo-swap-dex-explained"],
  },
  {
    slug: "yield-farming",
    title: "Yield Farming",
    subtitle: "Up to 54% ROI",
    emoji: "🌾",
    tagline: "4 acceleration plans from 7 to 60 days. Compound for exponential growth.",
    icon: "yield",
    palette: { from: "#10B981", via: "#34D399", to: "#0891B2" },
    sections: [
      {
        heading: "What it is",
        body: "Yield Farming is the core of Turbo Loop. You deposit USDT into the farming contract, the contract deploys it into curated DeFi strategies (mostly LP positions on PancakeSwap V3), and you earn daily yield based on the protocol's real revenue. No token rewards, no inflation, no Ponzi mechanics — just real economic activity translated into stablecoin returns.",
      },
      {
        heading: "The four acceleration plans",
        body: "You choose how aggressive your strategy is by picking one of four cycles: Sprint (7 days, lower yield, max flexibility), Power (14 days), Mega (30 days), Ultra (60 days, highest yield, longest commitment). Longer cycles get higher rates because the protocol can deploy capital into longer-term strategies with better fee economics.",
      },
      {
        heading: "Why compounding matters",
        body: "When you compound (re-loop) your earned yield daily, the math shifts dramatically. A 54% APY compounded daily produces ~71.5% effective annual return. Compounded weekly, ~67%. Monthly, ~70%. Manual claim-and-redeposit each day extracts the most — which is why most experienced users automate that pattern.",
      },
    ],
    facts: [
      "Up to 54% ROI on the longest cycle",
      "Daily payouts, no lockup penalties on shorter cycles",
      "Compound to capture exponential growth",
      "Yield comes from real revenue (not token emissions)",
    ],
    relatedBlogs: [
      "yield-farming-vs-lending-vs-staking",
      "compounding-strategy-exponential-growth",
      "how-compound-frequency-affects-returns",
      "the-velocity-of-compounding",
    ],
  },
  {
    slug: "referral-network",
    title: "Referral Network",
    subtitle: "20 Levels Deep",
    emoji: "🌐",
    tagline: "51% total distribution across 20 levels. Build a network, earn rewards.",
    icon: "users",
    palette: { from: "#EC4899", via: "#F472B6", to: "#7C3AED" },
    sections: [
      {
        heading: "What it is",
        body: "The Turbo Loop referral network is a 20-level deep distribution system. When someone joins through your link, you earn a percentage of their farming activity. When they refer someone, you earn a smaller percentage of THAT activity. The network keeps cascading down to 20 levels, with 51% of the protocol's referral budget distributed through the chain.",
      },
      {
        heading: "Why depth matters",
        body: "Most referral systems pay only 2-3 levels deep. That's because most projects can't sustain deeper distribution — they collapse under emission costs. Turbo Loop pays 20 because the rewards come from real protocol activity, not token printing. A wider, deeper network means more people benefit from any single user's activity, which means stronger incentives to actually build a network rather than just personally deposit.",
      },
      {
        heading: "The math at scale",
        body: "If your direct referrals (level 1) bring in their own referrals (level 2), and those bring in their own (level 3), you start earning from a tree that compounds with the network's growth. A modest level-1 of 5 people who each bring 5 across 4 levels adds up to ~625 indirect contributors — even at fractional percentages, this is significant. The full math is in the 20-Level Multiplier blog post.",
      },
    ],
    facts: [
      "20 levels deep — deepest in DeFi",
      "51% total distribution to community",
      "No volume requirements to qualify",
      "Each level has its own fixed percentage",
    ],
    relatedBlogs: ["referral-network-20-levels-how-it-works", "the-20-level-multiplier-effect"],
  },
  {
    slug: "leadership-program",
    title: "Leadership Program",
    subtitle: "7 Ranks to Legend",
    emoji: "🏆",
    tagline: "From Turbo Partner to Turbo Legend. 1% to 10% across 100 levels.",
    icon: "award",
    palette: { from: "#F59E0B", via: "#FBBF24", to: "#EC4899" },
    sections: [
      {
        heading: "What it is",
        body: "The Leadership Program is a separate income stream layered on top of the standard 20-level referral. As you build a network and your downline activity hits certain thresholds, you advance through seven ranks: Turbo Partner → Builder → Accelerator → Director → Executive → Ambassador → Turbo Legend. Each rank unlocks a higher percentage of leadership pool distribution, which extends across 100 levels of your network (vs 20 for the standard referral).",
      },
      {
        heading: "Why this matters",
        body: "Most referral programs reward early activity then cap out. Leadership ranks reward long-term, sustained community building. A Turbo Legend earns from 100 levels deep of their network — which means even a fractional percentage on a wide downline becomes substantial monthly income. This is structured to make community building a viable full-time activity for top performers.",
      },
      {
        heading: "How ranks are earned",
        body: "Rank progression is based on direct deposit volume from your direct referrals AND total network activity. The exact thresholds are published in the contract — verifiable, immutable, no off-chain magic. Once you hit a rank, you keep it permanently (no demotion). And the rewards flow daily, alongside your own farming yield.",
      },
    ],
    facts: [
      "7 ranks: Partner → Builder → Accelerator → Director → Executive → Ambassador → Legend",
      "Up to 10% pool share at the top rank",
      "100-level depth (vs 20 for standard referral)",
      "Permanent rank — no demotion",
    ],
    relatedBlogs: ["leadership-program-7-ranks-to-legend", "community-leadership-path-building-globally"],
  },
  {
    slug: "smart-contract-security",
    title: "Smart Contract Security",
    subtitle: "Audited & Renounced",
    emoji: "🛡",
    tagline: "Independently audited, ownership renounced, 100% LP locked.",
    icon: "shield",
    palette: { from: "#0F172A", via: "#475569", to: "#7C3AED" },
    sections: [
      {
        heading: "Five pillars of security",
        body: "1) Independent third-party audit completed pre-launch with zero critical findings. 2) Ownership renounced — admin functions point to 0x0000…0000, no one can modify the contract ever. 3) 100% of liquidity tokens locked in a time-lock contract — they cannot be withdrawn. 4) Source code verified on BscScan, line-by-line publicly readable. 5) All operations 100% on-chain, no off-chain backend that can lie about your balance.",
      },
      {
        heading: "Why this matters",
        body: "DeFi has a credibility problem. Most protocols collapse not from market downturns but from team-controlled exit scams: changing fees, pausing the contract, draining the LP. Renounced ownership + locked LP makes those failures impossible by design — not by promise. You don't have to trust the team. You can verify, in five minutes on BscScan, that no admin function exists.",
      },
      {
        heading: "The $100,000 challenge",
        body: "The team has put $100,000 USDT on the table for anyone who can prove the contract has any centralization point. Find an admin-controlled function. Show it on-chain. Get paid. The bounty has been live since launch and remains unclaimed — which is itself ongoing public proof of the security model working.",
      },
    ],
    facts: [
      "Independent audit — zero critical findings",
      "Ownership renounced (verifiable on BscScan)",
      "100% LP locked in time-lock contract",
      "$100K bounty for any centralization claim",
      "All on-chain, no off-chain backend",
    ],
    relatedBlogs: [
      "why-renounced-ownership-changes-everything",
      "lp-lock-explained-why-liquidity-security-matters",
      "smart-contract-audits-what-they-actually-check",
      "the-100k-smart-contract-challenge",
      "what-decentralized-trust-actually-means",
    ],
  },
];

export function getPillar(slug: string): EcosystemPillar | undefined {
  return ECOSYSTEM_PILLARS.find((p) => p.slug === slug);
}
