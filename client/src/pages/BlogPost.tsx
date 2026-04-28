import { trpc } from "@/lib/trpc";
import { SITE } from "@/lib/constants";
import { useRoute, Link } from "wouter";
import { ArrowLeft, ExternalLink, ChevronRight, Calendar, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import ShareButton from "@/components/ShareButton";
import SEOHead from "@/components/SEOHead";
import ReadingProgress from "@/components/ReadingProgress";
import BackToTop from "@/components/BackToTop";
import BlogContent from "@/components/BlogContent";
import TableOfContents from "@/components/TableOfContents";
import { paletteForSlug, topicForSlug, readingTime, extractHeadings, publishDate } from "@/lib/blogVisuals";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  const { data: post, isLoading } = trpc.content.blogPost.useQuery({ slug });
  const { data: allPosts } = trpc.content.blogPosts.useQuery();

  const related = (allPosts ?? []).filter(p => p.slug !== slug).slice(0, 3);

  // Per-blog OG image: dynamic SVG with title + topic emoji + brand
  const ogImage = post ? `https://turboloop.tech/api/og?slug=${slug}` : undefined;

  // Word count for richer schema (helps Google show reading time in results)
  const wordCount = post?.content ? post.content.trim().split(/\s+/).length : undefined;

  // Article schema with breadcrumbs (richer Google results)
  const jsonLd = post ? {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://turboloop.tech/blog/${slug}#article`,
        headline: post.title,
        description: post.excerpt || post.title,
        datePublished: publishDate(post).toISOString(),
        dateModified: post.updatedAt || publishDate(post).toISOString(),
        author: { "@type": "Organization", name: "Turbo Loop", url: "https://turboloop.tech" },
        publisher: {
          "@type": "Organization",
          name: "Turbo Loop",
          logo: { "@type": "ImageObject", url: "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png" },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": `https://turboloop.tech/blog/${slug}` },
        image: ogImage,
        articleBody: post.content,
        wordCount,
        articleSection: "DeFi",
        keywords: ["Turbo Loop", "DeFi", "BSC", "Binance Smart Chain", "yield farming", "sustainable yield"],
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://turboloop.tech" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://turboloop.tech/feed" },
          { "@type": "ListItem", position: 3, name: post.title, item: `https://turboloop.tech/blog/${slug}` },
        ],
      },
    ],
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
          image={post.coverImage || ogImage}
          publishedTime={publishDate(post).toISOString()}
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

      <div className="container pt-8 pb-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 max-w-3xl mx-auto xl:mx-0 xl:ml-[calc(50%-24rem)]">
          <Link href="/"><span className="hover:text-slate-600 cursor-pointer">Home</span></Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/feed"><span className="hover:text-slate-600 cursor-pointer">Blog</span></Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-500 truncate max-w-[200px]">{post?.title || "Loading…"}</span>
        </nav>

        {isLoading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-8 rounded w-3/4 animate-pulse" style={{ background: "rgba(0,0,0,0.05)" }} />
            <div className="h-4 rounded w-1/4 animate-pulse" style={{ background: "rgba(0,0,0,0.03)" }} />
            <div className="h-64 rounded mt-8 animate-pulse" style={{ background: "rgba(0,0,0,0.03)" }} />
          </div>
        ) : post ? (
          <PostBody post={post} related={related} />
        ) : (
          <div className="text-center py-20 max-w-3xl mx-auto">
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

/**
 * Inner article body — extracted so we can use hooks (useMemo for headings).
 * Lays out as: TOC sidebar (left, xl+ only) | Article (center, max-w-3xl) | spacer (right, xl+).
 */
function PostBody({ post, related }: { post: any; related: any[] }) {
  const palette = paletteForSlug(post.slug);
  const topic = topicForSlug(post.slug);
  const minutes = readingTime(post.content);
  const headings = useMemo(() => extractHeadings(post.content || ""), [post.content]);

  return (
    <article className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_260px] gap-8 max-w-7xl mx-auto">
      {/* Left: Table of Contents */}
      <TableOfContents headings={headings} palette={palette} />

      {/* Center: Article */}
      <div className="max-w-3xl mx-auto w-full xl:mx-0">
        {/* Premium hero banner */}
        <div
          className="relative rounded-3xl overflow-hidden mb-10"
          style={{ boxShadow: `0 30px 60px -20px ${palette.from}40` }}
        >
          {post.coverImage ? (
            <div className="relative aspect-[2/1] overflow-hidden">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>
          ) : (
            <div
              className="relative aspect-[2/1] overflow-hidden"
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
              {/* Giant topic emoji as decorative anchor (replaces letter watermark) */}
              <div
                className="absolute -right-2 -bottom-12 select-none pointer-events-none"
                style={{
                  fontSize: "16rem",
                  filter: "drop-shadow(0 8px 30px rgba(0,0,0,0.2)) opacity(0.85)",
                  lineHeight: 1,
                }}
              >
                {topic.emoji}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </div>
          )}

          {/* Title overlay */}
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-sm"
                style={{ background: "rgba(255,255,255,0.95)" }}
              >
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: palette.from }}>
                  {topic.tag}
                </span>
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-sm"
                style={{ background: "rgba(15,23,42,0.45)" }}
              >
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/90">
                  Turbo Loop · Blog
                </span>
              </div>
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
                {publishDate(post).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {minutes} min read
              </span>
            </div>
          </div>
        </div>

        {/* Excerpt as premium pull-quote */}
        {post.excerpt && (
          <div
            className="relative my-8 p-6 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${palette.from}08, ${palette.via}05)`,
              border: `1px solid ${palette.from}20`,
            }}
          >
            <div
              className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
              style={{ background: `linear-gradient(180deg, ${palette.from}, ${palette.via})` }}
            />
            <p
              className="text-lg md:text-xl text-slate-700 leading-relaxed font-light pl-2"
              style={{ fontStyle: "normal" }}
            >
              {post.excerpt}
            </p>
          </div>
        )}

        {/* Author byline + share */}
        <div
          className="flex items-center justify-between flex-wrap gap-3 my-8 pb-6"
          style={{ borderBottom: "1px solid rgba(15,23,42,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shrink-0"
              style={{
                background: `linear-gradient(135deg, ${palette.from}, ${palette.via})`,
                boxShadow: `0 6px 16px -4px ${palette.from}50`,
              }}
            >
              TL
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Turbo Loop</div>
              <div className="text-xs text-slate-500">Official editorial · {topic.tag}</div>
            </div>
          </div>
          <ShareButton
            path={`/blog/${post.slug}`}
            message={`📖 ${post.title}\n\n${post.excerpt || "Read on Turbo Loop — the complete DeFi ecosystem on BSC."}`}
            label="Share"
            variant="solid"
          />
        </div>

        {/* Rich content with custom markdown */}
        <BlogContent content={post.content} palette={palette} />

        {/* End-of-article footer */}
        <div
          className="mt-16 p-6 md:p-8 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${palette.from}08, ${palette.via}05)`,
            border: `1px solid ${palette.from}15`,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{topic.emoji}</span>
            <div>
              <div className="text-sm font-bold text-slate-900">Enjoyed this post?</div>
              <div className="text-xs text-slate-500">Share it — your referral code auto-attaches.</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <ShareButton
              path={`/blog/${post.slug}`}
              message={`📖 ${post.title}\n\n${post.excerpt || "Read on Turbo Loop — the complete DeFi ecosystem on BSC."}`}
              label="Share this post"
              variant="solid"
            />
            <Link href="/feed">
              <button
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105"
                style={{
                  background: "white",
                  border: `1px solid ${palette.from}25`,
                  color: palette.from,
                }}
              >
                More articles
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="h-px flex-1"
                style={{ background: `linear-gradient(90deg, transparent, ${palette.from}30)` }}
              />
              <span
                className="text-[10px] font-bold tracking-[0.3em] uppercase"
                style={{ color: palette.from }}
              >
                Keep Reading
              </span>
              <div
                className="h-px flex-1"
                style={{ background: `linear-gradient(90deg, ${palette.from}30, transparent)` }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((r) => {
                const rPalette = paletteForSlug(r.slug);
                const rTopic = topicForSlug(r.slug);
                return (
                  <Link key={r.id} href={`/blog/${r.slug}`}>
                    <div
                      className="group h-full rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1"
                      style={{
                        background: "white",
                        border: "1px solid rgba(15,23,42,0.06)",
                        boxShadow: "0 4px 14px -4px rgba(15,23,42,0.06)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 16px 30px -10px ${rPalette.from}30`;
                        e.currentTarget.style.borderColor = `${rPalette.from}25`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 14px -4px rgba(15,23,42,0.06)";
                        e.currentTarget.style.borderColor = "rgba(15,23,42,0.06)";
                      }}
                    >
                      <div
                        className="relative h-32 overflow-hidden flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${rPalette.from}, ${rPalette.via}, ${rPalette.to})`,
                        }}
                      >
                        <span style={{ fontSize: "5rem", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}>
                          {rTopic.emoji}
                        </span>
                      </div>
                      <div className="p-5">
                        <div
                          className="inline-block text-[10px] font-bold tracking-[0.18em] uppercase mb-2"
                          style={{ color: rPalette.from }}
                        >
                          {rTopic.tag}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
                          {r.title}
                        </h3>
                        {r.excerpt && (
                          <p className="text-xs text-slate-500 line-clamp-2">{r.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Right spacer (xl+) — keeps article centered against the TOC sidebar */}
      <div className="hidden xl:block" />
    </article>
  );
}
