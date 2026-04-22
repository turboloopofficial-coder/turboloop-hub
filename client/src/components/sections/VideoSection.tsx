import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { LANGUAGE_FLAGS } from "@/lib/constants";
import { motion } from "framer-motion";
import { Play, Film } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      (v) =>
        v.category === activeCategory &&
        (activeLanguage === "all" || v.language === activeLanguage)
    );
  }, [videos, activeCategory, activeLanguage]);

  return (
    <section id="videos" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-sm text-cyan-300 mb-6">
            <Film className="h-4 w-4" />
            Video Hub
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-white">Watch & </span>
            <span className="text-gradient">Learn</span>
          </h2>
          <p className="text-gray-400 text-lg">Available in 12+ languages</p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {(categories.length > 0 ? categories : (["presentation", "how-to-join", "withdraw-compound"] as VideoCategory[])).map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => { setActiveCategory(cat); setActiveLanguage("all"); }}
              className={activeCategory === cat
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30"
                : "border-gray-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 bg-transparent"
              }
            >
              {CATEGORY_LABELS[cat]}
            </Button>
          ))}
        </div>

        {/* Language Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveLanguage("all")}
            className={activeLanguage === "all" ? "text-cyan-400 bg-cyan-500/10" : "text-gray-500 hover:text-gray-300"}
          >
            All
          </Button>
          {languages.map((lang) => (
            <Button
              key={lang}
              variant="ghost"
              size="sm"
              onClick={() => setActiveLanguage(lang)}
              className={activeLanguage === lang ? "text-cyan-400 bg-cyan-500/10" : "text-gray-500 hover:text-gray-300"}
            >
              <span className="mr-1">{LANGUAGE_FLAGS[lang] || "🏳️"}</span> {lang}
            </Button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="rounded-xl border border-cyan-500/10 bg-[#0d1425]/60 overflow-hidden hover:border-cyan-500/25 transition-all">
                  {/* Thumbnail / Player */}
                  <div className="relative aspect-video bg-[#0a0f1e]">
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
                            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                          />
                        )}
                        <button
                          onClick={() => setPlayingId(video.id)}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center group-hover:bg-cyan-500/30 group-hover:scale-110 transition-all">
                            <Play className="h-6 w-6 text-cyan-400 ml-1" />
                          </div>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{video.languageFlag}</span>
                      <span className="text-xs text-gray-500">{video.language}</span>
                    </div>
                    <h4 className="text-sm font-heading font-semibold text-white truncate">{video.title}</h4>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Film className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No videos available yet. Check back soon.</p>
          </div>
        )}
      </div>
    </section>
  );
}
