import { trpc } from "@/lib/trpc";
import { SITE } from "@/lib/constants";
import { useRoute, Link } from "wouter";
import { ArrowLeft, ExternalLink, ChevronRight, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Streamdown } from "streamdown";
import ShareButton from "@/components/ShareButton";
import SEOHead from "@/components/SEOHead";
import ReadingProgress from "@/components/ReadingProgress";
import BackToTop from "@/components/BackToTop";

// Same gradient palette used by the BlogSection cards — pick deterministically by slug
// so a post's hero gradient matches its card on the listing page.
const COVER_PALETTES = [
  { from: "#0891B2", via: "#22D3EE", to: "#7C3AED" },
  { from: "#7C3AED", via: "#A78BFA", to: "#EC4899" },
  { from: "#10B981", via: "#34D399", to: "#0891B2" },
  { from: "#D97706", via: "#FBBF24", to: "#EC4899" },
  { from: "#0F172A", via: "#475569", to: "#7C3AED" },
  { from: "#0891B2", via: "#10B981", to: "#F59E0B" },
];

function paletteForSlug(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return COVER_PALETTES[h % COVER_PALETTES.length];
}

function readingTime(content: string): number {
  const words = content?.split(/\s+/).length || 0;
  return Math.max(1, Math.round(words / 200));
}

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  const { data: post, isLoading } = trpc.content.blogPost.useQuery({ slug });
  const { data: allPosts } = trpc.content.blogPosts.useQuery();

  const related = (allPosts ?? []).filter(p => p.slug !== slug).slice(0, 3);

  const jsonLd = post ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: { "@type": "Organization", name: "Turbo Loop" },
    publisher: {
      "@type": "Organization",
      name: "Turbo Loop",
      logo: { "@type": "ImageObject", url: "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://turboloop.tech/blog/${slug}` },
    image: post.coverImage || "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png",
    articleBody: post.content,
  } : undefined;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #f0fdfa 100%)" }}>
      <ReadingProgress />
      <BackToTop />
      {post && (
        <SEOHead
          title={`${post.title} | Turbo Loop Blog`}
          description={post.excerpt || post.title}
          path={`/blog/${post.slug}`}
          type="article"
          image={post.coverImage || undefined}
          publishedTime={typeof post.createdAt === "string" ? post.createdAt : new Date(post.createdAt).toISOString()}
          author="Turbo Loop"
          jsonLd={jsonLd}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/feed">
              <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                All Posts
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
                      background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
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

      <div className="container max-w-3xl pt-8 pb-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
          <Link href="/"><span className="hover:text-slate-600 cursor-pointer">Home</span></Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/feed"><span className="hover:text-slate-600 cursor-pointer">Blog</span></Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-500 truncate max-w-[200px]">{post?.title || "Loading…"}</span>
        </nav>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 rounded w-3/4 animate-pulse" style={{ background: "rgba(0,0,0,0.05)" }} />
            <div className="h-4 rounded w-1/4 animate-pulse" style={{ background: "rgba(0,0,0,0.03)" }} />
            <div className="h-64 rounded mt-8 animate-pulse" style={{ background: "rgba(0,0,0,0.03)" }} />
          </div>
        ) : post ? (
          <article>
            {/* Premium hero banner */}
            {(() => {
              const palette = paletteForSlug(post.slug);
              const minutes = readingTime(post.content);
              const letter = (post.title?.[0] || "T").toUpperCase();
              return (
                <div
                  className="relative rounded-3xl overflow-hidden mb-10"
                  style={{
                    boxShadow: `0 30px 60px -20px ${palette.from}40`,
                  }}
                >
                  {post.coverImage ? (
                    <div className="relative aspect-[2/1] overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    </div>
                  ) : (
                    <div
                      className="relative aspect-[2/1] overflow-hidden"
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
                        className="absolute inset-0 opacity-25 pointer-events-none"
                        style={{
                          backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
                          backgroundSize: "32px 32px",
                        }}
                      />
                      {/* Decorative giant letter */}
                      <div
                        className="absolute -right-6 -bottom-16 select-none pointer-events-none font-bold leading-none"
                        style={{
                          fontSize: "20rem",
                          color: "rgba(255,255,255,0.18)",
                          fontFamily: "var(--font-heading)",
                        }}
                      >
                        {letter}
                      </div>
                      {/* Bottom dark gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                  )}

                  {/* Title overlay at the bottom of the banner */}
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.95)" }}>
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: palette.from }}>
                        Turbo Loop · Blog
                      </span>
                    </div>
                    <h1
                      className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.05] mb-3 max-w-3xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {post.title}
                    </h1>
                    <div className="flex items-center gap-4 text-white/90 text-sm flex-wrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {minutes} min read
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Excerpt + share row */}
            {post.excerpt && (
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-6 italic font-light border-l-4 pl-4" style={{ borderColor: paletteForSlug(post.slug).from }}>
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center justify-end mb-10 flex-wrap gap-3">
              <ShareButton
                path={`/blog/${post.slug}`}
                message={`📖 ${post.title}\n\n${post.excerpt || "Read on Turbo Loop — the complete DeFi ecosystem on BSC."}`}
                label="Share this post"
                variant="solid"
              />
            </div>
            <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-cyan-700 prose-blockquote:border-cyan-500/30 prose-blockquote:text-slate-600 prose-a:text-cyan-600 prose-li:text-slate-600">
              <Streamdown>{post.content}</Streamdown>
            </div>
            <div className="mt-12 pt-8 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm text-slate-500">Enjoyed this? Share it — your referral code auto-attaches.</p>
              <ShareButton
                path={`/blog/${post.slug}`}
                message={`📖 ${post.title}\n\n${post.excerpt || "Read on Turbo Loop — the complete DeFi ecosystem on BSC."}`}
                label="Share"
                variant="solid"
              />
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <section className="mt-16 pt-10 border-t border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-5">Keep Reading</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {related.map((r) => (
                    <Link key={r.id} href={`/blog/${r.slug}`}>
                      <div className="group p-5 rounded-xl bg-white/60 hover:bg-white border border-slate-200/60 hover:border-cyan-300/60 hover:shadow-lg cursor-pointer transition-all">
                        <p className="text-[11px] text-slate-400 mb-2">
                          {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-cyan-700 line-clamp-2 leading-tight mb-2">
                          {r.title}
                        </h3>
                        {r.excerpt && (
                          <p className="text-xs text-slate-500 line-clamp-2">{r.excerpt}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">Post not found.</p>
            <Link href="/feed">
              <button className="mt-4 text-cyan-600 hover:text-cyan-700 text-sm font-medium">← All posts</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
