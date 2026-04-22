import { motion } from "framer-motion";
import { CreditCard, ArrowLeftRight, TrendingUp, Users, Award, Shield } from "lucide-react";
import { ECOSYSTEM_PILLARS } from "@/lib/constants";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";
import { useState, useRef, useCallback } from "react";

const ICONS: Record<string, React.ElementType> = {
  CreditCard, ArrowLeftRight, TrendingUp, Users, Award, Shield,
};

function PillarCard({ pillar, index }: { pillar: typeof ECOSYSTEM_PILLARS[0]; index: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = ICONS[pillar.icon] || Shield;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (y - 0.5) * -12, y: (x - 0.5) * 12 });
  }, []);

  return (
    <AnimatedSection delay={index * 0.1}>
      <div
        ref={cardRef}
        onMouseEnter={() => setHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
        style={{ perspective: "1000px" }}
      >
        <motion.div
          animate={{ rotateX: tilt.x, rotateY: tilt.y, scale: hovered ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="group relative p-8 rounded-2xl h-full"
          style={{
            background: "linear-gradient(145deg, rgba(10, 18, 38, 0.7) 0%, rgba(6, 10, 22, 0.5) 100%)",
            border: `1px solid ${hovered ? `${pillar.color}25` : "rgba(255,255,255,0.04)"}`,
            backdropFilter: "blur(10px)",
            boxShadow: hovered ? `0 8px 40px ${pillar.color}10, inset 0 1px 0 rgba(255,255,255,0.03)` : "none",
            transformStyle: "preserve-3d",
            transition: "border-color 0.4s, box-shadow 0.4s",
          }}
        >
          {/* Spotlight effect */}
          {hovered && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${(tilt.y / 12 + 0.5) * 100}% ${(-tilt.x / 12 + 0.5) * 100}%, ${pillar.color}08 0%, transparent 60%)`,
              }}
            />
          )}

          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-500"
            style={{
              background: `${pillar.color}10`,
              border: `1px solid ${pillar.color}20`,
              transform: "translateZ(20px)",
            }}
          >
            <Icon className="w-5 h-5" style={{ color: pillar.color }} />
          </div>

          {/* Content */}
          <div style={{ transform: "translateZ(10px)" }}>
            <h3 className="text-xl font-bold text-white mb-1">{pillar.title}</h3>
            <p className="text-sm font-medium mb-3" style={{ color: `${pillar.color}cc` }}>{pillar.subtitle}</p>
            <p className="text-sm text-gray-400 leading-relaxed">{pillar.description}</p>
          </div>

          {/* Bottom accent */}
          <div
            className="absolute bottom-0 left-8 right-8 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `linear-gradient(90deg, transparent, ${pillar.color}40, transparent)` }}
          />
        </motion.div>
      </div>
    </AnimatedSection>
  );
}

export default function EcosystemSection() {
  return (
    <section id="ecosystem" className="section-spacing relative">
      <div className="container">
        <SectionHeading
          label="Ecosystem"
          title="Six Pillars of Power"
          subtitle="A complete DeFi ecosystem where every component works together to create sustainable, compounding growth."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {ECOSYSTEM_PILLARS.map((pillar, i) => (
            <PillarCard key={pillar.title} pillar={pillar} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
