import ScrollProgress from "@/components/ScrollProgress";
import FloatingLaunchButton from "@/components/FloatingLaunchButton";
import BackToTop from "@/components/BackToTop";
import BackgroundEffects from "@/components/BackgroundEffects";
import Navbar from "@/components/Navbar";
import ActivityTicker from "@/components/ActivityTicker";
import HeroSection from "@/components/sections/HeroSection";
import PartnersBar from "@/components/sections/PartnersBar";
import ReelsSection from "@/components/sections/ReelsSection";
import EcosystemSection from "@/components/sections/EcosystemSection";
import LeaderboardSection from "@/components/sections/LeaderboardSection";
import FlywheelSection from "@/components/sections/FlywheelSection";
import PromotionsSection from "@/components/sections/PromotionsSection";
import VideoSection from "@/components/sections/VideoSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CreativesHubSection from "@/components/sections/CreativesHubSection";
import SocialWallSection from "@/components/sections/SocialWallSection";
import BlogSection from "@/components/sections/BlogSection";
import EventsSection from "@/components/sections/EventsSection";
import RoadmapSection from "@/components/sections/RoadmapSection";
import TrustSection from "@/components/sections/TrustSection";
import FaqSection from "@/components/sections/FaqSection";
import Footer from "@/components/sections/Footer";
import WelcomePopup from "@/components/WelcomePopup";
import SEOHead from "@/components/SEOHead";

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
            // FAQPage — surfaces these questions directly in Google search results
            {
              "@type": "FAQPage",
              "@id": "https://turboloop.tech/#faq",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What is Turbo Loop?",
                  acceptedAnswer: { "@type": "Answer", text: "Turbo Loop is a complete DeFi ecosystem built on Binance Smart Chain. It combines six pillars — Turbo Buy, Turbo Swap, Yield Farming, Referral Network, Leadership Program, and Smart Contract Security — into one self-sustaining platform. Unlike single-purpose protocols, Turbo Loop generates revenue from real economic activity through its Revenue Flywheel." },
                },
                {
                  "@type": "Question",
                  name: "Where does the yield come from?",
                  acceptedAnswer: { "@type": "Answer", text: "Turbo Loop generates yield from three real revenue sources: LP rewards from liquidity provision, Turbo Swap fees (0.3% per trade), and Turbo Buy fees from fiat-to-crypto conversions. These revenue streams create a self-reinforcing Velocity Cycle — the more the ecosystem is used, the more yield it generates." },
                },
                {
                  "@type": "Question",
                  name: "Is Turbo Loop safe?",
                  acceptedAnswer: { "@type": "Answer", text: "Turbo Loop is built on five pillars of security: the smart contract has been independently audited, ownership is permanently renounced, 100% of LP is locked, the contract is verified on BscScan, and all operations are 100% on-chain. The protocol offers a $100,000 bounty to anyone who can prove centralization in the smart contract." },
                },
                {
                  "@type": "Question",
                  name: "How do I get started with Turbo Loop?",
                  acceptedAnswer: { "@type": "Answer", text: "Five steps: (1) Connect MetaMask or Trust Wallet, (2) Buy BNB or USDT through Turbo Buy or transfer from an exchange, (3) Deposit USDT into the farming contract, (4) Earn daily yield from protocol revenue, and (5) Grow by referring others and climbing leadership ranks. Visit turboloop.io and click Launch App to begin." },
                },
                {
                  "@type": "Question",
                  name: "How does the Turbo Loop referral program work?",
                  acceptedAnswer: { "@type": "Answer", text: "When you share your unique referral link and someone joins through it, you earn a percentage of their farming rewards across 20 levels. As your network grows, you can advance through five leadership ranks — Builder, Accelerator, Director, Executive, and Ambassador — each unlocking higher reward percentages." },
                },
                {
                  "@type": "Question",
                  name: "Can I withdraw my funds at any time?",
                  acceptedAnswer: { "@type": "Answer", text: "Yes. You can withdraw your earned rewards at any time without penalties. You have three options: withdraw to your wallet, compound (reinvest) to increase your deposited amount and earn higher future yields, or a combination of both. The smart contract handles all withdrawals automatically on-chain." },
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
        <HeroSection />
        <PartnersBar />
        {/* Live activity ticker — sliding marquee of real events */}
        <ActivityTicker />
        <ReelsSection />
        {/* Blog moved up — primary content discovery + SEO weight */}
        <BlogSection />
        <EventsSection />
        <EcosystemSection />
        <FlywheelSection />
        <LeaderboardSection />
        <CreativesHubSection />
        <PromotionsSection />
        <VideoSection />
        <SocialWallSection />
        <TestimonialsSection />
        <RoadmapSection />
        <TrustSection />
        <FaqSection />
      </main>
      <Footer />
      <FloatingLaunchButton />
      <BackToTop />
      <WelcomePopup />
    </div>
  );
}
