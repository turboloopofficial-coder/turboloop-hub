import { trpc } from "@/lib/trpc";
import { SITE } from "@/lib/constants";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Play, FileText, Image as ImageIcon, Filter, X, ExternalLink, Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import ShareButton from "@/components/ShareButton";
import { topicForSlug } from "@/lib/blogVisuals";

type ContentType = "all" | "video" | "article" | "update";

const CONTENT_TYPES: { value: ContentType; label: string; icon: typeof Play }[] = [
  { value: "all", label: "All Content", icon: Filter },
  { value: "video", label: "Videos", icon: Play },
  { value: "article", label: "Articles", icon: FileText },
  { value: "update", label: "Updates", icon: ImageIcon },
];

// Same gradient palette as BlogSection so cover art matches between feed and listing
const COVER_PALETTES = [
  { from: "#0891B2", via: "#22D3EE", to: "#7C3AED" },
  { from: "#7C3AED", via: "#A78BFA", to: "#EC4899" },
  { from: "#10B981", via: "#34D399", to: "#0891B2" },
  { from: "#D97706", via: "#FBBF24", to: "#EC4899" },
  { from: "#0F172A", via: "#475569", to: "#7C3AED" },
  { from: "#0891B2", via: "#10B981", to: "#F59E0B" },
];

function paletteForKey(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return COVER_PALETTES[h % COVER_PALETTES.length];
}

/** Robust YouTube ID extraction (works for youtu.be, /watch?v=, /embed/, /shorts/) */
function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

function readingTime(content: string | undefined | null): number {
  if (!content) return 1;
  const words = content.split(/\s+/).length || 0;
  return Math.max(1, Math.round(words / 200));
}

/** Gradient cover art (when no real cover image is available) — used for articles and as fallback */
function CoverArt({ palette, slug }: { palette: typeof COVER_PALETTES[0]; slug: string }) {
  const topic = topicForSlug(slug || "");
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.via} 50%, ${palette.to} 100%)`,
      }}
    >
      {/* Animated diagonal shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 45%, transparent 60%)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Topic emoji as decorative anchor */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{
          fontSize: "5rem",
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.25))",
        }}
      >
        {topic.emoji}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
    </div>
  );
}

export default function FeedPage() {
  const { data: videos } = trpc.content.videos.useQuery();
  const { data: posts } = trpc.content.blogPosts.useQuery();
  const [filter, setFilter] = useState<ContentType>("all");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const seoTitle = "Content Feed — Videos, Articles & Updates | Turbo Loop";
  const seoDesc =
    "Latest Turbo Loop videos, blog articles, and community updates — in one place. Multi-language educational content on sustainable DeFi yield farming.";

  // Combine videos and posts into a unified feed
  const feedItems = useMemo(() => {
    const items: any[] = [];

    if (videos) {
      videos.forEach((v) => {
        const ytId = getYouTubeId(v.youtubeUrl);
        items.push({
          type: "video" as const,
          id: `v-${v.id}`,
          title: v.title,
          category: v.category,
          language: v.language,
          youtubeUrl: v.youtubeUrl,
          ytId,
          // Use higher-quality YouTube thumbnail (mqdefault is more reliably available than maxres)
          thumbnail: ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "",
          createdAt: v.createdAt,
        });
      });
    }

    if (posts) {
      posts.forEach((p) => {
        items.push({
          type: "article" as const,
          id: `p-${p.id}`,
          title: p.title,
          excerpt: p.excerpt,
          slug: p.slug,
          coverImage: p.coverImage,
          content: p.content,
          // Use scheduled_publish_at as the displayed date if available — otherwise fall back to created_at.
          // Without this, scheduled posts forever show their seed-into-DB date instead of when they actually went live.
          createdAt: (p as any).scheduledPublishAt || p.createdAt,
        });
      });
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filter === "all") return items;
    return items.filter((i) => i.type === filter);
  }, [videos, posts, filter]);

  // Featured = newest item, used as a hero card
  const featured = feedItems[0];
  const rest = feedItems.slice(1);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #f0fdfa 100%)",
      }}
    >
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        path="/feed"
        type="website"
      />

      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Home
              </button>
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <Link href="/">
              <span className="flex items-center gap-2 cursor-pointer">
                <img src={SITE.logo} alt="Turbo Loop" className="h-7 w-auto" />
                <span className="text-base font-bold">
                  <span className="text-slate-800">Turbo</span>
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Loop
                  </span>
                </span>
              </span>
            </Link>
          </div>
          <a
            href={SITE.mainApp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-cyan-600 hover:text-cyan-700 transition-colors"
          >
            Launch App <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </header>

      <div className="container py-10">
        {/* Page heading */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 bg-gradient-to-r from-cyan-100 to-purple-100 border border-cyan-200/50">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-xs font-semibold tracking-wider text-cyan-700 uppercase">
              Content Hub
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-slate-800">Everything in </span>
            <span
              style={{
                background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              One Feed
            </span>
          </h1>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Articles, video tutorials, and ecosystem updates — all in one place.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2">
          {CONTENT_TYPES.map((ct) => {
            const Icon = ct.icon;
            const isActive = filter === ct.value;
            const count =
              ct.value === "all"
                ? feedItems.length
                : feedItems.filter((i) => i.type === ct.value).length;
            return (
              <button
                key={ct.value}
                onClick={() => setFilter(ct.value)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #0891B2, #7C3AED)"
                    : "white",
                  color: isActive ? "white" : "#64748B",
                  border: `1px solid ${
                    isActive ? "transparent" : "rgba(15,23,42,0.08)"
                  }`,
                  boxShadow: isActive
                    ? "0 8px 20px -6px rgba(8,145,178,0.4)"
                    : "0 2px 6px -2px rgba(15,23,42,0.04)",
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {ct.label}
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(15,23,42,0.06)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Featured hero — most recent item */}
        {featured && filter === "all" && (
          <div
            className="relative rounded-3xl overflow-hidden mb-10 cursor-pointer group"
            onClick={() => {
              if (featured.type === "video") {
                setSelectedVideo(featured);
              } else if (featured.slug) {
                window.location.href = `/blog/${featured.slug}`;
              }
            }}
            style={{
              boxShadow: `0 30px 60px -20px ${
                paletteForKey(featured.id).from
              }50`,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[280px] md:min-h-[320px]">
              {/* Cover */}
              <div className="relative aspect-video md:aspect-auto overflow-hidden">
                {featured.type === "video" && featured.thumbnail ? (
                  <img
                    src={featured.thumbnail}
                    alt={featured.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : featured.coverImage ? (
                  <img
                    src={featured.coverImage}
                    alt={featured.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <CoverArt
                    palette={paletteForKey(featured.id)}
                    slug={featured.slug || featured.id}
                  />
                )}
                {featured.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: "rgba(255,255,255,0.95)",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
                      }}
                    >
                      <Play
                        className="h-8 w-8 ml-1 fill-current"
                        style={{ color: "#0891B2" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="p-7 md:p-10 bg-white flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #10B981, #059669)",
                      color: "white",
                    }}
                  >
                    ✨ Latest
                  </span>
                  <span
                    className="text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600"
                  >
                    {featured.type === "video"
                      ? featured.category || "Video"
                      : "Article"}
                  </span>
                </div>
                <h2
                  className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-3 group-hover:text-cyan-700 transition-colors"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-base text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {featured.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-5">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(featured.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {featured.type === "article" && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {readingTime(featured.content)} min read
                    </span>
                  )}
                  {featured.language && (
                    <span className="inline-flex items-center gap-1.5">
                      🌍 {featured.language}
                    </span>
                  )}
                </div>
                <div
                  className="inline-flex items-center gap-1.5 text-sm font-bold w-fit"
                  style={{ color: paletteForKey(featured.id).from }}
                >
                  {featured.type === "video"
                    ? "Watch now"
                    : "Read full article"}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(filter === "all" ? rest : feedItems).map((item) => {
            const palette = paletteForKey(item.id);
            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 bg-white"
                style={{
                  border: "1px solid rgba(15,23,42,0.06)",
                  boxShadow: "0 6px 20px -6px rgba(15,23,42,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${palette.from}30`;
                  e.currentTarget.style.boxShadow = `0 25px 50px -12px ${palette.from}25, 0 8px 20px -4px rgba(15,23,42,0.06)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(15,23,42,0.06)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px -6px rgba(15,23,42,0.06)";
                }}
                onClick={() => {
                  if (item.type === "video") {
                    setSelectedVideo(item);
                  } else if (item.slug) {
                    window.location.href = `/blog/${item.slug}`;
                  }
                }}
              >
                {/* Thumbnail / Cover */}
                <div className="relative aspect-video overflow-hidden">
                  {item.type === "video" && item.thumbnail ? (
                    <>
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{
                            background: "rgba(255,255,255,0.95)",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                          }}
                        >
                          <Play
                            className="h-5 w-5 ml-0.5 fill-current"
                            style={{ color: palette.from }}
                          />
                        </div>
                      </div>
                    </>
                  ) : item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <CoverArt palette={palette} slug={item.slug || item.id} />
                  )}

                  {/* Type badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-[0.18em] backdrop-blur-md"
                      style={{
                        background: "rgba(255,255,255,0.95)",
                        color: palette.from,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                    >
                      {item.type === "video" ? "▶ Video" : "✎ Article"}
                    </span>
                  </div>

                  {/* Language badge */}
                  {item.language && (
                    <div className="absolute top-3 right-3">
                      <span
                        className="text-[10px] font-bold px-2 py-1 rounded-full uppercase backdrop-blur-md"
                        style={{
                          background: "rgba(15,23,42,0.65)",
                          color: "white",
                          border: "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        {item.language}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-cyan-700 transition-colors leading-snug mb-2">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {item.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {item.category && <span>{item.category}</span>}
                    {item.category && item.type === "article" && (
                      <span className="text-slate-300">·</span>
                    )}
                    {item.type === "article" && (
                      <span>{readingTime(item.content)} min read</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {feedItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400">No content found for this filter.</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-2"
            >
              <X className="h-6 w-6" />
              <span className="text-sm">Close</span>
            </button>
            <div
              className="aspect-video rounded-2xl overflow-hidden"
              style={{ background: "#000" }}
            >
              {selectedVideo.ytId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.ytId}?autoplay=1`}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/60">
                  Video unavailable
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedVideo.title}</h3>
                {selectedVideo.language && (
                  <p className="text-sm text-gray-400 mt-1">
                    {selectedVideo.language} · {selectedVideo.category}
                  </p>
                )}
              </div>
              <ShareButton
                path="/feed"
                message={`🎥 ${selectedVideo.title}\n\nWatch on Turbo Loop — the complete DeFi ecosystem on BSC.${selectedVideo.youtubeUrl ? "\n\n" + selectedVideo.youtubeUrl : ""}`}
                variant="solid"
                label="Share"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
