// /leaders — TurboLoop Hall of Fame: all ranked leaders displayed publicly.
//
// Server component, ISR (revalidates every 5 min).
// Dark cinematic palette matching the rest of the site.
// Sections:
//   1. Hero — headline + subtitle
//   2. Rank tier filter tabs
//   3. Leader cards grid — photo, name, rank badge, team stats, country, date
//   4. CTA — "Join the ranks" → /earn

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { api, type RankedLeader } from "@lib/api";
import { Container } from "@components/ui/Container";
import { PageHero } from "@components/layout/PageHero";

export const metadata: Metadata = {
  title: "Hall of Fame — Ranked Leaders | TurboLoop",
  description:
    "Meet the TurboLoop community's top-ranked leaders. Real people, real results — verified team sizes and volumes from our global DeFi network.",
  alternates: {
    canonical: "https://www.turboloop.tech/leaders",
  },
  openGraph: {
    title: "Hall of Fame — Ranked Leaders | TurboLoop",
    description:
      "Meet the TurboLoop community's top-ranked leaders. Real people, real results.",
    url: "https://www.turboloop.tech/leaders",
    images: [
      {
        url: "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-leaders.png",
        width: 1200,
        height: 630,
        alt: "TurboLoop Hall of Fame",
      },
    ],
  },
};

const RANK_ORDER = [
  "Ambassador",
  "Executive",
  "Senior Partner",
  "Turbo Partner",
  "Partner",
];

const RANK_META: Record<
  string,
  { emoji: string; gradient: string; badge: string; glow: string }
> = {
  Ambassador: {
    emoji: "👑",
    gradient: "from-yellow-500/20 via-amber-400/10 to-transparent",
    badge:
      "bg-yellow-500/20 text-yellow-300 border border-yellow-400/40 shadow-yellow-500/20",
    glow: "shadow-yellow-500/30",
  },
  Executive: {
    emoji: "💎",
    gradient: "from-purple-500/20 via-violet-400/10 to-transparent",
    badge:
      "bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-purple-500/20",
    glow: "shadow-purple-500/30",
  },
  "Senior Partner": {
    emoji: "🌟",
    gradient: "from-cyan-500/20 via-sky-400/10 to-transparent",
    badge:
      "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-cyan-500/20",
    glow: "shadow-cyan-500/30",
  },
  "Turbo Partner": {
    emoji: "🚀",
    gradient: "from-orange-500/20 via-amber-400/10 to-transparent",
    badge:
      "bg-orange-500/20 text-orange-300 border border-orange-400/40 shadow-orange-500/20",
    glow: "shadow-orange-500/30",
  },
  Partner: {
    emoji: "🏆",
    gradient: "from-emerald-500/20 via-green-400/10 to-transparent",
    badge:
      "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-emerald-500/20",
    glow: "shadow-emerald-500/30",
  },
};

function LeaderCard({ leader }: { leader: RankedLeader }) {
  const meta = RANK_META[leader.rank] ?? RANK_META["Partner"];
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${meta.gradient} bg-slate-900/80 backdrop-blur-sm p-5 flex flex-col items-center gap-4 shadow-xl ${meta.glow} hover:scale-[1.02] transition-transform duration-300`}
    >
      {/* Rank badge top-right */}
      <span
        className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badge} shadow-lg`}
      >
        {meta.emoji} {leader.rank}
      </span>

      {/* Photo */}
      <div className="relative mt-2">
        <div
          className={`w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-xl ${meta.glow}`}
        >
          {leader.photoUrl ? (
            <Image
              src={leader.photoUrl}
              alt={leader.name}
              width={96}
              height={96}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-3xl">
              👤
            </div>
          )}
        </div>
        {/* Glow ring */}
        <div
          className={`absolute inset-0 rounded-full blur-md opacity-40 bg-gradient-to-br ${meta.gradient} -z-10`}
        />
      </div>

      {/* Name */}
      <h3 className="text-white font-bold text-base text-center leading-tight">
        {leader.name}
      </h3>

      {/* Stats */}
      <div className="w-full space-y-1.5">
        {leader.teamSize && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Team Size</span>
            <span className="text-white font-semibold">{leader.teamSize} members</span>
          </div>
        )}
        {leader.teamVolume && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Team Volume</span>
            <span className="text-emerald-400 font-bold">{leader.teamVolume}</span>
          </div>
        )}
        {leader.country && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Country</span>
            <span className="text-slate-300">{leader.country}</span>
          </div>
        )}
        {leader.achievedAt && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Achieved</span>
            <span className="text-slate-300">{leader.achievedAt}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-full border-t border-white/10 pt-2">
        <p className="text-center text-[10px] text-slate-500 italic">
          Verified TurboLoop {leader.rank}
        </p>
      </div>
    </div>
  );
}

export default async function LeadersPage() {
  const leaders = await api.rankedLeaders();
  const published = leaders.filter((l) => l.published);

  const grouped = RANK_ORDER.reduce<Record<string, RankedLeader[]>>(
    (acc, rank) => {
      acc[rank] = published
        .filter((l) => l.rank === rank)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      return acc;
    },
    {}
  );

  const totalLeaders = published.length;
  const hasAny = totalLeaders > 0;

  return (
    <div className="dark bg-[#050B18] min-h-screen">
      <PageHero
        title="Hall of Fame"
        subtitle={`${totalLeaders > 0 ? `${totalLeaders} verified leaders` : "Our growing community"} — real people, real results from the TurboLoop global network.`}
        badge="🏆 Ranked Leaders"
      />

      <Container className="py-16 space-y-16">
        {!hasAny && (
          <div className="text-center py-24">
            <p className="text-slate-400 text-lg">
              Our first ranked leaders are being verified. Check back soon!
            </p>
          </div>
        )}

        {RANK_ORDER.filter((rank) => (grouped[rank]?.length ?? 0) > 0).map(
          (rank) => {
            const meta = RANK_META[rank] ?? RANK_META["Partner"];
            return (
              <section key={rank}>
                {/* Rank section header */}
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-3xl">{meta.emoji}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{rank}</h2>
                    <p className="text-slate-400 text-sm">
                      {grouped[rank].length} leader
                      {grouped[rank].length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-4" />
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {grouped[rank].map((leader) => (
                    <LeaderCard key={leader.id} leader={leader} />
                  ))}
                </div>
              </section>
            );
          }
        )}

        {/* CTA */}
        <section className="text-center py-12 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to Join the Hall of Fame?
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Build your team, hit your volume targets, and earn your rank. Your
            name could be here next.
          </p>
          <Link
            href="/earn"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/30"
          >
            🚀 Start Earning Now
          </Link>
        </section>
      </Container>
    </div>
  );
}
