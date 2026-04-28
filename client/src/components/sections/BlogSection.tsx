import { trpc } from "@/lib/trpc";
import { ArrowRight, PenLine, Calendar, Clock } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";
import ShareButton from "@/components/ShareButton";
import { paletteForSlug, topicForSlug, readingTime, publishDate } from "@/lib/blogVisuals";

function CoverArt({ slug, title }: { slug: string; title: string }) {
  const palette = paletteForSlug(slug);
  const topic = topicForSlug(slug);
  return (
    <div
      className="relative h-48 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.via} 50%, ${palette.to} 100%)`,
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
      {/* Big topic emoji as visual anchor */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{
          fontSize: "5.5rem",
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.25))",
        }}
      >
        {topic.emoji}
      </div>
      {/* Topic tag (top-left) */}
      <div
        className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase backdrop-blur-md"
        style={{
          background: "rgba(255,255,255,0.95)",
          color: palette.from,
        }}
      >
        {topic.tag}
      </div>
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}

function BlogCard({ post, index }: { post: any; index: number }) {
  const palette = paletteForSlug(post.slug);
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
              <CoverArt slug={post.slug} title={post.title} />
            )}
          </div>
        </Link>

        <div className="p-6">
          {/* Meta */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {publishDate(post).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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

/**
 * FEATURED HERO CARD — the most-recent post gets a giant magazine-style spread.
 * Spans the full width on the left side of the magazine layout (or full-width on mobile).
 */
function FeaturedCard({ post }: { post: any }) {
  const palette = paletteForSlug(post.slug);
  const topic = topicForSlug(post.slug);
  const minutes = readingTime(post.content);

  return (
    <Link href={`/blog/${post.slug}`}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group cursor-pointer rounded-3xl overflow-hidden h-full flex flex-col"
        style={{
          boxShadow: `0 20px 50px -16px ${palette.from}40, 0 6px 20px -6px rgba(15,23,42,0.06)`,
          background: "white",
          border: `1px solid ${palette.from}15`,
        }}
      >
        {/* Big gradient cover with topic emoji */}
        <div
          className="relative aspect-[16/10] overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.via} 50%, ${palette.to} 100%)`,
          }}
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 45%, transparent 60%)",
              backgroundSize: "200% 200%",
            }}
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Big emoji */}
          <div
            className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
            style={{ fontSize: "10rem", filter: "drop-shadow(0 12px 40px rgba(0,0,0,0.25))" }}
          >
            {topic.emoji}
          </div>

          {/* Featured + topic pills (top) */}
          <div className="absolute top-5 left-5 flex flex-wrap gap-2">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md"
              style={{ background: "rgba(255,255,255,0.95)" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: palette.from }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: palette.from }} />
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: palette.from }}>
                Featured
              </span>
            </div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md"
              style={{ background: "rgba(15,23,42,0.55)" }}
            >
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/95">
                {topic.tag}
              </span>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        {/* Body */}
        <div className="p-7 md:p-9 flex-1 flex flex-col">
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {publishDate(post).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {minutes} min read
            </span>
          </div>

          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-3 transition-colors group-hover:text-cyan-700"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="text-base md:text-lg text-slate-600 leading-relaxed line-clamp-3 mb-5">
              {post.excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between">
            <div
              className="inline-flex items-center gap-1.5 text-base font-bold transition-all duration-300"
              style={{ color: palette.from }}
            >
              Read full article
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <ShareButton
                path={`/blog/${post.slug}`}
                message={`📖 ${post.title}\n\n${post.excerpt || "Read on Turbo Loop — the complete DeFi ecosystem on BSC."}`}
                variant="icon"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/** Compact side card for the magazine layout */
function CompactCard({ post }: { post: any }) {
  const palette = paletteForSlug(post.slug);
  const topic = topicForSlug(post.slug);
  const minutes = readingTime(post.content);

  return (
    <Link href={`/blog/${post.slug}`}>
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group cursor-pointer rounded-2xl overflow-hidden flex gap-4 p-3 transition-all"
        style={{ background: "white", border: "1px solid rgba(15,23,42,0.06)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${palette.from}25`;
          e.currentTarget.style.boxShadow = `0 16px 30px -10px ${palette.from}25`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(15,23,42,0.06)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Mini gradient thumb with emoji */}
        <div
          className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${palette.from}, ${palette.via}, ${palette.to})`,
          }}
        >
          <span
            style={{ fontSize: "3rem", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}
          >
            {topic.emoji}
          </span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 py-1">
          <div
            className="text-[10px] font-bold tracking-[0.18em] uppercase mb-1"
            style={{ color: palette.from }}
          >
            {topic.tag}
          </div>
          <h3 className="text-sm md:text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-2 transition-colors group-hover:text-cyan-700">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {publishDate(post).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {minutes} min
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function BlogSection() {
  const { data: posts } = trpc.content.blogPosts.useQuery();

  // Sort by display date (newest publish-date first)
  const sortedPosts = posts
    ? [...posts].sort((a, b) => publishDate(b).getTime() - publishDate(a).getTime())
    : [];

  // Magazine layout: 1 featured + 4 compact (= 5 latest)
  const featured = sortedPosts[0];
  const compact = sortedPosts.slice(1, 5);
  const grid = sortedPosts.slice(5, 11); // remaining 6 in 3-col grid below

  return (
    <section id="blog" className="section-spacing relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-32 -right-40 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-32 -left-40 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(8,145,178,0.06), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="container">
        <SectionHeading
          label="The Editorial"
          title="Stories, Strategies & Deep Dives"
          subtitle="Original writing on DeFi mechanics, security, and the global community building Turbo Loop."
        />

        {sortedPosts.length > 0 ? (
          <>
            {/* Magazine layout: featured (left, 60%) + compact stack (right, 40%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 max-w-7xl mx-auto mb-10">
              <AnimatedSection className="lg:col-span-7">
                <FeaturedCard post={featured} />
              </AnimatedSection>
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-slate-500">
                    More articles
                  </span>
                  <Link href="/feed">
                    <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-cyan-700 hover:text-cyan-800 cursor-pointer">
                      View all →
                    </span>
                  </Link>
                </div>
                {compact.map((post, i) => (
                  <AnimatedSection key={post.id} delay={0.05 + i * 0.05}>
                    <CompactCard post={post} />
                  </AnimatedSection>
                ))}
              </div>
            </div>

            {/* Bottom 3-col grid for older posts */}
            {grid.length > 0 && (
              <>
                <div className="flex items-center gap-3 max-w-7xl mx-auto mb-6">
                  <div
                    className="h-px flex-1"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(8,145,178,0.25))" }}
                  />
                  <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-slate-500">
                    Recent posts
                  </span>
                  <div
                    className="h-px flex-1"
                    style={{ background: "linear-gradient(90deg, rgba(124,58,237,0.25), transparent)" }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                  {grid.map((post, index) => (
                    <BlogCard key={post.id} post={post} index={index} />
                  ))}
                </div>
              </>
            )}

            {sortedPosts.length > 11 && (
              <AnimatedSection delay={0.5}>
                <div className="flex justify-center mt-12">
                  <Link href="/feed">
                    <button
                      className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                        color: "white",
                        boxShadow: "0 12px 30px -8px rgba(8,145,178,0.5)",
                      }}
                    >
                      Browse all {sortedPosts.length} articles
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
