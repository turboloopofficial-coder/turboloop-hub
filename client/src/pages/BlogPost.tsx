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
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #f0fdfa 100%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", borderColor: "rgba(0,0,0,0.06)" }}>
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
              <span className="text-base font-bold cursor-pointer">
                <span className="text-slate-800">Turbo</span>
                <span className="text-cyan-600">Loop</span>
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

      <div className="container max-w-3xl pt-12 pb-20">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 rounded w-3/4 animate-pulse" style={{ background: "rgba(0,0,0,0.05)" }} />
            <div className="h-4 rounded w-1/4 animate-pulse" style={{ background: "rgba(0,0,0,0.03)" }} />
            <div className="h-64 rounded mt-8 animate-pulse" style={{ background: "rgba(0,0,0,0.03)" }} />
          </div>
        ) : post ? (
          <article>
            {post.coverImage && (
              <img src={post.coverImage} alt={post.title} className="w-full h-56 md:h-72 object-cover rounded-xl mb-8" />
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 leading-tight">{post.title}</h1>
            <p className="text-sm text-slate-400 mb-10">
              {new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-cyan-700 prose-blockquote:border-cyan-500/30 prose-blockquote:text-slate-600 prose-a:text-cyan-600 prose-li:text-slate-600">
              <Streamdown>{post.content}</Streamdown>
            </div>
          </article>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">Post not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
