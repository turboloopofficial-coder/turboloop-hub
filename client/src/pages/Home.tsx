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
import YieldCalculator from "@/components/sections/YieldCalculator";
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

export default function Home() {
  return (
    <div className="min-h-screen relative" style={{ background: "#F7F8FC" }}>
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
        <YieldCalculator />
        <LeaderboardSection />
        <TestimonialsSection />
        <PromotionsSection />
        <VideoSection />
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
