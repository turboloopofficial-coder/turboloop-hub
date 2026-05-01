import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Droplets, ArrowLeftRight, CreditCard, Wallet, TrendingUp, Layers,
  RotateCw, Sparkles, Users, DollarSign, Gem, Cpu, Target,
  Infinity as InfinityIcon, Zap, CheckCircle2, Shield,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type Node = {
  n: number;
  label: string;
  sub: string;
  color: string;
  softColor: string; // lighter version for bg tints
  icon: React.ElementType;
};

const FLYWHEEL_NODES: Node[] = [
  { n: 1, label: "Users",           sub: "Swap & Buy Crypto",      color: "#0891B2", softColor: "#CFFAFE", icon: Users },
  { n: 2, label: "Fees Generated",  sub: "Trading + TX Fees",      color: "#D97706", softColor: "#FED7AA", icon: DollarSign },
  { n: 3, label: "Liquidity Pool",  sub: "USDT / USDC",            color: "#059669", softColor: "#A7F3D0", icon: Droplets },
  { n: 4, label: "DeFi Strategies", sub: "Staking · Lending · LP", color: "#7C3AED", softColor: "#DDD6FE", icon: Layers },
  { n: 5, label: "Rewards",         sub: "Yield Distributed",      color: "#10B981", softColor: "#A7F3D0", icon: Gem },
];

type Tab = {
  key: "lp" | "swap" | "buy";
  tag: string;
  tabLabel: string;
  tagColor: string;
  title: string;
  titleColor: string;
  desc: string;
  flow: Array<{ label: string; icon: React.ElementType; color: string }>;
};

const TABS: Tab[] = [
  {
    key: "lp",
    tag: "Core Engine",
    tabLabel: "LP Rewards",
    tagColor: "#059669",
    title: "Liquidity Pool Rewards",
    titleColor: "#059669",
    desc:
      "Your deposited USDT/USDC is automatically deployed into high-performing DeFi yield farming strategies on BNB Smart Chain — including liquidity provision, staking, and lending protocols.",
    flow: [
      { label: "User Deposits",   icon: Wallet,     color: "#059669" },
      { label: "DeFi Strategies", icon: Cpu,        color: "#7C3AED" },
      { label: "Yield Generated", icon: TrendingUp, color: "#10B981" },
    ],
  },
  {
    key: "swap",
    tag: "Fueling the Flywheel",
    tabLabel: "Swap Fees",
    tagColor: "#0891B2",
    title: "Turbo Swap Trading Fees",
    titleColor: "#0891B2",
    desc:
      "Every token swap through Turbo Swap generates a small trading fee. This fee flows directly into the Liquidity Pool in real-time, increasing its depth and yield potential with every single swap.",
    flow: [
      { label: "User Swaps",     icon: ArrowLeftRight, color: "#0891B2" },
      { label: "Fee Generated",  icon: DollarSign,     color: "#D97706" },
      { label: "Directly to LP", icon: Droplets,       color: "#059669" },
    ],
  },
  {
    key: "buy",
    tag: "On-Ramping Value",
    tabLabel: "Buy Fees",
    tagColor: "#D97706",
    title: "Turbo Buy Transaction Fees",
    titleColor: "#D97706",
    desc:
      "Each fiat-to-crypto purchase through Turbo Buy includes a small processing fee. These funds are channeled directly into the core Liquidity Pool, enhancing the protocol's earning power instantly.",
    flow: [
      { label: "User Buys Crypto", icon: CreditCard, color: "#D97706" },
      { label: "Fee Generated",    icon: DollarSign, color: "#D97706" },
      { label: "Directly to LP",   icon: Droplets,   color: "#059669" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Flow row (used inside each tab panel)
// ---------------------------------------------------------------------------

function FlowIcon({ icon: Icon, color, label }: { icon: React.ElementType; color: string; label: string }) {
  return (
    <div className="flex flex-col items-center shrink-0 text-center" style={{ width: 96 }}>
      <motion.div
        whileHover={{ scale: 1.06, y: -2 }}
        className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
        style={{
          background: "white",
          border: `2px solid ${color}`,
          boxShadow: `0 12px 28px -8px ${color}50, 0 0 0 6px ${color}12`,
        }}
      >
        <Icon className="w-8 h-8" style={{ color }} />
        {/* outer subtle halo */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{ boxShadow: [`0 0 0 0 ${color}40`, `0 0 0 10px ${color}00`] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
      </motion.div>
      <div className="mt-3 text-xs font-semibold text-slate-700 leading-tight">{label}</div>
    </div>
  );
}

function FlowArrow({ color }: { color: string }) {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ minWidth: 30 }}>
      <svg width="100%" height="14" viewBox="0 0 100 14" preserveAspectRatio="none" className="max-w-[120px]">
        <line x1="0" y1="7" x2="86" y2="7" stroke={color} strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="3 4" />
        <motion.circle
          r="4"
          cy="7"
          fill={color}
          animate={{ cx: [0, 86, 86] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear", times: [0, 0.85, 1] }}
        />
        <polygon points="86,2 94,7 86,12" fill={color} />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The flywheel — light theme, crafted
// ---------------------------------------------------------------------------

function Flywheel({ activeNode }: { activeNode: number }) {
  const SIZE = 480;
  const CENTER = SIZE / 2;
  const RADIUS = 175;

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0">
        <defs>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          {FLYWHEEL_NODES.map((n, i) => {
            const next = FLYWHEEL_NODES[(i + 1) % FLYWHEEL_NODES.length];
            return (
              <linearGradient key={i} id={`seg-${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={n.color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={next.color} stopOpacity="0.35" />
              </linearGradient>
            );
          })}
        </defs>

        {/* Outer dashed ring */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS + 22} fill="none" stroke="rgba(15,23,42,0.1)" strokeWidth="1" strokeDasharray="2 5" />

        {/* Colored segments between each node */}
        {FLYWHEEL_NODES.map((_, i) => {
          const startAngle = (i / FLYWHEEL_NODES.length) * 360 - 90;
          const endAngle = ((i + 1) / FLYWHEEL_NODES.length) * 360 - 90;
          const sr = (startAngle * Math.PI) / 180;
          const er = (endAngle * Math.PI) / 180;
          const x1 = CENTER + RADIUS * Math.cos(sr);
          const y1 = CENTER + RADIUS * Math.sin(sr);
          const x2 = CENTER + RADIUS * Math.cos(er);
          const y2 = CENTER + RADIUS * Math.sin(er);
          return (
            <path
              key={`seg-path-${i}`}
              d={`M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke={`url(#seg-${i})`}
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}

        {/* Thin inner guide ring */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS - 40} fill="none" stroke="rgba(15,23,42,0.04)" strokeWidth="1" />

        {/* Flowing particles */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={`flow-${i}`}
            r="4"
            fill="#0891B2"
            filter="url(#softGlow)"
            animate={{
              cx: Array.from({ length: 73 }, (_, k) => CENTER + RADIUS * Math.cos(((k * 5 - 90 + i * 72) % 360) * Math.PI / 180)),
              cy: Array.from({ length: 73 }, (_, k) => CENTER + RADIUS * Math.sin(((k * 5 - 90 + i * 72) % 360) * Math.PI / 180)),
            }}
            transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </svg>

      {/* Center hub */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 220, delay: 0.2 }}
        className="absolute flex flex-col items-center justify-center rounded-full"
        style={{
          width: 170,
          height: 170,
          left: CENTER - 85,
          top: CENTER - 85,
          background: "radial-gradient(circle, #ffffff 0%, #f0fdff 55%, #faf5ff 100%)",
          border: "1px solid rgba(8,145,178,0.15)",
          boxShadow:
            "0 25px 60px -10px rgba(8,145,178,0.2), 0 0 70px rgba(124,58,237,0.08), inset 0 2px 10px rgba(255,255,255,0.9)",
        }}
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
          style={{
            background: "linear-gradient(135deg, rgba(8,145,178,0.15), rgba(124,58,237,0.1))",
            border: "1.5px solid rgba(8,145,178,0.2)",
          }}
        >
          <InfinityIcon className="w-7 h-7" style={{ color: "#0891B2" }} strokeWidth={2.5} />
        </motion.div>
        <span
          className="text-[10px] font-bold tracking-[0.3em]"
          style={{
            background: "linear-gradient(135deg, #0891B2, #7C3AED)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          TURBO LOOP
        </span>
        <span className="text-[8px] text-slate-400 tracking-[0.2em] mt-0.5">FLYWHEEL</span>
      </motion.div>

      {/* Nodes (with outside labels) */}
      {FLYWHEEL_NODES.map((node, i) => {
        const angle = (i / FLYWHEEL_NODES.length) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const x = CENTER + RADIUS * Math.cos(rad);
        const y = CENTER + RADIUS * Math.sin(rad);
        const isActive = activeNode === i;

        // Label placement (push outward from center)
        const labelIsLeft = Math.cos(rad) < -0.1;
        const labelIsRight = Math.cos(rad) > 0.1;
        const labelR = RADIUS + 78;
        const lx = CENTER + labelR * Math.cos(rad);
        const ly = CENTER + labelR * Math.sin(rad);

        return (
          <div key={node.label}>
            {/* Node — gradient-filled "marble" */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 + i * 0.08, type: "spring", stiffness: 220 }}
              className="absolute flex items-center justify-center rounded-full"
              style={{
                left: x - 34,
                top: y - 34,
                width: 68,
                height: 68,
                background: `radial-gradient(circle at 30% 30%, ${node.softColor}, ${node.color})`,
                boxShadow: isActive
                  ? `0 0 0 5px ${node.color}25, 0 12px 35px -5px ${node.color}, inset -2px -2px 12px ${node.color}90, inset 3px 3px 10px rgba(255,255,255,0.35)`
                  : `0 8px 24px -4px ${node.color}70, inset -2px -2px 10px ${node.color}70, inset 3px 3px 10px rgba(255,255,255,0.3)`,
              }}
              // Active-state pulse uses its own per-animation transition (duration: 0.8s),
              // separate from the mount transition above (the spring with stagger delay).
              // Previously this used a second `transition` JSX prop which is illegal —
              // duplicate attribute, the first was silently overwritten by the second.
              animate={
                isActive
                  ? { scale: [1, 1.12, 1], transition: { duration: 0.8 } }
                  : { scale: 1, transition: { duration: 0.8 } }
              }
            >
              <span
                className="font-bold text-2xl tabular-nums"
                style={{
                  color: "white",
                  textShadow: `0 2px 4px ${node.color}`,
                }}
              >
                {node.n}
              </span>
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.7 }}
                  transition={{ duration: 1.2 }}
                  style={{ border: `2px solid ${node.color}` }}
                />
              )}
            </motion.div>

            {/* Label on the outside */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="absolute"
              style={{
                left: labelIsLeft ? lx - 132 : labelIsRight ? lx - 8 : lx - 70,
                top: ly - 18,
                width: 140,
                textAlign: labelIsLeft ? "right" : labelIsRight ? "left" : "center",
              }}
            >
              <div className="text-[11px] font-bold tracking-wider uppercase leading-tight" style={{ color: node.color }}>
                {node.label}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{node.sub}</div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

function MobileFlywheelList({ activeNode }: { activeNode: number }) {
  return (
    <div className="max-w-sm mx-auto space-y-2">
      {FLYWHEEL_NODES.map((node, i) => {
        const isActive = activeNode === i;
        const Icon = node.icon;
        return (
          <motion.div
            key={node.label}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: isActive ? `${node.softColor}` : "white",
              border: `1px solid ${isActive ? node.color : "rgba(15,23,42,0.06)"}`,
              boxShadow: isActive ? `0 6px 24px -6px ${node.color}55` : "0 2px 8px -2px rgba(0,0,0,0.04)",
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white font-bold"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${node.softColor}, ${node.color})`,
                boxShadow: `0 4px 12px -2px ${node.color}60, inset -1px -1px 6px ${node.color}80`,
                textShadow: `0 1px 2px ${node.color}`,
              }}
            >
              {node.n}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold tracking-wider uppercase" style={{ color: node.color }}>
                {node.label}
              </div>
              <div className="text-xs text-slate-500 truncate">{node.sub}</div>
            </div>
            <Icon className="w-4 h-4 text-slate-300 shrink-0" />
          </motion.div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------

export default function FlywheelSection() {
  const [activeTab, setActiveTab] = useState<Tab["key"]>("lp");
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveNode((n) => (n + 1) % FLYWHEEL_NODES.length), 1800);
    return () => clearInterval(t);
  }, []);

  const tab = TABS.find((t) => t.key === activeTab)!;

  return (
    <section id="flywheel" className="relative py-24 md:py-32 overflow-hidden">
      {/* Subtle dotted pattern bg */}
      <div
        className="absolute inset-0 pointer-events-none opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(rgba(15,23,42,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at center, black 35%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 80%)",
        }}
      />
      {/* Ambient color glows */}
      <div
        className="absolute top-0 left-1/4 w-[700px] h-[700px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(8,145,178,0.08) 0%, transparent 55%)" }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[700px] h-[700px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 55%)" }}
      />

      <div className="container relative z-10">
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-6"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, rgba(8,145,178,0.1), rgba(124,58,237,0.1))",
              border: "1px solid rgba(8,145,178,0.25)",
              boxShadow: "0 0 30px rgba(8,145,178,0.15)",
            }}
          >
            <Target className="w-3.5 h-3.5 text-cyan-700" />
            <span className="text-xs font-bold text-cyan-800 tracking-[0.3em] uppercase">Revenue Model</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.02] mb-5 tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="text-slate-900">How Turbo Loop</span>
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 50%, #EC4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Generates Income
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-base md:text-lg text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Three interconnected revenue streams power the Turbo Loop flywheel — creating a self-sustaining ecosystem of yield and growth.
        </motion.p>

        {/* Tabs */}
        <div className="flex justify-center gap-2 md:gap-3 mb-10 flex-wrap">
          {TABS.map((t) => {
            const active = t.key === activeTab;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="group relative px-6 md:px-8 py-3 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300"
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${t.titleColor}16, ${t.titleColor}08)`
                    : "rgba(255,255,255,0.75)",
                  border: `1.5px solid ${active ? t.titleColor : "rgba(15,23,42,0.08)"}`,
                  color: active ? t.titleColor : "#475569",
                  boxShadow: active
                    ? `0 10px 30px -8px ${t.titleColor}40, 0 0 0 4px ${t.titleColor}10`
                    : "0 2px 10px -2px rgba(0,0,0,0.04)",
                }}
              >
                <span className="relative z-10">{t.tabLabel}</span>
                {active && (
                  <motion.div
                    layoutId="tabUnderline"
                    className="absolute bottom-1.5 left-6 right-6 h-[2px] rounded-full"
                    style={{ background: t.titleColor }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Active tab panel — premium light card */}
        <div className="max-w-5xl mx-auto mb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="relative p-8 md:p-12 rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)",
                border: "1px solid rgba(15,23,42,0.06)",
                boxShadow: `0 30px 80px -20px ${tab.titleColor}30, 0 10px 25px -10px rgba(0,0,0,0.08)`,
              }}
            >
              {/* corner glow */}
              <div
                className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${tab.titleColor}15 0%, transparent 65%)`,
                }}
              />
              {/* subtle top accent */}
              <div
                className="absolute top-0 left-20 right-20 h-[2px] rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${tab.titleColor}80, transparent)` }}
              />

              <div className="grid md:grid-cols-5 gap-10 items-center relative z-10">
                {/* Left: narrative */}
                <div className="md:col-span-2">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
                    style={{
                      background: `${tab.tagColor}10`,
                      border: `1px solid ${tab.tagColor}30`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: tab.tagColor }} />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: tab.tagColor }}>
                      {tab.tag}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight mb-3" style={{ color: tab.titleColor }}>
                    {tab.title}
                  </h3>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">{tab.desc}</p>
                </div>

                {/* Right: flow diagram */}
                <div className="md:col-span-3">
                  <div className="flex items-center justify-between px-2">
                    <FlowIcon {...tab.flow[0]} />
                    <FlowArrow color={tab.titleColor} />
                    <FlowIcon {...tab.flow[1]} />
                    <FlowArrow color={tab.titleColor} />
                    <FlowIcon {...tab.flow[2]} />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Flywheel section — new header */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-14 md:w-24" style={{ background: "linear-gradient(90deg, transparent, rgba(8,145,178,0.4))" }} />
          <motion.div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, rgba(8,145,178,0.08), rgba(124,58,237,0.08))",
              border: "1px solid rgba(8,145,178,0.2)",
            }}
            animate={{ boxShadow: ["0 0 0 rgba(8,145,178,0)", "0 0 28px rgba(8,145,178,0.25)", "0 0 0 rgba(8,145,178,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
              <RotateCw className="w-3.5 h-3.5 text-cyan-700" />
            </motion.div>
            <span className="text-[10px] font-bold text-cyan-800 tracking-[0.3em] uppercase">Continuous Loop</span>
          </motion.div>
          <div className="h-px w-14 md:w-24" style={{ background: "linear-gradient(270deg, transparent, rgba(8,145,178,0.4))" }} />
        </div>

        <motion.h3
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-2 tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="text-slate-900">The </span>
          <span
            style={{
              background: "linear-gradient(135deg, #0891B2 0%, #60A5FA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Velocity Cycle
          </span>
        </motion.h3>
        <p className="text-center text-xs md:text-sm text-slate-500 tracking-[0.25em] uppercase mb-16">
          A self-sustaining loop of value
        </p>

        <div className="hidden md:flex justify-center">
          <Flywheel activeNode={activeNode} />
        </div>
        <div className="md:hidden">
          <MobileFlywheelList activeNode={activeNode} />
        </div>

        {/* Bottom stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-20 max-w-4xl mx-auto"
        >
          {[
            { label: "Revenue Streams",  value: "3",     unit: "",  icon: Sparkles, color: "#0891B2" },
            { label: "Distribution",     value: "Daily", unit: "",  icon: Zap,      color: "#10B981" },
            { label: "External Funding", value: "0",     unit: "%", icon: Shield,   color: "#D97706" },
            { label: "Loop Status",      value: "Live",  unit: "",  icon: CheckCircle2, color: "#059669" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative p-5 rounded-2xl"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)",
                  border: `1px solid ${stat.color}25`,
                  boxShadow: `0 10px 25px -8px ${stat.color}18, 0 2px 8px -2px rgba(0,0,0,0.04)`,
                }}
              >
                <div
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.color}12` }}
                >
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl md:text-4xl font-bold tabular-nums" style={{ color: stat.color }}>
                    {stat.value}
                  </span>
                  {stat.unit && <span className="text-2xl font-bold" style={{ color: stat.color }}>{stat.unit}</span>}
                </div>
                <div className="text-[11px] text-slate-500 mt-2 tracking-[0.15em] uppercase font-semibold">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
