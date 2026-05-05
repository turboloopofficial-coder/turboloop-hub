// /learn — DeFi 101 index. Beginner explainers organized by difficulty.

import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { LESSONS } from "@lib/defi101";

export const metadata: Metadata = {
  title: "Learn DeFi — Plain-English Explainers",
  description:
    "DeFi 101: short, beginner-friendly explainers on yield, smart contracts, stablecoins, and more. Zero jargon.",
  alternates: { canonical: "https://turboloop.tech/learn" },
};

export default function LearnIndexPage() {
  // Sort by difficulty (beginner first), then by reading time.
  const sorted = LESSONS.slice().sort((a, b) =>
    a.difficulty !== b.difficulty
      ? a.difficulty - b.difficulty
      : a.readTime - b.readTime
  );

  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="DeFi 101"
        title="Learn DeFi from zero."
        subtitle="Short explainers for people who've never touched crypto. No jargon, no fluff. Each one ends with how it connects to TurboLoop."
      />

      <Container width="default">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {sorted.map(lesson => (
            <Link
              key={lesson.slug}
              href={`/learn/${lesson.slug}`}
              className="group block"
            >
              <Card
                elevation="raised"
                padding="lg"
                interactive
                className="h-full flex flex-col"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-[var(--r-lg)] bg-brand flex items-center justify-center text-2xl flex-shrink-0"
                    aria-hidden="true"
                  >
                    {lesson.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-1">
                      <span>
                        {lesson.difficulty <= 2
                          ? "Beginner"
                          : lesson.difficulty <= 3
                            ? "Intermediate"
                            : "Advanced"}
                      </span>
                      <span>·</span>
                      <span>{lesson.readTime} min read</span>
                    </div>
                    <Heading tier="title" as="h2" className="leading-snug">
                      {lesson.title}
                    </Heading>
                  </div>
                </div>
                <p className="text-base text-[var(--c-text-muted)] leading-relaxed flex-1">
                  {lesson.summary}
                </p>
                <span className="mt-4 text-sm font-bold text-[var(--c-brand-cyan)] group-hover:underline">
                  Read lesson →
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}
