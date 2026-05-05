"use client";

// /calculator — interactive yield calculator. Pick a plan, set deposit,
// see compounded ROI. Fully client-side; no server data needed.

import { useMemo, useState } from "react";
import { Calculator, TrendingUp, Coins, Sparkles } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";

const PLANS = [
  { id: "p7", days: 7, apy: 0.18, label: "Starter" },
  { id: "p30", days: 30, apy: 0.30, label: "Growth" },
  { id: "p60", days: 60, apy: 0.42, label: "Compound" },
  { id: "p90", days: 90, apy: 0.54, label: "Legacy" },
];

const DEPOSIT_PRESETS = [100, 500, 1000, 5000, 10000];

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

  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="Yield Calculator"
        title="Run the numbers."
        subtitle="Pick a plan, set a deposit, see the projection. Real yield comes from PancakeSwap V3 trading fees, not from new deposits — this is illustration based on each plan's target APY."
      />

      <Container width="default">
        <Card elevation="prominent" padding="lg" className="grid gap-6 md:grid-cols-2">
          {/* LEFT: inputs */}
          <div>
            <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] mb-3">
              1 · Pick your plan
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {PLANS.map((p, i) => {
                const active = i === planIdx;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlanIdx(i)}
                    className="text-left p-3 rounded-[var(--r-md)] transition active:scale-[0.98]"
                    style={{
                      background: active
                        ? "color-mix(in oklab, var(--c-brand-cyan) 8%, var(--c-surface))"
                        : "var(--c-surface)",
                      border: `2px solid ${active ? "var(--c-brand-cyan)" : "var(--c-border)"}`,
                    }}
                  >
                    <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)]">
                      {p.days} days
                    </div>
                    <div className="text-base font-bold text-[var(--c-text)]">
                      {p.label}
                    </div>
                    <div className="text-sm font-bold text-brand mt-1">
                      Up to {(p.apy * 100).toFixed(0)}% APY
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] mb-3">
              2 · Deposit (USDT)
            </div>
            <input
              type="number"
              min={50}
              max={1000000}
              value={deposit}
              onChange={e => setDeposit(Math.max(50, Number(e.target.value) || 0))}
              className="w-full px-4 h-12 rounded-[var(--r-md)] text-lg font-bold bg-[var(--c-bg)] outline-none border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)] mb-3"
            />
            <div className="flex flex-wrap gap-2 mb-1">
              {DEPOSIT_PRESETS.map(amt => (
                <button
                  key={amt}
                  onClick={() => setDeposit(amt)}
                  className="px-3 h-8 rounded-full text-xs font-bold border border-[var(--c-border)] bg-[var(--c-surface)] hover:bg-[var(--c-bg)] active:scale-95 transition"
                >
                  ${amt.toLocaleString()}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--c-text-subtle)] mt-3">
              $50 minimum. Real yields fluctuate with market volume.
            </p>
          </div>

          {/* RIGHT: result */}
          <div
            className="rounded-[var(--r-xl)] p-6 md:p-7 relative overflow-hidden"
            style={{ background: "var(--c-brand-gradient)" }}
          >
            <div className="text-white relative z-10">
              <div className="flex items-center gap-2 mb-2 text-white/80 text-[0.6875rem] font-bold tracking-[0.2em] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Projection
              </div>
              <div className="mb-6">
                <div className="text-sm text-white/80 mb-1">
                  After {plan.days} days
                </div>
                <div className="text-4xl md:text-5xl font-extrabold leading-none">
                  ${fmt(result.planEnd)}
                </div>
                <div className="text-sm text-white/80 mt-2">
                  +${fmt(result.planEarn)} earned
                </div>
              </div>

              <div className="border-t border-white/20 pt-5">
                <div className="text-sm text-white/80 mb-1">
                  If compounded for a full year
                </div>
                <div className="text-2xl md:text-3xl font-extrabold leading-none">
                  ${fmt(result.yearEnd)}
                </div>
                <div className="text-sm text-white/80 mt-2">
                  +${fmt(result.yearEarn)} compounded
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Honest disclaimer */}
        <Card elevation="raised" padding="md" className="mt-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--c-bg)] flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-[var(--c-brand-cyan)]" />
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
        </Card>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <a
            href="https://turboloop.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
          >
            <Coins className="w-4 h-4" />
            Open the dApp →
          </a>
          <a
            href="/security"
            className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] transition active:scale-[0.985]"
          >
            <Calculator className="w-4 h-4" />
            How is this safe?
          </a>
        </div>
      </Container>
    </main>
  );
}
