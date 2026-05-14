// ProgramsSection — two side-by-side cards on /apply explaining the
// Star Content Creator payout tiers and the Community Builder
// monthly stipend. Creator Star CTA anchors down to the application
// form rendered on the same /apply page (#apply); Builder CTA links
// to Telegram support; "Open roles" routes to /careers for the
// language-specific Zoom Presenter listings.
//
// Server component, no client JS.

import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { Card } from "@components/ui/Card";
import { Star, Users2, ArrowUpRight } from "lucide-react";

const SUPPORT_URL = "https://t.me/TurboLoop_Support";

/** Payout tiers for the Star Content Creator program. Views counted
 *  during the 45-day window from submission. Tier matching is
 *  "highest you've reached at the 44-day check," not cumulative across
 *  windows. */
const CREATOR_TIERS = [
  { views: "500",       payout: "$5" },
  { views: "1,000",     payout: "$15" },
  { views: "2,500",     payout: "$50" },
  { views: "5,000",     payout: "$80" },
  { views: "10,000",    payout: "$150" },
  { views: "100,000",   payout: "$300" },
  { views: "500,000",   payout: "$500" },
  { views: "1,000,000", payout: "$1,000" },
] as const;

export function ProgramsSection() {
  return (
    <section className="py-12 md:py-16">
      <Container width="default">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-brand-cyan)] mb-3 inline-block"
          >
            Get paid to build
          </Heading>
          <Heading tier="h2" as="h2" className="mb-3">
            Two ways to{" "}
            <span className="text-brand-wide">earn with us.</span>
          </Heading>
          <p className="text-[var(--c-text-muted)] leading-relaxed">
            Make a video that gets views. Host a Zoom session that
            converts. Both programs pay in stablecoins.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
          {/* ─── Star Content Creator ────────────────────────────── */}
          <Card
            elevation="prominent"
            padding="lg"
            className="relative overflow-hidden"
          >
            <div
              className="absolute inset-0 -z-10 opacity-10 pointer-events-none"
              style={{ background: "var(--c-brand-gradient)" }}
              aria-hidden="true"
            />
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-brand flex items-center justify-center shadow-[var(--s-brand)] flex-shrink-0">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <Heading tier="title" as="h3">
                  Star Content Creator
                </Heading>
                <p className="text-sm text-[var(--c-text-muted)] mt-1">
                  Make a video. Get the views. Get paid. Tier matches
                  the highest view-count you reach within 45 days of
                  submission.
                </p>
              </div>
            </div>

            <div className="rounded-[var(--r-lg)] border border-[var(--c-border)] overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-[var(--c-bg)] text-[var(--c-text-subtle)]">
                  <tr>
                    <th className="text-left text-[0.6875rem] font-bold tracking-[0.16em] uppercase px-4 py-2.5">
                      Views (45d)
                    </th>
                    <th className="text-right text-[0.6875rem] font-bold tracking-[0.16em] uppercase px-4 py-2.5">
                      Payout (USDT)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CREATOR_TIERS.map(t => (
                    <tr
                      key={t.views}
                      className="border-t border-[var(--c-border)]"
                    >
                      <td className="px-4 py-2.5 text-[var(--c-text)] font-semibold tabular-nums">
                        {t.views}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="bg-brand bg-clip-text text-transparent font-extrabold tabular-nums">
                          {t.payout}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-[var(--c-text-subtle)] mb-5 leading-relaxed">
              Submit your YouTube link + wallet via{" "}
              <strong className="text-[var(--c-text)]">/submit</strong>{" "}
              (pick "Creator Star application"). We track view counts
              automatically; payouts ship in USDT to the wallet on file.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#apply"
                className="inline-flex items-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
              >
                Apply now ↓
              </a>
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] transition active:scale-[0.985]"
              >
                Questions
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </Card>

          {/* ─── Community Builder ───────────────────────────────── */}
          <Card
            elevation="prominent"
            padding="lg"
            className="relative overflow-hidden"
          >
            <div
              className="absolute inset-0 -z-10 opacity-10 pointer-events-none"
              style={{ background: "var(--c-brand-gradient)" }}
              aria-hidden="true"
            />
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-brand flex items-center justify-center shadow-[var(--s-brand)] flex-shrink-0">
                <Users2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <Heading tier="title" as="h3">
                  Community Builder
                </Heading>
                <p className="text-sm text-[var(--c-text-muted)] mt-1">
                  Host a recurring local Zoom session and we'll cover
                  your operating costs each month.
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="rounded-[var(--r-md)] border border-[var(--c-border)] px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-[var(--c-text-muted)]">
                  Monthly stipend
                </span>
                <span className="bg-brand bg-clip-text text-transparent font-extrabold text-2xl tabular-nums">
                  $100
                </span>
              </div>
              <ul className="space-y-1.5 text-sm text-[var(--c-text-muted)] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--c-brand-cyan)] mt-0.5">
                    →
                  </span>
                  Lead at least one local Zoom session per week in your
                  language.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--c-brand-cyan)] mt-0.5">
                    →
                  </span>
                  Minimum <strong className="text-[var(--c-text)]">40
                  unique participants</strong> per month across sessions.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--c-brand-cyan)] mt-0.5">
                    →
                  </span>
                  We provide the deck, the support, and the official
                  channel amplification — you bring the language and
                  the room.
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
              >
                Apply via Telegram →
              </a>
              <a
                href="/careers"
                className="inline-flex items-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] transition active:scale-[0.985]"
              >
                Open roles
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
