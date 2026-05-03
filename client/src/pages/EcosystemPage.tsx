// /ecosystem — overview hub for the 6 pillars + Revenue Flywheel.
// Each pillar card links to its own sub-page (/ecosystem/turbo-buy, etc.)

import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CreditCard,
  ArrowLeftRight,
  TrendingUp,
  Users,
  Award,
  Shield,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import AnimatedSection from "@/components/AnimatedSection";
import FlywheelSection from "@/components/sections/FlywheelSection";
import { ECOSYSTEM_PILLARS } from "@/lib/ecosystemPillars";

const ICON_MAP = {
  buy: CreditCard,
  swap: ArrowLeftRight,
  yield: TrendingUp,
  users: Users,
  award: Award,
  shield: Shield,
};

export default function EcosystemPage() {
  return (
    <PageShell
      title="Ecosystem"
      description="Six DeFi pillars, one self-sustaining engine. Turbo Buy, Turbo Swap, Yield, Referrals, Leadership, Security."
      path="/ecosystem"
      hero={{
        label: "The Complete Ecosystem",
        heading: "Six pillars. One engine.",
        subtitle:
          "Every part of Turbo Loop reinforces every other part. Activity in one corner pays yield in another. Click any pillar to go deeper.",
        palette: ["#0891B2", "#22D3EE", "#7C3AED"],
        emoji: "⚙",
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Ecosystem — Turbo Loop",
        url: "https://turboloop.tech/ecosystem",
        description: "The 6 pillars of Turbo Loop's DeFi ecosystem.",
      }}
      related={[
        {
          label: "Security",
          href: "/security",
          emoji: "🛡",
          description: "How the foundation is locked down",
        },
        {
          label: "Editorial",
          href: "/feed",
          emoji: "📖",
          description: "Deep-dives on every pillar",
        },
        {
          label: "Roadmap",
          href: "/roadmap",
          emoji: "🚀",
          description: "What's next for the ecosystem",
        },
      ]}
    >
      {/* The 6 pillar cards */}
      <section className="container pb-16">
        <AnimatedSection>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-cyan-700/80">
              The Six Pillars
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-slate-900 mt-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Each one stands alone. Together, they compound.
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {ECOSYSTEM_PILLARS.map((p, i) => {
            const Icon = ICON_MAP[p.icon];
            return (
              <AnimatedSection key={p.slug} delay={i * 0.04}>
                <Link href={`/ecosystem/${p.slug}`}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="group cursor-pointer rounded-2xl overflow-hidden h-full flex flex-col"
                    style={{
                      background: "white",
                      border: "1px solid rgba(15,23,42,0.06)",
                      boxShadow: "0 6px 18px -8px rgba(15,23,42,0.06)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = `${p.palette.from}30`;
                      e.currentTarget.style.boxShadow = `0 20px 40px -12px ${p.palette.from}30`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "rgba(15,23,42,0.06)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 18px -8px rgba(15,23,42,0.06)";
                    }}
                  >
                    {/* Gradient header strip with emoji */}
                    <div
                      className="relative h-32 flex items-center justify-center overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${p.palette.from}, ${p.palette.via}, ${p.palette.to})`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "5rem",
                          filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.25))",
                        }}
                      >
                        {p.emoji}
                      </span>
                      <div
                        className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-bold tracking-[0.2em] uppercase"
                        style={{
                          background: "rgba(255,255,255,0.95)",
                          color: p.palette.from,
                        }}
                      >
                        <Icon className="w-3 h-3" />
                        {p.subtitle}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3
                        className="text-xl font-bold text-slate-900 mb-2"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {p.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4 flex-1">
                        {p.tagline}
                      </p>
                      <div
                        className="inline-flex items-center gap-1.5 text-sm font-bold transition-all"
                        style={{ color: p.palette.from }}
                      >
                        Deep dive
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      </section>

      {/* Revenue Flywheel — visualizes how the pillars connect */}
      <FlywheelSection />
    </PageShell>
  );
}
