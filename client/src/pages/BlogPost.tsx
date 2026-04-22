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
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />
      <div className="container pt-28 pb-20 max-w-3xl">
        <Link href="/#blog">
          <span className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 mb-8 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </span>
        </Link>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-800 rounded w-1/4" />
            <div className="h-64 bg-gray-800 rounded mt-8" />
          </div>
        ) : post ? (
          <article>
            {post.coverImage && (
              <img src={post.coverImage} alt={post.title} className="w-full h-64 object-cover rounded-xl mb-8" />
            )}
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">{post.title}</h1>
            <p className="text-sm text-gray-500 mb-8">
              {new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <div className="prose prose-invert prose-cyan max-w-none">
              <Streamdown>{post.content}</Streamdown>
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
