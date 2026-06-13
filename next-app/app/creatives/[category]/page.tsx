import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import {
  CAMPAIGN_CATEGORIES,
  getCampaignCategory,
  getCampaignCreatives,
  TOTAL_CAMPAIGN_CREATIVES,
} from "@lib/campaignData";
import { CampaignCategoryGrid } from "@components/creatives/CampaignCategoryGrid";

// ── Static params ──────────────────────────────────────────────────────────
export function generateStaticParams() {
  return CAMPAIGN_CATEGORIES.map(cat => ({ category: cat.id }));
}

// ── Metadata ───────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCampaignCategory(category);
  if (!cat) return { title: "Not Found" };

  const title = `${cat.label} Banners — Free DeFi Marketing Kit | TurboLoop`;
  const description = cat.metaDescription;
  const url = `https://www.turboloop.tech/creatives/${cat.id}`;
  const firstImage = getCampaignCreatives(cat.id)[0];

  return {
    title,
    description,
    keywords: cat.keywords.join(", "),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
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
export default async function CampaignCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCampaignCategory(category);
  if (!cat) notFound();

  const items = getCampaignCreatives(cat.id);
  const pageUrl = `https://www.turboloop.tech/creatives/${cat.id}`;

  // ImageGallery structured data — Google Images SEO
  const imageGallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `${cat.label} Marketing Banners — TurboLoop`,
    description: cat.metaDescription,
    url: pageUrl,
    image: items.slice(0, 20).map(item => ({
      "@type": "ImageObject",
      contentUrl: item.url,
      name: item.title,
      description: item.description,
      keywords: item.keywords.join(", "),
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
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGallerySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen bg-[var(--c-bg)] pb-20">
        {/* Breadcrumb nav */}
        <nav
          aria-label="Breadcrumb"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2"
        >
          <ol className="flex items-center gap-1.5 text-xs text-[var(--c-text-subtle)]">
            <li>
              <Link href="/" className="hover:text-[var(--c-text)] transition">
                Home
              </Link>
            </li>
            <li aria-hidden="true"><ChevronRight size={12} /></li>
            <li>
              <Link href="/creatives" className="hover:text-[var(--c-text)] transition">
                Marketing Hub
              </Link>
            </li>
            <li aria-hidden="true"><ChevronRight size={12} /></li>
            <li className="text-[var(--c-text)] font-medium" aria-current="page">
              {cat.label}
            </li>
          </ol>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {/* Back link */}
          <Link
            href="/creatives"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--c-text-subtle)] hover:text-[var(--c-text)] transition mb-6"
          >
            <ArrowLeft size={14} />
            Back to Marketing Hub
          </Link>

          {/* Hero header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="flex items-center justify-center w-12 h-12 rounded-2xl text-2xl shadow-[var(--s-sm)]"
                style={{
                  background: `linear-gradient(135deg, ${cat.accent.from}22, ${cat.accent.to}22)`,
                  border: `1px solid ${cat.accent.from}33`,
                }}
                aria-hidden="true"
              >
                {cat.emoji}
              </span>
              <div>
                <p
                  className="text-xs font-bold tracking-[0.18em] uppercase mb-0.5"
                  style={{ color: cat.accent.from }}
                >
                  Campaign Suite
                </p>
                <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--c-text)]">
                  {cat.label}
                </h1>
              </div>
            </div>
            <p className="text-[var(--c-text-subtle)] max-w-2xl text-sm md:text-base leading-relaxed">
              {cat.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-[var(--c-text-subtle)]">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold"
                style={{
                  color: cat.accent.from,
                  background: `${cat.accent.from}15`,
                }}
              >
                {cat.count} banners
              </span>
              <span>Free to download &amp; share</span>
              <span>No attribution required</span>
            </div>
          </div>

          {/* Grid */}
          <CampaignCategoryGrid items={items} catLabel={cat.label} />

          {/* Related categories */}
          <section className="mt-16 pt-10 border-t border-[var(--c-border)]">
            <h2 className="text-lg font-bold text-[var(--c-text)] mb-6">
              More Campaign Suites
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {CAMPAIGN_CATEGORIES.filter(c => c.id !== cat.id).map(related => (
                <Link
                  key={related.id}
                  href={`/creatives/${related.id}`}
                  className="flex items-center gap-2.5 p-3 rounded-[var(--r-lg)] bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-brand-cyan)] hover:-translate-y-0.5 transition text-sm font-medium text-[var(--c-text)]"
                >
                  <span aria-hidden="true" className="text-base">{related.emoji}</span>
                  <span className="line-clamp-2 leading-tight">{related.label}</span>
                  <span className="ml-auto text-xs text-[var(--c-text-subtle)] shrink-0">
                    {related.count}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* SEO text block */}
          <section className="mt-12 p-6 rounded-[var(--r-xl)] bg-[var(--c-surface)] border border-[var(--c-border)]">
            <h2 className="text-base font-bold text-[var(--c-text)] mb-3">
              About These Banners
            </h2>
            <p className="text-sm text-[var(--c-text-subtle)] leading-relaxed">
              This collection contains <strong>{cat.count} free {cat.label.toLowerCase()} marketing banners</strong> created
              for the TurboLoop DeFi protocol community. All images are free to download, share on Telegram,
              WhatsApp, Twitter/X, and any other social platform. No attribution required. The full
              TurboLoop Marketing Hub contains over {TOTAL_CAMPAIGN_CREATIVES}+ campaign banners across 12 categories,
              plus a branded educational kit in 7 languages.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {cat.keywords.map(kw => (
                <span
                  key={kw}
                  className="px-2.5 py-1 rounded-full text-xs bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text-subtle)]"
                >
                  {kw}
                </span>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
