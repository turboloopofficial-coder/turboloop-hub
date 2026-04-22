import { trpc } from "@/lib/trpc";
import { useRoute } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Streamdown } from "streamdown";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  const { data: post, isLoading } = trpc.content.blogPost.useQuery({ slug });

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">
      <Navbar />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(34,211,238,0.03) 0%, transparent 60%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(192,132,252,0.03) 0%, transparent 60%)" }} />
      </div>

      <div className="container relative z-10 pt-28 pb-20 max-w-3xl">
        <Link href="/#blog">
          <span className="inline-flex items-center gap-2 text-sm text-cyan-400/70 hover:text-cyan-300 mb-8 cursor-pointer transition-colors duration-300">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </span>
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 rounded w-3/4 animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="h-4 rounded w-1/4 animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
            <div className="h-64 rounded mt-8 animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
          </div>
        ) : post ? (
          <article>
            {post.coverImage && (
              <img src={post.coverImage} alt={post.title} className="w-full h-64 object-cover rounded-xl mb-8" />
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 leading-tight">{post.title}</h1>
            <p className="text-sm text-gray-500 mb-10">
              {new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <div
              className="rounded-2xl p-6 md:p-10"
              style={{
                background: "linear-gradient(135deg, rgba(13,20,40,0.6) 0%, rgba(13,20,40,0.3) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div className="prose prose-invert prose-cyan max-w-none prose-headings:font-heading prose-headings:text-white prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-cyan-300 prose-blockquote:border-cyan-500/30 prose-blockquote:text-gray-300 prose-a:text-cyan-400 prose-li:text-gray-300">
                <Streamdown>{post.content}</Streamdown>
              </div>
            </div>
          </article>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Post not found.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
