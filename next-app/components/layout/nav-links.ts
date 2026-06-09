// Navigation — 4 Core Pillars. Single source of truth for all nav surfaces.
// Utilities (FAQ, Roadmap, Calculator, Submit, Privacy, Terms) live in the
// footer only — they're not on the primary navigation surface.
//
// Lives in its own leaf module to avoid the circular-import trap that
// previously killed the dropdown + drawer renders: Navbar imports the
// dropdown, the dropdown imports the link constants. If those constants
// live in Navbar, the dropdown's `.map()` runs against `undefined` at
// first client render and crashes silently. Leaf module = safe.
//
// Pillar narrative:
//   • Protocol      — what the product IS (yield, referrals, ranks, infra, security)
//   • Watch & Learn — content surfaces (films, reels, library, blog, learn)
//   • Community     — people surfaces (community, social wall, leaderboard, events)
//   • Earn & Build  — outbound monetisation paths (token, promos, applications, jobs)

export const PROTOCOL_LINKS = [
  { label: "Yield Farming",      href: "/ecosystem/yield-farming",     description: "4 plans · up to 54% ROI · real yield",     emoji: "🌾" },
  { label: "Referral Network",   href: "/ecosystem/referral-network",  description: "20 levels deep · 51% to community",         emoji: "🌐" },
  { label: "Leadership Program", href: "/ecosystem/leadership-program",description: "7 ranks · Partner → Legend",                emoji: "👑" },
  { label: "Turbo Buy",          href: "/ecosystem/turbo-buy",         description: "Fiat-to-crypto gateway",                    emoji: "💳" },
  { label: "Turbo Swap",         href: "/ecosystem/turbo-swap",        description: "Decentralized exchange on BSC",             emoji: "🔄" },
  { label: "Security",           href: "/security",                    description: "Audited · renounced · $100K bounty",        emoji: "🛡️" },
] as const;

export const WATCH_LINKS = [
  { label: "Films",      href: "/films",   description: "4 seasons · 20 cinematic episodes",    emoji: "🎬" },
  { label: "Reels",      href: "/reels",   description: "Short tutorials and highlights",       emoji: "📱" },
  { label: "Library",    href: "/library", description: "Presentations in 48 languages",        emoji: "📂" },
  { label: "Blog",       href: "/blog",    description: "Editorial deep dives · EN default",    emoji: "✍️" },
  { label: "Learn DeFi", href: "/learn",   description: "Plain-English DeFi explainers",        emoji: "📚" },
] as const;

export const COMMUNITY_LINKS = [
  { label: "Community",      href: "/community",              description: "Voices from 14+ countries",   emoji: "💬" },
  { label: "Social Wall",    href: "/social-wall",            description: "Community videos and stories", emoji: "🌐" },
  { label: "Leaderboard",    href: "/community#leaderboard",  description: "Top countries this week",     emoji: "🏆" },
  { label: "Events & Zoom",  href: "/events",                 description: "Daily calls · global meetups", emoji: "📅" },
] as const;

export const EARN_LINKS = [
  { label: "$TURBO Token",  href: "/token",      description: "Bonus rewards for Power & Ultimate",     emoji: "⚡", highlight: true },
  { label: "Promotions",    href: "/promotions", description: "$100K bounty + paid programs",            emoji: "🎁" },
  { label: "Apply to Earn", href: "/apply",      description: "Creator Star + Local Presenter",          emoji: "⭐" },
  { label: "Careers",       href: "/careers",    description: "Zoom Presenter · $100/month",             emoji: "💼" },
  { label: "Creatives",     href: "/creatives",  description: "Ready-to-share branded assets",           emoji: "🎨" },
] as const;

// Footer-only utility links. These don't earn primary-nav real estate
// but every site needs them discoverable somewhere — the footer is
// where users hunt for FAQ / Privacy / Terms by habit.
export const UTILITY_LINKS = [
  { label: "FAQ",                href: "/faq" },
  { label: "Roadmap",            href: "/roadmap" },
  { label: "Calculator",         href: "/calculator" },
  { label: "Submit Your Story",  href: "/submit" },
  { label: "Privacy",            href: "/privacy" },
  { label: "Terms",              href: "/terms" },
] as const;

// Legacy aliases — keep any imports that still reference the old names
// compiling without a sweep. PRIMARY_LINKS now points to the Protocol
// pillar (the highest-intent surfaces) and RESOURCE_LINKS points at the
// Watch & Learn pillar (the legacy "Resources dropdown" content).
export const PRIMARY_LINKS = PROTOCOL_LINKS;
export const RESOURCE_LINKS = WATCH_LINKS;

export type NavLinkItem = {
  readonly label: string;
  readonly href: string;
  readonly description?: string;
  readonly emoji?: string;
  readonly highlight?: boolean;
};
