// Shared nav link constants. Lives in its own file (rather than inside
// Navbar.tsx) to avoid the circular-import trap: Navbar imports
// ResourcesDropdown, ResourcesDropdown needs the link constants. If
// the constants live in Navbar, the dropdown's `.map()` runs against
// `undefined` at first client render and crashes silently — the button's
// state toggles but the panel never mounts. Same trap was killing the
// MobileMenu drawer.
//
// Leaf module = no risk of either-side-not-yet-evaluated.

export const PRIMARY_LINKS = [
  { label: "Ecosystem", href: "/ecosystem" },
  { label: "Community", href: "/community" },
  { label: "Events", href: "/events" },
  { label: "Blog", href: "/blog" },
  { label: "Security", href: "/security" },
  { label: "Films", href: "/films" },
] as const;

export const RESOURCE_LINKS = [
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
    label: "Promotions",
    href: "/promotions",
    description: "$100K bounty + paid programs",
    emoji: "🎁",
  },
  {
    label: "Creatives",
    href: "/creatives",
    description: "Ready-to-share branded banners",
    emoji: "🎨",
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
  {
    label: "FAQ",
    href: "/faq",
    description: "Common questions answered",
    emoji: "❓",
  },
] as const;

export type NavLinkItem = {
  readonly label: string;
  readonly href: string;
  readonly description?: string;
  readonly emoji?: string;
};
