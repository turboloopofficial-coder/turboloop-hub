// "Voices from the community" — single curated testimonial.
//
// In Phase 13 we'll wire this up to fetch a random featured testimonial
// from the database. For now it's a real quote from /community surfaced
// at build time so the page is fully static.

import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { Card } from "@components/ui/Card";

const TESTIMONIAL = {
  quote:
    "I've been in DeFi for four years. TurboLoop is the first project I've trusted enough to refer to my own family. The audit, the renouncement, the locked LP — they removed every excuse to not believe.",
  author: "Adesina O.",
  role: "Community Lead",
  country: "🇳🇬 Nigeria",
};

export function TestimonialSection() {
  return (
    <section className="py-16 md:py-24">
      <Container width="default">
        <div className="text-center mb-8 md:mb-10">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-brand-cyan)] mb-3 inline-block"
          >
            Voices from the Community
          </Heading>
          <Heading tier="h1">In their own words.</Heading>
        </div>

        <Card
          elevation="prominent"
          padding="lg"
          className="max-w-2xl mx-auto text-center relative overflow-hidden"
        >
          {/* Quotation mark decoration */}
          <div
            aria-hidden="true"
            className="absolute -top-4 -left-2 text-[7rem] leading-none font-serif select-none pointer-events-none opacity-[0.04]"
          >
            “
          </div>

          <blockquote className="text-lg md:text-xl text-[var(--c-text)] leading-relaxed mb-6 relative z-10">
            {TESTIMONIAL.quote}
          </blockquote>

          <div className="text-sm font-bold text-[var(--c-text)]">
            {TESTIMONIAL.author}
          </div>
          <div className="text-xs text-[var(--c-text-muted)] mt-1">
            {TESTIMONIAL.role} · {TESTIMONIAL.country}
          </div>

          <div className="mt-6 pt-5 border-t border-[var(--c-border)]">
            <a
              href="/community"
              className="text-sm font-bold text-[var(--c-brand-cyan)] hover:underline"
            >
              Read more stories →
            </a>
          </div>
        </Card>
      </Container>
    </section>
  );
}
