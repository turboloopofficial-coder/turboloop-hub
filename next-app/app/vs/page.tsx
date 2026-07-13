// /vs — index page listing all TurboLoop comparison pages.
// This page helps Google discover all /vs/[slug] pages and also
// targets the "turboloop vs [competitor]" family of search queries.
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { Breadcrumbs } from "@components/Breadcrumbs";
import { COMPARISONS } from "@lib/comparisons";

export const metadata: Metadata = {
  title: "TurboLoop vs Everything — Head-to-Head Comparisons",
  description:
    "How does TurboLoop stack up against banks, DeFi protocols, staking, P2P lending, and inflation? Side-by-side comparisons with the math.",
  alternates: { canonical: "https://www.turboloop.tech/vs" },
  openGraph: {
    title: "TurboLoop vs Everything — Head-to-Head Comparisons",
    description:
      "How does TurboLoop stack up against banks, DeFi protocols, staking, P2P lending, and inflation? Side-by-side comparisons with the math.",
    url: "https://www.turboloop.tech/vs",
    type: "website",
  },
};

export default function VsIndexPage() {
  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]">
      <PageHero
        eyebrow="Comparisons"
        title="TurboLoop vs Everything"
        subtitle="Side-by-side breakdowns of yield, transparency, risk, and control. The math doesn't lie."
      />

      <Container className="py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Comparisons" },
          ]}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMPARISONS.map((c) => (
            <Link
              key={c.slug}
              href={`/vs/${c.slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 transition hover:border-[#7B5EA7]/60 hover:bg-[var(--c-surface)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#7B5EA7]">
                  vs {c.competitorName}
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--c-text-subtle)] transition group-hover:text-[#7B5EA7]" />
              </div>
              <Heading as="h2" size="sm" className="leading-snug">
                {c.heading}
              </Heading>
              <p className="text-sm text-[var(--c-text-muted)] line-clamp-2">{c.summary}</p>
            </Link>
          ))}
        </div>

        {/* JSON-LD — ItemList for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "TurboLoop Comparison Pages",
              description:
                "Head-to-head comparisons of TurboLoop against banks, DeFi protocols, staking, and more.",
              url: "https://www.turboloop.tech/vs",
              numberOfItems: COMPARISONS.length,
              itemListElement: COMPARISONS.map((c, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: c.seoTitle,
                url: `https://www.turboloop.tech/vs/${c.slug}`,
                description: c.summary,
              })),
            }),
          }}
        />
      </Container>
    </main>
  );
}
