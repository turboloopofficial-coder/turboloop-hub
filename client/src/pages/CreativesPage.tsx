import PageShell from "@/components/PageShell";
import CreativesHubSection from "@/components/sections/CreativesHubSection";
import { ALL_CREATIVES, CREATIVE_CATEGORIES } from "@/lib/creativesData";

export default function CreativesPage() {
  return (
    <PageShell
      title="Creatives Library"
      description={`${ALL_CREATIVES.length} ready-to-share community banners across ${CREATIVE_CATEGORIES.length} pillars. Copy any caption, download any image, share with one tap.`}
      path="/creatives"
      hero={{
        label: "Creatives Library",
        heading: "Every banner. Every caption. One tap to share.",
        subtitle: `${ALL_CREATIVES.length} branded posts ready for Telegram, X, WhatsApp — every one comes with its own pre-written caption.`,
        palette: ["#EC4899", "#F472B6", "#7C3AED"],
        emoji: "🎨",
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        name: "Turbo Loop Creatives Library",
        description: `${ALL_CREATIVES.length} community banners.`,
        url: "https://turboloop.tech/creatives",
      }}
      related={[
        { label: "Community", href: "/community", emoji: "🌍", description: "See where these banners are being shared" },
        { label: "Editorial", href: "/feed", emoji: "📖", description: "Deep-dive articles" },
        { label: "Promotions", href: "/promotions", emoji: "🎁", description: "Get paid for sharing" },
      ]}
    >
      <CreativesHubSection />
    </PageShell>
  );
}
