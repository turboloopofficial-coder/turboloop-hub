// Navbar — sticky top nav, mobile-first.
// Mobile (<md): logo + hamburger drawer.
// Desktop (md+): logo + 5 primary links + Resources dropdown + theme + Launch App.

import Link from "next/link";
import { Container } from "@components/ui/Container";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";
import { ResourcesDropdown } from "./ResourcesDropdown";
import { Brand } from "@components/Brand";
import { Magnetic } from "@components/ui/Magnetic";
import { PRIMARY_LINKS, RESOURCE_LINKS } from "./nav-links";

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

          {/* Desktop links — hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1">
            {PRIMARY_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center px-3 min-h-[44px] rounded-[var(--r-md)] text-sm font-semibold text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[rgba(15,23,42,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors"
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
            <Magnetic className="hidden md:inline-flex">
              <a
                href="https://turboloop.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 min-h-[44px] h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
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
