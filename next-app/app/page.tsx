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
const NumbersSection = dynamic(() => import("@components/sections/NumbersSection"), { ssr: false });
const TestimonialSection = dynamic(() => import("@components/sections/TestimonialSection"), { ssr: false });
const ProtocolBentoSection = dynamic(() => import("@components/sections/ProtocolBentoSection"), { ssr: false });
const TokenSpotlightSection = dynamic(() => import("@components/sections/TokenSpotlightSection"), { ssr: false });
import { Reveal } from "@components/Reveal";
import { SECURITY } from "@lib/constants";

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

// ISR: revalidate every 60 seconds for performance
export const revalidate = 60;
      default: m.CreativeExplorerSection,
    })),
  { ssr: true }
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
      "description": "TurboLoop is an audited DeFi yield farming protocol on Binance Smart Chain. Earn up to 54% ROI in 60 days from a real USDC/USDT liquidity pool. 100% LP-locked, ownership renounced, 1 USDT minimum.",
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
