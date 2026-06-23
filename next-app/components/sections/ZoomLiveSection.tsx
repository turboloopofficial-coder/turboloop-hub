// ZoomLiveSection — surfaces the two daily Zoom calls on the homepage
// with live countdown timers.
//
// RSC shell + a small `'use client'` countdown island per card. Pulling
// the countdown into its own client component keeps the rest of the
// section static (zero JS for cards, copy, join buttons).

import Link from "next/link";
import { Globe2, MessageCircle, ArrowRight } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { ZOOM_EN, ZOOM_HI, type ZoomSession } from "@shared/zoomEvents";
import { ZoomCountdown } from "./ZoomLiveCountdown";
import { LocalZoomTime } from "./LocalZoomTime";

export function ZoomLiveSection() {
  return (
    <section className="py-12 md:py-20">
      <Container width="default">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-brand-cyan)] mb-3 inline-block"
          >
            Live Right Now
          </Heading>
          <Heading tier="h1" as="h2" className="mb-3">
            The community is{" "}
            <span className="text-brand-wide">live right now.</span>
          </Heading>
          <p className="text-base md:text-lg text-[var(--c-text-muted)] leading-relaxed">
            Real people, real answers. Every day.
          </p>
        </div>

        {/* Two cards — stacked on mobile, side-by-side from md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-4xl mx-auto">
          <ZoomCard session={ZOOM_EN} accentLabel="English" />
          <ZoomCard session={ZOOM_HI} accentLabel="Hindi / Urdu" />
        </div>
      </Container>
    </section>
  );
}

function ZoomCard({
  session,
  accentLabel,
}: {
  session: ZoomSession;
  accentLabel: string;
}) {
  const multiTimezone = session.timeLabel.includes("·");
  return (
    <div className="flex flex-col rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] p-5 md:p-6 shadow-[var(--s-sm)] hover:shadow-[var(--s-md)] transition">
      {/* Eyebrow row — language pill + small "Daily" tag */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-brand shadow-[var(--s-sm)]">
          <Globe2 className="w-3 h-3" />
          {accentLabel}
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)]">
          Daily · Free
        </span>
      </div>

      {/* Headline */}
      <Heading tier="title" as="h3" className="mb-1 text-xl leading-snug">
        {session.title}
      </Heading>

      {/* Description */}
      <p className="text-sm text-[var(--c-text-muted)] leading-relaxed mb-4">
        {session.description}
      </p>

      {/* Time label — uses a tighter font for the long multi-timezone HI
          variant so the 5-flag row doesn't blow out the card on mobile. */}
      <div
        className={`mb-4 rounded-[var(--r-md)] bg-[var(--c-bg)] border border-[var(--c-border)] px-3 py-2 ${
          multiTimezone ? "text-xs leading-relaxed" : "text-sm"
        } text-[var(--c-text)]`}
      >
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] block mb-1">
          When
        </span>
        <span className={multiTimezone ? "" : "font-mono"}>
          {session.timeLabel}
        </span>
      </div>

      {/* Local time pill — client-only, renders after hydration */}
      <div className="mb-3">
        <LocalZoomTime startUtcMin={session.startUtcMin} />
      </div>

      {/* Countdown */}
      <div className="mb-5">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] block mb-1">
          Next call in
        </span>
        <ZoomCountdown
          startUtcMin={session.startUtcMin}
          durationMin={session.durationMin}
        />
      </div>

      {/* CTA */}
      <a
        href={session.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] min-h-[48px] h-12 text-sm px-5 text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
      >
        <MessageCircle className="w-4 h-4" />
        Join now
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}
