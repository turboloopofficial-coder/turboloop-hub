// "By the Numbers" section — 4 honest, hardcoded stats.
//
// Hardcoded (not live) on purpose: faking dynamic numbers (live TVL,
// live members) erodes trust faster than transparent static numbers
// build it. Phase 13 may wire in real read endpoints if/when reliable.

import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { Card } from "@components/ui/Card";

const STATS = [
  { value: "48", label: "Languages", help: "Supported across content" },
  { value: "20", label: "Films", help: "Cinematic universe complete" },
  { value: "6+", label: "Continents", help: "Active community presence" },
  { value: "$100K", label: "Bounty", help: "For proof of centralization" },
];

export function NumbersSection() {
  return (
    <section className="py-16 md:py-24">
      <Container width="default">
        <div className="text-center mb-10 md:mb-14">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-brand-cyan)] mb-3 inline-block"
          >
            By the Numbers
          </Heading>
          <Heading tier="h1">A movement, not a moment.</Heading>
          <p className="mt-4 text-[var(--c-text-muted)] max-w-xl mx-auto">
            Real reach across the world. Translated, told, and lived in
            dozens of languages every day.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {STATS.map(stat => (
            <Card
              key={stat.label}
              elevation="raised"
              padding="md"
              className="text-center"
            >
              <div className="bg-brand bg-clip-text text-transparent text-4xl md:text-5xl font-extrabold tracking-tight leading-none">
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-bold text-[var(--c-text)]">
                {stat.label}
              </div>
              <div className="mt-1 text-xs text-[var(--c-text-muted)] leading-snug">
                {stat.help}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
