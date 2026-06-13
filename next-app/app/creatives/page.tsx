// /creatives — TurboLoop Marketing Hub
//
// Three content libraries, cleanly separated:
//   1. Campaign Suite (NEW) — 504 images × 12 categories, each with its own
//      sub-page at /creatives/[category]. Shown as a card grid at the top.
//   2. Branded Library — 175 legacy pillar/myth/product banners (English).
//   3. Language Kit — 65 educational banners × 7 languages = 455 entries.
//
// The Campaign Suite section links out to sub-pages rather than inlining
// all 504 images — keeps the main page fast and each sub-page SEO-indexable.
// The Branded Library + Language Kit remain as the full inline grid below.

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { CategoryGrid } from "@components/creatives/CategoryGrid";
import { CreativesCategoryNav } from "@components/creatives/CreativesCategoryNav";
import { CreativesLanguageTabs } from "@components/creatives/CreativesLanguageTabs";
import {
  ALL_CREATIVES,
  CREATIVE_CATEGORIES,
  BANNER_LANGUAGES,
  isBannerLanguage,
  type BannerLanguage,
  CAMPAIGN_CATEGORIES,
  TOTAL_CAMPAIGN_BANNERS,
} from "@lib/creativesData";
import {
  CAMPAIGN_CATEGORIES,
  TOTAL_CAMPAIGN_CREATIVES,
} from "@lib/campaignData";

// ── Metadata ───────────────────────────────────────────────────────────────

const LANG_META: Partial<Record<BannerLanguage, { title: string; description: string }>> = {
  en: {
    title: "English Banners — Ready to share",
    description: "240 pre-designed English banners with captions. Free for the community.",
  },
  de: {
    title: "Deutsche Banner — Sofort einsatzbereit",
    description: "65 deutsche Werbebanner mit Captions. Kostenlos für die Community.",
  },
  hi: {
    title: "हिन्दी बैनर — शेयर करने के लिए तैयार",
    description: "TurboLoop के लिए 65 हिन्दी बैनर। मुफ़्त शेयरिंग के लिए।",
  },
  id: {
    title: "Banner Indonesia — Siap dibagikan",
    description: "65 banner Bahasa Indonesia dengan caption. Gratis untuk komunitas.",
  },
  fr: {
    title: "Bannières Françaises — Prêtes à partager",
    description: "65 bannières françaises avec légendes. Gratuit pour la communauté.",
  },
  ar: {
    title: "بانرات عربية — جاهزة للمشاركة",
    description: "65 بانر عربي مع تعليقات. مجانًا للمجتمع.",
  },
  es: {
    title: "Banners en Español — Listos para compartir",
    description: "65 banners en español con leyendas. Gratis para la comunidad.",
  },
};

const DEFAULT_TITLE =
  "Marketing Hub — 1,100+ Free DeFi Banners in 7 Languages | TurboLoop";
const DEFAULT_DESCRIPTION =
  "Download 1,100+ free DeFi marketing banners. 12 campaign categories, 7 languages, branded educational kit. Free for the TurboLoop community — no attribution required.";

function ogImageUrl(lang: BannerLanguage | null): string {
  const base = "https://www.turboloop.tech/api/og-banner?type=creatives";
  return lang ? `${base}&lang=${lang}` : base;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const langParam = Array.isArray(lang) ? lang[0] : lang;
  const activeLang: BannerLanguage | null = isBannerLanguage(langParam) ? langParam : null;
  const meta = activeLang ? LANG_META[activeLang] : undefined;
  const title = meta?.title ?? DEFAULT_TITLE;
  const description = meta?.description ?? DEFAULT_DESCRIPTION;
  const canonical = activeLang
    ? `https://www.turboloop.tech/creatives?lang=${activeLang}`
    : "https://www.turboloop.tech/creatives";
  const image = ogImageUrl(activeLang);

  const langAlternates: Record<string, string> = {
    "x-default": "https://www.turboloop.tech/creatives",
  };
  for (const l of BANNER_LANGUAGES) {
    langAlternates[l.code] = `https://www.turboloop.tech/creatives?lang=${l.code}`;
  }

  return {
    title,
    description,
    keywords: "DeFi marketing banners, free crypto banners, TurboLoop marketing kit, passive income banners, blockchain marketing",
    alternates: { canonical, languages: langAlternates },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function CreativesPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const { lang } = await searchParams;
  const langParam = Array.isArray(lang) ? lang[0] : lang;
  const activeLang: BannerLanguage | null = isBannerLanguage(langParam) ? langParam : null;

  const visible = activeLang
    ? ALL_CREATIVES.filter(c => c.language === activeLang)
    : ALL_CREATIVES;

  const langCounts: Partial<Record<BannerLanguage, number>> = {};
  for (const l of BANNER_LANGUAGES) {
    langCounts[l.code] = ALL_CREATIVES.filter(c => c.language === l.code).length;
  }

  const activeCategories = CREATIVE_CATEGORIES.filter(cat =>
    visible.some(c => c.categoryId === cat.id)
  );

  const totalImages = ALL_CREATIVES.length + TOTAL_CAMPAIGN_CREATIVES;

  // ImageGallery structured data for the main page (uses first image of each campaign category)
  const imageGallerySchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "TurboLoop DeFi Marketing Hub — Free Banner Library",
    description: DEFAULT_DESCRIPTION,
    url: "https://www.turboloop.tech/creatives",
    numberOfItems: totalImages,
    itemListElement: CAMPAIGN_CATEGORIES.map((cat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: cat.label,
      url: `https://www.turboloop.tech/creatives/${cat.id}`,
      description: cat.metaDescription,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGallerySchema) }}
      />

      <main className="relative pb-12 md:pb-20">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <PageHero
          eyebrow="Marketing Hub"
          title={`${totalImages.toLocaleString()}+ free banners. Ready to share.`}
          subtitle="Campaign suites, branded pillars, and a 7-language educational kit. Download, share on Telegram or WhatsApp — no attribution required."
        />

        {/* ── Stats bar ─────────────────────────────────────────────────── */}
        <div className="border-y border-[var(--c-border)] bg-[var(--c-surface)]">
          <Container width="wide">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--c-border)] py-0">
              {[
                { label: "Campaign banners", value: TOTAL_CAMPAIGN_CREATIVES.toLocaleString() },
                { label: "Branded library", value: ALL_CREATIVES.length.toLocaleString() },
                { label: "Languages", value: "7" },
                { label: "Categories", value: (CAMPAIGN_CATEGORIES.length + CREATIVE_CATEGORIES.length).toString() },
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

        {/* ── Campaign Suite ────────────────────────────────────────────── */}
        <Container width="wide">
          <section className="mt-12 md:mt-16" aria-labelledby="campaign-suite-heading">
            <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] uppercase text-[var(--c-brand-cyan)] mb-1">
                  New
                </p>
                <h2
                  id="campaign-suite-heading"
                  className="text-xl md:text-2xl font-extrabold text-[var(--c-text)]"
                >
                  Campaign Suite
                </h2>
                <p className="text-sm text-[var(--c-text-subtle)] mt-1 max-w-xl">
                  {TOTAL_CAMPAIGN_CREATIVES} banners across 12 targeted categories — lifestyle, objection handlers, DeFi education, regional markets, and more.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {CAMPAIGN_CATEGORIES.map(cat => (
                <Link
                  key={cat.id}
                  href={`/creatives/${cat.id}`}
                  className="group relative flex flex-col p-4 rounded-[var(--r-xl)] bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-transparent hover:shadow-[var(--s-lg)] hover:-translate-y-1 transition overflow-hidden"
                  style={{
                    ["--cat-from" as any]: cat.accent.from,
                    ["--cat-to" as any]: cat.accent.to,
                  }}
                >
                  {/* Gradient top accent line */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(90deg, ${cat.accent.from}, ${cat.accent.to})`,
                    }}
                  />

                  <span className="text-2xl mb-3" aria-hidden="true">{cat.emoji}</span>
                  <h3 className="text-sm font-bold text-[var(--c-text)] leading-tight mb-1">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-[var(--c-text-subtle)] line-clamp-2 leading-relaxed flex-1">
                    {cat.description}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--c-border)]">
                    <span
                      className="text-xs font-bold"
                      style={{ color: cat.accent.from }}
                    >
                      {cat.count} banners
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-[var(--c-text-subtle)] group-hover:text-[var(--c-text)] group-hover:translate-x-0.5 transition"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Divider ───────────────────────────────────────────────────── */}
          <div className="mt-16 mb-12 flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--c-border)]" />
            <div className="px-4 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-xs font-bold text-[var(--c-text-subtle)] tracking-[0.15em] uppercase">
              Branded Library
            </div>
            <div className="flex-1 h-px bg-[var(--c-border)]" />
          </div>
        </Container>

        {/* ── Language tabs + sticky category nav (existing) ────────────── */}
        <CreativesLanguageTabs
          active={activeLang}
          counts={langCounts}
          total={ALL_CREATIVES.length}
        />

        <CreativesCategoryNav categories={activeCategories} />

        {/* ── Branded Library grid (existing) ───────────────────────────── */}
        <Container width="wide">
          {activeCategories.map(cat => {
            const items = visible.filter(c => c.categoryId === cat.id);
            if (items.length === 0) return null;
            const sectionPalette =
              items[0]?.palette ?? { from: "#0891B2", via: "#22D3EE", to: "#7C3AED" };
            return (
              <section
                key={cat.id}
                className="mb-12 md:mb-16 scroll-mt-20"
                id={cat.id}
              >
                <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
                  <div>
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-2"
                      style={{
                        background: `${sectionPalette.from}15`,
                        color: sectionPalette.from,
                        border: `1px solid ${sectionPalette.from}30`,
                      }}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </div>
                    <Heading tier="h2">
                      {items.length} {items.length === 1 ? "banner" : "banners"}
                    </Heading>
                  </div>
                </div>
                <CategoryGrid items={items} catLabel={cat.label} />
              </section>
            );
          })}

          {/* SEO footer text */}
          <section className="mt-8 p-6 rounded-[var(--r-xl)] bg-[var(--c-surface)] border border-[var(--c-border)]">
            <h2 className="text-base font-bold text-[var(--c-text)] mb-3">
              About the TurboLoop Marketing Hub
            </h2>
            <p className="text-sm text-[var(--c-text-subtle)] leading-relaxed">
              The TurboLoop Marketing Hub is the largest free DeFi marketing resource library, with over{" "}
              <strong>{totalImages.toLocaleString()} free banners</strong> across 12 campaign categories and 7 languages.
              All images are free to download and share on Telegram, WhatsApp, Twitter/X, and any social platform.
              No account required. No attribution needed. The library covers passive income lifestyle, $TURBO tokenomics,
              DeFi education, objection handling, regional markets (Hindi, Nigerian), success stories, buyback &amp; burn proof,
              and more.
            </p>
          </section>
        </Container>
      </main>
    </>
  );
}
