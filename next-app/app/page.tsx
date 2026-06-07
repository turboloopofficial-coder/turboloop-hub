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
import { SectionDivider } from "@components/ui/SectionDivider";
import { ActivityTicker } from "@components/sections/ActivityTicker";
import { PartnersBar } from "@components/sections/PartnersBar";
import { FilmsTeaserSection } from "@components/sections/FilmsTeaserSection";
import { NumbersSection } from "@components/sections/NumbersSection";
import { LeaderboardSection } from "@components/sections/LeaderboardSection";
import { HomeReelsSection } from "@components/sections/HomeReelsSection";
import { HomeGlobalReelsSection } from "@components/sections/HomeGlobalReelsSection";
import { HiringBanner } from "@components/sections/HiringBanner";
import { HomeBlogSection } from "@components/sections/HomeBlogSection";
import { SecurityPillarsSection } from "@components/sections/SecurityPillarsSection";
import { PromotionsSection } from "@components/sections/PromotionsSection";
import { EventsSection } from "@components/sections/EventsSection";
import { TestimonialSection } from "@components/sections/TestimonialSection";
import { SocialWallSection } from "@components/sections/SocialWallSection";
import { ManifestoSection } from "@components/sections/ManifestoSection";
import { NewsletterSection } from "@components/sections/NewsletterSection";
import { InstallAppWidget } from "@components/install/InstallAppWidget";
import { TokenSection } from "@components/sections/TokenSection";
import { Reveal } from "@components/Reveal";
import { SECURITY } from "@lib/constants";

const TRUST_BADGES = [
  {
    icon: ShieldCheck,
    label: "Independently Audited",
    href: SECURITY.auditUrl,
  },
  {
    icon: Lock,
    label: "100% LP Locked",
    href: SECURITY.lpLockUnicrypt,
  },
  {
    icon: CheckCircle2,
    label: "Ownership Renounced",
    href: SECURITY.renounceTx,
  },
  {
    icon: Globe2,
    label: "BscScan Verified",
    href: SECURITY.bscScan,
  },
];

export default function HomePage() {
  return (
    <main className="relative">
      {/* Aurora background — three brand-tinted radial gradients stitched
          across a 200 % canvas, slid horizontally on a 15 s loop via
          .aurora-bg in globals.css. Reads as a slow, expensive shimmer
          rather than a busy animation. Reduced-motion users get the
          static composition (animation disabled in CSS). */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none aurora-bg"
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

            {/* Scroll indicator — animated chevron under the hero,
                visible on tall viewports, hidden after first scroll */}
            <div className="hidden md:flex flex-col items-center mt-12 text-[var(--c-text-subtle)]">
              <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-2">
                Scroll
              </span>
              <span className="block w-[1px] h-8 bg-gradient-to-b from-[var(--c-text-subtle)] to-transparent animate-scroll-cue" />
              <style>{`
                @keyframes scroll-cue {
                  0%, 100% { transform: translateY(0); opacity: 0.7; }
                  50%      { transform: translateY(8px); opacity: 0.3; }
                }
                .animate-scroll-cue {
                  animation: scroll-cue 1.8s ease-in-out infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                  .animate-scroll-cue { animation: none; }
                }
              `}</style>
            </div>

            {/* Trust badges — glassmorphism row with brand-gradient icon
                circles. Each tile lifts on hover (Card + .tl-card-glow
                via interactive) for the "premium chip" feel. */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12">
              {TRUST_BADGES.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block backdrop-blur-sm rounded-[var(--r-xl)] border border-[var(--c-border)] shadow-[var(--s-md)] hover:shadow-[var(--s-lg)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-[var(--m-smooth)] ease-[var(--m-standard)] tl-card-glow px-4 py-3 flex items-center gap-3 text-left"
                  style={{
                    background: "color-mix(in oklab, var(--c-surface) 60%, transparent)",
                  }}
                >
                  <span
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-brand shadow-[var(--s-brand)]"
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </span>
                  <span className="text-xs font-semibold text-[var(--c-text)] leading-tight">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/*
        Section order tells the marketing story:
          1. Hero + Trust Badges (above)         — what is this
          2. ActivityTicker                       — live pulse
          3. NumbersSection                       — proof of scale
          4. PartnersBar                          — social proof
          5. SecurityPillarsSection (post-divider)— answer "is it safe?"
          6. FilmsTeaserSection                   — now show the story
          7. HomeReelsSection                     — more visual content
          8. LeaderboardSection (post-divider)    — community achievement
          9. TestimonialSection                   — real voices
         10. HomeBlogSection                      — deep dives
         11. PromotionsSection (post-divider)     — incentives to act
         12. EventsSection                        — what's happening
         13. SocialWallSection                    — proof wall
         14. ManifestoSection (post-divider)      — emotional close
         15. NewsletterSection                    — final CTA
      */}
      <ActivityTicker />
      <Reveal>
        <NumbersSection />
      </Reveal>
      <Reveal>
        <PartnersBar />
      </Reveal>
      {/* Install-app widget — sits after the social-proof row so it
          catches users who're convinced enough to consider engaging
          deeper. Client-side mount + dismiss flow. Hidden when the
          site is already running standalone, or after 14-day dismiss. */}
      <InstallAppWidget />
      <SectionDivider />
      <Reveal>
        <SecurityPillarsSection />
      </Reveal>
      <Reveal>
        <FilmsTeaserSection />
      </Reveal>
      <Reveal>
        <HomeReelsSection />
      </Reveal>
      <Reveal>
        {/* Multi-language reels — companion to the English HomeReelsSection
            above. Tabs let visitors switch between EN / DE / ID without
            leaving the home flow. */}
        <HomeGlobalReelsSection />
      </Reveal>
      <SectionDivider />
      <Reveal>
        <LeaderboardSection />
      </Reveal>
      <Reveal>
        <TestimonialSection />
      </Reveal>
      <Reveal>
        <HomeBlogSection />
      </Reveal>
      <SectionDivider />
      <Reveal>
        <PromotionsSection />
      </Reveal>
      <Reveal>
        <HiringBanner />
      </Reveal>
      <Reveal>
        <EventsSection />
      </Reveal>
      <Reveal>
        <SocialWallSection />
      </Reveal>
      {/* $TURBO token introduction — moved DOWN-page so the main
          protocol story (yield + plans + promotions + community)
          owns the upper flow. Token reads as a bonus discovery
          after the user has already absorbed why the protocol is
          worth their attention. */}
      <Reveal>
        <TokenSection />
      </Reveal>
      <SectionDivider />
      <Reveal>
        <ManifestoSection />
      </Reveal>
      <Reveal>
        <NewsletterSection />
      </Reveal>
    </main>
  );
}
