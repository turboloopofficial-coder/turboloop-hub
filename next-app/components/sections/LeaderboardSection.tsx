// LeaderboardSection — top-10 country leaderboard, dressed as a live
// dashboard. Async server shell: fetches the rankings via the existing
// content.leaderboard tRPC query (5 min ISR), falls back to COUNTRY_DATA
// when the API is unreachable so the home page never renders empty.
//
// The interactive bits live in two client components:
//   - LeaderboardCard      → IntersectionObserver-driven bar fill,
//                             medal glow, breathing animation on rank 1.
//   - LeaderboardActivityTicker → cross-fading regional micro-updates.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { COUNTRY_DATA } from "@lib/constants";
import { api } from "@lib/api";
import { Reveal } from "@components/Reveal";
import { LeaderboardCard, type Medal } from "./LeaderboardCard";
import { LeaderboardActivityTicker } from "./LeaderboardActivityTicker";

interface LeaderboardRow {
  rank: number;
  country: string;
  /** Lowercase ISO 3166-1 alpha-2 (e.g. "de"). Schema stores it as varchar
   *  with no enforced casing — normalise here so flag URLs always work. */
  code: string;
  description: string;
  score: number;
  /** Derived from rank: 1→gold, 2→silver, 3→bronze, else none */
  medal: Medal;
}

function medalForRank(rank: number): Medal {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "none";
}

async function loadLeaderboard(): Promise<LeaderboardRow[]> {
  try {
    const rows = await api.leaderboard();
    if (!rows || rows.length === 0) throw new Error("empty");
    return rows.map(r => ({
      rank: r.rank,
      country: r.country,
      code: r.countryCode.toLowerCase(),
      description: r.description,
      score: r.score,
      medal: medalForRank(r.rank),
    }));
  } catch {
    return COUNTRY_DATA.map(c => ({
      rank: c.rank,
      country: c.country,
      code: c.code,
      description: c.description,
      score: c.score,
      medal: c.medal as Medal,
    }));
  }
}

export async function LeaderboardSection() {
  const all = await loadLeaderboard();
  const top = all.slice(0, 10);
  const max = top[0]?.score ?? 100;

  return (
    <section
      className="relative py-12 md:py-20"
      style={{
        // Soft brand-cyan spotlight behind the section so the leaderboard
        // sits in its own light pool. Very subtle — alpha 0.03 — so it
        // composites cleanly on both light and dark surfaces.
        background:
          "radial-gradient(ellipse 900px 500px at 50% 40%, rgba(8,145,178,0.04) 0%, transparent 70%)",
      }}
    >
      <Container width="default">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <Heading
                tier="eyebrow"
                className="text-[var(--c-brand-cyan)] inline-block"
              >
                Global Leaderboard
              </Heading>
              {/* "Live" pill — green pulsing dot + label. The pulse is a
                  CSS-only animation, no JS. */}
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.625rem] font-bold tracking-[0.2em] uppercase"
                style={{
                  background: "rgba(34,197,94,0.12)",
                  color: "#16a34a",
                }}
                aria-label="Live data"
              >
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
            </div>
            <Heading tier="h1">
              Top countries{" "}
              <span className="text-brand-wide">by reach.</span>
            </Heading>
            <p className="text-[var(--c-text-muted)] mt-2 max-w-xl">
              Where the community is growing fastest, this week.
            </p>
            <p className="text-[0.6875rem] text-[var(--c-text-subtle)] mt-1.5 tracking-wide">
              Updated 2 min ago
            </p>
          </div>
          <Link
            href="/community"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--c-brand-cyan)] hover:underline"
          >
            See all communities
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {top.map((c, i) => {
            const pct = (c.score / max) * 100;
            return (
              <Reveal key={c.country} delayMs={i * 80}>
                <LeaderboardCard
                  rank={c.rank}
                  country={c.country}
                  code={c.code}
                  description={c.description}
                  pct={pct}
                  medal={c.medal}
                />
              </Reveal>
            );
          })}
        </div>

        <LeaderboardActivityTicker />
      </Container>
    </section>
  );
}
