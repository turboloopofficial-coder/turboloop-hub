// Shared nav link constants. Lives in its own file (rather than inside
// Navbar.tsx) to avoid the circular-import trap: Navbar imports
// ResourcesDropdown, ResourcesDropdown needs the link constants. If
// the constants live in Navbar, the dropdown's `.map()` runs against
// `undefined` at first client render and crashes silently — the button's
// state toggles but the panel never mounts. Same trap was killing the
// MobileMenu drawer.
//
// Leaf module = no risk of either-side-not-yet-evaluated.

// Primary nav order reflects the marketing-narrative reorder:
// content discovery (Blog/Films/Reels/Creatives) leads, utility
// (FAQ/Calculator) follows, and Token sits LAST so it reads as a
// bonus to the protocol rather than the main product.
//
// Previously-primary items that don't fit the 7-slot main rail
// (Ecosystem, Community, Events, Security) moved to RESOURCE_LINKS
// below — still one click away via the Resources dropdown and the
// footer, just not eating prime real estate.
export const PRIMARY_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Films", href: "/films" },
  { label: "Reels", href: "/reels" },
  { label: "Creatives", href: "/creatives" },
  { label: "FAQ", href: "/faq" },
  { label: "Calculator", href: "/calculator" },
  { label: "Token", href: "/token" },
] as const;

export const RESOURCE_LINKS = [
  // Core protocol surfaces — moved from PRIMARY when Token took the
  // last slot. Order tuned for user value: Ecosystem first (the
  // pillar overview), then Security (the trust check), Community
  // (where to plug in), Events (what's happening).
  {
    label: "Ecosystem",
    href: "/ecosystem",
    description: "Six pillars of the TurboLoop DeFi protocol",
    emoji: "🌐",
  },
  {
    label: "Security",
    href: "/security",
    description: "Audited, ownership renounced, LP locked",
    emoji: "🔒",
  },
  {
    label: "Community",
    href: "/community",
    description: "Voices from across the TurboLoop community",
    emoji: "👥",
  },
  {
    label: "Events",
    href: "/events",
    description: "Global TurboLoop meetups + Zoom calls",
    emoji: "📅",
  },
  {
    label: "Submit Your Story",
    href: "/submit",
    description: "Share your testimonial, photo, video, or story",
    emoji: "✍️",
  },
  {
    label: "Apply to Earn",
    href: "/apply",
    description: "Creator Star + Local Presenter programs",
    emoji: "⭐",
  },
  {
    label: "Careers",
    href: "/careers",
    description: "Open Zoom Presenter roles — $100/month stipend",
    emoji: "💼",
  },
  {
    label: "Promotions",
    href: "/promotions",
    description: "$100K bounty + paid programs",
    emoji: "🎁",
  },
  {
    label: "Social Wall",
    href: "/social-wall",
    description: "Community-made videos from around the world",
    emoji: "🎬",
  },
  {
    label: "Library",
    href: "/library",
    description: "Videos and presentations in 48 languages",
    emoji: "📂",
  },
  {
    label: "Learn (DeFi 101)",
    href: "/learn",
    description: "Plain-English DeFi explainers",
    emoji: "📚",
  },
  {
    label: "Roadmap",
    href: "/roadmap",
    description: "What's built. What's next.",
    emoji: "🗺️",
  },
] as const;

export type NavLinkItem = {
  readonly label: string;
  readonly href: string;
  readonly description?: string;
  readonly emoji?: string;
};
