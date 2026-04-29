// /ecosystem/:slug — single template that renders any of the 6 pillar deep-dives.
// Pulls content from lib/ecosystemPillars.ts.

import { useRoute, Link } from "wouter";
import { ArrowRight, ChevronRight, CheckCircle2 } from "lucide-react";
import PageShell from "@/components/PageShell";
import AnimatedSection from "@/components/AnimatedSection";
import CinematicEmbed from "@/components/sections/CinematicEmbed";
import { getPillar, ECOSYSTEM_PILLARS } from "@/lib/ecosystemPillars";
import { PILLAR_TO_FILM } from "@/lib/cinematicUniverse";

export default function EcosystemPillarPage() {
  const [, params] = useRoute("/ecosystem/:slug");
  const slug = params?.slug || "";
  const pillar = getPillar(slug);

  if (!pillar) {
    return (
      <PageShell
        title="Pillar Not Found"
        description="The ecosystem pillar you're looking for doesn't exist."
        path={`/ecosystem/${slug}`}
        hero={{ label: "Not Found", heading: "Pillar not found", subtitle: "" }}
      >
        <div className="container py-20 text-center">
          <p className="text-slate-500 mb-4">No pillar matches "{slug}".</p>
          <Link href="/ecosystem">
            <button className="text-cyan-600 hover:text-cyan-800 text-sm font-bold">← All pillars</button>
          </Link>
        </div>
      </PageShell>
    );
  }

  // Sibling pillars for "Keep exploring"
  const others = ECOSYSTEM_PILLARS.filter((p) => p.slug !== pillar.slug).slice(0, 3);

  return (
    <PageShell
      title={`${pillar.title} — ${pillar.subtitle}`}
      description={pillar.tagline}
      path={`/ecosystem/${pillar.slug}`}
      breadcrumbLabel={pillar.title}
      hero={{
        label: pillar.subtitle,
        heading: pillar.title,
        subtitle: pillar.tagline,
        palette: [pillar.palette.from, pillar.palette.via, pillar.palette.to],
        emoji: pillar.emoji,
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: `${pillar.title} — ${pillar.subtitle}`,
        description: pillar.tagline,
        url: `https://turboloop.tech/ecosystem/${pillar.slug}`,
      }}
      related={others.map((p) => ({
        label: p.title,
        href: `/ecosystem/${p.slug}`,
        emoji: p.emoji,
        description: p.tagline,
      }))}
    >
      <div className="container max-w-3xl pb-16">
        {/* Sub-breadcrumb back to ecosystem hub */}
        <div className="mb-8 text-xs text-slate-500">
          <Link href="/ecosystem">
            <span className="inline-flex items-center gap-1 hover:text-cyan-700 cursor-pointer">
              <ChevronRight className="w-3 h-3 rotate-180" />
              All ecosystem pillars
            </span>
          </Link>
        </div>

        {/* Companion film — auto-matched per pillar slug */}
        {PILLAR_TO_FILM[pillar.slug] && (
          <div className="mb-8 -mx-4">
            <CinematicEmbed
              slug={PILLAR_TO_FILM[pillar.slug]}
              label="Watch this pillar in 60 seconds"
              compact
            />
          </div>
        )}

        {/* Key facts strip */}
        <AnimatedSection>
          <div
            className="rounded-2xl p-6 mb-10"
            style={{
              background: `linear-gradient(135deg, ${pillar.palette.from}08, ${pillar.palette.via}05)`,
              border: `1px solid ${pillar.palette.from}20`,
            }}
          >
            <div className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: pillar.palette.from }}>
              Key facts
            </div>
            <ul className="space-y-2.5">
              {pillar.facts.map((fact, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: pillar.palette.from }} />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        </AnimatedSection>

        {/* Long-form sections */}
        {pillar.sections.map((section, i) => (
          <AnimatedSection key={i} delay={0.05 + i * 0.04}>
            <section className="mb-10 md:mb-14">
              <h2
                className="relative text-2xl md:text-3xl font-bold text-slate-900 mb-5 leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <span
                  className="absolute -left-5 top-1.5 bottom-1.5 w-1 rounded-full"
                  style={{ background: `linear-gradient(180deg, ${pillar.palette.from}, ${pillar.palette.via})` }}
                />
                {section.heading}
              </h2>
              <p className="text-base md:text-[17px] text-slate-700 leading-[1.8]">{section.body}</p>
            </section>
          </AnimatedSection>
        ))}

        {/* Related blog posts */}
        {pillar.relatedBlogs && pillar.relatedBlogs.length > 0 && (
          <AnimatedSection delay={0.3}>
            <section
              className="mt-14 p-6 md:p-8 rounded-3xl"
              style={{
                background: `linear-gradient(135deg, ${pillar.palette.from}06, ${pillar.palette.via}04)`,
                border: `1px solid ${pillar.palette.from}15`,
              }}
            >
              <div className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: pillar.palette.from }}>
                Read more on the blog
              </div>
              <div className="space-y-2">
                {pillar.relatedBlogs.map((slug) => (
                  <Link key={slug} href={`/blog/${slug}`}>
                    <span className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-white hover:bg-slate-50 transition cursor-pointer border border-slate-100">
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-cyan-700 transition-colors">
                        {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-cyan-700 transition-all" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </AnimatedSection>
        )}
      </div>
    </PageShell>
  );
}
