// Featured submissions strip — shows recent approved community submissions
// (testimonials, photos, stories, reels) on /community. Surfaces the latest
// 3-6 approved entries from the content_submissions table.
//
// Loops naturally with /submit page: visitor submits → admin approves → it
// auto-shows here on next page load. Creates a community recognition loop.

import { useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Camera, BookOpen, Film, ExternalLink, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AnimatedSection from "@/components/AnimatedSection";

const TYPE_ICONS = {
  testimonial: MessageSquare,
  story: BookOpen,
  photo: Camera,
  reel: Film,
};

const TYPE_COLORS: Record<string, string> = {
  testimonial: "#0891B2",
  story: "#7C3AED",
  photo: "#EC4899",
  reel: "#F59E0B",
};

export default function FeaturedSubmissions() {
  // Note: this calls submissions.list which is admin-only — but we expose a
  // public alternative below. See backend addition.
  const { data, isLoading } = trpc.submissions.publicApproved.useQuery(undefined, {
    // Don't refetch obsessively; community submissions don't change every minute
    refetchOnWindowFocus: false,
  });

  const featured = useMemo(() => (data ?? []).slice(0, 6), [data]);

  // Don't render the section at all if there's nothing approved yet —
  // empty state would be sad on a brand-new community page.
  if (!isLoading && featured.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container max-w-6xl">
        <AnimatedSection>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
              style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#7C3AED" }} />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#7C3AED" }}>From the community</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>
              Voices from the people building it.
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
              Real submissions from real members. Want to be featured? <a href="/submit" className="text-cyan-700 font-bold hover:text-cyan-900">Send your story →</a>
            </p>
          </div>
        </AnimatedSection>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-white p-5 animate-pulse" style={{ border: "1px solid rgba(15,23,42,0.06)", minHeight: 180 }}>
                <div className="h-3 w-20 bg-slate-100 rounded mb-3" />
                <div className="h-3 w-full bg-slate-100 rounded mb-2" />
                <div className="h-3 w-4/5 bg-slate-100 rounded mb-2" />
                <div className="h-3 w-3/5 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((sub: any, i: number) => {
              const Icon = TYPE_ICONS[sub.type as keyof typeof TYPE_ICONS] || MessageSquare;
              const color = TYPE_COLORS[sub.type] || "#0891B2";
              return (
                <AnimatedSection key={sub.id} delay={Math.min(i * 0.05, 0.3)}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="rounded-2xl bg-white p-5 h-full flex flex-col"
                    style={{
                      border: "1px solid rgba(15,23,42,0.06)",
                      boxShadow: "0 6px 18px -8px rgba(15,23,42,0.06)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-900 truncate">{sub.authorName}</div>
                        <div className="text-[11px] text-slate-400">{sub.authorCountry || "Global"}</div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed line-clamp-5 flex-1">{sub.body}</p>

                    {sub.fileUrl && (
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold transition"
                        style={{ color }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        View {sub.type}
                      </a>
                    )}
                  </motion.div>
                </AnimatedSection>
              );
            })}
          </div>
        )}

        <AnimatedSection delay={0.3}>
          <div className="text-center mt-8">
            <a href="/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                color: "white",
                boxShadow: "0 8px 22px -6px rgba(8,145,178,0.4)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Submit your story
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
