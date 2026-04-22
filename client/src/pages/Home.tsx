import ScrollProgress from "@/components/ScrollProgress";
import FloatingLaunchButton from "@/components/FloatingLaunchButton";
import BackgroundEffects from "@/components/BackgroundEffects";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import EcosystemSection from "@/components/sections/EcosystemSection";
import LeaderboardSection from "@/components/sections/LeaderboardSection";
import FlywheelSection from "@/components/sections/FlywheelSection";
import PromotionsSection from "@/components/sections/PromotionsSection";
import VideoSection from "@/components/sections/VideoSection";
import BlogSection from "@/components/sections/BlogSection";
import EventsSection from "@/components/sections/EventsSection";
import RoadmapSection from "@/components/sections/RoadmapSection";
import TrustSection from "@/components/sections/TrustSection";
import FaqSection from "@/components/sections/FaqSection";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen relative" style={{ background: "#060a16" }}>
      <ScrollProgress />
      <BackgroundEffects />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <EcosystemSection />
        <LeaderboardSection />
        <FlywheelSection />
        <PromotionsSection />
        <VideoSection />
        <BlogSection />
        <EventsSection />
        <RoadmapSection />
        <TrustSection />
        <FaqSection />
      </main>
      <Footer />
      <FloatingLaunchButton />
    </div>
  );
}
