import { SITE, LANGUAGE_FLAGS, getFlagUrl } from "@/lib/constants";
import {
  Shield,
  FileCheck,
  Lock,
  Eye,
  Link2,
  Download,
  ExternalLink,
  FileText,
  Search,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";
import ShareButton from "@/components/ShareButton";

const SECURITY_PILLARS = [
  {
    icon: FileCheck,
    label: "Audited",
    desc: "Independent security audit passed",
    color: "#0891B2",
    glow: "rgba(8,145,178,0.4)",
  },
  {
    icon: Shield,
    label: "Renounced",
    desc: "Ownership permanently renounced",
    color: "#10B981",
    glow: "rgba(16,185,129,0.4)",
  },
  {
    icon: Lock,
    label: "LP Locked",
    desc: "Liquidity permanently locked",
    color: "#7C3AED",
    glow: "rgba(124,58,237,0.4)",
  },
  {
    icon: Eye,
    label: "Verified",
    desc: "Source verified on BscScan",
    color: "#EC4899",
    glow: "rgba(236,72,153,0.4)",
  },
  {
    icon: Link2,
    label: "On-Chain",
    desc: "100% transparent on blockchain",
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.4)",
  },
];

function PillarCard({ pillar, index }: { pillar: typeof SECURITY_PILLARS[0]; index: number }) {
  const Icon = pillar.icon;
  return (
    <AnimatedSection delay={index * 0.08}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative h-full rounded-2xl p-5 md:p-6 text-center cursor-default overflow-hidden"
        style={{
          background: "white",
          border: "1px solid rgba(15,23,42,0.06)",
          boxShadow: "0 6px 20px -6px rgba(15,23,42,0.06)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 25px 50px -12px ${pillar.glow}, 0 8px 20px -4px rgba(15,23,42,0.06)`;
          e.currentTarget.style.borderColor = `${pillar.color}30`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 6px 20px -6px rgba(15,23,42,0.06)";
          e.currentTarget.style.borderColor = "rgba(15,23,42,0.06)";
        }}
      >
        {/* Top accent gradient */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${pillar.color}, transparent)`,
          }}
        />

        {/* Soft radial glow on hover */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${pillar.color}15, transparent 70%)`,
          }}
        />

        {/* Icon tile */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <motion.div
            whileHover={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.5 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
            style={{
              background: `linear-gradient(135deg, ${pillar.color}, ${pillar.color}dd)`,
              boxShadow: `0 12px 28px -8px ${pillar.glow}`,
            }}
          >
            {/* Inner gloss */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.25), transparent 50%)",
              }}
            />
            <Icon className="w-6 h-6 text-white relative" />
          </motion.div>
        </div>

        <h4 className="text-base font-bold text-slate-900 mb-1.5">
          {pillar.label}
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          {pillar.desc}
        </p>
      </motion.div>
    </AnimatedSection>
  );
}

export default function TrustSection() {
  const { data: presentations } = trpc.content.presentations.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLanguage, setActiveLanguage] = useState("all");

  const languages = useMemo(() => {
    if (!presentations) return [];
    return Array.from(
      new Set(presentations.map((p) => p.language).filter(Boolean))
    );
  }, [presentations]);

  const filteredPresentations = useMemo(() => {
    if (!presentations) return [];
    return presentations.filter((p) => {
      const matchLang =
        activeLanguage === "all" || p.language === activeLanguage;
      const matchSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLang && matchSearch;
    });
  }, [presentations, activeLanguage, searchQuery]);

  return (
    <section id="trust" className="section-spacing relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(8,145,178,0.05), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(124,58,237,0.05), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="container">
        <SectionHeading
          label="Security & Trust"
          title="Immutable by Design"
          subtitle="Five pillars of security that make Turbo Loop trustless and transparent."
        />

        {/* The Trust Quote — premium dark card */}
        <AnimatedSection>
          <div className="max-w-3xl mx-auto mb-16">
            <div
              className="relative p-8 md:p-12 rounded-3xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 30px 60px -20px rgba(15,23,42,0.4)",
              }}
            >
              {/* Top glow */}
              <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  background:
                    "radial-gradient(ellipse at top, rgba(8,145,178,0.25), transparent 60%)",
                }}
              />
              {/* Grid pattern */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              {/* Giant quote mark */}
              <div
                className="absolute top-2 left-6 text-[10rem] font-serif leading-none select-none pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(34,211,238,0.25), rgba(167,139,250,0.18))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                &ldquo;
              </div>

              <blockquote className="relative pl-2 md:pl-4">
                <p className="text-xl md:text-3xl font-light text-white leading-relaxed">
                  Turbo Loop does not ask you to trust a team.{" "}
                  <span
                    className="font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, #22D3EE 0%, #A78BFA 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    It asks you to verify the code.
                  </span>
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  <div
                    className="h-px w-12"
                    style={{
                      background:
                        "linear-gradient(90deg, #22D3EE, transparent)",
                    }}
                  />
                  <span className="text-xs text-slate-400 tracking-[0.2em] uppercase font-bold">
                    The Protocol Code
                  </span>
                </footer>
              </blockquote>
            </div>
          </div>
        </AnimatedSection>

        {/* Security Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto mb-20">
          {SECURITY_PILLARS.map((pillar, index) => (
            <PillarCard key={pillar.label} pillar={pillar} index={index} />
          ))}
        </div>

        {/* ===== PRESENTATIONS / PDF LIBRARY ===== */}
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase mb-3"
                style={{
                  background: "rgba(8,145,178,0.08)",
                  border: "1px solid rgba(8,145,178,0.2)",
                  color: "#0891B2",
                }}
              >
                <FileText className="w-3 h-3" />
                Presentation Library
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                Decks & Resources
              </h3>
              <p className="text-slate-500">
                The complete Turbo Loop story — translated, polished, ready to share.
              </p>
            </div>
          </AnimatedSection>

          {/* Stats row — quick at-a-glance counts */}
          <AnimatedSection delay={0.05}>
            <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto mb-8">
              {[
                { label: "Documents", value: presentations?.length || 0, color: "#0891B2", icon: FileText },
                { label: "Languages", value: languages.length, color: "#7C3AED", icon: Search },
                { label: "Format", value: "PDF", color: "#10B981", icon: Download, isText: true },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl p-4 text-center"
                    style={{
                      background: "white",
                      border: "1px solid rgba(15,23,42,0.06)",
                      boxShadow: "0 4px 14px -4px rgba(15,23,42,0.06)",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                      style={{
                        background: `linear-gradient(135deg, ${stat.color}, ${stat.color}cc)`,
                        boxShadow: `0 6px 14px -4px ${stat.color}50`,
                      }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>

          {/* Search + Language Filters */}
          <AnimatedSection delay={0.1}>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              {/* Search */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search presentations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm text-slate-700 placeholder-slate-400 outline-none transition-all duration-300"
                  style={{
                    background: "white",
                    border: "1px solid rgba(15,23,42,0.08)",
                    boxShadow: "0 4px 14px -4px rgba(15,23,42,0.06)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(8,145,178,0.4)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px -6px rgba(8,145,178,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 14px -4px rgba(15,23,42,0.06)";
                  }}
                />
              </div>

              {/* Language pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveLanguage("all")}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300"
                  style={{
                    background:
                      activeLanguage === "all"
                        ? "linear-gradient(135deg, #0891B2, #7C3AED)"
                        : "white",
                    border: `1px solid ${
                      activeLanguage === "all"
                        ? "transparent"
                        : "rgba(15,23,42,0.08)"
                    }`,
                    color: activeLanguage === "all" ? "white" : "#64748B",
                    boxShadow:
                      activeLanguage === "all"
                        ? "0 6px 16px -4px rgba(8,145,178,0.4)"
                        : "0 2px 6px -2px rgba(15,23,42,0.04)",
                  }}
                >
                  All ({presentations?.length || 0})
                </button>
                {languages.map((lang) => {
                  const code = LANGUAGE_FLAGS[lang] || "un";
                  const count =
                    presentations?.filter((p) => p.language === lang).length ||
                    0;
                  const isActive = activeLanguage === lang;
                  return (
                    <button
                      key={lang}
                      onClick={() => setActiveLanguage(lang)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300"
                      style={{
                        background: isActive
                          ? "linear-gradient(135deg, #0891B2, #7C3AED)"
                          : "white",
                        border: `1px solid ${
                          isActive ? "transparent" : "rgba(15,23,42,0.08)"
                        }`,
                        color: isActive ? "white" : "#64748B",
                        boxShadow: isActive
                          ? "0 6px 16px -4px rgba(8,145,178,0.4)"
                          : "0 2px 6px -2px rgba(15,23,42,0.04)",
                      }}
                    >
                      <img
                        src={getFlagUrl(code, 20)}
                        alt={lang}
                        loading="lazy"
                        decoding="async"
                        className="w-4 h-3 object-cover rounded-sm"
                      />
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
                <AnimatedSection
                  key={pres.id}
                  delay={Math.min(index * 0.04, 0.5)}
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group relative p-5 rounded-2xl h-full"
                    style={{
                      background: "white",
                      border: "1px solid rgba(15,23,42,0.06)",
                      boxShadow: "0 6px 20px -6px rgba(15,23,42,0.06)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(8,145,178,0.25)";
                      e.currentTarget.style.boxShadow =
                        "0 25px 50px -12px rgba(8,145,178,0.2), 0 8px 20px -4px rgba(15,23,42,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(15,23,42,0.06)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 20px -6px rgba(15,23,42,0.06)";
                    }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {/* PDF icon tile */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(135deg, #0891B2, #7C3AED)",
                          boxShadow: "0 8px 20px -6px rgba(8,145,178,0.4)",
                        }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.2), transparent 60%)",
                          }}
                        />
                        <FileText className="h-5 w-5 text-white relative" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-cyan-700 transition-colors">
                          {pres.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-2">
                          <img
                            src={getFlagUrl(langCode, 20)}
                            alt={pres.language || ""}
                            loading="lazy"
                            decoding="async"
                            className="w-4 h-3 object-cover rounded-sm"
                          />
                          <span className="text-xs text-slate-500 font-medium">
                            {pres.language}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-3"
                      style={{ borderTop: "1px solid rgba(15,23,42,0.05)" }}
                    >
                      {pres.fileUrl && (
                        <a
                          href={pres.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300"
                          style={{
                            background:
                              "linear-gradient(135deg, #0891B2, #7C3AED)",
                            color: "white",
                            boxShadow: "0 4px 12px -2px rgba(8,145,178,0.35)",
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
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 transition-all duration-300 hover:text-slate-900"
                          style={{
                            background: "rgba(15,23,42,0.04)",
                            border: "1px solid rgba(15,23,42,0.06)",
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </a>
                      )}
                      <div className="ml-auto">
                        <ShareButton
                          path="/#presentations"
                          message={`📄 Turbo Loop presentation in ${pres.language} — download or view online.${
                            pres.fileUrl ? "\n\n" + pres.fileUrl : ""
                          }`}
                          variant="icon"
                          label="Share"
                        />
                      </div>
                    </div>
                  </motion.div>
                </AnimatedSection>
              );
            })}
          </div>

          {filteredPresentations.length === 0 && (
            <div className="text-center py-12">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{
                  background: "white",
                  border: "1px solid rgba(15,23,42,0.06)",
                }}
              >
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-400">
                {searchQuery
                  ? "No presentations match your search."
                  : "No presentations available yet."}
              </p>
            </div>
          )}

          {/* Legacy deck download fallback */}
          {(!presentations || presentations.length === 0) && (
            <AnimatedSection>
              <div className="max-w-xl mx-auto mt-8">
                <div
                  className="relative p-8 rounded-2xl text-center overflow-hidden"
                  style={{
                    background: "white",
                    border: "1px solid rgba(8,145,178,0.15)",
                    boxShadow: "0 20px 40px -12px rgba(8,145,178,0.1)",
                  }}
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    The Complete DeFi Ecosystem
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    22-slide presentation deck — everything you need to
                    understand Turbo Loop.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={SITE.deckPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105"
                      style={{
                        background:
                          "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                        color: "#ffffff",
                        boxShadow: "0 10px 30px -8px rgba(8,145,178,0.5)",
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </a>
                    <a
                      href={SITE.deckPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-600 transition-all duration-300 hover:text-slate-900"
                      style={{ border: "1px solid rgba(15,23,42,0.1)" }}
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
