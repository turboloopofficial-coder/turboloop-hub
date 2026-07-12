// /earn/[slug] — programmatic SEO landing pages targeting high-intent keywords.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { Breadcrumbs } from "@components/Breadcrumbs";
import { LANDING_PAGES, getLandingPage } from "@lib/landing-pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) return { title: "Not found" };
  const url = `https://www.turboloop.tech/earn/${page.slug}`;
  return {
    title: page.seoTitle,
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      title: page.seoTitle,
      description: page.description,
      url,
      type: "article",
    },
  };
}

export default async function EarnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) notFound();

  // FAQ structured data for rich snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  // Article structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.headline,
    description: page.description,
    url: `https://www.turboloop.tech/earn/${page.slug}`,
    publisher: {
      "@type": "Organization",
      name: "TurboLoop",
      url: "https://www.turboloop.tech",
    },
    mainEntityOfPage: `https://www.turboloop.tech/earn/${page.slug}`,
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <PageHero
        eyebrow="Earning Strategy"
        title={page.headline}
        subtitle={page.subheadline}
      />

      <Container width="narrow" className="py-12 md:py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Earn", href: "/earn" },
            { label: page.keyword },
          ]}
        />

        {/* Main content sections */}
        <div className="mt-10 space-y-10">
          {page.sections.map((section, i) => (
            <section key={i}>
              <Heading tier="h2" className="text-xl md:text-2xl mb-4">
                {section.heading}
              </Heading>
              <p className="text-[var(--c-text-muted)] leading-relaxed text-base md:text-lg">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        {/* FAQ Section */}
        <section className="mt-16">
          <Heading tier="h2" className="text-xl md:text-2xl mb-6">
            Frequently Asked Questions
          </Heading>
          <div className="space-y-4">
            {page.faqs.map((faq, i) => (
              <Card key={i} className="p-5 bg-white/[0.02] border-white/10">
                <Heading tier="h3" className="text-base font-semibold mb-2 text-emerald-400">
                  {faq.question}
                </Heading>
                <p className="text-sm text-[var(--c-text-muted)] leading-relaxed">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
            <Heading tier="h2" className="text-2xl md:text-3xl mb-4">
              Ready to Start Earning?
            </Heading>
            <p className="text-[var(--c-text-muted)] mb-6 max-w-lg mx-auto">
              Join thousands of users already earning passive income through automated DeFi strategies.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Audited Smart Contracts
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Real Yield from Fees
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Withdraw Anytime
              </div>
            </div>
            <a
              href={page.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors"
            >
              {page.ctaText} <ArrowRight className="w-4 h-4" />
            </a>
          </Card>
        </section>

        {/* Related Links */}
        <section className="mt-12">
          <Heading tier="h3" className="text-lg mb-4">
            Related Resources
          </Heading>
          <div className="flex flex-wrap gap-3">
            {page.relatedLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-white/10 text-sm text-[var(--c-text-muted)] hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
              >
                {link.label} <ArrowRight className="w-3 h-3" />
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
