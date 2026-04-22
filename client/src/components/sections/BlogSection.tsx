import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, PenLine } from "lucide-react";
import { Link } from "wouter";

export default function BlogSection() {
  const { data: posts } = trpc.content.blogPosts.useQuery();

  return (
    <section id="blog" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-sm text-purple-300 mb-6">
            <BookOpen className="h-4 w-4" />
            Blog & Updates
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold">
            <span className="text-white">Latest </span>
            <span className="text-gradient">News</span>
          </h2>
        </motion.div>

        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {posts.slice(0, 6).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="group p-6 rounded-xl border border-purple-500/10 bg-[#0d1425]/60 hover:border-purple-500/25 transition-all h-full">
                    {post.coverImage && (
                      <img src={post.coverImage} alt={post.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                    )}
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <h3 className="text-lg font-heading font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-gray-400 line-clamp-3">{post.excerpt}</p>
                    )}
                    <div className="mt-4 flex items-center gap-1 text-sm text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Read more <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="max-w-md mx-auto text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <PenLine className="h-7 w-7 text-purple-400/50" />
            </div>
            <p className="text-gray-500 text-sm">Blog posts coming soon. Stay tuned for updates, deep dives, and community highlights.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
