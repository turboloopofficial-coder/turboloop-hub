"use client";

// EventsSection — animated Zoom countdown card per language + the static
// "what to expect" grid + Telegram CTA. Ported from the legacy SPA's
// ZoomCountdown component, fed by the canonical session metadata in
// shared/zoomEvents.ts.
//
// Time-of-day fields (startUtcMin, durationMin, timeLabel) come from
// the hardcoded ZOOM_SESSIONS — they're never admin-editable because
// the cron's T-30 reminder windows are pegged to those exact minutes
// and an accidental edit would mis-schedule reminders.
//
// Link + passcode HOWEVER are admin-editable via the legacy admin
// panel (Settings → Zoom Daily Calls), stored in the site_settings
// table. The cron picks those overrides up via getZoomConfig() in
// server/zoom-config.ts. The frontend now does the same via the
// /api/zoom-config edge route — on mount we fetch the overrides and
// merge them over the hardcoded defaults so the public site never
// shows a stale link.

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Calendar,
  Globe2,
  Users,
  Mic,
  MessageCircle,
  ExternalLink,
  Video,
  Clock,
  Radio,
} from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import {
  ZOOM_SESSIONS,
  nextZoomOccurrence,
  type ZoomSession,
} from "@shared/zoomEvents";

/** Shape returned by /api/zoom-config. Only `link` and `passcode` are
 *  admin-editable; everything else falls through to hardcoded defaults. */
interface ZoomOverride {
  link?: string;
  passcode?: string;
}
type ZoomOverrideMap = Partial<Record<ZoomSession["lang"], ZoomOverride>>;

/** Fold admin overrides into the base ZoomSession defaults. Returns a
 *  new array of sessions with link + passcode replaced when an override
 *  is present. Pure function — safe to call on every render. */
function mergeZoomOverrides(
  base: readonly ZoomSession[],
  overrides: ZoomOverrideMap
): ZoomSession[] {
  return base.map(session => {
    const o = overrides[session.lang];
    if (!o || (!o.link && !o.passcode)) return session;
    return {
      ...session,
      link: o.link ?? session.link,
      passcode: o.passcode ?? session.passcode,
    };
  });
}

// SESSION_TYPES built inside component to use translations

/* ─── Countdown digit tile ──────────────────────────────────────────── */

function DigitTile({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent: string;
}) {
  const padded = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-16 h-20 md:w-20 md:h-24 rounded-2xl flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
          border: `1px solid ${accent}30`,
          boxShadow: `0 10px 30px -8px ${accent}40, inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -10px 20px rgba(0,0,0,0.3)`,
        }}
      >
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-1/2 h-[1px] -translate-y-px pointer-events-none"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <span
          className="text-3xl md:text-4xl font-bold tabular-nums leading-none"
          style={{
            color: accent,
            textShadow: `0 0 18px ${accent}50, 0 2px 0 rgba(0,0,0,0.4)`,
          }}
        >
          {padded}
        </span>
      </div>
      <span className="mt-2 text-[10px] tracking-[0.2em] uppercase font-bold text-white/50">
        {label}
      </span>
    </div>
  );
}

/* ─── ZoomCountdown card ────────────────────────────────────────────── */

function ZoomCountdown({ session, t }: { session: ZoomSession; t: ReturnType<typeof useTranslations<"events">> }) {
  // Compute the next event time once on mount; the seconds-tick will catch
  // when the call ends and we need to flip to tomorrow's start.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const eventTime = useMemo(
    () => nextZoomOccurrence(session, now ?? new Date()),
    [session, now]
  );

  // Server render + first client paint: render zeros to avoid hydration drift.
  // Once we have a real `now`, the component re-renders with real values.
  const diffMs = now ? eventTime.getTime() - now.getTime() : 0;
  const eventEnd = new Date(
    eventTime.getTime() + session.durationMin * 60_000
  );
  const isLive = !!now && diffMs <= 0 && now < eventEnd;
  const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const liveRemaining = now
    ? Math.max(0, Math.floor((eventEnd.getTime() - now.getTime()) / 1000))
    : 0;
  const liveMins = Math.floor(liveRemaining / 60);
  const liveSecs = liveRemaining % 60;

  const accent = isLive ? "#EF4444" : "#22D3EE";

  return (
    <div className="relative w-full">
      <motion.div
        aria-hidden="true"
        className="absolute -inset-3 rounded-[28px] opacity-50 blur-2xl pointer-events-none"
        style={{
          background: isLive
            ? "linear-gradient(135deg, #EF444440, #DC262650, #EF444440)"
            : "linear-gradient(135deg, #0891B240, #7C3AED50, #0891B240)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div
        className="relative rounded-[var(--r-2xl)] overflow-hidden p-7 md:p-10"
        style={{
          background:
            "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
          border: `1.5px solid ${accent}40`,
          boxShadow: `0 30px 80px -20px ${accent}40`,
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `linear-gradient(${accent}15 1px, transparent 1px), linear-gradient(90deg, ${accent}15 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 90%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${accent}25 0%, transparent 60%)`,
          }}
        />

        <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{
                background: `${accent}15`,
                border: `1px solid ${accent}40`,
              }}
            >
              <motion.div
                aria-hidden="true"
                animate={
                  isLive
                    ? { scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }
                    : { opacity: [0.5, 1, 0.5] }
                }
                transition={{
                  duration: isLive ? 1.2 : 2,
                  repeat: Infinity,
                }}
                className="w-2 h-2 rounded-full"
                style={{
                  background: accent,
                  boxShadow: `0 0 10px ${accent}`,
                }}
              />
              <span
                className="text-[10px] font-bold tracking-[0.25em] uppercase"
                style={{ color: accent }}
              >
                {isLive ? t("liveNow") : t("daily")}
              </span>
              {isLive && (
                <Radio className="w-3 h-3" style={{ color: accent }} />
              )}
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
              {session.title}
            </h3>

            <p className="text-sm md:text-base text-white/60 leading-relaxed mb-5 max-w-md">
              {session.description}
            </p>

            {/* Long multi-country timeLabels (5 timezones separated by ·)
                blow out the inline flex row, so we detect those and lift
                the time onto its own line above the language + passcode
                pair. Short single-timezone labels (EN session, legacy
                HI labels) keep the original inline layout. */}
            {session.timeLabel.includes("·") ? (
              <div className="mb-6 text-[13px] text-white/65 space-y-2">
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 mt-1 shrink-0" />
                  <span className="text-xs md:text-[13px] leading-relaxed break-words">
                    {session.timeLabel}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  <span className="inline-flex items-center gap-2">
                    <Globe2 className="w-3.5 h-3.5 text-purple-400" />
                    {session.lang === "en" ? t("english") : t("hindiUrdu")}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    Code:{" "}
                    <span className="font-mono font-semibold text-white/85">
                      {session.passcode}
                    </span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 text-[13px] text-white/65">
                <span className="inline-flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-mono">{session.timeLabel}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <Globe2 className="w-3.5 h-3.5 text-purple-400" />
                  {session.lang === "en" ? t("english") : t("hindiUrdu")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Code:{" "}
                  <span className="font-mono font-semibold text-white/85">
                    {session.passcode}
                  </span>
                </span>
              </div>
            )}

            <motion.a
              href={session.link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-2.5 px-6 min-h-[44px] py-3.5 rounded-[var(--r-lg)] font-bold text-sm transition-all"
              style={{
                background: isLive
                  ? "linear-gradient(135deg, #EF4444, #DC2626)"
                  : "linear-gradient(135deg, #22D3EE, #0891B2)",
                color: "white",
                boxShadow: `0 14px 34px -8px ${accent}90, inset 0 1px 0 rgba(255,255,255,0.2)`,
              }}
            >
              <Video className="w-4 h-4" />
              {isLive ? t("joinLiveCall") : t("joinTodaysCall")}
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </motion.a>
          </div>

          <div className="md:col-span-5">
            <div className="text-center">
              <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-white/50 mb-3">
                {isLive ? t("endsIn") : t("startsIn")}
              </div>
              <div className="flex items-start justify-center gap-2 md:gap-3">
                {isLive ? (
                  <>
                    <DigitTile
                      value={liveMins}
                      label={t("min")}
                      accent={accent}
                    />
                    <div className="text-3xl md:text-4xl font-bold text-white/30 pt-3 md:pt-4">
                      :
                    </div>
                    <DigitTile
                      value={liveSecs}
                      label={t("sec")}
                      accent={accent}
                    />
                  </>
                ) : (
                  <>
                    <DigitTile value={hours} label={t("hours")} accent={accent} />
                    <div className="text-3xl md:text-4xl font-bold text-white/30 pt-3 md:pt-4">
                      :
                    </div>
                    <DigitTile value={mins} label={t("min")} accent={accent} />
                    <div className="text-3xl md:text-4xl font-bold text-white/30 pt-3 md:pt-4">
                      :
                    </div>
                    <DigitTile value={secs} label={t("sec")} accent={accent} />
                  </>
                )}
              </div>
              {!isLive && (
                <p className="mt-4 text-xs text-white/45">
                  Daily community call · No registration needed
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── EventsSection (default export) ────────────────────────────────── */

export function EventsSection() {
  const t = useTranslations("events");
  const SESSION_TYPES = [
    {
      icon: Calendar,
      label: t("sessionType1Label"),
      detail: t("sessionType1Detail"),
      color: "#0891B2",
    },
    {
      icon: Mic,
      label: t("sessionType2Label"),
      detail: t("sessionType2Detail"),
      color: "#7C3AED",
    },
    {
      icon: Users,
      label: t("sessionType3Label"),
      detail: t("sessionType3Detail"),
      color: "#10B981",
    },
  ];
  // Live Zoom sessions = hardcoded defaults + admin overrides for
  // link/passcode (from /api/zoom-config). Initial render uses the
  // pure defaults so SSR HTML is stable + the page never flashes a
  // blank countdown waiting on the fetch.
  const [overrides, setOverrides] = useState<ZoomOverrideMap>({});
  useEffect(() => {
    let cancelled = false;
    fetch("/api/zoom-config", { cache: "no-store" })
      .then(r => (r.ok ? r.json() : null))
      .then((data: ZoomOverrideMap | null) => {
        if (cancelled || !data) return;
        // Only commit to state if at least one override field is
        // present — avoids a no-op re-render on every mount.
        const hasAny = Object.values(data).some(
          v => v && (v.link || v.passcode)
        );
        if (hasAny) setOverrides(data);
      })
      .catch(() => {
        // Network / DB error — silently keep using hardcoded defaults.
        // The countdown timer and Telegram CTA both still work.
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const sessions = useMemo(
    () => mergeZoomOverrides(ZOOM_SESSIONS, overrides),
    [overrides]
  );

  return (
    <section id="events" className="py-12 md:py-20">
      <Container width="default">
        <div className="text-center mb-8 md:mb-10">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-brand-cyan)] mb-3 inline-block"
          >
            {t("eyebrow")}
          </Heading>
          <Heading tier="h1" as="h2">
            {t("title")}{" "}
            <span className="text-brand-wide">{t("titleHighlight")}</span>
          </Heading>
          <p className="mt-4 text-[var(--c-text-muted)] max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="space-y-6 md:space-y-8 mb-10 md:mb-14 max-w-5xl mx-auto">
          {sessions.map(session => (
            <ZoomCountdown key={session.lang} session={session} t={t} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8">
          {SESSION_TYPES.map(s => {
            const Icon = s.icon;
            return (
              <Card key={s.label} elevation="raised" padding="lg">
                <div
                  className="w-12 h-12 rounded-[var(--r-lg)] flex items-center justify-center mb-4"
                  style={{
                    background: `${s.color}15`,
                    color: s.color,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <Heading tier="title" as="h3" className="text-base mb-2">
                  {s.label}
                </Heading>
                <p className="text-sm text-[var(--c-text-muted)] leading-relaxed">
                  {s.detail}
                </p>
              </Card>
            );
          })}
        </div>

        <Card
          elevation="prominent"
          padding="lg"
          className="text-center md:text-left md:flex md:items-center md:justify-between md:gap-8 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 -z-10 opacity-10"
            style={{ background: "var(--c-brand-gradient)" }}
            aria-hidden="true"
          />
          <div className="md:flex-1">
            <Heading tier="h2" className="mb-2">
              <Globe2 className="inline-block w-6 h-6 mr-2 text-[var(--c-brand-cyan)]" />
              {t("findYourCall")}
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed">
              {t("findYourCallDetail")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0 flex-shrink-0">
            <a
              href="https://t.me/TurboLoop_Official"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
            >
              <MessageCircle className="w-4 h-4" />
              {t("openTelegram")}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="/apply"
              className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] transition active:scale-[0.985]"
            >
              <Mic className="w-4 h-4" />
              {t("becomePresenter")}
            </a>
          </div>
        </Card>
      </Container>
    </section>
  );
}
