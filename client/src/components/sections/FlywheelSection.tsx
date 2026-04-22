import { motion } from "framer-motion";
import { FLYWHEEL_STEPS, REVENUE_SOURCES } from "@/lib/constants";
import { Droplets, ArrowLeftRight, CreditCard, Wallet, TrendingUp, Clock, RotateCw, Zap } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";

const STEP_COLORS = ["#0891B2", "#059669", "#7C3AED", "#9333EA", "#D97706"];
const STEP_ICONS = [Wallet, Droplets, TrendingUp, Clock, RotateCw];

const REVENUE_ICONS: Record<string, React.ElementType> = {
  Droplets, ArrowLeftRight, CreditCard,
};

/* Circular flywheel node positioned around a ring */
function FlywheelNode({ step, index, total, color, Icon }: {
  step: { label: string; short: string };
  index: number;
  total: number;
  color: string;
  Icon: React.ElementType;
}) {
  // Position nodes around a circle (top-center start, clockwise)
  const angle = (index / total) * 360 - 90; // -90 to start from top
  const rad = (angle * Math.PI) / 180;
  const radius = 42; // percentage of container
  const x = 50 + radius * Math.cos(rad);
  const y = 50 + radius * Math.sin(rad);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 + index * 0.15, duration: 0.5, ease: "easeOut" }}
    >
      <div className="group relative flex flex-col items-center">
        {/* Node circle */}
        <motion.div
          className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center relative cursor-default"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: `2px solid ${color}30`,
            backdropFilter: "blur(16px)",
            boxShadow: `0 8px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.9)`,
          }}
          whileHover={{ scale: 1.1, boxShadow: `0 12px 40px ${color}20, 0 0 0 1px ${color}30` }}
          transition={{ duration: 0.3 }}
        >
          {/* Step number */}
          <div
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
            style={{ background: color, boxShadow: `0 2px 8px ${color}40` }}
          >
            {index + 1}
          </div>
          <Icon className="w-7 h-7 md:w-8 md:h-8" style={{ color }} />
        </motion.div>

        {/* Label */}
        <div className="mt-2 text-center max-w-[100px]">
          <p className="text-xs md:text-sm font-bold text-slate-700">{step.short}</p>
          <p className="text-[10px] text-slate-400 leading-tight hidden md:block">{step.label}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* Mobile vertical step */
function MobileStep({ step, index, color, Icon, isLast }: {
  step: { label: string; short: string };
  index: number;
  color: string;
  Icon: React.ElementType;
  isLast: boolean;
}) {
  return (
    <AnimatedSection delay={index * 0.1}>
      <div className="flex gap-4">
        {/* Left timeline */}
        <div className="flex flex-col items-center">
          <motion.div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative"
            style={{
              background: "rgba(255,255,255,0.85)",
              border: `2px solid ${color}30`,
              backdropFilter: "blur(12px)",
              boxShadow: `0 4px 16px rgba(0,0,0,0.04)`,
            }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
            <div
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
              style={{ background: color }}
            >
              {index + 1}
            </div>
          </motion.div>
          {!isLast && (
            <div className="w-[2px] flex-1 min-h-[20px] my-1 relative overflow-hidden rounded-full">
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, ${color}25, ${STEP_COLORS[(index + 1) % 5]}25)`,
                }}
              />
              <motion.div
                className="absolute w-1.5 h-1.5 rounded-full left-1/2 -translate-x-1/2"
                style={{ background: color, boxShadow: `0 0 4px ${color}` }}
                animate={{ top: ["-4px", "calc(100% + 4px)"] }}
                transition={{ duration: 1.5, delay: index * 0.3, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
        </div>

        {/* Right content */}
        <div className="pb-5">
          <h4 className="text-sm font-bold text-slate-700">{step.short}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{step.label}</p>
        </div>
      </div>
    </AnimatedSection>
  );
}

export default function FlywheelSection() {
  return (
    <section id="flywheel" className="section-spacing relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(8,145,178,0.04) 0%, rgba(124,58,237,0.03) 40%, transparent 70%)",
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
          <div className="flex items-center justify-center gap-2 mb-10">
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "rgba(8,145,178,0.06)",
                border: "1px solid rgba(8,145,178,0.12)",
              }}
              animate={{ boxShadow: ["0 0 0px rgba(8,145,178,0)", "0 0 20px rgba(8,145,178,0.08)", "0 0 0px rgba(8,145,178,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <RotateCw className="w-4 h-4 text-cyan-600" />
              </motion.div>
              <span className="text-xs font-bold text-cyan-600 tracking-widest uppercase">Continuous Loop</span>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Desktop/Tablet: Circular flywheel */}
        <div className="hidden md:block mb-16">
          <div className="relative w-full max-w-[600px] mx-auto" style={{ paddingBottom: "100%", maxHeight: "600px" }}>
            <div className="absolute inset-0">
              {/* Outer ring */}
              <div className="absolute inset-[15%] rounded-full"
                style={{
                  border: "2px dashed rgba(8,145,178,0.12)",
                }}
              />

              {/* Animated rotating ring */}
              <motion.div
                className="absolute inset-[14.5%] rounded-full"
                style={{
                  border: "2px solid transparent",
                  borderTopColor: "rgba(8,145,178,0.25)",
                  borderRightColor: "rgba(124,58,237,0.15)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />

              {/* Center hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "2px solid rgba(8,145,178,0.15)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.06), 0 0 60px rgba(8,145,178,0.06)",
                }}
              >
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-8 h-8 text-cyan-600 mb-1" />
                </motion.div>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Flywheel</span>
              </div>

              {/* Nodes around the ring */}
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
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="md:hidden max-w-sm mx-auto mb-12">
          {FLYWHEEL_STEPS.map((step, i) => {
            const Icon = STEP_ICONS[i] || Zap;
            const color = STEP_COLORS[i];
            return (
              <MobileStep
                key={step.label}
                step={step}
                index={i}
                color={color}
                Icon={Icon}
                isLast={i === FLYWHEEL_STEPS.length - 1}
              />
            );
          })}
          {/* Loop-back indicator */}
          <div className="flex justify-center mt-4">
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "rgba(217,119,6,0.06)",
                border: "1px solid rgba(217,119,6,0.15)",
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[10px] font-bold text-amber-600 tracking-wider">CYCLE REPEATS</span>
            </motion.div>
          </div>
        </div>

        {/* Revenue Sources — 3 premium cards */}
        <AnimatedSection delay={0.3}>
          <div className="text-center mb-8">
            <h3 className="text-lg font-heading font-bold text-slate-800">Where Does the Yield Come From?</h3>
            <p className="text-sm text-slate-500 mt-1">Three real, verifiable revenue streams power the protocol</p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {REVENUE_SOURCES.map((source, i) => {
            const Icon = REVENUE_ICONS[source.icon] || Droplets;
            const colors = ["#0891B2", "#059669", "#9333EA"];
            const c = colors[i];
            return (
              <AnimatedSection key={source.title} delay={0.5 + i * 0.12}>
                <div
                  className="group relative p-6 rounded-2xl text-center overflow-hidden transition-all duration-500 hover:scale-[1.03]"
                  style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    border: `1px solid rgba(255,255,255,0.85)`,
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Top glow */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${c}30, transparent)` }}
                  />
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${c}06 0%, transparent 60%)` }}
                  />

                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: `${c}08`, border: `1px solid ${c}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: c }} />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mb-2">{source.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{source.description}</p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        <AnimatedSection delay={0.8}>
          <p className="text-center mt-10 text-sm text-slate-400">
            All rewards calculated and distributed daily at 00:00 UTC
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
