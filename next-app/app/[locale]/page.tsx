// Locale-specific homepage — renders the same homepage sections as app/page.tsx
// but with translated hero text, trust badges, and metadata.
// Used for: /th/, /ko/, /lo/, /hi/, /de/, /id/, /ta/
// English stays at app/page.tsx (root, no prefix).

import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, LOCALE_LABELS, type Locale } from "@lib/i18n/routing";
import type { Metadata } from "next";
import { Rocket, ShieldCheck, Lock, UserX, ExternalLink } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { Reveal } from "@components/Reveal";

// Game-changing animation components (client island)
import { AnimatedHero, HeroTypewriter, HeroCounter } from "@components/animations/AnimatedHero";
import { SectionDivider } from "@components/ui/SectionDivider";
import { ProtocolBentoSection } from "@components/sections/ProtocolBentoSection";
import { TokenSpotlightSection } from "@components/sections/TokenSpotlightSection";
import { NumbersSection } from "@components/sections/NumbersSection";
import { TestimonialSection } from "@components/sections/TestimonialSection";
import { HomeGlobalReelsSection } from "@components/sections/HomeGlobalReelsSection";
import { ZoomLiveSection } from "@components/sections/ZoomLiveSection";
import { NewsletterSection } from "@components/sections/NewsletterSection";
import { HomeBlogSection } from "@components/sections/HomeBlogSection";
import { CreativeExplorerSection } from "@components/sections/CreativeExplorerSection";
import { VideoExplainerSection } from "@components/sections/VideoExplainerSection";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return routing.locales
    .filter((l) => l !== "en")
    .map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "meta.home" });

  const languages: Record<string, string> = {
    "x-default": "https://www.turboloop.tech/",
  };
  for (const l of routing.locales) {
    const url =
      l === "en"
        ? "https://www.turboloop.tech/"
        : `https://www.turboloop.tech/${l}/`;
    languages[l] = url;
  }

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      // English canonical must be the root URL (no /en/ prefix) — Google
      // treats /en/ and / as different pages, causing a canonical mismatch
      // that suppresses the homepage from search rankings.
      canonical: locale === "en"
        ? "https://www.turboloop.tech/"
        : `https://www.turboloop.tech/${locale}/`,
      languages,
    },
  };
}

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "home" });
  const localeInfo = LOCALE_LABELS[locale as Locale];

  const TRUST_BADGES = [
    {
      icon: ShieldCheck,
      label: t("trust.audited"),
      href: "https://solidityscan.com/quickscan/0xc90E5785632dAaB9Cb61F5050dA393090541A76D/bsc",
    },
    {
      icon: Lock,
      label: t("trust.lpLocked"),
      href: "https://bscscan.com/address/0x4f31Fa980a675570939B737Ebdde0471a4Be40Eb#tokentxns",
    },
    {
      icon: UserX,
      label: t("trust.renounced"),
      href: "https://bscscan.com/tx/0x848bc42ca79e20a2f0039407b5d077b8d89efcfd414e88a16f1161263746056e",
    },
    {
      icon: ExternalLink,
      label: t("trust.bscscan"),
      href: "https://bscscan.com/address/0xc90e5785632daab9cb61f5050da393090541a76d",
    },
  ];

  return (
    <main>
      {/* Background aurora */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 800px 600px at 15% 12%, rgba(34,211,238,0.10), transparent 60%), " +
            "radial-gradient(ellipse 700px 500px at 88% 92%, rgba(167,139,250,0.08), transparent 60%), " +
            "radial-gradient(ellipse 500px 400px at 95% 45%, rgba(34,211,238,0.05), transparent 60%)",
        }}
      />

      {/* HERO */}
      <section className="relative pt-20 pb-20 md:pt-36 md:pb-32 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background layers — particle field + orbital + gradient mesh blobs */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 hero-grid-bg opacity-50" />
          <div className="absolute inset-0 hero-glow" />
          {/* Animated gradient mesh blobs */}
          <div className="absolute top-[5%] left-[5%] w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-[100px] mesh-blob" />
          <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-purple-500/8 blur-[100px] mesh-blob-2" />
          <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[80px] mesh-blob-3" />
          {/* Particle constellation + 3D orbital ring (client island) */}
          <AnimatedHero phrases={[]} />
        </div>

        <Container width="wide">
          <div className="relative text-center max-w-3xl mx-auto">
            {/* Live status pill — staggered entrance */}
            <div className="hero-animate-1 inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-[var(--c-surface)]/80 border border-[var(--c-border)] shadow-[var(--s-sm)] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <Heading tier="eyebrow" as="span" className="text-emerald-600 dark:text-emerald-400">
                {t("liveStatus")}
              </Heading>
            </div>

            {/* Hero wordmark — dramatic entrance */}
            <div className="hero-animate-2">
              <Heading tier="display" className="mb-6">
                <span>Turbo </span>
                <span className="text-brand-wide">Loop</span>
              </Heading>
            </div>

            {/* Typewriter subtitle */}
            <div className="hero-animate-3 text-lg md:text-xl text-[var(--c-text-muted)] mb-10 leading-relaxed max-w-2xl mx-auto h-[3.5rem] md:h-[2rem] flex items-center justify-center">
              <HeroTypewriter
                phrases={[
                  `${t("heroTaglinePart1")} ${t("heroTaglinePart2")}`,
                  `${t("heroTaglinePart3")}`,
                  "Earn up to 54% ROI in 60 days.",
                  "Audited. LP-locked. Ownership renounced.",
                ]}
                className="text-[var(--c-text)] font-medium"
              />
            </div>

            {/* CTAs — staggered */}
            <div className="hero-animate-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center max-w-md sm:max-w-none mx-auto mb-4">
              <a
                href="https://turboloop.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] h-[54px] text-base px-8 text-white bg-brand glow-pulse hover:shadow-[var(--s-xl)] hover:scale-[1.02] transition-all duration-300 active:scale-[0.985]"
              >
                {t("launchApp")}
                <Rocket className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="/films"
                className="inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] h-[54px] text-base px-8 bg-[var(--c-surface)]/80 text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:bg-[var(--c-bg)] hover:shadow-[var(--s-md)] hover:border-[var(--c-border-strong)] transition-all duration-300 active:scale-[0.985] backdrop-blur-md"
              >
                {t("watchFilms")}
              </a>
            </div>

            <a
              href="/submit"
              className="hero-animate-4 inline-block text-sm text-[var(--c-text-muted)] hover:text-[var(--c-brand-cyan)] underline decoration-[var(--c-border)] underline-offset-4 transition"
            >
              {t("shareStory")}
            </a>

            {/* Hero stats row — animated counters */}
            <div className="hero-animate-5 grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 mb-4">
              <div className="text-center p-4 rounded-xl bg-[var(--c-surface)]/50 backdrop-blur-sm border border-[var(--c-border)]/50">
                <HeroCounter end={54} suffix="%" className="stat-highlight" />
                <div className="text-xs font-medium text-[var(--c-text-muted)] mt-1">Max ROI</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[var(--c-surface)]/50 backdrop-blur-sm border border-[var(--c-border)]/50">
                <HeroCounter end={1} prefix="$" className="stat-highlight" />
                <div className="text-xs font-medium text-[var(--c-text-muted)] mt-1">Min Deposit</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[var(--c-surface)]/50 backdrop-blur-sm border border-[var(--c-border)]/50">
                <HeroCounter end={4} className="stat-highlight" />
                <div className="text-xs font-medium text-[var(--c-text-muted)] mt-1">Loop Plans</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[var(--c-surface)]/50 backdrop-blur-sm border border-[var(--c-border)]/50">
                <div className="stat-highlight">24/7</div>
                <div className="text-xs font-medium text-[var(--c-text-muted)] mt-1">On-chain</div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="hero-animate-6 hidden md:flex flex-col items-center mt-10 text-[var(--c-text-subtle)]">
              <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-2">
                {t("scroll")}
              </span>
              <span className="block w-[1px] h-8 bg-gradient-to-b from-[var(--c-text-subtle)] to-transparent animate-scroll-cue" />
            </div>

            {/* Trust badges — premium glassmorphism */}
            <div className="hero-animate-6 grid grid-cols-2 md:grid-cols-4 gap-3 mt-14">
              {TRUST_BADGES.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group gradient-border-card backdrop-blur-md rounded-[var(--r-xl)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-lg)] hover:-translate-y-1 transition-all duration-300 px-4 py-4 flex items-center gap-3 text-left"
                  style={{
                    background:
                      "color-mix(in oklab, var(--c-surface) 80%, transparent)",
                  }}
                >
                  <span
                    className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 dark:border-cyan-400/20"
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5 text-[var(--c-brand-cyan)]" />
                  </span>
                  <span className="text-xs font-semibold text-[var(--c-text)] leading-tight">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* All other sections are shared (not yet translated) */}
      <Reveal>
        <ProtocolBentoSection />
      </Reveal>
      <SectionDivider />
      {/* Video Explainer — deep dive into how TurboLoop works */}
      <VideoExplainerSection />
      <SectionDivider />
      <Reveal>
        <TokenSpotlightSection />
      </Reveal>
      <SectionDivider />
      <Reveal>
        <NumbersSection />
      </Reveal>
      <Reveal>
        <TestimonialSection />
      </Reveal>
      <Reveal>
        <HomeGlobalReelsSection defaultLang={locale as import("@lib/reelsData").ReelLang} />
      </Reveal>
      <SectionDivider />
      <CreativeExplorerSection defaultLocale={locale} />
      <SectionDivider />
      <Reveal>
        <ZoomLiveSection />
      </Reveal>
      <SectionDivider />
      <Reveal>
        <HomeBlogSection locale={locale} />
      </Reveal>
      <SectionDivider />
      <Reveal>
        <NewsletterSection />
      </Reveal>
    </main>
  );
}
