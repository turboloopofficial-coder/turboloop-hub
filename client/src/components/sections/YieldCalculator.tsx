import { useState, useMemo, useRef, useEffect } from "react";
import {
  Calculator,
  Zap,
  ArrowUpRight,
  Share2,
  ChevronDown,
  ChevronUp,
  LineChart as CompareIcon,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  Legend,
} from "recharts";
import { SITE } from "@/lib/constants";

/**
 * Interactive yield simulator.
 * Assumes a conservative daily rate (applied over 4 plan tiers).
 * Not financial advice — shown as projection, not guarantee.
 *
 * Math model — daily compounding (legacy):
 *   compound:  bal_d = deposit × (1 + DAILY_RATE)^d
 *   simple:    bal_d = deposit × (1 + DAILY_RATE × d)
 *
 * Recharts AreaChart powers the main view. Compare All Plans swaps in a
 * LineChart with one series per plan duration so users can eyeball how
 * locking longer multiplies the curve.
 */

const DAILY_RATE = 0.009; // ~0.9%/day, conservative — real rate varies by plan

type Plan = { days: number; label: string; short: string; color: string };
const PLAN_OPTIONS: Plan[] = [
  { days: 7, label: "7 Day Turbo", short: "Turbo", color: "#0891B2" },
  { days: 30, label: "30 Day Accelerate", short: "Accelerate", color: "#7C3AED" },
  { days: 60, label: "60 Day Compound", short: "Compound", color: "#9333EA" },
  { days: 90, label: "90 Day Legend", short: "Legend", color: "#D97706" },
];

const DEPOSIT_PRESETS = [100, 500, 1000, 5000, 10000];
const MIN_DEPOSIT = 50;
const MAX_DEPOSIT = 50000;

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${Math.round(n).toLocaleString()}`;
  return `$${n.toFixed(2)}`;
}

function formatUsdAxis(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n)}`;
}

function useCountUp(target: number, durationMs = 600): number {
  const [value, setValue] = useState(target);
  const prevTargetRef = useRef(target);
  useEffect(() => {
    const from = prevTargetRef.current;
    const to = target;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else prevTargetRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

export default function YieldCalculator() {
  const [deposit, setDeposit] = useState(1000);
  const [selectedPlan, setSelectedPlan] = useState(1);
  const [compound, setCompound] = useState(true);
  const [compareAll, setCompareAll] = useState(false);
  const [showAllDays, setShowAllDays] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Pre-fill from URL params on mount. Lets the share link round-trip
  // the user's exact scenario without a server hop.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const d = parseInt(params.get("deposit") || "", 10);
    const p = parseInt(params.get("plan") || "", 10);
    const c = params.get("compound");
    if (Number.isFinite(d) && d >= MIN_DEPOSIT && d <= MAX_DEPOSIT) {
      setDeposit(d);
    }
    const planIdx = PLAN_OPTIONS.findIndex(po => po.days === p);
    if (planIdx >= 0) setSelectedPlan(planIdx);
    if (c === "false") setCompound(false);
    else if (c === "true") setCompound(true);
  }, []);

  const plan = PLAN_OPTIONS[selectedPlan];
  const days = plan.days;

  const finalBalance = useMemo(() => {
    if (compound) return deposit * Math.pow(1 + DAILY_RATE, days);
    return deposit * (1 + DAILY_RATE * days);
  }, [deposit, days, compound]);

  const totalEarned = finalBalance - deposit;
  const dailyEarn = compound ? (totalEarned / days) : (deposit * DAILY_RATE);
  const returnPct = (totalEarned / deposit) * 100;

  // Single-plan area chart data — compound + simple curves day-by-day.
  const dataPoints = useMemo(() => {
    const pts: { day: number; compound: number; simple: number }[] = [];
    for (let d = 0; d <= days; d++) {
      pts.push({
        day: d,
        compound: deposit * Math.pow(1 + DAILY_RATE, d),
        simple: deposit * (1 + DAILY_RATE * d),
      });
    }
    return pts;
  }, [deposit, days]);

  // Compare-all-plans data — every plan's compound curve on one chart,
  // x-axis runs to 90 days. Each plan key is null past its own duration
  // so the line stops at the right place.
  const compareData = useMemo(() => {
    const maxDays = 90;
    const rows: Array<Record<string, number | null>> = [];
    for (let d = 0; d <= maxDays; d++) {
      const row: Record<string, number | null> = { day: d };
      for (const p of PLAN_OPTIONS) {
        row[`plan${p.days}`] =
          d <= p.days ? deposit * Math.pow(1 + DAILY_RATE, d) : null;
      }
      rows.push(row);
    }
    return rows;
  }, [deposit]);

  // Daily-earnings table rows for the selected plan + mode.
  const dailyBreakdown = useMemo(() => {
    const rows: Array<{ day: number; start: number; gain: number; end: number }> = [];
    if (compound) {
      let bal = deposit;
      for (let d = 1; d <= days; d++) {
        const start = bal;
        const gain = start * DAILY_RATE;
        bal = start + gain;
        rows.push({ day: d, start, gain, end: bal });
      }
    } else {
      const dailyYield = deposit * DAILY_RATE;
      for (let d = 1; d <= days; d++) {
        rows.push({
          day: d,
          start: deposit,
          gain: dailyYield,
          end: deposit + dailyYield * d,
        });
      }
    }
    return rows;
  }, [deposit, days, compound]);

  const visibleBreakdown = showAllDays ? dailyBreakdown : dailyBreakdown.slice(0, 7);

  const animatedBalance = useCountUp(finalBalance);
  const animatedEarned = useCountUp(totalEarned);

  // Share URL — same origin, /calculator route, query params encode the
  // exact scenario. Falls back to clipboard if Web Share isn't available.
  const buildShareUrl = (): string => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/calculator?deposit=${deposit}&plan=${days}&compound=${compound}`;
  };
  const onShare = async () => {
    const url = buildShareUrl();
    if (!url) return;
    const shareData = {
      title: "Turbo Loop Yield Projection",
      text: `${formatUsd(deposit)} on the ${plan.short} plan → projected ${formatUsd(finalBalance)} after ${days} days.`,
      url,
    };
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share(shareData);
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 1800);
      }
    } catch {
      // User cancelled the share sheet, or clipboard denied — quiet fail
    }
  };

  return (
    <section id="calculator" className="relative py-20 md:py-28 overflow-hidden">
      <YieldGradientKeyframes />

      {/* Bg glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, rgba(8,145,178,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(124,58,237,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 bg-gradient-to-r from-cyan-100 to-purple-100 border border-cyan-200/50">
            <Calculator className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-xs font-semibold tracking-wider text-cyan-700 uppercase">Yield Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="text-slate-800">See Your </span>
            <span style={{ background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Projected Yield
            </span>
          </h2>
          <p className="text-slate-500 mt-3">
            Interactive projection based on a conservative 0.9% daily rate. Real returns vary per plan.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Animated gradient border wrapper. The outer div is the
              rotating gradient; the inner div is the actual card with
              a solid background that masks the centre, leaving only a
              thin gradient ring visible. */}
          <div
            className="rounded-3xl p-[1.5px]"
            style={{
              background:
                "linear-gradient(120deg, #06b6d4, #7c3aed, #14b8a6, #06b6d4)",
              backgroundSize: "300% 100%",
              animation: "tl-yield-border 12s linear infinite",
            }}
          >
            <div
              className="grid md:grid-cols-5 gap-0 md:gap-8 rounded-[calc(1.5rem-1.5px)] overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
                boxShadow: "0 20px 60px -15px rgba(0,0,0,0.1)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Controls */}
              <div className="md:col-span-2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-100">
                <label className="block mb-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">Your deposit</span>
                    <span className="text-2xl font-bold text-slate-800 tabular-nums">{formatUsd(deposit)}</span>
                  </div>
                  <input
                    type="range"
                    min={MIN_DEPOSIT}
                    max={MAX_DEPOSIT}
                    step={50}
                    value={deposit}
                    onChange={(e) => setDeposit(parseInt(e.target.value))}
                    className="w-full accent-cyan-600 h-1"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {DEPOSIT_PRESETS.map((v) => (
                      <button
                        key={v}
                        onClick={() => setDeposit(v)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                          deposit === v ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        style={
                          deposit === v
                            ? { background: plan.color }
                            : undefined
                        }
                      >
                        ${v.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </label>

                <label className="block mb-6">
                  <span className="block text-xs font-semibold tracking-wider uppercase text-slate-500 mb-2">Acceleration plan</span>
                  <div className="grid grid-cols-2 gap-2">
                    {PLAN_OPTIONS.map((p, i) => (
                      <button
                        key={p.days}
                        onClick={() => setSelectedPlan(i)}
                        className="p-3 rounded-xl text-left transition-all"
                        style={{
                          background: selectedPlan === i ? p.color : "rgba(241,245,249,0.5)",
                          border: `1.5px solid ${selectedPlan === i ? p.color : "rgba(226,232,240,0.8)"}`,
                          color: selectedPlan === i ? "white" : "#475569",
                        }}
                      >
                        <div className="text-xl font-bold leading-none">{p.days}d</div>
                        <div className="text-[11px] mt-1 opacity-80">{p.short}</div>
                      </button>
                    ))}
                  </div>
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer mb-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Re-Loop daily</div>
                    <div className="text-xs text-slate-500">Compound your yield automatically</div>
                  </div>
                  <button
                    onClick={() => setCompound(!compound)}
                    className="relative w-12 h-6 rounded-full transition-colors"
                    style={{ background: compound ? "#0891B2" : "#CBD5E1" }}
                    aria-pressed={compound}
                    aria-label="Toggle compound"
                  >
                    <span
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                      style={{ left: compound ? "26px" : "2px" }}
                    />
                  </button>
                </label>

                <button
                  type="button"
                  onClick={() => setCompareAll(c => !c)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition border"
                  style={{
                    background: compareAll ? "rgba(8,145,178,0.08)" : "white",
                    borderColor: compareAll ? "#0891B2" : "#E2E8F0",
                    color: compareAll ? "#0891B2" : "#475569",
                  }}
                  aria-pressed={compareAll}
                >
                  <CompareIcon className="w-3.5 h-3.5" />
                  {compareAll ? "Showing all plans" : "Compare All Plans"}
                </button>
              </div>

              {/* Results */}
              <div className="md:col-span-3 p-6 md:p-8 relative overflow-hidden">
                <div className="mb-5">
                  <div className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-1">Your projected return</div>
                  <div
                    className="text-5xl md:text-6xl font-bold tabular-nums leading-none"
                    style={{ background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                  >
                    {formatUsd(animatedBalance)}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">after {days} days</div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/50">
                    <div className="text-[10px] tracking-wider uppercase text-emerald-700 font-semibold mb-0.5">Total earned</div>
                    <div className="text-lg font-bold text-emerald-700 tabular-nums">+{formatUsd(animatedEarned)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200/50">
                    <div className="text-[10px] tracking-wider uppercase text-cyan-700 font-semibold mb-0.5">Daily avg</div>
                    <div className="text-lg font-bold text-cyan-700 tabular-nums">{formatUsd(dailyEarn)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-200/50">
                    <div className="text-[10px] tracking-wider uppercase text-purple-700 font-semibold mb-0.5">Total ROI</div>
                    <div className="text-lg font-bold text-purple-700 tabular-nums">+{returnPct.toFixed(1)}%</div>
                  </div>
                </div>

                {/* Recharts */}
                <div className="mb-3 -mx-1">
                  <div className="h-[200px] md:h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {compareAll ? (
                        <LineChart data={compareData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                          <CartesianGrid stroke="rgba(15,23,42,0.06)" vertical={false} />
                          <XAxis
                            dataKey="day"
                            tick={{ fontSize: 10, fill: "#94A3B8" }}
                            tickLine={false}
                            axisLine={{ stroke: "rgba(15,23,42,0.1)" }}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: "#94A3B8" }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatUsdAxis}
                            width={56}
                          />
                          <Tooltip content={<CompareTooltipContent />} />
                          <Legend
                            wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                            iconType="circle"
                            formatter={(value: string) => {
                              const days = parseInt(value.replace("plan", ""), 10);
                              const p = PLAN_OPTIONS.find(po => po.days === days);
                              return p ? p.label : value;
                            }}
                          />
                          <ReferenceLine
                            y={deposit}
                            stroke="#94A3B8"
                            strokeDasharray="4 4"
                            label={{ value: "Your Deposit", position: "insideTopLeft", fontSize: 10, fill: "#64748B" }}
                          />
                          {PLAN_OPTIONS.map(p => (
                            <Line
                              key={p.days}
                              type="monotone"
                              dataKey={`plan${p.days}`}
                              stroke={p.color}
                              strokeWidth={2}
                              dot={false}
                              connectNulls={false}
                              isAnimationActive={true}
                              animationDuration={800}
                            />
                          ))}
                        </LineChart>
                      ) : (
                        <AreaChart data={dataPoints} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                          <defs>
                            <linearGradient id="tl-compound-fill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.45} />
                              <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="tl-simple-fill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#1E293B" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(15,23,42,0.06)" vertical={false} />
                          <XAxis
                            dataKey="day"
                            tick={{ fontSize: 10, fill: "#94A3B8" }}
                            tickLine={false}
                            axisLine={{ stroke: "rgba(15,23,42,0.1)" }}
                            label={{ value: "Days", position: "insideBottom", offset: -2, fontSize: 10, fill: "#94A3B8" }}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: "#94A3B8" }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatUsdAxis}
                            width={56}
                          />
                          <Tooltip content={<SingleTooltipContent />} />
                          <ReferenceLine
                            y={deposit}
                            stroke="#94A3B8"
                            strokeDasharray="4 4"
                            label={{ value: "Your Deposit", position: "insideTopLeft", fontSize: 10, fill: "#64748B" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="simple"
                            name="Without Compounding"
                            stroke="#64748B"
                            strokeWidth={1.5}
                            strokeDasharray="3 3"
                            fill="url(#tl-simple-fill)"
                            isAnimationActive={true}
                            animationDuration={800}
                          />
                          <Area
                            type="monotone"
                            dataKey="compound"
                            name="With Compounding"
                            stroke="#0891B2"
                            strokeWidth={2.5}
                            fill="url(#tl-compound-fill)"
                            isAnimationActive={true}
                            animationDuration={800}
                          />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-center mb-4">
                  Projections are illustrative only. Not financial advice.
                </p>

                <div className="flex gap-2 mb-4">
                  <a
                    href={SITE.mainApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:brightness-110"
                    style={{
                      background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                      color: "white",
                      boxShadow: "0 10px 30px -8px rgba(8,145,178,0.4)",
                    }}
                  >
                    <Zap className="w-4 h-4" />
                    Start Earning Now
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                  <button
                    type="button"
                    onClick={onShare}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl text-sm font-bold border transition"
                    style={{
                      background: shareCopied ? "rgba(16,185,129,0.1)" : "white",
                      borderColor: shareCopied ? "#10B981" : "#E2E8F0",
                      color: shareCopied ? "#047857" : "#475569",
                    }}
                    aria-label="Share this projection"
                  >
                    {shareCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Daily-earnings breakdown table — below the card so it
              doesn't fight the projection number for attention. */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="px-4 md:px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold tracking-wider uppercase text-slate-500">Daily earnings breakdown</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {compound ? "Daily compounding applied" : "Simple interest on principal"} · {plan.label}
                </div>
              </div>
              {dailyBreakdown.length > 7 && (
                <button
                  type="button"
                  onClick={() => setShowAllDays(s => !s)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-800"
                >
                  {showAllDays ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Show first 7 days
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Show all {dailyBreakdown.length} days
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] tracking-wider uppercase text-slate-500 bg-slate-50">
                    <th className="text-left px-4 md:px-5 py-2 font-semibold">Day</th>
                    <th className="text-right px-4 py-2 font-semibold">Starting balance</th>
                    <th className="text-right px-4 py-2 font-semibold">Daily yield</th>
                    <th className="text-right px-4 md:px-5 py-2 font-semibold">Ending balance</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBreakdown.map(r => (
                    <tr key={r.day} className="border-t border-slate-100">
                      <td className="px-4 md:px-5 py-2 text-slate-600 font-medium">Day {r.day}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-slate-700">{formatUsd(r.start)}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-emerald-700">+{formatUsd(r.gain)}</td>
                      <td className="px-4 md:px-5 py-2 text-right tabular-nums font-bold text-slate-900">{formatUsd(r.end)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Chart tooltips ──────────────────────────────────────────────────

function SingleTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const comp = payload.find((p: any) => p.dataKey === "compound")?.value ?? 0;
  const sim = payload.find((p: any) => p.dataKey === "simple")?.value ?? 0;
  const diff = comp - sim;
  return (
    <div className="rounded-lg bg-white border border-slate-200 shadow-lg px-3 py-2 text-xs">
      <div className="font-bold text-slate-800 mb-1">Day {label}</div>
      <div className="flex items-center gap-2 text-slate-600">
        <span className="inline-block w-2 h-2 rounded-full bg-cyan-500" />
        With compounding: <span className="font-bold tabular-nums text-slate-800">{formatUsd(comp)}</span>
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <span className="inline-block w-2 h-2 rounded-full bg-slate-400" />
        Without compounding: <span className="font-bold tabular-nums text-slate-700">{formatUsd(sim)}</span>
      </div>
      {diff > 0.5 && (
        <div className="mt-1 pt-1 border-t border-slate-100 text-emerald-700 font-bold tabular-nums">
          Extra from compounding: +{formatUsd(diff)}
        </div>
      )}
    </div>
  );
}

function CompareTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white border border-slate-200 shadow-lg px-3 py-2 text-xs">
      <div className="font-bold text-slate-800 mb-1">Day {label}</div>
      {payload
        .filter((p: any) => p.value != null)
        .map((p: any) => {
          const days = parseInt(String(p.dataKey).replace("plan", ""), 10);
          const planMeta = PLAN_OPTIONS.find(po => po.days === days);
          return (
            <div key={p.dataKey} className="flex items-center gap-2 text-slate-600">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: planMeta?.color ?? "#64748B" }}
              />
              {planMeta?.label ?? p.dataKey}:{" "}
              <span className="font-bold tabular-nums text-slate-800">
                {formatUsd(p.value)}
              </span>
            </div>
          );
        })}
    </div>
  );
}

// ─── Animated border keyframes ───────────────────────────────────────

function YieldGradientKeyframes() {
  // Inlined so the animation works without a tailwind config change.
  return (
    <style>{`
      @keyframes tl-yield-border {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `}</style>
  );
}
