import PageShell from "@/components/PageShell";
import FaqSection from "@/components/sections/FaqSection";

export default function FaqPage() {
  return (
    <PageShell
      title="Frequently Asked Questions"
      description="Everything you need to know about Turbo Loop — security, yield, getting started, the community, and more."
      path="/faq"
      hero={{
        label: "Help Center",
        heading: "Everything you need to know.",
        subtitle: "Quick answers to the most common questions about Turbo Loop. Search, filter by category, find what you need.",
        palette: ["#10B981", "#0EA5E9", "#7C3AED"],
        emoji: "❓",
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        url: "https://turboloop.tech/faq",
        // The actual Q&A schema lives in FaqSection (rendered inline)
      }}
      related={[
        { label: "Security", href: "/security", emoji: "🛡", description: "Verify everything yourself" },
        { label: "Editorial", href: "/feed", emoji: "📖", description: "Long-form deep dives" },
        { label: "Community", href: "/community", emoji: "🌍", description: "Real members in real time" },
      ]}
    >
      <FaqSection />
    </PageShell>
  );
}
