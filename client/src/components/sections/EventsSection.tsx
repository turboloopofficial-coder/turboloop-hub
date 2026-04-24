import { trpc } from "@/lib/trpc";
import { Calendar, Video, Clock, ExternalLink, History, Radio, Globe2, Users } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";

/** Parse a recurring event time + timezone into the next occurrence */
function getNextOccurrence(timeStr: string, tz: string): Date | null {
  try {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    const tzMatch = tz.match(/UTC([+-]?\d+)?(?::(\d+))?/);
    let offsetMinutes = 0;
    if (tzMatch) {
      const h = parseInt(tzMatch[1] || "0");
      const m = parseInt(tzMatch[2] || "0");
      offsetMinutes = h * 60 + (h < 0 ? -m : m);
    }

    const now = new Date();
    const todayInTz = new Date(now.getTime() + offsetMinutes * 60000);
    const year = todayInTz.getUTCFullYear();
    const month = todayInTz.getUTCMonth();
    const day = todayInTz.getUTCDate();

    let eventTime = new Date(Date.UTC(year, month, day, hours, minutes, 0) - offsetMinutes * 60000);
    const eventEnd = new Date(eventTime.getTime() + 2 * 3600000);
    if (now > eventEnd) {
      eventTime = new Date(eventTime.getTime() + 86400000);
    }
    return eventTime;
  } catch {
    return null;
  }
}

/** Single big countdown digit tile */
function DigitTile({ value, label, accent }: { value: number; label: string; accent: string }) {
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
        {/* horizontal split line */}
        <div
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
      <span className="mt-2 text-[10px] tracking-[0.2em] uppercase font-bold text-white/40">{label}</span>
    </div>
  );
}

/** Hero countdown card */
function ZoomCountdown({
  event,
  eventTime,
}: {
  event: any;
  eventTime: Date;
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = eventTime.getTime() - now.getTime();
  const eventEnd = new Date(eventTime.getTime() + 2 * 3600000);
  const isLive = diff <= 0 && now < eventEnd;
  const totalSecs = Math.max(0, Math.floor(diff / 1000));
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  // Live remaining
  const liveRemaining = Math.max(0, Math.floor((eventEnd.getTime() - now.getTime()) / 1000));
  const liveMins = Math.floor(liveRemaining / 60);
  const liveSecs = liveRemaining % 60;

  const accent = isLive ? "#EF4444" : "#22D3EE";

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Outer glow */}
      <motion.div
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
        className="relative rounded-3xl overflow-hidden p-7 md:p-10"
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
          border: `1.5px solid ${accent}40`,
          boxShadow: `0 30px 80px -20px ${accent}40`,
        }}
      >
        {/* Grid bg */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              `linear-gradient(${accent}15 1px, transparent 1px), linear-gradient(90deg, ${accent}15 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 90%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 90%)",
          }}
        />
        {/* Corner glow */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accent}25 0%, transparent 60%)` }}
        />

        <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
          {/* Left: status + title + meta */}
          <div className="md:col-span-7">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{
                background: `${accent}15`,
                border: `1px solid ${accent}40`,
              }}
            >
              <motion.div
                animate={isLive ? { scale: [1, 1.5, 1], opacity: [1, 0.4, 1] } : { opacity: [0.5, 1, 0.5] }}
                transition={{ duration: isLive ? 1.2 : 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full"
                style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
              />
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: accent }}>
                {isLive ? "Live Now · Join Anytime" : "Daily · Every Day"}
              </span>
              {isLive && <Radio className="w-3 h-3" style={{ color: accent }} />}
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
              {event.title}
            </h3>

            {event.description && (
              <p className="text-sm md:text-base text-white/55 leading-relaxed mb-5 max-w-md">
                {event.description}
              </p>
            )}

            {/* Meta info row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 text-[13px] text-white/60">
              <span className="inline-flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono">{event.dateTime}</span>
                <span className="text-white/40">{event.timezone}</span>
              </span>
              {event.language && (
                <span className="inline-flex items-center gap-2">
                  <Globe2 className="w-3.5 h-3.5 text-purple-400" />
                  {event.language}
                </span>
              )}
              {event.passcode && (
                <span className="inline-flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Code: <span className="font-mono font-semibold text-white/80">{event.passcode}</span>
                </span>
              )}
            </div>

            {/* CTA */}
            <motion.a
              href={event.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all"
              style={{
                background: isLive
                  ? "linear-gradient(135deg, #EF4444, #DC2626)"
                  : "linear-gradient(135deg, #22D3EE, #0891B2)",
                color: "white",
                boxShadow: `0 14px 34px -8px ${accent}90, inset 0 1px 0 rgba(255,255,255,0.2)`,
              }}
            >
              <Video className="w-4 h-4" />
              {isLive ? "Join Live Call" : "Join Today's Call"}
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </motion.a>
          </div>

          {/* Right: countdown */}
          <div className="md:col-span-5">
            <div className="text-center">
              <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-white/40 mb-3">
                {isLive ? "Ends in" : "Starts in"}
              </div>
              <div className="flex items-start justify-center gap-2 md:gap-3">
                {isLive ? (
                  <>
                    <DigitTile value={liveMins} label="Min" accent={accent} />
                    <div className="text-3xl md:text-4xl font-bold text-white/30 pt-3 md:pt-4">:</div>
                    <DigitTile value={liveSecs} label="Sec" accent={accent} />
                  </>
                ) : (
                  <>
                    <DigitTile value={hours} label="Hours" accent={accent} />
                    <div className="text-3xl md:text-4xl font-bold text-white/30 pt-3 md:pt-4">:</div>
                    <DigitTile value={mins} label="Min" accent={accent} />
                    <div className="text-3xl md:text-4xl font-bold text-white/30 pt-3 md:pt-4">:</div>
                    <DigitTile value={secs} label="Sec" accent={accent} />
                  </>
                )}
              </div>
              {!isLive && (
                <p className="mt-4 text-xs text-white/40">
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

export default function EventsSection() {
  const { data: events } = trpc.content.events.useQuery();
  const [showPast, setShowPast] = useState(false);

  const { activeEvents, pastEvents } = useMemo(() => {
    if (!events) return { activeEvents: [], pastEvents: [] };
    const active = events.filter(e => e.status !== "completed");
    const past = events.filter(e => e.status === "completed");
    return { activeEvents: active, pastEvents: past };
  }, [events]);

  return (
    <section id="events" className="section-spacing relative overflow-hidden">
      <div className="container relative z-10">
        <SectionHeading
          label="Events & Meetings"
          title="Join the Community"
          subtitle="Daily Zoom sessions, community calls, and live events. Everyone is welcome."
        />

        <div className="space-y-5">
          {activeEvents.length > 0 ? (
            activeEvents.map((event, index) => {
              const nextTime = event.status === "recurring"
                ? getNextOccurrence(event.dateTime, event.timezone || "UTC")
                : null;

              if (nextTime) {
                return (
                  <AnimatedSection key={event.id} delay={index * 0.1}>
                    <ZoomCountdown event={event} eventTime={nextTime} />
                  </AnimatedSection>
                );
              }

              // Fallback: simple card for non-recurring events
              return (
                <AnimatedSection key={event.id} delay={index * 0.1}>
                  <div
                    className="max-w-3xl mx-auto p-6 rounded-2xl"
                    style={{
                      background: "white",
                      border: "1px solid rgba(15,23,42,0.06)",
                      boxShadow: "0 6px 20px -6px rgba(15,23,42,0.06)",
                    }}
                  >
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{event.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {event.dateTime} {event.timezone}
                      </span>
                      {event.language && <span>{event.language}</span>}
                    </div>
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                      style={{
                        background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                        color: "white",
                      }}
                    >
                      <Video className="w-4 h-4" /> Join Meeting <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </AnimatedSection>
              );
            })
          ) : (
            <AnimatedSection>
              <div className="text-center py-12 max-w-md mx-auto">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <Calendar className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-400">No upcoming events. Check back soon.</p>
              </div>
            </AnimatedSection>
          )}
        </div>

        {/* Past Events Toggle */}
        {pastEvents.length > 0 && (
          <div className="max-w-3xl mx-auto mt-8">
            <button
              onClick={() => setShowPast(!showPast)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors mx-auto"
            >
              <History className="h-4 w-4" />
              {showPast ? "Hide" : "Show"} Past Events ({pastEvents.length})
            </button>
            {showPast && (
              <div className="space-y-3 mt-4">
                {pastEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-xl opacity-60"
                    style={{
                      background: "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(0,0,0,0.04)",
                    }}
                  >
                    <h4 className="text-sm font-semibold text-slate-700">{event.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{event.dateTime} {event.timezone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
