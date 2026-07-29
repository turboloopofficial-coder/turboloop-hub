// ─────────────────────────────────────────────────────────────────────────────
// TurboLoop Episode Config — SINGLE SOURCE OF TRUTH for all episode metadata
//
// ✅  TO ADD A NEW EPISODE:
//     1. Add one entry to the EPISODES array below
//     2. Run the upload script to upload the English video to R2 + YouTube
//     3. Generate thumbnails for all 65 languages (ep{n}_thumb_{lang}.jpg)
//     4. Submit to Rask for dubbing
//     5. The auto-poller, workers, website, and podcast page all update automatically
//
// ❌  DO NOT touch VideoExplainerSection.tsx, podcast/page.tsx, or workers
//     when adding a new episode — they are fully data-driven from this file.
// ─────────────────────────────────────────────────────────────────────────────

export interface EpisodeConfig {
  /** Short ID used as key in language data, e.g. "ep1", "ep2" */
  id: string;
  /** Episode number for display */
  number: number;
  /** Main title shown on the page */
  title: string;
  /** Subtitle shown below title */
  subtitle: string;
  /** Longer description paragraph */
  description: string;
  /** Duration string, e.g. "20 min" */
  duration: string;
  /** Badge label, e.g. "Deep Dive · Episode 1" */
  badgeLabel: string;
  /** Tailwind color key: "cyan" | "violet" | "amber" | "emerald" | "rose" */
  badgeColor: "cyan" | "violet" | "amber" | "emerald" | "rose" | "blue" | "pink";
  /** Topics shown as pills */
  topics: string[];
  /** Pull quote from CEO */
  quote: string;
  /** R2 filename prefix for English video, e.g. "turboloop-explainer" or "turboloop-ep2" */
  r2Prefix: string;
  /** YouTube video ID for the English version */
  youtubeId: string;
  /** Whether 1.41x speed-up was applied before Rask submission */
  speedUp: boolean;
  /** Rask project name prefix used to identify this episode's projects in Rask */
  raskPrefix: string | null;
  /** R2 thumbnail folder, e.g. "thumbnails/ep2" */
  thumbFolder: string;
}

export const EPISODES: EpisodeConfig[] = [
  {
    id: "ep1",
    number: 1,
    title: "Your Bank is Lying to You",
    subtitle: "TurboLoop Explained",
    description:
      "A 20-minute cinematic breakdown covering security audits, smart contract architecture, and how your USDT earns fixed returns on BNB Smart Chain — dual-audited, LP locked, and open to anyone with $1 USDT.",
    duration: "20 min",
    badgeLabel: "Deep Dive · Episode 1",
    badgeColor: "cyan",
    topics: ["Security Audits", "Smart Contracts", "54% APY", "LP Locked", "BNB Smart Chain", "USDT Yield"],
    quote: "The code is immutable. The returns are fixed. The auditors verified it. What else do you need?",
    r2Prefix: "turboloop-explainer",
    youtubeId: "LFViES_Qbzg",
    speedUp: false,
    raskPrefix: null,
    thumbFolder: "videos",
  },
  {
    id: "ep2",
    number: 2,
    title: "Is TurboLoop Legit?",
    subtitle: "CEO Answers 19 Tough Questions",
    description:
      "CEO Dave goes on record answering the hardest community questions about revenue sustainability, smart contract security, on-chain verification, and the $100K bug bounty challenge.",
    duration: "21 min",
    badgeLabel: "Turbo Podcast · Episode 2",
    badgeColor: "cyan",
    topics: ["CEO AMA", "Revenue Model", "On-Chain Proof", "$100K Bounty", "Community Q&A", "Sustainability"],
    quote: "Ask me anything. I have nothing to hide — because the blockchain has nothing to hide.",
    r2Prefix: "turboloop-ep2",
    youtubeId: "cKm_XQpK4NI",
    speedUp: true,
    raskPrefix: "TurboLoop Ep2",
    thumbFolder: "thumbnails/ep2",
  },
  {
    id: "ep3",
    number: 3,
    title: "DeFi for ALL Investors",
    subtitle: "Why TurboLoop Works for Everyone",
    description:
      "CEO Dave breaks down how TurboLoop's 3-stream income model works for everyone — from first-time crypto users to experienced investors across every income level and background.",
    duration: "15 min",
    badgeLabel: "Turbo Podcast · Episode 3",
    badgeColor: "violet",
    topics: ["3-Stream Income", "For Beginners", "For Experts", "Fixed Yield", "Global Access", "DeFi Basics"],
    quote: "You don't need to understand blockchain to benefit from it. You just need $1 USDT and a wallet.",
    r2Prefix: "turboloop-ep3",
    youtubeId: "08dLfBMf2JM",
    speedUp: true,
    raskPrefix: "TurboLoop Ep3",
    thumbFolder: "thumbnails/ep3",
  },
  {
    id: "ep4",
    number: 4,
    title: "TurboShield Explained",
    subtitle: "Your DeFi Insurance, On-Chain",
    description:
      "CEO Dave reveals how TurboShield — TurboLoop's on-chain insurance layer — protects 8,000+ investors from smart contract risk, market volatility, and protocol failures.",
    duration: "11 min",
    badgeLabel: "Turbo Podcast · Episode 4",
    badgeColor: "amber",
    topics: ["TurboShield", "On-Chain Insurance", "Risk Protection", "Smart Contracts", "Investor Safety", "DeFi Security"],
    quote: "TurboShield isn't a promise. It's a smart contract. The code protects you — not our word.",
    r2Prefix: "turboloop-ep4",
    youtubeId: "yL3fjbJkaEM",
    speedUp: true,
    raskPrefix: "TurboLoop Ep4",
    thumbFolder: "thumbnails/ep4",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ADD NEW EPISODES HERE ↓
  // Copy the block above, increment the number, fill in the details.
  // Everything else (website, podcast page, workers, poller) updates automatically.
  // ─────────────────────────────────────────────────────────────────────────
];

/** Get episode config by ID */
export function getEpisode(id: string): EpisodeConfig | undefined {
  return EPISODES.find(e => e.id === id);
}

/** Get all episode IDs in order */
export const EPISODE_IDS = EPISODES.map(e => e.id);

/** Badge color → Tailwind class map */
export const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  cyan:    { bg: "bg-cyan-500/10",    text: "text-cyan-400",    border: "border-cyan-500/20" },
  violet:  { bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/20" },
  amber:   { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  rose:    { bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/20" },
  blue:    { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/20" },
  pink:    { bg: "bg-pink-500/10",    text: "text-pink-400",    border: "border-pink-500/20" },
};
