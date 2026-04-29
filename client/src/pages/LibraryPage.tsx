// /library — unified content library combining videos + presentations + search.
// Reuses VideoSection + presentation library from TrustSection (extracted via tRPC)

import { useMemo, useState } from "react";
import { Search, FileText, Play, Film, Download, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { LANGUAGE_FLAGS, getFlagUrl } from "@/lib/constants";
import PageShell from "@/components/PageShell";
import AnimatedSection from "@/components/AnimatedSection";
import VideoSection from "@/components/sections/VideoSection";

type Tab = "all" | "videos" | "presentations";

export default function LibraryPage() {
  const { data: presentations } = trpc.content.presentations.useQuery();
  const { data: videos } = trpc.content.videos.useQuery();
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  const filteredPresentations = useMemo(() => {
    if (!presentations) return [];
    if (!search.trim()) return presentations;
    const q = search.toLowerCase();
    return presentations.filter(
      (p) => p.title.toLowerCase().includes(q) || (p.language || "").toLowerCase().includes(q)
    );
  }, [presentations, search]);

  const totalVideos = videos?.length || 0;
  const totalPdfs = presentations?.length || 0;

  return (
    <PageShell
      title="Content Library"
      description={`Watch, learn, download. ${totalVideos} videos and ${totalPdfs} presentations in 48 languages.`}
      path="/library"
      hero={{
        label: "Watch & Learn",
        heading: "Everything in one library.",
        subtitle: `${totalVideos} videos and reels · ${totalPdfs} downloadable presentations · 48 languages. Search, filter, download.`,
        palette: ["#0891B2", "#22D3EE", "#7C3AED"],
        emoji: "📚",
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Content Library — Turbo Loop",
        url: "https://turboloop.tech/library",
        description: `${totalVideos} videos and ${totalPdfs} PDF presentations in 48 languages.`,
      }}
      related={[
        { label: "Editorial (Blog)", href: "/feed", emoji: "📖", description: "40+ written deep-dives" },
        { label: "Creatives", href: "/creatives", emoji: "🎨", description: "141 ready-to-share banners" },
        { label: "Community", href: "/community", emoji: "🌍", description: "Live Zoom calls daily" },
      ]}
    >
      <div className="container pb-16">
        {/* Search bar */}
        <AnimatedSection>
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search videos, presentations, languages..."
                className="w-full pl-14 pr-4 py-4 rounded-2xl text-base text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                style={{
                  background: "white",
                  border: "1px solid rgba(15,23,42,0.08)",
                  boxShadow: "0 4px 14px -4px rgba(15,23,42,0.06)",
                }}
              />
            </div>
          </div>
        </AnimatedSection>

        {/* Tab filter */}
        <AnimatedSection delay={0.05}>
          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {[
              { id: "all" as Tab, label: "All", count: totalVideos + totalPdfs, icon: Film },
              { id: "videos" as Tab, label: "Videos", count: totalVideos, icon: Play },
              { id: "presentations" as Tab, label: "Presentations", count: totalPdfs, icon: FileText },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
                  style={{
                    background: isActive ? "linear-gradient(135deg, #0891B2, #7C3AED)" : "white",
                    color: isActive ? "white" : "#64748B",
                    border: `1px solid ${isActive ? "transparent" : "rgba(15,23,42,0.08)"}`,
                    boxShadow: isActive ? "0 8px 20px -6px rgba(8,145,178,0.4)" : "0 2px 6px -2px rgba(15,23,42,0.04)",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: isActive ? "rgba(255,255,255,0.25)" : "rgba(15,23,42,0.06)" }}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </AnimatedSection>

        {/* Videos block (uses VideoSection) */}
        {(tab === "all" || tab === "videos") && (
          <div className="mb-16">
            <VideoSection />
          </div>
        )}

        {/* Presentations block */}
        {(tab === "all" || tab === "presentations") && (
          <section>
            <AnimatedSection>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>
                  Presentation Library
                </h2>
                <p className="text-slate-500 mt-2">{filteredPresentations.length} of {totalPdfs} presentations</p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
              {filteredPresentations.map((pres, index) => {
                const langCode = LANGUAGE_FLAGS[pres.language || ""] || "un";
                return (
                  <AnimatedSection key={pres.id} delay={Math.min(index * 0.03, 0.4)}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="group relative p-5 rounded-2xl h-full"
                      style={{
                        background: "white",
                        border: "1px solid rgba(15,23,42,0.06)",
                        boxShadow: "0 6px 20px -6px rgba(15,23,42,0.06)",
                      }}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                            boxShadow: "0 8px 20px -6px rgba(8,145,178,0.4)",
                          }}
                        >
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{pres.title}</h4>
                          <div className="flex items-center gap-1.5 mt-2">
                            <img src={getFlagUrl(langCode, 20)} alt="" className="w-4 h-3 object-cover rounded-sm" />
                            <span className="text-xs text-slate-500 font-medium">{pres.language}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap pt-3" style={{ borderTop: "1px solid rgba(15,23,42,0.05)" }}>
                        {pres.fileUrl && (
                          <a
                            href={pres.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{
                              background: "linear-gradient(135deg, #0891B2, #7C3AED)",
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
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 transition-all hover:text-slate-900"
                            style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.06)" }}
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </a>
                        )}
                      </div>
                    </motion.div>
                  </AnimatedSection>
                );
              })}
            </div>

            {filteredPresentations.length === 0 && search && (
              <div className="text-center py-16">
                <p className="text-slate-400">No presentations match "<span className="font-mono">{search}</span>".</p>
                <button onClick={() => setSearch("")} className="mt-3 text-cyan-600 hover:text-cyan-800 text-sm font-semibold">
                  Clear search
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </PageShell>
  );
}
