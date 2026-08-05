// /leaders — TurboLoop Hall of Fame: all ranked leaders displayed publicly.
//
// Server component, ISR (revalidates every 60s).
// Premium dark cinematic gallery — full achievement banners as hero cards.
// Sections:
//   1. Hero — headline + subtitle
//   2. Rank tier sections with full-banner gallery
//   3. CTA — "Join the ranks" → /earn

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { api, type RankedLeader } from "@lib/api";
import { Container } from "@components/ui/Container";
import { PageHero } from "@components/layout/PageHero";

export const revalidate = 60;

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

function LeaderCard({ leader }: { leader: RankedLeader }) {
  const meta = RANK_META[leader.rank] ?? RANK_META["Partner"];
  const hasBanner = !!leader.bannerUrl;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border ${meta.borderGlow} bg-slate-900/60 backdrop-blur-sm shadow-2xl ${meta.glow} hover:scale-[1.02] transition-all duration-300 cursor-default`}
    >
      {/* Full achievement banner */}
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
          {/* Gradient overlay at bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

          {/* Rank badge floating top-left */}
          <span
            className={`absolute top-3 left-3 text-[11px] font-bold px-3 py-1 rounded-full ${meta.badge} shadow-lg backdrop-blur-sm`}
          >
            {meta.emoji} {leader.rank}
          </span>
        </div>
      ) : (
        /* Fallback: photo + gradient background */
        <div
          className={`relative w-full aspect-[3/4] bg-gradient-to-br ${meta.gradient} bg-slate-900 flex flex-col items-center justify-center gap-4 p-6`}
        >
          {/* Rank badge */}
          <span
            className={`absolute top-3 left-3 text-[11px] font-bold px-3 py-1 rounded-full ${meta.badge} shadow-lg`}
          >
            {meta.emoji} {leader.rank}
          </span>

          {/* Photo */}
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

          {/* Name in fallback */}
          <h3 className="text-white font-bold text-xl text-center leading-tight">
            {leader.name}
          </h3>

          {/* Stats in fallback */}
          <div className="w-full space-y-2 mt-2">
            {leader.teamSize && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Team Size</span>
                <span className="text-white font-semibold">
                  {leader.teamSize} members
                </span>
              </div>
            )}
            {leader.teamVolume && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Volume</span>
                <span className="text-emerald-400 font-bold">
                  {leader.teamVolume}
                </span>
              </div>
            )}
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>
      )}

      {/* Bottom info strip (only shown when banner is present) */}
      {hasBanner && (
        <div className="px-4 py-3 space-y-1.5">
          <h3 className="text-white font-bold text-base leading-tight">
            {leader.name}
          </h3>
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
                📍 <span className="text-slate-300">{leader.country}</span>
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

      <Container className="py-16 space-y-20">
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

                {/* Cards grid — 1 col mobile, 2 col tablet, 3 col desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {grouped[rank].map((leader) => (
                    <LeaderCard key={leader.id} leader={leader} />
                  ))}
                </div>
              </section>
            );
          }
        )}

        {/* CTA */}
        <section className="relative text-center py-16 rounded-3xl border border-white/10 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10">
            <p className="text-cyan-400 font-semibold text-sm uppercase tracking-widest mb-3">
              Your turn
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Join the Hall of Fame?
            </h2>
            <p className="text-slate-400 mb-10 max-w-lg mx-auto text-base leading-relaxed">
              Build your team, hit your volume targets, and earn your rank. Your
              achievement banner could be displayed here next.
            </p>
            <Link
              href="/earn"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-10 py-4 rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/30 text-base"
            >
              🚀 Start Earning Now
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
