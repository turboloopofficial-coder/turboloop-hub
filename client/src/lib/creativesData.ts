// Curated brand creatives & banners for the Creatives Hub.
// These are designed-in-CSS visual cards (no external images needed) — each one
// is a "post" with a title, caption, accent gradient, and category.
//
// Categories: announcement | promotion | milestone | spotlight | education

export type CreativeCategory =
  | "announcement"
  | "promotion"
  | "milestone"
  | "spotlight"
  | "education";

export type Creative = {
  id: string;
  category: CreativeCategory;
  title: string;
  caption: string;
  /** Optional emoji used as a visual anchor */
  emoji?: string;
  /** Optional sub-line */
  byline?: string;
  /** Background gradient stops */
  gradient: { from: string; via: string; to: string };
  /** "NEW" badge if posted recently */
  daysAgo: number;
  /** Optional outbound URL */
  url?: string;
  /** Optional country flag code */
  countryCode?: string;
};

export const CREATIVES: Creative[] = [
  {
    id: "100k-bounty",
    category: "promotion",
    title: "$100,000 Security Bounty",
    caption: "Find centralization in the smart contract. We pay. No questions asked.",
    emoji: "🏆",
    byline: "Open to anyone, paid in USDT",
    gradient: { from: "#0F172A", via: "#7C3AED", to: "#F59E0B" },
    daysAgo: 1,
    url: "/#promotions",
  },
  {
    id: "renounced-ownership",
    category: "announcement",
    title: "Ownership Renounced. Forever.",
    caption: "No admin keys. No backdoors. The contract is now the only authority.",
    emoji: "🔒",
    byline: "Verified on BscScan",
    gradient: { from: "#0891B2", via: "#10B981", to: "#7C3AED" },
    daysAgo: 2,
    url: "/#trust",
  },
  {
    id: "48-languages",
    category: "milestone",
    title: "48 Languages Live",
    caption: "From Spanish to Swahili — the Turbo Loop ecosystem is now accessible globally.",
    emoji: "🌍",
    byline: "Education in your language",
    gradient: { from: "#0EA5E9", via: "#7C3AED", to: "#EC4899" },
    daysAgo: 3,
    url: "/#videos",
  },
  {
    id: "creator-star",
    category: "promotion",
    title: "Content Creator Star",
    caption: "Top community creators get featured, funded, and promoted across all our channels.",
    emoji: "⭐",
    byline: "Apply via Telegram",
    gradient: { from: "#F59E0B", via: "#EC4899", to: "#7C3AED" },
    daysAgo: 4,
    url: "/#promotions",
  },
  {
    id: "lagos-spotlight",
    category: "spotlight",
    title: "Lagos Community Spotlight",
    caption: "Adaeze and the Nigerian team host weekly Zoom calls — community growing every week.",
    emoji: "🇳🇬",
    byline: "Africa's fastest-growing chapter",
    gradient: { from: "#10B981", via: "#0891B2", to: "#7C3AED" },
    daysAgo: 5,
    countryCode: "ng",
  },
  {
    id: "lp-locked",
    category: "announcement",
    title: "100% LP Locked",
    caption: "Liquidity is permanently locked. Cannot be withdrawn, ever. By design.",
    emoji: "🔐",
    byline: "Verifiable on PinkSale",
    gradient: { from: "#7C3AED", via: "#0891B2", to: "#10B981" },
    daysAgo: 6,
    url: "/#trust",
  },
  {
    id: "zoom-presenter",
    category: "promotion",
    title: "Local Zoom Presenter",
    caption: "Host weekly sessions in your language. Earn rewards. Build your community.",
    emoji: "🎤",
    byline: "Open program — apply now",
    gradient: { from: "#EC4899", via: "#7C3AED", to: "#0891B2" },
    daysAgo: 7,
    url: "/#promotions",
  },
  {
    id: "germany-spotlight",
    category: "spotlight",
    title: "Strongest in Europe: 🇩🇪",
    caption: "Markus and the German community lead the European leaderboard. Disciplined, deep, and growing.",
    emoji: "🥇",
    byline: "#1 country by community size",
    gradient: { from: "#0891B2", via: "#7C3AED", to: "#EC4899" },
    daysAgo: 8,
    countryCode: "de",
  },
  {
    id: "audit-passed",
    category: "milestone",
    title: "Independent Audit Passed",
    caption: "Smart contract independently audited. Zero critical findings. Report public.",
    emoji: "✅",
    byline: "Audited by external firm",
    gradient: { from: "#10B981", via: "#059669", to: "#0891B2" },
    daysAgo: 10,
    url: "/#trust",
  },
  {
    id: "revenue-flywheel",
    category: "education",
    title: "The Revenue Flywheel",
    caption: "3 income streams. 1 self-sustaining engine. Yields powered by real protocol revenue.",
    emoji: "⚙️",
    byline: "Watch the explainer",
    gradient: { from: "#7C3AED", via: "#EC4899", to: "#F59E0B" },
    daysAgo: 12,
    url: "/#flywheel",
  },
  {
    id: "20-levels-deep",
    category: "education",
    title: "Referral Network: 20 Levels",
    caption: "51% total distribution across 20 levels. The deepest referral system in DeFi.",
    emoji: "🌐",
    byline: "Learn how it works",
    gradient: { from: "#0EA5E9", via: "#0891B2", to: "#10B981" },
    daysAgo: 14,
    url: "/#flywheel",
  },
  {
    id: "indonesia-rise",
    category: "spotlight",
    title: "🇮🇩 Indonesia Rising",
    caption: "Budi's network is expanding across Southeast Asia. The hub is on fire.",
    emoji: "🚀",
    byline: "Fastest growth this month",
    gradient: { from: "#DC2626", via: "#F59E0B", to: "#EC4899" },
    daysAgo: 16,
    countryCode: "id",
  },
];
