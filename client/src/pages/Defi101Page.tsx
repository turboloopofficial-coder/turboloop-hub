// /learn — DeFi 101 hub. Lists all lessons grouped by difficulty.

import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import PageShell from "@/components/PageShell";
import AnimatedSection from "@/components/AnimatedSection";
import { LESSONS } from "@/lib/defi101";

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "#10B981", // green — beginner
  2: "#0891B2", // cyan — easy intermediate
  3: "#7C3AED", // purple — intermediate
  4: "#EC4899", // pink — advanced
  5: "#F59E0B", // amber — expert
};

export default function Defi101Page() {
  return (
    <PageShell
      title="DeFi 101 — learn DeFi from zero"
      description={`${LESSONS.length} short lessons explaining DeFi from absolute zero. Smart contracts, stablecoins, yield farming, on-chain verification — all in plain English.`}
      path="/learn"
      hero={{
        label: `DeFi 101 · ${LESSONS.length} lessons`,
        heading: "Learn DeFi from zero.",
        subtitle: "Plain-English explainers covering everything from \"what is a smart contract\" to \"how to verify a transaction on BscScan\". No prior crypto experience needed.",
        palette: ["#0891B2", "#22D3EE", "#7C3AED"],
        emoji: "📚",
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "DeFi 101 — Turbo Loop",
        url: "https://turboloop.tech/learn",
        description: "Beginner DeFi lessons in plain English.",
        hasPart: LESSONS.map((l) => ({
          "@type": "Article",
          name: l.title,
          description: l.summary,
          url: `https://turboloop.tech/learn/${l.slug}`,
        })),
      }}
      related={[
        { label: "Films", href: "/films", emoji: "🎬", description: "20-film cinematic universe — the visual version" },
        { label: "Editorial", href: "/feed", emoji: "📖", description: "Long-form blog updated weekly" },
        { label: "Ecosystem", href: "/ecosystem", emoji: "⚙️", description: "The 6 pillars of TurboLoop" },
      ]}
    >
      <div className="container max-w-3xl pb-16">
        <AnimatedSection>
          <p className="text-base md:text-lg text-slate-700 leading-relaxed mb-10 text-center">
            Each lesson is 3-5 minutes. Read in any order. They link to each other where it helps.
          </p>
        </AnimatedSection>

        <div className="space-y-3">
          {LESSONS.map((lesson, i) => (
            <AnimatedSection key={lesson.slug} delay={i * 0.05}>
              <Link href={`/learn/${lesson.slug}`}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="group block p-5 md:p-6 rounded-2xl cursor-pointer transition-all"
                  style={{
                    background: "white",
                    border: "1px solid rgba(15,23,42,0.06)",
                    boxShadow: "0 6px 18px -8px rgba(15,23,42,0.06)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 18px 40px -12px ${DIFFICULTY_COLORS[lesson.difficulty]}30`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 6px 18px -8px rgba(15,23,42,0.06)"; }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="text-3xl shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${DIFFICULTY_COLORS[lesson.difficulty]}15` }}
                    >
                      {lesson.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
                          style={{ background: `${DIFFICULTY_COLORS[lesson.difficulty]}15`, color: DIFFICULTY_COLORS[lesson.difficulty] }}
                        >
                          Lesson {i + 1}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          {lesson.readTime} min
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-cyan-700 transition-colors leading-tight">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{lesson.summary}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 shrink-0 text-slate-300 group-hover:text-cyan-700 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              </Link>
            </AnimatedSection>
          ))}
        </div>

        {/* Closing CTA */}
        <AnimatedSection delay={0.4}>
          <div className="mt-12 p-6 rounded-2xl text-center"
            style={{ background: "linear-gradient(135deg, rgba(8,145,178,0.06), rgba(124,58,237,0.04))", border: "1px solid rgba(8,145,178,0.15)" }}
          >
            <BookOpen className="w-8 h-8 mx-auto mb-3 text-cyan-700" />
            <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Done with the basics?
            </h3>
            <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">
              Move on to the long-form deep-dives in our editorial blog, or watch the cinematic universe — same ideas, in 30-90 second films.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link href="/feed">
                <button className="px-5 py-2.5 rounded-xl text-sm font-bold transition hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #0891B2, #7C3AED)", color: "white", boxShadow: "0 8px 22px -6px rgba(8,145,178,0.4)" }}
                >
                  📖 Editorial blog
                </button>
              </Link>
              <Link href="/films">
                <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                  style={{ background: "white", border: "1px solid rgba(15,23,42,0.08)" }}
                >
                  🎬 20 films
                </button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </PageShell>
  );
}
