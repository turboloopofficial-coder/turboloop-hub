// /ecosystem — index of the 6 product pillars. Each pillar is its own
// /ecosystem/[slug] page with rich detail.

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { ECOSYSTEM_PILLARS } from "@lib/ecosystemPillars";

export const metadata: Metadata = {
  title: "Ecosystem — Six Pillars, One Self-Sustaining Engine",
  description:
    "TurboLoop is six DeFi primitives working as one: Turbo Buy, Turbo Swap, Yield Farming, Referral Network, Leadership Program, Smart Contract Security.",
  alternates: { canonical: "https://turboloop.tech/ecosystem" },
};

export default function EcosystemIndexPage() {
  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="The Ecosystem"
        title="Six pillars. One engine."
        subtitle="TurboLoop isn't a single product — it's six DeFi primitives working together as a self-sustaining flywheel. Each one feeds the others."
      />

      <Container width="default">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {ECOSYSTEM_PILLARS.map((pillar, idx) => (
            <Link
              key={pillar.slug}
              href={`/ecosystem/${pillar.slug}`}
              className="group block"
            >
              <Card
                elevation="raised"
                padding="lg"
                interactive
                className="h-full flex flex-col relative overflow-hidden"
              >
                {/* Subtle palette accent in the corner */}
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-15 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${pillar.palette.from}, ${pillar.palette.via}, ${pillar.palette.to})`,
                  }}
                  aria-hidden="true"
                />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-[var(--r-lg)] flex items-center justify-center text-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${pillar.palette.from}, ${pillar.palette.to})`,
                      }}
                    >
                      <span className="drop-shadow-sm">{pillar.emoji}</span>
                    </div>
                    <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)]">
                      Pillar 0{idx + 1}
                    </div>
                  </div>
                  <Heading tier="title" as="h2" className="text-xl mb-1">
                    {pillar.title}
                  </Heading>
                  <div className="text-sm font-semibold text-[var(--c-brand-cyan)] mb-3">
                    {pillar.subtitle}
                  </div>
                  <p className="text-base text-[var(--c-text-muted)] leading-relaxed mb-5 flex-1">
                    {pillar.tagline}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--c-text)] group-hover:gap-2.5 transition-all">
                    Read about {pillar.title}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}
