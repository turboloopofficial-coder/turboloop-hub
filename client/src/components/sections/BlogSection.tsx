import { trpc } from "@/lib/trpc";
import { ArrowRight, PenLine, Calendar, Clock } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";
import ShareButton from "@/components/ShareButton";

// Color palette cycled per blog post (so cards have visual rhythm)
const COVER_PALETTES = [
  { from: "#0891B2", to: "#7C3AED", soft: "#CFFAFE" }, // cyan → purple
  { from: "#7C3AED", to: "#EC4899", soft: "#DDD6FE" }, // purple → pink
  { from: "#10B981", to: "#0891B2", soft: "#A7F3D0" }, // green → cyan
  { from: "#D97706", to: "#EC4899", soft: "#FED7AA" }, // amber → pink
  { from: "#0F172A", to: "#7C3AED", soft: "#E0E7FF" }, // slate → purple
  { from: "#0891B2", to: "#10B981", soft: "#CFFAFE" }, // cyan → green
];

function readingTime(content: string): number {
  const words = content?.split(/\s+/).length || 0;
  return Math.max(1, Math.round(words / 200));
}

function CoverArt({ palette, title }: { palette: typeof COVER_PALETTES[0]; title: string }) {
  // Use first letter of title as a giant decorative letter
  const letter = title?.[0]?.toUpperCase() || "T";
  return (
    <div
      className="relative h-44 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
      }}
    >
      {/* Diagonal shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.2) 45%, transparent 60%)`,
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
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Decorative letter */}
      <div
        className="absolute -right-2 -bottom-8 font-bold leading-none select-none pointer-events-none"
        style={{
          fontSize: "12rem",
          color: "rgba(255,255,255,0.18)",
          fontFamily: "var(--font-heading)",
          textShadow: "0 4px 30px rgba(0,0,0,0.15)",
        }}
      >
        {letter}
      </div>
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
}

function BlogCard({ post, index }: { post: any; index: number }) {
  const palette = COVER_PALETTES[index % COVER_PALETTES.length];
  const minutes = readingTime(post.content);

  return (
    <AnimatedSection delay={index * 0.08}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative rounded-2xl overflow-hidden h-full"
        style={{
          background: "white",
          border: "1px solid rgba(15,23,42,0.06)",
          boxShadow: "0 6px 20px -6px rgba(15,23,42,0.06), 0 2px 6px -2px rgba(15,23,42,0.04)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 25px 60px -12px ${palette.from}30, 0 8px 20px -4px rgba(15,23,42,0.08)`;
          e.currentTarget.style.borderColor = `${palette.from}25`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 6px 20px -6px rgba(15,23,42,0.06), 0 2px 6px -2px rgba(15,23,42,0.04)";
          e.currentTarget.style.borderColor = "rgba(15,23,42,0.06)";
        }}
      >
        <Link href={`/blog/${post.slug}`}>
          <div className="cursor-pointer">
            {post.coverImage ? (
              <div className="relative h-44 overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            ) : (
              <CoverArt palette={palette} title={post.title} />
            )}
          </div>
        </Link>

        <div className="p-6">
          {/* Meta */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {minutes} min read
              </span>
            </div>
            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <ShareButton
                path={`/blog/${post.slug}`}
                message={`📖 ${post.title}\n\n${post.excerpt || "Read on Turbo Loop — the complete DeFi ecosystem on BSC."}`}
                variant="icon"
              />
            </div>
          </div>

          <Link href={`/blog/${post.slug}`}>
            <div className="cursor-pointer">
              <h3
                className="text-lg font-bold text-slate-900 mb-2 leading-tight line-clamp-2 transition-colors group-hover:text-cyan-700"
                style={{ minHeight: "2.5rem" }}
              >
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
              )}

              <div
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-300"
                style={{ color: palette.from }}
              >
                Read full article
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </motion.div>
    </AnimatedSection>
  );
}

export default function BlogSection() {
  const { data: posts } = trpc.content.blogPosts.useQuery();

  return (
    <section id="blog" className="section-spacing relative">
      <div className="container">
        <SectionHeading
          label="Blog & Updates"
          title="Latest News"
          subtitle="Deep dives, community highlights, and ecosystem updates."
        />

        {posts && posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {posts.slice(0, 6).map((post, index) => (
                <BlogCard key={post.id} post={post} index={index} />
              ))}
            </div>

            {posts.length > 6 && (
              <AnimatedSection delay={0.5}>
                <div className="flex justify-center mt-12">
                  <Link href="/feed">
                    <button
                      className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300"
                      style={{
                        background: "white",
                        border: "1px solid rgba(15,23,42,0.08)",
                        color: "#0F172A",
                        boxShadow: "0 4px 14px -4px rgba(15,23,42,0.08)",
                      }}
                    >
                      Browse all articles
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </AnimatedSection>
            )}
          </>
        ) : (
          <AnimatedSection>
            <div className="max-w-md mx-auto text-center py-12">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.06)" }}
              >
                <PenLine className="h-7 w-7 text-purple-400/50" />
              </div>
              <p className="text-slate-400 text-sm">
                Blog posts coming soon. Stay tuned for updates, deep dives, and community highlights.
              </p>
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}
