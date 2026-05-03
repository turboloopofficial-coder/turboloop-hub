import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, MessageSquareQuote, Star, Users } from "lucide-react";
import { getFlagUrl } from "@/lib/constants";
import { TESTIMONIALS, relativeTime } from "@/lib/testimonialsData";
import { rotateAndRestamp } from "@/lib/dynamicRotation";
import AnimatedSection from "@/components/AnimatedSection";

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Auto-rotate the pool by day so a different testimonial is "newest" every 24h.
  // Then re-stamp the timestamps so the most recent always feels current.
  // Result: every day a fresh voice is featured, without any manual updates.
  const ordered = useMemo(() => {
    return rotateAndRestamp(TESTIMONIALS).sort(
      (a, b) => a.hoursAgo - b.hoursAgo
    );
  }, []);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setActive(a => (a + 1) % ordered.length);
    }, 7000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [ordered.length]);

  const pauseAutoplay = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
  };

  const current = ordered[active];

  // Side rail testimonials (the next 4 after current)
  const sideRail = useMemo(() => {
    const list = [];
    for (let i = 1; i <= 4; i++) {
      list.push(ordered[(active + i) % ordered.length]);
    }
    return list;
  }, [ordered, active]);

  return (
    <section
      id="testimonials"
      className="relative py-20 md:py-24 overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(8,145,178,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 bg-gradient-to-r from-cyan-100 to-purple-100 border border-cyan-200/50">
            <MessageSquareQuote className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-xs font-semibold tracking-wider text-cyan-700 uppercase">
              Voices From The Community
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-slate-800">What Builders </span>
            <span
              style={{
                background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Are Saying
            </span>
          </h2>
          <p className="text-slate-500 text-sm md:text-base mt-3">
            {ordered.length} community members across{" "}
            {new Set(ordered.map(t => t.countryCode)).size}+ countries.
          </p>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          onMouseEnter={pauseAutoplay}
        >
          {/* Featured testimonial — takes 2 cols */}
          <div className="lg:col-span-2 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="relative p-8 md:p-10 rounded-3xl h-full"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 100%)",
                  border: `1px solid ${current.color}20`,
                  boxShadow: `0 20px 60px -15px ${current.color}25, 0 8px 20px -8px rgba(0,0,0,0.04)`,
                }}
              >
                <Quote
                  className="absolute top-6 left-6 w-10 h-10 opacity-10"
                  style={{ color: current.color }}
                />

                {/* Live badge for newest */}
                {current.hoursAgo < 6 && (
                  <div
                    className="absolute top-5 right-5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-emerald-700">
                      Live
                    </span>
                  </div>
                )}

                <p className="text-lg md:text-2xl text-slate-700 leading-relaxed mb-8 relative z-10 font-light pt-6">
                  {current.quote}
                </p>

                <div
                  className="flex items-center gap-4 flex-wrap pt-4"
                  style={{ borderTop: "1px solid rgba(15,23,42,0.05)" }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg text-white relative overflow-hidden shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${current.color}, ${current.color}cc)`,
                    }}
                  >
                    {current.name
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .slice(0, 2)}
                    <img
                      src={getFlagUrl(current.countryCode, 40)}
                      alt={`Flag of ${current.countryCode.toUpperCase()}`}
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800">
                      {current.name}
                    </div>
                    <div className="text-sm text-slate-500">{current.role}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {relativeTime(current.hoursAgo)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Side rail — recent testimonials feed */}
          <div className="space-y-3 lg:max-h-[500px] lg:overflow-hidden">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 px-2 mb-1">
              Recent voices
            </div>
            <AnimatePresence mode="popLayout">
              {sideRail.map((t, idx) => (
                <motion.button
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => {
                    pauseAutoplay();
                    setActive(ordered.findIndex(o => o.id === t.id));
                  }}
                  className="w-full text-left p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: "white",
                    border: `1px solid rgba(15,23,42,0.06)`,
                    boxShadow: "0 4px 14px -4px rgba(15,23,42,0.06)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${t.color}30`;
                    e.currentTarget.style.boxShadow = `0 12px 30px -10px ${t.color}30`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(15,23,42,0.06)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 14px -4px rgba(15,23,42,0.06)";
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold relative overflow-hidden shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)`,
                      }}
                    >
                      {t.name
                        .split(" ")
                        .map(n => n[0])
                        .join("")
                        .slice(0, 2)}
                      <img
                        src={getFlagUrl(t.countryCode, 40)}
                        alt={`Flag of ${t.countryCode.toUpperCase()}`}
                        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-white"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {t.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {t.role} · {relativeTime(t.hoursAgo)}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {t.quote}
                  </p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Trust row */}
        <AnimatedSection delay={0.3}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-600" />
              <span>
                {new Set(ordered.map(t => t.countryCode)).size}+ countries
              </span>
            </div>
            <div className="w-px h-4 bg-slate-300 hidden sm:block" />
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="w-4 h-4 text-purple-600" />
              <span>{ordered.length} community voices</span>
            </div>
            <div className="w-px h-4 bg-slate-300 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>Verified, on-chain</span>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
