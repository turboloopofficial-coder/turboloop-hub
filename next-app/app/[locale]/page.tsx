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
      <section className="relative pt-12 pb-12 md:pt-24 md:pb-20">
        <Container width="wide">
          <div className="text-center max-w-3xl mx-auto">
            {/* Live status pill */}
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <Heading tier="eyebrow" as="span" className="text-emerald-700">
                {t("liveStatus")}
              </Heading>
            </div>

            {/* Hero wordmark */}
            <Heading tier="display" className="mb-5">
              <span>Turbo </span>
              <span className="text-brand-wide">Loop</span>
            </Heading>

            <p className="text-lg md:text-xl text-[var(--c-text-muted)] mb-9 leading-relaxed max-w-2xl mx-auto">
              {t("heroTaglinePart1")}{" "}
              <span className="text-[var(--c-text)] font-medium">
                {t("heroTaglinePart2")}
              </span>{" "}
              <span className="text-[var(--c-text)] font-medium">
                {t("heroTaglinePart3")}
              </span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center max-w-md sm:max-w-none mx-auto mb-3">
              <a
                href="https://turboloop.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] h-[52px] text-base px-7 text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
              >
                {t("launchApp")}
                <Rocket className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="/films"
                className="inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] h-[52px] text-base px-7 bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:bg-[var(--c-bg)] hover:shadow-[var(--s-md)] transition active:scale-[0.985]"
              >
                {t("watchFilms")}
              </a>
            </div>
            <a
              href="/submit"
              className="inline-block text-sm text-[var(--c-text-muted)] hover:text-[var(--c-brand-cyan)] underline decoration-[var(--c-border)] underline-offset-4 transition"
            >
              {t("shareStory")}
            </a>

            {/* Scroll indicator */}
            <div className="hidden md:flex flex-col items-center mt-12 text-[var(--c-text-subtle)]">
              <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-2">
                {t("scroll")}
              </span>
              <span className="block w-[1px] h-8 bg-gradient-to-b from-[var(--c-text-subtle)] to-transparent animate-scroll-cue" />
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12">
              {TRUST_BADGES.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block backdrop-blur-sm rounded-[var(--r-xl)] border border-[var(--c-border)] shadow-[var(--s-md)] hover:shadow-[var(--s-lg)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-[var(--m-smooth)] ease-[var(--m-standard)] tl-card-glow px-4 py-3 flex items-center gap-3 text-left"
                  style={{
                    background:
                      "color-mix(in oklab, var(--c-surface) 60%, transparent)",
                  }}
                >
                  <span
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-brand shadow-[var(--s-brand)]"
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5 text-white" />
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
