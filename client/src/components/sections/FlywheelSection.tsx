import { FLYWHEEL_STEPS, REVENUE_SOURCES } from "@/lib/constants";
import { motion } from "framer-motion";
import { RefreshCw, Zap, ArrowRight } from "lucide-react";

export default function FlywheelSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-white">The Revenue </span>
            <span className="text-gradient">Flywheel</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            How the Protocol Sustains Itself
          </p>
        </motion.div>

        {/* Flywheel cycle */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-0">
            {FLYWHEEL_STEPS.map((step, index) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                className="flex items-center"
              >
                <div className="relative group">
                  <div className="w-40 md:w-48 p-4 rounded-xl border border-cyan-500/15 bg-[#0d1425]/80 text-center hover:border-cyan-500/40 transition-all">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
                      <span className="text-sm font-bold text-cyan-400">{index + 1}</span>
                    </div>
                    <p className="text-sm font-heading font-semibold text-white mb-1">{step.label}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < FLYWHEEL_STEPS.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-cyan-500/40 mx-1 shrink-0 hidden md:block" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Loop arrow indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
            className="flex justify-center mt-6"
          >
            <div className="flex items-center gap-2 text-cyan-400/60">
              <RefreshCw className="h-5 w-5 animate-spin" style={{ animationDuration: "4s" }} />
              <span className="text-sm font-medium">Continuous Loop</span>
            </div>
          </motion.div>
        </div>

        {/* Revenue Sources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {REVENUE_SOURCES.map((source, index) => (
            <motion.div
              key={source.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}
              className="p-6 rounded-xl border border-purple-500/15 bg-[#0d1425]/60 text-center hover:border-purple-500/30 transition-all"
            >
              <Zap className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h4 className="text-lg font-heading font-bold text-white mb-2">{source.title}</h4>
              <p className="text-sm text-gray-400">{source.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          All rewards calculated and distributed daily at 00:00 UTC
        </motion.p>
      </div>
    </section>
  );
}
