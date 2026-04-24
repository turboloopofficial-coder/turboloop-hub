import { trpc } from "@/lib/trpc";
import { ArrowRight, PenLine } from "lucide-react";
import { Link } from "wouter";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";
import ShareButton from "@/components/ShareButton";

function BlogCard({ post, index }: { post: any; index: number }) {
  return (
    <AnimatedSection delay={index * 0.1}>
      <Link href={`/blog/${post.slug}`}>
        <div
          className="group relative rounded-xl overflow-hidden h-full cursor-pointer"
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            border: "1px solid rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            transition: "border-color 0.4s, box-shadow 0.4s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)";
            e.currentTarget.style.boxShadow = "0 8px 40px rgba(124,58,237,0.08), 0 4px 16px rgba(0,0,0,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.85)";
            e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.04)";
          }}
        >
          {/* Cover image */}
          {post.coverImage && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
            </div>
          )}

          <div className="p-6">
            {/* Top accent line when no image */}
            {!post.coverImage && (
              <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "linear-gradient(90deg, transparent, rgba(192,132,252,0.3), transparent)" }}
              />
            )}

            <p className="text-xs text-slate-400 mb-3">
              {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-cyan-600 transition-colors duration-300">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{post.excerpt}</p>
            )}
            <div className="mt-5 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-cyan-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                Read more <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="z-10">
                <ShareButton
                  path={`/blog/${post.slug}`}
                  message={`📖 ${post.title}\n\n${post.excerpt || "Read on Turbo Loop — the complete DeFi ecosystem on BSC."}`}
                  variant="icon"
                  label="Share"
                />
              </span>
            </div>
          </div>
        </div>
      </Link>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {posts.slice(0, 6).map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
        ) : (
          <AnimatedSection>
            <div className="max-w-md mx-auto text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.06)" }}
              >
                <PenLine className="h-7 w-7 text-purple-400/50" />
              </div>
              <p className="text-slate-400 text-sm">Blog posts coming soon. Stay tuned for updates, deep dives, and community highlights.</p>
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}
