// /events — global meetups hub + Local Presenter sponsorship program.
//
// Server component, all-static. Eight sections:
//   1. PageHero with banner messaging
//   2. Past events grid (with stats strip + verified glow)
//   3. Upcoming events (empty state → routes the eye down to "Get Funded")
//   4. Organizer leaderboard (top 3 with medal styling)
//   5. Sponsorship tiers (the 50/50 funding model, 4 cards)
//   6. Community roles (City Ambassador → Regional Director → Global Presenter)
//   7. Meetup Kit (4-item grid of what every organizer receives)
//   8. Apply CTA + pre-filled Telegram message + collapsible Terms

import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Trophy,
  Send,
  ArrowDown,
  Users,
  Calendar,
  MapPin,
  Award,
} from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import {
  PAST_EVENTS,
  UPCOMING_EVENTS,
  ORGANIZER_LEADERBOARD,
  SPONSORSHIP_TIERS,
  COMMUNITY_ROLES,
  MEETUP_KIT,
} from "@lib/eventsData";

const EVENTS_OG_TITLE = "Global Meetups & Events — TurboLoop";
const EVENTS_OG_DESC =
  "Join physical TurboLoop meetups in 14+ countries, or get funded to host your own.";
const EVENTS_OG_IMAGE =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-events.png";

export const metadata: Metadata = {
  title: "Global Meetups & Events — TurboLoop",
  description:
    "Join physical TurboLoop meetups in 14+ countries, or get funded to host your own. The Local Presenter Program pays you to grow the ecosystem.",
  alternates: { canonical: "https://turboloop.tech/events" },
  openGraph: {
    title: EVENTS_OG_TITLE,
    description: EVENTS_OG_DESC,
    url: "https://turboloop.tech/events",
    images: [
      { url: EVENTS_OG_IMAGE, width: 1200, height: 630, alt: EVENTS_OG_TITLE },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: EVENTS_OG_TITLE,
    description: EVENTS_OG_DESC,
    images: [EVENTS_OG_IMAGE],
  },
};

const MEDAL: Record<number, { ring: string; bg: string; emoji: string }> = {
  0: { ring: "#F59E0B", bg: "#F59E0B20", emoji: "🥇" },
  1: { ring: "#94A3B8", bg: "#94A3B820", emoji: "🥈" },
  2: { ring: "#D97706", bg: "#D9770620", emoji: "🥉" },
};

const TELEGRAM_URL = "https://t.me/TurboLoop_Official";
const APPLY_TEMPLATE = `📅 TurboLoop Event Proposal
- Organizer Wallet Address:
- Current Team Size:
- Proposed Tier: [Local / City / Regional / National]
- City & Country:
- Expected Attendees:
- Requested Date:`;

export default function EventsPage() {
  // Top-of-page stats strip — computed from PAST_EVENTS so it always
  // matches what's rendered below.
  const totalEvents = PAST_EVENTS.length;
  const totalAttendees = PAST_EVENTS.reduce((sum, e) => sum + e.attendees, 0);
  const countriesSet = new Set(
    PAST_EVENTS.map(e => e.location.split(",").pop()?.trim())
  );

  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="Global Events"
        title="Real meetups. Real people. Real funding."
        subtitle="Join physical TurboLoop meetups in 14+ countries, or get funded to host your own. We pay you to grow the ecosystem."
      />

      <Container width="default">
        {/* ─── Section 2 · Past Events ─────────────────────────────── */}
        <section className="mb-14 md:mb-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 md:mb-8">
            <Heading tier="h2" as="h2">
              What we&rsquo;ve already done.
            </Heading>
            <div className="inline-flex flex-wrap items-center gap-3 md:gap-5 text-sm font-bold text-[var(--c-text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[var(--c-brand-cyan)]" />
                <span className="text-[var(--c-text)] tabular-nums">
                  {totalEvents}
                </span>{" "}
                events
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[var(--c-brand-cyan)]" />
                <span className="text-[var(--c-text)] tabular-nums">
                  {totalAttendees}+
                </span>{" "}
                attendees
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[var(--c-brand-cyan)]" />
                <span className="text-[var(--c-text)] tabular-nums">
                  {countriesSet.size}
                </span>{" "}
                countries
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {PAST_EVENTS.map(ev => (
              <Card
                key={ev.id}
                elevation="raised"
                padding="lg"
                interactive
                className="h-full"
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div>
                    <div className="text-2xl mb-1" aria-hidden="true">
                      {ev.flag}
                    </div>
                    <h3 className="text-base font-bold text-[var(--c-text)] leading-tight">
                      {ev.location}
                    </h3>
                    <div className="text-xs text-[var(--c-text-muted)] mt-0.5">
                      {ev.date}
                    </div>
                  </div>
                  {ev.verified && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold tracking-[0.14em] uppercase"
                      style={{
                        color: "#059669",
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.35)",
                        boxShadow: "0 0 12px rgba(16,185,129,0.25)",
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3" strokeWidth={3} />
                      Verified
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2 mb-3">
                  <Users className="w-3.5 h-3.5 text-[var(--c-brand-cyan)]" />
                  <span className="text-sm font-bold text-[var(--c-text)] tabular-nums">
                    {ev.attendees}
                  </span>
                  <span className="text-sm text-[var(--c-text-muted)]">
                    attendees
                  </span>
                </div>

                <ul className="space-y-1.5">
                  {ev.achievements.map(a => (
                    <li
                      key={a}
                      className="text-sm text-[var(--c-text-muted)] leading-snug flex items-start gap-2"
                    >
                      <span
                        className="text-[var(--c-brand-cyan)] mt-0.5"
                        aria-hidden="true"
                      >
                        →
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── Section 3 · Upcoming Events ─────────────────────────── */}
        <section className="mb-14 md:mb-20">
          <Heading tier="h2" as="h2" className="mb-6 md:mb-8">
            Upcoming meetups.
          </Heading>

          {UPCOMING_EVENTS.length === 0 ? (
            <Card
              elevation="raised"
              padding="lg"
              className="text-center max-w-2xl mx-auto"
            >
              <div className="text-3xl mb-3" aria-hidden="true">
                🗓️
              </div>
              <Heading tier="title" as="h3" className="mb-2">
                No events scheduled this week.
              </Heading>
              <p className="text-[var(--c-text-muted)] leading-relaxed mb-5">
                Be the first to organize one in your city. We fund 50 % up
                front to cover venue + logistics.
              </p>
              <a
                href="#get-funded"
                className="inline-flex items-center gap-2 text-sm font-bold text-[var(--c-brand-cyan)] hover:underline"
              >
                See sponsorship tiers
                <ArrowDown className="w-4 h-4" />
              </a>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {UPCOMING_EVENTS.map(ev => (
                <Card
                  key={ev.id}
                  elevation="raised"
                  padding="lg"
                  interactive
                  className="h-full"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-base font-bold text-[var(--c-text)] leading-tight">
                        {ev.title}
                      </h3>
                      <div className="text-xs text-[var(--c-text-muted)] mt-1">
                        <span className="mr-1.5" aria-hidden="true">
                          {ev.flag}
                        </span>
                        {ev.location} · {ev.date}
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold tracking-[0.14em] uppercase"
                      style={{
                        color: "var(--c-brand-cyan)",
                        background:
                          "color-mix(in oklab, var(--c-brand-cyan) 10%, transparent)",
                      }}
                    >
                      👥 {ev.coAttendCount} attending
                    </span>
                  </div>
                  <div className="text-sm text-[var(--c-text-muted)] mb-4">
                    Hosted by{" "}
                    <span className="text-[var(--c-text)] font-bold">
                      {ev.hostName}
                    </span>
                  </div>
                  {ev.registrationUrl && (
                    <a
                      href={ev.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
                    >
                      Register →
                    </a>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ─── Section 4 · Organizer Leaderboard ───────────────────── */}
        <section className="mb-14 md:mb-20">
          <div className="flex items-end justify-between mb-6 md:mb-8 gap-4 flex-col md:flex-row">
            <div>
              <Heading tier="h2" as="h2">
                Top organizers, this season.
              </Heading>
              <p className="text-[var(--c-text-muted)] mt-2 max-w-xl">
                The leaders who actually show up. Ranked by verified events
                hosted.
              </p>
            </div>
          </div>

          <Card elevation="raised" padding="none" className="overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] border-b border-[var(--c-border)] bg-[var(--c-bg)]">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Name</div>
              <div className="col-span-2 tabular-nums">Events</div>
              <div className="col-span-2 tabular-nums">Team</div>
              <div className="col-span-3">Role</div>
            </div>
            {ORGANIZER_LEADERBOARD.map((o, i) => {
              const medal = MEDAL[i];
              return (
                <div
                  key={o.name}
                  className="grid grid-cols-12 gap-3 px-5 py-4 items-center border-b border-[var(--c-border)] last:border-b-0"
                >
                  <div className="col-span-2 md:col-span-1">
                    <span
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold tabular-nums"
                      style={
                        medal
                          ? {
                              background: medal.bg,
                              color: medal.ring,
                              border: `2px solid ${medal.ring}`,
                            }
                          : {
                              background: "var(--c-bg)",
                              color: "var(--c-text-subtle)",
                              border: "2px solid var(--c-border)",
                            }
                      }
                    >
                      {medal ? medal.emoji : i + 1}
                    </span>
                  </div>
                  <div className="col-span-10 md:col-span-4 min-w-0">
                    <div className="text-sm font-bold text-[var(--c-text)] truncate flex items-center gap-2">
                      <span aria-hidden="true">{o.country}</span>
                      {o.name}
                    </div>
                    <div className="md:hidden text-xs text-[var(--c-text-muted)] mt-0.5 tabular-nums">
                      {o.eventsHosted} events · team {o.teamSize}
                    </div>
                  </div>
                  <div className="hidden md:block col-span-2 text-sm text-[var(--c-text)] font-semibold tabular-nums">
                    {o.eventsHosted}
                  </div>
                  <div className="hidden md:block col-span-2 text-sm text-[var(--c-text)] font-semibold tabular-nums">
                    {o.teamSize}
                  </div>
                  <div className="col-span-12 md:col-span-3 mt-1 md:mt-0">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold tracking-[0.14em] uppercase"
                      style={{
                        color: "var(--c-brand-cyan)",
                        background:
                          "color-mix(in oklab, var(--c-brand-cyan) 10%, transparent)",
                      }}
                    >
                      <Trophy className="w-3 h-3" />
                      {o.role}
                    </span>
                  </div>
                </div>
              );
            })}
          </Card>
        </section>

        {/* ─── Section 5 · Sponsorship Tiers ───────────────────────── */}
        <section id="get-funded" className="mb-14 md:mb-20 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-3 inline-block"
            >
              Local Presenter Program
            </Heading>
            <Heading tier="h2" as="h2" className="mb-4">
              Get funded to host.
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed">
              All event funding is split into two equal halves.{" "}
              <strong className="text-[var(--c-text)]">
                You receive 50 % as an advance
              </strong>{" "}
              to book your venue and logistics.{" "}
              <strong className="text-[var(--c-text)]">
                The remaining 50 % is paid after
              </strong>{" "}
              you submit proof of a successful event.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {SPONSORSHIP_TIERS.map(tier => (
              <div
                key={tier.id}
                className="relative rounded-[var(--r-xl)] p-5 md:p-6 bg-[var(--c-surface)] shadow-[var(--s-md)] hover:shadow-[var(--s-xl)] hover:-translate-y-1 transition-[transform,box-shadow] duration-[var(--m-smooth)] ease-[var(--m-standard)] h-full flex flex-col"
                style={{
                  // Gradient border via the double background-clip technique.
                  border: "1.5px solid transparent",
                  backgroundImage:
                    "linear-gradient(var(--c-surface), var(--c-surface)), var(--c-brand-gradient)",
                  backgroundOrigin: "border-box",
                  backgroundClip: "padding-box, border-box",
                }}
              >
                <div className="text-3xl mb-2" aria-hidden="true">
                  {tier.icon}
                </div>
                <Heading tier="title" as="h3" className="mb-1">
                  {tier.name}
                </Heading>
                <div className="text-xs text-[var(--c-text-subtle)] mb-4 tabular-nums">
                  {tier.pax} pax
                </div>

                <div className="mb-4">
                  <div className="bg-brand bg-clip-text text-transparent text-3xl font-extrabold tracking-tight leading-none tabular-nums">
                    ${tier.total.toLocaleString()}
                  </div>
                  <div className="text-[0.6875rem] font-bold tracking-[0.16em] uppercase text-[var(--c-text-subtle)] mt-1">
                    USDT · total
                  </div>
                </div>

                <div className="space-y-1.5 text-sm mb-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[var(--c-text-muted)]">Advance</span>
                    <span className="font-bold text-[var(--c-text)] tabular-nums">
                      ${tier.advance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[var(--c-text-muted)]">
                      Performance
                    </span>
                    <span className="font-bold text-[var(--c-text)] tabular-nums">
                      ${tier.performance.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[var(--c-text-muted)] leading-relaxed mb-4 pt-4 border-t border-[var(--c-border)]">
                  <div className="text-[0.6875rem] font-bold tracking-[0.16em] uppercase text-[var(--c-text-subtle)] mb-1">
                    Organizer Requirements
                  </div>
                  Deposit ≥ {tier.depositReq} · team {tier.teamReq}
                </div>

                <div className="text-xs text-[var(--c-text-muted)] leading-relaxed mt-auto">
                  <div className="text-[0.6875rem] font-bold tracking-[0.16em] uppercase text-[var(--c-text-subtle)] mb-1">
                    Required Deliverables
                  </div>
                  {tier.deliverables}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Section 6 · Career Path ─────────────────────────────── */}
        <section className="mb-14 md:mb-20">
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-3 inline-block"
            >
              Career Path
            </Heading>
            <Heading tier="h2" as="h2" className="mb-3">
              Unlock official roles.
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed">
              Every event you host stacks toward a permanent monthly
              stipend. Hit the bars below and the title is yours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {COMMUNITY_ROLES.map((role, idx) => (
              <Card
                key={role.title}
                elevation="raised"
                padding="lg"
                interactive
                className="h-full"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white text-sm font-bold tabular-nums shadow-[var(--s-brand)]"
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </span>
                  <Heading tier="title" as="h3">
                    {role.title}
                  </Heading>
                </div>

                <div className="mb-4">
                  <div className="bg-brand bg-clip-text text-transparent text-2xl font-extrabold tracking-tight leading-none">
                    {role.stipend}
                  </div>
                  <div className="text-[0.6875rem] font-bold tracking-[0.16em] uppercase text-[var(--c-text-subtle)] mt-1">
                    Monthly stipend
                  </div>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {role.requirements.map(r => (
                    <li
                      key={r}
                      className="text-sm text-[var(--c-text-muted)] leading-snug flex items-start gap-2"
                    >
                      <Award
                        className="w-3.5 h-3.5 text-[var(--c-brand-cyan)] mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      {r}
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-[var(--c-border)] text-xs text-[var(--c-text-muted)] leading-relaxed">
                  <div className="text-[0.6875rem] font-bold tracking-[0.16em] uppercase text-[var(--c-text-subtle)] mb-1">
                    Responsibilities
                  </div>
                  {role.responsibilities}
                </div>
              </Card>
            ))}
          </div>

          <p className="text-xs text-[var(--c-text-subtle)] mt-5 leading-relaxed max-w-2xl mx-auto text-center italic">
            Stipends are paid only if the leader&rsquo;s team maintains
            positive net deposit growth month-over-month.
          </p>
        </section>

        {/* ─── Section 7 · Meetup Kit ──────────────────────────────── */}
        <section className="mb-14 md:mb-20">
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-3 inline-block"
            >
              You don&rsquo;t start from zero
            </Heading>
            <Heading tier="h2" as="h2" className="mb-3">
              The Meetup Kit.
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed">
              Every approved organizer ships day-one with the same toolkit
              we use ourselves. No design work, no decks to write, no PR
              to chase.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {MEETUP_KIT.map(item => (
              <Card
                key={item.title}
                elevation="raised"
                padding="lg"
                className="h-full"
              >
                <div className="text-3xl mb-3" aria-hidden="true">
                  {item.icon}
                </div>
                <Heading tier="title" as="h3" className="text-base mb-1.5">
                  {item.title}
                </Heading>
                <p className="text-sm text-[var(--c-text-muted)] leading-snug">
                  {item.detail}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── Section 8 · Apply CTA + Terms ───────────────────────── */}
        <section className="mb-8">
          <Card
            elevation="prominent"
            padding="lg"
            className="text-center md:text-left md:flex md:items-center md:justify-between md:gap-8 relative overflow-hidden"
          >
            <div
              className="absolute inset-0 -z-10 opacity-10 pointer-events-none"
              style={{ background: "var(--c-brand-gradient)" }}
              aria-hidden="true"
            />
            <div className="md:flex-1">
              <Heading tier="h2" className="mb-2">
                Ready to host?
              </Heading>
              <p className="text-[var(--c-text-muted)] leading-relaxed max-w-xl">
                Send the proposal template to our official Telegram. Our
                operations team reviews within 48 hours.
              </p>
            </div>
            <div className="mt-5 md:mt-0 flex-shrink-0">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 h-12 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
              >
                <Send className="w-4 h-4" />
                Apply via Telegram →
              </a>
            </div>
          </Card>

          <div className="mt-6 grid gap-4 md:grid-cols-5 items-start">
            <div className="md:col-span-3">
              <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
                Pre-filled message template
              </div>
              <pre
                className="text-xs text-[var(--c-text)] leading-relaxed whitespace-pre-wrap rounded-[var(--r-md)] bg-[var(--c-surface)] border border-[var(--c-border)] p-4 font-mono"
                style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
              >
                {APPLY_TEMPLATE}
              </pre>
            </div>

            <details className="md:col-span-2 rounded-[var(--r-md)] border border-[var(--c-border)] bg-[var(--c-surface)] p-4 text-sm group">
              <summary className="cursor-pointer font-bold text-[var(--c-text)] list-none flex items-center justify-between">
                <span>Terms & Conditions</span>
                <span
                  className="text-[var(--c-text-subtle)] transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  ⌄
                </span>
              </summary>
              <ul className="mt-3 space-y-2 text-[var(--c-text-muted)] leading-relaxed">
                <li>
                  <strong className="text-[var(--c-text)]">
                    No financial advice.
                  </strong>{" "}
                  Organizers must clearly state TurboLoop is a protocol,
                  not investment advice.
                </li>
                <li>
                  <strong className="text-[var(--c-text)]">
                    Brand integrity.
                  </strong>{" "}
                  Only use approved marketing assets. No unauthorized
                  promises.
                </li>
                <li>
                  <strong className="text-[var(--c-text)]">
                    Cooling period.
                  </strong>{" "}
                  30 days between Tier 1–2 events; 60 days between Tier 3–4.
                </li>
                <li>
                  <strong className="text-[var(--c-text)]">
                    Zero tolerance for fraud.
                  </strong>{" "}
                  Falsified deliverables forfeit all future funding +
                  trigger clawback of advances.
                </li>
                <li>
                  <strong className="text-[var(--c-text)]">
                    Right of refusal.
                  </strong>{" "}
                  TurboLoop reserves the right to decline any application
                  at its sole discretion.
                </li>
              </ul>
            </details>
          </div>
        </section>

        {/* Cross-link back to /apply for individual Creator/Presenter programs */}
        <p className="text-center text-sm text-[var(--c-text-muted)]">
          Looking for the per-video Creator Star payout instead?{" "}
          <Link
            href="/apply"
            className="font-bold text-[var(--c-brand-cyan)] hover:underline"
          >
            Apply on /apply →
          </Link>
        </p>
      </Container>
    </main>
  );
}
