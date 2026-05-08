"use client";

// /calculator — interactive yield calculator. Pick a plan, set deposit,
// see compounded ROI. Fully client-side; no server data needed.
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

const PLANS = [
  { id: "p7",  days: 7,  apy: 0.18, label: "Starter",  icon: Clock,       blurb: "Try the math, low commitment." },
  { id: "p30", days: 30, apy: 0.30, label: "Growth",   icon: TrendingUp,  blurb: "First serious compounding window." },
  { id: "p60", days: 60, apy: 0.42, label: "Compound", icon: Layers,      blurb: "Where the curve starts pulling away." },
  { id: "p90", days: 90, apy: 0.54, label: "Legacy",   icon: Crown,       blurb: "Top tier — patient capital wins." },
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
  const [planIdx, setPlanIdx] = useState(2); // Default Compound (60d)
  const [deposit, setDeposit] = useState(1000);

  const plan = PLANS[planIdx];

  // Annual yield projection: compound the daily yield over the chosen
  // duration, then extrapolate to a full year for an apples-to-apples
  // figure. (Real yield comes from PancakeSwap V3 fees; this is just an
  // illustration based on the plan's published APY.)
  const result = useMemo(() => {
    const dailyRate = plan.apy / 365;
    const planEnd = deposit * (1 + dailyRate * plan.days);
    const planEarn = planEnd - deposit;
    const yearEnd = deposit * Math.pow(1 + dailyRate, 365);
    const yearEarn = yearEnd - deposit;
    return { planEnd, planEarn, yearEnd, yearEarn };
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
        subtitle="Pick a plan, set a deposit, see the projection. Real yield comes from PancakeSwap V3 trading fees, not from new deposits — this is illustration based on each plan's target APY."
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

              <div className="relative z-10">
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
                    {(plan.apy * 100).toFixed(0)}% APY
                  </div>
                </div>

                <div className="mb-7">
                  <div className="text-sm text-white/80 mb-1.5">
                    After {plan.days} days
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-none tabular-nums break-all">
                    <span key={`a-${pulseKey}`} className="tl-value-pulse">
                      ${fmt(result.planEnd)}
                    </span>
                  </div>
                  <div className="text-sm text-white/85 mt-2 tabular-nums">
                    +${fmt(result.planEarn)} earned over {plan.days} days
                  </div>
                </div>

                <div className="border-t border-white/25 pt-5">
                  <div className="text-sm text-white/80 mb-1.5">
                    If compounded for a full year
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-none tabular-nums break-all">
                    <span key={`b-${pulseKey}`} className="tl-value-pulse">
                      ${fmt(result.yearEnd)}
                    </span>
                  </div>
                  <div className="text-sm text-white/85 mt-2 tabular-nums">
                    +${fmt(result.yearEarn)} compounded
                  </div>
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
                        Up to {(p.apy * 100).toFixed(0)}% APY
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
                These are illustrations, not promises.
              </strong>{" "}
              Yield comes from real PancakeSwap V3 trading fees and varies
              with market volume. The protocol&rsquo;s targeted APY is the
              ceiling, not a guarantee. The smart contract is audited,
              renounced, and 100% LP-locked — read the source on BscScan
              before depositing anything.
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
