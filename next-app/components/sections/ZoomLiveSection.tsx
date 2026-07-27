// ZoomLiveSection — surfaces the daily Zoom calls on the homepage
// with live countdown timers. Fully i18n via next-intl getTranslations.
import { Globe2, MessageCircle, ArrowRight, CalendarClock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { ZOOM_EN, ZOOM_HI, ZOOM_TH, ZOOM_TH_AM, ZOOM_AF, type ZoomSession } from "@shared/zoomEvents";
import { ZoomCountdown, OneTimeCountdown } from "./ZoomLiveCountdown";
import { LocalZoomTime } from "./LocalZoomTime";

export async function ZoomLiveSection() {
  const t = await getTranslations("zoom");

  return (
    <section className="py-12 md:py-20">
      <Container width="default">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <Heading tier="eyebrow" className="text-[var(--c-brand-cyan)] mb-3 inline-block">
            {t("eyebrow")}
          </Heading>
          <Heading tier="h1" as="h2" className="mb-3">
            {t("title")}{" "}
            <span className="text-brand-wide">{t("titleHighlight")}</span>
          </Heading>
          <p className="text-base md:text-lg text-[var(--c-text-muted)] leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
        {/* Special Event: Germany Community Zoom — one-time, Jul 30 2026 21:00 CEST (19:00 UTC) */}
        {/* Auto-hides after the event ends (2h duration) */}
        <div className="max-w-5xl mx-auto mb-4 md:mb-5">
          <OneTimeEventCard
            title="🇩🇪 TurboLoop Deutschland — Community-Zoom"
            description="Erster offizieller deutschsprachiger TurboLoop-Community-Zoom. Fragen willkommen — kein Druck, nur Informationen."
            timeLabel="🇩🇪 21:00 Uhr CEST · 🇬🇧 20:00 BST · 🇦🇪 23:00 GST · 🇺🇸 3:00 PM EDT"
            dateLabel="Donnerstag, 30. Juli 2026"
            link="https://us06web.zoom.us/j/89879779242?pwd=ebIpowaHOb7mhI0laFOEM07OK33sXP.1"
            // Jul 30 2026 19:00 UTC in milliseconds
            targetUtcMs={1753902000000}
            durationMin={120}
          />
        </div>
        {/* Row 1: English + Hindi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-5xl mx-auto mb-4 md:mb-5">
          <ZoomCard
            session={ZOOM_EN}
            accentLabel={t("labelEnglish")}
            dailyFree={t("dailyFree")}
            when={t("when")}
            nextCallIn={t("nextCallIn")}
            joinNow={t("joinNow")}
          />
          <ZoomCard
            session={ZOOM_HI}
            accentLabel={t("labelHindi")}
            dailyFree={t("dailyFree")}
            when={t("when")}
            nextCallIn={t("nextCallIn")}
            joinNow={t("joinNow")}
          />
        </div>
        {/* Row 2: Thai Morning + Thai Evening */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-5xl mx-auto mb-4 md:mb-5">
          <ZoomCard
            session={ZOOM_TH_AM}
            accentLabel={t("labelThaiMorning")}
            dailyFree={t("satOnly")}
            when={t("when")}
            nextCallIn={t("nextCallIn")}
            joinNow={t("joinNow")}
          />
          <ZoomCard
            session={ZOOM_TH}
            accentLabel={t("labelThaiEvening")}
            dailyFree={t("sunTueThu")}
            when={t("when")}
            nextCallIn={t("nextCallIn")}
            joinNow={t("joinNow")}
          />
        </div>
        {/* Row 3: African Community Call — Mon/Wed/Sat */}
        <div className="max-w-5xl mx-auto">
          <ZoomCard
            session={ZOOM_AF}
            accentLabel={t("labelAfrican")}
            dailyFree={t("monWedSat")}
            when={t("when")}
            nextCallIn={t("nextCallIn")}
            joinNow={t("joinNow")}
          />
        </div>
      </Container>
    </section>
  );
}

function OneTimeEventCard({
  title,
  description,
  timeLabel,
  dateLabel,
  link,
  targetUtcMs,
  durationMin,
}: {
  title: string;
  description: string;
  timeLabel: string;
  dateLabel: string;
  link: string;
  targetUtcMs: number;
  durationMin: number;
}) {
  return (
    <div className="flex flex-col rounded-[var(--r-xl)] border-2 border-[var(--c-brand-cyan)] bg-[var(--c-surface)] p-5 md:p-6 shadow-[var(--s-md)] hover:shadow-[var(--s-xl)] transition relative overflow-hidden">
      {/* Glow accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--c-brand-cyan)]/5 to-transparent pointer-events-none" />
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-[var(--c-brand-cyan)] shadow-[var(--s-sm)]">
          <CalendarClock className="w-3 h-3" />
          SPECIAL EVENT
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)]">
          One-Time · Free
        </span>
      </div>
      <Heading tier="title" as="h3" className="mb-1 text-xl leading-snug">
        {title}
      </Heading>
      <p className="text-sm text-[var(--c-text-muted)] leading-relaxed mb-4">
        {description}
      </p>
      <div className="mb-4 rounded-[var(--r-md)] bg-[var(--c-bg)] border border-[var(--c-border)] px-3 py-2">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] block mb-1">
          DATE
        </span>
        <span className="text-sm font-bold text-[var(--c-text)]">{dateLabel}</span>
      </div>
      <div className="mb-4 rounded-[var(--r-md)] bg-[var(--c-bg)] border border-[var(--c-border)] px-3 py-2 text-xs leading-relaxed">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] block mb-1">
          WHEN
        </span>
        <span className="whitespace-pre-line">{timeLabel}</span>
      </div>
      <div className="mb-5">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] block mb-1">
          STARTS IN
        </span>
        <OneTimeCountdown targetUtcMs={targetUtcMs} durationMin={durationMin} />
      </div>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] min-h-[48px] h-12 text-sm px-5 text-white bg-[var(--c-brand-cyan)] shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
      >
        <MessageCircle className="w-4 h-4" />
        Zum Zoom-Meeting beitreten
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}

function ZoomCard({
  session,
  accentLabel,
  dailyFree,
  when,
  nextCallIn,
  joinNow,
}: {
  session: ZoomSession;
  accentLabel: string;
  dailyFree: string;
  when: string;
  nextCallIn: string;
  joinNow: string;
}) {
  const multiTimezone = session.timeLabel.includes("·");
  return (
    <div className="flex flex-col rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] p-5 md:p-6 shadow-[var(--s-sm)] hover:shadow-[var(--s-md)] transition">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-brand shadow-[var(--s-sm)]">
          <Globe2 className="w-3 h-3" />
          {accentLabel}
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)]">
          {dailyFree}
        </span>
      </div>
      <Heading tier="title" as="h3" className="mb-1 text-xl leading-snug">
        {session.title}
      </Heading>
      <p className="text-sm text-[var(--c-text-muted)] leading-relaxed mb-4">
        {session.description}
      </p>
      <div className={`mb-4 rounded-[var(--r-md)] bg-[var(--c-bg)] border border-[var(--c-border)] px-3 py-2 ${multiTimezone ? "text-xs leading-relaxed" : "text-sm"} text-[var(--c-text)]`}>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] block mb-1">
          {when}
        </span>
        <span className={multiTimezone ? "whitespace-pre-line" : "font-mono"}>{session.timeLabel}</span>
      </div>
      <div className="mb-3">
        <LocalZoomTime startUtcMin={session.startUtcMin} />
      </div>
      <div className="mb-5">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] block mb-1">
          {nextCallIn}
        </span>
        <ZoomCountdown startUtcMin={session.startUtcMin} durationMin={session.durationMin} daysOfWeek={session.daysOfWeek} />
      </div>
      <a
        href={session.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] min-h-[48px] h-12 text-sm px-5 text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
      >
        <MessageCircle className="w-4 h-4" />
        {session.platform === "meet" ? "Join Google Meet" : joinNow}
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}
