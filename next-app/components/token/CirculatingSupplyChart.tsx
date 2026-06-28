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
import { TrendingDown, Flame, Lock } from "lucide-react";
import type { SupplyHistoryData, SupplySnapshot } from "@/app/api/token-supply-history/route";

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
  const circ   = snap.circulating.toLocaleString("en-US");
  const burned = snap.burned.toLocaleString("en-US");
  const locked = snap.locked.toLocaleString("en-US");

  return (
    <div
      className="rounded-xl px-4 py-3 shadow-xl text-sm"
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border-strong)",
        color: "var(--c-text)",
      }}
    >
      <p className="text-xs mb-1.5" style={{ color: "var(--c-text-muted)" }}>{label}</p>
      <p className="font-semibold" style={{ color: "var(--c-brand-cyan)" }}>
        {circ} <span style={{ color: "var(--c-text-muted)", fontWeight: 400 }}>circulating</span>
      </p>
      <p className="text-xs mt-1 text-orange-500">
        🔥 {burned} <span style={{ color: "var(--c-text-muted)" }}>burned</span>
      </p>
      <p className="text-xs mt-0.5 text-purple-500">
        🔒 {locked} <span style={{ color: "var(--c-text-muted)" }}>locked</span>
      </p>
      {snap.source === "estimated" && (
        <p className="text-xs mt-1 italic" style={{ color: "var(--c-text-subtle)" }}>estimated</p>
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
  accentClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accentClass: string;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3"
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
      }}
    >
      <div className={`p-1.5 rounded-lg mt-0.5 ${accentClass}`}>{icon}</div>
      <div>
        <p
          className="text-xs uppercase tracking-wider font-semibold"
          style={{ color: "var(--c-text-muted)" }}
        >
          {label}
        </p>
        <p className="text-lg font-bold leading-tight" style={{ color: "var(--c-text)" }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: "var(--c-text-subtle)" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CirculatingSupplyChart() {
  const [data, setData] = useState<SupplyHistoryData | null>(null);
  const [liveLockedNum, setLiveLockedNum] = useState<number | null>(null);
  const [liveBurnedNum, setLiveBurnedNum] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch chart history
    fetch("/api/token-supply-history")
      .then((r) => r.json())
      .then((d: SupplyHistoryData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch live locked + burned from token-vested (always up-to-date)
    fetch("/api/token-vested")
      .then((r) => r.json())
      .then((d: { lockedVestedNum?: number; burnedNum?: number }) => {
        if (d.lockedVestedNum) setLiveLockedNum(Math.round(d.lockedVestedNum));
        if (d.burnedNum) setLiveBurnedNum(Math.round(d.burnedNum));
      })
      .catch(() => {});
  }, []);

  const snapshots = data?.snapshots ?? [];

  function fmtDate(d: string) {
    const dt = new Date(d + "T00:00:00Z");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  }

  function fmtY(v: number) {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
    return String(v);
  }

  const chartData = snapshots.map((s) => ({
    ...s,
    label: fmtDate(s.date),
  }));

  const first = snapshots[0];
  const last  = snapshots[snapshots.length - 1];
  const dropPct    = data?.dropPct    ?? null;
  // Use live on-chain values for the stat badges (always current)
  const totalBurned = liveBurnedNum ?? data?.totalBurned ?? 0;
  const totalLocked = liveLockedNum ?? data?.totalLocked ?? 0;

  const yMin = last  ? Math.floor(last.circulating  * 0.998 / 1000) * 1000 : 960_000;
  const yMax = first ? Math.ceil(first.circulating  * 1.002 / 1000) * 1000 : 1_010_000;

  return (
    <section
      className="rounded-2xl p-5 space-y-5"
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        boxShadow: "var(--s-sm, 0 1px 3px rgba(0,0,0,.06))",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3
            className="text-base font-bold flex items-center gap-2"
            style={{ color: "var(--c-text)" }}
          >
            <TrendingDown className="w-4 h-4" style={{ color: "var(--c-brand-cyan)" }} />
            Circulating Supply
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--c-text-muted)" }}>
            Daily on-chain snapshot — supply decreases as tokens are burned
          </p>
        </div>
        {!loading && dropPct !== null && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
            ↓ {dropPct}% since launch
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="h-52 sm:h-64 w-full">
        {loading ? (
          <div
            className="h-full w-full rounded-xl animate-pulse"
            style={{ background: "var(--c-border)" }}
          />
        ) : snapshots.length === 0 ? (
          <div
            className="h-full flex items-center justify-center text-sm"
            style={{ color: "var(--c-text-muted)" }}
          >
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
                  <stop offset="5%"  stopColor="#0891b2" stopOpacity={0.20} />
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--c-border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--c-text-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={Math.max(1, Math.floor(chartData.length / 6) - 1)}
              />
              <YAxis
                tickFormatter={fmtY}
                tick={{ fill: "var(--c-text-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={46}
                domain={[yMin, yMax]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="circulating"
                stroke="#0891b2"
                strokeWidth={2}
                fill="url(#circGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#0891b2", stroke: "var(--c-surface)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatBadge
          icon={<Flame className="w-4 h-4 text-orange-500" />}
          label="Supply Burned"
          value={loading ? "—" : `${Math.round(totalBurned).toLocaleString("en-US")}`}
          sub="TURBO permanently destroyed"
          accentClass="bg-orange-500/10"
        />
        <StatBadge
          icon={<Lock className="w-4 h-4 text-purple-500" />}
          label="Supply Locked"
          value={loading ? "—" : `${Math.round(totalLocked).toLocaleString("en-US")}`}
          sub="TURBO in vesting contracts"
          accentClass="bg-purple-500/10"
        />
      </div>
    </section>
  );
}
