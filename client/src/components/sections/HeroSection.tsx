import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Globe2,
} from "lucide-react";
import { SITE } from "@/lib/constants";
import ParticleCanvas from "@/components/ParticleCanvas";

// Stats render their target value directly — the previous count-up animation
// initialized at 0 and caused a "0 / 0 / 0 / $0K" flash on first paint above
// the fold. With no animation the numbers appear instantly and stay stable.
function useCountUp(target: number) {
  return target;
}

function MagneticButton({
  children,
  href,
  onClick,
  className,
  style,
  primary = false,
}: any) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 200, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left - rect.width / 2) * 0.2);
    mouseY.set((e.clientY - rect.top - rect.height / 2) * 0.2);
  };

  const onLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const Comp: any = motion[href ? "a" : "button"];
  return (
    <Comp
      ref={ref as any}
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: springX, y: springY, ...style }}
      className={className}
    >
      {children}
    </Comp>
  );
}

export default function HeroSection() {
  const langCount = useCountUp(48);
  const videoCount = useCountUp(35);
  const continentCount = useCountUp(6);
  const challengeAmount = useCountUp(100);

  return (
    <section className="relative min-h-[94vh] flex items-center justify-center overflow-hidden pt-16 pb-10">
      {/* Particle network background */}
      <ParticleCanvas />

      {/* Animated aurora mesh */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          rotate: [0, 15, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "1100px",
          height: "1100px",
          background:
            "radial-gradient(circle, rgba(34,211,238,0.09) 0%, rgba(124,58,237,0.05) 40%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          rotate: [0, -20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute top-[10%] right-[5%] pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 60%)",
          filter: "blur(50px)",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-[8%] left-[8%] pointer-events-none"
        style={{
          width: "550px",
          height: "550px",
          background:
            "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-5 max-w-5xl mx-auto">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7"
          style={{
            background:
              "linear-gradient(135deg, rgba(8,145,178,0.08), rgba(124,58,237,0.08))",
            border: "1px solid rgba(8,145,178,0.15)",
            backdropFilter: "blur(10px)",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-600 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600" />
          </span>
          <span className="text-xs font-semibold tracking-[0.15em] uppercase text-cyan-700/90">
            Live on Binance Smart Chain
          </span>
        </motion.div>

        {/* Small tagline above heading */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-sm md:text-base font-medium tracking-[0.3em] uppercase text-slate-500 mb-4"
        >
          The Complete DeFi Ecosystem
        </motion.p>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[9rem] font-bold leading-[0.88] mb-7"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="text-slate-800">Turbo</span>
          <motion.span
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="inline-block"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #0891B2, #22D3EE, #7C3AED, #9333EA, #7C3AED, #22D3EE, #0891B2)",
              backgroundSize: "300% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Loop
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="text-lg md:text-2xl text-slate-600 max-w-2xl mx-auto mb-9 leading-relaxed font-light"
        >
          Sustainable yield.{" "}
          <span className="font-normal text-slate-700">
            Transparent by design.
          </span>{" "}
          <span className="font-normal text-slate-700">Open to everyone.</span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <MagneticButton
            href={SITE.mainApp}
            className="group inline-flex items-center gap-2.5 px-9 py-4 rounded-xl font-bold text-base transition-shadow duration-300"
            style={{
              background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
              color: "#ffffff",
              boxShadow:
                "0 10px 40px -8px rgba(8,145,178,0.5), 0 4px 18px -4px rgba(124,58,237,0.3)",
            }}
          >
            Launch App{" "}
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </MagneticButton>
          <MagneticButton
            onClick={() =>
              document
                .querySelector("#reels")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center gap-2 px-9 py-4 rounded-xl font-semibold text-base text-slate-700 transition-all duration-300 hover:text-slate-900"
            style={{
              border: "1px solid rgba(0,0,0,0.1)",
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(12px)",
            }}
          >
            Watch The Movement
          </MagneticButton>
        </motion.div>

        {/* Trust badges row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-10 text-sm"
        >
          <TrustBadge
            icon={ShieldCheck}
            label="Independently Audited"
            href="/security#audit"
          />
          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
          <TrustBadge
            icon={Lock}
            label="LP 100% Locked"
            href="/security#lp-lock"
          />
          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
          <TrustBadge
            icon={CheckCircle2}
            label="Ownership Renounced"
            href="/security#renounced"
          />
          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
          <TrustBadge
            icon={Globe2}
            label="BscScan Verified"
            href="/security#verified"
          />
        </motion.div>

        {/* Live stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-3xl mx-auto"
        >
          <StatCard value={langCount.toString()} suffix="" label="Languages" />
          <StatCard
            value={videoCount.toString()}
            suffix="+"
            label="Videos & Reels"
          />
          <StatCard
            value={continentCount.toString()}
            suffix=""
            label="Continents"
          />
          <StatCard
            value={`$${challengeAmount}`}
            suffix="K"
            label="Bug Bounty"
            highlight
          />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-slate-400 tracking-[0.3em] uppercase">
          Explore
        </span>
        <ChevronDown className="w-4 h-4 text-cyan-600/50 animate-scroll-hint" />
      </motion.div>
    </section>
  );
}

function TrustBadge({
  icon: Icon,
  label,
  href,
}: {
  icon: any;
  label: string;
  href?: string;
}) {
  const inner = (
    <>
      <Icon className="w-4 h-4 text-cyan-600" />
      <span className="text-sm font-medium">{label}</span>
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        className="flex items-center gap-2 text-slate-500 hover:text-cyan-700 transition-colors cursor-pointer"
        aria-label={`${label} — see proof`}
      >
        {inner}
      </a>
    );
  }
  return <div className="flex items-center gap-2 text-slate-500">{inner}</div>;
}

function StatCard({
  value,
  suffix,
  label,
  highlight,
}: {
  value: string;
  suffix: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="group relative p-4 md:p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1"
      style={{
        background: highlight
          ? "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(249,115,22,0.08))"
          : "rgba(255,255,255,0.7)",
        border: highlight
          ? "1px solid rgba(251,191,36,0.3)"
          : "1px solid rgba(0,0,0,0.06)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 20px -4px rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex items-baseline gap-0.5 justify-center">
        <span
          className="text-2xl md:text-3xl font-bold tabular-nums"
          style={{
            color: highlight ? "#D97706" : undefined,
            background: highlight
              ? undefined
              : "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
            WebkitBackgroundClip: highlight ? undefined : "text",
            WebkitTextFillColor: highlight ? undefined : "transparent",
          }}
        >
          {value}
        </span>
        <span
          className="text-xl md:text-2xl font-bold"
          style={{ color: highlight ? "#D97706" : "#7C3AED" }}
        >
          {suffix}
        </span>
      </div>
      <div className="text-[11px] md:text-xs text-slate-500 text-center mt-1 tracking-wider uppercase">
        {label}
      </div>
    </div>
  );
}
