"use client";

// CompoundingChart — shows how a deposit grows when each plan cycle's
// full balance (principal + yield) is rolled into the next identical plan.
// This is a projection tool — the protocol pays flat ROI per cycle.
// "Compounding" here means re-depositing the full balance at each maturity.
//
// Design:
//  • Recharts AreaChart with a brand cyan→purple gradient fill.
//  • Two toggle buttons: 6 months / 12 months.
//  • Tooltip shows the balance at each cycle end, formatted as $X,XXX.
//  • Responsive — fills the parent container width.
//  • Dark-mode aware via CSS custom properties.

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { LoopPlan } from "@lib/loopPlans";

interface Props {
  plan: LoopPlan;
  deposit: number;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/** Build the projection data points.
 *  Each point represents the end of one cycle (cycle 0 = initial deposit).
 *  We stop when we exceed `maxDays` total elapsed days. */
function buildProjection(plan: LoopPlan, deposit: number, maxDays: number) {
  const points: { day: number; balance: number; cycle: number }[] = [];
  let balance = deposit;
  let day = 0;
  let cycle = 0;

  // Cycle 0 = starting point
  points.push({ day, balance, cycle });

  while (day + plan.days <= maxDays) {
    balance = balance * (1 + plan.roi);
    day += plan.days;
    cycle += 1;
    points.push({ day, balance, cycle });
  }

  return points;
}

// Custom tooltip component — shows cycle number, day, and balance.
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { cycle: number; day: number } }>;
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const { value } = payload[0];
  const { cycle, day } = payload[0].payload;
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-xl text-sm"
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        color: "var(--c-text)",
      }}
    >
      {cycle === 0 ? (
        <div className="font-bold text-[var(--c-text-subtle)]">Starting deposit</div>
      ) : (
        <div className="font-bold text-[var(--c-text-subtle)]">
          Cycle {cycle} · Day {day}
        </div>
      )}
      <div className="text-xl font-extrabold tabular-nums mt-0.5" style={{ color: "var(--c-brand-cyan)" }}>
        ${fmt(value)}
      </div>
    </div>
  );
}

export function CompoundingChart({ plan, deposit }: Props) {
  const [horizon, setHorizon] = useState<6 | 12>(6);

  const maxDays = horizon * 30;
  const data = useMemo(
    () => buildProjection(plan, deposit, maxDays),
    [plan, deposit, maxDays]
  );

  const finalBalance = data[data.length - 1]?.balance ?? deposit;
  const totalGain = finalBalance - deposit;
  const gainPct = deposit > 0 ? (totalGain / deposit) * 100 : 0;
  const cycles = data.length - 1;

  // Y-axis domain: start slightly below deposit so the baseline isn't
  // flush with the bottom edge of the chart.
  const yMin = Math.floor(deposit * 0.92);
  const yMax = Math.ceil(finalBalance * 1.06);

  return (
    <div className="mt-8 md:mt-12">
      <div
        className="rounded-[var(--r-2xl)] overflow-hidden"
        style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          boxShadow: "var(--s-md)",
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 md:px-7 md:pt-6 flex items-start justify-between gap-4 flex-wrap border-b border-[var(--c-border)]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--c-brand-gradient)" }}
            >
              <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[0.625rem] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)]">
                Compounding Projection
              </div>
              <div className="font-bold text-[var(--c-text)] text-sm md:text-base">
                {plan.label} plan · {horizon}-month outlook
              </div>
            </div>
          </div>

          {/* Horizon toggle */}
          <div
            className="flex rounded-lg overflow-hidden text-xs font-bold shrink-0"
            style={{ border: "1px solid var(--c-border)" }}
          >
            {([6, 12] as const).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHorizon(h)}
                className="px-4 h-9 transition"
                style={{
                  background: horizon === h ? "var(--c-brand-gradient)" : "var(--c-bg)",
                  color: horizon === h ? "white" : "var(--c-text-muted)",
                }}
              >
                {h}m
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-[var(--c-border)] border-b border-[var(--c-border)]">
          <StatCell label="Starting" value={`$${fmt(deposit)}`} />
          <StatCell
            label={`After ${horizon} months`}
            value={`$${fmt(finalBalance)}`}
            highlight
          />
          <StatCell
            label={`${cycles} cycle${cycles !== 1 ? "s" : ""}`}
            value={`+${gainPct.toFixed(0)}%`}
            highlight
          />
        </div>

        {/* Chart */}
        <div className="px-2 pt-5 pb-3 md:px-4">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={data}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--c-border)"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                tickFormatter={(d) => `Day ${d}`}
                tick={{ fontSize: 10, fill: "var(--c-text-subtle)" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                domain={[yMin, yMax]}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 10, fill: "var(--c-text-subtle)" }}
                axisLine={false}
                tickLine={false}
                width={44}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Reference line at the starting deposit */}
              <ReferenceLine
                y={deposit}
                stroke="var(--c-text-subtle)"
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />

              <Area
                type="monotone"
                dataKey="balance"
                stroke="url(#chartGradient)"
                strokeWidth={2.5}
                fill="url(#areaFill)"
                dot={{
                  r: 4,
                  fill: "#22d3ee",
                  stroke: "var(--c-surface)",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: "#22d3ee",
                  stroke: "var(--c-surface)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer note */}
        <div className="px-5 pb-5 md:px-7 md:pb-6">
          <p className="text-[0.6875rem] text-[var(--c-text-subtle)] leading-relaxed">
            Projection assumes each cycle&apos;s full balance is re-deposited into a new {plan.label} plan at maturity. Flat ROI per cycle: {(plan.roi * 100).toFixed(0)}%. Returns are not guaranteed — past performance does not predict future results.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="px-4 py-3 md:px-6 md:py-4 text-center">
      <div className="text-[0.625rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-1">
        {label}
      </div>
      <div
        className="text-base md:text-lg font-extrabold tabular-nums"
        style={{ color: highlight ? "var(--c-brand-cyan)" : "var(--c-text)" }}
      >
        {value}
      </div>
    </div>
  );
}
