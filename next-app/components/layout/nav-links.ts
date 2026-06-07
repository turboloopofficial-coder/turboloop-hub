// Shared nav link constants. Lives in its own file (rather than inside
// Navbar.tsx) to avoid the circular-import trap: Navbar imports
// ResourcesDropdown, ResourcesDropdown needs the link constants. If
// the constants live in Navbar, the dropdown's `.map()` runs against
// `undefined` at first client render and crashes silently — the button's
// state toggles but the panel never mounts. Same trap was killing the
// MobileMenu drawer.
//
// Leaf module = no risk of either-side-not-yet-evaluated.

// Primary nav order: content / community / protocol surfaces lead;
// Token sits LAST so it reads as a bonus to the protocol rather than
// the main product. Resources dropdown carries everything else.
export const PRIMARY_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Films", href: "/films" },
  { label: "Community", href: "/community" },
  { label: "Ecosystem", href: "/ecosystem" },
  { label: "Social Wall", href: "/social-wall" },
  { label: "Events", href: "/events" },
  { label: "Security", href: "/security" },
  { label: "Token", href: "/token" },
] as const;

export const RESOURCE_LINKS = [
  { label: "Reels", href: "/reels", description: "Short-form video content", emoji: "🎬" },
  { label: "Creatives", href: "/creatives", description: "Ready-to-share branded banners", emoji: "🎨" },
  { label: "Library", href: "/library", description: "Videos and presentations in 48 languages", emoji: "📂" },
  { label: "Learn (DeFi 101)", href: "/learn", description: "Plain-English DeFi explainers", emoji: "📚" },
  { label: "Calculator", href: "/calculator", description: "Project your yield and token rewards", emoji: "🧮" },
  { label: "FAQ", href: "/faq", description: "Common questions answered", emoji: "❓" },
  { label: "Roadmap", href: "/roadmap", description: "What's built. What's next.", emoji: "🗺️" },
  { label: "Promotions", href: "/promotions", description: "$100K bounty + paid programs", emoji: "🎁" },
  { label: "Submit Your Story", href: "/submit", description: "Share your testimonial, photo, video, or story", emoji: "✍️" },
  { label: "Apply to Earn", href: "/apply", description: "Creator Star + Local Presenter programs", emoji: "⭐" },
  { label: "Careers", href: "/careers", description: "Open Zoom Presenter roles — $100/month stipend", emoji: "💼" },
] as const;

export type NavLinkItem = {
  readonly label: string;
  readonly href: string;
  readonly description?: string;
  readonly emoji?: string;
};
