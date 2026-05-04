// "Earn While You Build" — three earn paths surfaced on the homepage,
// each linking to either the full /promotions page or the new /apply
// flow. The $100K bounty is the headline; Creator Star + Local Presenter
// are the two paid programs we built /apply for.

import { Trophy, Star, Mic } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { Card } from "@components/ui/Card";

const PROGRAMS = [
  {
    icon: Star,
    title: "Creator Star",
    payout: "$10–$100",
    payoutUnit: "per video",
    description:
      "We pay creators per view. Reels, explainers, livestreams — bring eyes to the ecosystem.",
    cta: "Apply now",
    href: "/apply",
  },
  {
    icon: Mic,
    title: "Local Presenter",
    payout: "$100",
    payoutUnit: "per month",
    description:
      "Lead a community Zoom in your language. We provide the deck and support.",
    cta: "Apply now",
    href: "/apply",
  },
];

export function PromotionsSection() {
  return (
    <section className="py-16 md:py-24">
      <Container width="default">
        <div className="text-center mb-10 md:mb-14">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-brand-cyan)] mb-3 inline-block"
          >
            Earn While You Build
          </Heading>
          <Heading tier="h1">Get paid for what you bring.</Heading>
          <p className="mt-4 text-[var(--c-text-muted)] max-w-xl mx-auto">
            Three ways to earn alongside the protocol — from a six-figure
            bounty to a steady monthly stipend for community leaders.
          </p>
        </div>

        {/* Hero card — $100K bounty (largest, brand gradient) */}
        <Card
          elevation="prominent"
          padding="lg"
          className="mb-5 md:mb-6 text-center md:text-left md:flex md:items-center md:justify-between md:gap-8 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 -z-10 opacity-10 pointer-events-none"
            style={{ background: "var(--c-brand-gradient)" }}
            aria-hidden="true"
          />
          <div className="md:flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand text-white text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-3">
              <Trophy className="w-3.5 h-3.5" />
              Headline Bounty
            </div>
            <Heading tier="h2" className="mb-2">
              <span className="bg-brand bg-clip-text text-transparent">
                $100,000
              </span>{" "}
              if you find centralization
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed max-w-xl">
              Inspect the smart contract. If you can prove the team has any
              way to harm holders, the prize is yours. No NDA. No catch.
            </p>
          </div>
          <a
            href="/promotions"
            className="mt-5 md:mt-0 inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985] flex-shrink-0"
          >
            Read the rules →
          </a>
        </Card>

        {/* Program cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {PROGRAMS.map(p => {
            const Icon = p.icon;
            return (
              <Card key={p.title} elevation="raised" padding="lg">
                <div className="w-11 h-11 rounded-[var(--r-lg)] bg-brand flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <Heading tier="title" as="h3">
                    {p.title}
                  </Heading>
                </div>
                <div className="mb-3">
                  <span className="bg-brand bg-clip-text text-transparent text-2xl font-extrabold">
                    {p.payout}
                  </span>
                  <span className="text-sm text-[var(--c-text-muted)] ml-1">
                    {p.payoutUnit}
                  </span>
                </div>
                <p className="text-sm text-[var(--c-text-muted)] leading-relaxed mb-4">
                  {p.description}
                </p>
                <a
                  href={p.href}
                  className="text-sm font-bold text-[var(--c-brand-cyan)] hover:underline"
                >
                  {p.cta} →
                </a>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
