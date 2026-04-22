import { SITE } from "@/lib/constants";
import { motion } from "framer-motion";
import { Shield, FileCheck, Lock, Eye, Link as LinkIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const SECURITY_PILLARS = [
  { icon: FileCheck, label: "Independently Audited" },
  { icon: Shield, label: "Ownership Renounced" },
  { icon: Lock, label: "100% LP Locked" },
  { icon: Eye, label: "BscScan Verified" },
  { icon: LinkIcon, label: "100% On-Chain" },
];

export default function TrustSection() {
  return (
    <section id="trust" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-white">Built to </span>
            <span className="text-gradient">Last</span>
          </h2>
          <p className="text-gray-400 text-lg">Trust the Code, Not the Team</p>
        </motion.div>

        {/* Security Pillars */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-16 max-w-4xl mx-auto">
          {SECURITY_PILLARS.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border border-cyan-500/10 bg-[#0d1425]/60 hover:border-cyan-500/25 transition-all w-36 md:w-44"
              >
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-cyan-400" />
                </div>
                <p className="text-sm font-heading font-semibold text-white text-center">{pillar.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <blockquote className="relative p-8 rounded-2xl border border-cyan-500/15 bg-[#0d1425]/80">
            <div className="absolute -top-4 left-8 text-6xl text-cyan-500/20 font-serif">&ldquo;</div>
            <p className="text-xl md:text-2xl font-heading font-medium text-white leading-relaxed italic">
              {SITE.trustQuote}
            </p>
          </blockquote>
        </motion.div>

        {/* Download Deck */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-gray-400 mb-4">Download the complete 22-slide ecosystem presentation</p>
          <a href={SITE.deckPdf} download="TurboLoop_Complete_DeFi_Ecosystem.pdf" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-bold px-8 shadow-lg shadow-purple-500/20">
              <Download className="h-5 w-5 mr-2" />
              Download Presentation Deck
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
