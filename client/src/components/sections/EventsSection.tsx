import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Calendar, Video, Clock, ExternalLink, History } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <section id="events" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px]" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-sm text-cyan-300 mb-6">
            <Calendar className="h-4 w-4" />
            Events & Meetings
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-white">Join the </span>
            <span className="text-gradient">Community</span>
          </h2>
        </motion.div>

        {/* Active / Upcoming / Recurring Events */}
        <div className="max-w-3xl mx-auto space-y-4">
          {activeEvents.length > 0 ? (
            activeEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="p-6 rounded-xl border border-cyan-500/10 bg-[#0d1425]/60 hover:border-cyan-500/25 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {event.status === "recurring" && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                            RECURRING
                          </span>
                        )}
                        {event.status === "live" && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                            LIVE NOW
                          </span>
                        )}
                        {event.status === "upcoming" && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            UPCOMING
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-heading font-bold text-white mb-1">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {event.dateTime} {event.timezone}
                        </span>
                        {event.frequency && (
                          <span className="text-cyan-400/60">{event.frequency}</span>
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
                    <div className="shrink-0">
                      <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30">
                          <Video className="h-4 w-4 mr-1.5" />
                          Join Meeting
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </a>
                      {event.passcode && (
                        <p className="text-xs text-gray-600 mt-1 text-center">Passcode: {event.passcode}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No upcoming events. Check back soon.</p>
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
                    className="p-4 rounded-xl border border-gray-700/30 bg-[#0d1425]/30 opacity-60"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
                        COMPLETED
                      </span>
                    </div>
                    <h3 className="text-base font-heading font-semibold text-gray-300">{event.title}</h3>
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
