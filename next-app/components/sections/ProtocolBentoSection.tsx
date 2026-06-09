// ProtocolBentoSection — the whole protocol at a glance.
//
// CSS-grid bento box with 5 blocks:
//   A. The 4 Loop Plans (large — col-span-2 row-span-2 on lg)
//   B. Referral Network (medium)
//   C. Leadership Program (medium)
//   D. Security (small)
//   E. Films Teaser (small)
//
// Server component, zero client JS. Renders at request/ISR time and
// stays static thereafter.
//
// Responsive grid:
//   Mobile  → 1 column stack
//   Tablet  → 2 columns (Block A spans 2)
//   Desktop → 3 columns (Block A spans 2 cols × 2 rows)

import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Crown,
  Network,
  PlayCircle,
} from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { LOOP_PLANS, formatRoi } from "@lib/loopPlans";

// Leadership ranks — public name + order, used by Block C's progression pills.
const LEADERSHIP_RANKS = [
  "Partner",
  "Builder",
  "Accelerator",
  "Director",
  "Executive",
  "Ambassador",
  "Legend",
] as const;

// Films teaser — Season 2, "What is TurboLoop?" canonical film slug.
// If the slug ever moves, update here. Falls back gracefully (the link
// still resolves to /films) if the route 404s.
const TEASER_FILM = {
  slug: "what-is-turboloop",
  posterUrl:
    "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/cinematic/posters/what-is-turboloop.png",
  title: "What is TurboLoop?",
  caption: "New here? Start with this.",
};

export function ProtocolBentoSection() {
  return (
    <section className="py-12 md:py-20">
      <Container width="default">
        <div className="mb-8 md:mb-12 text-center max-w-2xl mx-auto">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-brand-cyan)] mb-3 inline-block"
          >
            The Protocol
          </Heading>
          <Heading tier="h1" as="h2" className="mb-3">
            Every piece. <span className="text-brand-wide">One glance.</span>
          </Heading>
          <p className="text-base md:text-lg text-[var(--c-text-muted)] leading-relaxed">
            Four yield plans. A 20-level referral graph. Seven leadership ranks.
            Audited code. One protocol — built to be inspected, not trusted.
          </p>
        </div>

        {/* The bento. Grid auto-flow dense lets the small blocks fall
            into any gaps the big block leaves on desktop. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 auto-rows-[minmax(0,auto)] [grid-auto-flow:dense]">
          <BlockPlans />
          <BlockReferral />
          <BlockLeadership />
          <BlockSecurity />
          <BlockFilmsTeaser />
        </div>
      </Container>
    </section>
  );
}

// ─── Block A — 4 Loop Plans (large) ───────────────────────────────

function BlockPlans() {
  return (
    <div
      className="relative md:col-span-2 lg:col-span-2 lg:row-span-2 rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] p-5 md:p-7 shadow-[var(--s-sm)] overflow-hidden flex flex-col"
    >
      {/* Brand-gradient wash at 8 % */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{ background: "var(--c-brand-gradient)" }}
      />
      <div className="relative">
        <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-brand-cyan)] mb-2">
          The 4 Loop Plans
        </div>
        <Heading tier="title" as="h3" className="mb-1 text-2xl md:text-3xl">
          Pick a duration. Earn a fixed yield.
        </Heading>
        <p className="text-sm text-[var(--c-text-muted)] mb-5 md:mb-6 max-w-md leading-relaxed">
          ROIs are flat, paid at the end of the plan — no compounding tricks,
          no annualization gymnastics.
        </p>

        {/* 2×2 grid of plan cards. Mobile collapses to single column at the
            cramped end of the viewport, then 2-wide from sm+. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {LOOP_PLANS.map((p) => (
            <Link
              key={p.id}
              href={`/calculator?plan=${p.id}`}
              className="group flex flex-col rounded-[var(--r-lg)] border border-[var(--c-border)] bg-[var(--c-bg)] p-4 md:p-5 min-h-[140px] active:scale-[0.98] transition hover:border-[var(--c-brand-cyan)] hover:shadow-[var(--s-md)]"
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-bold text-[var(--c-text)]">
                  {p.label}
                </span>
                <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--c-text-subtle)] tabular-nums">
                  {p.days}d
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-heading font-bold text-brand-wide leading-none mb-2 tabular-nums">
                {formatRoi(p)}
              </div>
              <p className="text-xs text-[var(--c-text-muted)] leading-snug">
                {p.blurb}
              </p>
              {p.tokenEligible && (
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--c-brand-cyan)]">
                  ⚡ $TURBO bonus
                </span>
              )}
            </Link>
          ))}
        </div>

        <Link
          href="/calculator"
          className="mt-5 md:mt-6 inline-flex items-center gap-1.5 min-h-[48px] text-sm font-bold text-[var(--c-brand-cyan)] hover:underline"
        >
          Calculate your return <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── Block B — Referral Network (medium) ──────────────────────────

function BlockReferral() {
  const facts = [
    "No volume requirements",
    "Fixed percentages",
    "Deepest in DeFi",
  ];
  return (
    <Link
      href="/ecosystem/referral-network"
      className="group flex flex-col rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] p-5 md:p-6 shadow-[var(--s-sm)] min-h-[200px] hover:shadow-[var(--s-md)] hover:border-[var(--c-brand-cyan)] transition"
    >
      <Network
        className="w-7 h-7 text-[var(--c-brand-cyan)] mb-3"
        aria-hidden="true"
      />
      <Heading tier="title" as="h3" className="mb-1 text-xl">
        20 Levels Deep
      </Heading>
      <p className="text-sm text-[var(--c-text-muted)] leading-relaxed mb-4">
        51% of protocol fees distributed to the community.
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {facts.map((f) => (
          <span
            key={f}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--c-bg)] text-[var(--c-text)] border border-[var(--c-border)]"
          >
            {f}
          </span>
        ))}
      </div>
      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-[var(--c-brand-cyan)] group-hover:underline">
        Explore the graph <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );
}

// ─── Block C — Leadership Program (medium) ────────────────────────

function BlockLeadership() {
  return (
    <Link
      href="/ecosystem/leadership-program"
      className="group flex flex-col rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] p-5 md:p-6 shadow-[var(--s-sm)] min-h-[200px] hover:shadow-[var(--s-md)] hover:border-[var(--c-brand-cyan)] transition"
    >
      <Crown
        className="w-7 h-7 text-[var(--c-brand-cyan)] mb-3"
        aria-hidden="true"
      />
      <Heading tier="title" as="h3" className="mb-1 text-xl">
        Partner → Legend
      </Heading>
      <p className="text-sm text-[var(--c-text-muted)] leading-relaxed mb-4">
        7 ranks. Earn from 100 levels of your network.
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {LEADERSHIP_RANKS.map((r, i) => (
          <span
            key={r}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              i === 0
                ? "bg-[var(--c-brand-cyan)]/10 text-[var(--c-brand-cyan)] border-[var(--c-brand-cyan)]/30"
                : i === LEADERSHIP_RANKS.length - 1
                  ? "bg-[var(--c-brand-cyan)] text-white border-[var(--c-brand-cyan)]"
                  : "bg-[var(--c-bg)] text-[var(--c-text-muted)] border-[var(--c-border)]"
            }`}
          >
            {r}
          </span>
        ))}
      </div>
      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-[var(--c-brand-cyan)] group-hover:underline">
        See the rank ladder <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );
}

// ─── Block D — Security (small) ───────────────────────────────────

function BlockSecurity() {
  const chips = ["Audited", "Renounced", "LP Locked"];
  return (
    <Link
      href="/security"
      className="group flex flex-col rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] p-5 md:p-6 shadow-[var(--s-sm)] min-h-[180px] hover:shadow-[var(--s-md)] hover:border-[var(--c-brand-cyan)] transition"
    >
      <ShieldCheck
        className="w-7 h-7 text-emerald-600 mb-3"
        aria-hidden="true"
      />
      <Heading tier="title" as="h3" className="mb-1 text-lg leading-snug">
        Zero vulnerabilities found.
      </Heading>
      <div className="flex flex-wrap gap-1.5 mb-3 mt-2">
        {chips.map((c) => (
          <span
            key={c}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
          >
            {c}
          </span>
        ))}
      </div>
      <p className="text-xs text-[var(--c-text-muted)] mb-4">
        <span className="font-bold text-[var(--c-text)]">$100K bounty</span> unclaimed.
      </p>
      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 group-hover:underline">
        See the proof <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );
}

// ─── Block E — Films Teaser (small) ───────────────────────────────

function BlockFilmsTeaser() {
  return (
    <Link
      href={`/films/${TEASER_FILM.slug}`}
      className="group relative flex flex-col rounded-[var(--r-xl)] overflow-hidden border border-[var(--c-border)] bg-[var(--c-surface)] shadow-[var(--s-sm)] min-h-[180px] hover:shadow-[var(--s-md)] hover:border-[var(--c-brand-cyan)] transition"
    >
      {/* Poster background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${TEASER_FILM.posterUrl})` }}
        aria-hidden="true"
      />
      {/* Dark gradient overlay for caption legibility */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"
        aria-hidden="true"
      />
      <div className="relative mt-auto p-5 md:p-6 text-white flex flex-col">
        <span
          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm mb-3 group-hover:bg-[var(--c-brand-cyan)] transition"
          aria-hidden="true"
        >
          <PlayCircle className="w-7 h-7 text-white" />
        </span>
        <Heading
          tier="title"
          as="h3"
          className="mb-1 text-lg leading-snug text-white"
        >
          {TEASER_FILM.title}
        </Heading>
        <p className="text-xs text-white/80 leading-snug mb-2">
          {TEASER_FILM.caption}
        </p>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white group-hover:underline">
          Watch the film <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
