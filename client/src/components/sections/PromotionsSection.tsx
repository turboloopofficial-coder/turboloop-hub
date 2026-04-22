import { motion } from "framer-motion";
import { Shield, Video, Users, Gift } from "lucide-react";
import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";

const PROMO_CARDS = [
  {
    icon: Shield,
    title: "$100K Smart Contract Challenge",
    badge: "BOUNTY",
    subtitle: "Find a vulnerability. Win $100,000.",
    description: "Open challenge to anyone who can prove centralization in the Turbo Loop smart contract. Identify any owner-controlled function, submit verifiable on-chain evidence, and claim $100,000 USDT if validated by independent auditors.",
    color: "#FBBF24",
    isHero: true,
  },
  {
    icon: Video,
    title: "Content Creator Star",
    badge: "EARN",
    subtitle: "Get paid for every view",
    description: "Create content about Turbo Loop and earn based on your reach. 1K-5K views: $10. 5K-20K: $25. 20K-100K: $50. 100K+: $100. No minimum followers required.",
    color: "#C084FC",
    isHero: false,
  },
  {
    icon: Users,
    title: "Local Zoom Presenter",
    badge: "HOST",
    subtitle: "$100/month guaranteed",
    description: "Host weekly Zoom presentations in your local language. Build your community and earn a fixed monthly income. Minimum 40 real participants per session.",
    color: "#22D3EE",
    isHero: false,
  },
  {
    icon: Gift,
    title: "Onboarding Bonus",
    badge: "LIMITED",
    subtitle: "Limited time — 2 months",
    description: "Deposit $100+: earn $10. Deposit $500+: earn $30. Deposit $1,000+: earn $50. Deposit $5,000+: earn $200. First deposit only.",
    color: "#34D399",
    isHero: false,
  },
];

function HeroPromoCard({ promo }: { promo: typeof PROMO_CARDS[0] }) {
  const [hovered, setHovered] = useState(false);
  const Icon = promo.icon;

  return (
    <AnimatedSection>
      <div
        className="relative group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Animated border gradient */}
        <div
          className="absolute -inset-[1px] rounded-2xl transition-opacity duration-700"
          style={{
            background: `linear-gradient(135deg, ${promo.color}50, transparent 40%, transparent 60%, ${promo.color}30)`,
            opacity: hovered ? 0.8 : 0.4,
          }}
        />

        <div
          className="relative p-8 md:p-10 rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.7) 100%)", backdropFilter: "blur(20px)" }}
        >
          {/* Holographic shimmer overlay */}
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              background: `linear-gradient(135deg, ${promo.color}08, transparent 30%, ${promo.color}04, transparent 70%, ${promo.color}06)`,
              backgroundSize: "400% 400%",
              animation: "shimmer 8s ease infinite",
              opacity: hovered ? 1 : 0.3,
            }}
          />

          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${promo.color}60, transparent)` }}
          />

          {/* Corner glow */}
          <div className="absolute top-0 right-0 w-[250px] h-[250px] pointer-events-none"
            style={{ background: `radial-gradient(circle, ${promo.color}08, transparent 70%)` }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4"
                style={{ background: `${promo.color}15`, color: promo.color, border: `1px solid ${promo.color}25` }}
              >
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: promo.color }} />
                {promo.badge}
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{promo.title}</h3>
              <p className="text-lg font-medium mb-3" style={{ color: `${promo.color}cc` }}>{promo.subtitle}</p>
              <p className="text-slate-500 leading-relaxed max-w-xl">{promo.description}</p>
            </div>

            <div className="shrink-0">
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${promo.color}15, ${promo.color}05)`,
                  border: `1px solid ${promo.color}25`,
                  boxShadow: `0 0 40px ${promo.color}10`,
                }}
              >
                <Icon className="w-10 h-10 md:w-12 md:h-12" style={{ color: promo.color }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

function PromoCard({ promo, index }: { promo: typeof PROMO_CARDS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const Icon = promo.icon;

  return (
    <AnimatedSection delay={index * 0.12}>
      <div
        className="group relative p-6 rounded-xl h-full overflow-hidden transition-all duration-400"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          border: `1px solid ${hovered ? `${promo.color}30` : "rgba(255,255,255,0.85)"}`,
          backdropFilter: "blur(20px)",
          boxShadow: hovered ? `0 8px 40px ${promo.color}12, 0 4px 16px rgba(0,0,0,0.06)` : "0 4px 24px rgba(0,0,0,0.04)",
        }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px transition-opacity duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${promo.color}40, transparent)`,
            opacity: hovered ? 1 : 0,
          }}
        />

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider mb-4"
          style={{ background: `${promo.color}10`, color: promo.color }}
        >
          {promo.badge}
        </div>

        <div className="flex items-start gap-4 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${promo.color}10`, border: `1px solid ${promo.color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: promo.color }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-0.5">{promo.title}</h3>
            <p className="text-sm font-medium" style={{ color: `${promo.color}aa` }}>{promo.subtitle}</p>
          </div>
        </div>

        <p className="text-sm text-slate-500 leading-relaxed">{promo.description}</p>
      </div>
    </AnimatedSection>
  );
}

export default function PromotionsSection() {
  const featured = PROMO_CARDS[0];
  const rest = PROMO_CARDS.slice(1);

  return (
    <section id="promotions" className="section-spacing relative">
      <div className="container">
        <SectionHeading
          label="Active Programs"
          title="Earn While You Build"
          subtitle="Four ways to earn with Turbo Loop — beyond yield farming. Create, present, refer, and get rewarded."
        />

        {/* Featured: $100K Challenge */}
        <div className="max-w-4xl mx-auto mb-8">
          <HeroPromoCard promo={featured} />
        </div>

        {/* Other promotions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {rest.map((promo, i) => (
            <PromoCard key={promo.title} promo={promo} index={i} />
          ))}
        </div>

        <AnimatedSection delay={0.6}>
          <p className="text-center mt-10 text-sm text-slate-400">
            Promotional support backed by the Turbo Loop development team
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
