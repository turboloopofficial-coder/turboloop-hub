"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingDown, Flame } from "lucide-react";
import type { SupplyHistoryData, SupplySnapshot } from "@/app/api/token-supply-history/route";

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-pulse rounded bg-white/10 ${className ?? ""}`}
    />
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: SupplySnapshot }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const snap = payload[0].payload;
  const circ = snap.circulating.toLocaleString("en-US");
  const burned = snap.burned.toLocaleString("en-US");

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d1a]/95 backdrop-blur-sm px-4 py-3 shadow-xl text-sm">
      <p className="text-white/50 text-xs mb-1.5">{label}</p>
      <p className="text-cyan-300 font-semibold">
        {circ} <span className="text-white/40 font-normal">circulating</span>
      </p>
      <p className="text-orange-400 text-xs mt-1">
        {burned} <span className="text-white/40">burned total</span>
      </p>
      {snap.source === "estimated" && (
        <p className="text-white/25 text-xs mt-1 italic">estimated</p>
      )}
    </div>
  );
}

// ── Stat Badge ────────────────────────────────────────────────────────────────
function StatBadge({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/8 px-4 py-3">
      <div className={`p-1.5 rounded-lg mt-0.5 ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-lg font-bold text-white leading-tight">{value}</p>
        {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CirculatingSupplyChart() {
  const [data, setData] = useState<SupplyHistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/token-supply-history")
      .then((r) => r.json())
      .then((d: SupplyHistoryData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const snapshots = data?.snapshots ?? [];

  // Format date label: "Jun 6"
  function fmtDate(d: string) {
    const dt = new Date(d + "T00:00:00Z");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  }

  // Y-axis tick formatter: "970K"
  function fmtY(v: number) {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
    return String(v);
  }

  // Chart data
  const chartData = snapshots.map((s) => ({
    ...s,
    label: fmtDate(s.date),
  }));

  // Stats
  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];
  const totalDrop = data?.totalDrop ?? 0;
  const dropPct = data?.dropPct ?? null;
  const totalBurned = data?.totalBurned ?? 0;

  // Y-axis domain: pad 1% above first point, 1% below last
  const yMin = last ? Math.floor(last.circulating * 0.998 / 1000) * 1000 : 960_000;
  const yMax = first ? Math.ceil(first.circulating * 1.002 / 1000) * 1000 : 1_010_000;

  return (
    <section className="rounded-2xl bg-white/[0.03] border border-white/8 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-cyan-400" />
            Circulating Supply
          </h3>
          <p className="text-xs text-white/35 mt-0.5">
            Daily on-chain snapshot — supply decreases as tokens are burned
          </p>
        </div>
        {!loading && dropPct !== null && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">
            ↓ {dropPct}% since launch
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="h-52 sm:h-64 w-full">
        {loading ? (
          <div className="h-full w-full rounded-xl bg-white/5 animate-pulse" />
        ) : snapshots.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/30 text-sm">
            Chart data unavailable
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="circGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={Math.max(1, Math.floor(chartData.length / 6) - 1)}
              />
              <YAxis
                tickFormatter={fmtY}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={46}
                domain={[yMin, yMax]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="circulating"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#circGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#06b6d4", stroke: "#0d0d1a", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatBadge
          icon={<TrendingDown className="w-4 h-4 text-cyan-400" />}
          label="Supply Removed"
          value={loading ? "—" : `${totalDrop.toLocaleString("en-US")}`}
          sub="TURBO since launch"
          color="bg-cyan-500/15"
        />
        <StatBadge
          icon={<Flame className="w-4 h-4 text-orange-400" />}
          label="Total Burned"
          value={loading ? "—" : `${Math.round(totalBurned).toLocaleString("en-US")}`}
          sub="TURBO permanently destroyed"
          color="bg-orange-500/15"
        />
      </div>
    </section>
  );
}
