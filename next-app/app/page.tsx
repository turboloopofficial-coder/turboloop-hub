// Homepage — Phase 11 skeleton. Phase 12 will expand this with the
// full sections (films, partners, numbers, reels, blog, security,
// promotions, testimonials, manifesto, newsletter).
//
// What's here right now is the bare hero + trust badges row, built
// entirely on the design system (no inline style={{ ... }} anywhere)
// to prove the system works end-to-end before scaling it to the rest
// of the site.
//
// Mobile-first: every spacing decision is sized for a 375px phone first
// and scaled up at md+ breakpoints. The hero text uses clamp() so it
// scales smoothly between mobile and desktop without breakpoints.

import { ShieldCheck, Lock, CheckCircle2, Globe2, Rocket } from "lucide-react";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";

const TRUST_BADGES = [
  {
    icon: ShieldCheck,
    label: "Independently Audited",
    href: "https://hazecrypto.net/audit/turboloop",
  },
  {
    icon: Lock,
    label: "100% LP Locked",
    href: "https://app.unicrypt.network/amm/pancake-v2/pair/0x4f31Fa980a675570939B737Ebdde0471a4Be40Eb",
  },
  {
    icon: CheckCircle2,
    label: "Ownership Renounced",
    href: "https://bscscan.com/tx/0x848bc42ca79e20a2f0039407b5d077b8d89efcfd414e88a16f1161263746056e",
  },
  {
    icon: Globe2,
    label: "BscScan Verified",
    href: "https://bscscan.com/address/0xc90e5785632daab9cb61f5050da393090541a76d",
  },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      {/* Static background — replaces the 3 animated blurred blobs that
          were burning GPU on every scroll frame. CSS-only, GPU paints
          once, holds forever. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 800px 600px at 15% 12%, rgba(34,211,238,0.10), transparent 60%), " +
            "radial-gradient(ellipse 700px 500px at 88% 92%, rgba(167,139,250,0.08), transparent 60%), " +
            "radial-gradient(ellipse 500px 400px at 95% 45%, rgba(34,211,238,0.05), transparent 60%)",
        }}
      />

      {/* HERO */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
        <Container width="wide">
          <div className="text-center max-w-3xl mx-auto">
            {/* Eyebrow pill — small live-status badge */}
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <Heading tier="eyebrow" as="span" className="text-emerald-700">
                Live on Binance Smart Chain
              </Heading>
            </div>

            {/* Hero wordmark — "Turbo Loop" with the brand gradient on
                "Loop". No animation by default; this is calmer + faster
                than the legacy SPA's continuous shimmer. */}
            <Heading tier="display" className="mb-5">
              <span>Turbo </span>
              <Heading tier="display" as="span" gradient>
                Loop
              </Heading>
            </Heading>

            {/* Subhead */}
            <p className="text-lg md:text-xl text-[var(--c-text-muted)] mb-9 leading-relaxed max-w-2xl mx-auto">
              Sustainable yield.{" "}
              <span className="text-[var(--c-text)] font-medium">
                Transparent by design.
              </span>{" "}
              <span className="text-[var(--c-text)] font-medium">
                Open to everyone.
              </span>
            </p>

            {/* CTAs — primary + secondary. Stack vertically on mobile,
                side-by-side from md. Primary is thumb-reachable height
                because this is the most important action on the page. */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center max-w-md sm:max-w-none mx-auto mb-3">
              {/* Render the Button visually but use an anchor for the
                  click, so the page stays a Server Component (no JS for
                  this CTA = better TTI). The Button styles apply via
                  the className composition pattern. */}
              <a
                href="https://turboloop.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] h-[52px] text-base px-7 text-white bg-[var(--c-brand-gradient)] shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition-shadow active:scale-[0.985]"
              >
                Launch App
                <Rocket className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="/films"
                className="inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] h-[52px] text-base px-7 bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:bg-[var(--c-bg)] hover:shadow-[var(--s-md)] transition active:scale-[0.985]"
              >
                Watch the films
              </a>
            </div>

            {/* Tertiary text link — surfaces the contribution path
                without competing with the primary CTA. */}
            <a
              href="/submit"
              className="inline-block text-sm text-[var(--c-text-muted)] hover:text-[var(--c-brand-cyan)] underline decoration-[var(--c-border)] underline-offset-4 transition"
            >
              Or share your story →
            </a>

            {/* Trust badges — 2-column grid on mobile, single row on desktop.
                Each badge is a small Card so the visual rhythm matches the
                rest of the site. */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-12">
              {TRUST_BADGES.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card
                    elevation="flat"
                    padding="sm"
                    interactive
                    className="flex items-center gap-2 text-left h-full"
                  >
                    <Icon
                      className="w-4 h-4 text-[var(--c-brand-cyan)] flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-semibold text-[var(--c-text)] leading-tight">
                      {label}
                    </span>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* PHASE 12 NOTE — The remaining sections (Activity ticker, "What is
          TurboLoop?" cinematic embed, Partners, Numbers, Reels, Blog,
          Security, Promotions, Testimonials, Manifesto, Newsletter) are
          migrated in Phase 12 once we've verified this foundation works
          end-to-end on the Realme Narzo 50. */}
      <section className="py-12 md:py-16">
        <Container width="default">
          <Card
            elevation="raised"
            padding="lg"
            className="text-center"
          >
            <Heading tier="eyebrow" className="text-[var(--c-text-subtle)] mb-3">
              Phase 11 — Foundation Live
            </Heading>
            <Heading tier="h2" className="mb-3">
              The new TurboLoop hub is being built.
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed max-w-xl mx-auto">
              You&rsquo;re looking at the first page of the rebuild — a
              static, mobile-first foundation. The remaining sections
              (films, blog, reels, community) ship in Phase 12. The
              current site at turboloop.tech is unaffected.
            </p>
          </Card>
        </Container>
      </section>
    </main>
  );
}
