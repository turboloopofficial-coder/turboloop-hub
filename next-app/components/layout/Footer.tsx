// Footer — minimal, brand-tinted, info-dense.
// Server component, zero JS.

import Link from "next/link";
import { Container } from "@components/ui/Container";

const FOOTER_LINKS: Array<{ heading: string; items: Array<{ label: string; href: string; external?: boolean }> }> = [
  {
    heading: "Product",
    items: [
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
    <footer className="border-t border-[var(--c-border)] bg-[var(--c-surface)] mt-16">
      <Container width="wide">
        <div className="py-12 md:py-16 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand block — spans 2 cols on desktop, full row on mobile */}
          <div className="col-span-2 md:col-span-1">
            <div className="font-bold text-xl tracking-tight mb-3">
              <span className="text-[var(--c-text)]">Turbo</span>
              <span className="bg-brand bg-clip-text text-transparent">
                Loop
              </span>
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
              href="https://hazecrypto.net/audit/turboloop"
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
