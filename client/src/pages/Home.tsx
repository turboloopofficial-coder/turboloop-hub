import ScrollProgress from "@/components/ScrollProgress";
import FloatingLaunchButton from "@/components/FloatingLaunchButton";
import BackToTop from "@/components/BackToTop";
import BackgroundEffects from "@/components/BackgroundEffects";
import Navbar from "@/components/Navbar";
import ActivityTicker from "@/components/ActivityTicker";

import HeroSection from "@/components/sections/HeroSection";
import PartnersBar from "@/components/sections/PartnersBar";
import ReelsSection from "@/components/sections/ReelsSection";
import BlogSection from "@/components/sections/BlogSection";

// New compact teaser sections — each links to a dedicated deep-dive page
import HomeNumbersTeaser from "@/components/sections/HomeNumbersTeaser";
import HomeSecurityTeaser from "@/components/sections/HomeSecurityTeaser";
import HomePromotionsTeaser from "@/components/sections/HomePromotionsTeaser";
import HomeTestimonialRotator from "@/components/sections/HomeTestimonialRotator";

import Footer from "@/components/sections/Footer";
import WelcomePopup from "@/components/WelcomePopup";
import SEOHead from "@/components/SEOHead";

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
        title="Turbo Loop — The Complete DeFi Ecosystem on Binance Smart Chain"
        description="Sustainable yield farming on BSC. Audited & renounced smart contract. 100% LP locked. Six DeFi primitives in one self-sustaining ecosystem. Global community across 6+ continents, 48 languages."
        path="/"
        type="website"
        image="https://turboloop.tech/api/og"
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
              description: "The complete DeFi ecosystem on Binance Smart Chain — sustainable yield, transparent by design.",
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
                target: { "@type": "EntryPoint", urlTemplate: "https://turboloop.tech/feed?q={search_term_string}" },
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
                  acceptedAnswer: { "@type": "Answer", text: "Turbo Loop is a complete DeFi ecosystem built on Binance Smart Chain. It combines six pillars — Turbo Buy, Turbo Swap, Yield Farming, Referral Network, Leadership Program, and Smart Contract Security — into one self-sustaining platform." },
                },
                {
                  "@type": "Question",
                  name: "Where does the yield come from?",
                  acceptedAnswer: { "@type": "Answer", text: "Turbo Loop generates yield from three real revenue sources: LP rewards, Turbo Swap fees (0.3% per trade), and Turbo Buy fees from fiat-to-crypto conversions." },
                },
                {
                  "@type": "Question",
                  name: "Is Turbo Loop safe?",
                  acceptedAnswer: { "@type": "Answer", text: "Audited, renounced, LP locked, BscScan-verified, 100% on-chain. The protocol offers a $100,000 bounty to anyone who can prove centralization in the smart contract." },
                },
                {
                  "@type": "Question",
                  name: "How do I get started with Turbo Loop?",
                  acceptedAnswer: { "@type": "Answer", text: "Connect MetaMask or Trust Wallet, buy BNB or USDT, deposit USDT into the farming contract, earn daily yield from protocol revenue. Visit turboloop.io and click Launch App." },
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

        {/* 2. Partners bar */}
        <PartnersBar />

        {/* 3. The Numbers — animated stats → /community */}
        <HomeNumbersTeaser />

        {/* 4. Watch The Movement — Reels (already a horizontal carousel, perfect as-is) */}
        <ReelsSection />

        {/* 5. The Editorial — featured + recent blog posts → /feed */}
        <BlogSection />

        {/* 6. Trustless by Design — 5 pillars + quote → /security */}
        <HomeSecurityTeaser />

        {/* 7. Earn While You Build — $100K hero + 3 cards → /promotions */}
        <HomePromotionsTeaser />

        {/* 8. The Community Voice — single rotating testimonial → /community */}
        <HomeTestimonialRotator />
      </main>

      <Footer />
      <FloatingLaunchButton />
      <BackToTop />
      <WelcomePopup />
    </div>
  );
}
