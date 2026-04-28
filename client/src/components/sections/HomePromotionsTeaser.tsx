// Compact promotions teaser — $100K Bounty as headline + 3 small program cards.
// Replaces the full PromotionsSection on the homepage; full version lives at /promotions later.

import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Star, Mic, Gift } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const SMALL_CARDS = [
  {
    icon: Star,
    label: "Content Creator Star",
    blurb: "Get paid for views: 1K–5K → $10 · 100K+ → $100",
    color: "#F59E0B",
    href: "/promotions",
  },
  {
    icon: Mic,
    label: "Local Zoom Presenter",
    blurb: "$100/month for hosting weekly sessions in your language",
    color: "#7C3AED",
    href: "/promotions",
  },
  {
    icon: Gift,
    label: "Onboarding Bonus",
    blurb: "First deposit only: $100 → $10 · $5,000 → $200",
    color: "#10B981",
    href: "/promotions",
  },
];

export default function HomePromotionsTeaser() {
  return (
    <section id="promotions" className="section-spacing relative">
      <div className="container">
        <AnimatedSection>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-cyan-700/80">Active Programs</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Earn while you build.
            </h2>
            <p className="text-base md:text-lg text-slate-500 mt-4 leading-relaxed">
              Four ways to earn — beyond yield farming. Create, present, refer, get rewarded.
            </p>
          </div>
        </AnimatedSection>

        {/* The $100K hero card */}
        <AnimatedSection delay={0.05}>
          <div
            className="relative rounded-3xl overflow-hidden p-8 md:p-12 mb-6 max-w-5xl mx-auto"
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
              boxShadow: "0 30px 60px -20px rgba(15,23,42,0.4)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-50"
              style={{ background: "radial-gradient(ellipse at top right, rgba(245,158,11,0.25), transparent 60%)" }}
            />
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(236,72,153,0.2))",
                    border: "1px solid rgba(245,158,11,0.4)",
                  }}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-300">Open Bug Bounty</span>
                </div>
                <h3 className="text-5xl md:text-7xl font-bold text-white leading-none mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                  $100,000
                </h3>
                <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-2">
                  Smart Contract Challenge
                </p>
                <p className="text-sm md:text-base text-white/60 leading-relaxed max-w-md">
                  Find any centralization in the contract. Submit on-chain proof. Get paid in USDT. Verifiable on-chain. Audited by independents.
                </p>
              </div>
              <Link href="/promotions">
                <button
                  className="group inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #EC4899)",
                    color: "white",
                    boxShadow: "0 12px 32px -8px rgba(245,158,11,0.6)",
                  }}
                >
                  Submit a Vulnerability
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </AnimatedSection>

        {/* 3 smaller cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {SMALL_CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <AnimatedSection key={c.label} delay={0.15 + i * 0.05}>
                <Link href={c.href}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="group cursor-pointer rounded-2xl p-6 h-full"
                    style={{
                      background: "white",
                      border: "1px solid rgba(15,23,42,0.06)",
                      boxShadow: "0 4px 14px -6px rgba(15,23,42,0.06)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${c.color}25`;
                      e.currentTarget.style.boxShadow = `0 16px 30px -10px ${c.color}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(15,23,42,0.06)";
                      e.currentTarget.style.boxShadow = "0 4px 14px -6px rgba(15,23,42,0.06)";
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        background: `linear-gradient(135deg, ${c.color}, ${c.color}cc)`,
                        boxShadow: `0 8px 18px -6px ${c.color}40`,
                      }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: "var(--font-heading)" }}>{c.label}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed mb-3">{c.blurb}</p>
                    <div className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: c.color }}>
                      Learn more <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>

        <AnimatedSection delay={0.4}>
          <div className="flex justify-center mt-10">
            <Link href="/promotions">
              <button
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105"
                style={{
                  background: "white",
                  color: "#0F172A",
                  border: "1px solid rgba(15,23,42,0.08)",
                  boxShadow: "0 6px 16px -4px rgba(15,23,42,0.08)",
                }}
              >
                See all 4 programs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
