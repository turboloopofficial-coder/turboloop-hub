// Navbar — sticky top nav, mobile-first.
//
// Mobile (<md): logo + hamburger drawer (MobileMenu).
// Desktop (md+): logo + 4 pillar dropdowns + theme toggle + Launch App.
//
// The 4 pillars (Protocol, Watch & Learn, Community, Earn & Build) live
// in a single source of truth: nav-links.ts. Each one renders via the
// reusable NavDropdown defined in ResourcesDropdown.tsx (filename kept
// for git history; the file now exports the 4 pillar dropdowns +
// preserves `ResourcesDropdown` as an alias for `EarnDropdown`).

import Link from "next/link";
import { Container } from "@components/ui/Container";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";
import {
  ProtocolDropdown,
  WatchDropdown,
  CommunityDropdown,
  EarnDropdown,
} from "./ResourcesDropdown";
import { Brand } from "@components/Brand";
import { Magnetic } from "@components/ui/Magnetic";
import { PRIMARY_LINKS, RESOURCE_LINKS } from "./nav-links";
import { LanguagePicker } from "./LanguagePicker";

// Re-export for any existing import paths.
export { PRIMARY_LINKS, RESOURCE_LINKS };

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-[var(--z-nav,50)] backdrop-blur-xl backdrop-saturate-150 tl-nav-border"
      style={{
        // Glass: more transparent than before so the blur reads, with a
        // surface-tinted veil so contrast against hero gradients is still
        // safe. backdrop-saturate-150 keeps brand colours behind the bar
        // looking lively rather than washed out. The bottom border is now
        // a brand-gradient ::after via .tl-nav-border (globals.css).
        background: "color-mix(in oklab, var(--c-bg) 65%, transparent)",
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

          {/* Desktop nav — 4 pillar dropdowns. Hidden on mobile.
              Standalone primary links (Blog / Films / Community / Ecosystem
              / Social Wall / Events / Security / Token) have been folded
              INTO the dropdowns — no more flat link rail. */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Primary"
          >
            <ProtocolDropdown />
            <WatchDropdown />
            <CommunityDropdown />
            <EarnDropdown />
          </nav>

          {/* Right side: theme toggle + desktop Launch App + mobile burger.
              The ⌘K kbd hint has been removed — the palette still listens
              globally, the hint just isn't surfaced in the nav. */}
          <div className="flex items-center gap-1 md:gap-2">
            <LanguagePicker />
            <ThemeToggle />
            <Magnetic className="hidden md:inline-flex">
              <a
                href="https://turboloop.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 min-h-[48px] h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
              >
                Launch App →
              </a>
            </Magnetic>
            <MobileMenu />
          </div>
        </div>
      </Container>
    </header>
  );
}
