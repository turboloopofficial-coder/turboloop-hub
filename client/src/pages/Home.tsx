import Navbar from "@/components/Navbar";
import SectionDivider from "@/components/SectionDivider";
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
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <SectionDivider variant="cyan" />
      <EcosystemSection />
      <SectionDivider variant="mixed" />
      <LeaderboardSection />
      <SectionDivider variant="purple" />
      <FlywheelSection />
      <SectionDivider variant="cyan" />
      <PromotionsSection />
      <SectionDivider variant="mixed" />
      <VideoSection />
      <SectionDivider variant="purple" />
      <BlogSection />
      <SectionDivider variant="cyan" />
      <EventsSection />
      <SectionDivider variant="mixed" />
      <RoadmapSection />
      <SectionDivider variant="purple" />
      <TrustSection />
      <Footer />
    </div>
  );
}
