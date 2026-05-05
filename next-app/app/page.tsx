// Homepage — Phase 12. Full composition of all sections.
//
// Each section lives in its own file in /components/sections/ for
// independent ownership. The home page just composes them in narrative
// order:
//
//   1. Hero            — what is this and why care (top of funnel)
//   2. FilmsTeaser     — answer "what is TurboLoop?" in 60 seconds
//   3. Numbers         — proof of reach (community / language / continents)
//   4. SecurityPillars — proof of trustworthiness (the doubt step)
//   5. Promotions      — convert the sold visitor (the bounty + earn paths)
//   6. Testimonial     — social proof (the "people like me" step)
//   7. NewsletterCTA   — last conversion before footer
//
// Every section is a Server Component. Zero client JS for the page
// itself; the only client islands are the mobile menu and the bottom
// CTA bar (in the layout).

import { ShieldCheck, Lock, CheckCircle2, Globe2, Rocket } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { ActivityTicker } from "@components/sections/ActivityTicker";
import { PartnersBar } from "@components/sections/PartnersBar";
import { FilmsTeaserSection } from "@components/sections/FilmsTeaserSection";
import { NumbersSection } from "@components/sections/NumbersSection";
import { HomeReelsSection } from "@components/sections/HomeReelsSection";
import { HomeBlogSection } from "@components/sections/HomeBlogSection";
import { SecurityPillarsSection } from "@components/sections/SecurityPillarsSection";
import { PromotionsSection } from "@components/sections/PromotionsSection";
import { EventsSection } from "@components/sections/EventsSection";
import { TestimonialSection } from "@components/sections/TestimonialSection";
import { ManifestoSection } from "@components/sections/ManifestoSection";
import { NewsletterCTASection } from "@components/sections/NewsletterCTASection";

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
    <main className="relative">
      {/* Static decorative background — fixed, no animation, GPU paints once */}
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
      <section className="relative pt-12 pb-12 md:pt-24 md:pb-20">
        <Container width="wide">
          <div className="text-center max-w-3xl mx-auto">
            {/* Eyebrow live-status pill */}
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <Heading tier="eyebrow" as="span" className="text-emerald-700">
                Live on Binance Smart Chain
              </Heading>
            </div>

            {/* Hero wordmark — "Turbo Loop" with the brand gradient on "Loop" */}
            <Heading tier="display" className="mb-5">
              <span>Turbo </span>
              <span className="text-brand-wide">Loop</span>
            </Heading>

            <p className="text-lg md:text-xl text-[var(--c-text-muted)] mb-9 leading-relaxed max-w-2xl mx-auto">
              Sustainable yield.{" "}
              <span className="text-[var(--c-text)] font-medium">
                Transparent by design.
              </span>{" "}
              <span className="text-[var(--c-text)] font-medium">
                Open to everyone.
              </span>
            </p>

            {/* Primary + secondary CTAs. Stacked on mobile, side-by-side on md+. */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center max-w-md sm:max-w-none mx-auto mb-3">
              <a
                href="https://turboloop.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] h-[52px] text-base px-7 text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
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

            <a
              href="/submit"
              className="inline-block text-sm text-[var(--c-text-muted)] hover:text-[var(--c-brand-cyan)] underline decoration-[var(--c-border)] underline-offset-4 transition"
            >
              Or share your story →
            </a>

            {/* Trust badges — 2-column grid on mobile, single row on desktop */}
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

      {/* Live activity strip — narrow, dark band right under the hero */}
      <ActivityTicker />

      {/* "What is TurboLoop?" cinematic teaser */}
      <FilmsTeaserSection />

      {/* Trust strip: built on, audited by, integrated with */}
      <PartnersBar />

      {/* Real numbers — proof of reach */}
      <NumbersSection />

      {/* Reels carousel — short-form content */}
      <HomeReelsSection />

      {/* Editorial — 3 most recent blog posts */}
      <HomeBlogSection />

      {/* Security pillars — doubt-killer */}
      <SecurityPillarsSection />

      {/* $100K bounty + Creator + Presenter */}
      <PromotionsSection />

      {/* Daily Zoom in 12+ languages */}
      <EventsSection />

      {/* Single curated testimonial */}
      <TestimonialSection />

      {/* The Manifesto — final cinematic embed */}
      <ManifestoSection />

      {/* Last conversion point */}
      <NewsletterCTASection />
    </main>
  );
}
