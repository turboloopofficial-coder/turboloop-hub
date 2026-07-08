// ZoomLiveSection — surfaces the two daily Zoom calls on the homepage
// with live countdown timers. Fully i18n via next-intl getTranslations.
import { Globe2, MessageCircle, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { ZOOM_EN, ZOOM_HI, ZOOM_TH, type ZoomSession } from "@shared/zoomEvents";
import { ZoomCountdown } from "./ZoomLiveCountdown";
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
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
          <ZoomCard
            session={ZOOM_TH}
            accentLabel={t("labelThai")}
            dailyFree={t("dailyFree")}
            when={t("when")}
            nextCallIn={t("nextCallIn")}
            joinNow={t("joinNow")}
          />
        </div>
      </Container>
    </section>
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
        <span className={multiTimezone ? "" : "font-mono"}>{session.timeLabel}</span>
      </div>
      <div className="mb-3">
        <LocalZoomTime startUtcMin={session.startUtcMin} />
      </div>
      <div className="mb-5">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] block mb-1">
          {nextCallIn}
        </span>
        <ZoomCountdown startUtcMin={session.startUtcMin} durationMin={session.durationMin} />
      </div>
      <a
        href={session.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] min-h-[48px] h-12 text-sm px-5 text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
      >
        <MessageCircle className="w-4 h-4" />
        {joinNow}
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}
