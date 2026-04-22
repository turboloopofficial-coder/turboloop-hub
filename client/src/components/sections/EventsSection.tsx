import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Calendar, Video, Clock, ExternalLink, History } from "lucide-react";
import { useMemo, useState } from "react";

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
    recurring: { label: "RECURRING", color: "#34D399", pulse: false },
    upcoming: { label: "UPCOMING", color: "#22D3EE", pulse: false },
  };

  return (
    <section id="events" className="relative section-padding overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(34,211,238,0.04) 0%, transparent 60%)" }} />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm text-cyan-300/80 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Events & Meetings
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-5">
            <span className="text-white">Join the</span>{" "}
            <span className="text-gradient">Community</span>
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {activeEvents.length > 0 ? (
            activeEvents.map((event, index) => {
              const status = statusConfig[event.status] || statusConfig.upcoming;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div
                    className="relative p-6 md:p-7 rounded-xl overflow-hidden transition-all duration-400"
                    style={{
                      background: "linear-gradient(135deg, rgba(13,20,40,0.7) 0%, rgba(13,20,40,0.4) 100%)",
                      backdropFilter: "blur(20px)",
                      border: `1px solid ${status.color}15`,
                    }}
                  >
                    {/* Top glow line */}
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${status.color}40, transparent)` }} />

                    <div className="flex flex-col md:flex-row md:items-center gap-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${status.pulse ? "animate-pulse" : ""}`}
                            style={{
                              background: `${status.color}15`,
                              color: status.color,
                              border: `1px solid ${status.color}30`,
                              boxShadow: status.pulse ? `0 0 10px ${status.color}20` : "none",
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
                            {status.label}
                          </span>
                        </div>

                        <h3 className="text-xl font-heading font-bold text-white mb-2">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-gray-500" />
                            {event.dateTime} {event.timezone}
                          </span>
                          {event.frequency && (
                            <span style={{ color: `${status.color}80` }}>{event.frequency}</span>
                          )}
                          {event.language && (
                            <span className="text-gray-500">{event.language}</span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-2">{event.description}</p>
                        )}
                        {event.hostName && (
                          <p className="text-xs text-gray-600 mt-1">Host: {event.hostName}</p>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-col items-center gap-2">
                        <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                          <button
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                            style={{
                              background: `linear-gradient(135deg, ${status.color}20, ${status.color}10)`,
                              border: `1px solid ${status.color}30`,
                              color: status.color,
                            }}
                          >
                            <Video className="h-4 w-4" />
                            Join Meeting
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </a>
                        {event.passcode && (
                          <p className="text-xs text-gray-600">Passcode: {event.passcode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
                <Calendar className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-gray-500">No upcoming events. Check back soon.</p>
            </div>
          )}
        </div>

        {/* Past Events Toggle */}
        {pastEvents.length > 0 && (
          <div className="max-w-3xl mx-auto mt-8">
            <button
              onClick={() => setShowPast(!showPast)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mx-auto"
            >
              <History className="h-4 w-4" />
              {showPast ? "Hide" : "Show"} Past Events ({pastEvents.length})
            </button>

            {showPast && (
              <div className="space-y-3 mt-4">
                {pastEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-xl opacity-50"
                    style={{
                      background: "rgba(13,20,40,0.3)",
                      border: "1px solid rgba(255,255,255,0.03)",
                    }}
                  >
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(107,114,128,0.15)", color: "#9CA3AF", border: "1px solid rgba(107,114,128,0.2)" }}>
                      COMPLETED
                    </span>
                    <h3 className="text-base font-heading font-semibold text-gray-300 mt-2">{event.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{event.dateTime} {event.timezone}</p>
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
