/**
 * SEO Blog Topic Queue — pre-defined topics targeting high-intent DeFi keywords.
 *
 * These topics are designed to capture organic search traffic from users searching
 * for DeFi-related information. Each topic targets specific long-tail keywords
 * that have search volume but low competition.
 *
 * The AI blog drafter (admin/AIDrafter.tsx) can pull from this queue to auto-generate
 * and schedule articles. The cron-publish-blog job publishes them daily at 4 AM UTC.
 *
 * Strategy:
 * - Target "how to" queries (high intent, low competition)
 * - Target comparison queries ("X vs Y")
 * - Target educational queries ("what is X")
 * - Target location-specific queries ("DeFi in India", "crypto yield Nigeria")
 * - Target problem-solving queries ("passive income crypto 2026")
 */

export interface SEOBlogTopic {
  title: string;
  slug: string;
  targetKeywords: string[];
  searchIntent: "informational" | "commercial" | "navigational";
  priority: "high" | "medium" | "low";
  estimatedSearchVolume: string;
  category: string;
}

export const SEO_BLOG_TOPICS: SEOBlogTopic[] = [
  // ─── High Priority: "How to" queries ────────────────────────────────────────
  {
    title: "How to Earn Passive Income with USDT in 2026",
    slug: "how-to-earn-passive-income-usdt-2026",
    targetKeywords: ["passive income USDT", "USDT staking 2026", "earn with stablecoins", "USDT yield farming"],
    searchIntent: "commercial",
    priority: "high",
    estimatedSearchVolume: "5,000-10,000/mo",
    category: "guides",
  },
  {
    title: "How to Start Yield Farming on BSC: Complete Beginner Guide",
    slug: "how-to-start-yield-farming-bsc-beginner-guide",
    targetKeywords: ["yield farming BSC", "BSC yield farming guide", "start DeFi farming", "Binance Smart Chain farming"],
    searchIntent: "informational",
    priority: "high",
    estimatedSearchVolume: "3,000-8,000/mo",
    category: "guides",
  },
  {
    title: "Best DeFi Yield Farming Platforms in 2026: Complete Comparison",
    slug: "best-defi-yield-farming-platforms-2026",
    targetKeywords: ["best DeFi yield farming", "top yield farming platforms 2026", "highest DeFi yields", "DeFi platform comparison"],
    searchIntent: "commercial",
    priority: "high",
    estimatedSearchVolume: "8,000-15,000/mo",
    category: "comparisons",
  },
  {
    title: "How to Verify a Smart Contract is Safe: 7-Step Checklist",
    slug: "how-to-verify-smart-contract-safe-checklist",
    targetKeywords: ["verify smart contract", "is smart contract safe", "audit smart contract", "DeFi security check"],
    searchIntent: "informational",
    priority: "high",
    estimatedSearchVolume: "2,000-5,000/mo",
    category: "security",
  },
  {
    title: "Fixed Yield vs Variable Yield in DeFi: Which is Better?",
    slug: "fixed-yield-vs-variable-yield-defi",
    targetKeywords: ["fixed yield DeFi", "fixed vs variable yield", "stable DeFi returns", "predictable crypto income"],
    searchIntent: "informational",
    priority: "high",
    estimatedSearchVolume: "1,500-4,000/mo",
    category: "education",
  },

  // ─── Medium Priority: Comparison & "vs" queries ─────────────────────────────
  {
    title: "TurboLoop vs PancakeSwap: Yield Farming Compared",
    slug: "turboloop-vs-pancakeswap-yield-farming",
    targetKeywords: ["TurboLoop vs PancakeSwap", "PancakeSwap alternative", "BSC yield comparison"],
    searchIntent: "commercial",
    priority: "medium",
    estimatedSearchVolume: "500-2,000/mo",
    category: "comparisons",
  },
  {
    title: "TurboLoop vs Aave: Which DeFi Protocol Offers Better Returns?",
    slug: "turboloop-vs-aave-defi-returns",
    targetKeywords: ["TurboLoop vs Aave", "Aave alternative BSC", "DeFi lending vs farming"],
    searchIntent: "commercial",
    priority: "medium",
    estimatedSearchVolume: "500-1,500/mo",
    category: "comparisons",
  },
  {
    title: "Is DeFi Safe? Understanding Smart Contract Risks in 2026",
    slug: "is-defi-safe-smart-contract-risks-2026",
    targetKeywords: ["is DeFi safe", "DeFi risks 2026", "smart contract risks", "DeFi security"],
    searchIntent: "informational",
    priority: "medium",
    estimatedSearchVolume: "3,000-7,000/mo",
    category: "security",
  },
  {
    title: "What is LP Locking and Why Does It Matter?",
    slug: "what-is-lp-locking-why-it-matters",
    targetKeywords: ["LP locking", "liquidity pool lock", "why LP lock matters", "DeFi LP security"],
    searchIntent: "informational",
    priority: "medium",
    estimatedSearchVolume: "1,000-3,000/mo",
    category: "education",
  },
  {
    title: "How to Build a Crypto Referral Network: Step-by-Step",
    slug: "how-to-build-crypto-referral-network",
    targetKeywords: ["crypto referral network", "DeFi referral program", "earn crypto referrals", "passive income referral"],
    searchIntent: "commercial",
    priority: "medium",
    estimatedSearchVolume: "1,500-4,000/mo",
    category: "guides",
  },

  // ─── Location-specific queries (targeting India, Nigeria, SEA) ──────────────
  {
    title: "Best Crypto Yield Farming for Indian Investors in 2026",
    slug: "best-crypto-yield-farming-india-2026",
    targetKeywords: ["crypto yield farming India", "DeFi India 2026", "earn crypto India", "USDT farming India"],
    searchIntent: "commercial",
    priority: "high",
    estimatedSearchVolume: "2,000-5,000/mo",
    category: "regional",
  },
  {
    title: "How to Earn Passive Crypto Income in Nigeria",
    slug: "earn-passive-crypto-income-nigeria",
    targetKeywords: ["crypto income Nigeria", "DeFi Nigeria", "earn crypto Nigeria", "passive income Nigeria crypto"],
    searchIntent: "commercial",
    priority: "high",
    estimatedSearchVolume: "1,500-4,000/mo",
    category: "regional",
  },
  {
    title: "DeFi Yield Farming in Thailand: A Complete Guide",
    slug: "defi-yield-farming-thailand-guide",
    targetKeywords: ["DeFi Thailand", "yield farming Thailand", "crypto Thailand 2026", "earn crypto Thailand"],
    searchIntent: "informational",
    priority: "medium",
    estimatedSearchVolume: "800-2,000/mo",
    category: "regional",
  },
  {
    title: "How to Start with DeFi in Indonesia: Beginner's Guide",
    slug: "start-defi-indonesia-beginners-guide",
    targetKeywords: ["DeFi Indonesia", "crypto Indonesia", "yield farming Indonesia", "earn crypto Indonesia"],
    searchIntent: "informational",
    priority: "medium",
    estimatedSearchVolume: "1,000-3,000/mo",
    category: "regional",
  },
  {
    title: "Crypto Passive Income in Ghana and West Africa",
    slug: "crypto-passive-income-ghana-west-africa",
    targetKeywords: ["crypto Ghana", "DeFi West Africa", "passive income Ghana", "earn crypto Africa"],
    searchIntent: "commercial",
    priority: "medium",
    estimatedSearchVolume: "500-1,500/mo",
    category: "regional",
  },

  // ─── Educational / "What is" queries ────────────────────────────────────────
  {
    title: "What is Renounced Ownership in Crypto? Why It Matters",
    slug: "what-is-renounced-ownership-crypto",
    targetKeywords: ["renounced ownership crypto", "renounced contract", "what does renounced mean crypto"],
    searchIntent: "informational",
    priority: "medium",
    estimatedSearchVolume: "1,000-3,000/mo",
    category: "education",
  },
  {
    title: "What is a DeFi Ecosystem? Understanding Multi-Pillar Protocols",
    slug: "what-is-defi-ecosystem-multi-pillar",
    targetKeywords: ["DeFi ecosystem", "multi-pillar DeFi", "DeFi protocol explained", "complete DeFi platform"],
    searchIntent: "informational",
    priority: "low",
    estimatedSearchVolume: "500-1,500/mo",
    category: "education",
  },
  {
    title: "Understanding APY vs APR in DeFi: What's the Real Return?",
    slug: "apy-vs-apr-defi-real-return",
    targetKeywords: ["APY vs APR DeFi", "APY meaning crypto", "DeFi returns explained", "real yield DeFi"],
    searchIntent: "informational",
    priority: "medium",
    estimatedSearchVolume: "3,000-8,000/mo",
    category: "education",
  },
  {
    title: "How Turbo Swap Works: Decentralized Exchange on BSC Explained",
    slug: "how-turbo-swap-works-dex-bsc",
    targetKeywords: ["Turbo Swap", "DEX BSC", "decentralized exchange BSC", "swap tokens BSC"],
    searchIntent: "informational",
    priority: "low",
    estimatedSearchVolume: "200-800/mo",
    category: "product",
  },
  {
    title: "The $100K Bug Bounty: How TurboLoop Proves Its Security",
    slug: "100k-bug-bounty-turboloop-security",
    targetKeywords: ["TurboLoop security", "DeFi bug bounty", "smart contract bounty", "TurboLoop audit"],
    searchIntent: "informational",
    priority: "medium",
    estimatedSearchVolume: "200-500/mo",
    category: "security",
  },
];

/**
 * Get the next unpublished topic from the queue.
 * In production, this would check against the database to skip already-published slugs.
 */
export function getNextTopic(publishedSlugs: string[]): SEOBlogTopic | null {
  const published = new Set(publishedSlugs);
  // Prioritize high-priority topics first
  const sorted = [...SEO_BLOG_TOPICS].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
  return sorted.find((t) => !published.has(t.slug)) || null;
}
