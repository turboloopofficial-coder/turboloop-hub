import { SITE, LANGUAGE_FLAGS, getFlagUrl } from "@/lib/constants";
import { Shield, FileCheck, Lock, Eye, Link2, Download, ExternalLink, FileText, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";

const SECURITY_PILLARS = [
  { icon: FileCheck, label: "Audited", desc: "Independent security audit passed", color: "#0891B2" },
  { icon: Shield, label: "Renounced", desc: "Ownership permanently renounced", color: "#059669" },
  { icon: Lock, label: "LP Locked", desc: "Liquidity permanently locked", color: "#7C3AED" },
  { icon: Eye, label: "BscScan Verified", desc: "Contract verified and public", color: "#9333EA" },
  { icon: Link2, label: "On-Chain", desc: "100% transparent on blockchain", color: "#0891B2" },
];

export default function TrustSection() {
  const { data: presentations } = trpc.content.presentations.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLanguage, setActiveLanguage] = useState("all");

  const languages = useMemo(() => {
    if (!presentations) return [];
    return Array.from(new Set(presentations.map(p => p.language).filter(Boolean)));
  }, [presentations]);

  const filteredPresentations = useMemo(() => {
    if (!presentations) return [];
    return presentations.filter(p => {
      const matchLang = activeLanguage === "all" || p.language === activeLanguage;
      const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLang && matchSearch;
    });
  }, [presentations, activeLanguage, searchQuery]);

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
                background: "rgba(255, 255, 255, 0.7)",
                border: "1px solid rgba(255,255,255,0.85)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              }}
            >
              {/* Gradient left border */}
              <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
                style={{ background: "linear-gradient(180deg, #0891B2, #7C3AED)" }}
              />

              {/* Quote mark */}
              <div className="absolute top-2 left-6 text-7xl font-serif" style={{ color: "rgba(8,145,178,0.08)" }}>&ldquo;</div>

              <blockquote className="pl-6">
                <p className="relative text-xl md:text-2xl font-light text-slate-700 leading-relaxed italic">
                  "Turbo Loop does not ask you to trust a team. It asks you to verify the code."
                </p>
                <footer className="mt-4 text-sm text-slate-400">
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
                      background: "rgba(255,255,255,0.7)",
                      border: `1px solid ${pillar.color}20`,
                      backdropFilter: "blur(12px)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${pillar.color}40`;
                      e.currentTarget.style.boxShadow = `0 4px 20px ${pillar.color}12`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${pillar.color}20`;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: pillar.color }} />
                  </div>
                  <p className="text-sm font-bold text-slate-800 mb-1">{pillar.label}</p>
                  <p className="text-[11px] text-slate-500 leading-tight">{pillar.desc}</p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* ===== PRESENTATIONS / PDF LIBRARY ===== */}
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Presentation Library</h3>
              <p className="text-slate-500">Decks, guides, and resources in 12+ languages. Download or view online.</p>
            </div>
          </AnimatedSection>

          {/* Search + Language Filters */}
          <AnimatedSection delay={0.1}>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              {/* Search */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search presentations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    backdropFilter: "blur(12px)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(8,145,178,0.3)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; }}
                />
              </div>

              {/* Language pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveLanguage("all")}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
                  style={{
                    background: activeLanguage === "all" ? "rgba(8,145,178,0.1)" : "rgba(255,255,255,0.6)",
                    border: `1px solid ${activeLanguage === "all" ? "rgba(8,145,178,0.25)" : "rgba(0,0,0,0.06)"}`,
                    color: activeLanguage === "all" ? "#0891B2" : "#64748B",
                  }}
                >
                  All ({presentations?.length || 0})
                </button>
                {languages.map((lang) => {
                  const code = LANGUAGE_FLAGS[lang] || "un";
                  const count = presentations?.filter(p => p.language === lang).length || 0;
                  return (
                    <button
                      key={lang}
                      onClick={() => setActiveLanguage(lang)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
                      style={{
                        background: activeLanguage === lang ? "rgba(8,145,178,0.1)" : "rgba(255,255,255,0.6)",
                        border: `1px solid ${activeLanguage === lang ? "rgba(8,145,178,0.25)" : "rgba(0,0,0,0.06)"}`,
                        color: activeLanguage === lang ? "#0891B2" : "#64748B",
                      }}
                    >
                      <img src={getFlagUrl(code, 20)} alt={lang} className="w-4 h-3 object-cover rounded-sm" />
                      {lang} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </AnimatedSection>

          {/* PDF Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPresentations.map((pres, index) => {
              const langCode = LANGUAGE_FLAGS[pres.language || ""] || "un";
              return (
                <AnimatedSection key={pres.id} delay={Math.min(index * 0.04, 0.5)}>
                  <div
                    className="group relative p-5 rounded-xl transition-all duration-300"
                    style={{
                      background: "rgba(255, 255, 255, 0.7)",
                      border: "1px solid rgba(255,255,255,0.85)",
                      backdropFilter: "blur(20px)",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(8,145,178,0.2)";
                      e.currentTarget.style.boxShadow = "0 8px 40px rgba(8,145,178,0.08), 0 4px 16px rgba(0,0,0,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.85)";
                      e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.04)";
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(8,145,178,0.08)", border: "1px solid rgba(8,145,178,0.12)" }}>
                        <FileText className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-cyan-700 transition-colors">
                          {pres.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <img src={getFlagUrl(langCode, 20)} alt={pres.language || ""} className="w-4 h-3 object-cover rounded-sm" />
                          <span className="text-xs text-slate-400">{pres.language}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      {pres.fileUrl && (
                        <a
                          href={pres.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300"
                          style={{
                            background: "rgba(8,145,178,0.08)",
                            color: "#0891B2",
                            border: "1px solid rgba(8,145,178,0.15)",
                          }}
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </a>
                      )}
                      {pres.fileUrl && (
                        <a
                          href={pres.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 transition-all duration-300 hover:text-slate-700"
                          style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </a>
                      )}
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>

          {filteredPresentations.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-400">
                {searchQuery ? "No presentations match your search." : "No presentations available yet."}
              </p>
            </div>
          )}

          {/* Legacy deck download fallback */}
          {(!presentations || presentations.length === 0) && (
            <AnimatedSection>
              <div className="max-w-xl mx-auto mt-8">
                <div
                  className="relative p-8 rounded-xl text-center overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(8,145,178,0.12)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    The Complete DeFi Ecosystem
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    22-slide presentation deck — everything you need to understand Turbo Loop.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={SITE.deckPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300"
                      style={{
                        background: "linear-gradient(135deg, #0891B2, #0E7490)",
                        color: "#ffffff",
                        boxShadow: "0 4px 20px rgba(8,145,178,0.25)",
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </a>
                    <a
                      href={SITE.deckPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-600 transition-all duration-300 hover:text-slate-800"
                      style={{ border: "1px solid rgba(0,0,0,0.1)" }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Online
                    </a>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </section>
  );
}
