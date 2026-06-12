// /events — global meetups hub + Local Presenter sponsorship program.
//
// Server component, all-static. Renders inside a forced `dark` wrapper
// so the entire route ships in the premium cinematic dark palette
// regardless of the visitor's theme preference. The dark class flips
// every CSS-variable consumer below (Card surfaces, borders, text
// tokens) so all child components inherit the dark look without
// per-component overrides.
//
// Sections, in order:
//   1. PageHero
//   2. Wall of Proof — masonry photo gallery for instant social proof
//   3. Past events — featured card per event + a media gallery
//      (videos block + photos block, every item share/downloadable)
//   4. Upcoming events (banner + invite video on PH, teasers on others)
//   5. Sponsorship tiers (the 50/50 funding model, 4 cards)
//   6. Career path (City Ambassador → Regional Director → Global Presenter)
//   7. Meetup Kit (4-item tier-gated grid)
//   8. Application form (writes to DB + pings support TG)
//   9. Terms & Conditions (collapsible)

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowDown,
  Users,
  Calendar,
  MapPin,
  Award,
  Mail,
} from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { WallOfProof } from "@components/events/WallOfProof";
import { EventApplicationForm } from "@components/events/EventApplicationForm";
import { MediaGalleryCard } from "@components/events/MediaGalleryCard";
import {
  PAST_EVENTS,
  UPCOMING_EVENTS,
  SPONSORSHIP_TIERS,
  COMMUNITY_ROLES,
  MEETUP_KIT,
} from "@lib/eventsData";

const EVENTS_OG_TITLE = "Global Meetups & Events — TurboLoop";
const EVENTS_OG_DESC =
  "Join physical TurboLoop meetups in 14+ countries, or get funded to host your own.";
const EVENTS_OG_IMAGE =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-events.png";

// Official support Telegram handle. NOT the public announcement channel —
// keep these distinct so the support team isn't drowned in noise.
const SUPPORT_TELEGRAM = "https://t.me/TurboLoop_Support";

export const metadata: Metadata = {
  title: "Global Meetups & Events — TurboLoop",
  description:
    "Join physical TurboLoop meetups in 14+ countries, or get funded to host your own. The Local Presenter Program pays you to grow the ecosystem.",
  alternates: { canonical: "https://www.turboloop.tech/events" },
  openGraph: {
    type: "website",
    title: EVENTS_OG_TITLE,
    description: EVENTS_OG_DESC,
    url: "https://www.turboloop.tech/events",
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

export default function EventsPage() {
  // Top-of-page stats strip — computed from PAST_EVENTS so it always
  // matches what's rendered below.
  const totalEvents = PAST_EVENTS.length;
  const totalAttendees = PAST_EVENTS.reduce((sum, e) => sum + e.attendees, 0);
  const countriesSet = new Set(
    PAST_EVENTS.map(e => e.location.split(",").pop()?.trim())
  );

  return (
    // Forced dark theme on this route only. The `dark` class flips every
    // `var(--c-*)` consumer below to its dark values defined in globals.css,
    // so Cards, surfaces, borders, and text all read cinematic without
    // per-component dark: variants. bg/text tokens explicitly set so the
    // page itself paints dark even when nested inside a light-mode site
    // shell.
    <main
      className="dark relative pb-12 md:pb-20 bg-[var(--c-bg)] text-[var(--c-text)]"
    >
      <PageHero
        eyebrow="Global Events"
        title="Real meetups. Real people. Real funding."
        subtitle="Join physical TurboLoop meetups in 14+ countries, or get funded to host your own. We pay you to grow the ecosystem."
      />

      <Container width="default">
        {/* ─── Section 2 · Wall of Proof ─────────────────────────────── */}
        <section className="mb-14 md:mb-20" aria-labelledby="wall-heading">
          <div className="text-center max-w-2xl mx-auto mb-6 md:mb-8">
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-3 inline-block"
            >
              The Wall of Proof
            </Heading>
            <Heading tier="h2" as="h2" className="mb-2">
              <span id="wall-heading">Real rooms. Real people.</span>
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed">
              A snapshot of meetups already shipped — from Lagos to Mumbai
              to Dubai.
            </p>
          </div>
          <WallOfProof />
        </section>

        {/* ─── Section 3 · Past Events ─────────────────────────────── */}
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

          {/* Adaptive grid: 1 event → centered featured card, 2 → side
              by side, 3+ → 3-up. Keeps a single-event view (the Lagos
              soft launch right now) from looking sparse. */}
          <div
            className={
              PAST_EVENTS.length === 1
                ? "max-w-3xl mx-auto"
                : PAST_EVENTS.length === 2
                  ? "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
                  : "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5"
            }
          >
            {PAST_EVENTS.map(ev => (
              <PastEventCard key={ev.id} ev={ev} />
            ))}
          </div>

          {/* Media galleries — one per past event that has photos/videos
              attached. For the Lagos soft-launch this renders a video
              gallery (main + 5 clips, all share/downloadable) followed
              by a photo gallery (6 captioned shots). */}
          {PAST_EVENTS.map(ev => {
            const hasVideos = ev.videos && ev.videos.length > 0;
            const hasPhotos = ev.photos && ev.photos.length > 0;
            if (!hasVideos && !hasPhotos) return null;
            // Premium share-text suffix shared by every gallery item.
            const ctx = `${ev.title ?? ev.location} · ${ev.date}`;
            return (
              <div key={`gallery-${ev.id}`} className="mt-10 md:mt-14">
                {hasVideos && (
                  <div className="mb-10 md:mb-14">
                    <div className="flex items-baseline justify-between mb-4 md:mb-5 gap-3 flex-wrap">
                      <Heading tier="title" as="h3" className="text-lg">
                        Videos from the floor
                      </Heading>
                      <span className="text-xs text-[var(--c-text-subtle)] tabular-nums">
                        {ev.videos!.length} clips · tap to play
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                      {ev.videos!.map((v, idx) => (
                        <MediaGalleryCard
                          key={`v-${ev.id}-${idx}`}
                          item={{ type: "video", ...v }}
                          shareContext={ctx}
                          hashtags="#TurboLoop #SoftLaunch #Lagos #DeFi"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {hasPhotos && (
                  <div>
                    <div className="flex items-baseline justify-between mb-4 md:mb-5 gap-3 flex-wrap">
                      <Heading tier="title" as="h3" className="text-lg">
                        Photo gallery
                      </Heading>
                      <span className="text-xs text-[var(--c-text-subtle)] tabular-nums">
                        {ev.photos!.length} photos · share or save
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                      {ev.photos!.map((p, idx) => (
                        <MediaGalleryCard
                          key={`p-${ev.id}-${idx}`}
                          item={{ type: "photo", ...p }}
                          shareContext={ctx}
                          hashtags="#TurboLoop #SoftLaunch #Lagos #DeFi"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* ─── Section 4 · Upcoming Events ─────────────────────────── */}
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
                <UpcomingEventCard key={ev.id} ev={ev} />
              ))}
            </div>
          )}
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
              to chase. Higher tiers unlock the physical goods.
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

        {/* ─── Section 8 · Application Form ────────────────────────── */}
        <section id="apply" className="mb-10 md:mb-14 scroll-mt-24">
          <EventApplicationForm />
        </section>

        {/* ─── Section 9 · Terms & support handle ──────────────────── */}
        <section className="mb-8">
          <details className="rounded-[var(--r-md)] border border-[var(--c-border)] bg-[var(--c-surface)] p-5 text-sm group max-w-3xl mx-auto">
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
                Organizers must clearly state TurboLoop is a protocol, not
                investment advice.
              </li>
              <li>
                <strong className="text-[var(--c-text)]">
                  Brand integrity.
                </strong>{" "}
                Only use approved marketing assets. No unauthorized
                promises. TurboLoop branding must be clearly visible in
                all photos and videos.
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
                TurboLoop reserves the right to decline any application at
                its sole discretion.
              </li>
            </ul>
            <p className="mt-4 pt-4 border-t border-[var(--c-border)] text-xs text-[var(--c-text-muted)]">
              Questions about an existing application? Reach the official
              support team on Telegram at{" "}
              <a
                href={SUPPORT_TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[var(--c-brand-cyan)] hover:underline inline-flex items-center gap-1"
              >
                <Mail className="w-3 h-3" />
                @TurboLoop_Support
              </a>
              .
            </p>
          </details>
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

/* ── Upcoming event card — banner image header + optional invite video
      + meta + register CTA. The video tag is inline (no modal) with
      preload="none" so bandwidth is zero until the user hits play. ── */

function UpcomingEventCard({
  ev,
}: {
  ev: (typeof UPCOMING_EVENTS)[number];
}) {
  return (
    <Card
      elevation="raised"
      padding="none"
      interactive
      className="h-full overflow-hidden flex flex-col"
    >
      {/* Hero image (banner). Falls back to the brand-gradient
          backstop when no imageUrl is set (Berlin/Dubai teasers). */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: "16 / 9",
          background:
            "linear-gradient(135deg, #0891B2 0%, #1E40AF 50%, #1E1B4B 100%)",
        }}
      >
        {ev.imageUrl && (
          <Image
            src={ev.imageUrl}
            alt={`${ev.title} banner`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            loading="lazy"
            unoptimized
          />
        )}
        <span
          className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold tracking-[0.14em] uppercase"
          style={{
            color: "var(--c-brand-cyan)",
            background: "rgba(15,23,42,0.6)",
            border: "1px solid rgba(34,211,238,0.4)",
            backdropFilter: "blur(4px)",
          }}
        >
          👥 {ev.coAttendCount} attending
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold text-[var(--c-text)] leading-tight mb-1">
          {ev.title}
        </h3>
        <div className="text-xs text-[var(--c-text-muted)] mb-3 leading-relaxed">
          <span className="mr-1.5" aria-hidden="true">
            {ev.flag}
          </span>
          {ev.location}
        </div>
        <div className="text-sm font-semibold text-[var(--c-text)] mb-3 tabular-nums">
          {ev.date}
        </div>
        <div className="text-sm text-[var(--c-text-muted)] mb-4">
          Hosted by{" "}
          <span className="text-[var(--c-text)] font-bold">
            {ev.hostName}
          </span>
        </div>

        {/* Invite video — inline, lazy-loaded. Native controls so we
            don't ship a player runtime. Only renders when this event
            has one (the Lagos PH event does; Berlin / Dubai don't). */}
        {ev.videoUrl && (
          <div className="mb-4">
            <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
              Invitation video
            </div>
            <video
              src={ev.videoUrl}
              poster={ev.imageUrl}
              controls
              preload="none"
              playsInline
              className="w-full rounded-[var(--r-md)] bg-black"
            />
          </div>
        )}

        {ev.registrationUrl && (
          <a
            href={ev.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985] mt-auto self-start"
          >
            Register →
          </a>
        )}
      </div>
    </Card>
  );
}

/* ── Past event card — photo header + stats + verified glow ───────── */

function PastEventCard({
  ev,
}: {
  ev: (typeof PAST_EVENTS)[number];
}) {
  return (
    <Card
      elevation="raised"
      padding="none"
      interactive
      className="h-full overflow-hidden flex flex-col"
    >
      {/* Hero header — playable <video> when ev.videoUrl is set
          (Lagos), otherwise the image (or gradient fallback). The
          video uses imageUrl as its poster frame so the first paint is
          a real photo, not a black box. */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: "16 / 10",
          background:
            "linear-gradient(135deg, #0891B2 0%, #1E40AF 50%, #1E1B4B 100%)",
        }}
      >
        {ev.videoUrl ? (
          // controls + preload="none" keeps the bandwidth cost zero
          // until the user actually taps play. poster gives the
          // gallery look-and-feel without paying for the MP4.
          <video
            src={ev.videoUrl}
            poster={ev.imageUrl}
            controls
            preload="none"
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : ev.imageUrl ? (
          <Image
            src={ev.imageUrl}
            alt={`${ev.location} meetup`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            loading="lazy"
            unoptimized
          />
        ) : null}
        {/* Verified glow chip sits on the hero */}
        {ev.verified && (
          <span
            className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold tracking-[0.14em] uppercase"
            style={{
              color: "#A7F3D0",
              background: "rgba(6,78,59,0.7)",
              border: "1px solid rgba(16,185,129,0.45)",
              boxShadow: "0 0 12px rgba(16,185,129,0.35)",
              backdropFilter: "blur(4px)",
            }}
          >
            <CheckCircle2 className="w-3 h-3" strokeWidth={3} />
            Verified
          </span>
        )}
        {/* Bottom fade for legibility on the flag/location strip.
            When the hero is a video, the native controls render along
            this bottom area — we keep the gradient subtle so it
            doesn't fight the controls. */}
        {!ev.videoUrl && (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"
            />
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-white">
              <div>
                <div className="text-2xl leading-none mb-1" aria-hidden="true">
                  {ev.flag}
                </div>
                <h3 className="text-base font-bold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                  {ev.location}
                </h3>
              </div>
              <div className="text-xs text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
                {ev.date}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-5">
        {/* When the hero is a video the title/location/date overlay
            isn't rendered on the image, so surface those here. */}
        {ev.videoUrl && (
          <div className="mb-3">
            {ev.title && (
              <h3 className="text-base font-bold text-[var(--c-text)] leading-tight mb-1">
                {ev.title}
              </h3>
            )}
            <div className="text-xs text-[var(--c-text-muted)]">
              <span className="mr-1.5" aria-hidden="true">
                {ev.flag}
              </span>
              {ev.location} · {ev.date}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
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
      </div>
    </Card>
  );
}
