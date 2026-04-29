import PageShell from "@/components/PageShell";
import PromotionsSection from "@/components/sections/PromotionsSection";

export default function PromotionsPage() {
  return (
    <PageShell
      title="Active Programs"
      description="$100,000 Smart Contract Bounty · Content Creator Star · Local Zoom Presenter · Onboarding Bonus. Four ways to earn beyond yield farming."
      path="/promotions"
      hero={{
        label: "Earn While You Build",
        heading: "Four programs. Real rewards.",
        subtitle: "Get paid for finding security holes, creating content, hosting community calls, and depositing for the first time. All paid in USDT.",
        palette: ["#F59E0B", "#EC4899", "#7C3AED"],
        emoji: "🎁",
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Active Programs — Turbo Loop",
        url: "https://turboloop.tech/promotions",
        description: "$100K bounty + creator + presenter + onboarding programs.",
      }}
      related={[
        { label: "Community", href: "/community", emoji: "🌍", description: "Where the rewards land" },
        { label: "Security", href: "/security", emoji: "🛡", description: "Where the bounty is held" },
        { label: "Creatives", href: "/creatives", emoji: "🎨", description: "Banners to share for Creator Star" },
      ]}
    >
      <PromotionsSection />
    </PageShell>
  );
}
