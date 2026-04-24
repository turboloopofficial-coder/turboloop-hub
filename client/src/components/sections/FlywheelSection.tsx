import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Droplets, ArrowLeftRight, CreditCard, Wallet, TrendingUp, Layers,
  RotateCw, Zap, ArrowRight, Users, DollarSign, Gem, Sparkles,
  Coins, Cpu, Target, ChevronRight,
} from "lucide-react";

// -- Flywheel node data (matches the main-site Turbo Loop flywheel)
type Node = {
  n: number;
  label: string;
  sub: string;
  color: string;
  icon: React.ElementType;
};

const FLYWHEEL_NODES: Node[] = [
  { n: 1, label: "Users",            sub: "Swap & Buy Crypto",   color: "#22D3EE", icon: Users },      // cyan
  { n: 2, label: "Fees Generated",   sub: "Trading + TX Fees",   color: "#F59E0B", icon: DollarSign }, // orange
  { n: 3, label: "Liquidity Pool",   sub: "USDT / USDC",         color: "#10B981", icon: Droplets },   // green
  { n: 4, label: "DeFi Strategies",  sub: "Staking · Lending · LP", color: "#A855F7", icon: Layers }, // purple
  { n: 5, label: "Rewards",          sub: "Yield Distributed",   color: "#34D399", icon: Gem },        // light green
];

// -- Revenue tabs (three income streams, matches main site)
type Tab = {
  key: "lp" | "swap" | "buy";
  badge: string;
  badgeColor: string;
  title: string;
  titleColor: string;
  desc: string;
  flow: Array<{ label: string; icon: React.ElementType; color: string }>;
};

const TABS: Tab[] = [
  {
    key: "lp",
    badge: "Core Engine",
    badgeColor: "#10B981",
    title: "Liquidity Pool Rewards",
    titleColor: "#10B981",
    desc:
      "Your deposited USDT/USDC is automatically deployed into high-performing DeFi yield farming strategies on BNB Smart Chain — including liquidity provision, staking, and lending protocols.",
    flow: [
      { label: "User Deposits",    icon: Wallet,     color: "#10B981" },
      { label: "DeFi Strategies",  icon: Cpu,        color: "#A855F7" },
      { label: "Yield Generated",  icon: TrendingUp, color: "#10B981" },
    ],
  },
  {
    key: "swap",
    badge: "Fueling the Flywheel",
    badgeColor: "#22D3EE",
    title: "Turbo Swap Trading Fees",
    titleColor: "#22D3EE",
    desc:
      "Every token swap through Turbo Swap generates a small trading fee. This fee flows directly into the Liquidity Pool in real-time, increasing its depth and yield potential with every single swap.",
    flow: [
      { label: "User Swaps",       icon: ArrowLeftRight, color: "#22D3EE" },
      { label: "Fee Generated",    icon: DollarSign,     color: "#F59E0B" },
      { label: "Directly to LP",   icon: Droplets,       color: "#10B981" },
    ],
  },
  {
    key: "buy",
    badge: "On-Ramping Value",
    badgeColor: "#F59E0B",
    title: "Turbo Buy Transaction Fees",
    titleColor: "#F59E0B",
    desc:
      "Each fiat-to-crypto purchase through Turbo Buy includes a small processing fee. These funds are channeled directly into the core Liquidity Pool, enhancing the protocol's earning power instantly.",
    flow: [
      { label: "User Buys Crypto", icon: CreditCard, color: "#F59E0B" },
      { label: "Fee Generated",    icon: DollarSign, color: "#F59E0B" },
      { label: "Directly to LP",   icon: Droplets,   color: "#10B981" },
    ],
  },
];

/** A single icon circle in the flow row */
function FlowIcon({ icon: Icon, color, label }: { icon: React.ElementType; color: string; label: string }) {
  return (
    <div className="flex flex-col items-center shrink-0 text-center">
      <motion.div
        whileHover={{ scale: 1.08 }}
        className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center relative"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: `2px solid ${color}`,
          boxShadow: `0 0 24px -4px ${color}80, inset 0 0 20px ${color}15`,
        }}
      >
        <Icon className="w-7 h-7 md:w-8 md:h-8" style={{ color }} />
        {/* Inner glow dot */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ boxShadow: `inset 0 0 20px ${color}35` }}
        />
      </motion.div>
      <div className="mt-3 text-[11px] md:text-xs text-white/70 whitespace-pre-line font-medium tracking-wide" style={{ maxWidth: 90 }}>
        {label}
      </div>
    </div>
  );
}

/** Animated dashed arrow between two icons */
function FlowArrow({ color }: { color: string }) {
  return (
    <div className="flex-1 flex items-center justify-center px-2 md:px-4" style={{ minWidth: 40 }}>
      <svg width="100%" height="14" viewBox="0 0 100 14" preserveAspectRatio="none" className="max-w-[120px]">
        <motion.line
          x1="0" y1="7" x2="86" y2="7"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        {/* Flowing particle */}
        <motion.circle
          r="3"
          cy="7"
          fill={color}
          animate={{ cx: [0, 86, 86] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear", times: [0, 0.85, 1] }}
        />
        {/* Arrow head */}
        <polygon points="86,2 94,7 86,12" fill={color} opacity="0.9" />
      </svg>
    </div>
  );
}

/** The circular flywheel — matches the main site's style */
function CircularFlywheel({ activeNode }: { activeNode: number }) {
  const SIZE = 460;
  const CENTER = SIZE / 2;
  const RADIUS = 170;

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0">
        <defs>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Main dashed ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />

        {/* Colored segments between nodes */}
        {FLYWHEEL_NODES.map((node, i) => {
          const startAngle = (i / FLYWHEEL_NODES.length) * 360 - 90;
          const endAngle = ((i + 1) / FLYWHEEL_NODES.length) * 360 - 90;
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          const x1 = CENTER + RADIUS * Math.cos(startRad);
          const y1 = CENTER + RADIUS * Math.sin(startRad);
          const x2 = CENTER + RADIUS * Math.cos(endRad);
          const y2 = CENTER + RADIUS * Math.sin(endRad);
          const nextNode = FLYWHEEL_NODES[(i + 1) % FLYWHEEL_NODES.length];

          return (
            <g key={`segment-${i}`}>
              <path
                d={`M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke={`url(#segGrad-${i})`}
                strokeWidth="1.5"
                opacity="0.4"
              />
              <defs>
                <linearGradient id={`segGrad-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={node.color} />
                  <stop offset="100%" stopColor={nextNode.color} />
                </linearGradient>
              </defs>
            </g>
          );
        })}

        {/* Flowing dots traveling clockwise along the ring */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={`flow-${i}`}
            r="3.5"
            fill="#22D3EE"
            filter="url(#nodeGlow)"
            animate={{
              cx: Array.from({ length: 73 }, (_, k) => CENTER + RADIUS * Math.cos(((k * 5 - 90 + i * 72) % 360) * Math.PI / 180)),
              cy: Array.from({ length: 73 }, (_, k) => CENTER + RADIUS * Math.sin(((k * 5 - 90 + i * 72) % 360) * Math.PI / 180)),
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </svg>

      {/* Center label */}
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{
          left: CENTER - 90,
          top: CENTER - 40,
          width: 180,
          height: 80,
        }}
      >
        <div
          className="text-[11px] font-bold tracking-[0.3em] uppercase text-center leading-tight"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Turbo Loop
        </div>
        <div
          className="text-[11px] font-bold tracking-[0.3em] uppercase text-center leading-tight"
          style={{ color: "rgba(255,255,255,0.18)" }}
        >
          Flywheel
        </div>
      </div>

      {/* Nodes */}
      {FLYWHEEL_NODES.map((node, i) => {
        const angle = (i / FLYWHEEL_NODES.length) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const x = CENTER + RADIUS * Math.cos(rad);
        const y = CENTER + RADIUS * Math.sin(rad);
        const isActive = activeNode === i;

        // Position labels on the outside of the ring
        const labelAngle = angle;
        const labelIsLeft = labelAngle > 90 && labelAngle < 270;
        const labelRadius = RADIUS + 70;
        const lx = CENTER + labelRadius * Math.cos(rad);
        const ly = CENTER + labelRadius * Math.sin(rad);

        return (
          <div key={node.label}>
            {/* Node circle */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 220 }}
              className="absolute flex items-center justify-center rounded-full"
              style={{
                left: x - 32,
                top: y - 32,
                width: 64,
                height: 64,
                background: "#0B1220",
                border: `2.5px solid ${node.color}`,
                boxShadow: isActive
                  ? `0 0 36px ${node.color}, 0 0 12px ${node.color}, inset 0 0 14px ${node.color}40`
                  : `0 0 18px ${node.color}55, inset 0 0 10px ${node.color}25`,
              }}
              animate={isActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <span
                className="font-bold text-2xl tabular-nums"
                style={{
                  color: node.color,
                  textShadow: `0 0 10px ${node.color}70`,
                }}
              >
                {node.n}
              </span>
            </motion.div>

            {/* Label (positioned based on angle) */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="absolute"
              style={{
                left: labelIsLeft ? lx - 130 : lx,
                top: ly - 18,
                width: 130,
                textAlign: labelIsLeft ? "right" : "left",
              }}
            >
              <div
                className="text-xs font-bold tracking-wider uppercase leading-tight"
                style={{ color: node.color }}
              >
                {node.label}
              </div>
              <div className="text-[10px] text-white/45 mt-0.5 leading-tight">
                {node.sub}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

/** Mobile layout: vertical stack of nodes */
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
              background: isActive ? `${node.color}18` : "rgba(255,255,255,0.02)",
              border: `1px solid ${isActive ? node.color : "rgba(255,255,255,0.06)"}${isActive ? "" : ""}`,
              boxShadow: isActive ? `0 6px 24px -6px ${node.color}60` : "none",
            }}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-base"
              style={{
                background: "#0B1220",
                border: `2px solid ${node.color}`,
                color: node.color,
                boxShadow: `0 0 14px ${node.color}50, inset 0 0 8px ${node.color}20`,
              }}
            >
              {node.n}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold tracking-wider uppercase" style={{ color: node.color }}>
                {node.label}
              </div>
              <div className="text-xs text-white/50 truncate">{node.sub}</div>
            </div>
            <Icon className="w-4 h-4 text-white/30 shrink-0" />
          </motion.div>
        );
      })}
    </div>
  );
}

export default function FlywheelSection() {
  const [activeTab, setActiveTab] = useState<Tab["key"]>("lp");
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveNode((n) => (n + 1) % FLYWHEEL_NODES.length);
    }, 1800);
    return () => clearInterval(t);
  }, []);

  const tab = TABS.find((t) => t.key === activeTab)!;

  return (
    <section
      id="flywheel"
      className="relative py-20 md:py-28 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top, #0F172A 0%, #0A0F1E 50%, #030712 100%)",
      }}
    >
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black 50%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 50%, transparent 100%)",
        }}
      />
      {/* Ambient glows */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 60%)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 60%)" }}
      />

      <div className="container relative z-10">
        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-6"
        >
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-md"
            style={{
              background: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.35)",
              boxShadow: "0 0 20px rgba(34,211,238,0.15)",
            }}
          >
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-300 tracking-[0.3em] uppercase">Revenue Model</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-5"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="text-white">How Turbo Loop</span>
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #22D3EE 0%, #A855F7 50%, #EC4899 100%)",
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
          className="text-center text-sm md:text-base text-white/50 max-w-2xl mx-auto mb-10 font-mono"
        >
          Three interconnected revenue streams power the Turbo Loop flywheel — creating a self-sustaining ecosystem of yield and growth.
        </motion.p>

        {/* Tab selector */}
        <div className="flex justify-center gap-2 md:gap-3 mb-8 flex-wrap">
          {TABS.map((t) => {
            const active = t.key === activeTab;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="px-5 md:px-7 py-3 rounded-lg text-xs md:text-sm font-bold tracking-wider uppercase font-mono transition-all duration-300"
                style={{
                  background: active ? `${t.titleColor}12` : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${active ? t.titleColor : "rgba(255,255,255,0.08)"}`,
                  color: active ? t.titleColor : "rgba(255,255,255,0.55)",
                  boxShadow: active ? `0 0 25px ${t.titleColor}35, inset 0 0 15px ${t.titleColor}10` : "none",
                }}
              >
                {t.key === "lp" && "LP Rewards"}
                {t.key === "swap" && "Swap Fees"}
                {t.key === "buy" && "Buy Fees"}
              </button>
            );
          })}
        </div>

        {/* Active tab panel */}
        <div className="max-w-5xl mx-auto mb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="relative p-6 md:p-10 rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(3,7,18,0.95) 100%)",
                border: `1px solid ${tab.titleColor}30`,
                boxShadow: `0 20px 60px -15px ${tab.titleColor}30, inset 0 0 40px ${tab.titleColor}06`,
              }}
            >
              {/* Corner accent */}
              <div
                className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none opacity-40"
                style={{ background: `radial-gradient(circle, ${tab.titleColor}25 0%, transparent 70%)` }}
              />

              <div className="grid md:grid-cols-5 gap-8 items-center relative z-10">
                {/* Left: badge + title + desc */}
                <div className="md:col-span-2">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
                    style={{
                      background: `${tab.badgeColor}12`,
                      border: `1px solid ${tab.badgeColor}50`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: tab.badgeColor }} />
                    <span className="text-[10px] font-bold tracking-[0.25em] uppercase font-mono" style={{ color: tab.badgeColor }}>
                      {tab.badge}
                    </span>
                  </div>

                  <h3
                    className="text-2xl md:text-3xl font-bold mb-3 leading-tight"
                    style={{ color: tab.titleColor }}
                  >
                    {tab.title}
                  </h3>
                  <p className="text-sm md:text-base text-white/60 leading-relaxed">{tab.desc}</p>
                </div>

                {/* Right: Flow diagram */}
                <div className="md:col-span-3">
                  <div className="flex items-center justify-between">
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

        {/* Divider + flywheel title */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-cyan-500/50" />
          <motion.div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{
              background: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.3)",
            }}
            animate={{ boxShadow: ["0 0 0 rgba(34,211,238,0)", "0 0 25px rgba(34,211,238,0.3)", "0 0 0 rgba(34,211,238,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
            </motion.div>
            <span className="text-[10px] font-bold text-cyan-300 tracking-[0.3em] uppercase font-mono">Continuous Loop</span>
          </motion.div>
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-cyan-500/50" />
        </div>

        <motion.h3
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="text-white">Turbo Loop </span>
          <span
            style={{
              background: "linear-gradient(135deg, #22D3EE 0%, #60A5FA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Flywheel
          </span>
        </motion.h3>
        <p className="text-center text-xs md:text-sm text-white/40 tracking-[0.2em] uppercase mb-14 font-mono">
          A Self-Sustaining Loop Of Value
        </p>

        {/* Flywheel diagram */}
        <div className="hidden md:block">
          <CircularFlywheel activeNode={activeNode} />
        </div>
        <div className="md:hidden">
          <MobileFlywheelList activeNode={activeNode} />
        </div>

        {/* Bottom metrics row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mt-16 max-w-4xl mx-auto"
        >
          {[
            { label: "Revenue Streams", value: "3", unit: "", color: "#22D3EE" },
            { label: "Distribution", value: "Daily", unit: "", color: "#10B981" },
            { label: "External Funding", value: "0", unit: "%", color: "#F59E0B" },
            { label: "Loop Status", value: "Live", unit: "", color: "#34D399" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl text-center"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${stat.color}30`,
                boxShadow: `inset 0 0 20px ${stat.color}08`,
              }}
            >
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-2xl md:text-3xl font-bold tabular-nums" style={{ color: stat.color }}>
                  {stat.value}
                </span>
                {stat.unit && <span className="text-lg font-bold" style={{ color: stat.color }}>{stat.unit}</span>}
              </div>
              <div className="text-[10px] md:text-[11px] text-white/40 mt-1 tracking-widest uppercase font-mono">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
