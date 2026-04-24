import { trpc } from "@/lib/trpc";
import { SITE } from "@/lib/constants";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ArrowLeft, Play, FileText, Image, Filter, X, ExternalLink } from "lucide-react";
import SEOHead from "@/components/SEOHead";

type ContentType = "all" | "video" | "article" | "update";

const CONTENT_TYPES: { value: ContentType; label: string; icon: typeof Play }[] = [
  { value: "all", label: "All", icon: Filter },
  { value: "video", label: "Videos", icon: Play },
  { value: "article", label: "Articles", icon: FileText },
  { value: "update", label: "Updates", icon: Image },
];

export default function FeedPage() {
  const { data: videos } = trpc.content.videos.useQuery();
  const { data: posts } = trpc.content.blogPosts.useQuery();
  const [filter, setFilter] = useState<ContentType>("all");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const seoTitle = "Content Feed — Videos, Articles & Updates | Turbo Loop";
  const seoDesc = "Latest Turbo Loop videos, blog articles, and community updates — in one place. Multi-language educational content on sustainable DeFi yield farming.";

  // Combine videos and posts into a unified feed
  const feedItems = useMemo(() => {
    const items: any[] = [];

    if (videos) {
      videos.forEach(v => {
        items.push({
          type: "video" as const,
          id: `v-${v.id}`,
          title: v.title,
          category: v.category,
          language: v.language,
          youtubeUrl: v.youtubeUrl,
          thumbnail: v.youtubeUrl ? `https://img.youtube.com/vi/${v.youtubeUrl.split("/").pop()?.split("?")[0]}/hqdefault.jpg` : "",
          createdAt: v.createdAt,
        });
      });
    }

    if (posts) {
      posts.forEach(p => {
        items.push({
          type: "article" as const,
          id: `p-${p.id}`,
          title: p.title,
          excerpt: p.excerpt,
          slug: p.slug,
          coverImage: p.coverImage,
          createdAt: p.createdAt,
        });
      });
    }

    // Sort by date, newest first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filter === "all") return items;
    return items.filter(i => i.type === filter);
  }, [videos, posts, filter]);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #f0fdfa 100%)" }}>
      <SEOHead title={seoTitle} description={seoDesc} path="/feed" type="website" />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Home
              </button>
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <h1 className="text-lg font-bold text-slate-800">Content Feed</h1>
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

      <div className="container py-8">
        {/* Filter pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {CONTENT_TYPES.map(ct => {
            const Icon = ct.icon;
            const isActive = filter === ct.value;
            return (
              <button
                key={ct.value}
                onClick={() => setFilter(ct.value)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300"
                style={{
                  background: isActive ? "rgba(8,145,178,0.1)" : "rgba(255,255,255,0.6)",
                  border: `1px solid ${isActive ? "rgba(8,145,178,0.25)" : "rgba(0,0,0,0.06)"}`,
                  color: isActive ? "#0891B2" : "#64748B",
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {ct.label}
              </button>
            );
          })}
        </div>

        {/* Feed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {feedItems.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.7)",
                border: "1px solid rgba(255,255,255,0.85)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(8,145,178,0.2)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 40px rgba(8,145,178,0.08), 0 4px 16px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.85)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.04)";
              }}
              onClick={() => {
                if (item.type === "video") {
                  setSelectedVideo(item);
                } else if (item.slug) {
                  window.location.href = `/blog/${item.slug}`;
                }
              }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                {item.type === "video" ? (
                  <>
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(8,145,178,0.9)" }}>
                        <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
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
                  <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(8,145,178,0.06), rgba(124,58,237,0.06))" }}>
                    <FileText className="h-10 w-10 text-slate-300" />
                  </div>
                )}

                {/* Type badge */}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider"
                    style={{
                      background: item.type === "video" ? "rgba(8,145,178,0.85)" : "rgba(124,58,237,0.85)",
                      color: "#ffffff",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    {item.type}
                  </span>
                </div>

                {/* Language badge for videos */}
                {item.language && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md uppercase"
                      style={{ background: "rgba(0,0,0,0.5)", color: "#E5E7EB", backdropFilter: "blur(10px)" }}
                    >
                      {item.language}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-cyan-700 transition-colors duration-300">
                  {item.title}
                </h3>
                {item.excerpt && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{item.excerpt}</p>
                )}
                {item.category && (
                  <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider">{item.category}</p>
                )}
              </div>
            </div>
          ))}
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
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="aspect-video rounded-xl overflow-hidden" style={{ background: "#000" }}>
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeUrl.split("/").pop()?.split("?")[0]}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h3 className="text-lg font-bold text-white mt-4">{selectedVideo.title}</h3>
            {selectedVideo.language && (
              <p className="text-sm text-gray-400 mt-1">{selectedVideo.language} &middot; {selectedVideo.category}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
