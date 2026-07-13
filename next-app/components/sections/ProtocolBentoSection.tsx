// ProtocolBentoSection — the whole protocol at a glance.
// Fully i18n via next-intl getTranslations (async server component).
import Link from "next/link";
import { ArrowRight, ShieldCheck, Crown, Network, PlayCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { LOOP_PLANS, formatRoi } from "@lib/loopPlans";

const TEASER_FILM = {
  slug: "what-is-turboloop",
  posterUrl:
    "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/cinematic/posters/what-is-turboloop.png",
};

export async function ProtocolBentoSection() {
  const t = await getTranslations("protocol");

  const LEADERSHIP_RANKS = [
    t("leadership.ranks.partner"),
    t("leadership.ranks.builder"),
    t("leadership.ranks.accelerator"),
    t("leadership.ranks.director"),
    t("leadership.ranks.executive"),
    t("leadership.ranks.ambassador"),
    t("leadership.ranks.legend"),
  ];

  return (
    <section className="section-premium">
      <Container width="default">
        {/* Section header */}
        <div className="mb-8 md:mb-12 text-center max-w-2xl mx-auto">
          <Heading tier="eyebrow" className="text-[var(--c-brand-cyan)] mb-3 inline-block">
            {t("eyebrow")}
          </Heading>
          <Heading tier="h1" as="h2" className="mb-3">
            {t("title")} <span className="text-brand-wide">{t("titleHighlight")}</span>
          </Heading>
          <p className="text-base md:text-lg text-[var(--c-text-muted)] leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 auto-rows-[minmax(0,auto)] [grid-auto-flow:dense]">

          {/* Block A — 4 Loop Plans (large) */}
          <div className="relative md:col-span-2 lg:col-span-2 lg:row-span-2 rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] p-5 md:p-7 shadow-[var(--s-sm)] overflow-hidden flex flex-col">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-[0.08]" style={{ background: "var(--c-brand-gradient)" }} />
            <div className="relative">
              <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-brand-cyan)] mb-2">
                {t("plans.eyebrow")}
              </div>
              <Heading tier="title" as="h3" className="mb-1 text-2xl md:text-3xl">
                {t("plans.title")}
              </Heading>
              <p className="text-sm text-[var(--c-text-muted)] mb-5 md:mb-6 max-w-md leading-relaxed">
                {t("plans.subtitle")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {LOOP_PLANS.map((p) => (
                  <Link
                    key={p.id}
                    href={`/calculator?plan=${p.id}`}
                    className={`group relative gradient-border-card flex flex-col rounded-[var(--r-lg)] border border-[var(--c-border)] bg-[var(--c-bg)] p-4 md:p-5 min-h-[140px] active:scale-[0.98] transition-all duration-300 hover:border-[var(--c-brand-cyan)] hover:shadow-[var(--s-lg)] hover:-translate-y-0.5 ${p.id === 'power' ? 'ring-1 ring-[var(--c-brand-cyan)]/30' : ''}`}
                  >
                    {p.id === 'power' && <span className="badge-popular">Most Popular</span>}
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm font-bold text-[var(--c-text)]">{p.label}</span>
                      <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--c-text-subtle)] tabular-nums">{p.days}d</span>
                    </div>
                    <div className="text-3xl md:text-4xl font-heading font-bold text-brand-wide leading-none mb-2 tabular-nums">
                      {formatRoi(p)}
                    </div>
                    <p className="text-xs text-[var(--c-text-muted)] leading-snug">{p.blurb}</p>
                    {p.tokenEligible && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--c-brand-cyan)]">
                        ⚡ {t("plans.turboBonusLabel")}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
              <Link href="/calculator" className="mt-5 md:mt-6 inline-flex items-center gap-1.5 min-h-[48px] text-sm font-bold text-[var(--c-brand-cyan)] hover:underline">
                {t("plans.calculateReturn")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Block B — Referral Network */}
          <Link href="/ecosystem/referral-network" className="group gradient-border-card flex flex-col rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] p-5 md:p-6 shadow-[var(--s-sm)] min-h-[200px] hover:shadow-[var(--s-lg)] hover:border-[var(--c-brand-cyan)] hover:-translate-y-0.5 transition-all duration-300">
            <Network className="w-7 h-7 text-[var(--c-brand-cyan)] mb-3" aria-hidden="true" />
            <Heading tier="title" as="h3" className="mb-1 text-xl">{t("referral.title")}</Heading>
            <p className="text-sm text-[var(--c-text-muted)] leading-relaxed mb-4">{t("referral.subtitle")}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {[t("referral.fact1"), t("referral.fact2"), t("referral.fact3")].map((f) => (
                <span key={f} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--c-bg)] text-[var(--c-text)] border border-[var(--c-border)]">{f}</span>
              ))}
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-[var(--c-brand-cyan)] group-hover:underline">
              {t("referral.cta")} <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          {/* Block C — Leadership */}
          <Link href="/ecosystem/leadership-program" className="group gradient-border-card flex flex-col rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] p-5 md:p-6 shadow-[var(--s-sm)] min-h-[200px] hover:shadow-[var(--s-lg)] hover:border-[var(--c-brand-cyan)] hover:-translate-y-0.5 transition-all duration-300">
            <Crown className="w-7 h-7 text-[var(--c-brand-cyan)] mb-3" aria-hidden="true" />
            <Heading tier="title" as="h3" className="mb-1 text-xl">{t("leadership.title")}</Heading>
            <p className="text-sm text-[var(--c-text-muted)] leading-relaxed mb-4">{t("leadership.subtitle")}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {LEADERSHIP_RANKS.map((r, i) => (
                <span key={r} className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  i === 0 ? "bg-[var(--c-brand-cyan)]/10 text-[var(--c-brand-cyan)] border-[var(--c-brand-cyan)]/30"
                  : i === LEADERSHIP_RANKS.length - 1 ? "bg-[var(--c-brand-cyan)] text-white border-[var(--c-brand-cyan)]"
                  : "bg-[var(--c-bg)] text-[var(--c-text-muted)] border-[var(--c-border)]"
                }`}>{r}</span>
              ))}
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-[var(--c-brand-cyan)] group-hover:underline">
              {t("leadership.cta")} <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          {/* Block D — Security */}
          <Link href="/security" className="group gradient-border-card flex flex-col rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] p-5 md:p-6 shadow-[var(--s-sm)] min-h-[180px] hover:shadow-[var(--s-lg)] hover:border-[var(--c-brand-cyan)] hover:-translate-y-0.5 transition-all duration-300">
            <ShieldCheck className="w-7 h-7 text-emerald-600 mb-3" aria-hidden="true" />
            <Heading tier="title" as="h3" className="mb-1 text-lg leading-snug">{t("security.title")}</Heading>
            <div className="flex flex-wrap gap-1.5 mb-3 mt-2">
              {[t("security.chip1"), t("security.chip2"), t("security.chip3")].map((c) => (
                <span key={c} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">{c}</span>
              ))}
            </div>
            <p className="text-xs text-[var(--c-text-muted)] mb-4">
              <span className="font-bold text-[var(--c-text)]">{t("security.bounty")}</span>{" "}{t("security.bountyUnclaimed")}
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400 group-hover:underline">
              {t("security.cta")} <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          {/* Block E — Films Teaser */}
          <Link href={`/films/${TEASER_FILM.slug}`} className="group relative flex flex-col rounded-[var(--r-xl)] overflow-hidden border border-[var(--c-border)] bg-[var(--c-surface)] shadow-[var(--s-sm)] min-h-[180px] hover:shadow-[var(--s-lg)] hover:border-[var(--c-brand-cyan)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${TEASER_FILM.posterUrl})` }} aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" aria-hidden="true" />
            <div className="relative mt-auto p-5 md:p-6 text-white flex flex-col">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm mb-3 group-hover:bg-[var(--c-brand-cyan)] transition" aria-hidden="true">
                <PlayCircle className="w-7 h-7 text-white" />
              </span>
              <Heading tier="title" as="h3" className="mb-1 text-lg leading-snug text-white">{t("films.title")}</Heading>
              <p className="text-xs text-white/80 leading-snug mb-2">{t("films.caption")}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white group-hover:underline">
                {t("films.cta")} <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

        </div>
      </Container>
    </section>
  );
}
