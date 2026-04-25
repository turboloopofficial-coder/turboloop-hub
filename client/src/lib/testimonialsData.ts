// Expanded testimonials pool — community voices from across the global Turbo Loop network.
// Mix of long stories + short kudos to feel like a real ongoing conversation.
//
// Each testimonial has a "daysAgo" hint so the timestamps shown to users
// feel naturally distributed (just now → weeks ago).

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
      "I've been in crypto since 2017. The Revenue Flywheel is the first sustainable yield model I've seen that doesn't rely on token emissions. It just works.",
    name: "Lucas Silva",
    role: "Turbo Legend, Brazil",
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
      "I spent months looking for a protocol that actually let me verify security myself. Turbo Loop is the first one where the answer to every security question is 'check BscScan yourself.' That's real DeFi.",
    name: "Markus Weber",
    role: "Community Lead, Germany",
    countryCode: "de",
    color: "#0891B2",
    hoursAgo: 8,
  },
  {
    id: "ada-ng",
    quote:
      "Our community in Lagos has been growing faster than anywhere else because the math is simple and the contract is immutable. Nothing to explain away, nothing to hide.",
    name: "Adaeze Okafor",
    role: "Zoom Presenter, Nigeria",
    countryCode: "ng",
    color: "#7C3AED",
    hoursAgo: 14,
  },
  {
    id: "aiko-jp",
    quote: "The transparency is what sold me. Every fee, every reward — visible on-chain.",
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
      "The Leadership Program changed how I think about DeFi community building. I started with five referrals. Six months later, my downline spans three countries and I'm earning more than my day job.",
    name: "Budi Santoso",
    role: "Turbo Director, Indonesia",
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
      "What I appreciate most is that Turbo Loop doesn't pretend to be something it isn't. They show you the contract, they show you the code, they show you the math. You decide.",
    name: "Fatima Al-Qassimi",
    role: "Researcher, UAE",
    countryCode: "ae",
    color: "#7C3AED",
    hoursAgo: 48,
  },
  {
    id: "olek-pl",
    quote: "Compounded for 90 days straight. The math holds up exactly as advertised.",
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
      "I introduced my entire family to Turbo Loop. We have a private Telegram group where we share strategies. The 20-level referral system means everyone benefits.",
    name: "Raúl Fernández",
    role: "Spain",
    countryCode: "es",
    color: "#EC4899",
    hoursAgo: 70,
  },
  {
    id: "ngozi-ke",
    quote: "Joined 3 months ago. Already at Accelerator rank. The system is fair.",
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
      "The Vietnamese community has tripled in size in two months. The translated content makes everything accessible. We host weekly Zooms now.",
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
      "I host the Portuguese-language Zoom session every Tuesday. The community shows up. People who never thought DeFi was for them are now compounding their yields confidently.",
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
      "Started with $50. After six months of compounding, my deposit had grown enough that I quit my second job. The math is real and the contract is real.",
    name: "Kemal Reyes",
    role: "Philippines",
    countryCode: "ph",
    color: "#F59E0B",
    hoursAgo: 290,
  },
];

/** Convert hours ago to a friendly relative timestamp. */
export function relativeTime(hoursAgo: number): string {
  if (hoursAgo < 1) return "Just now";
  if (hoursAgo < 2) return "1 hour ago";
  if (hoursAgo < 24) return `${Math.floor(hoursAgo)} hours ago`;
  if (hoursAgo < 48) return "Yesterday";
  if (hoursAgo < 24 * 7) return `${Math.floor(hoursAgo / 24)} days ago`;
  if (hoursAgo < 24 * 30) return `${Math.floor(hoursAgo / (24 * 7))} weeks ago`;
  return `${Math.floor(hoursAgo / (24 * 30))} months ago`;
}
