import { lazy, Suspense } from "react";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import BackgroundEffects from "@/components/BackgroundEffects";
import Navbar from "@/components/Navbar";

// Above-the-fold: load eagerly so the first paint includes them.
import HeroSection from "@/components/sections/HeroSection";
import ActivityTicker from "@/components/ActivityTicker";
import CinematicEmbed from "@/components/sections/CinematicEmbed";

// Below-the-fold: code-split + render-deferred via Suspense. The home
// page bundle was 133 KB gzipped because it eagerly imported every
// section. Splitting cuts the critical-path JS by ~40 KB (gzipped) and
// these sections only mount when the user actually scrolls toward them.
const PartnersBar = lazy(() => import("@/components/sections/PartnersBar"));
const HomeNumbersTeaser = lazy(
  () => import("@/components/sections/HomeNumbersTeaser")
);
const ReelsSection = lazy(() => import("@/components/sections/ReelsSection"));
const BlogSection = lazy(() => import("@/components/sections/BlogSection"));
const HomeSecurityTeaser = lazy(
  () => import("@/components/sections/HomeSecurityTeaser")
);
const HomePromotionsTeaser = lazy(
  () => import("@/components/sections/HomePromotionsTeaser")
);
const HomeTestimonialRotator = lazy(
  () => import("@/components/sections/HomeTestimonialRotator")
);
const NewsletterSignup = lazy(() => import("@/components/NewsletterSignup"));

import Footer from "@/components/sections/Footer";
import WelcomePopup from "@/components/WelcomePopup";
import SEOHead from "@/components/SEOHead";

// Tiny shim — sized to roughly match each section's height so the
// scroll position doesn't jump as sections hydrate.
const SectionFallback = ({ h = 320 }: { h?: number }) => (
  <div style={{ height: h }} />
);

/**
 * Homepage — narrative-driven, 8 focused sections.
 *
 * The full content (LeaderboardSection, SocialWallSection, TestimonialsSection,
 * CreativesHubSection, TrustSection, EventsSection, EcosystemSection, FlywheelSection,
 * VideoSection, RoadmapSection, FaqSection, PromotionsSection) now lives on dedicated
 * pages — each linked from the corresponding teaser section here.
 *
 * Rationale: a 17-section homepage is overwhelming and dilutes SEO weight. A focused
 * narrative homepage with clear "see more →" CTAs drives users into the right depth
 * AND lets each topic-page rank independently for its own keywords.
 */
export default function Home() {
  return (
    <div className="min-h-screen relative" style={{ background: "#F7F8FC" }}>
      <SEOHead
        title="Turbo Loop — Sustainable DeFi Yield on BSC"
        description="Audited, renounced, 100% LP-locked yield farming on Binance Smart Chain. Six DeFi primitives, one self-sustaining ecosystem."
        path="/"
        type="website"
        image="https://turboloop.tech/api/og-banner?type=launch"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://turboloop.tech/#organization",
              name: "Turbo Loop",
              url: "https://turboloop.tech",
              logo: "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png",
              sameAs: [
                "https://t.me/TurboLoop_Official",
                "https://t.me/TurboLoop_Chat",
                "https://x.com/TurboLoop_io",
                "https://www.youtube.com/@OfficialTurbo_Loop",
              ],
              description:
                "The complete DeFi ecosystem on Binance Smart Chain — sustainable yield, transparent by design.",
              foundingDate: "2026",
            },
            {
              "@type": "WebSite",
              "@id": "https://turboloop.tech/#website",
              url: "https://turboloop.tech",
              name: "Turbo Loop",
              description: "The complete DeFi ecosystem on Binance Smart Chain",
              publisher: { "@id": "https://turboloop.tech/#organization" },
              inLanguage: "en",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://turboloop.tech/feed?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "FAQPage",
              "@id": "https://turboloop.tech/#faq",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What is Turbo Loop?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Turbo Loop is a complete DeFi ecosystem built on Binance Smart Chain. It combines six pillars — Turbo Buy, Turbo Swap, Yield Farming, Referral Network, Leadership Program, and Smart Contract Security — into one self-sustaining platform.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Where does the yield come from?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Turbo Loop generates yield from three real revenue sources: LP rewards, Turbo Swap fees (0.3% per trade), and Turbo Buy fees from fiat-to-crypto conversions.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is Turbo Loop safe?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Audited, renounced, LP locked, BscScan-verified, 100% on-chain. The protocol offers a $100,000 bounty to anyone who can prove centralization in the smart contract.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do I get started with Turbo Loop?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Connect MetaMask or Trust Wallet, buy BNB or USDT, deposit USDT into the farming contract, earn daily yield from protocol revenue. Visit turboloop.io and click Launch App.",
                  },
                },
              ],
            },
          ],
        }}
      />

      <ScrollProgress />
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10">
        {/* 1. Hero */}
        <HeroSection />

        {/* Activity ticker — sliding marquee of real events (under hero, narrow band) */}
        <ActivityTicker />

        {/* "What is TurboLoop?" cinematic embed — answers the most-asked question in 60s */}
        <CinematicEmbed
          slug="what-is-turboloop"
          label="Watch in 60 seconds"
          pretitle="New here? Start with this."
        />

        {/* All below-the-fold sections lazy-load. SectionFallback keeps
            the scroll height roughly correct so layout doesn't jump. */}
        <Suspense fallback={<SectionFallback h={120} />}>
          <PartnersBar />
        </Suspense>

        <Suspense fallback={<SectionFallback h={400} />}>
          <HomeNumbersTeaser />
        </Suspense>

        <Suspense fallback={<SectionFallback h={520} />}>
          <ReelsSection />
        </Suspense>

        <Suspense fallback={<SectionFallback h={520} />}>
          <BlogSection />
        </Suspense>

        <Suspense fallback={<SectionFallback h={480} />}>
          <HomeSecurityTeaser />
        </Suspense>

        <Suspense fallback={<SectionFallback h={520} />}>
          <HomePromotionsTeaser />
        </Suspense>

        <Suspense fallback={<SectionFallback h={320} />}>
          <HomeTestimonialRotator />
        </Suspense>

        {/* The Manifesto — emotional outro before footer */}
        <CinematicEmbed
          slug="manifesto"
          label="The Manifesto"
          pretitle="Your money. Your power. Your future."
        />

        <Suspense fallback={<SectionFallback h={280} />}>
          <NewsletterSignup source="homepage" variant="card" />
        </Suspense>
      </main>

      <Footer />
      <BackToTop />
      <WelcomePopup />
    </div>
  );
}
