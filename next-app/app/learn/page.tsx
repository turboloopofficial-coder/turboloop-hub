// /learn — DeFi 101 index. Beginner explainers organized by difficulty.

import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { LESSONS } from "@lib/defi101";

// Numbers verified against lib/defi101.ts: 7 published lessons covering
// what-is-defi, smart contracts, stablecoins, yield farming, BscScan
// verification, etc. All currently English; SEO claims of "12+
// languages" in earlier drafts of this plan didn't match the data.
// ─── JSON-LD structured data ────────────────────────────────────────────────
const learnJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.turboloop.tech/learn#webpage",
      "url": "https://www.turboloop.tech/learn",
      "name": "Learn DeFi with TurboLoop — Guides, Tutorials & Education",
      "description": "Step-by-step guides on DeFi yield farming, smart contracts, stablecoins, and the TurboLoop ecosystem. Beginner-friendly, jargon-free.",
      "isPartOf": { "@id": "https://www.turboloop.tech/#website" },
    },
    {
      "@type": "Course",
      "name": "DeFi 101 by TurboLoop",
      "description": "A beginner-friendly course covering DeFi fundamentals: what is DeFi, smart contracts, stablecoins, yield farming, and how to verify contracts on BscScan.",
      "provider": { "@id": "https://www.turboloop.tech/#organization" },
      "url": "https://www.turboloop.tech/learn",
      "educationalLevel": "Beginner",
      "inLanguage": "en",
      "isAccessibleForFree": true,
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "courseWorkload": "PT30M",
      },
    },
  ],
};

const LEARN_OG_IMAGE =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-learn.png";
const LEARN_OG_TITLE =
  "What is DeFi Yield Farming? Free Beginner Guides | TurboLoop";
const LEARN_OG_DESC =
  "New to DeFi? Learn what yield farming is, how smart contracts work, what stablecoins are, and how to earn passive income on BSC — in plain English. Free guides, no jargon.";

export const metadata: Metadata = {
  title: LEARN_OG_TITLE,
  description: LEARN_OG_DESC,
  keywords: [
    "what is DeFi yield farming",
    "how to earn passive income crypto",
    "DeFi for beginners",
    "what is a smart contract",
    "what are stablecoins",
    "how to earn on USDT",
    "BSC DeFi guide",
    "yield farming explained",
    "crypto passive income beginner",
    "TurboLoop learn",
  ],
  alternates: { canonical: "https://www.turboloop.tech/learn" },
  openGraph: {
    type: "website",
    title: LEARN_OG_TITLE,
    description: LEARN_OG_DESC,
    url: "https://www.turboloop.tech/learn",
    images: [{ url: LEARN_OG_IMAGE, width: 1200, height: 630, alt: LEARN_OG_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: LEARN_OG_TITLE,
    description: LEARN_OG_DESC,
    images: [LEARN_OG_IMAGE],
  },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnJsonLd) }}
      />
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
