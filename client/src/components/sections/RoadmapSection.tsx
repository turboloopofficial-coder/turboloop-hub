import { ROADMAP_DATA } from "@/lib/constants";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, Zap } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";

export default function RoadmapSection() {
  const { data: dbPhases } = trpc.content.roadmap.useQuery();
  const phases = dbPhases && dbPhases.length > 0 ? dbPhases.map(p => ({
    phase: p.phase,
    title: p.title,
    status: p.status as "completed" | "current" | "upcoming",
    description: p.description,
  })) : ROADMAP_DATA;

  return (
    <section id="roadmap" className="section-spacing relative">
      <div className="container">
        <SectionHeading
          label="The Expansion Protocol"
          title="The Journey So Far"
          subtitle="From smart contract development to global expansion. Nine phases of building the future of DeFi."
        />

        {/* Section labels */}
        <div className="max-w-5xl mx-auto flex justify-between mb-8 px-4">
          <span className="text-xs font-bold tracking-wider text-cyan-400/60 uppercase">The Foundation</span>
          <span className="text-xs font-bold tracking-wider text-purple-400/60 uppercase">The Road Ahead</span>
        </div>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden md:block max-w-5xl mx-auto">
          <div className="relative">
            {/* Timeline line — bright for completed, fading for upcoming */}
            <div className="absolute top-10 left-0 right-0 h-[2px]">
              {/* Solid bright portion (phases 1-6) */}
              <div className="absolute left-0 h-full" style={{
                width: "66%",
                background: "linear-gradient(90deg, #22D3EE, #22D3EE)",
                boxShadow: "0 0 8px rgba(34,211,238,0.3)",
              }} />
              {/* Faded dashed portion (phases 7-9) */}
              <div className="absolute right-0 h-full" style={{
                width: "34%",
                background: "repeating-linear-gradient(90deg, rgba(107,114,128,0.2) 0px, rgba(107,114,128,0.2) 8px, transparent 8px, transparent 16px)",
              }} />
            </div>

            <div className="grid grid-cols-9 gap-2">
              {phases.map((phase, index) => {
                const isCompleted = phase.status === "completed";
                const isCurrent = phase.status === "current";
                const isUpcoming = phase.status === "upcoming";

                return (
                  <AnimatedSection key={phase.phase} delay={index * 0.08}>
                    <div className="relative flex flex-col items-center">
                      {/* WE ARE HERE beacon */}
                      {isCurrent && (
                        <>
                          {/* Radar ping rings */}
                          <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
                            <motion.div
                              animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                              className="absolute w-10 h-10 rounded-full -top-5 -left-5"
                              style={{ border: "1px solid rgba(34,211,238,0.4)" }}
                            />
                            <motion.div
                              animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
                              className="absolute w-10 h-10 rounded-full -top-5 -left-5"
                              style={{ border: "1px solid rgba(34,211,238,0.3)" }}
                            />
                          </div>

                          {/* Label */}
                          <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute -top-8 whitespace-nowrap z-20"
                          >
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                              style={{
                                background: "rgba(34,211,238,0.15)",
                                color: "#22D3EE",
                                border: "1px solid rgba(34,211,238,0.3)",
                                boxShadow: "0 0 15px rgba(34,211,238,0.2)",
                              }}
                            >
                              WE ARE HERE
                            </span>
                          </motion.div>
                        </>
                      )}

                      {/* Node */}
                      <div
                        className="relative z-10 w-[52px] h-[52px] rounded-full flex items-center justify-center"
                        style={{
                          background: isCompleted
                            ? "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.05))"
                            : isCurrent
                            ? "linear-gradient(135deg, rgba(34,211,238,0.25), rgba(34,211,238,0.1))"
                            : "rgba(13,20,40,0.6)",
                          border: isCompleted
                            ? "2px solid rgba(34,211,238,0.4)"
                            : isCurrent
                            ? "2px solid rgba(34,211,238,0.6)"
                            : "1px solid rgba(255,255,255,0.06)",
                          boxShadow: isCurrent
                            ? "0 0 25px rgba(34,211,238,0.3), inset 0 0 10px rgba(34,211,238,0.1)"
                            : isCompleted
                            ? "0 0 10px rgba(34,211,238,0.1)"
                            : "none",
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                        ) : isCurrent ? (
                          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                            <Zap className="h-5 w-5 text-cyan-400" />
                          </motion.div>
                        ) : (
                          <Lock className="h-4 w-4 text-gray-600" />
                        )}
                      </div>

                      {/* Phase info */}
                      <div className="mt-4 text-center">
                        <p className="text-[10px] font-bold tracking-wider mb-1"
                          style={{ color: isCompleted || isCurrent ? "#22D3EE" : "#4B5563" }}
                        >
                          PHASE {phase.phase}
                        </p>
                        <p className="text-[11px] leading-tight max-w-[90px] mx-auto"
                          style={{ color: isCompleted ? "#9CA3AF" : isCurrent ? "#E5E7EB" : "#4B5563" }}
                        >
                          {phase.title}
                        </p>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden max-w-sm mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[23px] top-0 bottom-0 w-[2px]">
              <div className="h-[66%]" style={{ background: "#22D3EE", boxShadow: "0 0 6px rgba(34,211,238,0.3)" }} />
              <div className="h-[34%]" style={{ background: "repeating-linear-gradient(180deg, rgba(107,114,128,0.2) 0px, rgba(107,114,128,0.2) 6px, transparent 6px, transparent 12px)" }} />
            </div>

            <div className="space-y-5">
              {phases.map((phase, index) => {
                const isCompleted = phase.status === "completed";
                const isCurrent = phase.status === "current";

                return (
                  <AnimatedSection key={phase.phase} delay={index * 0.06}>
                    <div className="relative flex items-start gap-4">
                      {/* Node */}
                      <div
                        className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: isCompleted || isCurrent
                            ? "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.05))"
                            : "rgba(13,20,40,0.6)",
                          border: isCompleted || isCurrent
                            ? "2px solid rgba(34,211,238,0.4)"
                            : "1px solid rgba(255,255,255,0.06)",
                          boxShadow: isCurrent ? "0 0 15px rgba(34,211,238,0.2)" : "none",
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                        ) : isCurrent ? (
                          <Zap className="h-5 w-5 text-cyan-400" />
                        ) : (
                          <Lock className="h-4 w-4 text-gray-600" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="pt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold" style={{ color: isCompleted || isCurrent ? "#22D3EE" : "#4B5563" }}>
                            Phase {phase.phase}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(34,211,238,0.15)", color: "#22D3EE", border: "1px solid rgba(34,211,238,0.3)" }}
                            >
                              WE ARE HERE
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: isCompleted ? "#9CA3AF" : isCurrent ? "#E5E7EB" : "#4B5563" }}>
                          {phase.title}
                        </p>
                        {phase.description && (isCompleted || isCurrent) && (
                          <p className="text-xs text-gray-500 mt-1">{phase.description}</p>
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
