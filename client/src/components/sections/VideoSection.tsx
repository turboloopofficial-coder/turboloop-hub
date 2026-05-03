import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { LANGUAGE_FLAGS, getFlagUrl } from "@/lib/constants";
import { Play, Film } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";
import ShareButton from "@/components/ShareButton";

type VideoCategory =
  | "presentation"
  | "how-to-join"
  | "withdraw-compound"
  | "other";

const CATEGORY_LABELS: Record<VideoCategory, string> = {
  presentation: "Project Presentation",
  "how-to-join": "How to Join",
  "withdraw-compound": "Withdraw, Compound & Refer",
  other: "Other",
};

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function VideoSection() {
  const { data: allVideos } = trpc.content.videos.useQuery();
  // Exclude reels (directUrl-only videos) — they're shown in ReelsSection
  const videos = useMemo(
    () => (allVideos ?? []).filter(v => v.youtubeUrl),
    [allVideos]
  );
  const [activeCategory, setActiveCategory] =
    useState<VideoCategory>("presentation");
  const [activeLanguage, setActiveLanguage] = useState<string>("all");
  const [playingId, setPlayingId] = useState<number | null>(null);

  const categories = useMemo(() => {
    if (!videos) return [];
    const cats = Array.from(
      new Set(videos.map(v => v.category))
    ) as VideoCategory[];
    return cats.filter(c => c in CATEGORY_LABELS);
  }, [videos]);

  const languages = useMemo(() => {
    if (!videos) return [];
    return Array.from(
      new Set(
        videos.filter(v => v.category === activeCategory).map(v => v.language)
      )
    );
  }, [videos, activeCategory]);

  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    return videos.filter(
      v =>
        v.category === activeCategory &&
        (activeLanguage === "all" || v.language === activeLanguage)
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
          {(categories.length > 0
            ? categories
            : ([
                "presentation",
                "how-to-join",
                "withdraw-compound",
              ] as VideoCategory[])
          ).map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setActiveLanguage("all");
                setPlayingId(null);
              }}
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                background:
                  activeCategory === cat
                    ? "rgba(8,145,178,0.1)"
                    : "rgba(255,255,255,0.6)",
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
            onClick={() => {
              setActiveLanguage("all");
              setPlayingId(null);
            }}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
            style={{
              background:
                activeLanguage === "all"
                  ? "rgba(8,145,178,0.1)"
                  : "rgba(255,255,255,0.6)",
              border: `1px solid ${activeLanguage === "all" ? "rgba(8,145,178,0.25)" : "rgba(0,0,0,0.06)"}`,
              color: activeLanguage === "all" ? "#0891B2" : "#64748B",
            }}
          >
            All Languages
          </button>
          {languages.map(lang => {
            const code = LANGUAGE_FLAGS[lang] || "un";
            return (
              <button
                key={lang}
                onClick={() => {
                  setActiveLanguage(lang);
                  setPlayingId(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
                style={{
                  background:
                    activeLanguage === lang
                      ? "rgba(8,145,178,0.1)"
                      : "rgba(255,255,255,0.6)",
                  border: `1px solid ${activeLanguage === lang ? "rgba(8,145,178,0.25)" : "rgba(0,0,0,0.06)"}`,
                  color: activeLanguage === lang ? "#0891B2" : "#64748B",
                }}
              >
                <img
                  src={getFlagUrl(code, 20)}
                  alt={lang}
                  className="w-4 h-3 object-cover rounded-sm"
                />
                {lang}
              </button>
            );
          })}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
          {filteredVideos.map((video, index) => {
            const ytId = video.youtubeUrl
              ? getYouTubeId(video.youtubeUrl)
              : null;
            const isPlaying = playingId === video.id;
            const langCode = LANGUAGE_FLAGS[video.language || ""] || "un";

            return (
              <AnimatedSection
                key={video.id}
                delay={Math.min(index * 0.05, 0.3)}
              >
                <div
                  className="group rounded-2xl overflow-hidden transition-all duration-400 relative"
                  style={{
                    background: "white",
                    border: "1px solid rgba(15,23,42,0.06)",
                    boxShadow: "0 6px 20px -6px rgba(15,23,42,0.06)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow =
                      "0 25px 50px -12px rgba(8,145,178,0.25), 0 8px 20px -4px rgba(0,0,0,0.06)";
                    e.currentTarget.style.borderColor = "rgba(8,145,178,0.25)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px -6px rgba(15,23,42,0.06)";
                    e.currentTarget.style.borderColor = "rgba(15,23,42,0.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Thumbnail / Player */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
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
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        )}
                        {/* Top dark gradient + bottom gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

                        {/* Language flag pill (top-left) */}
                        <div
                          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide"
                          style={{
                            background: "rgba(15,23,42,0.65)",
                            color: "white",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.15)",
                          }}
                        >
                          <img
                            src={getFlagUrl(langCode, 40)}
                            alt={`${video.language} flag`}
                            className="w-4 h-3 object-cover rounded-sm"
                          />
                          {video.language}
                        </div>

                        {/* Duration / category pill (top-right) */}
                        <div
                          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase"
                          style={{
                            background: "rgba(15,23,42,0.65)",
                            color: "white",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                        >
                          {video.category === "presentation"
                            ? "Intro"
                            : video.category === "how-to-join"
                              ? "How-To"
                              : video.category === "withdraw-compound"
                                ? "Tutorial"
                                : "Other"}
                        </div>

                        {/* Play button — premium gradient */}
                        <button
                          onClick={() => setPlayingId(video.id)}
                          className="absolute inset-0 flex items-center justify-center cursor-pointer"
                          aria-label={`Play ${video.title}`}
                        >
                          <motion.div
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-16 h-16 rounded-full flex items-center justify-center relative"
                            style={{
                              background:
                                "linear-gradient(135deg, #ffffff, #f1f5f9)",
                              boxShadow:
                                "0 8px 25px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)",
                            }}
                          >
                            {/* Pulsing ring on hover */}
                            <span
                              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{
                                background:
                                  "radial-gradient(circle, rgba(8,145,178,0.3), transparent)",
                                transform: "scale(1.5)",
                              }}
                            />
                            <Play className="h-6 w-6 text-cyan-600 ml-0.5 fill-cyan-600" />
                          </motion.div>
                        </button>

                        {/* Title overlay at bottom of thumbnail */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="text-sm font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
                            {video.title}
                          </h4>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer info */}
                  <div className="p-3.5 flex items-center justify-between gap-2 bg-white">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(8,145,178,0.1), rgba(124,58,237,0.08))",
                        }}
                      >
                        <Play className="w-3.5 h-3.5 text-cyan-600 fill-cyan-600 ml-0.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                          YouTube
                        </div>
                        <div className="text-xs font-semibold text-slate-700 truncate">
                          {video.language}
                        </div>
                      </div>
                    </div>
                    <ShareButton
                      path="/#videos"
                      message={`🎥 ${video.title}\n\nWatch on Turbo Loop — the complete DeFi ecosystem on BSC.${video.youtubeUrl ? "\n\n" + video.youtubeUrl : ""}`}
                      variant="icon"
                      label="Share"
                    />
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-16">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <Film className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-400">
              No videos available for this filter. Try another category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
