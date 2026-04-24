import { ROADMAP_DATA } from "@/lib/constants";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, Zap, Sparkles } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";

type Phase = {
  phase: number;
  title: string;
  status: "completed" | "current" | "upcoming";
  description: string | null;
};

function PhaseCard({ phase, index, total }: { phase: Phase; index: number; total: number }) {
  const isCompleted = phase.status === "completed";
  const isCurrent = phase.status === "current";

  // Color tokens
  const accent = isCurrent ? "#0891B2" : isCompleted ? "#10B981" : "#94A3B8";
  const bg = isCurrent
    ? "linear-gradient(135deg, #ffffff 0%, #f0fdff 100%)"
    : isCompleted
    ? "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)"
    : "rgba(255,255,255,0.7)";

  return (
    <AnimatedSection delay={Math.min(index * 0.06, 0.4)}>
      <div className="relative flex flex-col items-center">
        {/* WE ARE HERE marker */}
        {isCurrent && (
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-12 z-30"
          >
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #0891B2, #0E7490)",
                color: "white",
                boxShadow: "0 6px 20px -4px rgba(8,145,178,0.5)",
              }}
            >
              <Sparkles className="w-3 h-3" /> WE ARE HERE
            </div>
            {/* Arrow pointing down */}
            <div className="flex justify-center mt-0.5">
              <div className="w-2 h-2 rotate-45" style={{ background: "#0E7490" }} />
            </div>
          </motion.div>
        )}

        {/* Node circle */}
        <div className="relative z-10">
          {/* Radar pings for current */}
          {isCurrent && (
            <>
              <motion.div
                animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full"
                style={{ background: `radial-gradient(circle, ${accent}50 0%, transparent 65%)` }}
              />
              <motion.div
                animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 1.2 }}
                className="absolute inset-0 rounded-full"
                style={{ background: `radial-gradient(circle, ${accent}40 0%, transparent 65%)` }}
              />
            </>
          )}

          <motion.div
            whileHover={{ scale: 1.08 }}
            className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white font-bold tabular-nums"
            style={{
              background: isCurrent
                ? `linear-gradient(135deg, ${accent}, #0E7490)`
                : isCompleted
                ? `linear-gradient(135deg, #10B981, #059669)`
                : "linear-gradient(135deg, #E2E8F0, #CBD5E1)",
              boxShadow: isCurrent
                ? `0 12px 30px -6px ${accent}80, inset 0 -2px 6px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)`
                : isCompleted
                ? `0 8px 20px -4px rgba(16,185,129,0.5), inset 0 -2px 6px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.3)`
                : `0 4px 12px -2px rgba(15,23,42,0.08), inset 0 -1px 3px rgba(0,0,0,0.05)`,
              color: isCompleted || isCurrent ? "white" : "#94A3B8",
            }}
          >
            <span className="text-sm md:text-base font-bold relative z-10">{phase.phase}</span>
            {/* Status icon top-right */}
            {isCurrent && (
              <div
                className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center"
                style={{
                  background: "white",
                  boxShadow: `0 2px 6px ${accent}50, 0 0 0 2px ${accent}`,
                }}
              >
                <Zap className="w-3 h-3" style={{ color: accent }} />
              </div>
            )}
            {isCompleted && (
              <div
                className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center"
                style={{
                  background: "white",
                  boxShadow: "0 2px 6px rgba(16,185,129,0.5), 0 0 0 2px #10B981",
                }}
              >
                <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-500" />
              </div>
            )}
            {!isCompleted && !isCurrent && (
              <div
                className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center"
                style={{
                  background: "white",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05), 0 0 0 1px rgba(15,23,42,0.08)",
                }}
              >
                <Lock className="w-3 h-3 text-slate-400" />
              </div>
            )}
          </motion.div>
        </div>

        {/* Phase info card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="mt-5 w-full max-w-[120px] text-center px-2 py-2 rounded-lg cursor-default"
          style={{
            background: bg,
            border: `1px solid ${accent}${isCurrent ? "30" : isCompleted ? "20" : "10"}`,
            boxShadow: isCurrent ? `0 4px 12px -2px ${accent}25` : "none",
          }}
        >
          <div className="text-[9px] font-bold tracking-[0.2em] uppercase mb-0.5" style={{ color: accent }}>
            Phase {phase.phase}
          </div>
          <div className="text-[11px] leading-tight font-semibold" style={{ color: isCompleted || isCurrent ? "#1E293B" : "#94A3B8" }}>
            {phase.title}
          </div>
        </motion.div>
      </div>
    </AnimatedSection>
  );
}

export default function RoadmapSection() {
  const { data: dbPhases } = trpc.content.roadmap.useQuery();
  const phases: Phase[] = dbPhases && dbPhases.length > 0
    ? dbPhases.map(p => ({
        phase: p.phase,
        title: p.title,
        status: p.status as "completed" | "current" | "upcoming",
        description: p.description,
      }))
    : ROADMAP_DATA;

  // Calculate progress percentage based on completed phases
  const completed = phases.filter(p => p.status === "completed").length;
  const current = phases.findIndex(p => p.status === "current");
  // Progress: 100% to current node + half-step beyond if current exists
  const progressPct = current >= 0
    ? ((current + 0.5) / phases.length) * 100
    : (completed / phases.length) * 100;

  return (
    <section id="roadmap" className="section-spacing relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(8,145,178,0.05) 0%, transparent 70%)" }}
      />

      <div className="container relative z-10">
        <SectionHeading
          label="The Expansion Protocol"
          title="The Journey So Far"
          subtitle="From smart contract development to global expansion. Nine phases of building the future of DeFi."
        />

        {/* Progress bar above timeline (desktop) */}
        <div className="hidden md:block max-w-5xl mx-auto mb-3">
          <div className="flex justify-between text-[11px] font-bold tracking-[0.25em] uppercase">
            <span className="text-cyan-600/70">The Foundation</span>
            <span className="text-emerald-600/70">{completed} / {phases.length} Complete</span>
            <span className="text-purple-500/70">The Road Ahead</span>
          </div>
        </div>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden md:block max-w-5xl mx-auto">
          <div className="relative pt-12 pb-4">
            {/* Background track */}
            <div
              className="absolute top-[68px] left-8 right-8 h-1 rounded-full"
              style={{ background: "rgba(15,23,42,0.06)" }}
            />
            {/* Filled progress */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `calc(${progressPct}% - 16px)` }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[68px] left-8 h-1 rounded-full"
              style={{
                background: "linear-gradient(90deg, #10B981 0%, #0891B2 70%, #7C3AED 100%)",
                boxShadow: "0 0 12px rgba(8,145,178,0.4)",
              }}
            />
            {/* Animated traveling pulse */}
            <motion.div
              className="absolute top-[63px] w-3 h-3 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, #0891B2 0%, transparent 70%)",
                boxShadow: "0 0 16px rgba(8,145,178,0.7)",
                left: `calc(${progressPct}% - 6px)`,
              }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />

            <div className="grid grid-cols-9 gap-1">
              {phases.map((p, i) => (
                <PhaseCard key={p.phase} phase={p} index={i} total={phases.length} />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden max-w-sm mx-auto">
          <div className="relative">
            {/* Vertical track + filled progress */}
            <div className="absolute left-7 top-2 bottom-2 w-1 rounded-full" style={{ background: "rgba(15,23,42,0.06)" }} />
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${progressPct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.4 }}
              className="absolute left-7 top-2 w-1 rounded-full"
              style={{
                background: "linear-gradient(180deg, #10B981 0%, #0891B2 70%, #7C3AED 100%)",
                boxShadow: "0 0 12px rgba(8,145,178,0.4)",
              }}
            />

            <div className="space-y-5">
              {phases.map((phase, index) => {
                const isCompleted = phase.status === "completed";
                const isCurrent = phase.status === "current";
                const accent = isCurrent ? "#0891B2" : isCompleted ? "#10B981" : "#94A3B8";

                return (
                  <AnimatedSection key={phase.phase} delay={index * 0.05}>
                    <div className="relative flex items-start gap-4">
                      {/* Node */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold"
                        style={{
                          background: isCurrent
                            ? `linear-gradient(135deg, ${accent}, #0E7490)`
                            : isCompleted
                            ? `linear-gradient(135deg, #10B981, #059669)`
                            : "linear-gradient(135deg, #E2E8F0, #CBD5E1)",
                          boxShadow: isCurrent || isCompleted
                            ? `0 8px 20px -4px ${accent}50, inset 0 -2px 6px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.3)`
                            : `0 4px 12px -2px rgba(15,23,42,0.08)`,
                          color: isCompleted || isCurrent ? "white" : "#94A3B8",
                        }}
                      >
                        <span className="text-sm">{phase.phase}</span>
                      </motion.div>

                      <div className="pt-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: accent }}>
                            Phase {phase.phase}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: "linear-gradient(135deg, #0891B2, #0E7490)", color: "white" }}
                            >
                              WE ARE HERE
                            </span>
                          )}
                          {isCompleted && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </div>
                        <p className="text-sm font-semibold mt-0.5 leading-tight"
                          style={{ color: isCompleted ? "#475569" : isCurrent ? "#0F172A" : "#94A3B8" }}
                        >
                          {phase.title}
                        </p>
                        {phase.description && (isCompleted || isCurrent) && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{phase.description}</p>
                        )}
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
