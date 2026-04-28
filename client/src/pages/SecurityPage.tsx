import PageShell from "@/components/PageShell";
import TrustSection from "@/components/sections/TrustSection";

export default function SecurityPage() {
  return (
    <PageShell
      title="Security & Trust"
      description="Audited. Renounced. Locked. The five pillars that make Turbo Loop trustless by design — every claim verifiable on BscScan."
      path="/security"
      hero={{
        label: "Security & Trust",
        heading: "Trustless by Design",
        subtitle: "Five pillars that make Turbo Loop verifiable from any computer in the world. Don't trust the team — verify the code.",
        palette: ["#0891B2", "#22D3EE", "#7C3AED"],
        emoji: "🛡",
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Security & Trust — Turbo Loop",
        url: "https://turboloop.tech/security",
        description: "Audited, renounced, locked. Five pillars of trustless DeFi.",
      }}
      related={[
        { label: "The Editorial", href: "/feed", emoji: "📖", description: "Deep-dive articles on every aspect of the protocol" },
        { label: "Roadmap", href: "/roadmap", emoji: "🚀", description: "Where we are and what's next" },
        { label: "Community", href: "/community", emoji: "🌍", description: "21+ countries · 6 continents · 48 languages" },
      ]}
    >
      <TrustSection />
    </PageShell>
  );
}
