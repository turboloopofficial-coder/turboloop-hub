import { ROADMAP_DATA } from "@/lib/constants";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Map, CheckCircle2, Circle, ArrowRight } from "lucide-react";

export default function RoadmapSection() {
  const { data: dbPhases } = trpc.content.roadmap.useQuery();
  const phases = dbPhases && dbPhases.length > 0 ? dbPhases.map(p => ({
    phase: p.phase,
    title: p.title,
    status: p.status as "completed" | "current" | "upcoming",
    description: p.description,
  })) : ROADMAP_DATA;

  return (
    <section id="roadmap" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] -translate-y-1/2" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-sm text-purple-300 mb-6">
            <Map className="h-4 w-4" />
            The Expansion Protocol
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-white">The Journey So Far — </span>
            <span className="text-gradient">and the Road Ahead</span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          {/* Section labels */}
          <div className="flex justify-between mb-6 px-4">
            <span className="text-sm font-heading font-bold text-cyan-400">THE FOUNDATION</span>
            <span className="text-sm font-heading font-bold text-purple-400">THE ROAD AHEAD</span>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/30 via-cyan-500/50 to-purple-500/30" />

            <div className="grid grid-cols-9 gap-1 md:gap-2">
              {phases.map((phase, index) => (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="relative flex flex-col items-center"
                >
                  {/* Node */}
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    phase.status === "completed"
                      ? "bg-cyan-500/20 border-cyan-500/50"
                      : phase.status === "current"
                      ? "bg-cyan-500/30 border-cyan-400 shadow-lg shadow-cyan-500/30 animate-pulse"
                      : "bg-[#0d1425] border-gray-700"
                  }`}>
                    {phase.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                    ) : phase.status === "current" ? (
                      <ArrowRight className="h-5 w-5 text-cyan-300" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-600" />
                    )}
                  </div>

                  {/* WE ARE HERE label */}
                  {phase.status === "current" && (
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute -top-8 whitespace-nowrap"
                    >
                      <span className="text-[10px] md:text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                        WE ARE HERE
                      </span>
                    </motion.div>
                  )}

                  {/* Phase info */}
                  <div className="mt-3 text-center">
                    <p className={`text-[10px] md:text-xs font-bold ${
                      phase.status === "completed" ? "text-cyan-400" :
                      phase.status === "current" ? "text-cyan-300" : "text-gray-600"
                    }`}>
                      Phase {phase.phase}
                    </p>
                    <p className={`text-[9px] md:text-[11px] mt-0.5 leading-tight ${
                      phase.status === "completed" ? "text-gray-400" :
                      phase.status === "current" ? "text-white font-semibold" : "text-gray-600"
                    }`}>
                      {phase.title}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
