import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { LANGUAGE_FLAGS, getFlagUrl } from "@/lib/constants";
import { Play, Film } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";

type VideoCategory = "presentation" | "how-to-join" | "withdraw-compound" | "other";

const CATEGORY_LABELS: Record<VideoCategory, string> = {
  presentation: "Project Presentation",
  "how-to-join": "How to Join",
  "withdraw-compound": "Withdraw, Compound & Refer",
  other: "Other",
};

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function VideoSection() {
  const { data: videos } = trpc.content.videos.useQuery();
  const [activeCategory, setActiveCategory] = useState<VideoCategory>("presentation");
  const [activeLanguage, setActiveLanguage] = useState<string>("all");
  const [playingId, setPlayingId] = useState<number | null>(null);

  const categories = useMemo(() => {
    if (!videos) return [];
    const cats = Array.from(new Set(videos.map((v) => v.category))) as VideoCategory[];
    return cats.filter((c) => c in CATEGORY_LABELS);
  }, [videos]);

  const languages = useMemo(() => {
    if (!videos) return [];
    return Array.from(new Set(videos.filter((v) => v.category === activeCategory).map((v) => v.language)));
  }, [videos, activeCategory]);

  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    return videos.filter(
      (v) => v.category === activeCategory && (activeLanguage === "all" || v.language === activeLanguage)
    );
  }, [videos, activeCategory, activeLanguage]);

  return (
    <section id="videos" className="section-spacing relative">
      <div className="container">
        <SectionHeading
          label="Content Hub"
          title="Watch & Learn"
          subtitle="Educational content in 48 languages. Tutorials, presentations, and step-by-step guides."
        />

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {(categories.length > 0 ? categories : (["presentation", "how-to-join", "withdraw-compound"] as VideoCategory[])).map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setActiveLanguage("all"); setPlayingId(null); }}
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                background: activeCategory === cat ? "rgba(8,145,178,0.1)" : "rgba(255,255,255,0.6)",
                border: `1px solid ${activeCategory === cat ? "rgba(8,145,178,0.25)" : "rgba(0,0,0,0.06)"}`,
                color: activeCategory === cat ? "#0891B2" : "#64748B",
              }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Language Filters with real flag images */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => { setActiveLanguage("all"); setPlayingId(null); }}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
            style={{
              background: activeLanguage === "all" ? "rgba(8,145,178,0.1)" : "rgba(255,255,255,0.6)",
              border: `1px solid ${activeLanguage === "all" ? "rgba(8,145,178,0.25)" : "rgba(0,0,0,0.06)"}`,
              color: activeLanguage === "all" ? "#0891B2" : "#64748B",
            }}
          >
            All Languages
          </button>
          {languages.map((lang) => {
            const code = LANGUAGE_FLAGS[lang] || "un";
            return (
              <button
                key={lang}
                onClick={() => { setActiveLanguage(lang); setPlayingId(null); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
                style={{
                  background: activeLanguage === lang ? "rgba(8,145,178,0.1)" : "rgba(255,255,255,0.6)",
                  border: `1px solid ${activeLanguage === lang ? "rgba(8,145,178,0.25)" : "rgba(0,0,0,0.06)"}`,
                  color: activeLanguage === lang ? "#0891B2" : "#64748B",
                }}
              >
                <img src={getFlagUrl(code, 20)} alt={lang} className="w-4 h-3 object-cover rounded-sm" />
                {lang}
              </button>
            );
          })}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {filteredVideos.map((video, index) => {
            const ytId = video.youtubeUrl ? getYouTubeId(video.youtubeUrl) : null;
            const isPlaying = playingId === video.id;
            const langCode = LANGUAGE_FLAGS[video.language || ""] || "un";

            return (
              <AnimatedSection key={video.id} delay={index * 0.06}>
                <div
                  className="group rounded-xl overflow-hidden transition-all duration-400"
                  style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    border: "1px solid rgba(255,255,255,0.85)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Thumbnail / Player */}
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    {isPlaying && ytId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        {ytId && (
                          <img
                            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                            alt={video.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                          />
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                        {/* Language badge with real flag */}
                        <div
                          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white/90"
                          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
                        >
                          <img src={getFlagUrl(langCode, 20)} alt="" className="w-4 h-3 object-cover rounded-sm" />
                          {video.language}
                        </div>

                        {/* Play button */}
                        <button
                          onClick={() => setPlayingId(video.id)}
                          className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        >
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300"
                            style={{
                              background: "rgba(255,255,255,0.85)",
                              border: "2px solid rgba(8,145,178,0.3)",
                              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                              backdropFilter: "blur(8px)",
                            }}
                          >
                            <Play className="h-6 w-6 text-cyan-600 ml-0.5 fill-cyan-600" />
                          </div>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-slate-800 truncate">{video.title}</h4>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <Film className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-400">No videos available for this filter. Try another category.</p>
          </div>
        )}
      </div>
    </section>
  );
}
