import { ROADMAP_DATA } from "@/lib/constants";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Zap } from "lucide-react";

export default function RoadmapSection() {
  const { data: dbPhases } = trpc.content.roadmap.useQuery();
  const phases = dbPhases && dbPhases.length > 0 ? dbPhases.map(p => ({
    phase: p.phase,
    title: p.title,
    status: p.status as "completed" | "current" | "upcoming",
    description: p.description,
  })) : ROADMAP_DATA;

  return (
    <section id="roadmap" className="relative section-padding overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[400px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(192,132,252,0.04) 0%, transparent 60%)" }} />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm text-purple-300/80 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            The Expansion Protocol
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-5">
            <span className="text-white">The Journey So Far</span>
            <br />
            <span className="text-gradient">And the Road Ahead</span>
          </h2>
        </motion.div>

        {/* Section labels */}
        <div className="max-w-5xl mx-auto flex justify-between mb-6 px-4">
          <span className="text-sm font-heading font-bold text-cyan-400/70">THE FOUNDATION</span>
          <span className="text-sm font-heading font-bold text-purple-400/70">THE ROAD AHEAD</span>
        </div>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden md:block max-w-5xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-8 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, rgba(34,211,238,0.4), rgba(34,211,238,0.5) 55%, rgba(192,132,252,0.3))" }} />

            <div className="grid grid-cols-9 gap-2">
              {phases.map((phase, index) => {
                const isCompleted = phase.status === "completed";
                const isCurrent = phase.status === "current";
                const nodeColor = isCompleted ? "#22D3EE" : isCurrent ? "#22D3EE" : "rgba(107,114,128,0.3)";

                return (
                  <motion.div
                    key={phase.phase}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="relative flex flex-col items-center"
                  >
                    {/* WE ARE HERE label */}
                    {isCurrent && (
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -top-9 whitespace-nowrap z-20"
                      >
                        <span
                          className="text-xs font-bold px-3 py-1 rounded-full"
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
                    )}

                    {/* Node */}
                    <div
                      className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{
                        background: isCompleted || isCurrent
                          ? `linear-gradient(135deg, ${nodeColor}20, ${nodeColor}05)`
                          : "rgba(13,20,40,0.6)",
                        border: `1px solid ${isCompleted || isCurrent ? `${nodeColor}40` : "rgba(255,255,255,0.04)"}`,
                        boxShadow: isCurrent ? `0 0 25px ${nodeColor}30` : isCompleted ? `0 0 10px ${nodeColor}10` : "none",
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" style={{ color: nodeColor }} />
                      ) : isCurrent ? (
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                          <Zap className="h-6 w-6" style={{ color: nodeColor }} />
                        </motion.div>
                      ) : (
                        <Circle className="h-5 w-5 text-gray-700" />
                      )}
                    </div>

                    {/* Phase info */}
                    <div className="mt-4 text-center">
                      <p
                        className="text-xs font-bold mb-1"
                        style={{ color: isCompleted ? "#22D3EE" : isCurrent ? "#22D3EE" : "#4B5563" }}
                      >
                        Phase {phase.phase}
                      </p>
                      <p
                        className="text-[11px] leading-tight"
                        style={{ color: isCompleted ? "#9CA3AF" : isCurrent ? "#E5E7EB" : "#4B5563" }}
                      >
                        {phase.title}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden max-w-sm mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: "linear-gradient(180deg, rgba(34,211,238,0.4), rgba(192,132,252,0.3))" }} />

            <div className="space-y-6">
              {phases.map((phase, index) => {
                const isCompleted = phase.status === "completed";
                const isCurrent = phase.status === "current";
                const nodeColor = isCompleted || isCurrent ? "#22D3EE" : "rgba(107,114,128,0.3)";

                return (
                  <motion.div
                    key={phase.phase}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="relative flex items-start gap-4"
                  >
                    {/* Node */}
                    <div
                      className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: isCompleted || isCurrent ? `${nodeColor}15` : "rgba(13,20,40,0.6)",
                        border: `1px solid ${isCompleted || isCurrent ? `${nodeColor}30` : "rgba(255,255,255,0.04)"}`,
                        boxShadow: isCurrent ? `0 0 15px ${nodeColor}20` : "none",
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" style={{ color: nodeColor }} />
                      ) : isCurrent ? (
                        <Zap className="h-5 w-5" style={{ color: nodeColor }} />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-700" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: isCompleted || isCurrent ? "#22D3EE" : "#4B5563" }}>
                          Phase {phase.phase}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,211,238,0.15)", color: "#22D3EE", border: "1px solid rgba(34,211,238,0.3)" }}>
                            WE ARE HERE
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-0.5" style={{ color: isCompleted ? "#9CA3AF" : isCurrent ? "#E5E7EB" : "#4B5563" }}>
                        {phase.title}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
