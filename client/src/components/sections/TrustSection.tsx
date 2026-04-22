import { SITE } from "@/lib/constants";
import { Shield, FileCheck, Lock, Eye, Link2, Download, ExternalLink } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";

const SECURITY_PILLARS = [
  { icon: FileCheck, label: "Audited", desc: "Independent security audit passed", color: "#22D3EE" },
  { icon: Shield, label: "Renounced", desc: "Ownership permanently renounced", color: "#34D399" },
  { icon: Lock, label: "LP Locked", desc: "Liquidity permanently locked", color: "#A78BFA" },
  { icon: Eye, label: "BscScan Verified", desc: "Contract verified and public", color: "#C084FC" },
  { icon: Link2, label: "On-Chain", desc: "100% transparent on blockchain", color: "#22D3EE" },
];

export default function TrustSection() {
  return (
    <section id="trust" className="section-spacing relative">
      <div className="container">
        <SectionHeading
          label="Security & Trust"
          title="Immutable by Design"
          subtitle="Five pillars of security that make Turbo Loop trustless and transparent."
        />

        {/* The Trust Quote */}
        <AnimatedSection>
          <div className="max-w-3xl mx-auto mb-20">
            <div className="relative p-8 md:p-10 rounded-xl"
              style={{
                background: "rgba(10, 18, 38, 0.5)",
                border: "1px solid rgba(34,211,238,0.1)",
              }}
            >
              {/* Gradient left border */}
              <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
                style={{ background: "linear-gradient(180deg, #22D3EE, #C084FC)" }}
              />

              {/* Quote mark */}
              <div className="absolute top-2 left-6 text-7xl font-serif" style={{ color: "rgba(34,211,238,0.08)" }}>&ldquo;</div>

              <blockquote className="pl-6">
                <p className="relative text-xl md:text-2xl font-light text-gray-200 leading-relaxed italic">
                  "Turbo Loop does not ask you to trust a team. It asks you to verify the code."
                </p>
                <footer className="mt-4 text-sm text-gray-500">
                  — The Protocol Code
                </footer>
              </blockquote>
            </div>
          </div>
        </AnimatedSection>

        {/* Security Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-20">
          {SECURITY_PILLARS.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <AnimatedSection key={pillar.label} delay={index * 0.08}>
                <div className="text-center group cursor-default">
                  <div
                    className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 transition-all duration-300"
                    style={{
                      background: `${pillar.color}08`,
                      border: `1px solid ${pillar.color}15`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${pillar.color}40`;
                      e.currentTarget.style.boxShadow = `0 0 20px ${pillar.color}15`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${pillar.color}15`;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: pillar.color }} />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{pillar.label}</p>
                  <p className="text-[11px] text-gray-500 leading-tight">{pillar.desc}</p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* Download Presentation Deck */}
        <AnimatedSection>
          <div className="max-w-xl mx-auto">
            <div
              className="relative p-8 rounded-xl text-center overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(34,211,238,0.06), rgba(192,132,252,0.06))",
                border: "1px solid rgba(34,211,238,0.12)",
              }}
            >
              {/* Subtle top glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.3), transparent)" }}
              />

              <h3 className="text-xl font-bold text-white mb-2">
                The Complete DeFi Ecosystem
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                22-slide presentation deck — everything you need to understand Turbo Loop.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={SITE.deckPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:brightness-110"
                  style={{
                    background: "linear-gradient(135deg, #22D3EE, #06B6D4)",
                    color: "#060a16",
                    boxShadow: "0 0 20px rgba(34,211,238,0.2)",
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
                <a
                  href={SITE.deckPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-300 transition-all duration-300 hover:text-white"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <ExternalLink className="h-4 w-4" />
                  View Online
                </a>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
