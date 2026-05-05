// /ecosystem/[slug] — single pillar detail page. 6 SSG pages.
//
// Each pillar page = hero + sections (rich body content) + facts list +
// CTA back to /ecosystem. The body sections are markdown rendered at
// build time via marked + DOMPurify (same pattern as /blog/[slug]).

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { ECOSYSTEM_PILLARS } from "@lib/ecosystemPillars";
import { PILLAR_TO_FILM, getFilm } from "@lib/cinematicUniverse";

export const dynamicParams = false;

export function generateStaticParams() {
  return ECOSYSTEM_PILLARS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pillar = ECOSYSTEM_PILLARS.find(p => p.slug === slug);
  if (!pillar) return { title: "Pillar not found" };
  const url = `https://turboloop.tech/ecosystem/${pillar.slug}`;
  return {
    title: `${pillar.title} — ${pillar.subtitle}`,
    description: pillar.tagline,
    alternates: { canonical: url },
    openGraph: {
      title: pillar.title,
      description: pillar.tagline,
      url,
      type: "article",
    },
  };
}

export default async function PillarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pillar = ECOSYSTEM_PILLARS.find(p => p.slug === slug);
  if (!pillar) notFound();

  // Companion film for the pillar (if mapped)
  const companionFilmSlug = PILLAR_TO_FILM[slug];
  const companionFilm = companionFilmSlug
    ? getFilm(companionFilmSlug)
    : undefined;

  // Render each section's markdown body at build time.
  const renderedSections = await Promise.all(
    pillar.sections.map(async section => ({
      heading: section.heading,
      html: DOMPurify.sanitize(
        (await marked.parse(section.body, { breaks: true })) as string
      ),
    }))
  );

  // Other pillars for the bottom nav
  const otherPillars = ECOSYSTEM_PILLARS.filter(p => p.slug !== slug);

  return (
    <main className="relative pb-12 md:pb-20">
      <Container width="default" className="pt-6 md:pt-10">
        <Link
          href="/ecosystem"
          className="inline-flex items-center gap-2 text-sm text-[var(--c-text-muted)] hover:text-[var(--c-text)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All pillars
        </Link>
      </Container>

      {/* Hero */}
      <section className="pb-8 md:pb-12">
        <Container width="default">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-[var(--r-xl)] flex items-center justify-center text-3xl"
              style={{
                background: `linear-gradient(135deg, ${pillar.palette.from}, ${pillar.palette.to})`,
                boxShadow: `0 12px 30px -8px ${pillar.palette.from}55`,
              }}
            >
              <span className="drop-shadow-sm">{pillar.emoji}</span>
            </div>
            <div>
              <div
                className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase mb-1"
                style={{ color: pillar.palette.from }}
              >
                {pillar.subtitle}
              </div>
              <Heading tier="h1">{pillar.title}</Heading>
            </div>
          </div>
          <p className="text-lg md:text-xl text-[var(--c-text-muted)] leading-relaxed max-w-3xl">
            {pillar.tagline}
          </p>
        </Container>
      </section>

      {/* Sections */}
      <Container width="narrow">
        <div className="space-y-10 md:space-y-14">
          {renderedSections.map(section => (
            <section key={section.heading}>
              <Heading tier="h2" className="mb-4">
                {section.heading}
              </Heading>
              <div
                className="prose-blog"
                dangerouslySetInnerHTML={{ __html: section.html }}
              />
            </section>
          ))}
        </div>

        {/* Facts list */}
        {pillar.facts.length > 0 && (
          <Card
            elevation="raised"
            padding="lg"
            className="mt-12 md:mt-16"
          >
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-4 inline-block"
            >
              Key Facts
            </Heading>
            <ul className="space-y-3">
              {pillar.facts.map(fact => (
                <li
                  key={fact}
                  className="flex items-start gap-3 text-base text-[var(--c-text)] leading-relaxed"
                >
                  <CheckCircle2
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: pillar.palette.from }}
                  />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Companion film */}
        {companionFilm && (
          <Card elevation="raised" padding="lg" className="mt-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-1">
                  Watch the film
                </div>
                <Heading tier="title" as="h3" className="text-lg mb-1">
                  {companionFilm.title}
                </Heading>
                <p className="text-sm text-[var(--c-text-muted)]">
                  {companionFilm.tagline}
                </p>
              </div>
              <Link
                href={`/films/${companionFilm.slug}`}
                className="inline-flex items-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
              >
                Watch →
              </Link>
            </div>
          </Card>
        )}

        {/* Other pillars */}
        <div className="mt-12 md:mt-16">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-text-subtle)] mb-4 inline-block"
          >
            More pillars
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherPillars.map(p => (
              <Link
                key={p.slug}
                href={`/ecosystem/${p.slug}`}
                className="group flex items-center gap-3 p-4 rounded-[var(--r-lg)] bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-md)] transition active:scale-[0.99]"
              >
                <div
                  className="w-10 h-10 rounded-[var(--r-md)] flex items-center justify-center text-lg flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${p.palette.from}, ${p.palette.to})`,
                  }}
                >
                  <span className="drop-shadow-sm">{p.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[var(--c-text)] truncate">
                    {p.title}
                  </div>
                  <div className="text-xs text-[var(--c-text-muted)] truncate">
                    {p.subtitle}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--c-text-subtle)] flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
