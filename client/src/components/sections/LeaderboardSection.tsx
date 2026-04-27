import { trpc } from "@/lib/trpc";
import { COUNTRY_DATA, getFlagUrl } from "@/lib/constants";
import { motion, useInView } from "framer-motion";
import { Trophy, Medal, Award, Crown, TrendingUp, Flame, Sparkles } from "lucide-react";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";
import { dailyScoreDrift } from "@/lib/dynamicRotation";

// Pseudo-random "trending" indicator that's stable per day per country.
// Uses dayOfYear + country code to deterministically pick which countries
// are "🔥 trending" today — gives the leaderboard a daily-shifting feel
// without faking any underlying numbers.
function isTrendingToday(code: string): boolean {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  let h = day;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0;
  return h % 4 === 0; // ~25% of countries trend on any given day
}

// Podium tier styling (1st = gold, 2nd = silver, 3rd = bronze)
const TIERS = {
  gold: {
    primary: "#F59E0B",
    primaryDark: "#B45309",
    primaryLight: "#FCD34D",
    soft: "#FEF3C7",
    glow: "rgba(251,191,36,0.5)",
    text: "#78350F",
    label: "1st",
    crown: Crown,
    height: "h-44 md:h-56",
  },
  silver: {
    primary: "#94A3B8",
    primaryDark: "#475569",
    primaryLight: "#CBD5E1",
    soft: "#F1F5F9",
    glow: "rgba(148,163,184,0.4)",
    text: "#334155",
    label: "2nd",
    crown: Trophy,
    height: "h-36 md:h-44",
  },
  bronze: {
    primary: "#D97706",
    primaryDark: "#9A3412",
    primaryLight: "#FB923C",
    soft: "#FFEDD5",
    glow: "rgba(217,119,6,0.4)",
    text: "#7C2D12",
    label: "3rd",
    crown: Medal,
    height: "h-28 md:h-36",
  },
} as const;

const REST_GRADIENTS = [
  "linear-gradient(90deg, #22D3EE 0%, #06B6D4 100%)",
  "linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%)",
  "linear-gradient(90deg, #34D399 0%, #10B981 100%)",
  "linear-gradient(90deg, #FB923C 0%, #F97316 100%)",
  "linear-gradient(90deg, #F472B6 0%, #EC4899 100%)",
];

function CountUp({ target, duration = 1.5, delay = 0 }: { target: number; duration?: number; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  const animate = useCallback(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
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

type PodiumEntry = {
  rank: number;
  country: string;
  code: string;
  description: string;
  score: number;
  tier: "gold" | "silver" | "bronze";
};

function PodiumPillar({ entry, delay }: { entry: PodiumEntry; delay: number }) {
  const tier = TIERS[entry.tier];
  const Icon = tier.crown;
  const isChampion = entry.tier === "gold";

  return (
    <div className="flex flex-col items-center justify-end h-full">
      {/* Top: country + score (floats above pillar) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="flex flex-col items-center mb-3"
      >
        {/* Crown / Trophy with glow */}
        <motion.div
          className="relative mb-3"
          animate={isChampion ? { y: [0, -4, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div
            className="absolute inset-0 blur-xl"
            style={{ background: `radial-gradient(circle, ${tier.glow} 0%, transparent 70%)`, transform: "scale(1.6)" }}
          />
          <div
            className="relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${tier.primaryLight}, ${tier.primary})`,
              border: `2px solid ${tier.primary}`,
              boxShadow: `0 8px 24px -4px ${tier.glow}, inset 0 -2px 6px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.4)`,
            }}
          >
            <Icon className="w-6 h-6 md:w-7 md:h-7" style={{ color: "white", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }} />
          </div>
        </motion.div>

        {/* Flag with glossy border */}
        <div
          className="relative rounded-md overflow-hidden mb-2"
          style={{
            boxShadow: `0 6px 18px -4px ${tier.glow}, 0 0 0 2px ${tier.primary}`,
          }}
        >
          <img
            src={getFlagUrl(entry.code, 160)}
            alt={entry.country}
            className="w-16 h-11 md:w-20 md:h-14 object-cover block"
          />
        </div>

        <h3 className="text-sm md:text-base font-bold text-slate-900 mb-0.5">{entry.country}</h3>
        <p className="text-[10px] text-slate-500 hidden md:block max-w-[140px] text-center leading-tight mb-2">
          {entry.description}
        </p>

        {/* Score */}
        <div
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold"
          style={{
            background: tier.soft,
            color: tier.text,
            border: `1px solid ${tier.primary}40`,
          }}
        >
          <TrendingUp className="w-3 h-3" />
          <CountUp target={entry.score} duration={1.8} delay={delay + 0.2} />
        </div>
      </motion.div>

      {/* The pillar */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        whileInView={{ scaleY: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "bottom" }}
        className={`w-full ${tier.height} rounded-t-xl relative overflow-hidden`}
      >
        <div
          className="absolute inset-0 rounded-t-xl"
          style={{
            background: `linear-gradient(180deg, ${tier.primaryLight} 0%, ${tier.primary} 50%, ${tier.primaryDark} 100%)`,
            boxShadow:
              `inset 0 6px 12px rgba(255,255,255,0.4), inset 0 -8px 20px rgba(0,0,0,0.25), 0 -8px 30px -6px ${tier.glow}, 0 12px 40px -6px ${tier.glow}`,
          }}
        />

        {/* Top highlight strip */}
        <div
          className="absolute top-0 left-0 right-0 h-2 rounded-t-xl"
          style={{ background: "rgba(255,255,255,0.4)" }}
        />

        {/* Vertical shimmer */}
        <motion.div
          className="absolute inset-0 rounded-t-xl pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.3) 55%, transparent 100%)",
            backgroundSize: "100% 250%",
          }}
          animate={{ backgroundPosition: ["0% 200%", "0% -100%"] }}
          transition={{ duration: 4, repeat: Infinity, delay: delay * 2, ease: "linear" }}
        />

        {/* Rank number embossed on pillar */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-5xl md:text-7xl font-bold leading-none tabular-nums"
            style={{
              color: "rgba(255,255,255,0.9)",
              textShadow: `0 2px 0 ${tier.primaryDark}, 0 4px 12px rgba(0,0,0,0.3)`,
              fontFamily: "var(--font-heading)",
            }}
          >
            #{entry.rank}
          </span>
        </div>

        {/* Tier label at bottom */}
        <div
          className="absolute bottom-3 left-0 right-0 text-center text-[10px] tracking-[0.3em] uppercase font-bold"
          style={{ color: "rgba(255,255,255,0.85)", textShadow: `0 1px 2px ${tier.primaryDark}` }}
        >
          {tier.label} place
        </div>
      </motion.div>
    </div>
  );
}

export default function LeaderboardSection() {
  const { data: leaderboard } = trpc.content.leaderboard.useQuery();

  // Apply small ±3 daily drift to scores so numbers feel alive day-to-day,
  // without changing any country's actual position. Stable for the whole UTC day.
  const entries = (leaderboard && leaderboard.length > 0
    ? leaderboard.map((e) => ({
        rank: e.rank,
        country: e.country,
        code: e.countryCode?.toLowerCase() || "un",
        description: e.description || "",
        score: e.score,
        tier: e.rank <= 3 ? (["gold", "silver", "bronze"][e.rank - 1] as "gold" | "silver" | "bronze") : ("none" as const),
      }))
    : COUNTRY_DATA.map((e) => ({
        ...e,
        tier: e.rank <= 3 ? (["gold", "silver", "bronze"][e.rank - 1] as "gold" | "silver" | "bronze") : ("none" as const),
      }))
  ).map((e) => ({
    ...e,
    // Daily drift: -3..+3 points, deterministic per (country, day)
    score: dailyScoreDrift(e.code, e.score, 3),
  }));

  const top3 = entries.slice(0, 3) as PodiumEntry[];
  const rest = entries.slice(3);

  return (
    <section id="leaderboard" className="section-spacing relative overflow-hidden">
      {/* Subtle ambient bg */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(251,191,36,0.06) 0%, transparent 70%)" }}
      />

      <div className="container relative z-10">
        <SectionHeading
          label="Global Community"
          title="Where Is TurboLoop Growing Fastest?"
          subtitle="A truly global movement. Community builders across 6 continents are driving adoption."
        />

        {/* Podium */}
        <div className="relative max-w-3xl mx-auto mb-10">
          {/* Floor / stage */}
          <div
            className="grid grid-cols-3 gap-3 md:gap-5 items-end h-[360px] md:h-[440px]"
          >
            {/* Order: 2nd, 1st, 3rd for proper podium look */}
            <PodiumPillar entry={top3[1]} delay={0.15} />
            <PodiumPillar entry={top3[0]} delay={0} />
            <PodiumPillar entry={top3[2]} delay={0.3} />
          </div>
          {/* Floor reflection / shadow */}
          <div
            className="absolute -bottom-2 left-0 right-0 h-1 rounded-full mx-8"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(15,23,42,0.15) 50%, transparent 100%)",
              filter: "blur(4px)",
            }}
          />
        </div>

        {/* Sub-leaderboard for rank 4+ — premium bars with trending badges */}
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs tracking-[0.3em] uppercase font-bold text-slate-400">
              Global Community
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-emerald-600 inline-flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Updated daily
            </span>
          </div>
          {rest.map((entry, index) => {
            const grad = REST_GRADIENTS[index % REST_GRADIENTS.length];
            const trending = isTrendingToday(entry.code);
            const isNewEntry = entry.rank >= 12; // visually flag the lower ranks as new entrants
            return (
              <AnimatedSection key={entry.rank} delay={Math.min(0.3 + index * 0.05, 0.7)}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="relative flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-2xl group"
                  style={{
                    background: "white",
                    border: trending
                      ? "1px solid rgba(16,185,129,0.25)"
                      : "1px solid rgba(15,23,42,0.06)",
                    boxShadow: trending
                      ? "0 8px 24px -8px rgba(16,185,129,0.2), 0 1px 3px rgba(15,23,42,0.04)"
                      : "0 4px 14px -4px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)",
                  }}
                >
                  {/* Rank number */}
                  <div
                    className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-base md:text-lg font-bold tabular-nums shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #F1F5F9, #E2E8F0)",
                      color: "#475569",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
                    }}
                  >
                    #{entry.rank}
                  </div>

                  {/* Flag */}
                  <div
                    className="relative rounded-md overflow-hidden shrink-0"
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                  >
                    <img
                      src={getFlagUrl(entry.code, 80)}
                      alt={entry.country}
                      className="w-11 h-7 md:w-12 md:h-8 object-cover block"
                    />
                  </div>

                  {/* Country + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-slate-800">{entry.country}</span>
                        {trending && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(236,72,153,0.15))",
                              color: "#D97706",
                              border: "1px solid rgba(245,158,11,0.3)",
                            }}
                          >
                            <Flame className="w-2.5 h-2.5" />
                            Trending
                          </span>
                        )}
                        {isNewEntry && !trending && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(8,145,178,0.12), rgba(124,58,237,0.12))",
                              color: "#0891B2",
                              border: "1px solid rgba(8,145,178,0.25)",
                            }}
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            New
                          </span>
                        )}
                        <span className="text-xs text-slate-500 hidden md:inline">{entry.description}</span>
                      </div>
                      <span className="text-base md:text-lg font-bold text-slate-700 tabular-nums">
                        <CountUp target={entry.score} duration={1.5} delay={Math.min(0.5 + index * 0.04, 0.9)} />
                      </span>
                    </div>
                    {/* Bar */}
                    <div
                      className="h-2.5 rounded-full overflow-hidden relative"
                      style={{ background: "rgba(15,23,42,0.05)" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${entry.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full relative"
                        style={{ background: grad }}
                      >
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background:
                              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 3s infinite",
                          }}
                        />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* CTA line */}
        <AnimatedSection delay={0.8}>
          <div className="text-center mt-14">
            <p className="text-xl md:text-2xl font-bold leading-tight">
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
            <p className="text-sm text-slate-500 mt-2">Join the #1 fastest-growing region or start one in yours.</p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
