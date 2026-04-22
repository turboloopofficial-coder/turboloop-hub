import { motion } from "framer-motion";
import { ExternalLink, ChevronDown } from "lucide-react";
import { SITE } from "@/lib/constants";
import ParticleCanvas from "@/components/ParticleCanvas";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle network background */}
      <ParticleCanvas />

      {/* Large radial gradient orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "900px",
          height: "900px",
          background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, rgba(34,211,238,0.02) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      {/* Secondary purple accent */}
      <div
        className="absolute top-[20%] right-[15%] pointer-events-none"
        style={{
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(192,132,252,0.05) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-5 max-w-4xl mx-auto">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: "rgba(34,211,238,0.06)",
            border: "1px solid rgba(34,211,238,0.12)",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span className="text-xs font-semibold tracking-[0.15em] uppercase text-cyan-300/80">
            The Complete DeFi Ecosystem
          </span>
        </motion.div>

        {/* Main heading — massive */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-[0.9] mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="text-white">Turbo</span>
          <span
            style={{
              background: "linear-gradient(135deg, #22D3EE 0%, #A78BFA 60%, #C084FC 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Loop
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          {SITE.tagline}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href={SITE.mainApp}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-base transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #22D3EE, #06b6d4)",
              color: "#040810",
              boxShadow: "0 0 30px rgba(34,211,238,0.3), 0 4px 20px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 50px rgba(34,211,238,0.5), 0 4px 30px rgba(0,0,0,0.4)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 30px rgba(34,211,238,0.3), 0 4px 20px rgba(0,0,0,0.3)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Launch App <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <button
            onClick={() => document.querySelector("#ecosystem")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-gray-300 transition-all duration-300 hover:text-white"
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.03)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(34,211,238,0.2)";
              e.currentTarget.style.background = "rgba(34,211,238,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }}
          >
            Explore Ecosystem
          </button>
        </motion.div>

        {/* BSC badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-12"
        >
          <span className="inline-flex items-center gap-2 text-xs text-gray-500 tracking-widest uppercase">
            Built on Binance Smart Chain
          </span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-gray-500 tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5 text-cyan-400/40 animate-scroll-hint" />
      </motion.div>
    </section>
  );
}
