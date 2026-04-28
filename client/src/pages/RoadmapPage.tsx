import PageShell from "@/components/PageShell";
import RoadmapSection from "@/components/sections/RoadmapSection";

export default function RoadmapPage() {
  return (
    <PageShell
      title="Roadmap"
      description="Where Turbo Loop is and where it's going. Six phases done. Three to go. Every milestone verifiable on-chain."
      path="/roadmap"
      hero={{
        label: "The Expansion Protocol",
        heading: "Where we are. Where we're going.",
        subtitle: "Six of nine phases complete. Each milestone is verifiable on BscScan. The remaining three build on top of the immutable foundation already in place.",
        palette: ["#0EA5E9", "#0891B2", "#10B981"],
        emoji: "🚀",
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Roadmap — Turbo Loop",
        url: "https://turboloop.tech/roadmap",
        description: "9-phase Turbo Loop roadmap, current status and what's next.",
      }}
      related={[
        { label: "Security", href: "/security", emoji: "🛡", description: "How the foundation was built" },
        { label: "Community", href: "/community", emoji: "🌍", description: "Who's building with us" },
        { label: "Editorial", href: "/feed", emoji: "📖", description: "Phase-by-phase deep dives" },
      ]}
    >
      <RoadmapSection />
    </PageShell>
  );
}
