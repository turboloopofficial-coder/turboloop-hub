import { SITE } from "@/lib/constants";
import { motion } from "framer-motion";
import { Shield, FileCheck, Lock, Eye, Link as LinkIcon, Download } from "lucide-react";
import { useState } from "react";

const SECURITY_PILLARS = [
  { icon: FileCheck, label: "Independently Audited", color: "#22D3EE" },
  { icon: Shield, label: "Ownership Renounced", color: "#34D399" },
  { icon: Lock, label: "100% LP Locked", color: "#A78BFA" },
  { icon: Eye, label: "BscScan Verified", color: "#C084FC" },
  { icon: LinkIcon, label: "100% On-Chain", color: "#22D3EE" },
];

function PillarCard({ pillar, index }: { pillar: typeof SECURITY_PILLARS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const Icon = pillar.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col items-center gap-4 p-6 rounded-xl w-36 md:w-44 transition-all duration-400"
      style={{
        background: "linear-gradient(135deg, rgba(13,20,40,0.7) 0%, rgba(13,20,40,0.4) 100%)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${hovered ? `${pillar.color}30` : "rgba(255,255,255,0.04)"}`,
        boxShadow: hovered ? `0 0 30px ${pillar.color}15` : "none",
      }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-400"
        style={{
          background: `linear-gradient(135deg, ${pillar.color}15, ${pillar.color}05)`,
          border: `1px solid ${pillar.color}25`,
          boxShadow: hovered ? `0 0 20px ${pillar.color}20` : "none",
        }}
      >
        <Icon className="h-7 w-7" style={{ color: pillar.color }} />
      </div>
      <p className="text-sm font-heading font-semibold text-white text-center">{pillar.label}</p>
    </motion.div>
  );
}

export default function TrustSection() {
  const [deckHovered, setDeckHovered] = useState(false);

  return (
    <section id="trust" className="relative section-padding overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full" style={{ background: "radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 60%)" }} />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm text-cyan-300/80 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Security & Trust
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-5">
            <span className="text-white">Built to</span>{" "}
            <span className="text-gradient">Last</span>
          </h2>
          <p className="text-gray-400 text-lg">Trust the Code, Not the Team</p>
        </motion.div>

        {/* Security Pillars */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-5 mb-16 max-w-4xl mx-auto">
          {SECURITY_PILLARS.map((pillar, index) => (
            <PillarCard key={pillar.label} pillar={pillar} index={index} />
          ))}
        </div>

        {/* Trust Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div
            className="relative p-8 md:p-10 rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(13,20,40,0.8) 0%, rgba(13,20,40,0.5) 100%)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl" style={{ padding: "1px", background: "linear-gradient(135deg, rgba(34,211,238,0.3), rgba(192,132,252,0.3), rgba(34,211,238,0.1))", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />

            {/* Quote mark */}
            <div className="absolute top-4 left-6 text-7xl font-serif" style={{ color: "rgba(34,211,238,0.1)" }}>&ldquo;</div>

            <p className="relative text-xl md:text-2xl font-heading font-medium text-white leading-relaxed italic">
              {SITE.trustQuote}
            </p>
          </div>
        </motion.div>

        {/* Download Deck */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-400 mb-6">Download the complete 22-slide ecosystem presentation</p>
          <a
            href={SITE.deckPdf}
            download="TurboLoop_Complete_DeFi_Ecosystem.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setDeckHovered(true)}
            onMouseLeave={() => setDeckHovered(false)}
          >
            <button
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-bold transition-all duration-400"
              style={{
                background: deckHovered
                  ? "linear-gradient(135deg, rgba(192,132,252,0.25), rgba(34,211,238,0.25))"
                  : "linear-gradient(135deg, rgba(192,132,252,0.15), rgba(34,211,238,0.15))",
                border: "1px solid rgba(192,132,252,0.3)",
                color: "#E5E7EB",
                boxShadow: deckHovered
                  ? "0 0 40px rgba(192,132,252,0.15), 0 0 80px rgba(34,211,238,0.08)"
                  : "0 0 20px rgba(192,132,252,0.08)",
              }}
            >
              <Download className="h-5 w-5 text-purple-400" />
              Download Presentation Deck
            </button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
