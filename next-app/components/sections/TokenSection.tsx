// Homepage TokenSection — introduces $TURBO to first-time visitors
// without overwhelming the rest of the homepage flow. Placement (per
// the master plan): between HomeBlogSection and PromotionsSection,
// just before the section divider that precedes Promotions.
//
// Three-card structure:
//   1. Earn tokens on every deposit
//   2. Daily buyback & burn (separate from trade tax per manus rules)
//   3. 100% fair launch
//
// Plus a live price ticker (inline variant of TokenPriceWidget) and
// the "Learn more about $TURBO" CTA to /token.
//
// Server component — only the price ticker is a client island.

import Link from "next/link";
import { ArrowRight, Gift, Flame, ShieldCheck } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { TokenPriceWidget } from "@components/token/TokenPriceWidget";
import { TOKEN, DEPOSIT_TIERS, BUYBACK } from "@lib/tokenFacts";

export function TokenSection() {
  const lowestPct = DEPOSIT_TIERS[0].pctLabel;
  const highestPct = DEPOSIT_TIERS[DEPOSIT_TIERS.length - 1].pctLabel;
  return (
    <section className="py-12 md:py-20 relative">
      <Container width="default">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)]">
            <Heading tier="eyebrow" as="span" className="text-[var(--c-brand-cyan)]">
              New · native rewards token
            </Heading>
            <TokenPriceWidget variant="inline" />
          </div>

          <Heading tier="display" className="mb-4">
            <span>Introducing </span>
            <span className="text-brand-wide">${TOKEN.symbol}</span>
          </Heading>

          <p className="text-base md:text-lg text-[var(--c-text-muted)] leading-relaxed">
            An extra rewards layer on top of your fixed Loop Plan yields —
            with zero impact on protocol performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-10">
          <BenefitCard
            icon={Gift}
            label={`Earn ${lowestPct}–${highestPct} per deposit`}
            body={`Get $${TOKEN.symbol} on every Loop Plan deposit. Tier scales with deposit size. Split ${"70% to you, 30% to your referrer"}.`}
          />
          <BenefitCard
            icon={Flame}
            label={`${BUYBACK.frequency} buyback & burn`}
            body={`${BUYBACK.fundingPctOfAdminFees}% of admin fees from the main protocol fund a daily, ${"automated".toLowerCase()} $${TOKEN.symbol} buyback. Tokens burned permanently.`}
          />
          <BenefitCard
            icon={ShieldCheck}
            label="100% fair launch"
            body={`${TOKEN.totalSupplyFormatted} total supply. LP 100% locked. No team allocation. No insider reserve.`}
          />
        </div>

        <div className="text-center">
          <Link
            href="/token"
            className="inline-flex items-center gap-2 px-6 h-12 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
          >
            Learn more about ${TOKEN.symbol}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}

function BenefitCard({
  icon: Icon,
  label,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  body: string;
}) {
  return (
    <Card elevation="raised" padding="md" className="text-left">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-brand shadow-[var(--s-brand)]">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="font-bold text-[var(--c-text)] mb-2 text-base leading-snug">
        {label}
      </div>
      <p className="text-sm text-[var(--c-text-muted)] leading-relaxed">{body}</p>
    </Card>
  );
}
