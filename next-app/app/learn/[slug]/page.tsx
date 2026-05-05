// /learn/[slug] — single DeFi 101 lesson. Markdown body rendered at
// build time. Each lesson ends with a "next lessons" nav and a CTA to
// the relevant TurboLoop hub page.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { LESSONS } from "@lib/defi101";

export const dynamicParams = false;

export function generateStaticParams() {
  return LESSONS.map(l => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = LESSONS.find(l => l.slug === slug);
  if (!lesson) return { title: "Lesson not found" };
  const url = `https://turboloop.tech/learn/${lesson.slug}`;
  return {
    title: lesson.seoTitle,
    description: lesson.summary,
    alternates: { canonical: url },
    openGraph: {
      title: lesson.seoTitle,
      description: lesson.summary,
      url,
      type: "article",
    },
  };
}

const DIFFICULTY_LABEL = {
  1: "Absolute beginner",
  2: "Beginner",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
} as const;

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = LESSONS.find(l => l.slug === slug);
  if (!lesson) notFound();

  const html = DOMPurify.sanitize(
    (await marked.parse(lesson.content, { breaks: true })) as string
  );

  const nextLessons = (lesson.nextLessons ?? [])
    .map(s => LESSONS.find(l => l.slug === s))
    .filter((l): l is typeof LESSONS[number] => Boolean(l));

  return (
    <main className="relative pb-12 md:pb-20">
      <Container width="narrow" className="pt-6 md:pt-10">
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 text-sm text-[var(--c-text-muted)] hover:text-[var(--c-text)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All lessons
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-brand-cyan)] mb-3">
            <span>{DIFFICULTY_LABEL[lesson.difficulty]}</span>
            <span aria-hidden>·</span>
            <Clock className="w-3 h-3" />
            <span>{lesson.readTime} min read</span>
          </div>
          <Heading tier="h1" className="mb-4">
            <span className="mr-2 text-3xl md:text-4xl" aria-hidden>
              {lesson.emoji}
            </span>
            {lesson.title}
          </Heading>
          <p className="text-lg text-[var(--c-text-muted)] leading-relaxed">
            {lesson.summary}
          </p>
        </div>

        {/* Body */}
        <article
          className="prose-blog mb-12"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* TurboLoop CTA */}
        {lesson.whyItMatters && (
          <Card
            elevation="prominent"
            padding="lg"
            className="mb-10 relative overflow-hidden"
          >
            <div
              className="absolute inset-0 -z-10 opacity-10"
              style={{ background: "var(--c-brand-gradient)" }}
              aria-hidden="true"
            />
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-3 inline-block"
            >
              Why this matters for TurboLoop
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed mb-5">
              {lesson.whyItMatters.text}
            </p>
            <Link
              href={lesson.whyItMatters.ctaHref}
              className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
            >
              {lesson.whyItMatters.ctaLabel} →
            </Link>
          </Card>
        )}

        {/* Next lessons */}
        {nextLessons.length > 0 && (
          <div>
            <Heading
              tier="eyebrow"
              className="text-[var(--c-text-subtle)] mb-4 inline-block"
            >
              Keep going
            </Heading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nextLessons.map(n => (
                <Link
                  key={n.slug}
                  href={`/learn/${n.slug}`}
                  className="group flex items-center gap-3 p-4 rounded-[var(--r-lg)] bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-md)] transition active:scale-[0.99]"
                >
                  <div
                    className="w-10 h-10 rounded-[var(--r-md)] bg-brand flex items-center justify-center text-lg flex-shrink-0"
                    aria-hidden="true"
                  >
                    {n.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[var(--c-text)] truncate">
                      {n.title}
                    </div>
                    <div className="text-xs text-[var(--c-text-muted)]">
                      {n.readTime} min · {DIFFICULTY_LABEL[n.difficulty]}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--c-text-subtle)] flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
