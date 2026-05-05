// Navbar — sticky top nav, mobile-first.
//
// Mobile (<md): logo + hamburger. The hamburger opens a full-screen drawer.
// Desktop (md+): logo + 5 primary links + Launch App button on the right.
//
// Server-renderable. Uses a tiny client island ONLY for the hamburger
// open/close state. Everything else is static — no JS for the desktop
// nav. Big TTI win on mobile.

import Link from "next/link";
import { Container } from "@components/ui/Container";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";

const PRIMARY_LINKS = [
  { label: "Ecosystem", href: "/ecosystem" },
  { label: "Community", href: "/community" },
  { label: "Blog", href: "/feed" },
  { label: "Security", href: "/security" },
  { label: "Films", href: "/films" },
];

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-[var(--z-nav,50)] backdrop-blur-md border-b border-[var(--c-border)]"
      style={{
        background: "color-mix(in oklab, var(--c-bg) 85%, transparent)",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <Container width="wide" className="!px-[var(--gutter)]">
        <div className="flex items-center justify-between h-[var(--nav-h)]">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg tracking-tight"
          >
            <span className="text-[var(--c-text)]">Turbo</span>
            <span className="bg-brand bg-clip-text text-transparent">
              Loop
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
          </nav>

          {/* Right side: theme toggle + desktop Launch App + mobile burger */}
          <div className="flex items-center gap-1 md:gap-2">
            <ThemeToggle />
            <a
              href="https://turboloop.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-4 h-9 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
            >
              Launch App →
            </a>
            <MobileMenu links={PRIMARY_LINKS} />
          </div>
        </div>
      </Container>
    </header>
  );
}
