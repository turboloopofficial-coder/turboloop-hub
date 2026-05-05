// LeaderboardSection — top-10 country leaderboard. Static data
// (COUNTRY_DATA in lib/constants), animated medal tiers + score bars.

import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { COUNTRY_DATA, getFlagUrl } from "@lib/constants";

const MEDAL_COLOR: Record<string, { bg: string; ring: string; emoji: string }> =
  {
    gold: { bg: "#F59E0B20", ring: "#F59E0B", emoji: "🥇" },
    silver: { bg: "#94A3B820", ring: "#94A3B8", emoji: "🥈" },
    bronze: { bg: "#D9770620", ring: "#D97706", emoji: "🥉" },
    none: { bg: "transparent", ring: "transparent", emoji: "" },
  };

export function LeaderboardSection() {
  const top = COUNTRY_DATA.slice(0, 10);
  const max = top[0]?.score ?? 100;
  return (
    <section className="py-12 md:py-20">
      <Container width="default">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
          <div>
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-3 inline-block"
            >
              Global Leaderboard
            </Heading>
            <Heading tier="h1">
              Top countries{" "}
              <span className="text-brand-wide">by reach.</span>
            </Heading>
            <p className="text-[var(--c-text-muted)] mt-2 max-w-xl">
              Where the community is growing fastest, this week.
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
            const medal = MEDAL_COLOR[c.medal];
            const pct = (c.score / max) * 100;
            return (
              <Card
                key={c.country}
                elevation="raised"
                padding="md"
                className="flex items-center gap-3"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{
                    background: medal.bg,
                    color: medal.ring,
                    border: `2px solid ${medal.ring === "transparent" ? "var(--c-border)" : medal.ring}`,
                  }}
                  aria-label={`Rank ${i + 1}`}
                >
                  {medal.emoji || i + 1}
                </div>
                <img
                  src={getFlagUrl(c.code, 80)}
                  alt={`${c.country} flag`}
                  width={40}
                  height={28}
                  loading="lazy"
                  className="rounded-sm flex-shrink-0 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[var(--c-text)] truncate">
                    {c.country}
                  </div>
                  <div className="text-xs text-[var(--c-text-muted)] truncate mb-1.5">
                    {c.description}
                  </div>
                  <div className="h-1.5 rounded-full bg-[rgba(15,23,42,0.06)] dark:bg-[rgba(255,255,255,0.06)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{
                        width: `${pct}%`,
                        background: "var(--c-brand-gradient)",
                      }}
                    />
                  </div>
                </div>
                {c.medal !== "none" && (
                  <Trophy
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: medal.ring }}
                  />
                )}
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
