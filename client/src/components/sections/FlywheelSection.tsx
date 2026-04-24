import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FLYWHEEL_STEPS, REVENUE_SOURCES } from "@/lib/constants";
import {
  Droplets, ArrowLeftRight, CreditCard, Wallet, TrendingUp, Clock,
  RotateCw, Zap, ArrowRight, ArrowDown, CheckCircle2,
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

/** Fixed-size flywheel with strict pixel sizing and dense internals */
function FlywheelCore({ activeStep }: { activeStep: number }) {
  const SIZE = 400;
  const RADIUS = 150;
  const CENTER = SIZE / 2;

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      {/* SVG — the base diagram (orbits, arcs, connecting lines, particles) */}
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0">
        <defs>
          <linearGradient id="orbitGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0891B2" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="hubGrad">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f0fdff" />
            <stop offset="100%" stopColor="#faf5ff" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer dashed ring */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS + 20} fill="none" stroke="rgba(8,145,178,0.15)" strokeWidth="1.5" strokeDasharray="3 5" />

        {/* Main ring with gradient */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="url(#orbitGrad)" strokeWidth="2" opacity="0.7" />

        {/* Inner subtle ring */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS - 40} fill="none" stroke="rgba(8,145,178,0.08)" strokeWidth="1" />

        {/* Animated rotating accent arc */}
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}>
          <path
            d={`M ${CENTER} ${CENTER - RADIUS} A ${RADIUS} ${RADIUS} 0 0 1 ${CENTER + RADIUS * 0.7} ${CENTER - RADIUS * 0.7}`}
            fill="none"
            stroke="#0891B2"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
            filter="url(#glow)"
          />
        </motion.g>

        {/* Reverse rotating arc */}
        <motion.g animate={{ rotate: -360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}>
          <path
            d={`M ${CENTER + RADIUS * 0.6} ${CENTER + RADIUS * 0.8} A ${RADIUS} ${RADIUS} 0 0 1 ${CENTER - RADIUS * 0.8} ${CENTER + RADIUS * 0.6}`}
            fill="none"
            stroke="#D97706"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
        </motion.g>

        {/* Flowing particles — 5 dots traversing the ring */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={i}
            r="4"
            fill="#0891B2"
            filter="url(#glow)"
            animate={{
              cx: Array.from({ length: 61 }, (_, k) => CENTER + RADIUS * Math.cos((k * 6 - 90 + i * 72) * Math.PI / 180)),
              cy: Array.from({ length: 61 }, (_, k) => CENTER + RADIUS * Math.sin((k * 6 - 90 + i * 72) * Math.PI / 180)),
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </svg>

      {/* Center hub (HTML — allows gradient text) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 220, delay: 0.2 }}
        className="absolute flex flex-col items-center justify-center rounded-full"
        style={{
          width: 140,
          height: 140,
          left: CENTER - 70,
          top: CENTER - 70,
          background: "radial-gradient(circle, #ffffff 0%, #f0fdff 60%, #faf5ff 100%)",
          border: "2px solid rgba(8,145,178,0.22)",
          boxShadow:
            "0 20px 50px -10px rgba(8,145,178,0.25), 0 0 60px rgba(124,58,237,0.1), inset 0 2px 8px rgba(255,255,255,0.9)",
        }}
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
          style={{
            background: "linear-gradient(135deg, rgba(8,145,178,0.2), rgba(124,58,237,0.12))",
            border: "1.5px solid rgba(8,145,178,0.25)",
          }}
        >
          <Zap className="w-6 h-6 text-cyan-600 fill-cyan-500" />
        </motion.div>
        <span
          className="text-[11px] font-bold tracking-wider"
          style={{
            background: "linear-gradient(135deg, #0891B2, #7C3AED)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          TURBO LOOP
        </span>
        <span className="text-[8px] text-slate-400 tracking-[0.18em] mt-0.5">REVENUE ENGINE</span>
        <div className="flex items-center gap-1 mt-1">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-emerald-500"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[9px] font-semibold text-emerald-600 tracking-wider uppercase">Live</span>
        </div>
      </motion.div>

      {/* Nodes — placed precisely with sin/cos on fixed radius */}
      {FLYWHEEL_STEPS.map((step, i) => {
        const total = FLYWHEEL_STEPS.length;
        const angle = (i / total) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const x = CENTER + RADIUS * Math.cos(rad);
        const y = CENTER + RADIUS * Math.sin(rad);
        const Icon = STEP_ICONS[i] || Zap;
        const color = STEP_COLORS[i];
        const isActive = activeStep === i;

        return (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, scale: 0.4 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.07, type: "spring", stiffness: 220 }}
            className="absolute flex flex-col items-center"
            style={{ left: x - 26, top: y - 26, width: 52 }}
          >
            <div className="relative">
              <div
                className="absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white z-10 shadow-md"
                style={{ background: color }}
              >
                {i + 1}
              </div>
              <motion.div
                animate={isActive ? { scale: [1, 1.14, 1] } : {}}
                transition={{ duration: 0.6 }}
                className="w-[52px] h-[52px] rounded-xl flex items-center justify-center relative"
                style={{
                  background: "white",
                  border: `2px solid ${isActive ? color : `${color}35`}`,
                  boxShadow: isActive
                    ? `0 10px 24px -4px ${color}55, 0 0 0 4px ${color}18`
                    : `0 4px 12px -2px ${color}22`,
                }}
              >
                <Icon className="w-6 h-6" style={{ color }} />
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.7 }}
                    transition={{ duration: 1.2 }}
                    style={{ border: `2px solid ${color}` }}
                  />
                )}
              </motion.div>
            </div>
            <div
              className="mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap"
              style={{
                background: isActive ? color : `${color}12`,
                color: isActive ? "white" : color,
                border: `1px solid ${color}${isActive ? "" : "28"}`,
              }}
            >
              {step.short}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function FlywheelSection() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveStep((s) => (s + 1) % FLYWHEEL_STEPS.length);
    }, 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="flywheel" className="section-spacing relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(8,145,178,0.05) 0%, rgba(124,58,237,0.03) 35%, transparent 70%)",
        }}
      />

      <div className="container relative z-10">
        <SectionHeading
          label="Revenue Engine"
          title="The Velocity Cycle"
          subtitle="A self-reinforcing flywheel where every action strengthens the ecosystem. No external funding needed — the protocol sustains itself."
        />

        {/* Desktop: Two-column layout — narrative left, flywheel right. Dense, no empty space. */}
        <div className="hidden md:grid md:grid-cols-2 gap-10 lg:gap-16 items-center max-w-6xl mx-auto mb-16">
          {/* Left: narrative + step list */}
          <div>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
              style={{
                background: "linear-gradient(135deg, rgba(8,145,178,0.08), rgba(124,58,237,0.08))",
                border: "1px solid rgba(8,145,178,0.18)",
              }}
              animate={{ boxShadow: ["0 0 0px rgba(8,145,178,0)", "0 0 24px rgba(8,145,178,0.18)", "0 0 0px rgba(8,145,178,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                <RotateCw className="w-4 h-4 text-cyan-600" />
              </motion.div>
              <span className="text-xs font-bold text-cyan-600 tracking-widest uppercase">Continuous Loop · Running</span>
            </motion.div>

            <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 leading-tight mb-4">
              Every deposit strengthens the next payout.
            </h3>
            <p className="text-slate-500 leading-relaxed mb-6">
              Capital flows through five on-chain steps. Each step feeds the next.
              Protocol revenue compounds daily without external funding or token emissions.
            </p>

            {/* Step list with live active highlight */}
            <div className="space-y-2">
              {FLYWHEEL_STEPS.map((step, i) => {
                const Icon = STEP_ICONS[i] || Zap;
                const color = STEP_COLORS[i];
                const isActive = activeStep === i;
                return (
                  <motion.div
                    key={step.label}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                    style={{
                      background: isActive ? `${color}10` : "rgba(255,255,255,0.5)",
                      border: `1px solid ${isActive ? color : "rgba(0,0,0,0.04)"}${isActive ? "40" : ""}`,
                      boxShadow: isActive ? `0 4px 16px -4px ${color}30` : "none",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: isActive ? color : `${color}12`,
                        color: isActive ? "white" : color,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-bold tracking-wider uppercase"
                          style={{ color: isActive ? color : "#94A3B8" }}
                        >
                          Step {i + 1}
                        </span>
                        <span className={`text-sm font-semibold ${isActive ? "text-slate-800" : "text-slate-600"}`}>
                          {step.short}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">{step.label}</div>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right: the flywheel */}
          <div className="flex justify-center">
            <FlywheelCore activeStep={activeStep} />
          </div>
        </div>

        {/* Mobile: vertical list (more compact) */}
        <div className="md:hidden max-w-sm mx-auto mb-12">
          <FlywheelCore activeStep={activeStep} />
          <div className="mt-8 space-y-2">
            {FLYWHEEL_STEPS.map((step, i) => {
              const Icon = STEP_ICONS[i] || Zap;
              const color = STEP_COLORS[i];
              return (
                <div
                  key={step.label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">{step.short}</div>
                    <div className="text-xs text-slate-500 truncate">{step.label}</div>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-400">#{i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue source cards */}
        <AnimatedSection delay={0.2}>
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="text-slate-800">Where Does the </span>
              <span
                style={{
                  background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
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
              <ArrowDown className="w-5 h-5" />
            </motion.div>
            <div
              className="mt-3 px-6 py-3 rounded-full inline-flex items-center gap-3"
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
