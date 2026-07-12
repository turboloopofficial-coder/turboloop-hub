// /earn — index page listing all TurboLoop earning strategy pages.
// Targets "earn crypto" and "DeFi passive income" keyword families.
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { Breadcrumbs } from "@components/Breadcrumbs";
import { LANDING_PAGES } from "@lib/landing-pages";

export const metadata: Metadata = {
  title: "Earn with TurboLoop — Passive Crypto Income Strategies",
  description:
    "Explore automated DeFi earning strategies on BNB Smart Chain. Passive income from real trading fees — no trading required.",
  alternates: { canonical: "https://www.turboloop.tech/earn" },
  openGraph: {
    title: "Earn with TurboLoop — Passive Crypto Income Strategies",
    description:
      "Explore automated DeFi earning strategies on BNB Smart Chain. Passive income from real trading fees — no trading required.",
    url: "https://www.turboloop.tech/earn",
    type: "website",
  },
};

export default function EarnIndexPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <PageHero
        eyebrow="Earning Strategies"
        title="Earn with TurboLoop"
        subtitle="Automated DeFi yields powered by PancakeSwap V3. Explore strategies for every level of experience."
      />
      <Container className="py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Earn" },
          ]}
        />
        <div className="grid gap-6 md:grid-cols-2 mt-10">
          {LANDING_PAGES.map((page) => (
            <Link
              key={page.slug}
              href={`/earn/${page.slug}`}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-emerald-500/40 hover:bg-emerald-500/[0.03] transition-all duration-300"
            >
              <Heading tier="title" className="text-lg mb-2 group-hover:text-emerald-400 transition-colors">
                {page.headline}
              </Heading>
              <p className="text-sm text-[var(--c-text-muted)] leading-relaxed mb-4">
                {page.description}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}
