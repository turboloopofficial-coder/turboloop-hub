export const SITE = {
  name: "Turbo Loop",
  tagline: "Sustainable yield. Transparent by design. Open to everyone.",
  subtitle: "The Complete DeFi Ecosystem | Binance Smart Chain",
  mainApp: "https://turboloop.io",
  trustQuote: "Turbo Loop does not ask you to trust a team. It asks you to verify the code.",
  logo: "/manus-storage/turboloop_logo_premium_v2_6b718b2d.png",
  logoTransparent: "/manus-storage/logo_transparent_cdea807d.png",
  deckPdf: "/manus-storage/turboloop-deck_26e8d3a1.pdf",
  socials: {
    telegramCommunity: "https://t.me/TurboLoop_Official",
    telegramChat: "https://t.me/TurboLoop_Chat",
    twitter: "https://x.com/Turbo_Loop",
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

export const COUNTRY_DATA = [
  { rank: 1, country: "Germany", code: "de", description: "Strongest European Community", score: 100, medal: "gold" },
  { rank: 2, country: "Nigeria", code: "ng", description: "Fastest Growing in Africa", score: 85, medal: "silver" },
  { rank: 3, country: "Indonesia", code: "id", description: "Leading Southeast Asia", score: 72, medal: "bronze" },
  { rank: 4, country: "India", code: "in", description: "Rapidly Expanding", score: 65, medal: "none" },
  { rank: 5, country: "Turkey", code: "tr", description: "Emerging Market Leader", score: 50, medal: "none" },
  { rank: 6, country: "Brazil", code: "br", description: "Latin America Pioneer", score: 40, medal: "none" },
];

export const LANGUAGE_FLAGS: Record<string, string> = {
  English: "gb", Hindi: "in", French: "fr", Spanish: "es", Vietnamese: "vn",
  Indonesian: "id", Italian: "it", Russian: "ru", Japanese: "jp", German: "de",
  Arabic: "sa", Chinese: "cn", Malay: "my",
};

export function getFlagUrl(code: string, size = 48): string {
  return `https://flagcdn.com/w${size}/${code.toLowerCase()}.png`;
}
