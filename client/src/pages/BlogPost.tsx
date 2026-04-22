import { trpc } from "@/lib/trpc";
import { SITE } from "@/lib/constants";
import { useRoute, Link } from "wouter";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Streamdown } from "streamdown";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  const { data: post, isLoading } = trpc.content.blogPost.useQuery({ slug });

  return (
    <div className="min-h-screen" style={{ background: "#060a16" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: "rgba(6,10,22,0.9)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/#blog">
              <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </Link>
            <div className="h-5 w-px bg-gray-800" />
            <Link href="/">
              <span className="text-base font-bold cursor-pointer">
                <span className="text-white">Turbo</span>
                <span className="text-cyan-400">Loop</span>
              </span>
            </Link>
          </div>
          <a
            href={SITE.mainApp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Launch App <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </header>

      <div className="container max-w-3xl pt-12 pb-20">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 rounded w-3/4 animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="h-4 rounded w-1/4 animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
            <div className="h-64 rounded mt-8 animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
          </div>
        ) : post ? (
          <article>
            {post.coverImage && (
              <img src={post.coverImage} alt={post.title} className="w-full h-56 md:h-72 object-cover rounded-xl mb-8" />
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
            <p className="text-sm text-gray-500 mb-10">
              {new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <div className="prose prose-invert prose-cyan max-w-none prose-headings:text-white prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-cyan-300 prose-blockquote:border-cyan-500/30 prose-blockquote:text-gray-300 prose-a:text-cyan-400 prose-li:text-gray-300">
              <Streamdown>{post.content}</Streamdown>
            </div>
          </article>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Post not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
