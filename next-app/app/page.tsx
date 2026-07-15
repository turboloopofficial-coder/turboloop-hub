// Homepage — Protocol-First Reimagination.
//
// Each section lives in its own file in /components/sections/ for
// independent ownership. The homepage just composes them in narrative
// order:
//
//   1. Hero               — what is this and why care (top of funnel)
//   2. ProtocolBento      — the whole product at a glance (4 plans + referral + ranks + security + films)
//   3. TokenSpotlight     — $TURBO as the additive bonus, properly elevated
//   4. Numbers + Testim.  — proof of scale + social proof
//   5. HomeGlobalReels    — multi-language content proof
//   6. ZoomLive           — community pulse with live countdowns
//   7. HomeBlog           — editorial (English only)
//   8. Newsletter         — final CTA
//
// Sections that previously lived on the homepage (ActivityTicker,
// PartnersBar, SecurityPillars, FilmsTeaser, HomeReels, Leaderboard,
// Promotions, HiringBanner, EventsSection, SocialWall, Manifesto,
// TokenSection, InstallAppWidget) still exist at their own URLs — they
// were removed from the homepage to tighten the narrative, not deleted.
//
// Every section is a Server Component. Zero client JS for the page
// itself; the only client islands are the mobile menu, the bottom CTA
// bar (in the layout), and the small countdown ticker inside ZoomLive.

import dynamic from "next/dynamic";
import { ShieldCheck, Lock, CheckCircle2, Globe2, Rocket } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { SectionDivider } from "@components/ui/SectionDivider";

import { Reveal } from "@components/Reveal";
import { SECURITY } from "@lib/constants";

// Game-changing animation components (client island — "use client" boundary)
import { AnimatedHero, HeroTypewriter, HeroCounter } from "@components/animations/AnimatedHero";

// Below-fold sections — dynamically imported so their JS chunk lands
// after the hero is interactive. ssr:true keeps the HTML server-rendered
// so SEO/CLS are unchanged; the only difference is the JS bundle split.
const HomeGlobalReelsSection = dynamic(
  () =>
    import("@components/sections/HomeGlobalReelsSection").then(m => ({
      default: m.HomeGlobalReelsSection,
    })),
  { ssr: true }
);
const ZoomLiveSection = dynamic(
  () =>
    import("@components/sections/ZoomLiveSection").then(m => ({
      default: m.ZoomLiveSection,
    })),
  { ssr: true }
);
const HomeBlogSection = dynamic(
  () =>
    import("@components/sections/HomeBlogSection").then(m => ({
      default: m.HomeBlogSection,
    })),
  { ssr: true }
);
const NewsletterSection = dynamic(
  () =>
    import("@components/sections/NewsletterSection").then(m => ({
      default: m.NewsletterSection,
    })),
  { ssr: true }
);
const CreativeExplorerSection = dynamic(
  () =>
    import("@components/sections/CreativeExplorerSection").then(m => ({
      default: m.CreativeExplorerSection,
    })),
  { ssr: true }
);
const NumbersSection = dynamic(
  () =>
    import("@components/sections/NumbersSection").then(m => ({
      default: m.NumbersSection,
    })),
  { ssr: true }
);
const TestimonialSection = dynamic(
  () =>
    import("@components/sections/TestimonialSection").then(m => ({
      default: m.TestimonialSection,
    })),
  { ssr: true }
);
const ProtocolBentoSection = dynamic(
  () =>
    import("@components/sections/ProtocolBentoSection").then(m => ({
      default: m.ProtocolBentoSection,
    })),
  { ssr: true }
);
const TokenSpotlightSection = dynamic(
  () =>
    import("@components/sections/TokenSpotlightSection").then(m => ({
      default: m.TokenSpotlightSection,
    })),
  { ssr: true }
);
const VideoExplainerSection = dynamic(
  () =>
    import("@components/sections/VideoExplainerSection").then(m => ({
      default: m.VideoExplainerSection,
    })),
  { ssr: false }
);

const TRUST_BADGES = [
  {
    icon: ShieldCheck,
    label: "Independently Audited",
    href: SECURITY.auditUrl,
  },
  {
    icon: Lock,
    label: "100% LP Locked",
    href: SECURITY.lpLockProof,
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

// ─── JSON-LD structured data ────────────────────────────────────────────────
// Organization schema → establishes brand knowledge panel in Google.
// WebSite schema → enables Sitelinks Search Box in SERPs.
const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.turboloop.tech/#organization",
      "name": "TurboLoop",
      "url": "https://www.turboloop.tech",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.turboloop.tech/logo.png",
        "width": 512,
        "height": 512,
      },
      "description": "TurboLoop is an audited DeFi yield farming protocol on BNB Smart Chain. Earn up to 54% ROI in 60 days from a real USDC/USDT liquidity pool. 100% LP-locked, ownership renounced, 1 USDT minimum.",
      "sameAs": [
        "https://t.me/TurboLoopOfficial",
        "https://twitter.com/TurboLoopDeFi",
        "https://turboloop.io",
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": "https://t.me/TurboLoopOfficial",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.turboloop.tech/#website",
      "url": "https://www.turboloop.tech",
      "name": "TurboLoop Hub",
      "description": "The official hub for TurboLoop DeFi — yield calculator, token info, blog, creatives, and community.",
      "publisher": { "@id": "https://www.turboloop.tech/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.turboloop.tech/blog?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FinancialService",
      "@id": "https://www.turboloop.tech/#protocol",
      "name": "TurboLoop DeFi Protocol",
      "url": "https://turboloop.io",
      "description": "Decentralized yield farming protocol on BSC. Fixed ROI per cycle: Sprint 3% (7d), Boost 10% (14d), Power 24% (30d), Ultimate 54% (60d). Revenue from USDC/USDT LP rewards, Turbo Swap fees, and Turbo Buy fees.",
      "provider": { "@id": "https://www.turboloop.tech/#organization" },
      "areaServed": "Worldwide",
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": "https://turboloop.io",
        "serviceType": "DeFi Yield Farming",
      },
    },
  ],
};

export const revalidate = 60;

export default function HomePage() {
  return (
    <main className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
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
      <section className="relative pt-20 pb-20 md:pt-36 md:pb-32 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background layers — particle field + orbital + gradient mesh blobs */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 hero-grid-bg opacity-50" />
          <div className="absolute inset-0 hero-glow" />
          {/* Animated gradient mesh blobs */}
          <div className="absolute top-[5%] left-[5%] w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-[100px] mesh-blob" />
          <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-purple-500/8 blur-[100px] mesh-blob-2" />
          <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[80px] mesh-blob-3" />
          {/* Particle constellation + 3D orbital ring (client island) */}
          <AnimatedHero phrases={[]} />
        </div>

        <Container width="wide">
          <div className="relative text-center max-w-3xl mx-auto">
            {/* Eyebrow live-status pill — staggered entrance */}
            <div className="hero-animate-1 inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-[var(--c-surface)]/80 border border-[var(--c-border)] shadow-[var(--s-sm)] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <Heading tier="eyebrow" as="span" className="text-emerald-600 dark:text-emerald-400">
                Live on BNB Smart Chain
              </Heading>
            </div>

            {/* Hero wordmark — dramatic entrance */}
            <div className="hero-animate-2">
              <Heading tier="display" className="mb-6">
                <span>Turbo </span>
                <span className="text-brand-wide">Loop</span>
              </Heading>
            </div>

            {/* Typewriter subtitle */}
            <div className="hero-animate-3 text-lg md:text-xl text-[var(--c-text-muted)] mb-10 leading-relaxed max-w-2xl mx-auto h-[3.5rem] md:h-[2rem] flex items-center justify-center">
              <HeroTypewriter
                phrases={[
                  "Sustainable yield. Transparent by design.",
                  "Earn up to 54% ROI in 60 days.",
                  "Audited. LP-locked. Ownership renounced.",
                  "Open to everyone. Starting from $1.",
                ]}
                className="text-[var(--c-text)] font-medium"
              />
            </div>

            {/* Primary + secondary CTAs — staggered */}
            <div className="hero-animate-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center max-w-md sm:max-w-none mx-auto mb-4">
              <a
                href="https://turboloop.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] h-[54px] text-base px-8 text-white bg-brand glow-pulse hover:shadow-[var(--s-xl)] hover:scale-[1.02] transition-all duration-300 active:scale-[0.985]"
              >
                Launch App
                <Rocket className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="/films"
                className="inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] h-[54px] text-base px-8 bg-[var(--c-surface)]/80 text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:bg-[var(--c-bg)] hover:shadow-[var(--s-md)] hover:border-[var(--c-border-strong)] transition-all duration-300 active:scale-[0.985] backdrop-blur-md"
              >
                Watch the films
              </a>
            </div>

            <a
              href="/submit"
              className="hero-animate-4 inline-block text-sm text-[var(--c-text-muted)] hover:text-[var(--c-brand-cyan)] underline decoration-[var(--c-border)] underline-offset-4 transition"
            >
              Or share your story →
            </a>

            {/* Hero stats row — animated counters */}
            <div className="hero-animate-5 grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 mb-4">
              <div className="text-center p-4 rounded-xl bg-[var(--c-surface)]/50 backdrop-blur-sm border border-[var(--c-border)]/50">
                <HeroCounter end={54} suffix="%" className="stat-highlight" />
                <div className="text-xs font-medium text-[var(--c-text-muted)] mt-1">Max ROI</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[var(--c-surface)]/50 backdrop-blur-sm border border-[var(--c-border)]/50">
                <HeroCounter end={1} prefix="$" className="stat-highlight" />
                <div className="text-xs font-medium text-[var(--c-text-muted)] mt-1">Min Deposit</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[var(--c-surface)]/50 backdrop-blur-sm border border-[var(--c-border)]/50">
                <HeroCounter end={4} className="stat-highlight" />
                <div className="text-xs font-medium text-[var(--c-text-muted)] mt-1">Loop Plans</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[var(--c-surface)]/50 backdrop-blur-sm border border-[var(--c-border)]/50">
                <div className="stat-highlight">24/7</div>
                <div className="text-xs font-medium text-[var(--c-text-muted)] mt-1">On-chain</div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="hero-animate-6 hidden md:flex flex-col items-center mt-10 text-[var(--c-text-subtle)]">
              <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-2">
                Scroll
              </span>
              <span className="block w-[1px] h-8 bg-gradient-to-b from-[var(--c-text-subtle)] to-transparent animate-scroll-cue" />
            </div>

            {/* Trust badges — premium glassmorphism with gradient border on hover */}
            <div className="hero-animate-6 grid grid-cols-2 md:grid-cols-4 gap-3 mt-14">
              {TRUST_BADGES.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group gradient-border-card backdrop-blur-md rounded-[var(--r-xl)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-lg)] hover:-translate-y-1 transition-all duration-300 px-4 py-4 flex items-center gap-3 text-left"
                  style={{
                    background: "color-mix(in oklab, var(--c-surface) 80%, transparent)",
                  }}
                >
                  <span
                    className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 dark:border-cyan-400/20"
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5 text-[var(--c-brand-cyan)]" />
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
        Section order tells the protocol-first marketing story:
          1. Hero + Trust Badges (above)              — what is this
          2. ProtocolBentoSection                     — the product at a glance
          3. TokenSpotlightSection                    — $TURBO as the additive bonus
          4. NumbersSection + TestimonialSection      — proof of scale + voices
          5. HomeGlobalReelsSection                   — multi-language content proof
          6. ZoomLiveSection                          — community pulse, live countdown
          7. HomeBlogSection                          — editorial, English only
          8. NewsletterSection                        — final CTA
      */}

      {/* 2. Protocol Bento Grid — the whole product at a glance */}
      <Reveal>
        <ProtocolBentoSection />
      </Reveal>

            <SectionDivider />
      {/* 2b. Video Explainer — deep dive into how TurboLoop works */}
      <VideoExplainerSection />
      <SectionDivider />
      {/* 3. $TURBO Token Spotlight — additive bonus, properly elevated */}
      <Reveal>
        <TokenSpotlightSection />
      </Reveal>

      <SectionDivider />

      {/* 4. Numbers + Testimonials — proof of scale and community */}
      <Reveal>
        <NumbersSection />
      </Reveal>
      <Reveal>
        <TestimonialSection />
      </Reveal>

            {/* 5. Global Reels — multi-language content proof */}
      <Reveal>
        <HomeGlobalReelsSection />
      </Reveal>
      <SectionDivider />
      {/* 5b. Creative Explorer — interactive banner browser by language/category */}
      <CreativeExplorerSection />
      <SectionDivider />

      {/* 6. Community Live — Zoom calls with countdown */}
      <Reveal>
        <ZoomLiveSection />
      </Reveal>

      <SectionDivider />

      {/* 7. Editorial — defaults to English on root (no locale prefix) */}
      <Reveal>
        <HomeBlogSection locale="en" />
      </Reveal>

      <SectionDivider />

      {/* 8. Newsletter — final CTA */}
      <Reveal>
        <NewsletterSection />
      </Reveal>
    </main>
  );
}
