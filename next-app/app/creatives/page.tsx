// /creatives — full branded banner library, fully static.
//
// Two sources, one merged grid:
//   1. Legacy kit: 141 pillar/myth/product banners (all English).
//   2. Language Kit: 65 educational banners × 6 languages = 390
//      (en/hi/id/fr/ar/es), uploaded via scripts/upload-lang-kit.mjs.
//
// Content data (manifests + captions) ships in the bundle — it's just
// text + R2 URLs, small enough not to bloat the build. The actual
// banner images load lazily as they scroll.
//
// Language filter: ?lang=<code> filters the visible grid + adjusts the
// per-category counts. Without the param, "All" is active and every
// banner shows. Tabs are server-rendered Link tags (no client JS).

import type { Metadata } from "next";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import { BannerCard } from "@components/creatives/BannerCard";
import { CreativesCategoryNav } from "@components/creatives/CreativesCategoryNav";
import { CreativesLanguageTabs } from "@components/creatives/CreativesLanguageTabs";
import {
  ALL_CREATIVES,
  CREATIVE_CATEGORIES,
  BANNER_LANGUAGES,
  isBannerLanguage,
  type BannerLanguage,
} from "@lib/creativesData";

// Per-language Metadata for the OG card. Static title/description still
// works for crawlers that hit /creatives without a lang param; the
// generateMetadata below upgrades it when a ?lang= is present so the
// title, description, OG image (via /api/og-banner?type=creatives&lang=)
// and canonical all align with the locale being shared.
//
// The OG image route is now content-aware — it reads the lang-kit
// manifest at request time and renders the current per-language banner
// count. Adding a new banner means the OG image updates on next render;
// no static asset re-upload needed. See app/api/og-banner/route.ts.

const LANG_META: Partial<
  Record<
    BannerLanguage,
    { title: string; description: string }
  >
> = {
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

// Numbers verified against the manifests: 175 legacy banners +
// 455 lang-kit entries (65 × 7 languages) = 630 total. Bump these
// constants when scripts/upload-lang-kit.mjs adds another language.
const DEFAULT_TITLE =
  "Marketing Banners — 630+ Free Designs in 7 Languages | TurboLoop";
const DEFAULT_DESCRIPTION =
  "Download 630+ pre-designed marketing banners with captions. Available in English, German, Hindi, Indonesian, French, Arabic, and Spanish. Free for the TurboLoop community.";

function ogImageUrl(lang: BannerLanguage | null): string {
  // Always hit the www host explicitly. Apex 307s to www, and some OG
  // crawlers (Telegram especially) don't follow redirects on image URLs.
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
  const activeLang: BannerLanguage | null = isBannerLanguage(langParam)
    ? langParam
    : null;
  const meta = activeLang ? LANG_META[activeLang] : undefined;
  const title = meta?.title ?? DEFAULT_TITLE;
  const description = meta?.description ?? DEFAULT_DESCRIPTION;
  const canonical = activeLang
    ? `https://www.turboloop.tech/creatives?lang=${activeLang}`
    : "https://www.turboloop.tech/creatives";
  const image = ogImageUrl(activeLang);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
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

export default async function CreativesPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const { lang } = await searchParams;
  const langParam = Array.isArray(lang) ? lang[0] : lang;
  const activeLang: BannerLanguage | null = isBannerLanguage(langParam)
    ? langParam
    : null;

  // Filter once up front; everything downstream (category counts, section
  // grids) operates against this filtered set so the page reflects the
  // active language end-to-end. Per-language counts for the tab chips are
  // computed against the FULL set so each chip always shows true totals.
  const visible = activeLang
    ? ALL_CREATIVES.filter(c => c.language === activeLang)
    : ALL_CREATIVES;

  const langCounts: Partial<Record<BannerLanguage, number>> = {};
  for (const l of BANNER_LANGUAGES) {
    langCounts[l.code] = ALL_CREATIVES.filter(c => c.language === l.code).length;
  }

  // Categories that have at least one banner in the current filter —
  // hides empty sections (e.g. lang-kit-Hindi has no monthly-projections).
  const activeCategories = CREATIVE_CATEGORIES.filter(cat =>
    visible.some(c => c.categoryId === cat.id)
  );

  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="Branded Library"
        title="Premium banners. Ready to share."
        subtitle="Pre-designed images with captions, grouped by ecosystem pillar. Free to share on Telegram, X, WhatsApp — no attribution required."
      />

      <CreativesLanguageTabs
        active={activeLang}
        counts={langCounts}
        total={ALL_CREATIVES.length}
      />

      <CreativesCategoryNav categories={activeCategories} />

      <Container width="wide">
        {activeCategories.map(cat => {
          const items = visible.filter(c => c.categoryId === cat.id);
          if (items.length === 0) return null;
          // Each banner carries its own palette; sample the first one for
          // the section header tint so each category has a unique accent.
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {items.map(banner => (
                  <BannerCard key={banner.slug} banner={banner} catLabel={cat.label} />
                ))}
              </div>
            </section>
          );
        })}
      </Container>
    </main>
  );
}
