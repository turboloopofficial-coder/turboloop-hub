import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { ArrowRight, PenLine } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

function BlogCard({ post, index }: { post: any; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/blog/${post.slug}`}>
        <div
          className="group relative rounded-xl overflow-hidden h-full transition-all duration-400"
          style={{
            background: "linear-gradient(135deg, rgba(13,20,40,0.7) 0%, rgba(13,20,40,0.4) 100%)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${hovered ? "rgba(192,132,252,0.2)" : "rgba(255,255,255,0.04)"}`,
            boxShadow: hovered ? "0 0 40px rgba(192,132,252,0.08)" : "none",
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1428] via-transparent to-transparent" />
            </div>
          )}

          <div className="p-6">
            {/* Top glow line when no image */}
            {!post.coverImage && (
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(192,132,252,0.3), transparent)", opacity: hovered ? 1 : 0.3, transition: "opacity 0.4s" }}
              />
            )}

            <p className="text-xs text-gray-500 mb-3">
              {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <h3 className="text-lg font-heading font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{post.excerpt}</p>
            )}
            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
              Read more <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function BlogSection() {
  const { data: posts } = trpc.content.blogPosts.useQuery();

  return (
    <section id="blog" className="relative section-padding overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(192,132,252,0.04) 0%, transparent 60%)" }} />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm text-purple-300/80 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Blog & Updates
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-5">
            <span className="text-white">Latest</span>{" "}
            <span className="text-gradient">News</span>
          </h2>
        </motion.div>

        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {posts.slice(0, 6).map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
              <PenLine className="h-7 w-7 text-purple-400/50" />
            </div>
            <p className="text-gray-500 text-sm">Blog posts coming soon. Stay tuned for updates, deep dives, and community highlights.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
