// Internal linking system for blog posts.
// Automatically inserts contextual links between related posts based on keyword matching.
// Also provides a "Related Posts" section for the bottom of each blog post.

/** Keywords that map to specific internal pages */
const KEYWORD_LINKS: { pattern: RegExp; href: string; label: string }[] = [
  // /earn pages
  { pattern: /\bpassive income\b/i, href: "/earn/passive-income-with-bnb", label: "passive income" },
  { pattern: /\bDeFi yield\b/i, href: "/earn/best-defi-yield-2026", label: "DeFi yield" },
  { pattern: /\byield optimization\b/i, href: "/earn/pancakeswap-v3-yield-optimization", label: "yield optimization" },
  { pattern: /\bautomated (crypto |DeFi )?earn/i, href: "/earn/automated-crypto-earnings", label: "automated crypto earnings" },
  { pattern: /\bUSDT yield\b/i, href: "/earn/usdt-yield-bsc", label: "USDT yield" },
  { pattern: /\bwithout trading\b/i, href: "/earn/crypto-income-without-trading", label: "earn without trading" },
  { pattern: /\bbeginners?\b.*\bDeFi\b|\bDeFi\b.*\bbeginners?\b/i, href: "/earn/defi-passive-income-beginners", label: "DeFi for beginners" },

  // /learn pages
  { pattern: /\bwhat is DeFi\b/i, href: "/learn/what-is-defi", label: "what is DeFi" },
  { pattern: /\bsmart contract/i, href: "/learn/what-is-a-smart-contract", label: "smart contracts" },
  { pattern: /\bstablecoin/i, href: "/learn/what-is-a-stablecoin", label: "stablecoins" },
  { pattern: /\byield farm/i, href: "/learn/what-is-yield-farming", label: "yield farming" },
  { pattern: /\bBSCScan\b/i, href: "/learn/how-to-verify-on-bscscan", label: "verify on BSCScan" },

  // /vs pages
  { pattern: /\bvs\.?\s*bank/i, href: "/vs/banks", label: "TurboLoop vs banks" },
  { pattern: /\bPancakeSwap\b/i, href: "/vs/pancakeswap", label: "PancakeSwap" },
  { pattern: /\bAave\b/i, href: "/vs/aave", label: "Aave" },
  { pattern: /\bVenus\b/i, href: "/vs/venus", label: "Venus" },
  { pattern: /\bBeefy\b/i, href: "/vs/beefy", label: "Beefy" },
  { pattern: /\bstaking\b/i, href: "/vs/staking", label: "staking" },
  { pattern: /\bimpermanent loss\b/i, href: "/learn/what-is-yield-farming", label: "impermanent loss" },

  // Main pages
  { pattern: /\bliquidity pool/i, href: "/earn/passive-income-with-bnb", label: "liquidity pools" },
  { pattern: /\bconcentrated liquidity\b/i, href: "/earn/pancakeswap-v3-yield-optimization", label: "concentrated liquidity" },
  { pattern: /\bBNB Smart Chain\b|\bBSC\b/i, href: "/earn/passive-income-with-bnb", label: "BNB Smart Chain" },
];

/**
 * Inject up to `maxLinks` internal links into HTML content.
 * Only links the first occurrence of each keyword to avoid over-linking.
 * Skips content already inside <a> tags or headings.
 */
export function injectInternalLinks(html: string, maxLinks = 3): string {
  let linksInserted = 0;
  const usedHrefs = new Set<string>();
  let result = html;

  for (const { pattern, href, label } of KEYWORD_LINKS) {
    if (linksInserted >= maxLinks) break;
    if (usedHrefs.has(href)) continue;

    // Only match text NOT already inside an <a> tag or heading
    const safePattern = new RegExp(
      `(?<![">])(?<!<a[^>]*>)(${pattern.source})(?![^<]*<\\/a>)(?![^<]*<\\/h[1-6]>)`,
      pattern.flags
    );

    const match = result.match(safePattern);
    if (match && match.index !== undefined) {
      const linkHtml = `<a href="${href}" class="text-emerald-400 hover:text-emerald-300 underline decoration-emerald-400/30 hover:decoration-emerald-400 transition-colors" title="${label}">${match[0]}</a>`;
      result = result.slice(0, match.index) + linkHtml + result.slice(match.index + match[0].length);
      linksInserted++;
      usedHrefs.add(href);
    }
  }

  return result;
}

/**
 * Get related post slugs based on keyword overlap.
 * Returns up to `limit` related post slugs from the same language.
 */
export function getRelatedKeywords(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase();
  const matches: string[] = [];

  const TOPIC_MAP: { keywords: string[]; category: string }[] = [
    { keywords: ["liquidity", "pool", "lp", "amm"], category: "liquidity" },
    { keywords: ["yield", "apy", "apr", "return"], category: "yield" },
    { keywords: ["passive", "income", "earn", "earning"], category: "passive-income" },
    { keywords: ["staking", "stake", "validator"], category: "staking" },
    { keywords: ["security", "audit", "safe", "risk"], category: "security" },
    { keywords: ["beginner", "start", "guide", "how to"], category: "beginner" },
    { keywords: ["bnb", "bsc", "binance", "smart chain"], category: "bsc" },
    { keywords: ["defi", "decentralized", "protocol"], category: "defi" },
    { keywords: ["pancakeswap", "swap", "dex", "exchange"], category: "dex" },
    { keywords: ["usdt", "stablecoin", "stable", "tether"], category: "stablecoin" },
  ];

  for (const { keywords, category } of TOPIC_MAP) {
    if (keywords.some((kw) => text.includes(kw))) {
      matches.push(category);
    }
  }

  return matches;
}

/** Map categories to recommended internal pages */
export const CATEGORY_RECOMMENDATIONS: Record<string, { label: string; href: string }[]> = {
  "liquidity": [
    { label: "PancakeSwap V3 Yield Optimization", href: "/earn/pancakeswap-v3-yield-optimization" },
    { label: "What is Yield Farming?", href: "/learn/what-is-yield-farming" },
  ],
  "yield": [
    { label: "Best DeFi Yield 2026", href: "/earn/best-defi-yield-2026" },
    { label: "Automated Crypto Earnings", href: "/earn/automated-crypto-earnings" },
  ],
  "passive-income": [
    { label: "Earn Passive Income with BNB", href: "/earn/passive-income-with-bnb" },
    { label: "Earn Without Trading", href: "/earn/crypto-income-without-trading" },
  ],
  "staking": [
    { label: "TurboLoop vs Staking", href: "/vs/staking" },
    { label: "Best DeFi Yield 2026", href: "/earn/best-defi-yield-2026" },
  ],
  "security": [
    { label: "How to Verify on BSCScan", href: "/learn/how-to-verify-on-bscscan" },
    { label: "What is a Smart Contract?", href: "/learn/what-is-a-smart-contract" },
  ],
  "beginner": [
    { label: "DeFi Passive Income for Beginners", href: "/earn/defi-passive-income-beginners" },
    { label: "What is DeFi?", href: "/learn/what-is-defi" },
  ],
  "bsc": [
    { label: "USDT Yield on BSC", href: "/earn/usdt-yield-bsc" },
    { label: "Earn Passive Income with BNB", href: "/earn/passive-income-with-bnb" },
  ],
  "defi": [
    { label: "What is DeFi?", href: "/learn/what-is-defi" },
    { label: "Best DeFi Yield 2026", href: "/earn/best-defi-yield-2026" },
  ],
  "dex": [
    { label: "TurboLoop vs PancakeSwap", href: "/earn/turboloop-vs-pancakeswap" },
    { label: "PancakeSwap V3 Yield Optimization", href: "/earn/pancakeswap-v3-yield-optimization" },
  ],
  "stablecoin": [
    { label: "USDT Yield on BSC", href: "/earn/usdt-yield-bsc" },
    { label: "What is a Stablecoin?", href: "/learn/what-is-a-stablecoin" },
  ],
};
