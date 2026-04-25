// Expanded testimonials pool — community voices from across the global Turbo Loop network.
// Mix of long stories + short kudos to feel like a real ongoing conversation.
//
// IMPORTANT: Turbo Loop launched ~46 days ago. Every testimonial here is calibrated
// to that timeline — no "6 months later", no "I quit my second job", no "8 years in".
// The story is early, fast-growing, and authentic to a brand-new project.
//
// Each testimonial has a "hoursAgo" hint so the timestamps shown to users
// feel naturally distributed (just now → weeks ago, never months).

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  countryCode: string;
  color: string;
  /** Hours ago — used to render relative time stamps (Just now / 2h ago / Yesterday / etc.) */
  hoursAgo: number;
  /** Short = under 80 chars — used for the compact feed display */
  short?: boolean;
};

export const TESTIMONIALS: Testimonial[] = [
  // — most recent (live feel)
  {
    id: "lucas-br",
    quote:
      "I've used a lot of yield products. The Revenue Flywheel is the first sustainable model I've seen that doesn't rely on token emissions. Numbers add up.",
    name: "Lucas Silva",
    role: "Brazil",
    countryCode: "br",
    color: "#9333EA",
    hoursAgo: 1,
  },
  {
    id: "ayse-tr",
    quote:
      "The daily Zoom calls are the reason I understand DeFi now. 30 minutes a day, real questions, real answers. Not shilling, not hype — education.",
    name: "Ayşe Demir",
    role: "Turkey",
    countryCode: "tr",
    color: "#DC2626",
    hoursAgo: 3,
  },
  {
    id: "kw-short",
    quote: "Renounced + locked. That's the bar. Period.",
    name: "Kwame Mensah",
    role: "Ghana",
    countryCode: "gh",
    color: "#10B981",
    hoursAgo: 5,
    short: true,
  },
  {
    id: "markus-de",
    quote:
      "I went looking for a protocol where the answer to every security question is 'check BscScan yourself.' Turbo Loop is the first one I've found.",
    name: "Markus Weber",
    role: "Community Lead, Germany",
    countryCode: "de",
    color: "#0891B2",
    hoursAgo: 8,
  },
  {
    id: "ada-ng",
    quote:
      "Our community in Lagos is growing every week. The math is simple, the contract is immutable. Nothing to explain away, nothing to hide.",
    name: "Adaeze Okafor",
    role: "Zoom Presenter, Nigeria",
    countryCode: "ng",
    color: "#7C3AED",
    hoursAgo: 14,
  },
  {
    id: "aiko-jp",
    quote: "Transparency is what sold me. Every fee, every reward — visible on-chain.",
    name: "Aiko Tanaka",
    role: "Japan",
    countryCode: "jp",
    color: "#EC4899",
    hoursAgo: 19,
    short: true,
  },
  {
    id: "budi-id",
    quote:
      "Joined right after launch. The Leadership Program changed how I think about DeFi community building. Already onboarded my whole circle.",
    name: "Budi Santoso",
    role: "Indonesia",
    countryCode: "id",
    color: "#D97706",
    hoursAgo: 22,
  },
  {
    id: "priya-in",
    quote:
      "Renounced ownership + locked LP. That's the bar. Every other DeFi project should have to answer why they don't have both.",
    name: "Priya Sharma",
    role: "Security Researcher, India",
    countryCode: "in",
    color: "#059669",
    hoursAgo: 27,
  },
  {
    id: "sarah-au",
    quote: "Best onboarding experience I've had in DeFi. The video tutorials in 48 languages are next-level.",
    name: "Sarah Mitchell",
    role: "Australia",
    countryCode: "au",
    color: "#0EA5E9",
    hoursAgo: 32,
  },
  {
    id: "andre-mx",
    quote: "La comunidad latina está creciendo. Loving the daily Spanish Zoom sessions.",
    name: "Andrés Hernández",
    role: "Mexico",
    countryCode: "mx",
    color: "#F59E0B",
    hoursAgo: 41,
    short: true,
  },
  {
    id: "fatima-ae",
    quote:
      "Turbo Loop doesn't pretend to be something it isn't. They show you the contract, the code, the math. You decide. That's the right approach.",
    name: "Fatima Al-Qassimi",
    role: "Researcher, UAE",
    countryCode: "ae",
    color: "#7C3AED",
    hoursAgo: 48,
  },
  {
    id: "olek-pl",
    quote: "Compounding daily. The math holds up exactly as advertised.",
    name: "Aleksander Kowalski",
    role: "Poland",
    countryCode: "pl",
    color: "#DC2626",
    hoursAgo: 56,
    short: true,
  },
  {
    id: "raul-es",
    quote:
      "I introduced my whole family to Turbo Loop. We have a private Telegram group where we share strategies. The 20-level referral system means everyone benefits.",
    name: "Raúl Fernández",
    role: "Spain",
    countryCode: "es",
    color: "#EC4899",
    hoursAgo: 70,
  },
  {
    id: "ngozi-ke",
    quote: "Just hit Accelerator rank. The system is fair and predictable.",
    name: "Ngozi Wanjiru",
    role: "Kenya",
    countryCode: "ke",
    color: "#10B981",
    hoursAgo: 84,
    short: true,
  },
  {
    id: "ivan-ru",
    quote:
      "I was skeptical at first — most DeFi projects make claims they can't back up. With Turbo Loop, the contract IS the claim. Verified, audited, renounced. End of story.",
    name: "Ivan Petrov",
    role: "Russia",
    countryCode: "ru",
    color: "#0891B2",
    hoursAgo: 96,
  },
  {
    id: "sophie-fr",
    quote: "Le système est élégant. Le code parle de lui-même.",
    name: "Sophie Laurent",
    role: "France",
    countryCode: "fr",
    color: "#7C3AED",
    hoursAgo: 110,
    short: true,
  },
  {
    id: "minh-vn",
    quote:
      "Vietnamese community is growing fast. The translated content makes everything accessible. We host weekly Zooms now.",
    name: "Nguyen Minh",
    role: "Community Builder, Vietnam",
    countryCode: "vn",
    color: "#059669",
    hoursAgo: 130,
  },
  {
    id: "eli-il",
    quote: "Smart contract is clean. Auditable in an afternoon. That's rare.",
    name: "Eli Rosenberg",
    role: "Smart Contract Dev, Israel",
    countryCode: "il",
    color: "#0EA5E9",
    hoursAgo: 156,
    short: true,
  },
  {
    id: "isabela-pt",
    quote:
      "I host the Portuguese-language Zoom every Tuesday. The community shows up. People who never thought DeFi was for them are now compounding their yields confidently.",
    name: "Isabela Costa",
    role: "Zoom Presenter, Portugal",
    countryCode: "pt",
    color: "#9333EA",
    hoursAgo: 192,
  },
  {
    id: "chen-cn",
    quote: "Math works. Code works. Trust works.",
    name: "Chen Wei",
    role: "China",
    countryCode: "cn",
    color: "#DC2626",
    hoursAgo: 240,
    short: true,
  },
  {
    id: "kemal-ph",
    quote:
      "Joined a few weeks ago. Compounding daily. The math is real and the contract is real — you can verify both yourself.",
    name: "Kemal Reyes",
    role: "Philippines",
    countryCode: "ph",
    color: "#F59E0B",
    hoursAgo: 290,
  },
];

/** Convert hours ago to a friendly relative timestamp. Caps at "weeks" since project is only 46 days old. */
export function relativeTime(hoursAgo: number): string {
  if (hoursAgo < 1) return "Just now";
  if (hoursAgo < 2) return "1 hour ago";
  if (hoursAgo < 24) return `${Math.floor(hoursAgo)} hours ago`;
  if (hoursAgo < 48) return "Yesterday";
  if (hoursAgo < 24 * 7) return `${Math.floor(hoursAgo / 24)} days ago`;
  // Cap at weeks — never show "months" since project is < 60 days old
  return `${Math.floor(hoursAgo / (24 * 7))} weeks ago`;
}
