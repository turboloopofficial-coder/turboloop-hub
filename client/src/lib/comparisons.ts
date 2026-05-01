// Source of truth for /vs/:slug comparison pages.
// Each entry powers a SEO-targeted page comparing TurboLoop to a competitor.
// Goal: capture high-intent search traffic for "TurboLoop vs X" queries.

export type ComparisonRow = {
  category: string;
  turboloop: string;
  competitor: string;
  /** Did TurboLoop "win" this row? Used for visual emphasis. */
  turboloopWins: boolean;
};

export type Comparison = {
  slug: string;
  competitor: string; // "PancakeSwap", "Aave", "Yearn Finance"
  competitorTagline: string; // short description of what the competitor does
  competitorLogoEmoji: string;
  intro: string; // 1-2 paragraph honest framing
  rows: ComparisonRow[];
  conclusion: string;
  /** Where TurboLoop is genuinely behind — credibility builder */
  whereCompetitorWins?: string[];
};

export const COMPARISONS: Comparison[] = [
  {
    slug: "pancakeswap",
    competitor: "PancakeSwap",
    competitorTagline: "The largest DEX on Binance Smart Chain",
    competitorLogoEmoji: "🥞",
    intro: "PancakeSwap is the dominant DEX on BSC — billions in daily trading volume, hundreds of trading pairs, and the foundation that TurboLoop actually builds on top of. Comparing them isn't about replacing PancakeSwap. It's about understanding that TurboLoop deploys YOUR liquidity into PancakeSwap V3 pools, then captures and amplifies the trading fees back to you. Think of PancakeSwap as the highway. TurboLoop is the optimized vehicle that drives on it.",
    rows: [
      { category: "Primary use",            turboloop: "Concentrated liquidity yield farming on stablecoins", competitor: "DEX trading + farming pools", turboloopWins: false },
      { category: "Yield source",           turboloop: "Real PancakeSwap V3 trading fees (concentrated)",     competitor: "Same source, but spread across all LP positions", turboloopWins: true },
      { category: "Target APY (stablecoins)", turboloop: "Up to 54% on USDT pairs",                            competitor: "5-15% on standard farming pools", turboloopWins: true },
      { category: "User effort",            turboloop: "Deposit USDT once, contract handles rebalancing",      competitor: "Manual position management, range adjustments", turboloopWins: true },
      { category: "Smart contract",         turboloop: "Renounced ownership — no admin keys, no kill switch", competitor: "DAO-governed, can change parameters via vote",   turboloopWins: true },
      { category: "Volatility exposure",    turboloop: "Stablecoins only — principal stays at $1",            competitor: "Most pools require volatile token pairs",        turboloopWins: true },
      { category: "Network",                turboloop: "BNB Smart Chain",                                     competitor: "BNB Smart Chain (+ Aptos, Ethereum)",            turboloopWins: false },
      { category: "Verification",           turboloop: "Every position visible on BscScan",                    competitor: "Same — public on BscScan",                       turboloopWins: false },
    ],
    conclusion: "If you want to trade tokens or provide liquidity manually, PancakeSwap is your tool. If you want to deposit stablecoins once and let a renounced contract optimize concentrated liquidity for you across PancakeSwap V3 — that's TurboLoop's job. They're complementary, not competitive.",
    whereCompetitorWins: [
      "Token diversity — PancakeSwap supports hundreds of pairs vs TurboLoop's stablecoin focus",
      "Multi-chain reach — PancakeSwap has expanded beyond BSC; TurboLoop is BSC-only",
      "Direct trading — you can't trade tokens on TurboLoop, you have to use PancakeSwap or another DEX first",
    ],
  },
  {
    slug: "aave",
    competitor: "Aave",
    competitorTagline: "The largest DeFi lending protocol on Ethereum + L2s",
    competitorLogoEmoji: "👻",
    intro: "Aave is the gold standard for decentralized lending — deposit assets, earn interest from borrowers, withdraw anytime. It's mature, audited multiple times, and trusted with billions. TurboLoop and Aave answer the same user question — \"where can I park stablecoins and earn yield?\" — but answer it very differently. Aave earns from borrowers paying interest. TurboLoop earns from traders paying swap fees. Same goal, different revenue engine.",
    rows: [
      { category: "Primary use",            turboloop: "Concentrated liquidity yield on stablecoins",         competitor: "Lending — deposit, earn interest from borrowers", turboloopWins: false },
      { category: "Yield source",           turboloop: "PancakeSwap V3 trading fees",                          competitor: "Variable interest from borrowers",                turboloopWins: false },
      { category: "Target APY (USDT)",      turboloop: "Up to 54%",                                            competitor: "Typically 2-8% on stablecoin lending",            turboloopWins: true },
      { category: "Network",                turboloop: "BNB Smart Chain (low gas)",                            competitor: "Ethereum mainnet + Arbitrum + Optimism + others",  turboloopWins: true },
      { category: "Withdrawal",             turboloop: "Anytime, on-chain",                                    competitor: "Anytime if liquidity available",                  turboloopWins: false },
      { category: "Smart contract",         turboloop: "Renounced — no admin keys",                            competitor: "DAO-governed, parameters can change",             turboloopWins: true },
      { category: "Audits",                 turboloop: "Multi-firm audits + verifiable on BscScan",            competitor: "5+ major audits, longest track record in DeFi",   turboloopWins: false },
      { category: "Total Value Locked",     turboloop: "Growing, BSC-native",                                  competitor: "$10B+ across all chains",                          turboloopWins: false },
    ],
    conclusion: "Aave wins on track record, audit count, and TVL. TurboLoop wins on yield rate, lower gas costs, and the simplicity of \"deposit USDT, earn from real trading volume\". If you want maximum security through years of battle-testing, Aave. If you want higher stablecoin yield through revenue-backed concentrated liquidity, TurboLoop.",
    whereCompetitorWins: [
      "Track record — Aave has been live since 2017; TurboLoop is newer",
      "Total Value Locked — Aave's billions provide more proven battle-testing",
      "Multi-chain reach — Aave is on Ethereum + 7+ L2s; TurboLoop is BSC-only",
      "Borrowing — you can also borrow against your deposits on Aave; TurboLoop is yield-only",
    ],
  },
  {
    slug: "yearn",
    competitor: "Yearn Finance",
    competitorTagline: "Auto-compounding yield aggregator on Ethereum",
    competitorLogoEmoji: "🌽",
    intro: "Yearn Finance is the OG yield aggregator — strategists write \"vaults\" that auto-compound yields across DeFi protocols, optimizing for the highest return on a given asset. TurboLoop is a single, focused yield strategy (concentrated liquidity on PancakeSwap V3 stablecoins) wrapped in a renounced contract. Yearn is a marketplace of strategies. TurboLoop is one strategy, executed obsessively well.",
    rows: [
      { category: "Primary use",            turboloop: "One strategy: concentrated stablecoin LP",             competitor: "Many strategies, vault per asset",                turboloopWins: false },
      { category: "Yield source",           turboloop: "PancakeSwap V3 trading fees only",                     competitor: "Multiple sources per vault — lending, LP, etc.",  turboloopWins: false },
      { category: "Target APY (USDT)",      turboloop: "Up to 54%",                                            competitor: "Typically 3-12% on stablecoin vaults",            turboloopWins: true },
      { category: "Network",                turboloop: "BNB Smart Chain",                                      competitor: "Ethereum + a few L2s",                            turboloopWins: false },
      { category: "Strategy management",    turboloop: "Renounced — code is fixed forever",                    competitor: "Strategists can update vaults, optimize",         turboloopWins: false },
      { category: "Risk profile",           turboloop: "Single point of strategy concentration",               competitor: "Diversified across many integrations",            turboloopWins: false },
      { category: "Transparency",           turboloop: "Every position on BscScan, contract is public + renounced", competitor: "Strategies are public but more complex to audit", turboloopWins: true },
      { category: "Performance fee",        turboloop: "0% — you keep ~100% of yield",                         competitor: "10% performance fee on vault profits",            turboloopWins: true },
    ],
    conclusion: "Yearn gives you diversification and managed strategies — at the cost of a 10% performance fee and dependence on strategist decisions. TurboLoop gives you one strategy, no fees, no manager — just a renounced contract executing concentrated liquidity yield from real trading volume. Trade-off: simplicity + zero fees vs strategy diversity + active management.",
    whereCompetitorWins: [
      "Strategy diversification — Yearn supports many vault types; TurboLoop is one strategy",
      "Active optimization — Yearn strategists adapt to market conditions; TurboLoop's renounced code can't",
      "Multi-asset coverage — Yearn vaults exist for ETH, DAI, USDC, etc; TurboLoop is USDT-focused",
    ],
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}
