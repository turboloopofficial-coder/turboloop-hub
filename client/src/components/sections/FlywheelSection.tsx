import { motion } from "framer-motion";
import { FLYWHEEL_STEPS, REVENUE_SOURCES } from "@/lib/constants";
import { Droplets, ArrowLeftRight, CreditCard, Wallet, TrendingUp, Clock, RotateCw, Zap, ArrowRight } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";

const STEP_COLORS = ["#0891B2", "#059669", "#7C3AED", "#9333EA", "#D97706"];
const STEP_ICONS = [Wallet, Droplets, TrendingUp, Clock, RotateCw];

const REVENUE_ICONS: Record<string, React.ElementType> = {
  Droplets, ArrowLeftRight, CreditCard,
};

const REVENUE_COLORS = ["#0891B2", "#059669", "#9333EA"];
const REVENUE_STATS = ["0.3% per swap", "LP yield daily", "Trading fees"];

/** Node positioned around a circle */
function FlywheelNode({
  step, index, total, color, Icon,
}: {
  step: { label: string; short: string };
  index: number;
  total: number;
  color: string;
  Icon: React.ElementType;
}) {
  const angle = (index / total) * 360 - 90;
  const rad = (angle * Math.PI) / 180;
  const radius = 44;
  const x = 50 + radius * Math.cos(rad);
  const y = 50 + radius * Math.sin(rad);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="relative flex flex-col items-center">
        {/* Step number badge */}
        <div
          className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white z-10 shadow-md"
          style={{ background: color }}
        >
          {index + 1}
        </div>
        {/* Icon circle */}
        <motion.div
          whileHover={{ scale: 1.1, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center relative"
          style={{
            background: "white",
            border: `2px solid ${color}25`,
            boxShadow: `0 10px 30px -8px ${color}30, 0 4px 12px -2px rgba(0,0,0,0.08)`,
          }}
        >
          <Icon className="w-7 h-7 md:w-8 md:h-8" style={{ color }} />
          {/* Pulsing halo */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{
              boxShadow: [
                `0 0 0 0 ${color}00`,
                `0 0 0 8px ${color}15`,
                `0 0 0 16px ${color}00`,
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.3 }}
          />
        </motion.div>
        {/* Label */}
        <div
          className="mt-2.5 px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
          style={{ background: `${color}10`, color, border: `1px solid ${color}20` }}
        >
          {step.short}
        </div>
      </div>
    </motion.div>
  );
}

/** Mobile vertical step */
function MobileStep({
  step, index, color, Icon, isLast,
}: {
  step: { label: string; short: string };
  index: number;
  color: string;
  Icon: React.ElementType;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-16 pb-6"
    >
      {/* Vertical line */}
      {!isLast && (
        <div
          className="absolute left-[27px] top-[56px] bottom-0 w-0.5"
          style={{ background: `linear-gradient(180deg, ${color}50, ${STEP_COLORS[(index + 1) % STEP_COLORS.length]}30)` }}
        />
      )}
      {/* Icon + number */}
      <div
        className="absolute left-0 top-0 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: "white",
          border: `2px solid ${color}30`,
          boxShadow: `0 6px 16px -4px ${color}25`,
        }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
        <div
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ background: color }}
        >
          {index + 1}
        </div>
      </div>
      <div className="pt-1">
        <h4 className="text-sm font-bold text-slate-800">{step.short}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{step.label}</p>
      </div>
    </motion.div>
  );
}

export default function FlywheelSection() {
  return (
    <section id="flywheel" className="section-spacing relative overflow-hidden">
      {/* Soft radial bg */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(8,145,178,0.06) 0%, rgba(124,58,237,0.04) 35%, transparent 70%)",
        }}
      />

      <div className="container relative z-10">
        <SectionHeading
          label="Revenue Engine"
          title="The Velocity Cycle"
          subtitle="A self-reinforcing flywheel where every action strengthens the ecosystem. No external funding needed — the protocol sustains itself."
        />

        {/* Loop indicator */}
        <AnimatedSection delay={0.1}>
          <div className="flex items-center justify-center gap-2 mb-14">
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(8,145,178,0.08), rgba(124,58,237,0.08))",
                border: "1px solid rgba(8,145,178,0.15)",
              }}
              animate={{ boxShadow: ["0 0 0px rgba(8,145,178,0)", "0 0 30px rgba(8,145,178,0.15)", "0 0 0px rgba(8,145,178,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                <RotateCw className="w-4 h-4 text-cyan-600" />
              </motion.div>
              <span className="text-xs font-bold text-cyan-600 tracking-widest uppercase">Continuous Loop</span>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Desktop flywheel */}
        <div className="hidden md:block mb-20">
          <div className="relative w-full max-w-[640px] mx-auto" style={{ paddingBottom: "100%", maxHeight: "640px" }}>
            <div className="absolute inset-0">
              {/* Outer dashed ring */}
              <div
                className="absolute inset-[14%] rounded-full"
                style={{ border: "2px dashed rgba(8,145,178,0.15)" }}
              />
              {/* Rotating accent ring */}
              <motion.div
                className="absolute inset-[13.5%] rounded-full"
                style={{
                  border: "2.5px solid transparent",
                  borderTopColor: "rgba(8,145,178,0.4)",
                  borderRightColor: "rgba(124,58,237,0.25)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />
              {/* Second thinner rotating ring opposite direction */}
              <motion.div
                className="absolute inset-[18%] rounded-full"
                style={{
                  border: "1px solid transparent",
                  borderBottomColor: "rgba(217,119,6,0.25)",
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              />

              {/* Center hub — enhanced */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 md:w-40 md:h-40 rounded-full flex flex-col items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
                  border: "2px solid rgba(8,145,178,0.2)",
                  boxShadow: "0 20px 60px -10px rgba(8,145,178,0.2), 0 0 80px rgba(124,58,237,0.08), inset 0 0 30px rgba(255,255,255,0.6)",
                }}
              >
                {/* Inner rotating icon */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
                  style={{
                    background: "linear-gradient(135deg, rgba(8,145,178,0.12), rgba(124,58,237,0.08))",
                    border: "1px solid rgba(8,145,178,0.15)",
                  }}
                >
                  <Zap className="w-7 h-7 text-cyan-600 fill-cyan-600/40" />
                </motion.div>
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{
                    background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Turbo Loop
                </span>
                <span className="text-[9px] text-slate-400 tracking-wider mt-0.5">REVENUE ENGINE</span>
              </motion.div>

              {/* Nodes */}
              {FLYWHEEL_STEPS.map((step, i) => {
                const Icon = STEP_ICONS[i] || Zap;
                const color = STEP_COLORS[i];
                return (
                  <FlywheelNode key={step.label} step={step} index={i} total={FLYWHEEL_STEPS.length} color={color} Icon={Icon} />
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden max-w-sm mx-auto mb-14">
          {FLYWHEEL_STEPS.map((step, i) => {
            const Icon = STEP_ICONS[i] || Zap;
            const color = STEP_COLORS[i];
            return (
              <MobileStep key={step.label} step={step} index={i} color={color} Icon={Icon} isLast={i === FLYWHEEL_STEPS.length - 1} />
            );
          })}
          <div className="flex justify-center mt-4">
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(217,119,6,0.08), rgba(124,58,237,0.06))",
                border: "1px solid rgba(217,119,6,0.15)",
              }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[10px] font-bold text-amber-600 tracking-wider">CYCLE REPEATS</span>
            </motion.div>
          </div>
        </div>

        {/* Revenue sources — redesigned */}
        <AnimatedSection delay={0.2}>
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="text-slate-800">Where Does the </span>
              <span style={{ background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Yield Come From?
              </span>
            </h3>
            <p className="text-sm text-slate-500 mt-2">Three real, verifiable revenue streams power the protocol</p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {REVENUE_SOURCES.map((source, i) => {
            const Icon = REVENUE_ICONS[source.icon] || Droplets;
            const c = REVENUE_COLORS[i];
            const stat = REVENUE_STATS[i];
            return (
              <AnimatedSection key={source.title} delay={0.3 + i * 0.1}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group relative p-7 rounded-2xl overflow-hidden h-full"
                  style={{
                    background: "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)",
                    border: `1px solid ${c}20`,
                    boxShadow: `0 8px 30px -8px ${c}15, 0 4px 12px -2px rgba(0,0,0,0.04)`,
                  }}
                >
                  {/* Corner accent */}
                  <div
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-50 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${c}18 0%, transparent 70%)`,
                    }}
                  />

                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-7 right-7 h-[2px] rounded-full"
                    style={{ background: `linear-gradient(90deg, transparent, ${c}, transparent)` }}
                  />

                  {/* Icon */}
                  <div className="relative">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${c}18, ${c}08)`,
                        border: `1px solid ${c}25`,
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: c }} />
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-bold text-slate-800">{source.title}</h4>
                      <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full" style={{ background: `${c}12`, color: c }}>
                        Live
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{source.description}</p>

                    {/* Stat row */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <ArrowRight className="w-3.5 h-3.5" style={{ color: c }} />
                      <span className="text-xs font-semibold" style={{ color: c }}>{stat}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* Flow arrow to distribution */}
        <AnimatedSection delay={0.7}>
          <div className="flex flex-col items-center mt-12">
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-slate-300"
            >
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
                <path d="M20 0 L20 16 M12 10 L20 18 L28 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
            <div
              className="mt-4 px-6 py-3 rounded-full inline-flex items-center gap-3"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,253,250,0.8))",
                border: "1px solid rgba(8,145,178,0.15)",
                boxShadow: "0 4px 20px -4px rgba(8,145,178,0.1)",
              }}
            >
              <Clock className="w-4 h-4 text-cyan-600" />
              <span className="text-xs font-bold text-slate-700 tracking-wider uppercase">Distributed daily at 00:00 UTC</span>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
