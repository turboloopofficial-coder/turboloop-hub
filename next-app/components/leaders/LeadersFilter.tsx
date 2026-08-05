"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { RankedLeader } from "@lib/api";

// ─── Country → flag emoji helper ────────────────────────────────────────────
function flagEmoji(countryName: string): string {
  const map: Record<string, string> = {
    Nigeria: "🇳🇬",
    Philippines: "🇵🇭",
    Indonesia: "🇮🇩",
    India: "🇮🇳",
    Vietnam: "🇻🇳",
    Thailand: "🇹🇭",
    Malaysia: "🇲🇾",
    Ghana: "🇬🇭",
    Kenya: "🇰🇪",
    "South Africa": "🇿🇦",
    Pakistan: "🇵🇰",
    Bangladesh: "🇧🇩",
    Brazil: "🇧🇷",
    Mexico: "🇲🇽",
    Colombia: "🇨🇴",
    Argentina: "🇦🇷",
    Russia: "🇷🇺",
    Ukraine: "🇺🇦",
    China: "🇨🇳",
    Japan: "🇯🇵",
    "South Korea": "🇰🇷",
    USA: "🇺🇸",
    "United States": "🇺🇸",
    UK: "🇬🇧",
    "United Kingdom": "🇬🇧",
    Canada: "🇨🇦",
    Australia: "🇦🇺",
    Germany: "🇩🇪",
    France: "🇫🇷",
    Spain: "🇪🇸",
    Italy: "🇮🇹",
    Turkey: "🇹🇷",
    Egypt: "🇪🇬",
    Morocco: "🇲🇦",
    Ethiopia: "🇪🇹",
    Tanzania: "🇹🇿",
    Uganda: "🇺🇬",
    Cameroon: "🇨🇲",
    "Ivory Coast": "🇨🇮",
    Senegal: "🇸🇳",
    "Sri Lanka": "🇱🇰",
    Nepal: "🇳🇵",
    Myanmar: "🇲🇲",
    Cambodia: "🇰🇭",
    Laos: "🇱🇦",
    Singapore: "🇸🇬",
    UAE: "🇦🇪",
    "Saudi Arabia": "🇸🇦",
    Iraq: "🇮🇶",
    Iran: "🇮🇷",
    Kazakhstan: "🇰🇿",
    Uzbekistan: "🇺🇿",
    Poland: "🇵🇱",
    Romania: "🇷🇴",
    Netherlands: "🇳🇱",
    Portugal: "🇵🇹",
    Peru: "🇵🇪",
    Venezuela: "🇻🇪",
    Chile: "🇨🇱",
    Ecuador: "🇪🇨",
    Bolivia: "🇧🇴",
    "Dominican Republic": "🇩🇴",
    Honduras: "🇭🇳",
    Guatemala: "🇬🇹",
  };
  return map[countryName] ?? "🌍";
}

// ─── Rank metadata ────────────────────────────────────────────────────────────
const RANK_ORDER = [
  "Ambassador",
  "Turbo Leader",
  "Executive",
  "Turbo Influencer",
  "Senior Partner",
  "Turbo Partner",
  "Partner",
];

const RANK_META: Record<
  string,
  {
    emoji: string;
    gradient: string;
    badge: string;
    glow: string;
    borderGlow: string;
    headerGradient: string;
  }
> = {
  Ambassador: {
    emoji: "👑",
    gradient: "from-yellow-500/30 via-amber-400/15 to-transparent",
    badge: "bg-yellow-500/20 text-yellow-200 border border-yellow-400/50",
    glow: "shadow-yellow-500/40",
    borderGlow: "border-yellow-400/40 hover:border-yellow-400/80",
    headerGradient: "from-yellow-500/20 to-amber-400/5",
  },
  "Turbo Leader": {
    emoji: "🌠",
    gradient: "from-yellow-400/25 via-amber-300/12 to-transparent",
    badge: "bg-yellow-400/20 text-yellow-200 border border-yellow-300/50",
    glow: "shadow-yellow-400/40",
    borderGlow: "border-yellow-300/40 hover:border-yellow-300/80",
    headerGradient: "from-yellow-400/20 to-amber-300/5",
  },
  Executive: {
    emoji: "💎",
    gradient: "from-purple-500/25 via-violet-400/12 to-transparent",
    badge: "bg-purple-500/20 text-purple-200 border border-purple-400/50",
    glow: "shadow-purple-500/40",
    borderGlow: "border-purple-400/40 hover:border-purple-400/80",
    headerGradient: "from-purple-500/20 to-violet-400/5",
  },
  "Turbo Influencer": {
    emoji: "⚡",
    gradient: "from-pink-500/25 via-rose-400/12 to-transparent",
    badge: "bg-pink-500/20 text-pink-200 border border-pink-400/50",
    glow: "shadow-pink-500/40",
    borderGlow: "border-pink-400/40 hover:border-pink-400/80",
    headerGradient: "from-pink-500/20 to-rose-400/5",
  },
  "Senior Partner": {
    emoji: "🌟",
    gradient: "from-cyan-500/25 via-sky-400/12 to-transparent",
    badge: "bg-cyan-500/20 text-cyan-200 border border-cyan-400/50",
    glow: "shadow-cyan-500/40",
    borderGlow: "border-cyan-400/40 hover:border-cyan-400/80",
    headerGradient: "from-cyan-500/20 to-sky-400/5",
  },
  "Turbo Partner": {
    emoji: "🚀",
    gradient: "from-orange-500/25 via-amber-400/12 to-transparent",
    badge: "bg-orange-500/20 text-orange-200 border border-orange-400/50",
    glow: "shadow-orange-500/40",
    borderGlow: "border-orange-400/40 hover:border-orange-400/80",
    headerGradient: "from-orange-500/20 to-amber-400/5",
  },
  Partner: {
    emoji: "🏆",
    gradient: "from-emerald-500/25 via-green-400/12 to-transparent",
    badge: "bg-emerald-500/20 text-emerald-200 border border-emerald-400/50",
    glow: "shadow-emerald-500/40",
    borderGlow: "border-emerald-400/40 hover:border-emerald-400/80",
    headerGradient: "from-emerald-500/20 to-green-400/5",
  },
};

// ─── Leader Card ──────────────────────────────────────────────────────────────
function LeaderCard({ leader }: { leader: RankedLeader }) {
  const meta = RANK_META[leader.rank] ?? RANK_META["Partner"];
  const hasBanner = !!leader.bannerUrl;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border ${meta.borderGlow} bg-slate-900/60 backdrop-blur-sm shadow-2xl ${meta.glow} hover:scale-[1.02] transition-all duration-300 cursor-default`}
    >
      {hasBanner ? (
        <div className="relative w-full aspect-[3/4] overflow-hidden">
          <Image
            src={leader.bannerUrl!}
            alt={`${leader.name} — ${leader.rank} Achievement Banner`}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          <span
            className={`absolute top-3 left-3 text-[11px] font-bold px-3 py-1 rounded-full ${meta.badge} shadow-lg backdrop-blur-sm`}
          >
            {meta.emoji} {leader.rank}
          </span>
        </div>
      ) : (
        <div
          className={`relative w-full aspect-[3/4] bg-gradient-to-br ${meta.gradient} bg-slate-900 flex flex-col items-center justify-center gap-4 p-6`}
        >
          <span
            className={`absolute top-3 left-3 text-[11px] font-bold px-3 py-1 rounded-full ${meta.badge} shadow-lg`}
          >
            {meta.emoji} {leader.rank}
          </span>
          <div
            className={`w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl ${meta.glow}`}
          >
            {leader.photoUrl ? (
              <Image
                src={leader.photoUrl}
                alt={leader.name}
                width={128}
                height={128}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-slate-700 flex items-center justify-center text-4xl">
                👤
              </div>
            )}
          </div>
          <h3 className="text-white font-bold text-xl text-center leading-tight">
            {leader.name}
          </h3>
          <div className="w-full space-y-2 mt-2">
            {leader.teamSize && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Team Size</span>
                <span className="text-white font-semibold">{leader.teamSize} members</span>
              </div>
            )}
            {leader.teamVolume && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Volume</span>
                <span className="text-emerald-400 font-bold">{leader.teamVolume}</span>
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>
      )}

      {hasBanner && (
        <div className="px-4 py-3 space-y-1.5">
          <h3 className="text-white font-bold text-base leading-tight">{leader.name}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {leader.teamSize && (
              <span className="text-xs text-slate-400">
                👥 <span className="text-white font-medium">{leader.teamSize} members</span>
              </span>
            )}
            {leader.teamVolume && (
              <span className="text-xs text-slate-400">
                💰 <span className="text-emerald-400 font-bold">{leader.teamVolume}</span>
              </span>
            )}
            {leader.country && (
              <span className="text-xs text-slate-400">
                {flagEmoji(leader.country)}{" "}
                <span className="text-slate-300">{leader.country}</span>
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-600 italic pt-0.5">
            ✅ Verified TurboLoop {leader.rank}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Filter Component ────────────────────────────────────────────────────
export function LeadersFilter({ leaders }: { leaders: RankedLeader[] }) {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");

  // Build unique sorted country list
  const countries = useMemo(() => {
    const set = new Set<string>();
    leaders.forEach((l) => {
      if (l.country) set.add(l.country);
    });
    return Array.from(set).sort();
  }, [leaders]);

  // Filtered leaders
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return leaders.filter((l) => {
      const matchesSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        (l.country ?? "").toLowerCase().includes(q) ||
        l.rank.toLowerCase().includes(q);
      const matchesCountry =
        selectedCountry === "all" || l.country === selectedCountry;
      return matchesSearch && matchesCountry;
    });
  }, [leaders, search, selectedCountry]);

  // Group filtered leaders by rank
  const grouped = useMemo(() => {
    return RANK_ORDER.reduce<Record<string, RankedLeader[]>>((acc, rank) => {
      acc[rank] = filtered
        .filter((l) => l.rank === rank)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      return acc;
    }, {});
  }, [filtered]);

  const visibleRanks = RANK_ORDER.filter((r) => (grouped[r]?.length ?? 0) > 0);
  const isFiltering = search.trim() !== "" || selectedCountry !== "all";

  return (
    <div className="space-y-10">
      {/* ── Search + Filter Bar ── */}
      <div className="sticky top-0 z-20 py-4 bg-[#050B18]/90 backdrop-blur-md border-b border-white/5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search input */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, country, or rank…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/70 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-lg leading-none"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Country / Language filter */}
          <div className="relative min-w-[200px]">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">
              🌍
            </span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-800/70 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {flagEmoji(c)} {c}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">
              ▾
            </span>
          </div>

          {/* Active filter pill + clear */}
          {isFiltering && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCountry("all");
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-sm hover:bg-cyan-500/25 transition-all whitespace-nowrap"
            >
              ✕ Clear filters
              <span className="bg-cyan-500/30 text-cyan-200 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {filtered.length}
              </span>
            </button>
          )}
        </div>

        {/* Country filter chips (quick-select) */}
        {countries.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => setSelectedCountry("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                selectedCountry === "all"
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-200"
                  : "bg-slate-800/50 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
              }`}
            >
              🌐 All
            </button>
            {countries.map((c) => (
              <button
                key={c}
                onClick={() =>
                  setSelectedCountry(selectedCountry === c ? "all" : c)
                }
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  selectedCountry === c
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-200"
                    : "bg-slate-800/50 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
                }`}
              >
                {flagEmoji(c)} {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Results ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-slate-400 text-lg">
            No leaders found matching your search.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCountry("all");
            }}
            className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm underline transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        visibleRanks.map((rank) => {
          const meta = RANK_META[rank] ?? RANK_META["Partner"];
          return (
            <section key={rank}>
              <div
                className={`flex items-center gap-4 mb-10 pb-4 border-b border-white/10 bg-gradient-to-r ${meta.headerGradient} rounded-xl px-5 py-4`}
              >
                <span className="text-4xl">{meta.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">{rank}</h2>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {grouped[rank].length} verified leader
                    {grouped[rank].length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-4" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {grouped[rank].map((leader) => (
                  <LeaderCard key={leader.id} leader={leader} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
