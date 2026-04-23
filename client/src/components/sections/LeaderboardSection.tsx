import { trpc } from "@/lib/trpc";
import { COUNTRY_DATA, getFlagUrl } from "@/lib/constants";
import { motion, useInView } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";

const MEDAL_COLORS = {
  gold: { bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)", text: "#B45309", glow: "0 0 20px rgba(251,191,36,0.1)" },
  silver: { bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.25)", text: "#64748B", glow: "0 0 20px rgba(148,163,184,0.08)" },
  bronze: { bg: "rgba(217,119,6,0.08)", border: "rgba(217,119,6,0.25)", text: "#92400E", glow: "0 0 20px rgba(217,119,6,0.08)" },
};

const BAR_GRADIENTS = [
  "linear-gradient(90deg, #FBBF24 0%, #F59E0B 60%, #EAB308 100%)",
  "linear-gradient(90deg, #94A3B8 0%, #64748B 100%)",
  "linear-gradient(90deg, #D97706 0%, #B45309 100%)",
  "linear-gradient(90deg, #22D3EE 0%, #06B6D4 100%)",
  "linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%)",
  "linear-gradient(90deg, #34D399 0%, #10B981 100%)",
];

/** Animated count-up number */
function CountUp({ target, duration = 1.5, delay = 0 }: { target: number; duration?: number; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  const animate = useCallback(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(animate, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, animate, delay]);

  return <span ref={ref}>{value}%</span>;
}

export default function LeaderboardSection() {
  const { data: leaderboard } = trpc.content.leaderboard.useQuery();

  const entries = leaderboard && leaderboard.length > 0
    ? leaderboard.map((e) => ({
        rank: e.rank,
        country: e.country,
        code: e.countryCode?.toLowerCase() || "un",
        description: e.description || "",
        score: e.score,
        medal: e.rank <= 3 ? (["gold", "silver", "bronze"][e.rank - 1] as "gold" | "silver" | "bronze") : ("none" as const),
      }))
    : COUNTRY_DATA;

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <section id="leaderboard" className="section-spacing relative">
      <div className="container">
        <SectionHeading
          label="Global Community"
          title="Where Is TurboLoop Growing Fastest?"
          subtitle="A truly global movement. Community builders across 6 continents are driving adoption."
        />

        {/* Podium — Top 3 */}
        <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto mb-12">
          {/* Reorder: 2nd, 1st, 3rd for visual podium */}
          {[top3[1], top3[0], top3[2]].map((entry, podiumIndex) => {
            if (!entry) return null;
            const isChampion = entry.rank === 1;
            const medalStyle = MEDAL_COLORS[entry.medal as keyof typeof MEDAL_COLORS];

            return (
              <AnimatedSection key={entry.rank} delay={podiumIndex * 0.15}>
                <div
                  className={`relative flex flex-col items-center text-center p-4 md:p-6 rounded-2xl ${isChampion ? "md:-mt-6" : ""}`}
                  style={{
                    background: medalStyle
                      ? `linear-gradient(180deg, ${medalStyle.bg} 0%, rgba(255,255,255,0.7) 100%)`
                      : "rgba(255,255,255,0.7)",
                    border: `1px solid ${medalStyle?.border || "rgba(255,255,255,0.85)"}`,
                    backdropFilter: "blur(20px)",
                    boxShadow: medalStyle?.glow || "none",
                  }}
                >
                  {/* Medal icon */}
                  <div className="mb-3">
                    {isChampion ? (
                      <Trophy className="w-8 h-8 md:w-10 md:h-10" style={{ color: medalStyle?.text }} />
                    ) : (
                      <Medal className="w-7 h-7 md:w-8 md:h-8" style={{ color: medalStyle?.text }} />
                    )}
                  </div>

                  {/* Flag */}
                  <img
                    src={getFlagUrl(entry.code, 80)}
                    alt={entry.country}
                    className="w-12 h-8 md:w-16 md:h-11 object-cover rounded shadow-lg mb-3"
                  />

                  {/* Rank */}
                  <span className="text-2xl md:text-3xl font-bold mb-1" style={{ color: medalStyle?.text || "#fff" }}>
                    #{entry.rank}
                  </span>

                  {/* Country */}
                  <h3 className="text-base md:text-lg font-bold text-slate-800 mb-1">{entry.country}</h3>
                  <p className="text-xs text-slate-500 hidden md:block">{entry.description}</p>

                  {/* Animated Score */}
                  <span className="text-xl md:text-2xl font-bold mt-2" style={{ color: medalStyle?.text || "#22D3EE" }}>
                    <CountUp target={entry.score} duration={1.8} delay={0.3 + podiumIndex * 0.15} />
                  </span>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* Remaining countries — bar chart style */}
        <div className="max-w-3xl mx-auto space-y-4">
          {rest.map((entry, index) => (
            <AnimatedSection key={entry.rank} delay={0.5 + index * 0.1}>
              <div
                className="relative flex items-center gap-4 md:gap-6 p-4 md:p-5 rounded-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(255,255,255,0.85)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                }}
              >
                {/* Rank */}
                <span className="text-xl font-bold text-slate-400 w-10 shrink-0">#{entry.rank}</span>

                {/* Flag */}
                <img
                  src={getFlagUrl(entry.code, 48)}
                  alt={entry.country}
                  className="w-10 h-7 object-cover rounded shadow shrink-0"
                />

                {/* Country + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-base font-bold text-slate-800">{entry.country}</span>
                      <span className="text-xs text-slate-500 ml-2 hidden md:inline">{entry.description}</span>
                    </div>
                    <span className="text-lg font-bold text-cyan-600">
                      <CountUp target={entry.score} duration={1.5} delay={0.6 + index * 0.1} />
                    </span>
                  </div>
                  {/* Thick animated bar */}
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.05)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${entry.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full relative"
                      style={{ background: BAR_GRADIENTS[entry.rank - 1] || BAR_GRADIENTS[3] }}
                    >
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 3s infinite",
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* CTA line */}
        <AnimatedSection delay={0.8}>
          <p className="text-center mt-14 text-xl md:text-2xl font-bold">
            <span
              style={{
                background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              The World Is Joining. Are You?
            </span>
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
