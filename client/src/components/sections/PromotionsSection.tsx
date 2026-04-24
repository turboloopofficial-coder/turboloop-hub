import { motion } from "framer-motion";
import { Shield, Video, Users, Gift, Trophy, ArrowRight, Sparkles, Lock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";

const PROMO_CARDS = [
  {
    icon: Shield,
    title: "$100K Smart Contract Challenge",
    badge: "Bug Bounty",
    subtitle: "Find a vulnerability. Win $100,000.",
    description:
      "Open challenge to anyone who can prove centralization in the Turbo Loop smart contract. Identify any owner-controlled function, submit verifiable on-chain evidence, and claim $100,000 USDT if validated by independent auditors.",
    color: "#F59E0B",
    accentColor: "#D97706",
    proof: ["Verifiable on-chain", "Audited by independents", "Paid in USDT"],
  },
  {
    icon: Video,
    title: "Content Creator Star",
    badge: "Earn Per View",
    subtitle: "Get paid for every view",
    description:
      "Create content about Turbo Loop and earn based on your reach. 1K–5K views: $10. 5K–20K: $25. 20K–100K: $50. 100K+: $100. No minimum followers required.",
    color: "#A855F7",
    accentColor: "#7C3AED",
    proof: ["No follower minimum", "Pay per milestone", "Multiple platforms"],
  },
  {
    icon: Users,
    title: "Local Zoom Presenter",
    badge: "Monthly",
    subtitle: "$100/month guaranteed",
    description:
      "Host weekly Zoom presentations in your local language. Build your community and earn a fixed monthly income. Minimum 40 real participants per session.",
    color: "#0891B2",
    accentColor: "#0E7490",
    proof: ["Fixed monthly income", "Your local language", "Build your community"],
  },
  {
    icon: Gift,
    title: "Onboarding Bonus",
    badge: "Limited Time",
    subtitle: "First deposit only",
    description:
      "Deposit $100+: earn $10. Deposit $500+: earn $30. Deposit $1,000+: earn $50. Deposit $5,000+: earn $200. First deposit only.",
    color: "#10B981",
    accentColor: "#059669",
    proof: ["Tier-based rewards", "First deposit only", "Auto-credited"],
  },
];

function HeroBountyCard({ promo }: { promo: typeof PROMO_CARDS[0] }) {
  const Icon = promo.icon;

  return (
    <AnimatedSection>
      <div className="relative group">
        {/* Outer glow halo */}
        <motion.div
          className="absolute -inset-2 rounded-[28px] opacity-50 group-hover:opacity-80 transition-opacity duration-700 blur-xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${promo.color}30, ${promo.accentColor}50, ${promo.color}30)`,
            backgroundSize: "200% 200%",
          }}
          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div
          className="relative rounded-[24px] overflow-hidden p-8 md:p-12"
          style={{
            background:
              "linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #1E293B 100%)",
            border: `1.5px solid ${promo.color}40`,
            boxShadow:
              `0 30px 80px -20px ${promo.color}30, inset 0 0 80px rgba(245,158,11,0.04)`,
          }}
        >
          {/* Animated shimmer band */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                `linear-gradient(115deg, transparent 30%, ${promo.color}15 45%, transparent 60%)`,
              backgroundSize: "200% 200%",
            }}
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(245,158,11,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.06) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Corner glow */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${promo.color}25 0%, transparent 60%)` }}
          />

          <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
            {/* Left side: title + content */}
            <div className="md:col-span-7">
              {/* Bounty badge */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{
                    background: `${promo.color}18`,
                    border: `1px solid ${promo.color}40`,
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: promo.color }}
                  />
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: promo.color }}>
                    {promo.badge} · Active
                  </span>
                </div>
                <Trophy className="w-4 h-4" style={{ color: promo.color }} />
              </div>

              {/* Big number */}
              <div className="mb-3">
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-6xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tight tabular-nums"
                    style={{
                      background: `linear-gradient(135deg, ${promo.color}, ${promo.accentColor})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: `drop-shadow(0 4px 24px ${promo.color}50)`,
                    }}
                  >
                    $100K
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white/95 mt-1 leading-tight">
                  Smart Contract Challenge
                </h3>
              </div>

              <p className="text-base text-white/65 leading-relaxed mb-6 max-w-xl">
                {promo.description}
              </p>

              {/* Proof points */}
              <div className="flex flex-wrap gap-2 mb-6">
                {promo.proof.map((p) => (
                  <div
                    key={p}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3" style={{ color: promo.color }} />
                    <span className="text-[11px] font-semibold text-white/70">{p}</span>
                  </div>
                ))}
              </div>

              <motion.a
                href="https://t.me/TurboLoop_Official"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group/btn inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold transition-all"
                style={{
                  background: `linear-gradient(135deg, ${promo.color}, ${promo.accentColor})`,
                  color: "white",
                  boxShadow: `0 12px 32px -8px ${promo.color}80, inset 0 1px 0 rgba(255,255,255,0.2)`,
                }}
              >
                Submit Vulnerability Proof
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </motion.a>
            </div>

            {/* Right side: visual element */}
            <div className="md:col-span-5 relative h-full min-h-[200px] flex items-center justify-center">
              {/* Massive icon with rotating ring */}
              <div className="relative">
                {/* Outer rotating ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    width: 200,
                    height: 200,
                    border: `2px dashed ${promo.color}40`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                />
                {/* Inner reverse ring */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    inset: 16,
                    width: 168,
                    height: 168,
                    border: `1.5px dashed ${promo.color}30`,
                  }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                />
                {/* Glowing core */}
                <div
                  className="relative flex items-center justify-center rounded-full"
                  style={{
                    width: 200,
                    height: 200,
                    background: `radial-gradient(circle, ${promo.color}25 0%, transparent 70%)`,
                  }}
                >
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${promo.color}30, ${promo.accentColor}30)`,
                      border: `1.5px solid ${promo.color}60`,
                      boxShadow: `0 0 60px ${promo.color}50, inset 0 0 30px ${promo.color}20`,
                    }}
                  >
                    <Icon className="w-14 h-14" style={{ color: promo.color }} />
                  </div>
                </div>
                {/* Orbit dots */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full top-1/2 left-1/2 w-2 h-2"
                    style={{
                      background: promo.color,
                      boxShadow: `0 0 8px ${promo.color}`,
                    }}
                    animate={{
                      x: Array.from({ length: 13 }, (_, k) => Math.cos((k * 30 + i * 90) * Math.PI / 180) * 100 - 4),
                      y: Array.from({ length: 13 }, (_, k) => Math.sin((k * 30 + i * 90) * Math.PI / 180) * 100 - 4),
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                ))}
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
    <AnimatedSection delay={index * 0.1}>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="group relative h-full rounded-2xl overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)",
          border: `1px solid ${promo.color}25`,
          boxShadow: hovered
            ? `0 20px 50px -12px ${promo.color}30, 0 8px 20px -4px rgba(0,0,0,0.08)`
            : `0 6px 20px -6px ${promo.color}15, 0 2px 8px -2px rgba(0,0,0,0.04)`,
          transition: "border-color 0.4s, box-shadow 0.4s",
        }}
      >
        {/* Top accent gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, transparent, ${promo.color}, transparent)`,
          }}
        />
        {/* Corner glow */}
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${promo.color}20 0%, transparent 70%)`,
            opacity: hovered ? 1 : 0.5,
          }}
        />

        <div className="relative p-7">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
              style={{
                background: `linear-gradient(135deg, ${promo.color}18, ${promo.color}08)`,
                border: `1px solid ${promo.color}30`,
              }}
            >
              <Icon className="w-5 h-5" style={{ color: promo.color }} />
            </div>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: `${promo.color}10`,
                border: `1px solid ${promo.color}25`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: promo.color }} />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: promo.accentColor }}>
                {promo.badge}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{promo.title}</h3>
          <p className="text-sm font-semibold mb-3" style={{ color: promo.color }}>
            {promo.subtitle}
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">{promo.description}</p>

          {/* Proof points */}
          <div className="space-y-1.5 pt-4 border-t border-slate-100">
            {promo.proof.map((p) => (
              <div key={p} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: promo.color }} />
                <span className="text-xs text-slate-600 font-medium">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatedSection>
  );
}

export default function PromotionsSection() {
  const [featured, ...rest] = PROMO_CARDS;

  return (
    <section id="promotions" className="section-spacing relative overflow-hidden">
      {/* Subtle bg accent */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 60%)" }}
      />

      <div className="container relative z-10">
        <SectionHeading
          label="Active Programs"
          title="Earn While You Build"
          subtitle="Four ways to earn with Turbo Loop — beyond yield farming. Create, present, refer, and get rewarded."
        />

        {/* Hero $100K Challenge — dark dramatic card */}
        <div className="max-w-5xl mx-auto mb-10">
          <HeroBountyCard promo={featured} />
        </div>

        {/* 3 supporting promotions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {rest.map((promo, i) => (
            <PromoCard key={promo.title} promo={promo} index={i} />
          ))}
        </div>

        <AnimatedSection delay={0.5}>
          <div className="text-center mt-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(15,23,42,0.06)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs text-slate-600 font-medium">Promotional support backed by the Turbo Loop development team</span>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
