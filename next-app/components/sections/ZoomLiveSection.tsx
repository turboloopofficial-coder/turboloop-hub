// ZoomLiveSection — surfaces the daily Zoom calls on the homepage
// with live countdown timers. Fully i18n via next-intl getTranslations.
import { Globe2, MessageCircle, ArrowRight, CalendarClock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { ZOOM_EN, ZOOM_HI, ZOOM_TH, ZOOM_TH_AM, ZOOM_AF, type ZoomSession } from "@shared/zoomEvents";
import { ZoomCountdown, OneTimeCountdown } from "./ZoomLiveCountdown";
import { LocalZoomTime } from "./LocalZoomTime";

// English fallback strings — used by the root homepage (app/page.tsx) which
// must be statically rendered (no headers() call). The [locale] pages call
// getTranslations instead and pass the resolved strings.
const EN_STRINGS = {
  eyebrow: "Live Right Now",
  title: "The community is",
  titleHighlight: "live right now.",
  subtitle: "Real people, real answers. Every day.",
  labelEnglish: "English",
  labelHindi: "Hindi / Urdu",
  dailyFree: "Daily · Free",
  when: "When",
  nextCallIn: "Next call in",
  joinNow: "Join now",
  labelThaiMorning: "Thai Morning",
  labelThaiEvening: "Thai Evening",
  labelAfrican: "African",
  monWedSat: "Mon · Wed · Sat · Free",
  satOnly: "Saturday only · Free",
  sunTueThu: "Sun · Tue · Thu · Free",
};

type ZoomStrings = typeof EN_STRINGS;

// ── Static variant ─────────────────────────────────────────────────────────
// Used by app/page.tsx (English root). No async, no headers() — allows ISR.
export function ZoomLiveSectionStatic() {
  return <ZoomLiveSectionInner strings={EN_STRINGS} />;
}

// ── Async variant ──────────────────────────────────────────────────────────
// Used by app/[locale]/page.tsx (translated locales). Calls getTranslations.
export async function ZoomLiveSection() {
  const t = await getTranslations("zoom");
  const strings: ZoomStrings = {
    eyebrow: t("eyebrow"),
    title: t("title"),
    titleHighlight: t("titleHighlight"),
    subtitle: t("subtitle"),
    labelEnglish: t("labelEnglish"),
    labelHindi: t("labelHindi"),
    dailyFree: t("dailyFree"),
    when: t("when"),
    nextCallIn: t("nextCallIn"),
    joinNow: t("joinNow"),
    labelThaiMorning: t("labelThaiMorning"),
    labelThaiEvening: t("labelThaiEvening"),
    labelAfrican: t("labelAfrican"),
    monWedSat: t("monWedSat"),
    satOnly: t("satOnly"),
    sunTueThu: t("sunTueThu"),
  };
  return <ZoomLiveSectionInner strings={strings} />;
}

// ── Shared inner component ─────────────────────────────────────────────────
function ZoomLiveSectionInner({ strings: s }: { strings: ZoomStrings }) {
  return (
    <section className="py-12 md:py-20">
      <Container width="default">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <Heading tier="eyebrow" className="text-[var(--c-brand-cyan)] mb-3 inline-block">
            {s.eyebrow}
          </Heading>
          <Heading tier="h1" as="h2" className="mb-3">
            {s.title}{" "}
            <span className="text-brand-wide">{s.titleHighlight}</span>
          </Heading>
          <p className="text-base md:text-lg text-[var(--c-text-muted)] leading-relaxed">
            {s.subtitle}
          </p>
        </div>
        {/* German Community Sessions — 4 sessions Aug 9/12/16/19 2026 · 20:30 Berlin (CEST) = 18:30 UTC */}
        {/* Each card auto-hides after the event ends (2h duration) */}
        <div className="max-w-5xl mx-auto mb-4 md:mb-5 flex flex-col gap-4">
          {/* Starter Call — Sonntag 09.08.2026 */}
          <OneTimeEventCard
            title="🇩🇪 TurboLoop Deutschland — Starter Call"
            description="Sonntag, 09.08.2026. Vorstellung & Einführung — alles über TurboLoop verständlich auf Deutsch erklärt. Offene Fragerunde."
            timeLabel="🇩🇪 20:30 Uhr CEST · 🇬🇧 19:30 BST · 🇦🇪 22:30 GST · 🇺🇸 2:30 PM EDT"
            dateLabel="Sonntag, 09. August 2026"
            link="https://us06web.zoom.us/j/82446832824?pwd=59OwOcjGY0ZHgGSzCT8u6zU1CQL3bj.1"
            passcode="096594"
            // Aug 9 2026 18:30 UTC in milliseconds
            targetUtcMs={1786300200000}
            durationMin={120}
          />
          {/* Technische Analyse Call — Dienstag 12.08.2026 */}
          <OneTimeEventCard
            title="🇩🇪 TurboLoop Deutschland — Technische Analyse Call"
            description="Dienstag, 12.08.2026. Tiefer Einblick. Echte Daten. Klare Analyse — Live On-Chain Analyse, Smart Contracts & Mechanismen."
            timeLabel="🇩🇪 20:30 Uhr CEST · 🇬🇧 19:30 BST · 🇦🇪 22:30 GST · 🇺🇸 2:30 PM EDT"
            dateLabel="Dienstag, 12. August 2026"
            link="https://us06web.zoom.us/j/81279948065?pwd=thx7FEYJ2H9wKEW2noU5w9nV82i5hI.1"
            passcode="906499"
            // Aug 12 2026 18:30 UTC in milliseconds
            targetUtcMs={1786559400000}
            durationMin={120}
          />
          {/* Starter Call — Sonntag 16.08.2026 */}
          <OneTimeEventCard
            title="🇩🇪 TurboLoop Deutschland — Starter Call"
            description="Sonntag, 16.08.2026. Vorstellung & Einführung — alles über TurboLoop verständlich auf Deutsch erklärt. Offene Fragerunde."
            timeLabel="🇩🇪 20:30 Uhr CEST · 🇬🇧 19:30 BST · 🇦🇪 22:30 GST · 🇺🇸 2:30 PM EDT"
            dateLabel="Sonntag, 16. August 2026"
            link="https://us06web.zoom.us/j/88309318656?pwd=WFx40pwe3hcT0Fau7Hb0JQejCIwrSF.1"
            passcode="445025"
            // Aug 16 2026 18:30 UTC in milliseconds
            targetUtcMs={1786905000000}
            durationMin={120}
          />
          {/* Technische Analyse Call — Mittwoch 19.08.2026 */}
          <OneTimeEventCard
            title="🇩🇪 TurboLoop Deutschland — Technische Analyse Call"
            description="Mittwoch, 19.08.2026. Tiefer Einblick. Echte Daten. Klare Analyse — Live On-Chain Analyse, Smart Contracts & Mechanismen."
            timeLabel="🇩🇪 20:30 Uhr CEST · 🇬🇧 19:30 BST · 🇦🇪 22:30 GST · 🇺🇸 2:30 PM EDT"
            dateLabel="Mittwoch, 19. August 2026"
            link="https://us06web.zoom.us/j/88259139722?pwd=AVE0zZkIlDZdhaPfUhJW0i8FBKPlQo.1"
            passcode="189643"
            // Aug 19 2026 18:30 UTC in milliseconds
            targetUtcMs={1787164200000}
            durationMin={120}
          />
        </div>
        {/* Row 1: English + Hindi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-5xl mx-auto mb-4 md:mb-5">
          <ZoomCard
            session={ZOOM_EN}
            accentLabel={s.labelEnglish}
            dailyFree={s.dailyFree}
            when={s.when}
            nextCallIn={s.nextCallIn}
            joinNow={s.joinNow}
          />
          <ZoomCard
            session={ZOOM_HI}
            accentLabel={s.labelHindi}
            dailyFree={s.dailyFree}
            when={s.when}
            nextCallIn={s.nextCallIn}
            joinNow={s.joinNow}
          />
        </div>
        {/* Row 2: Thai Morning + Thai Evening */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-5xl mx-auto mb-4 md:mb-5">
          <ZoomCard
            session={ZOOM_TH_AM}
            accentLabel={s.labelThaiMorning}
            dailyFree={s.satOnly}
            when={s.when}
            nextCallIn={s.nextCallIn}
            joinNow={s.joinNow}
          />
          <ZoomCard
            session={ZOOM_TH}
            accentLabel={s.labelThaiEvening}
            dailyFree={s.sunTueThu}
            when={s.when}
            nextCallIn={s.nextCallIn}
            joinNow={s.joinNow}
          />
        </div>
        {/* Row 3: African Community Call — Mon/Wed/Sat */}
        <div className="max-w-5xl mx-auto">
          <ZoomCard
            session={ZOOM_AF}
            accentLabel={s.labelAfrican}
            dailyFree={s.monWedSat}
            when={s.when}
            nextCallIn={s.nextCallIn}
            joinNow={s.joinNow}
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
  passcode,
  targetUtcMs,
  durationMin,
}: {
  title: string;
  description: string;
  timeLabel: string;
  dateLabel: string;
  link: string;
  passcode?: string;
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
      {passcode && (
        <div className="mb-4 rounded-[var(--r-md)] bg-[var(--c-bg)] border border-[var(--c-border)] px-3 py-2">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] block mb-1">
            KENNCODE
          </span>
          <span className="text-sm font-bold text-[var(--c-text)] font-mono">{passcode}</span>
        </div>
      )}
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
