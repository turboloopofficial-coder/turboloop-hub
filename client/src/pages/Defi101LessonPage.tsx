// /learn/:slug — individual DeFi 101 lesson page.

import { useRoute, Link } from "wouter";
import { Streamdown } from "streamdown";
import { Clock, ChevronRight, ArrowRight, BookOpen } from "lucide-react";
import PageShell from "@/components/PageShell";
import AnimatedSection from "@/components/AnimatedSection";
import { getLesson, LESSONS } from "@/lib/defi101";

export default function Defi101LessonPage() {
  const [, params] = useRoute("/learn/:slug");
  const slug = params?.slug || "";
  const lesson = getLesson(slug);

  if (!lesson) {
    return (
      <PageShell
        title="Lesson Not Found"
        description="That lesson isn't available yet."
        path={`/learn/${slug}`}
        hero={{ label: "Not Found", heading: "Lesson not available", subtitle: "" }}
      >
        <div className="container py-20 text-center">
          <p className="text-slate-500 mb-4">No lesson at "{slug}".</p>
          <Link href="/learn">
            <button className="text-cyan-600 hover:text-cyan-800 text-sm font-bold">← All lessons</button>
          </Link>
        </div>
      </PageShell>
    );
  }

  const nextLessons = (lesson.nextLessons || [])
    .map((s) => LESSONS.find((l) => l.slug === s))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  return (
    <PageShell
      title={lesson.seoTitle}
      description={lesson.summary}
      path={`/learn/${lesson.slug}`}
      breadcrumbLabel={lesson.title}
      hero={{
        label: `DeFi 101 · ${lesson.readTime} min read`,
        heading: lesson.title,
        subtitle: lesson.summary,
        palette: ["#0891B2", "#22D3EE", "#7C3AED"],
        emoji: lesson.emoji,
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: lesson.title,
        description: lesson.summary,
        url: `https://turboloop.tech/learn/${lesson.slug}`,
        wordCount: lesson.content.split(/\s+/).length,
      }}
      related={nextLessons.length > 0 ? nextLessons.map((l) => ({
        label: l.title,
        href: `/learn/${l.slug}`,
        emoji: l.emoji,
        description: l.summary,
      })) : undefined}
    >
      <div className="container max-w-2xl pb-16">
        {/* Sub-breadcrumb */}
        <div className="mb-6 text-xs text-slate-500">
          <Link href="/learn">
            <span className="inline-flex items-center gap-1 hover:text-cyan-700 cursor-pointer">
              <ChevronRight className="w-3 h-3 rotate-180" />
              All DeFi 101 lessons
            </span>
          </Link>
        </div>

        {/* Read time + difficulty pill */}
        <AnimatedSection>
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-7">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lesson.readTime} min read
            </span>
            <span>·</span>
            <span>Difficulty: {Array.from({ length: 5 }, (_, i) => i < lesson.difficulty ? "●" : "○").join("")}</span>
          </div>
        </AnimatedSection>

        {/* Markdown content */}
        <AnimatedSection delay={0.05}>
          <article
            className="prose prose-slate prose-lg max-w-none mb-10 break-long
              prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight
              prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-7 prose-h3:mb-3
              prose-p:text-slate-700 prose-p:leading-[1.75]
              prose-strong:text-slate-900 prose-strong:font-bold
              prose-ul:my-4 prose-li:my-1.5
              prose-code:px-1.5 prose-code:py-0.5 prose-code:bg-slate-100 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-code:break-all
              prose-pre:overflow-x-auto prose-pre:max-w-full
              prose-a:text-cyan-700 prose-a:font-semibold hover:prose-a:text-cyan-900 prose-a:break-all"
            style={{ fontFamily: "var(--font-heading), Georgia, serif" }}
          >
            <Streamdown>{lesson.content}</Streamdown>
          </article>
        </AnimatedSection>

        {/* "Why this matters for TurboLoop" CTA */}
        <AnimatedSection delay={0.1}>
          <div className="rounded-2xl p-6 md:p-7 mb-8"
            style={{ background: "linear-gradient(135deg, #0F172A, #1E1B4B)", color: "white" }}
          >
            <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-300 mb-3">
              Why this matters for TurboLoop
            </div>
            <p className="text-base text-slate-100 leading-relaxed mb-5">{lesson.whyItMatters.text}</p>
            <Link href={lesson.whyItMatters.ctaHref}>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition hover:scale-105"
                style={{ background: "linear-gradient(135deg, #0891B2, #7C3AED)", color: "white", boxShadow: "0 8px 22px -6px rgba(8,145,178,0.5)" }}
              >
                {lesson.whyItMatters.ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </AnimatedSection>

        {/* Next lessons */}
        {nextLessons.length > 0 && (
          <AnimatedSection delay={0.15}>
            <div className="rounded-2xl bg-white p-6" style={{ border: "1px solid rgba(15,23,42,0.06)" }}>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-cyan-700" />
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-cyan-700">Next lessons</span>
              </div>
              <div className="space-y-2">
                {nextLessons.map((l) => (
                  <Link key={l.slug} href={`/learn/${l.slug}`}>
                    <span className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition">
                      <div className="text-2xl shrink-0">{l.emoji}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">{l.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{l.summary}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 shrink-0 text-slate-300 group-hover:text-cyan-700 group-hover:translate-x-1 transition-all" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </PageShell>
  );
}
