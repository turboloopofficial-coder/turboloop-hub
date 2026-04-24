import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FLYWHEEL_STEPS, REVENUE_SOURCES } from "@/lib/constants";
import {
  Droplets, ArrowLeftRight, CreditCard, Wallet, TrendingUp, Clock,
  RotateCw, Zap, ArrowRight, CheckCircle2,
} from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";

const STEP_COLORS = ["#0891B2", "#059669", "#7C3AED", "#9333EA", "#D97706"];
const STEP_ICONS = [Wallet, Droplets, TrendingUp, Clock, RotateCw];

const REVENUE_ICONS: Record<string, React.ElementType> = {
  Droplets, ArrowLeftRight, CreditCard,
};

const REVENUE_COLORS = ["#0891B2", "#059669", "#9333EA"];
const REVENUE_STATS = ["0.3% per swap", "LP yield daily", "Trading fees"];

/** Compact node positioned around a smaller ring */
function FlywheelNode({
  step, index, total, color, Icon, activeStep,
}: {
  step: { label: string; short: string };
  index: number;
  total: number;
  color: string;
  Icon: React.ElementType;
  activeStep: number;
}) {
  const angle = (index / total) * 360 - 90;
  const rad = (angle * Math.PI) / 180;
  const radius = 40;
  const x = 50 + radius * Math.cos(rad);
  const y = 50 + radius * Math.sin(rad);
  const isActive = activeStep === index;

  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 + index * 0.08, type: "spring", stiffness: 220 }}
        className="relative flex flex-col items-center"
      >
        {/* Step number */}
        <div
          className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white z-10 shadow-md"
          style={{ background: color }}
        >
          {index + 1}
        </div>

        {/* Icon tile */}
        <motion.div
          animate={isActive ? { scale: [1, 1.12, 1], y: [0, -3, 0] } : {}}
          transition={{ duration: 0.6 }}
          className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center relative"
          style={{
            background: "white",
            border: `2px solid ${isActive ? color : `${color}30`}`,
            boxShadow: isActive
              ? `0 12px 30px -6px ${color}50, 0 0 0 6px ${color}15`
              : `0 6px 16px -4px ${color}25`,
          }}
        >
          <Icon className="w-6 h-6 md:w-7 md:h-7" style={{ color }} />
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.6 }}
              transition={{ duration: 1.2 }}
              style={{ border: `2px solid ${color}` }}
            />
          )}
        </motion.div>

        {/* Pill label */}
        <div
          className="mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all"
          style={{
            background: isActive ? color : `${color}12`,
            color: isActive ? "white" : color,
            border: `1px solid ${color}${isActive ? "" : "25"}`,
          }}
        >
          {step.short}
        </div>
      </motion.div>
    </div>
  );
}

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
      transition={{ delay: index * 0.08 }}
      className="relative pl-16 pb-5"
    >
      {!isLast && (
        <div
          className="absolute left-[27px] top-14 bottom-0 w-0.5"
          style={{ background: `linear-gradient(180deg, ${color}50, ${STEP_COLORS[(index + 1) % STEP_COLORS.length]}30)` }}
        />
      )}
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
  // Cycle through steps to give the "alive" feel
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveStep((s) => (s + 1) % FLYWHEEL_STEPS.length);
    }, 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="flywheel" className="section-spacing relative overflow-hidden">
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

        {/* Status pill */}
        <AnimatedSection delay={0.1}>
          <div className="flex items-center justify-center gap-2 mb-10">
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(8,145,178,0.08), rgba(124,58,237,0.08))",
                border: "1px solid rgba(8,145,178,0.18)",
              }}
              animate={{ boxShadow: ["0 0 0px rgba(8,145,178,0)", "0 0 28px rgba(8,145,178,0.18)", "0 0 0px rgba(8,145,178,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                <RotateCw className="w-4 h-4 text-cyan-600" />
              </motion.div>
              <span className="text-xs font-bold text-cyan-600 tracking-widest uppercase">Continuous Loop · Running</span>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Desktop flywheel — compact, dense, alive */}
        <div className="hidden md:block mb-14">
          <div className="relative w-full mx-auto" style={{ maxWidth: "480px", paddingBottom: "100%", maxHeight: "480px" }}>
            <div className="absolute inset-0">
              {/* Outer dashed ring */}
              <div
                className="absolute inset-[10%] rounded-full"
                style={{ border: "2px dashed rgba(8,145,178,0.18)" }}
              />
              {/* Rotating accent (cyan → purple gradient) */}
              <motion.div
                className="absolute inset-[9.5%] rounded-full"
                style={{
                  border: "3px solid transparent",
                  borderTopColor: "rgba(8,145,178,0.45)",
                  borderRightColor: "rgba(124,58,237,0.3)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              {/* Inner reverse ring */}
              <motion.div
                className="absolute inset-[15%] rounded-full"
                style={{
                  border: "1px solid transparent",
                  borderBottomColor: "rgba(217,119,6,0.3)",
                  borderLeftColor: "rgba(5,150,105,0.2)",
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              />

              {/* Flowing particles on the orbit */}
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(8,145,178,0.95), rgba(8,145,178,0.3))",
                    boxShadow: "0 0 12px rgba(8,145,178,0.5)",
                  }}
                  animate={{
                    x: Array.from({ length: 37 }, (_, k) => Math.cos((k * 10 - 90 + i * 90) * Math.PI / 180) * 160 - 4),
                    y: Array.from({ length: 37 }, (_, k) => Math.sin((k * 10 - 90 + i * 90) * Math.PI / 180) * 160 - 4),
                  }}
                  transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                />
              ))}

              {/* Center hub — bigger, denser */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 220, delay: 0.2 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full flex flex-col items-center justify-center p-4"
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #f0fdff 50%, #faf5ff 100%)",
                  border: "2px solid rgba(8,145,178,0.25)",
                  boxShadow:
                    "0 25px 60px -10px rgba(8,145,178,0.25), 0 0 80px rgba(124,58,237,0.12), inset 0 0 40px rgba(255,255,255,0.8), inset 0 2px 10px rgba(8,145,178,0.08)",
                }}
              >
                {/* Inner rotating icon block */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-1 relative"
                  style={{
                    background: "linear-gradient(135deg, rgba(8,145,178,0.18), rgba(124,58,237,0.1))",
                    border: "1.5px solid rgba(8,145,178,0.2)",
                  }}
                >
                  <Zap className="w-6 h-6 text-cyan-600 fill-cyan-500" />
                </motion.div>
                <span
                  className="text-[13px] font-bold tracking-wider text-center leading-tight"
                  style={{
                    background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  TURBO LOOP
                </span>
                <span className="text-[8px] text-slate-400 tracking-[0.2em] mt-0.5">REVENUE ENGINE</span>
                {/* Live blinking dot */}
                <div className="flex items-center gap-1 mt-1.5">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-[9px] font-semibold text-emerald-600 tracking-wider uppercase">Live</span>
                </div>
              </motion.div>

              {/* Nodes */}
              {FLYWHEEL_STEPS.map((step, i) => {
                const Icon = STEP_ICONS[i] || Zap;
                const color = STEP_COLORS[i];
                return (
                  <FlywheelNode
                    key={step.label}
                    step={step}
                    index={i}
                    total={FLYWHEEL_STEPS.length}
                    color={color}
                    Icon={Icon}
                    activeStep={activeStep}
                  />
                );
              })}
            </div>
          </div>

          {/* Active step caption below the flywheel */}
          <div className="flex justify-center mt-6">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "rgba(255,255,255,0.9)",
                border: `1px solid ${STEP_COLORS[activeStep]}30`,
                boxShadow: `0 4px 20px -4px ${STEP_COLORS[activeStep]}25`,
              }}
            >
              <CheckCircle2 className="w-4 h-4" style={{ color: STEP_COLORS[activeStep] }} />
              <span className="text-xs font-bold tracking-wider text-slate-700">
                STEP {activeStep + 1}:
              </span>
              <span className="text-xs text-slate-600">{FLYWHEEL_STEPS[activeStep].label}</span>
            </motion.div>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden max-w-sm mx-auto mb-12">
          {FLYWHEEL_STEPS.map((step, i) => {
            const Icon = STEP_ICONS[i] || Zap;
            const color = STEP_COLORS[i];
            return (
              <MobileStep key={step.label} step={step} index={i} color={color} Icon={Icon} isLast={i === FLYWHEEL_STEPS.length - 1} />
            );
          })}
          <div className="flex justify-center mt-3">
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(217,119,6,0.08), rgba(124,58,237,0.06))",
                border: "1px solid rgba(217,119,6,0.18)",
              }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[10px] font-bold text-amber-600 tracking-wider">CYCLE REPEATS</span>
            </motion.div>
          </div>
        </div>

        {/* Revenue sources — premium cards */}
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
                  <div
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-50 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${c}18 0%, transparent 70%)` }}
                  />
                  <div
                    className="absolute top-0 left-7 right-7 h-[2px] rounded-full"
                    style={{ background: `linear-gradient(90deg, transparent, ${c}, transparent)` }}
                  />
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

        <AnimatedSection delay={0.7}>
          <div className="flex flex-col items-center mt-12">
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-slate-300">
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
