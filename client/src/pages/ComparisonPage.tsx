// /vs/:slug — comparison pages targeting "TurboLoop vs X" search queries.
// Honest framing: we say where the competitor wins too, which builds credibility.

import { useRoute, Link } from "wouter";
import { Check, X, ArrowRight, ChevronRight, ExternalLink } from "lucide-react";
import PageShell from "@/components/PageShell";
import AnimatedSection from "@/components/AnimatedSection";
import { getComparison, COMPARISONS } from "@/lib/comparisons";

export default function ComparisonPage() {
  const [, params] = useRoute("/vs/:slug");
  const slug = params?.slug || "";
  const comparison = getComparison(slug);

  if (!comparison) {
    return (
      <PageShell
        title="Comparison Not Found"
        description="That comparison isn't available yet."
        path={`/vs/${slug}`}
        hero={{ label: "Not Found", heading: "Comparison not available", subtitle: "" }}
      >
        <div className="container py-20 text-center">
          <p className="text-slate-500 mb-6">No comparison found for "{slug}". Available:</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {COMPARISONS.map((c) => (
              <Link key={c.slug} href={`/vs/${c.slug}`}>
                <button className="px-5 py-2.5 rounded-xl text-sm font-bold bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition">
                  vs {c.competitor}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  const others = COMPARISONS.filter((c) => c.slug !== comparison.slug);
  const turboloopWins = comparison.rows.filter((r) => r.turboloopWins).length;

  return (
    <PageShell
      title={`TurboLoop vs ${comparison.competitor} — honest comparison`}
      description={`How TurboLoop and ${comparison.competitor} compare on yield, security, fees, and use case. ${comparison.competitorTagline}.`}
      path={`/vs/${comparison.slug}`}
      breadcrumbLabel={`vs ${comparison.competitor}`}
      hero={{
        label: "Honest Comparison",
        heading: `TurboLoop vs ${comparison.competitor}`,
        subtitle: comparison.competitorTagline,
        palette: ["#0891B2", "#22D3EE", "#7C3AED"],
        emoji: comparison.competitorLogoEmoji,
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: `TurboLoop vs ${comparison.competitor}`,
        description: `Honest comparison of TurboLoop and ${comparison.competitor} on yield, security, fees.`,
        url: `https://turboloop.tech/vs/${comparison.slug}`,
      }}
      related={others.map((c) => ({
        label: `vs ${c.competitor}`,
        href: `/vs/${c.slug}`,
        emoji: c.competitorLogoEmoji,
        description: c.competitorTagline,
      }))}
    >
      <div className="container max-w-3xl pb-16">
        {/* Sub-breadcrumb */}
        <div className="mb-6 text-xs text-slate-500">
          <Link href="/feed">
            <span className="inline-flex items-center gap-1 hover:text-cyan-700 cursor-pointer">
              <ChevronRight className="w-3 h-3 rotate-180" />
              All comparisons + editorial
            </span>
          </Link>
        </div>

        {/* Intro */}
        <AnimatedSection>
          <div className="rounded-2xl p-6 md:p-7 mb-8"
            style={{ background: "linear-gradient(135deg, rgba(8,145,178,0.05), rgba(124,58,237,0.04))", border: "1px solid rgba(8,145,178,0.12)" }}
          >
            <p className="text-base md:text-lg text-slate-700 leading-relaxed">{comparison.intro}</p>
          </div>
        </AnimatedSection>

        {/* Score header */}
        <AnimatedSection delay={0.05}>
          <div className="flex items-center justify-between p-5 rounded-2xl mb-3"
            style={{ background: "white", border: "1px solid rgba(15,23,42,0.06)" }}
          >
            <div className="text-center flex-1">
              <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-cyan-700 mb-1">TurboLoop</div>
              <div className="text-2xl md:text-3xl font-bold text-slate-900">{turboloopWins}</div>
              <div className="text-[10px] text-slate-400">categories favoring TL</div>
            </div>
            <div className="text-3xl text-slate-300 px-4">vs</div>
            <div className="text-center flex-1">
              <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-500 mb-1">{comparison.competitor}</div>
              <div className="text-2xl md:text-3xl font-bold text-slate-900">{comparison.rows.length - turboloopWins}</div>
              <div className="text-[10px] text-slate-400">categories favoring competitor</div>
            </div>
          </div>
        </AnimatedSection>

        {/* Comparison table */}
        <AnimatedSection delay={0.1}>
          <div className="rounded-2xl overflow-hidden mb-8" style={{ border: "1px solid rgba(15,23,42,0.06)" }}>
            {/* Header row */}
            <div className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] bg-slate-50 px-3 sm:px-5 py-3 text-[10px] font-bold tracking-[0.18em] uppercase text-slate-500">
              <div>Category</div>
              <div className="text-cyan-700">TurboLoop</div>
              <div>{comparison.competitor}</div>
            </div>
            {/* Rows */}
            {comparison.rows.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] px-3 sm:px-5 py-4 text-sm gap-2 items-start"
                style={{
                  background: i % 2 === 0 ? "white" : "rgba(248,250,252,0.5)",
                  borderTop: "1px solid rgba(15,23,42,0.05)",
                }}
              >
                <div className="font-bold text-slate-700 text-xs sm:text-sm">{row.category}</div>
                <div className={`flex items-start gap-1.5 ${row.turboloopWins ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                  {row.turboloopWins && <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600" />}
                  <span>{row.turboloop}</span>
                </div>
                <div className={`flex items-start gap-1.5 ${!row.turboloopWins ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                  {!row.turboloopWins && <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600" />}
                  <span>{row.competitor}</span>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Conclusion */}
        <AnimatedSection delay={0.15}>
          <div className="rounded-2xl bg-white p-6 md:p-7 mb-6" style={{ border: "1px solid rgba(15,23,42,0.06)" }}>
            <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-cyan-700 mb-3">Bottom Line</div>
            <p className="text-base md:text-lg text-slate-700 leading-relaxed">{comparison.conclusion}</p>
          </div>
        </AnimatedSection>

        {/* Where competitor wins (credibility builder) */}
        {comparison.whereCompetitorWins && comparison.whereCompetitorWins.length > 0 && (
          <AnimatedSection delay={0.2}>
            <div className="rounded-2xl p-6 md:p-7 mb-8"
              style={{ background: "rgba(15,23,42,0.03)", border: "1px solid rgba(15,23,42,0.08)" }}
            >
              <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-500 mb-3">
                Where {comparison.competitor} is genuinely better
              </div>
              <ul className="space-y-2">
                {comparison.whereCompetitorWins.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                    <X className="w-3.5 h-3.5 mt-1 shrink-0 text-slate-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 mt-4 italic">
                Including this isn't humility — it's how trust is actually built. If a comparison only ever favors one side, that's a sales pitch, not a comparison.
              </p>
            </div>
          </AnimatedSection>
        )}

        {/* CTA */}
        <AnimatedSection delay={0.25}>
          <div className="rounded-3xl p-8 text-center"
            style={{ background: "linear-gradient(135deg, #0F172A, #1E1B4B)", color: "white" }}
          >
            <div className="text-[11px] font-bold tracking-[0.3em] uppercase text-cyan-300 mb-3">Try TurboLoop yourself</div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              Don't take our word for it. Verify it.
            </h3>
            <p className="text-slate-300 mb-6 max-w-md mx-auto leading-relaxed">
              Every claim above is verifiable on BscScan. Every line of code is public. Start with the security audit, then read the math.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/security">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #0891B2, #7C3AED)", color: "white", boxShadow: "0 8px 22px -6px rgba(8,145,178,0.5)" }}
                >
                  Security & audits
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/films/54-percent-real-math">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  🎬 Watch: how 54% works
                </button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </PageShell>
  );
}
