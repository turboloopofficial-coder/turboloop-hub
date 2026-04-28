// Compact 5-pillar teaser for the homepage. Replaces the full TrustSection
// (which now lives at /security). Inline-styled cards + the trust quote + CTA to /security.

import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, FileCheck, Shield, Lock, Eye, Link2 } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const PILLARS = [
  { icon: FileCheck, label: "Audited",   color: "#0891B2" },
  { icon: Shield,    label: "Renounced", color: "#10B981" },
  { icon: Lock,      label: "LP Locked", color: "#7C3AED" },
  { icon: Eye,       label: "Verified",  color: "#EC4899" },
  { icon: Link2,     label: "On-Chain",  color: "#F59E0B" },
];

export default function HomeSecurityTeaser() {
  return (
    <section className="section-spacing relative">
      <div className="container">
        <AnimatedSection>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-cyan-700/80">Security & Trust</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Trustless by Design.
            </h2>
            <p className="text-base md:text-lg text-slate-500 mt-4 leading-relaxed">
              Five pillars of security — every claim verifiable on BscScan from any computer in the world.
            </p>
          </div>
        </AnimatedSection>

        {/* Pillar row */}
        <div className="grid grid-cols-5 gap-3 md:gap-4 max-w-4xl mx-auto mb-10">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <AnimatedSection key={p.label} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="rounded-2xl p-3 md:p-5 text-center"
                  style={{
                    background: "white",
                    border: "1px solid rgba(15,23,42,0.06)",
                    boxShadow: "0 4px 14px -6px rgba(15,23,42,0.06)",
                  }}
                >
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)`,
                      boxShadow: `0 8px 18px -6px ${p.color}40`,
                    }}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="text-xs md:text-sm font-bold text-slate-900">{p.label}</div>
                </motion.div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* Quote */}
        <AnimatedSection delay={0.3}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl md:text-2xl font-light text-slate-700 leading-relaxed italic" style={{ fontFamily: "var(--font-heading)" }}>
              "Turbo Loop does not ask you to trust a team.{" "}
              <span
                className="font-semibold not-italic"
                style={{
                  background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                It asks you to verify the code.
              </span>
              "
            </p>
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection delay={0.4}>
          <div className="flex justify-center mt-10">
            <Link href="/security">
              <button
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                  color: "white",
                  boxShadow: "0 12px 30px -8px rgba(8,145,178,0.5)",
                }}
              >
                Verify everything yourself
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
