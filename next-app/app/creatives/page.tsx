// /creatives — TurboLoop Marketing Hub
// Unified creative library: 1,400+ banners in one filterable, searchable grid.
// All three libraries (Campaign, Legacy, Lang-Kit) merged into a single pool.
// Mobile-first, sticky filter bar, share + download per card, SEO-optimised.

import type { Metadata } from "next";
import { Container } from "@components/ui/Container";
import { PageHero } from "@components/layout/PageHero";
import { UnifiedCreativesGrid } from "@components/creatives/UnifiedCreativesGrid";
import { getPageLocale } from "@lib/getPageLocale";
import { getTranslations } from "next-intl/server";
import {
  ALL_UNIFIED_CREATIVES,
  UNIFIED_CATEGORIES,
  TOTAL_CREATIVES,
  TOTAL_CATEGORIES,
  type CreativeLanguage,
} from "@lib/unifiedCreativesData";

// Maps next-intl locale code → CreativeLanguage for auto-selecting the language tab.
const LOCALE_TO_CREATIVE_LANG: Record<string, CreativeLanguage> = {
  en: "en", hi: "hi", id: "id", fr: "fr", ar: "ar", es: "es",
  de: "de", zh: "zh", it: "it", ur: "ur", pcm: "pcm", th: "th",
  ko: "ko", lo: "lo", ta: "ta", bn: "bn", tr: "tr",
  ja: "ja", pt: "pt", ru: "ru", vi: "vi", tl: "tl", ms: "ms",
};

// First page of items for SSR — avoids serialising all 1,400+ items into HTML.
// The UnifiedCreativesGrid fetches subsequent pages from /api/creatives.
const INITIAL_ITEMS = ALL_UNIFIED_CREATIVES.slice(0, 48);

// ── Metadata ───────────────────────────────────────────────────────────────

const TITLE = "Marketing Hub — 3,800+ Free DeFi Banners in 23 Languages | TurboLoop";
const DESCRIPTION =
  "Download 3,800+ free DeFi marketing banners. 23 languages, campaign suites, branded educational kit. Free for the TurboLoop community — no attribution required.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "DeFi marketing banners, free crypto banners, TurboLoop marketing kit, passive income banners, blockchain marketing, free defi images, turboloop creatives",
  alternates: {
    canonical: "https://www.turboloop.tech/creatives",
    languages: {
      "x-default": "https://www.turboloop.tech/creatives",
    },
  },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://www.turboloop.tech/creatives",
    images: [
      {
        url: "https://www.turboloop.tech/api/og-banner?type=creatives",
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://www.turboloop.tech/api/og-banner?type=creatives"],
  },
};

// ── Structured data ────────────────────────────────────────────────────────

const imageGallerySchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "TurboLoop DeFi Marketing Hub — Free Banner Library",
  description: DESCRIPTION,
  url: "https://www.turboloop.tech/creatives",
  numberOfItems: TOTAL_CREATIVES,
  itemListElement: UNIFIED_CATEGORIES.slice(0, 20).map((cat, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: cat.label,
    url: `https://www.turboloop.tech/creatives/${cat.id}`,
    description: cat.description,
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.turboloop.tech" },
    { "@type": "ListItem", position: 2, name: "Marketing Hub", item: "https://www.turboloop.tech/creatives" },
  ],
};

// ── Page ───────────────────────────────────────────────────────────────────

export default async function CreativesPage() {
  const locale = await getPageLocale();
  const t = await getTranslations({ locale, namespace: "creatives" });
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGallerySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="relative min-h-screen">
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <PageHero
          eyebrow={t("eyebrow")}
          title={`${TOTAL_CREATIVES.toLocaleString()}+ free banners. Ready to share.`}
          subtitle={t("subtitle")}
        />

        {/* ── Stats bar ───────────────────────────────────────────────────── */}
        <div className="border-y border-[var(--c-border)] bg-[var(--c-surface)]">
          <Container width="wide">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--c-border)]">
              {[
                { label: "Total banners", value: TOTAL_CREATIVES.toLocaleString() + "+" },
                { label: "Categories", value: TOTAL_CATEGORIES.toString() },
                { label: "Languages", value: "17" },
                { label: "Free to share", value: "100%" },
              ].map(stat => (
                <div key={stat.label} className="px-4 md:px-8 py-4 text-center">
                  <div className="text-xl md:text-2xl font-extrabold text-[var(--c-text)]">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[var(--c-text-subtle)] mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </Container>
        </div>

        {/* ── Unified grid (full-width, no container — grid has its own padding) */}
        <UnifiedCreativesGrid
          initialItems={INITIAL_ITEMS}
          initialTotal={TOTAL_CREATIVES}
          categories={UNIFIED_CATEGORIES}
          categoryNavMode={true}
          initialLang={LOCALE_TO_CREATIVE_LANG[locale] ?? "all"}
        />

        {/* ── SEO footer ──────────────────────────────────────────────────── */}
        <Container width="wide">
          <section className="mt-8 mb-16 p-6 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)]">
            <h2 className="text-base font-bold text-[var(--c-text)] mb-3">
              About the TurboLoop Marketing Hub
            </h2>
            <p className="text-sm text-[var(--c-text-subtle)] leading-relaxed">
              The TurboLoop Marketing Hub is the largest free DeFi marketing resource library, with over{" "}
              <strong>{TOTAL_CREATIVES.toLocaleString()} free banners</strong> across {TOTAL_CATEGORIES} categories and 23 languages.
              All images are free to download and share on Telegram, WhatsApp, Twitter/X, and any social platform.
              Categories include passive income lifestyle, $TURBO token education, referral system explainers, DeFi objection handlers,
              regional market banners (Hindi, Nigerian, Spanish, Indonesian, Chinese, Italian, Arabic, Urdu, German, Japanese, Portuguese, Russian, Vietnamese, Filipino, Malay), success stories, DeFi education, urgency and FOMO content,
              buyback and burn proof, comparison charts, and community content.
            </p>
            <p className="text-sm text-[var(--c-text-subtle)] leading-relaxed mt-3">
              All banners are designed for Telegram, WhatsApp, and social media. No attribution required.
              New banners are added regularly. Filter by category or language to find the right banner for your audience.
            </p>
          </section>
        </Container>
      </main>
    </>
  );
}
