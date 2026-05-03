// Single rotating testimonial — replaces the full TestimonialsSection on the homepage.
// Pulls from the existing testimonial pool, auto-rotates every 7s, with prev/next + dots.

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS, relativeTime } from "@/lib/testimonialsData";
import { rotateAndRestamp } from "@/lib/dynamicRotation";
import { getFlagUrl } from "@/lib/constants";
import AnimatedSection from "@/components/AnimatedSection";

export default function HomeTestimonialRotator() {
  // Daily-rotating + restamped pool
  const pool = useMemo(
    () =>
      rotateAndRestamp(TESTIMONIALS).sort((a, b) => a.hoursAgo - b.hoursAgo),
    []
  );
  const [active, setActive] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setActive(a => (a + 1) % pool.length);
    }, 7000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [pool.length]);

  const pauseAuto = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
  };
  const cur = pool[active];

  return (
    <section className="section-spacing relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(8,145,178,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="container relative z-10">
        <AnimatedSection>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-cyan-700/80">
              Voices from the Community
            </span>
            <h2
              className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              What builders are saying.
            </h2>
          </div>
        </AnimatedSection>

        {/* Single featured testimonial */}
        <div className="max-w-3xl mx-auto" onMouseEnter={pauseAuto}>
          <AnimatePresence mode="wait">
            <motion.div
              key={cur.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.4 }}
              className="relative p-8 md:p-12 rounded-3xl"
              style={{
                background: "white",
                border: `1px solid ${cur.color}22`,
                boxShadow: `0 20px 60px -16px ${cur.color}25`,
              }}
            >
              <Quote
                className="absolute top-6 left-6 w-10 h-10 opacity-10"
                style={{ color: cur.color }}
              />

              <p
                className="text-xl md:text-2xl text-slate-700 leading-relaxed font-light pt-6 mb-8"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                "{cur.quote}"
              </p>

              <div
                className="flex items-center gap-4 pt-4"
                style={{ borderTop: "1px solid rgba(15,23,42,0.05)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white relative overflow-hidden shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${cur.color}, ${cur.color}cc)`,
                  }}
                >
                  {cur.name
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .slice(0, 2)}
                  <img
                    src={getFlagUrl(cur.countryCode, 40)}
                    alt={`Flag of ${cur.countryCode.toUpperCase()}`}
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900">{cur.name}</div>
                  <div className="text-sm text-slate-500">{cur.role}</div>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {relativeTime(cur.hoursAgo)}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => {
                pauseAuto();
                setActive(a => (a - 1 + pool.length) % pool.length);
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center transition hover:scale-110"
              style={{
                background: "white",
                border: "1px solid rgba(15,23,42,0.08)",
                color: "#475569",
              }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {(active + 1).toString().padStart(2, "0")} /{" "}
              {pool.length.toString().padStart(2, "0")}
            </span>
            <button
              onClick={() => {
                pauseAuto();
                setActive(a => (a + 1) % pool.length);
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center transition hover:scale-110"
              style={{
                background: "white",
                border: "1px solid rgba(15,23,42,0.08)",
                color: "#475569",
              }}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatedSection delay={0.3}>
          <div className="flex justify-center mt-10">
            <Link href="/community">
              <button
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105"
                style={{
                  background: "white",
                  color: "#0F172A",
                  border: "1px solid rgba(15,23,42,0.08)",
                  boxShadow: "0 6px 16px -4px rgba(15,23,42,0.08)",
                }}
              >
                Read all {pool.length} community voices
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
