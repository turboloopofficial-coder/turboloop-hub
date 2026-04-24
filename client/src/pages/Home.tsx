import ScrollProgress from "@/components/ScrollProgress";
import FloatingLaunchButton from "@/components/FloatingLaunchButton";
import BackgroundEffects from "@/components/BackgroundEffects";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import PartnersBar from "@/components/sections/PartnersBar";
import ReelsSection from "@/components/sections/ReelsSection";
import EcosystemSection from "@/components/sections/EcosystemSection";
import LeaderboardSection from "@/components/sections/LeaderboardSection";
import FlywheelSection from "@/components/sections/FlywheelSection";
import PromotionsSection from "@/components/sections/PromotionsSection";
import VideoSection from "@/components/sections/VideoSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
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
        description="Sustainable yield. Transparent by design. Open to everyone. Audited smart contract, renounced ownership, 100% LP locked. Join a global community across 6+ continents."
        path="/"
        type="website"
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
                "https://x.com/Turbo_Loop",
                "https://www.youtube.com/@OfficialTurbo_Loop",
              ],
              description: "The complete DeFi ecosystem on Binance Smart Chain — sustainable yield, transparent by design.",
            },
            {
              "@type": "WebSite",
              "@id": "https://turboloop.tech/#website",
              url: "https://turboloop.tech",
              name: "Turbo Loop",
              description: "The complete DeFi ecosystem on Binance Smart Chain",
              publisher: { "@id": "https://turboloop.tech/#organization" },
              inLanguage: "en",
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
        <ReelsSection />
        <EventsSection />
        <EcosystemSection />
        <FlywheelSection />
        <LeaderboardSection />
        <PromotionsSection />
        <VideoSection />
        <TestimonialsSection />
        <BlogSection />
        <RoadmapSection />
        <TrustSection />
        <FaqSection />
      </main>
      <Footer />
      <FloatingLaunchButton />
      <WelcomePopup />
    </div>
  );
}
