import PageShell from "@/components/PageShell";
import LeaderboardSection from "@/components/sections/LeaderboardSection";
import SocialWallSection from "@/components/sections/SocialWallSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";

export default function CommunityPage() {
  return (
    <PageShell
      title="Community"
      description="The Turbo Loop community spans 6 continents, 21+ countries, 48 languages. Real voices, real growth, real proof."
      path="/community"
      hero={{
        label: "Global Community",
        heading: "From Lagos to Berlin to Jakarta",
        subtitle: "An organic global community formed around a single immutable contract. 6 continents · 21+ countries · 48 languages.",
        palette: ["#7C3AED", "#A78BFA", "#EC4899"],
        emoji: "🌍",
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Community — Turbo Loop",
        url: "https://turboloop.tech/community",
        description: "Global Turbo Loop community across 6 continents.",
      }}
      related={[
        { label: "Editorial", href: "/feed", emoji: "📖", description: "Articles from across the community" },
        { label: "Creatives", href: "/creatives", emoji: "🎨", description: "141 ready-to-share community banners" },
        { label: "Security", href: "/security", emoji: "🛡", description: "Why people trust the contract" },
      ]}
    >
      <LeaderboardSection />
      <SocialWallSection />
      <TestimonialsSection />
    </PageShell>
  );
}
