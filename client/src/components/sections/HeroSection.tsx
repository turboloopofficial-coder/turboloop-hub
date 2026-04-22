import { SITE } from "@/lib/constants";
import { ExternalLink, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

function FloatingOrb({ size, x, y, color, duration }: { size: number; x: string; y: string; color: string; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{ width: size, height: size, left: x, top: y, background: color, filter: `blur(${size * 0.6}px)` }}
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Memoize particles to prevent re-render randomness
  const particles = useMemo(() =>
    [...Array(30)].map((_, i) => ({
      id: i,
      w: Math.random() > 0.5 ? 2 : 1,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      color: i % 3 === 0 ? "rgba(192,132,252,0.6)" : "rgba(34,211,238,0.6)",
      dur: 3 + Math.random() * 5,
      del: Math.random() * 4,
    })), []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Deep space background */}
      <div className="absolute inset-0 bg-[#060a16]">
        {/* Primary radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full" style={{ background: "radial-gradient(circle, rgba(34,211,238,0.15) 0%, rgba(34,211,238,0.05) 40%, transparent 70%)" }} />
        {/* Secondary purple glow */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(192,132,252,0.1) 0%, transparent 60%)" }} />
        {/* Bottom accent */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px]" style={{ background: "linear-gradient(to top, rgba(34,211,238,0.04), transparent)" }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)`, backgroundSize: "80px 80px" }} />

        {/* Floating orbs */}
        {mounted && (
          <>
            <FloatingOrb size={200} x="10%" y="20%" color="rgba(34,211,238,0.07)" duration={8} />
            <FloatingOrb size={150} x="75%" y="15%" color="rgba(192,132,252,0.06)" duration={10} />
            <FloatingOrb size={100} x="60%" y="70%" color="rgba(34,211,238,0.05)" duration={7} />
            <FloatingOrb size={80} x="20%" y="75%" color="rgba(192,132,252,0.05)" duration={9} />
          </>
        )}

        {/* Floating particles */}
        {mounted && particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{ width: p.w, height: p.w, left: p.left, top: p.top, background: p.color }}
            animate={{ y: [0, -40, 0], opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.del }}
          />
        ))}
      </div>

      <div className="relative z-10 container text-center">
        {/* Logo with animated glow ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 relative inline-block"
        >
          {/* Outer glow ring */}
          <div className="absolute inset-0 -m-6 rounded-full animate-pulse-glow" style={{ background: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)" }} />
          {/* Orbital ring */}
          <motion.div
            className="absolute -inset-8 rounded-full border border-cyan-400/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400/60" style={{ boxShadow: "0 0 10px rgba(34,211,238,0.5)" }} />
          </motion.div>
          <motion.div
            className="absolute -inset-14 rounded-full border border-purple-400/5"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-purple-400/40" />
          </motion.div>
          <img
            src={SITE.logo}
            alt="Turbo Loop"
            className="w-32 h-32 md:w-44 md:h-44 object-contain rounded-2xl drop-shadow-[0_0_60px_rgba(34,211,238,0.3)]"
          />
        </motion.div>

        {/* Main heading - fully visible, no animation delay hiding */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tight leading-[1.1]">
            <span className="block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              The Complete
            </span>
            <span
              className="block mt-2"
              style={{
                background: "linear-gradient(135deg, #22D3EE 0%, #A78BFA 50%, #C084FC 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 30px rgba(34,211,238,0.4))",
              }}
            >
              DeFi Ecosystem
            </span>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-light tracking-wide"
        >
          {SITE.tagline}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-14"
        >
          <a href={SITE.mainApp} target="_blank" rel="noopener noreferrer">
            <button className="btn-premium flex items-center gap-2 text-lg">
              Launch App <ExternalLink className="h-5 w-5" />
            </button>
          </a>
          <a href="#ecosystem">
            <button className="btn-outline-premium flex items-center gap-2 text-lg">
              Explore Ecosystem
            </button>
          </a>
        </motion.div>

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <span className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass text-sm text-cyan-300/80 tracking-wide">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
            </span>
            {SITE.subtitle}
          </span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <span className="text-xs text-gray-600 tracking-widest uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="h-5 w-5 text-cyan-400/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
