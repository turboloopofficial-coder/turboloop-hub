import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { LANGUAGE_FLAGS } from "@/lib/constants";
import { motion } from "framer-motion";
import { Play, Film } from "lucide-react";

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
    <section id="videos" className="relative section-padding overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(34,211,238,0.04) 0%, transparent 60%)" }} />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm text-cyan-300/80 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Video Hub
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-5">
            <span className="text-white">Watch &</span>{" "}
            <span className="text-gradient">Learn</span>
          </h2>
          <p className="text-gray-400 text-lg">Available in 12+ languages</p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {(categories.length > 0 ? categories : (["presentation", "how-to-join", "withdraw-compound"] as VideoCategory[])).map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setActiveLanguage("all"); }}
              className="relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
              style={{
                background: activeCategory === cat ? "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))" : "rgba(13,20,40,0.5)",
                border: `1px solid ${activeCategory === cat ? "rgba(34,211,238,0.3)" : "rgba(255,255,255,0.04)"}`,
                color: activeCategory === cat ? "#22D3EE" : "#9CA3AF",
                boxShadow: activeCategory === cat ? "0 0 15px rgba(34,211,238,0.1)" : "none",
              }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Language Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveLanguage("all")}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
            style={{
              background: activeLanguage === "all" ? "rgba(34,211,238,0.1)" : "transparent",
              color: activeLanguage === "all" ? "#22D3EE" : "#6B7280",
              border: `1px solid ${activeLanguage === "all" ? "rgba(34,211,238,0.2)" : "transparent"}`,
            }}
          >
            All
          </button>
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLanguage(lang)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1.5"
              style={{
                background: activeLanguage === lang ? "rgba(34,211,238,0.1)" : "transparent",
                color: activeLanguage === lang ? "#22D3EE" : "#6B7280",
                border: `1px solid ${activeLanguage === lang ? "rgba(34,211,238,0.2)" : "transparent"}`,
              }}
            >
              <span>{LANGUAGE_FLAGS[lang] || ""}</span> {lang}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video, index) => {
            const ytId = video.youtubeUrl ? getYouTubeId(video.youtubeUrl) : null;
            const isPlaying = playingId === video.id;

            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group"
              >
                <div
                  className="rounded-xl overflow-hidden transition-all duration-400"
                  style={{
                    background: "linear-gradient(135deg, rgba(13,20,40,0.7) 0%, rgba(13,20,40,0.4) 100%)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Thumbnail / Player */}
                  <div className="relative aspect-video bg-[#060a16] overflow-hidden">
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
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                          />
                        )}
                        {/* Dark gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#060a16] via-transparent to-transparent" />
                        {/* Language badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-lg glass text-xs font-medium text-white">
                          <span>{video.languageFlag}</span> {video.language}
                        </div>
                        {/* Play button */}
                        <button
                          onClick={() => setPlayingId(video.id)}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300"
                            style={{
                              background: "rgba(34,211,238,0.15)",
                              border: "2px solid rgba(34,211,238,0.4)",
                              boxShadow: "0 0 30px rgba(34,211,238,0.2)",
                              backdropFilter: "blur(10px)",
                            }}
                          >
                            <Play className="h-7 w-7 text-cyan-400 ml-1" />
                          </div>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h4 className="text-sm font-heading font-semibold text-white truncate">{video.title}</h4>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto mb-4">
              <Film className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-gray-500">No videos available yet. Check back soon.</p>
          </div>
        )}
      </div>
    </section>
  );
}
