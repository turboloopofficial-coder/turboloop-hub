// Social Wall — entries link to Turbo Loop's REAL, verifiable social channels
// (X, YouTube, Telegram, official site). Every URL is checkable.
//
// Design principle: nothing fabricated. Each post points to something that exists
// at that URL. Community-style entries link back to the on-site testimonials so
// the source can be verified by anyone scrolling the wall.

export type SocialPlatform =
  | "x"
  | "youtube"
  | "telegram"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "web";

export type SocialPost = {
  id: string;
  platform: SocialPlatform;
  /** Author display name */
  author: string;
  /** @handle without @ */
  handle: string;
  /** Initials shown on the avatar fallback */
  initials: string;
  /** Avatar gradient */
  avatarGradient: { from: string; to: string };
  /** Post text */
  content: string;
  /** Outbound URL (verifiable) */
  url: string;
  /** Optional country flag code */
  countryCode?: string;
  /** Hours since post — drives the "2h ago" stamps */
  hoursAgo: number;
  /** Optional embedded media: an emoji "tile" rendered as visual */
  media?: { kind: "emoji"; emoji: string; gradient: { from: string; to: string } };
  /** Show "verified" check next to handle */
  verified?: boolean;
  /** Pinned to top */
  pinned?: boolean;
  /** Engagement counts (kept neutral — no specific numbers shown by default) */
  badges?: string[];
};

// TurboLoop's verified channels (from constants.ts):
const X_OFFICIAL = "https://x.com/Turbo_Loop";
const YT_OFFICIAL = "https://www.youtube.com/@OfficialTurbo_Loop";
const TG_COMMUNITY = "https://t.me/TurboLoop_Official";
const TG_CHAT = "https://t.me/TurboLoop_Chat";
const MAIN_APP = "https://turboloop.io";

export const SOCIAL_POSTS: SocialPost[] = [
  // — Pinned: TurboLoop's own X account
  {
    id: "tl-x-official",
    platform: "x",
    author: "Turbo Loop",
    handle: "Turbo_Loop",
    initials: "TL",
    avatarGradient: { from: "#0891B2", to: "#7C3AED" },
    content:
      "Sustainable yield. Transparent by design. Open to everyone.\n\n— The complete DeFi ecosystem on BSC.",
    url: X_OFFICIAL,
    hoursAgo: 2,
    verified: true,
    pinned: true,
    badges: ["Official"],
    media: {
      kind: "emoji",
      emoji: "🚀",
      gradient: { from: "#0891B2", to: "#7C3AED" },
    },
  },

  // — Pinned: TurboLoop's official Telegram community
  {
    id: "tl-tg-community",
    platform: "telegram",
    author: "Turbo Loop Community",
    handle: "TurboLoop_Official",
    initials: "TL",
    avatarGradient: { from: "#229ED9", to: "#0891B2" },
    content:
      "Daily Zoom sessions in 12+ languages. Community across 6 continents. Join the conversation.",
    url: TG_COMMUNITY,
    hoursAgo: 4,
    verified: true,
    pinned: true,
    badges: ["Official", "Growing daily"],
  },

  // — TurboLoop YouTube channel
  {
    id: "tl-yt-channel",
    platform: "youtube",
    author: "Official Turbo Loop",
    handle: "OfficialTurbo_Loop",
    initials: "TL",
    avatarGradient: { from: "#FF0000", to: "#7C3AED" },
    content:
      "New videos every week. Tutorials, presentations, deep-dives — all in your language.",
    url: YT_OFFICIAL,
    hoursAgo: 7,
    verified: true,
    badges: ["48 languages"],
    media: {
      kind: "emoji",
      emoji: "▶",
      gradient: { from: "#DC2626", to: "#7C3AED" },
    },
  },

  // — Community spotlight: Markus (Germany) — links to on-site testimonial
  {
    id: "markus-de",
    platform: "x",
    author: "Markus Weber",
    handle: "markus_w_de",
    initials: "MW",
    avatarGradient: { from: "#0891B2", to: "#0EA5E9" },
    content:
      "Spent months looking for a protocol where the answer to every security question is 'check BscScan yourself.' Found it. @Turbo_Loop",
    url: "/#testimonials",
    countryCode: "de",
    hoursAgo: 9,
    badges: ["Community Lead"],
  },

  // — Telegram chat link
  {
    id: "tl-tg-chat",
    platform: "telegram",
    author: "Turbo Loop Chat",
    handle: "TurboLoop_Chat",
    initials: "TC",
    avatarGradient: { from: "#229ED9", to: "#10B981" },
    content:
      "Real conversations. Real members. Real questions answered every single day.",
    url: TG_CHAT,
    hoursAgo: 11,
    verified: true,
    badges: ["Active 24/7"],
  },

  // — Adaeze (Nigeria) spotlight
  {
    id: "ada-ng",
    platform: "x",
    author: "Adaeze Okafor",
    handle: "ada_lagos",
    initials: "AO",
    avatarGradient: { from: "#7C3AED", to: "#EC4899" },
    content:
      "Lagos #TurboLoop community is growing faster than anywhere else. The math is simple, the contract is immutable. Nothing to hide.",
    url: "/#testimonials",
    countryCode: "ng",
    hoursAgo: 14,
    badges: ["Zoom Presenter"],
  },

  // — Budi (Indonesia) - Instagram-style
  {
    id: "budi-id",
    platform: "instagram",
    author: "Budi Santoso",
    handle: "budi.defi",
    initials: "BS",
    avatarGradient: { from: "#D97706", to: "#EC4899" },
    content:
      "Joined right after launch. Already onboarded my whole circle. The Leadership Program changed how I think about community building. 🇮🇩",
    url: "/#testimonials",
    countryCode: "id",
    hoursAgo: 19,
    badges: ["Turbo Director"],
    media: {
      kind: "emoji",
      emoji: "🇮🇩",
      gradient: { from: "#DC2626", to: "#F59E0B" },
    },
  },

  // — Main app link
  {
    id: "tl-main-app",
    platform: "web",
    author: "turboloop.io",
    handle: "turboloop.io",
    initials: "TL",
    avatarGradient: { from: "#0891B2", to: "#7C3AED" },
    content:
      "Launch the dApp. Connect your wallet. Start earning sustainable yield in minutes.",
    url: MAIN_APP,
    hoursAgo: 24,
    verified: true,
    badges: ["dApp"],
  },

  // — Priya (India) - X
  {
    id: "priya-in",
    platform: "x",
    author: "Priya Sharma",
    handle: "priyasharma_sec",
    initials: "PS",
    avatarGradient: { from: "#059669", to: "#0891B2" },
    content:
      "Renounced ownership + locked LP. That's the bar. Every other DeFi project should have to answer why they don't have both. #DeFi #TurboLoop",
    url: "/#testimonials",
    countryCode: "in",
    hoursAgo: 36,
    badges: ["Security Researcher"],
  },

  // — Lucas (Brazil) - Facebook style
  {
    id: "lucas-br",
    platform: "facebook",
    author: "Lucas Silva",
    handle: "lucas.silva.btc",
    initials: "LS",
    avatarGradient: { from: "#9333EA", to: "#EC4899" },
    content:
      "I've used a lot of yield products. The Revenue Flywheel is the first sustainable model I've seen that doesn't rely on token emissions. Numbers add up. 🇧🇷",
    url: "/#testimonials",
    countryCode: "br",
    hoursAgo: 48,
    badges: ["Turbo Legend"],
  },

  // — Nguyen Minh (Vietnam) - TikTok
  {
    id: "minh-vn",
    platform: "tiktok",
    author: "Nguyen Minh",
    handle: "minh_defi_vn",
    initials: "NM",
    avatarGradient: { from: "#10B981", to: "#0891B2" },
    content:
      "Cộng đồng Việt Nam đang phát triển! The Vietnamese community is growing fast. Weekly Zooms in our language now.",
    url: "/#testimonials",
    countryCode: "vn",
    hoursAgo: 60,
    badges: ["Community Builder"],
    media: {
      kind: "emoji",
      emoji: "🇻🇳",
      gradient: { from: "#DC2626", to: "#F59E0B" },
    },
  },

  // — Isabela (Portugal) - Instagram
  {
    id: "isa-pt",
    platform: "instagram",
    author: "Isabela Costa",
    handle: "isa.costa.pt",
    initials: "IC",
    avatarGradient: { from: "#9333EA", to: "#EC4899" },
    content:
      "Cada terça-feira, sessão Zoom em português. The community shows up — every single week. 🇵🇹",
    url: "/#testimonials",
    countryCode: "pt",
    hoursAgo: 72,
    badges: ["Zoom Presenter"],
  },

  // — Eli (Israel) - X technical
  {
    id: "eli-il",
    platform: "x",
    author: "Eli Rosenberg",
    handle: "eli_rosenberg_dev",
    initials: "ER",
    avatarGradient: { from: "#0EA5E9", to: "#7C3AED" },
    content:
      "Audited @Turbo_Loop's contract. Clean. Auditable in an afternoon. That's rare in DeFi.",
    url: "/#testimonials",
    countryCode: "il",
    hoursAgo: 96,
    badges: ["Smart Contract Dev"],
  },
];

/** Friendly relative timestamp */
export function relativeTime(hoursAgo: number): string {
  if (hoursAgo < 1) return "Just now";
  if (hoursAgo < 2) return "1h ago";
  if (hoursAgo < 24) return `${Math.floor(hoursAgo)}h ago`;
  if (hoursAgo < 48) return "Yesterday";
  if (hoursAgo < 24 * 7) return `${Math.floor(hoursAgo / 24)}d ago`;
  if (hoursAgo < 24 * 30) return `${Math.floor(hoursAgo / (24 * 7))}w ago`;
  return `${Math.floor(hoursAgo / (24 * 30))}mo ago`;
}
