// TurboLoop Cinematic Universe — typed source of truth for the frontend.
// Mirrors scripts/cinematic-manifest.json. All films are bundled into the JS
// (small footprint — text only). Video URLs hit R2 directly; posters hit R2.
//
// Use this everywhere on the frontend instead of doing tRPC fetches for film
// metadata — content is static, doesn't change at runtime, and bundling avoids
// a network round-trip on every page load.

export type Season = 1 | 2 | 3 | 4;

export interface Film {
  /** S1E1..S4E5 ordering */
  season: Season;
  episode: number;
  /** URL slug — used in /films/:slug and DB videos.slug */
  slug: string;
  /** Short, single-line title */
  title: string;
  /** Marketing headline with emojis (e.g. "🚨 THE 0.01% LIE 🚨") */
  headline: string;
  /** One-line tease (used in cards + share previews) */
  tagline: string;
  /** Full writeup body — can be 100-300 words, paragraph form */
  description: string;
  /** R2 URL of the MP4 (always 16:9 landscape, 1080p or 2160p) */
  url: string;
  /** R2 URL of the 16:9 poster JPEG (1280x720) */
  posterUrl: string;
}

export interface SeasonInfo {
  number: Season;
  name: string;
  /** "What this season is about" — appears under the season title */
  theme: string;
  /** Accent color for season banners — hex */
  accent: string;
  emoji: string;
}

const R2_BASE = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";
// Cache-buster appended to cinematic poster URLs. Bump this number whenever we
// regenerate posters on R2 — forces browsers/Telegram/CDN caches to re-fetch
// even though the underlying R2 key is the same. R2 itself ignores query strings.
const POSTER_VERSION = "2";

export const SEASONS: Record<Season, SeasonInfo> = {
  1: {
    number: 1,
    name: "Season 1 — The Problem",
    theme: "Why the system was never built for you. Five films on banks, inflation, and the invisible thieves of wealth.",
    accent: "#EF4444",
    emoji: "🚨",
  },
  2: {
    number: 2,
    name: "Season 2 — The Solution",
    theme: "How TurboLoop replaces the middleman with code. Five films on the engine, the math, and the network.",
    accent: "#0891B2",
    emoji: "⚡",
  },
  3: {
    number: 3,
    name: "Season 3 — The Proof",
    theme: "Why this is mathematically not a Ponzi. Five films on transparency, security, and on-chain truth.",
    accent: "#10B981",
    emoji: "🛡",
  },
  4: {
    number: 4,
    name: "Season 4 — The Movement",
    theme: "Beyond yield, into legacy. Five films on global access, leadership, compounding, and the manifesto.",
    accent: "#7C3AED",
    emoji: "🌍",
  },
};

export const FILMS: Film[] = [
  // ═════════ SEASON 1 — THE PROBLEM ═════════
  {
    season: 1, episode: 1,
    slug: "bank-is-lying",
    title: "Your Bank is Lying to You",
    headline: "🚨 THE 0.01% LIE 🚨",
    tagline: "They make billions. You make pennies.",
    description: `They tell you your money is safe. They tell you 0.01% is a "good return." But while your money sits in their vault losing value to inflation, they lend it out at 15%, 20%, even 30%. They make billions. You make pennies. This isn't a service — it's extraction. Decentralized finance has removed the middleman.`,
    url: `${R2_BASE}/cinematic/bank-is-lying.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/bank-is-lying.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 1, episode: 2,
    slug: "where-does-money-go",
    title: "Where Does Your Money Actually Go?",
    headline: "📊 THE 99.9% PROFIT SPLIT 📊",
    tagline: "You take the risk. They take the profit.",
    description: `The bank earns $10-$20 on your money. They pay for skyscrapers and CEO bonuses. They give you 1 cent. You take 100% of the inflation risk; they take 99.9% of the profit. TurboLoop flips the equation — by deploying your stablecoins directly into PancakeSwap V3 liquidity pools, the smart contract returns virtually 100% of the generated yield back to YOU.`,
    url: `${R2_BASE}/cinematic/where-does-money-go.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/where-does-money-go.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 1, episode: 3,
    slug: "inflation-trap",
    title: "The Inflation Trap",
    headline: "🕵️ THE INVISIBLE THIEF 🕵️",
    tagline: "Your savings account is a slow-motion losing trade.",
    description: `If inflation is 5% and your bank pays you 1%, you are losing 4% of your wealth every single year. You aren't saving money — you are slowly going broke safely. To survive, you must outpace the thief. You need a yield that beats inflation. TurboLoop offers a shield, targeting up to 54% annual yield on stablecoins.`,
    url: `${R2_BASE}/cinematic/inflation-trap.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/inflation-trap.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 1, episode: 4,
    slug: "why-rich-stay-rich",
    title: "Why the Rich Stay Rich and You Don't",
    headline: "🚪 THE GATEKEEPERS ARE GONE 🚪",
    tagline: "Same yield strategies. No minimums. No gatekeepers.",
    description: `You were given a savings account at 0.01% and told investing is "too risky." That wasn't protection. That was gatekeeping. Decentralized finance changed everything. The same yield-generating strategies used by billionaires are available to anyone with a smartphone and $50.`,
    url: `${R2_BASE}/cinematic/why-rich-stay-rich.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/why-rich-stay-rich.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 1, episode: 5,
    slug: "system-not-built-for-you",
    title: "The System Was Never Built for You",
    headline: "📰 BREAKING THE OLD SYSTEM 📰",
    tagline: "Designed in 1913. By the powerful. For the powerful.",
    description: `2008: Banks gambled with your money and lost. The government bailed THEM out with YOUR tax dollars. 2020: Governments printed $13 trillion. Asset prices soared. The rich got richer. Your rent went up. The traditional financial system was designed in 1913 by the powerful, for the powerful. You were never meant to win. But a new system has emerged — built on blockchain, governed by code, open 24/7/365.`,
    url: `${R2_BASE}/cinematic/system-not-built-for-you.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/system-not-built-for-you.jpg?v=${POSTER_VERSION}`,
  },

  // ═════════ SEASON 2 — THE SOLUTION ═════════
  {
    season: 2, episode: 1,
    slug: "what-is-turboloop",
    title: "What is TurboLoop?",
    headline: "⚡ THE DEFI ENGINE ⚡",
    tagline: "No bank. No broker. Just you and the code.",
    description: `No bank. No broker. No middleman. Just you, and the code. You deposit stablecoins. The smart contract deploys them into optimized liquidity positions. Trading fees flow back to you as yield — up to 54% annually. Plus, a 20-level network creates multiple streams of income. This is not trust. This is math.`,
    url: `${R2_BASE}/cinematic/what-is-turboloop.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/what-is-turboloop.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 2, episode: 2,
    slug: "smart-contract-bank-manager",
    title: "The Smart Contract — Your New Bank Manager",
    headline: "🤖 CODE > CEOs 🤖",
    tagline: "It cannot be bribed. It cannot make mistakes.",
    description: `A smart contract replaces ALL of them. It's a self-executing program on the blockchain that follows exact rules, every time, without exception. It cannot be bribed. It cannot make mistakes. Because a smart contract costs fractions of a cent to execute, virtually 100% of the yield goes back to YOU. No CEO. No Board. No Building. Just Code.`,
    url: `${R2_BASE}/cinematic/smart-contract-bank-manager.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/smart-contract-bank-manager.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 2, episode: 3,
    slug: "54-percent-real-math",
    title: "How 54% is Real Math, Not Magic",
    headline: "🧮 THE MATH BEHIND 54% 🧮",
    tagline: "Concentrated liquidity. 10x to 50x amplified fees.",
    description: `PancakeSwap V3 processes billions in trading volume. Every trade generates a fee. Those fees go to liquidity providers. That's where YOUR yield comes from — real trading activity. TurboLoop uses concentrated liquidity, targeting where 90% of trades happen. This amplifies fee earnings by 10x to 50x compared to traditional methods. 54% isn't a promise. It's financial engineering.`,
    url: `${R2_BASE}/cinematic/54-percent-real-math.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/54-percent-real-math.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 2, episode: 4,
    slug: "20-level-network",
    title: "The 20-Level Network — Your Digital Empire",
    headline: "🌐 BUILD YOUR DIGITAL EMPIRE 🌐",
    tagline: "You build it once. It generates while you sleep.",
    description: `Every person in your network who earns yield generates a small percentage that flows up to you — generated additionally by the protocol, not taken from them. A traditional job pays you once for your time. A network pays you repeatedly for your initial effort. You build it once, and it generates income while you sleep. This is a digital distribution network.`,
    url: `${R2_BASE}/cinematic/20-level-network.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/20-level-network.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 2, episode: 5,
    slug: "stablecoins-stay-safe",
    title: "Stablecoins — Why Your Money Stays Safe",
    headline: "🛡️ STABILITY MEETS GROWTH 🛡️",
    tagline: "Pegged to the dollar. Built for boring stability.",
    description: `A stablecoin (like USDT) is pegged to the US dollar. It doesn't go up or down. It's designed to be boring. TurboLoop operates exclusively with stablecoins. Your principal remains stable, and the 54% yield is earned ON TOP of that stable base. You get the growth of DeFi without the rollercoaster of crypto volatility.`,
    url: `${R2_BASE}/cinematic/stablecoins-stay-safe.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/stablecoins-stay-safe.jpg?v=${POSTER_VERSION}`,
  },

  // ═════════ SEASON 3 — THE PROOF ═════════
  {
    season: 3, episode: 1,
    slug: "code-is-law",
    title: "Code is Law — The Transparency Promise",
    headline: "📜 CODE IS LAW 📜",
    tagline: "You don't trust. You verify.",
    description: `In the new world, trust is built on code. A smart contract executes exactly as written. It cannot be altered. It cannot be overridden. The code is the law. TurboLoop operates in the open. Every line of code is public. Every transaction is traceable on the blockchain. You don't need to trust anyone — you verify everything yourself.`,
    url: `${R2_BASE}/cinematic/code-is-law.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/code-is-law.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 3, episode: 2,
    slug: "myth-buster-ponzi",
    title: "The Myth Buster — Ponzi vs. Real Yield",
    headline: "🛑 BUSTING THE PONZI MYTH 🛑",
    tagline: "Yield comes from real trades. Not recruitment.",
    description: `TurboLoop is different. Your yield comes from PancakeSwap V3 trading fees — generated by millions of real trades every day. This revenue exists whether TurboLoop has 100 users or 100,000 users. If no new members join TurboLoop, the existing liquidity pools STILL generate trading fees. Your yield STILL flows. The system is self-sustaining because the revenue comes from the market, not from recruitment.`,
    url: `${R2_BASE}/cinematic/myth-buster-ponzi.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/myth-buster-ponzi.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 3, episode: 3,
    slug: "blockchain-never-lies-film",
    title: "The Blockchain Never Lies",
    headline: "🔗 THE INCORRUPTIBLE WITNESS 🔗",
    tagline: "Most complete financial record in human history.",
    description: `The blockchain shows everything. Every transaction. Every timestamp. Every wallet address. Nothing is hidden or edited. It is the most complete financial record in human history. With TurboLoop, you can verify every deposit, yield distribution, and withdrawal in real-time on BscScan. Because blockchain records cannot be changed, no one can falsify your earnings.`,
    url: `${R2_BASE}/cinematic/blockchain-never-lies-film.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/blockchain-never-lies-film.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 3, episode: 4,
    slug: "unbreakable-vault",
    title: "Security, Audits, and the Unbreakable Vault",
    headline: "🔐 THE UNBREAKABLE VAULT 🔐",
    tagline: "Immutable. Renounced. No backdoor. No kill switch.",
    description: `TurboLoop was built on three pillars of security: 1) The smart contract is immutable (cannot be changed). 2) Funds exist in decentralized liquidity pools (no central wallet to drain). 3) NO ADMIN KEYS — the developers renounced all access. No backdoor. No kill switch. Your bank can freeze your account. TurboLoop cannot. Your money is truly yours.`,
    url: `${R2_BASE}/cinematic/unbreakable-vault.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/unbreakable-vault.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 3, episode: 5,
    slug: "defi-vs-banks",
    title: "DeFi vs. Banks — The Final Comparison",
    headline: "⚖️ THE FINAL COMPARISON ⚖️",
    tagline: "Open 24/7/365. 3-5 seconds. Up to 54%. You keep it all.",
    description: `BANKS: Open 8 hours a day. DEFI: Open 24/7/365. BANKS: 3-5 days for a transfer. DEFI: 3-5 seconds. BANKS: 0.01% return, they keep 99% of the profit. DEFI: Up to 54% yield, you keep virtually 100% of the profit. BANKS: Can freeze your account anytime. DEFI: Immutable smart contracts, you have total control. The comparison is over. The choice is clear.`,
    url: `${R2_BASE}/cinematic/defi-vs-banks.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/defi-vs-banks.jpg?v=${POSTER_VERSION}`,
  },

  // ═════════ SEASON 4 — THE MOVEMENT ═════════
  {
    season: 4, episode: 1,
    slug: "global-revolution-lagos-london",
    title: "The Global Revolution — From Lagos to London",
    headline: "🌍 THE GLOBAL REVOLUTION 🌍",
    tagline: "Geography no longer determines your destiny.",
    description: `The same smart contract. The same math. The same opportunity. For the first time in financial history, geography does not determine your economic destiny. Traditional finance was built on exclusion. DeFi is built on inclusion. You only need a smartphone and the desire to change your financial future.`,
    url: `${R2_BASE}/cinematic/global-revolution-lagos-london.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/global-revolution-lagos-london.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 4, episode: 2,
    slug: "compounding-secret",
    title: "The Compounding Secret — Time is Your Weapon",
    headline: "⏳ TIME IS YOUR WEAPON ⏳",
    tagline: "Your yield earns yield. The math accelerates.",
    description: `If you deposit $1,000 at 54% annual yield and reinvest: Year 1: $1,540. Year 2: $2,372. Year 3: $3,652. Your money didn't just grow. It accelerated. Your yield earns yield. Every day your money sits idle in a bank is a day of lost compounding. The best time to start was yesterday. The second best time is now.`,
    url: `${R2_BASE}/cinematic/compounding-secret.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/compounding-secret.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 4, episode: 3,
    slug: "build-your-legacy",
    title: "Build Your Legacy — Generational Wealth",
    headline: "🌳 BUILD YOUR LEGACY 🌳",
    tagline: "An inheritance that cannot be seized or inflated.",
    description: `TurboLoop offers a digital asset that works for your family 24/7. Your liquidity positions generate yield continuously. Your network grows while you sleep. Because it's on the blockchain, it cannot be seized or inflated away. This is not just an investment. It is an inheritance. A gift to the future.`,
    url: `${R2_BASE}/cinematic/build-your-legacy.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/build-your-legacy.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 4, episode: 4,
    slug: "leadership-path",
    title: "The Leadership Path — From Member to Leader",
    headline: "👑 THE LEADERSHIP PATH 👑",
    tagline: "Educate before you recruit. Create more leaders, not followers.",
    description: `Leadership is rewarded mathematically. Earn 5% bonuses on levels 1-10, and 10% on levels 11-20. This isn't taken from your team — it's generated additionally by the protocol. But true leadership is about integrity. The best leaders educate before they recruit. They build trust through transparency, not hype. A great leader creates more leaders, not followers.`,
    url: `${R2_BASE}/cinematic/leadership-path.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/leadership-path.jpg?v=${POSTER_VERSION}`,
  },
  {
    season: 4, episode: 5,
    slug: "manifesto",
    title: "The TurboLoop Manifesto — Join the Sovereign Movement",
    headline: "⚡ THE SOVEREIGN MOVEMENT ⚡",
    tagline: "Your Money. Your Power. Your Future.",
    description: `TurboLoop is a declaration of financial independence. It is a community of sovereign individuals who refuse to accept 0.01% while banks earn 20% with their money. The math is proven. The code is live. The community is growing. The only thing missing is you. Your Money. Your Power. Your Future.`,
    url: `${R2_BASE}/cinematic/manifesto.mp4`,
    posterUrl: `${R2_BASE}/cinematic-thumbs/manifesto.jpg?v=${POSTER_VERSION}`,
  },
];

// ─── Helpers ───

export function getFilm(slug: string): Film | undefined {
  return FILMS.find((f) => f.slug === slug);
}

export function getFilmsBySeason(season: Season): Film[] {
  return FILMS.filter((f) => f.season === season).sort((a, b) => a.episode - b.episode);
}

export function getNextFilm(slug: string): Film | undefined {
  const idx = FILMS.findIndex((f) => f.slug === slug);
  if (idx < 0 || idx >= FILMS.length - 1) return undefined;
  return FILMS[idx + 1];
}

export function getPrevFilm(slug: string): Film | undefined {
  const idx = FILMS.findIndex((f) => f.slug === slug);
  if (idx <= 0) return undefined;
  return FILMS[idx - 1];
}

/** Pillar slug → film slug map for ecosystem pillar pages */
export const PILLAR_TO_FILM: Record<string, string> = {
  "turbo-buy": "what-is-turboloop",
  "turbo-swap": "smart-contract-bank-manager",
  "yield-farming": "54-percent-real-math",
  "referral-network": "20-level-network",
  "leadership-program": "leadership-path",
  "smart-contract-security": "unbreakable-vault",
};
