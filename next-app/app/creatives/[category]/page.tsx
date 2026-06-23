// /creatives/[category] — Category sub-page
// Reuses the unified grid pre-filtered to a single category.
// Full SEO: unique title, description, canonical, og:image, ImageGallery JSON-LD, breadcrumbs.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@components/ui/Container";
import { UnifiedCreativesGrid } from "@components/creatives/UnifiedCreativesGrid";
import { DownloadKitButton } from "@components/creatives/DownloadKitButton";
import {
  ALL_UNIFIED_CREATIVES,
  UNIFIED_CATEGORIES,
} from "@lib/unifiedCreativesData";

// ── Static params ──────────────────────────────────────────────────────────

export function generateStaticParams() {
  return UNIFIED_CATEGORIES.map(cat => ({ category: cat.id }));
}

// ── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = UNIFIED_CATEGORIES.find(c => c.id === category);
  if (!cat) return { title: "Not Found" };

  const items = ALL_UNIFIED_CREATIVES.filter(i => i.categoryId === category);
  const title = `${cat.emoji} ${cat.label} Banners — ${items.length} Free DeFi Images | TurboLoop`;
  const description = `${cat.description} Download all ${items.length} free ${cat.label.toLowerCase()} banners for Telegram, WhatsApp, and social media. No attribution required.`;
  const canonical = `https://www.turboloop.tech/creatives/${category}`;
  const firstImage = items[0];

  return {
    title,
    description,
    keywords: `${cat.label.toLowerCase()} banners, free DeFi marketing, TurboLoop ${cat.label.toLowerCase()}, crypto marketing banners`,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: "TurboLoop",
      images: firstImage
        ? [{ url: firstImage.url, width: 1080, height: 1080, alt: firstImage.alt }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: firstImage ? [firstImage.url] : [],
    },
  };
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = UNIFIED_CATEGORIES.find(c => c.id === category);
  if (!cat) notFound();

  const items = ALL_UNIFIED_CREATIVES.filter(i => i.categoryId === category);
  const pageUrl = `https://www.turboloop.tech/creatives/${category}`;

  // ImageGallery structured data — Google Images SEO
  const imageGallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `${cat.label} Marketing Banners — TurboLoop`,
    description: cat.description,
    url: pageUrl,
    image: items.slice(0, 20).map(item => ({
      "@type": "ImageObject",
      contentUrl: item.url,
      name: item.title,
      description: item.alt,
      license: "https://creativecommons.org/licenses/by/4.0/",
      acquireLicensePage: pageUrl,
    })),
  };

  // BreadcrumbList structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.turboloop.tech" },
      { "@type": "ListItem", position: 2, name: "Marketing Hub", item: "https://www.turboloop.tech/creatives" },
      { "@type": "ListItem", position: 3, name: cat.label, item: pageUrl },
    ],
  };

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

      <main className="min-h-screen bg-[var(--c-bg)] pb-20">
        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <Container width="wide">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 pt-6 pb-0 text-xs text-[var(--c-text-subtle)]"
          >
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-[var(--c-text)] transition">Home</Link>
              </li>
              <li aria-hidden="true"><ChevronRight size={11} /></li>
              <li>
                <Link href="/creatives" className="hover:text-[var(--c-text)] transition">Marketing Hub</Link>
              </li>
              <li aria-hidden="true"><ChevronRight size={11} /></li>
              <li className="text-[var(--c-text)] font-semibold" aria-current="page">
                {cat.label}
              </li>
            </ol>
          </nav>
        </Container>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div className="pt-6 pb-6 border-b border-[var(--c-border)]">
          <Container width="wide">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border"
                style={{
                  background: `linear-gradient(135deg, ${cat.accent.from}20, ${cat.accent.to}20)`,
                  borderColor: `${cat.accent.from}40`,
                }}
                aria-hidden="true"
              >
                {cat.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold tracking-[0.15em] uppercase mb-2"
                  style={{ color: cat.accent.from, background: `${cat.accent.from}15` }}
                >
                  Marketing Hub
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--c-text)] leading-tight">
                  {cat.label}
                </h1>
                <p className="text-sm text-[var(--c-text-subtle)] mt-1.5 max-w-2xl leading-relaxed">
                  {cat.description}
                </p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <p
                    className="text-xs font-bold"
                    style={{ color: cat.accent.from }}
                  >
                    {items.length} free banners · No attribution required
                  </p>
                  <DownloadKitButton
                    categoryId={category}
                    categoryLabel={cat.label}
                    accentColor={cat.accent.from}
                  />
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* ── Unified grid (pre-filtered to this category) ────────────────── */}
        <UnifiedCreativesGrid
          initialItems={items.slice(0, 48)}
          initialTotal={items.length}
          categories={UNIFIED_CATEGORIES}
          initialCategory={category}
        />

        {/* ── Related categories ───────────────────────────────────────────── */}
        <Container width="wide">
          <section className="mt-12 pt-10 border-t border-[var(--c-border)]">
            <h2 className="text-lg font-bold text-[var(--c-text)] mb-6">More Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {UNIFIED_CATEGORIES.filter(c => c.id !== category).slice(0, 8).map(related => (
                <Link
                  key={related.id}
                  href={`/creatives/${related.id}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-brand-cyan)] hover:-translate-y-0.5 transition text-sm font-medium text-[var(--c-text)]"
                >
                  <span aria-hidden="true" className="text-base">{related.emoji}</span>
                  <span className="line-clamp-2 leading-tight flex-1">{related.label}</span>
                  <span className="ml-auto text-xs text-[var(--c-text-subtle)] shrink-0">
                    {ALL_UNIFIED_CREATIVES.filter(i => i.categoryId === related.id).length}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* SEO text block */}
          <section className="mt-8 mb-16 p-6 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)]">
            <h2 className="text-sm font-bold text-[var(--c-text)] mb-2">
              About {cat.label} Banners
            </h2>
            <p className="text-sm text-[var(--c-text-subtle)] leading-relaxed">
              {cat.description} All {items.length} banners are free to download and share on Telegram, WhatsApp, Twitter/X, and any social platform. No attribution required. Designed for the TurboLoop community.
            </p>
            <div className="mt-4">
              <Link
                href="/creatives"
                className="text-xs font-semibold hover:underline transition"
                style={{ color: cat.accent.from }}
              >
                ← Browse all {UNIFIED_CATEGORIES.length} categories
              </Link>
            </div>
          </section>
        </Container>
      </main>
    </>
  );
}
