import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Zap, ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/constants";

/**
 * Interactive yield calculator.
 * Assumes a conservative daily rate (applied over 4 plan tiers).
 * Not financial advice — shown as projection, not guarantee.
 */

const DAILY_RATE = 0.009; // ~0.9%/day, conservative — real rate varies by plan

const PLAN_OPTIONS = [
  { days: 7, label: "7 Day Turbo", color: "#0891B2" },
  { days: 30, label: "30 Day Accelerate", color: "#7C3AED" },
  { days: 60, label: "60 Day Compound", color: "#9333EA" },
  { days: 90, label: "90 Day Legend", color: "#D97706" },
];

const DEPOSIT_PRESETS = [100, 500, 1000, 5000, 10000];

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${Math.round(n).toLocaleString()}`;
  return `$${n.toFixed(2)}`;
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
  const [selectedPlan, setSelectedPlan] = useState(1); // index into PLAN_OPTIONS
  const [compound, setCompound] = useState(true);

  const plan = PLAN_OPTIONS[selectedPlan];
  const days = plan.days;

  const finalBalance = useMemo(() => {
    if (compound) return deposit * Math.pow(1 + DAILY_RATE, days);
    return deposit * (1 + DAILY_RATE * days);
  }, [deposit, days, compound]);

  const totalEarned = finalBalance - deposit;
  const dailyEarn = compound ? (totalEarned / days) : (deposit * DAILY_RATE);
  const returnPct = (totalEarned / deposit) * 100;

  // Chart data — compound vs simple
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

  const maxY = Math.max(...dataPoints.map(p => p.compound));
  const animatedBalance = useCountUp(finalBalance);
  const animatedEarned = useCountUp(totalEarned);

  return (
    <section id="calculator" className="relative py-20 md:py-28 overflow-hidden">
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
            <span className="text-xs font-semibold tracking-wider text-cyan-700 uppercase">Earnings Calculator</span>
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
          <div
            className="grid md:grid-cols-5 gap-0 md:gap-8 rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
              border: "1px solid rgba(226,232,240,0.9)",
              boxShadow: "0 20px 60px -15px rgba(0,0,0,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Controls */}
            <div className="md:col-span-2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-100">
              {/* Deposit slider */}
              <label className="block mb-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">Your deposit</span>
                  <span className="text-2xl font-bold text-slate-800 tabular-nums">{formatUsd(deposit)}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={50000}
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
                        deposit === v ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      ${v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </label>

              {/* Plan picker */}
              <label className="block mb-6">
                <span className="block text-xs font-semibold tracking-wider uppercase text-slate-500 mb-2">Acceleration plan</span>
                <div className="grid grid-cols-2 gap-2">
                  {PLAN_OPTIONS.map((p, i) => (
                    <button
                      key={p.days}
                      onClick={() => setSelectedPlan(i)}
                      className="p-3 rounded-xl text-left transition-all"
                      style={{
                        background: selectedPlan === i ? `${p.color}12` : "rgba(241,245,249,0.5)",
                        border: `1.5px solid ${selectedPlan === i ? p.color : "rgba(226,232,240,0.8)"}`,
                        color: selectedPlan === i ? p.color : "#475569",
                      }}
                    >
                      <div className="text-xl font-bold leading-none">{p.days}d</div>
                      <div className="text-[11px] mt-1 opacity-80">{p.label.replace(`${p.days} Day `, "")}</div>
                    </button>
                  ))}
                </div>
              </label>

              {/* Compound toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-slate-800">Re-Loop daily</div>
                  <div className="text-xs text-slate-500">Compound your yield automatically</div>
                </div>
                <button
                  onClick={() => setCompound(!compound)}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ background: compound ? "#0891B2" : "#CBD5E1" }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                    style={{ left: compound ? "26px" : "2px" }}
                  />
                </button>
              </label>
            </div>

            {/* Results */}
            <div className="md:col-span-3 p-6 md:p-8 relative overflow-hidden">
              {/* Big projected balance */}
              <div className="mb-5">
                <div className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-1">Projected final balance</div>
                <div
                  className="text-5xl md:text-6xl font-bold tabular-nums leading-none"
                  style={{ background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  {formatUsd(animatedBalance)}
                </div>
                <div className="text-sm text-slate-500 mt-1">after {days} days</div>
              </div>

              {/* Sub stats */}
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
                  <div className="text-[10px] tracking-wider uppercase text-purple-700 font-semibold mb-0.5">Return</div>
                  <div className="text-lg font-bold text-purple-700 tabular-nums">+{returnPct.toFixed(1)}%</div>
                </div>
              </div>

              {/* Line chart */}
              <div className="mb-5">
                <svg viewBox={`0 0 ${days} 100`} preserveAspectRatio="none" className="w-full h-24 md:h-28">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0891B2" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  {/* Simple area (subtle) */}
                  {!compound && null}
                  {compound && (
                    <polyline
                      points={dataPoints.map((p) => `${p.day},${100 - (p.simple / maxY) * 95}`).join(" ")}
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="0.5"
                      strokeDasharray="1,1"
                    />
                  )}
                  {/* Compound area */}
                  <polygon
                    points={`0,100 ${dataPoints.map((p) => `${p.day},${100 - (p[compound ? "compound" : "simple"] / maxY) * 95}`).join(" ")} ${days},100`}
                    fill="url(#areaGrad)"
                  />
                  {/* Compound line */}
                  <polyline
                    points={dataPoints.map((p) => `${p.day},${100 - (p[compound ? "compound" : "simple"] / maxY) * 95}`).join(" ")}
                    fill="none"
                    stroke="#0891B2"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                    style={{ strokeWidth: 2 }}
                  />
                </svg>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-0.5">
                  <span>Day 0</span>
                  {compound && <span className="text-slate-500"><span className="inline-block w-2 h-0.5 bg-slate-400 align-middle mr-1" style={{ borderTop: "1px dashed" }}></span>Without compounding</span>}
                  <span>Day {days}</span>
                </div>
              </div>

              {/* CTA */}
              <a
                href={SITE.mainApp}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base transition-all hover:brightness-110"
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

              <p className="text-[11px] text-slate-400 text-center mt-3">
                Projection only — actual returns depend on plan selected and market conditions. Not financial advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
