// Footer — minimal, brand-tinted, info-dense.
// Server component, zero JS.

import Link from "next/link";
import { Container } from "@components/ui/Container";
import { Brand } from "@components/Brand";
import { SECURITY } from "@lib/constants";

// The six highest-intent destinations, rendered as a prominent
// `<nav aria-label="Site sections">` rail at the top of the footer.
// This is Task E's "explicit internal link graph" for Google Sitelinks
// — the order and exact anchor text mirror the SiteNavigationElement
// JSON-LD in app/layout.tsx, so the schema + the link graph agree.
// If you reorder/rename here, mirror the change there too.
const PRIMARY_SECTIONS: Array<{ label: string; href: string }> = [
  { label: "Ecosystem", href: "/ecosystem" },
  { label: "Yield Calculator", href: "/calculator" },
  { label: "Security", href: "/security" },
  { label: "Events", href: "/events" },
  { label: "Blog", href: "/blog" },
  { label: "Apply to Earn", href: "/apply" },
];

const FOOTER_LINKS: Array<{ heading: string; items: Array<{ label: string; href: string; external?: boolean }> }> = [
  {
    heading: "Product",
    items: [
      { label: "$TURBO Token", href: "/token" },
      { label: "Ecosystem", href: "/ecosystem" },
      { label: "Security", href: "/security" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Launch App", href: "https://turboloop.io", external: true },
    ],
  },
  {
    heading: "Community",
    items: [
      { label: "Films", href: "/films" },
      { label: "Blog", href: "/feed" },
      { label: "Submit Story", href: "/submit" },
      { label: "Apply to Earn", href: "/apply" },
    ],
  },
  {
    heading: "Resources",
    items: [
      { label: "Library", href: "/library" },
      { label: "Learn DeFi", href: "/learn" },
      { label: "FAQ", href: "/faq" },
      { label: "Promotions", href: "/promotions" },
    ],
  },
  {
    heading: "Channels",
    items: [
      { label: "Telegram", href: "https://t.me/TurboLoop_Official", external: true },
      { label: "X / Twitter", href: "https://x.com/TurboLoop_io", external: true },
      { label: "YouTube", href: "https://www.youtube.com/@OfficialTurbo_Loop", external: true },
      { label: "BscScan", href: "https://bscscan.com/address/0xc90e5785632daab9cb61f5050da393090541a76d", external: true },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="relative bg-[var(--c-surface)] mt-16"
      style={{
        // Soft brand-cyan glow centred at the top edge — adds the
        // "premium curtain" feel without an outright graphic.
        backgroundImage:
          "radial-gradient(ellipse 600px 200px at 50% 0%, rgba(8,145,178,0.03), transparent 70%)",
      }}
    >
      {/* Gradient hairline replacing the old flat border-t */}
      <div
        aria-hidden="true"
        className="h-px bg-gradient-to-r from-transparent via-[var(--c-brand-cyan)]/20 to-transparent"
      />
      <Container width="wide">
        {/* Site-sections nav — explicit internal link graph for Google
            Sitelinks. Six terse links to the highest-intent destinations
            in the same order as the SiteNavigationElement JSON-LD in
            app/layout.tsx. Stands above the detailed 4-column grid so
            crawlers see it as the primary nav landmark in the footer. */}
        <nav
          aria-label="Site sections"
          className="pt-10 md:pt-12 pb-2 md:pb-4"
        >
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:gap-x-8">
            {PRIMARY_SECTIONS.map(s => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="text-sm font-bold text-[var(--c-text)] hover:text-[var(--c-brand-cyan)] transition-colors tracking-tight"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="py-8 md:py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand block — spans 2 cols on desktop, full row on mobile */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Brand size={36} />
              <div className="font-bold text-xl tracking-tight">
                <span className="text-[var(--c-text)]">Turbo</span>
                <span className="bg-brand bg-clip-text text-transparent">
                  Loop
                </span>
              </div>
            </div>
            <p className="text-sm text-[var(--c-text-muted)] leading-relaxed">
              The complete DeFi ecosystem on Binance Smart Chain. Audited.
              Renounced. Open to everyone.
            </p>
          </div>

          {FOOTER_LINKS.map(group => (
            <div key={group.heading}>
              <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] mb-3">
                {group.heading}
              </div>
              <ul className="space-y-2">
                {group.items.map(item => (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-sm text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="border-t border-[var(--c-border)] py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-[var(--c-text-subtle)]">
          <span>© {year} Turbo Loop. All on-chain, all the time.</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-[var(--c-text)] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--c-text)] transition-colors">
              Terms
            </Link>
            <a
              href={SECURITY.auditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--c-text)] transition-colors"
            >
              Audit
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
