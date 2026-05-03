// Compact 4-stat row that lives on the homepage. Replaces the full LeaderboardSection
// (which now lives at /community). Render the target value directly — the previous
// count-up animation initialized state at 0 and caused a "0 / 0+ / 0 / $0K" flash on
// first paint before the animation kicked in.

import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Globe2, Users, Languages, Trophy } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

function StatValue({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <span className="tabular-nums">
      {prefix}
      {target}
      {suffix}
    </span>
  );
}

// Differentiated from the Hero stats (Languages / Videos+Reels / Continents / $100K).
// Hero shows live signals; this section shows breadth + depth of the project.
const STATS = [
  {
    icon: Globe2,
    label: "Countries",
    target: 21,
    suffix: "+",
    color: "#0891B2",
  },
  { icon: Languages, label: "Films", target: 20, suffix: "", color: "#7C3AED" },
  { icon: Users, label: "Articles", target: 13, suffix: "+", color: "#EC4899" },
  {
    icon: Trophy,
    label: "Bug Bounty",
    target: 100,
    suffix: "K",
    prefix: "$",
    color: "#F59E0B",
  },
];

export default function HomeNumbersTeaser() {
  return (
    <section className="section-spacing relative">
      <div className="container">
        <AnimatedSection>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-cyan-700/80">
              By the Numbers
            </span>
            <h2
              className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              A truly global movement.
            </h2>
            <p className="text-base md:text-lg text-slate-500 mt-4 leading-relaxed">
              Built by a community across six continents, growing every day.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 max-w-5xl mx-auto">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <AnimatedSection key={s.label} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="group relative rounded-2xl p-6 md:p-7 h-full overflow-hidden"
                  style={{
                    background: "white",
                    border: "1px solid rgba(15,23,42,0.06)",
                    boxShadow: "0 6px 18px -8px rgba(15,23,42,0.06)",
                  }}
                >
                  <div
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${s.color}15, transparent 70%)`,
                      filter: "blur(24px)",
                    }}
                  />
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`,
                      boxShadow: `0 8px 18px -6px ${s.color}50`,
                    }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div
                    className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-none"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    <StatValue
                      target={s.target}
                      suffix={s.suffix}
                      prefix={s.prefix}
                    />
                  </div>
                  <div className="text-xs font-bold tracking-[0.18em] uppercase text-slate-500 mt-2">
                    {s.label}
                  </div>
                </motion.div>
              </AnimatedSection>
            );
          })}
        </div>

        <AnimatedSection delay={0.3}>
          <div className="flex justify-center mt-10">
            <Link href="/community">
              <button
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105"
                style={{
                  background: "white",
                  color: "#0F172A",
                  border: "1px solid rgba(15,23,42,0.08)",
                  boxShadow: "0 6px 16px -4px rgba(15,23,42,0.08)",
                }}
              >
                See the global community
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
