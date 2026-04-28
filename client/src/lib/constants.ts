export const SITE = {
  name: "Turbo Loop",
  tagline: "Sustainable yield. Transparent by design. Open to everyone.",
  subtitle: "The Complete DeFi Ecosystem | Binance Smart Chain",
  mainApp: "https://turboloop.io",
  trustQuote: "Turbo Loop does not ask you to trust a team. It asks you to verify the code.",
  logo: `${import.meta.env.VITE_R2_PUBLIC_URL || ""}/branding/turboloop-logo.png`,
  logoTransparent: `${import.meta.env.VITE_R2_PUBLIC_URL || ""}/branding/turboloop-logo.png`,
  deckPdf: `${import.meta.env.VITE_R2_PUBLIC_URL || ""}/branding/turboloop-deck.pdf`,
  socials: {
    telegramCommunity: "https://t.me/TurboLoop_Official",
    telegramChat: "https://t.me/TurboLoop_Chat",
    twitter: "https://x.com/TurboLoop_io",
    youtube: "https://www.youtube.com/@OfficialTurbo_Loop",
  },
};

export const ECOSYSTEM_PILLARS = [
  { title: "Turbo Buy", subtitle: "Fiat-to-Crypto Gateway", icon: "CreditCard", description: "Buy USDT directly with local currency. No third-party exchange needed.", color: "#22D3EE" },
  { title: "Turbo Swap", subtitle: "Decentralized Exchange", icon: "ArrowLeftRight", description: "Instant token swaps with low fees. Built directly into the ecosystem.", color: "#A78BFA" },
  { title: "Yield Farming", subtitle: "Up to 54% ROI", icon: "TrendingUp", description: "4 acceleration plans from 7 to 60 days. Compound for exponential growth.", color: "#34D399" },
  { title: "Referral Network", subtitle: "20 Levels Deep", icon: "Users", description: "51% total distribution across 20 levels. Build your network, earn rewards.", color: "#F472B6" },
  { title: "Leadership Program", subtitle: "7 Ranks to Legend", icon: "Award", description: "From Turbo Partner to Turbo Legend. Earn 1% to 10% across 100 levels.", color: "#FBBF24" },
  { title: "Smart Contract Security", subtitle: "Audited & Renounced", icon: "Shield", description: "Independently audited, ownership renounced, 100% LP locked.", color: "#60A5FA" },
];

export const FLYWHEEL_STEPS = [
  { label: "Users Deposit USDT", short: "Deposit" },
  { label: "Funds Enter LP Pool", short: "Liquidity" },
  { label: "LP Generates Yield", short: "Yield" },
  { label: "Yield Distributed Daily", short: "Distribute" },
  { label: "Users Re-Loop", short: "Compound" },
];

export const REVENUE_SOURCES = [
  { title: "LP Rewards", description: "Yield from USDC/USDT liquidity pool activity", icon: "Droplets" },
  { title: "Turbo Swap Fees", description: "Trading fees from the decentralized exchange", icon: "ArrowLeftRight" },
  { title: "Turbo Buy Fees", description: "Transaction fees from fiat-to-crypto gateway", icon: "CreditCard" },
];

export const ROADMAP_DATA = [
  { phase: 1, title: "Smart Contract Development", description: "Core protocol built — yield logic, referral system, leadership tiers coded and tested", status: "completed" as const },
  { phase: 2, title: "Security Audit & Verification", description: "Independent audit passed, contract verified on BscScan, zero vulnerabilities found", status: "completed" as const },
  { phase: 3, title: "Contract Renouncement & LP Lock", description: "Ownership permanently renounced, liquidity locked — no admin keys, no backdoors", status: "completed" as const },
  { phase: 4, title: "Platform Launch", description: "Turbo Buy fiat gateway and Turbo Swap DEX aggregator deployed and live", status: "completed" as const },
  { phase: 5, title: "Community Building & Education", description: "28+ videos in 12 languages, Telegram communities, daily Zoom sessions established", status: "completed" as const },
  { phase: 6, title: "Global Public Expansion", description: "Active promotions, $100K Challenge, Creator Star program, growth across 6+ nations", status: "current" as const },
  { phase: 7, title: "Advanced DeFi Features", description: "New yield strategies, enhanced swap routing, cross-chain capabilities", status: "upcoming" as const },
  { phase: 8, title: "Institutional Partnerships", description: "Enterprise integrations, compliance frameworks, institutional-grade infrastructure", status: "upcoming" as const },
  { phase: 9, title: "Full Ecosystem Maturity", description: "Self-sustaining flywheel, global DeFi standard, community governance", status: "upcoming" as const },
];

// Expanded global community map — 14 countries across 6 continents.
// Scores represent relative community size/activity (0-100).
export const COUNTRY_DATA = [
  { rank: 1, country: "Germany", code: "de", description: "Strongest European Community", score: 100, medal: "gold" },
  { rank: 2, country: "Nigeria", code: "ng", description: "Fastest Growing in Africa", score: 88, medal: "silver" },
  { rank: 3, country: "Indonesia", code: "id", description: "Leading Southeast Asia", score: 76, medal: "bronze" },
  { rank: 4, country: "India", code: "in", description: "Rapidly Expanding", score: 68, medal: "none" },
  { rank: 5, country: "Turkey", code: "tr", description: "Emerging Market Leader", score: 58, medal: "none" },
  { rank: 6, country: "Brazil", code: "br", description: "Latin America Pioneer", score: 52, medal: "none" },
  { rank: 7, country: "Vietnam", code: "vn", description: "Tripled in 2 months", score: 47, medal: "none" },
  { rank: 8, country: "Philippines", code: "ph", description: "Strong Local Hubs", score: 43, medal: "none" },
  { rank: 9, country: "Mexico", code: "mx", description: "Growing Latin Network", score: 38, medal: "none" },
  { rank: 10, country: "Spain", code: "es", description: "Active Iberian Community", score: 34, medal: "none" },
  { rank: 11, country: "Kenya", code: "ke", description: "East Africa Hub", score: 31, medal: "none" },
  { rank: 12, country: "Poland", code: "pl", description: "Central Europe Rising", score: 28, medal: "none" },
  { rank: 13, country: "UAE", code: "ae", description: "Middle East Gateway", score: 25, medal: "none" },
  { rank: 14, country: "Japan", code: "jp", description: "Quality Over Volume", score: 22, medal: "none" },
];

export const LANGUAGE_FLAGS: Record<string, string> = {
  English: "gb", Amharic: "et", Arabic: "sa", Azerbaijani: "az",
  Bengali: "bd", "Chinese (Simplified)": "cn", "Chinese (Traditional)": "tw",
  Czech: "cz", Dutch: "nl", Filipino: "ph", French: "fr",
  Georgian: "ge", German: "de", Greek: "gr", Gujarati: "in",
  Hausa: "ng", Hebrew: "il", Hindi: "in", Hungarian: "hu",
  Indonesian: "id", Italian: "it", Japanese: "jp", Kannada: "in",
  Kazakh: "kz", Khmer: "kh", Korean: "kr", Malay: "my",
  Malayalam: "in", Marathi: "in", Myanmar: "mm", Nepali: "np",
  Pashto: "af", Persian: "ir", Polish: "pl", Portuguese: "br",
  Romanian: "ro", Russian: "ru", Sinhala: "lk", Spanish: "es",
  Swedish: "se", Tamil: "in", Telugu: "in", Thai: "th",
  Turkish: "tr", Ukrainian: "ua", Urdu: "pk", Uzbek: "uz",
  Vietnamese: "vn", Yoruba: "ng",
  // Legacy aliases
  Chinese: "cn",
};

export function getFlagUrl(code: string, size = 40): string {
  // flagcdn supports: w20, w40, w80, w160, w320
  const validSizes = [20, 40, 80, 160, 320];
  const closest = validSizes.reduce((prev, curr) => Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev);
  return `https://flagcdn.com/w${closest}/${code.toLowerCase()}.png`;
}
