import { motion } from "framer-motion";
import { FLYWHEEL_STEPS, REVENUE_SOURCES } from "@/lib/constants";
import { Droplets, ArrowLeftRight, CreditCard, RotateCcw, Wallet, TrendingUp, Clock, RotateCw, Zap } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";

const STEP_COLORS = ["#22D3EE", "#34D399", "#A78BFA", "#C084FC", "#FBBF24"];
const STEP_ICONS = [Wallet, Droplets, TrendingUp, Clock, RotateCw];

const REVENUE_ICONS: Record<string, React.ElementType> = {
  Droplets, ArrowLeftRight, CreditCard,
};

export default function FlywheelSection() {
  return (
    <section id="flywheel" className="section-spacing relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(192,132,252,0.04) 0%, transparent 60%)" }}
      />

      <div className="container relative z-10">
        <SectionHeading
          label="Revenue Engine"
          title="How the Protocol Sustains Itself"
          subtitle="A self-reinforcing cycle where every action strengthens the ecosystem. No external funding needed."
        />

        {/* Circular Flywheel — Desktop */}
        <div className="hidden md:block max-w-2xl mx-auto mb-20">
          <div className="relative" style={{ paddingBottom: "100%" }}>
            <div className="absolute inset-0">
              {/* Outer ring */}
              <motion.div
                className="absolute inset-8 rounded-full"
                style={{ border: "1px solid rgba(34,211,238,0.08)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              />

              {/* Inner ring */}
              <motion.div
                className="absolute inset-20 rounded-full"
                style={{ border: "1px dashed rgba(192,132,252,0.06)" }}
                animate={{ rotate: -360 }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              />

              {/* Center hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, rgba(6,10,22,0.8) 70%)",
                  border: "1px solid rgba(34,211,238,0.15)",
                  boxShadow: "0 0 40px rgba(34,211,238,0.1)",
                }}
              >
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 text-cyan-400 mx-auto mb-1 animate-spin" style={{ animationDuration: "8s" }} />
                  <span className="text-xs font-bold text-cyan-300 tracking-wider">VELOCITY</span>
                  <br />
                  <span className="text-xs font-bold text-cyan-300 tracking-wider">CYCLE</span>
                </div>
              </div>



              {/* Step nodes positioned in a circle */}
              {FLYWHEEL_STEPS.map((step, i) => {
                const Icon = STEP_ICONS[i] || Zap;
                const color = STEP_COLORS[i];
                const angle = (i / FLYWHEEL_STEPS.length) * Math.PI * 2 - Math.PI / 2;
                const radius = 42;
                const x = 50 + radius * Math.cos(angle);
                const y = 50 + radius * Math.sin(angle);

                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: "translate(-50%, -50%)",
                      width: "140px",
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-2 relative"
                      style={{
                        background: `${color}15`,
                        border: `2px solid ${color}40`,
                        boxShadow: `0 0 20px ${color}15`,
                      }}
                    >
                      <Icon className="h-6 w-6" style={{ color }} />
                      <div
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: color, color: "#060a16" }}
                      >
                        {i + 1}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-white text-center">{step.short}</span>
                    <span className="text-[10px] text-gray-500 text-center">{step.label}</span>
                  </motion.div>
                );
              })}

              {/* SVG connecting arcs */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                {FLYWHEEL_STEPS.map((_, i) => {
                  const a1 = (i / 5) * Math.PI * 2 - Math.PI / 2;
                  const a2 = ((i + 1) / 5) * Math.PI * 2 - Math.PI / 2;
                  const r = 33;
                  const mid = (a1 + a2) / 2;
                  const x1 = 50 + r * Math.cos(a1);
                  const y1 = 50 + r * Math.sin(a1);
                  const x2 = 50 + r * Math.cos(a2);
                  const y2 = 50 + r * Math.sin(a2);
                  const mx = 50 + (r + 5) * Math.cos(mid);
                  const my = 50 + (r + 5) * Math.sin(mid);
                  return (
                    <motion.path
                      key={i}
                      d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                      fill="none"
                      stroke="url(#fw-grad)"
                      strokeWidth="0.15"
                      strokeDasharray="1 0.5"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 0.4 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.8 + i * 0.2 }}
                    />
                  );
                })}
                <defs>
                  <linearGradient id="fw-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22D3EE" />
                    <stop offset="100%" stopColor="#C084FC" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Mobile: Vertical flow */}
        <div className="md:hidden max-w-sm mx-auto mb-16">
          {FLYWHEEL_STEPS.map((step, i) => {
            const Icon = STEP_ICONS[i] || Zap;
            const color = STEP_COLORS[i];
            return (
              <AnimatedSection key={step.label} delay={i * 0.1}>
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: `${color}15`,
                      border: `2px solid ${color}40`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{step.label}</p>
                  </div>
                </div>
                {i < FLYWHEEL_STEPS.length - 1 && (
                  <div className="ml-5 w-[1px] h-4 bg-gradient-to-b from-cyan-400/20 to-transparent" />
                )}
              </AnimatedSection>
            );
          })}
        </div>

        {/* Revenue Sources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {REVENUE_SOURCES.map((source, i) => {
            const Icon = REVENUE_ICONS[source.icon] || Droplets;
            const colors = ["#22D3EE", "#34D399", "#C084FC"];
            const c = colors[i];
            return (
              <AnimatedSection key={source.title} delay={0.6 + i * 0.15}>
                <div
                  className="p-6 rounded-xl text-center relative overflow-hidden"
                  style={{
                    background: "rgba(10, 18, 38, 0.5)",
                    border: `1px solid ${c}12`,
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c}30, transparent)` }} />
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3"
                    style={{ background: `${c}10`, border: `1px solid ${c}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: c }} />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">{source.title}</h4>
                  <p className="text-sm text-gray-400">{source.description}</p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        <AnimatedSection delay={0.8}>
          <p className="text-center mt-10 text-sm text-gray-500">
            All rewards calculated and distributed daily at 00:00 UTC
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
