// TokenSpotlightSection — elevated $TURBO section that replaces the
// older, footnote-style TokenSection on the homepage.
//
// Hard rule from prior reviews: $TURBO is ADDITIVE — it never replaces
// the fixed yield. Power (30-day) and Ultimate (60-day) plans earn
// $TURBO IN ADDITION to their flat ROI. Sprint and Boost do not.
// This section states that directly so visitors never think the token
// is the main product.
//
// Server component. Live price ticker is the only client island
// (already self-contained inside TokenPriceWidget).

import Link from "next/link";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { TokenPriceWidget } from "@components/token/TokenPriceWidget";
import { DEPOSIT_TIERS, TOKEN } from "@lib/tokenFacts";

export function TokenSpotlightSection() {
  return (
    <section className="py-12 md:py-20">
      <Container width="default">
        {/* Heading block */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-brand-cyan)]/30 shadow-[var(--s-sm)] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[var(--c-brand-cyan)]" />
            <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-brand-cyan)]">
              Bonus Rewards · Automatic for Power & Ultimate
            </span>
          </div>
          <Heading tier="h1" as="h2" className="mb-3">
            Your yield plan just got{" "}
            <span className="text-brand-wide">better.</span>
          </Heading>
          <p className="text-base md:text-lg text-[var(--c-text-muted)] leading-relaxed">
            Power (30-day) and Ultimate (60-day) investors automatically earn{" "}
            <span className="font-bold text-[var(--c-text)]">${TOKEN.symbol}</span>{" "}
            tokens on every deposit. No action required. Here&rsquo;s what you earn.
          </p>
        </div>

        {/* Additive callout — the rule the protocol promises */}
        <div className="mx-auto max-w-2xl mb-8 md:mb-10 rounded-[var(--r-lg)] border border-[var(--c-brand-cyan)]/30 bg-[var(--c-brand-cyan)]/5 px-4 py-3 text-center">
          <p className="text-sm font-bold text-[var(--c-text)]">
            This is in addition to your fixed yield — not instead of it.
          </p>
        </div>

        {/* Deposit-tier table */}
        <div className="rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] shadow-[var(--s-sm)] overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--c-bg)] border-b border-[var(--c-border)]">
                  <th className="text-left px-4 py-3 font-bold text-[var(--c-text)] text-xs uppercase tracking-[0.15em]">
                    Deposit
                  </th>
                  <th className="text-right px-4 py-3 font-bold text-[var(--c-text)] text-xs uppercase tracking-[0.15em]">
                    ${TOKEN.symbol} reward
                  </th>
                </tr>
              </thead>
              <tbody>
                {DEPOSIT_TIERS.map((t, i) => (
                  <tr
                    key={t.label}
                    className={
                      i < DEPOSIT_TIERS.length - 1
                        ? "border-b border-[var(--c-border)]"
                        : ""
                    }
                  >
                    <td className="px-4 py-3 text-[var(--c-text)] tabular-nums">
                      {t.label}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[var(--c-brand-cyan)] tabular-nums">
                      {t.pctLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live price ticker + burn chip */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8 md:mb-10">
          <TokenPriceWidget
            variant="inline"
            className="rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] px-3 py-1.5 shadow-[var(--s-sm)]"
          />
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)] text-xs font-bold text-[var(--c-text)]">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            Daily buyback &amp; burn
          </span>
        </div>

        {/* Dual CTAs — primary launches the dApp, secondary educates */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center max-w-md sm:max-w-none mx-auto">
          <a
            href="https://turboloop.io?utm_source=turboloop_tech&utm_medium=home_token_spotlight&utm_campaign=power_ultimate"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] min-h-[48px] h-[52px] text-base px-7 text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
          >
            Start a Power or Ultimate plan
            <ArrowRight className="w-4 h-4" />
          </a>
          <Link
            href="/token"
            className="inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] min-h-[48px] h-[52px] text-base px-7 bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-md)] transition active:scale-[0.985]"
          >
            Learn about ${TOKEN.symbol}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
