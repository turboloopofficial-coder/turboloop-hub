// Shared page wrapper for dedicated pages (/security, /community, /creatives, /roadmap, etc.)
// Provides: navbar, breadcrumb, page hero strip, the page content, related-pages CTA strip,
// footer, scroll-to-top, reading progress bar (optional).

import { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import BackToTop from "@/components/BackToTop";
import BackgroundEffects from "@/components/BackgroundEffects";
import ScrollProgress from "@/components/ScrollProgress";
import SEOHead from "@/components/SEOHead";
import SharePagePill from "@/components/SharePagePill";

type RelatedLink = {
  label: string;
  href: string;
  emoji: string;
  description?: string;
};

type Props = {
  /** Page title shown in <title> + breadcrumb */
  title: string;
  /** Meta description */
  description: string;
  /** Path for canonical/OG (e.g. "/security") */
  path: string;
  /** Optional JSON-LD */
  jsonLd?: Record<string, any>;

  /** Hero strip — gradient + label + heading + subtitle */
  hero: {
    label: string;
    heading: string;
    subtitle?: string;
    /** Hex stops, e.g. ["#0891B2", "#22D3EE", "#7C3AED"] */
    palette?: [string, string, string];
    /** Big emoji watermark on the right */
    emoji?: string;
  };

  /** Optional breadcrumb name (defaults to title) */
  breadcrumbLabel?: string;

  /** Children = page content */
  children: ReactNode;

  /** "Keep exploring" links at the bottom */
  related?: RelatedLink[];
};

const DEFAULT_PALETTE: [string, string, string] = [
  "#0891B2",
  "#22D3EE",
  "#7C3AED",
];

export default function PageShell({
  title,
  description,
  path,
  jsonLd,
  hero,
  breadcrumbLabel,
  children,
  related,
}: Props) {
  const palette = hero.palette || DEFAULT_PALETTE;

  // Build a BreadcrumbList by default so every PageShell page has one without
  // each page repeating the boilerplate. If the page passes a jsonLd of its
  // own, we merge it into a @graph alongside the breadcrumbs.
  const SITE_ORIGIN = "https://turboloop.tech";
  const breadcrumbList = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_ORIGIN,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: breadcrumbLabel || title,
        item: `${SITE_ORIGIN}${path}`,
      },
    ],
  };
  const mergedJsonLd = jsonLd
    ? // If the page already used @graph, append breadcrumbs to it; otherwise
      // wrap both in a new @graph
      Array.isArray((jsonLd as any)["@graph"])
      ? { ...jsonLd, "@graph": [...(jsonLd as any)["@graph"], breadcrumbList] }
      : { "@context": "https://schema.org", "@graph": [jsonLd, breadcrumbList] }
    : { "@context": "https://schema.org", "@graph": [breadcrumbList] };

  return (
    <div className="min-h-screen relative" style={{ background: "#F7F8FC" }}>
      <SEOHead
        title={`${title} | Turbo Loop`}
        description={description}
        path={path}
        type="website"
        jsonLd={mergedJsonLd}
      />
      <ScrollProgress />
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10">
        {/* Breadcrumb + Share */}
        <div className="container pt-24 md:pt-28">
          <div className="flex flex-col items-start gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs text-slate-400"
            >
              <Link href="/">
                <span className="hover:text-slate-700 cursor-pointer">
                  Home
                </span>
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-600">{breadcrumbLabel || title}</span>
            </nav>
            <SharePagePill path={path} title={hero.heading} />
          </div>
        </div>

        {/* Hero strip */}
        <section className="container pb-10 md:pb-14">
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 50%, ${palette[2]} 100%)`,
              boxShadow: `0 30px 60px -20px ${palette[0]}40`,
            }}
          >
            {/* Grid + decorative */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            {hero.emoji && (
              <div
                className="absolute -right-4 -bottom-12 select-none pointer-events-none"
                style={{
                  fontSize: "16rem",
                  lineHeight: 1,
                  opacity: 0.85,
                  filter: "drop-shadow(0 8px 30px rgba(0,0,0,0.2))",
                }}
              >
                {hero.emoji}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

            <div className="relative px-6 md:px-12 py-14 md:py-20 max-w-3xl">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 backdrop-blur-sm"
                style={{ background: "rgba(255,255,255,0.95)" }}
              >
                <span
                  className="text-[10px] font-bold tracking-[0.25em] uppercase"
                  style={{ color: palette[0] }}
                >
                  {hero.label}
                </span>
              </div>
              <h1
                className="text-4xl md:text-6xl font-bold text-white leading-[1.05] mb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {hero.heading}
              </h1>
              {hero.subtitle && (
                <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  {hero.subtitle}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Page content */}
        {children}

        {/* Keep exploring */}
        {related && related.length > 0 && (
          <section className="container py-16 md:py-20">
            <div className="text-center mb-10">
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-slate-500">
                Keep exploring
              </span>
              <h2
                className="text-2xl md:text-3xl font-bold text-slate-900 mt-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Where to next?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {related.map(r => (
                <Link key={r.href} href={r.href}>
                  <div
                    className="group cursor-pointer p-6 rounded-2xl transition-all hover:-translate-y-1"
                    style={{
                      background: "white",
                      border: "1px solid rgba(15,23,42,0.06)",
                      boxShadow: "0 4px 14px -4px rgba(15,23,42,0.06)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow =
                        "0 16px 30px -10px rgba(8,145,178,0.2)";
                      e.currentTarget.style.borderColor =
                        "rgba(8,145,178,0.25)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow =
                        "0 4px 14px -4px rgba(15,23,42,0.06)";
                      e.currentTarget.style.borderColor = "rgba(15,23,42,0.06)";
                    }}
                  >
                    <div className="text-3xl mb-3">{r.emoji}</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-cyan-700 transition-colors">
                      {r.label}
                    </h3>
                    {r.description && (
                      <p className="text-sm text-slate-500 leading-relaxed mb-3">
                        {r.description}
                      </p>
                    )}
                    <div className="inline-flex items-center gap-1 text-sm font-bold text-cyan-700">
                      Open{" "}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
