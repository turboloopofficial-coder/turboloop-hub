// Navbar — sticky top nav, mobile-first.
// Mobile (<md): logo + hamburger drawer.
// Desktop (md+): logo + 5 primary links + Resources dropdown + theme + Launch App.

import Link from "next/link";
import { Container } from "@components/ui/Container";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";
import { ResourcesDropdown } from "./ResourcesDropdown";
import { Brand } from "@components/Brand";

export const PRIMARY_LINKS = [
  { label: "Ecosystem", href: "/ecosystem" },
  { label: "Community", href: "/community" },
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
    description: "141 ready-to-share branded banners",
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

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-[var(--z-nav,50)] backdrop-blur-md border-b border-[var(--c-border)]"
      style={{
        background: "color-mix(in oklab, var(--c-bg) 88%, transparent)",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <Container width="wide" className="!px-[var(--gutter)]">
        <div className="flex items-center justify-between h-[var(--nav-h)]">
          {/* Logo — real R2 vortex mark + wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-lg tracking-tight group"
            aria-label="TurboLoop home"
          >
            <Brand size={32} hoverable />
            <span className="hidden sm:inline">
              <span className="text-[var(--c-text)]">Turbo</span>
              <span className="bg-brand bg-clip-text text-transparent">
                Loop
              </span>
            </span>
          </Link>

          {/* Desktop links — hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1">
            {PRIMARY_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-[var(--r-md)] text-sm font-semibold text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[rgba(15,23,42,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <ResourcesDropdown />
          </nav>

          {/* Right side: search hint + theme toggle + desktop Launch App + mobile burger */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Visible Cmd+K hint — actual palette listens globally. */}
            <kbd className="hidden lg:inline-flex items-center gap-1.5 px-2 h-8 rounded-[var(--r-md)] text-xs font-mono text-[var(--c-text-muted)] bg-[var(--c-surface)] border border-[var(--c-border)]">
              <span className="text-base leading-none">⌘</span>
              <span>K</span>
            </kbd>
            <ThemeToggle />
            <a
              href="https://turboloop.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-4 h-9 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
            >
              Launch App →
            </a>
            <MobileMenu
              primaryLinks={PRIMARY_LINKS}
              resourceLinks={RESOURCE_LINKS}
            />
          </div>
        </div>
      </Container>
    </header>
  );
}
