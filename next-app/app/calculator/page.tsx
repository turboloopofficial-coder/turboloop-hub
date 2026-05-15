"use client";

// /calculator — interactive yield calculator. Pick a plan, set deposit,
// see flat ROI for the plan period. Fully client-side; no server data
// needed.
//
// Math model: FLAT ROI PER PLAN (NOT APY / NOT COMPOUNDED).
//   earnings = deposit × plan.roi
//   plan_end = deposit + earnings
// Each plan is one-shot — pick a duration, lock funds, collect the flat
// percentage at maturity. The previous APY-with-compounding version
// produced numbers that didn't match the live dApp; this matches.
//
// Premium-fintech redesign:
//  • Aurora gradient behind the page hero (re-uses .aurora-bg from home).
//  • Glass plan selector with brand-gradient halo on the active card.
//  • Per-plan icon (Clock / TrendingUp / Layers / Crown).
//  • Deposit input with $ prefix, large centred font, range slider for
//    visual feedback alongside the number input + preset chips.
//  • Right "Projection" panel — animated shimmer sweep, scale-pulse on
//    every value change, growth indicator chip.
//  • Mobile re-orders projection ABOVE inputs so the answer is visible
//    first, then the user scrolls to tweak inputs.

import { useMemo, useState } from "react";
import {
  Calculator,
  Coins,
  Sparkles,
  Clock,
  TrendingUp,
  Layers,
  Crown,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { PageHero } from "@components/layout/PageHero";

// Four published plans on the live dApp. `roi` is the flat percentage
// paid at the end of the plan period — not annualized, not compounded.
// Ultimate (60d, 54%) is the headline plan and the default selection.
const PLANS = [
  { id: "sprint",   days: 7,  roi: 0.03, label: "Sprint",   icon: Clock,       blurb: "One-week trial — feel the mechanism." },
  { id: "boost",    days: 14, roi: 0.10, label: "Boost",    icon: TrendingUp,  blurb: "Two-week ramp, double-digit return." },
  { id: "power",    days: 30, roi: 0.24, label: "Power",    icon: Layers,      blurb: "One-month commitment, serious yield." },
  { id: "ultimate", days: 60, roi: 0.54, label: "Ultimate", icon: Crown,       blurb: "Top tier — patient capital wins." },
];

const DEPOSIT_PRESETS = [100, 500, 1000, 5000, 10000];
const SLIDER_MIN = 50;
const SLIDER_MAX = 50000;

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function CalculatorPage() {
  // Default to Ultimate (index 3) — the headline plan on the live dApp.
  const [planIdx, setPlanIdx] = useState(3);
  const [deposit, setDeposit] = useState(1000);

  const plan = PLANS[planIdx];

  // Flat ROI for the plan period. No compounding, no annualization —
  // each plan is one-shot. If the user wants to roll into another plan
  // at maturity, that's a separate decision.
  const result = useMemo(() => {
    const planEarn = deposit * plan.roi;
    const planEnd = deposit + planEarn;
    return { planEnd, planEarn };
  }, [plan, deposit]);

  // Pulse-key — bumped on every result change so the value <span> remounts
  // and re-fires the .tl-value-pulse keyframe. Cheaper than a useEffect +
  // toggle pattern, and React's reconciler does the right thing.
  const pulseKey = `${planIdx}-${deposit}`;

  return (
    <main className="relative pb-12 md:pb-20">
      {/* Aurora wash behind the hero — same drift as the homepage so the
          calculator feels like part of the same visual world rather than
          a sub-page. Pinned to the top portion of the route only. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[520px] -z-10 pointer-events-none aurora-bg"
        style={{
          background:
            "radial-gradient(ellipse 800px 500px at 20% 20%, rgba(34,211,238,0.10), transparent 60%), " +
            "radial-gradient(ellipse 700px 400px at 85% 30%, rgba(167,139,250,0.10), transparent 60%)",
        }}
      />

      <PageHero
        eyebrow="Yield Calculator"
        title="Run the numbers."
        subtitle="Pick a plan, set a deposit, see what you walk away with at maturity. Real yield comes from PancakeSwap V3 trading fees, not from new deposits — these figures match each plan's published flat ROI on the live dApp."
      />

      <Container width="default">
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 items-stretch">
          {/* ─── PROJECTION (right on desktop, top on mobile) ─── */}
          <div className="order-first md:order-last">
            <div
              className="relative rounded-[var(--r-2xl)] p-6 md:p-10 overflow-hidden text-white shadow-[var(--s-xl)] h-full"
              style={{
                background: "var(--c-brand-gradient-wide)",
                backgroundSize: "200% 200%",
                // Slow drift on the gradient itself so the panel breathes.
                animation: "aurora 18s ease-in-out infinite",
              }}
            >
              {/* Subtle moving shimmer sweep — purely decorative. */}
              <div className="tl-shimmer-overlay" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-white/85 text-[0.6875rem] font-bold tracking-[0.2em] uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    Projection
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.625rem] font-bold tracking-[0.16em] uppercase"
                    style={{ background: "rgba(255,255,255,0.18)" }}
                  >
                    <ArrowUpRight className="w-3 h-3" strokeWidth={3} />
                    {(plan.roi * 100).toFixed(0)}% ROI
                  </div>
                </div>

                {/* Single flat-ROI panel — the plan is one-shot, so there's
                    just one number to highlight. The card is centered
                    vertically so a single-value layout doesn't look short. */}
                <div className="flex-1 flex flex-col justify-center mb-2">
                  <div className="text-sm text-white/80 mb-1.5">
                    After {plan.days} days you receive
                  </div>
                  <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-none tabular-nums break-all">
                    <span key={`a-${pulseKey}`} className="tl-value-pulse">
                      ${fmt(result.planEnd)}
                    </span>
                  </div>
                  <div className="text-sm text-white/85 mt-3 tabular-nums">
                    +${fmt(result.planEarn)} earned · {plan.label} plan
                  </div>
                </div>

                <div className="border-t border-white/25 pt-4 text-xs text-white/80 leading-relaxed">
                  Flat ROI paid at maturity. No daily compounding — the
                  rate is the same whether you deposit $50 or $50,000.
                </div>
              </div>
            </div>
          </div>

          {/* ─── INPUTS (left on desktop, below projection on mobile) ─── */}
          <div className="order-last md:order-first">
            <Card elevation="prominent" padding="lg" className="h-full p-6 md:p-8">
              <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] mb-3">
                1 · Pick your plan
              </div>
              <div className="grid grid-cols-2 gap-2 md:gap-2.5 mb-7">
                {PLANS.map((p, i) => {
                  const Icon = p.icon;
                  const active = i === planIdx;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlanIdx(i)}
                      type="button"
                      aria-pressed={active}
                      className="relative text-left p-3 md:p-3.5 rounded-[var(--r-lg)] backdrop-blur-sm transition-[transform,box-shadow] duration-[var(--m-smooth)] ease-[var(--m-standard)] hover:-translate-y-0.5 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-brand-cyan)] focus-visible:ring-offset-2 min-w-0"
                      style={{
                        background: active
                          ? "color-mix(in oklab, var(--c-brand-cyan) 6%, var(--c-surface) 90%)"
                          : "color-mix(in oklab, var(--c-surface) 75%, transparent)",
                        // Brand-gradient border on the active card via a
                        // double box-shadow trick: inner solid surface +
                        // outer gradient ring (drawn from background).
                        boxShadow: active
                          ? "0 0 0 1.5px transparent, 0 8px 22px -8px rgba(8,145,178,0.45)"
                          : "var(--s-sm)",
                        backgroundImage: active
                          ? "linear-gradient(var(--c-surface), var(--c-surface)), var(--c-brand-gradient)"
                          : undefined,
                        backgroundOrigin: active ? "border-box" : undefined,
                        backgroundClip: active
                          ? "padding-box, border-box"
                          : undefined,
                        border: active
                          ? "1.5px solid transparent"
                          : "1px solid var(--c-border)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{
                            background: active
                              ? "var(--c-brand-gradient)"
                              : "color-mix(in oklab, var(--c-brand-cyan) 12%, transparent)",
                            color: active ? "white" : "var(--c-brand-cyan)",
                          }}
                        >
                          <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </span>
                        <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)]">
                          {p.days} days
                        </div>
                      </div>
                      <div className="text-sm md:text-base font-bold text-[var(--c-text)] truncate">
                        {p.label}
                      </div>
                      <div className="text-sm font-bold text-brand mt-0.5 tabular-nums">
                        {(p.roi * 100).toFixed(0)}% ROI
                      </div>
                      <div className="text-[0.6875rem] text-[var(--c-text-muted)] mt-1.5 leading-snug line-clamp-2 hidden sm:block">
                        {p.blurb}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] mb-3">
                2 · Deposit (USDT)
              </div>

              <div className="relative mb-3">
                <span
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-extrabold text-[var(--c-text-subtle)] pointer-events-none tabular-nums"
                >
                  $
                </span>
                <input
                  type="number"
                  min={50}
                  max={1000000}
                  value={deposit}
                  onChange={e =>
                    setDeposit(Math.max(50, Number(e.target.value) || 0))
                  }
                  className="w-full pl-10 pr-4 h-14 rounded-[var(--r-lg)] text-2xl font-extrabold text-center bg-[var(--c-bg)] outline-none border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)] focus:ring-2 focus:ring-[var(--c-brand-cyan)]/20 tabular-nums"
                />
              </div>

              {/* Range slider — hits the same `deposit` state. Step 50 so
                  it tracks the $50 minimum. Native range, theme via CSS. */}
              <input
                type="range"
                min={SLIDER_MIN}
                max={SLIDER_MAX}
                step={50}
                value={Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, deposit))}
                onChange={e => setDeposit(Number(e.target.value))}
                className="w-full mb-4 accent-[var(--c-brand-cyan)] cursor-pointer"
                aria-label="Deposit slider"
              />

              <div className="flex flex-wrap gap-2 mb-2">
                {DEPOSIT_PRESETS.map(amt => {
                  const active = deposit === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDeposit(amt)}
                      className={`px-4 min-h-[40px] rounded-full text-xs font-bold transition active:scale-95 ${
                        active
                          ? "bg-brand text-white shadow-[var(--s-brand)]"
                          : "border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] hover:bg-brand hover:text-white hover:border-transparent"
                      }`}
                    >
                      ${amt.toLocaleString()}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[var(--c-text-subtle)] mt-3">
                $50 minimum. Real yields fluctuate with market volume.
              </p>
            </Card>
          </div>
        </div>

        {/* Honest disclaimer — brand-gradient left accent so it reads as
            an editorial pull-quote rather than a noise box. */}
        <div
          className="mt-6 md:mt-8 rounded-[var(--r-xl)] bg-[var(--c-surface)] shadow-[var(--s-md)] p-5 md:p-6 relative overflow-hidden"
          style={{
            borderLeft: "3px solid transparent",
            backgroundImage:
              "linear-gradient(var(--c-surface), var(--c-surface)), var(--c-brand-gradient)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center flex-shrink-0 shadow-[var(--s-brand)]">
              <Info className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <p className="text-sm text-[var(--c-text-muted)] leading-relaxed">
              <strong className="text-[var(--c-text)]">
                These figures match the published plans on the live dApp.
              </strong>{" "}
              Yield comes from real PancakeSwap V3 trading fees and varies
              with market volume — the protocol&rsquo;s flat per-plan ROI
              is the target, not a guarantee. The smart contract is
              audited, renounced, and 100% LP-locked — read the source on
              BscScan before depositing anything.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 md:mt-10 flex flex-wrap gap-3 justify-center">
          <a
            href="https://turboloop.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 h-12 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
          >
            <Coins className="w-4 h-4" />
            Open the dApp →
          </a>
          <a
            href="/security"
            className="group inline-flex items-center justify-center gap-2 px-6 h-12 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-md)] transition active:scale-[0.985]"
          >
            <Calculator className="w-4 h-4 transition-transform group-hover:rotate-[-6deg]" />
            How is this safe?
          </a>
        </div>
      </Container>
    </main>
  );
}
