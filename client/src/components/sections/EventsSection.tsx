import { trpc } from "@/lib/trpc";
import { Calendar, Video, Clock, ExternalLink, History, Radio } from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import SectionHeading from "@/components/SectionHeading";
import AnimatedSection from "@/components/AnimatedSection";

/** Parse a recurring event time like "10:00 PM" + timezone into the next occurrence */
function getNextOccurrence(timeStr: string, tz: string): Date | null {
  try {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    // Build a date in UTC-based approach: we assume the tz string is like "UTC+5:30" or "UTC"
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

    // Create the event time in UTC
    let eventTime = new Date(Date.UTC(year, month, day, hours, minutes, 0) - offsetMinutes * 60000);

    // If event time + 2 hours has already passed, move to next day
    const eventEnd = new Date(eventTime.getTime() + 2 * 3600000);
    if (now > eventEnd) {
      eventTime = new Date(eventTime.getTime() + 86400000);
    }

    return eventTime;
  } catch {
    return null;
  }
}

/** Countdown timer component */
function ZoomCountdown({ eventTime, meetingLink }: { eventTime: Date; meetingLink: string }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = eventTime.getTime() - now.getTime();
  const eventEnd = new Date(eventTime.getTime() + 2 * 3600000);
  const isLive = diff <= 0 && now < eventEnd;
  const isPast = now >= eventEnd;

  if (isPast) return null;

  if (isLive) {
    const remaining = eventEnd.getTime() - now.getTime();
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
          <Radio className="h-4 w-4 text-red-500 animate-pulse" />
          <span className="text-sm font-bold text-red-500">LIVE NOW</span>
        </div>
        <a href={meetingLink} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, #0891B2, #0E7490)",
            color: "#ffffff",
            boxShadow: "0 4px 20px rgba(8,145,178,0.3)",
          }}
        >
          <Video className="h-4 w-4" />
          Join Now
          <ExternalLink className="h-3 w-3" />
        </a>
        <span className="text-xs text-slate-400">Ends in {mins}m {secs}s</span>
      </div>
    );
  }

  // Countdown to start
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Starts in</span>
      <div className="flex items-center gap-2">
        {[
          { value: hours, label: "h" },
          { value: mins, label: "m" },
          { value: secs, label: "s" },
        ].map((unit, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-lg font-bold text-cyan-700"
              style={{ background: "rgba(8,145,178,0.08)", border: "1px solid rgba(8,145,178,0.15)" }}>
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-xs text-slate-400 font-medium">{unit.label}</span>
          </div>
        ))}
      </div>
      <a href={meetingLink} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
        style={{
          background: "rgba(8,145,178,0.08)",
          border: "1px solid rgba(8,145,178,0.2)",
          color: "#0891B2",
        }}
      >
        <Video className="h-4 w-4" />
        Join Meeting
        <ExternalLink className="h-3 w-3" />
      </a>
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

  const statusConfig: Record<string, { label: string; color: string; pulse: boolean }> = {
    live: { label: "LIVE NOW", color: "#EF4444", pulse: true },
    recurring: { label: "DAILY", color: "#059669", pulse: false },
    upcoming: { label: "UPCOMING", color: "#0891B2", pulse: false },
  };

  return (
    <section id="events" className="section-spacing relative">
      <div className="container">
        <SectionHeading
          label="Events & Meetings"
          title="Join the Community"
          subtitle="Daily Zoom sessions, community calls, and live events. Everyone is welcome."
        />

        <div className="max-w-3xl mx-auto space-y-4">
          {activeEvents.length > 0 ? (
            activeEvents.map((event, index) => {
              const status = statusConfig[event.status] || statusConfig.upcoming;
              const nextTime = event.status === "recurring" ? getNextOccurrence(event.dateTime, event.timezone || "UTC") : null;

              return (
                <AnimatedSection key={event.id} delay={index * 0.1}>
                  <div
                    className="relative p-6 md:p-7 rounded-xl overflow-hidden"
                    style={{
                      background: "rgba(255, 255, 255, 0.7)",
                      border: `1px solid rgba(255,255,255,0.85)`,
                      backdropFilter: "blur(20px)",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* Top accent */}
                    <div className="absolute top-0 left-0 right-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${status.color}40, transparent)` }}
                    />

                    <div className="flex flex-col md:flex-row md:items-center gap-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${status.pulse ? "animate-pulse" : ""}`}
                            style={{
                              background: `${status.color}10`,
                              color: status.color,
                              border: `1px solid ${status.color}25`,
                              boxShadow: status.pulse ? `0 0 10px ${status.color}15` : "none",
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
                            {status.label}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-2">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {event.dateTime} {event.timezone}
                          </span>
                          {event.frequency && (
                            <span style={{ color: status.color }}>{event.frequency}</span>
                          )}
                          {event.language && (
                            <span className="text-slate-400">{event.language}</span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-slate-500 mt-2">{event.description}</p>
                        )}
                        {event.hostName && (
                          <p className="text-xs text-slate-400 mt-1">Host: {event.hostName}</p>
                        )}
                        {event.passcode && (
                          <p className="text-xs text-slate-400 mt-1">Passcode: <span className="font-mono font-semibold text-slate-600">{event.passcode}</span></p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {nextTime ? (
                          <ZoomCountdown eventTime={nextTime} meetingLink={event.meetingLink} />
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <a href={event.meetingLink} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                              style={{
                                background: `${status.color}10`,
                                border: `1px solid ${status.color}25`,
                                color: status.color,
                              }}
                            >
                              <Video className="h-4 w-4" />
                              Join Meeting
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })
          ) : (
            <AnimatedSection>
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
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
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(100,116,139,0.1)", color: "#64748B" }}
                    >
                      COMPLETED
                    </span>
                    <h3 className="text-base font-semibold text-slate-600 mt-2">{event.title}</h3>
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
