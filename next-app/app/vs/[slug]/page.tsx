// /vs/[slug] — head-to-head comparison pages.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, X, ArrowRight } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { Breadcrumbs } from "@components/Breadcrumbs";
import { COMPARISONS, getComparison } from "@lib/comparisons";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARISONS.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) return { title: "Comparison not found" };
  const url = `https://turboloop.tech/vs/${c.slug}`;
  return {
    title: c.seoTitle,
    description: c.summary,
    alternates: { canonical: url },
    openGraph: {
      title: c.seoTitle,
      description: c.summary,
      url,
      type: "article",
    },
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) notFound();

  return (
    <main className="relative pb-12 md:pb-20">
      <Container width="default" className="pt-6 md:pt-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Comparisons" },
            { label: `vs ${c.competitorName}` },
          ]}
        />
      </Container>

      <PageHero
        eyebrow="Head-to-head"
        title={c.heading}
        subtitle={c.summary}
      />

      <Container width="default">
        <Card elevation="raised" padding="lg" className="mb-8">
          <p className="text-base md:text-lg text-[var(--c-text)] leading-relaxed">
            {c.intro}
          </p>
        </Card>

        {/* Comparison table */}
        <div className="rounded-[var(--r-xl)] overflow-hidden border border-[var(--c-border)] bg-[var(--c-surface)] shadow-[var(--s-md)]">
          {/* Header row */}
          <div className="grid grid-cols-3 text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] border-b border-[var(--c-border)] bg-[var(--c-bg)]">
            <div className="px-3 md:px-5 py-3">Metric</div>
            <div className="px-3 md:px-5 py-3 text-center bg-[color-mix(in_oklab,var(--c-brand-cyan)_8%,transparent)]">
              TurboLoop
            </div>
            <div className="px-3 md:px-5 py-3 text-center">
              {c.competitorName}
            </div>
          </div>

          {/* Rows */}
          {c.rows.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-3 text-sm border-b border-[var(--c-border)] last:border-b-0"
            >
              <div className="px-3 md:px-5 py-3 font-bold text-[var(--c-text)] flex items-center">
                {row.metric}
              </div>
              <div
                className="px-3 md:px-5 py-3 text-[var(--c-text)] flex items-start gap-2"
                style={{
                  background:
                    row.winner === "turboloop"
                      ? "color-mix(in oklab, var(--c-success) 6%, transparent)"
                      : "color-mix(in oklab, var(--c-brand-cyan) 4%, transparent)",
                }}
              >
                {row.winner === "turboloop" && (
                  <Check className="w-4 h-4 mt-0.5 text-[var(--c-success)] flex-shrink-0" />
                )}
                <span className="leading-relaxed">{row.turboloop}</span>
              </div>
              <div
                className="px-3 md:px-5 py-3 text-[var(--c-text-muted)] flex items-start gap-2"
                style={{
                  background:
                    row.winner === "competitor"
                      ? "color-mix(in oklab, var(--c-success) 6%, transparent)"
                      : "transparent",
                }}
              >
                {row.winner === "competitor" && (
                  <Check className="w-4 h-4 mt-0.5 text-[var(--c-success)] flex-shrink-0" />
                )}
                {row.winner === "turboloop" && (
                  <X className="w-4 h-4 mt-0.5 text-[var(--c-text-subtle)] flex-shrink-0" />
                )}
                <span className="leading-relaxed">{row.competitor}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Closing argument */}
        <Card
          elevation="prominent"
          padding="lg"
          className="mt-8 relative overflow-hidden"
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
            The honest take
          </Heading>
          <p className="text-base md:text-lg text-[var(--c-text)] leading-relaxed mb-5">
            {c.closing}
          </p>
          <a
            href="/calculator"
            className="inline-flex items-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
          >
            Run your own numbers
            <ArrowRight className="w-4 h-4" />
          </a>
        </Card>

        {/* Other comparisons */}
        <div className="mt-12">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-text-subtle)] mb-4 inline-block"
          >
            Other comparisons
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMPARISONS.filter(o => o.slug !== c.slug).map(other => (
              <a
                key={other.slug}
                href={`/vs/${other.slug}`}
                className="group flex items-center justify-between gap-3 p-4 rounded-[var(--r-lg)] bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-md)] transition active:scale-[0.99]"
              >
                <div>
                  <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)]">
                    Comparison
                  </div>
                  <div className="text-sm font-bold text-[var(--c-text)]">
                    vs {other.competitorName}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--c-text-subtle)] group-hover:translate-x-0.5 transition-transform" />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
