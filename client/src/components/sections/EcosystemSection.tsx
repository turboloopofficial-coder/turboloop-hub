import { ECOSYSTEM_PILLARS } from "@/lib/constants";
import { motion } from "framer-motion";
import { CreditCard, ArrowLeftRight, TrendingUp, Users, Award, Shield } from "lucide-react";
import { useState, useRef, useCallback } from "react";

const iconMap: Record<string, React.ElementType> = { CreditCard, ArrowLeftRight, TrendingUp, Users, Award, Shield };

const cardColors = [
  { border: "rgba(34,211,238,0.3)", glow: "rgba(34,211,238,0.12)", icon: "#22D3EE", gradient: "from-cyan-500/10 to-cyan-500/0" },
  { border: "rgba(34,211,238,0.3)", glow: "rgba(34,211,238,0.12)", icon: "#22D3EE", gradient: "from-cyan-500/10 to-cyan-500/0" },
  { border: "rgba(52,211,153,0.3)", glow: "rgba(52,211,153,0.12)", icon: "#34D399", gradient: "from-emerald-500/10 to-emerald-500/0" },
  { border: "rgba(192,132,252,0.3)", glow: "rgba(192,132,252,0.12)", icon: "#C084FC", gradient: "from-purple-500/10 to-purple-500/0" },
  { border: "rgba(251,191,36,0.3)", glow: "rgba(251,191,36,0.12)", icon: "#FBBF24", gradient: "from-amber-500/10 to-amber-500/0" },
  { border: "rgba(34,211,238,0.3)", glow: "rgba(34,211,238,0.12)", icon: "#22D3EE", gradient: "from-cyan-500/10 to-cyan-500/0" },
];

function PillarCard({ pillar, index }: { pillar: typeof ECOSYSTEM_PILLARS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = iconMap[pillar.icon] || Shield;
  const colors = cardColors[index];

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * -15,  // tilt X based on vertical position
      y: (x - 0.5) * 15,   // tilt Y based on horizontal position
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative group"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: hovered ? 1.03 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative p-7 rounded-2xl overflow-hidden h-full"
        style={{
          background: "linear-gradient(135deg, rgba(13,20,40,0.8) 0%, rgba(13,20,40,0.4) 100%)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${hovered ? colors.border : "rgba(255,255,255,0.05)"}`,
          boxShadow: hovered
            ? `0 0 40px ${colors.glow}, 0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`
            : "0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.border}, transparent)`,
            opacity: hovered ? 1 : 0.3,
            transition: "opacity 0.4s",
          }}
        />

        {/* Spotlight effect on hover */}
        {hovered && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${(tilt.y / 15 + 0.5) * 100}% ${(-tilt.x / 15 + 0.5) * 100}%, ${colors.glow} 0%, transparent 60%)`,
            }}
          />
        )}

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 relative"
          style={{
            background: `linear-gradient(135deg, ${colors.glow}, transparent)`,
            border: `1px solid ${colors.border}`,
            transform: "translateZ(20px)",
          }}
        >
          <Icon className="h-7 w-7" style={{ color: colors.icon }} />
          {hovered && (
            <div className="absolute inset-0 rounded-xl" style={{ boxShadow: `0 0 25px ${colors.glow}` }} />
          )}
        </div>

        {/* Content */}
        <div style={{ transform: "translateZ(10px)" }}>
          <h3 className="text-xl font-heading font-bold text-white mb-1">{pillar.title}</h3>
          <p className="text-sm font-semibold mb-3" style={{ color: colors.icon }}>{pillar.subtitle}</p>
          <p className="text-sm text-gray-400 leading-relaxed">{pillar.description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function EcosystemSection() {
  return (
    <section id="ecosystem" className="relative section-padding overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(34,211,238,0.06) 0%, transparent 60%)" }} />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm text-cyan-300/80 mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            The Ecosystem
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-5">
            <span className="text-white">Six Integrated Pillars.</span>
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #22D3EE 0%, #A78BFA 50%, #C084FC 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              One Unified Protocol.
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Every component works together to create a self-sustaining financial ecosystem on Binance Smart Chain.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {ECOSYSTEM_PILLARS.map((pillar, index) => (
            <PillarCard key={pillar.title} pillar={pillar} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
