// /promotions — full earn-with-TurboLoop page. Three programs.

import type { Metadata } from "next";
import { Trophy, Star, Mic, Gift, Check, ExternalLink } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";

export const metadata: Metadata = {
  title: "Promotions — Earn With TurboLoop",
  description:
    "Three paid programs: $100K security bounty, Creator Star ($10–$100/video), Local Presenter ($100/month). Apply in-app, get paid in stablecoins.",
  alternates: { canonical: "https://turboloop.tech/promotions" },
};

const BOUNTY_RULES = [
  "Open to anyone, anywhere. No NDA, no qualification check.",
  "Find a centralization risk, a vulnerability, or a rug-pull mechanism in the deployed smart contract.",
  "Submit a written report + proof-of-concept via Telegram (@TurboLoop_Official).",
  "If verified, $100,000 paid in USDT to the wallet of your choice within 7 days.",
  "Multiple findings → multiple payouts. We don't cap or negotiate down.",
];

const CREATOR_TIERS = [
  { views: "10K+", payout: "$10" },
  { views: "50K+", payout: "$30" },
  { views: "100K+", payout: "$50" },
  { views: "500K+", payout: "$100" },
];

export default function PromotionsPage() {
  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="Earn While You Build"
        title="Three real ways to get paid."
        subtitle="A six-figure bounty for security researchers, a per-view payout for creators, and a monthly stipend for community leaders. All paid in stablecoins."
      />

      <Container width="default">
        {/* $100K BOUNTY */}
        <Card
          elevation="prominent"
          padding="lg"
          className="mb-6 md:mb-8 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 -z-10 opacity-10"
            style={{ background: "var(--c-brand-gradient)" }}
            aria-hidden="true"
          />
          <div className="md:flex md:items-start md:justify-between md:gap-10">
            <div className="md:flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand text-white text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-4">
                <Trophy className="w-3.5 h-3.5" />
                Headline Bounty
              </div>
              <Heading tier="h1" className="mb-3">
                <span className="text-brand">$100,000</span> Smart Contract Bounty
              </Heading>
              <p className="text-lg text-[var(--c-text-muted)] leading-relaxed mb-6 max-w-2xl">
                Inspect the smart contract. If you can prove there&rsquo;s any
                way the team could harm holders, the prize is yours.
              </p>
              <ul className="space-y-2.5 mb-6">
                {BOUNTY_RULES.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--c-text)] leading-relaxed">
                    <Check className="w-4 h-4 text-[var(--c-success)] flex-shrink-0 mt-1" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://t.me/TurboLoop_Official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
                >
                  Submit a finding
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://bscscan.com/address/0xc90e5785632daab9cb61f5050da393090541a76d#code"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] transition active:scale-[0.985]"
                >
                  Read source code
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* CREATOR STAR + LOCAL PRESENTER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-6 md:mb-8">
          {/* Creator Star */}
          <Card elevation="raised" padding="lg" className="flex flex-col">
            <div className="w-12 h-12 rounded-[var(--r-lg)] bg-brand flex items-center justify-center mb-5">
              <Star className="w-6 h-6 text-white" />
            </div>
            <Heading tier="title" as="h3" className="text-xl mb-2">
              Creator Star
            </Heading>
            <div className="mb-3">
              <span className="text-3xl font-extrabold text-brand">
                $10–$100
              </span>
              <span className="text-[var(--c-text-muted)] ml-2">per video</span>
            </div>
            <p className="text-base text-[var(--c-text-muted)] leading-relaxed mb-5 flex-1">
              We pay creators per view on TurboLoop content. Reels, explainers,
              livestreams — anything that brings new eyes to the ecosystem.
              Tiers based on verified view counts within 30 days of post.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-5 p-3 rounded-[var(--r-md)] bg-[var(--c-bg)] border border-[var(--c-border)]">
              {CREATOR_TIERS.map(t => (
                <div key={t.views} className="text-center">
                  <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)]">
                    {t.views}
                  </div>
                  <div className="text-base font-bold text-[var(--c-brand-cyan)] mt-0.5">
                    {t.payout}
                  </div>
                </div>
              ))}
            </div>
            <a
              href="/apply"
              className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
            >
              Apply as Creator →
            </a>
          </Card>

          {/* Local Presenter */}
          <Card elevation="raised" padding="lg" className="flex flex-col">
            <div className="w-12 h-12 rounded-[var(--r-lg)] bg-brand flex items-center justify-center mb-5">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <Heading tier="title" as="h3" className="text-xl mb-2">
              Local Presenter
            </Heading>
            <div className="mb-3">
              <span className="text-3xl font-extrabold text-brand">$100</span>
              <span className="text-[var(--c-text-muted)] ml-2">per month</span>
            </div>
            <p className="text-base text-[var(--c-text-muted)] leading-relaxed mb-5 flex-1">
              Lead a community Zoom session in your language, weekly. We
              provide the slide deck, the schedule, and onboarding support.
              You bring the energy and your local audience.
            </p>
            <ul className="space-y-2 mb-5 text-sm text-[var(--c-text-muted)]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--c-success)] flex-shrink-0 mt-0.5" />
                <span>1 weekly session minimum (45–60 min)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--c-success)] flex-shrink-0 mt-0.5" />
                <span>Native or fluent in your hosted language</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--c-success)] flex-shrink-0 mt-0.5" />
                <span>Stablecoin payout on the 1st of each month</span>
              </li>
            </ul>
            <a
              href="/apply"
              className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
            >
              Apply as Presenter →
            </a>
          </Card>
        </div>

        {/* Onboarding bonus — secondary card */}
        <Card elevation="raised" padding="lg" className="md:flex md:items-start md:gap-6">
          <div className="w-12 h-12 rounded-[var(--r-lg)] bg-brand flex items-center justify-center mb-4 md:mb-0 flex-shrink-0">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <Heading tier="title" as="h3" className="text-xl mb-2">
              Onboarding bonus
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed">
              When you bring a new member into the network and they make their
              first deposit, you receive a stablecoin bonus — generated by the
              protocol itself, not deducted from your referral. Bonus amount
              scales with deposit tier. See the smart contract for exact
              values, or ask a Local Presenter to walk you through it.
            </p>
          </div>
        </Card>
      </Container>
    </main>
  );
}
