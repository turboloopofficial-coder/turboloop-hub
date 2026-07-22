// /blog (alias /feed) — editorial index. Build-time fetch from the
// existing tRPC API at api.turboloop.tech. Posts are rendered as static
// HTML; revalidates every 5 minutes (ISR) so newly-published posts
// surface within minutes without redeploying.
//
// Cover images use blogCoverUrl() — author cover when set, otherwise the
// generated og-banner PNG. The date strip uses scheduledPublishAt and
// hides itself rather than printing a meaningless bulk-seed date.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import {
  api,
  blogCoverUrl,
  blogDisplayDate,
  BLOG_LANGUAGES,
  type BlogLanguage,
  type BlogPostSummary,
} from "@lib/api";
import { LANGUAGE_ORDER } from "@lib/languages";
import { BlogLanguageTabs } from "@components/blog/BlogLanguageTabs";

export const revalidate = 300; // 5 min

const BLOG_OG_TITLE = "DeFi Blog & Editorial — Yield Farming Insights | TurboLoop";
const BLOG_OG_DESC =
  "Deep dives on DeFi, yield generation, smart contract security, and the TurboLoop ecosystem. Plain English. No fluff.";
const BLOG_OG_IMAGE =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-blog.png";

export const metadata: Metadata = {
  title: BLOG_OG_TITLE,
  description: BLOG_OG_DESC,
  alternates: { canonical: "https://www.turboloop.tech/blog" },
  openGraph: {
    type: "website",
    title: BLOG_OG_TITLE,
    description: BLOG_OG_DESC,
    url: "https://www.turboloop.tech/blog",
    images: [
      { url: BLOG_OG_IMAGE, width: 1200, height: 630, alt: BLOG_OG_TITLE },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BLOG_OG_TITLE,
    description: BLOG_OG_DESC,
    images: [BLOG_OG_IMAGE],
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isBlogLanguage(v: string | undefined): v is BlogLanguage {
  // Dynamic check — automatically includes any language added to languages.ts.
  return v !== undefined && (LANGUAGE_ORDER as readonly string[]).includes(v);
}

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const { lang } = await searchParams;
  const langParam = Array.isArray(lang) ? lang[0] : lang;
  // Default `/blog` to English. `?lang=all` is the explicit opt-in
  // for the mixed view — keeps newcomers from landing on a Hindi or
  // German excerpt as their first impression of the editorial surface.
  const activeLang: BlogLanguage | null =
    langParam === "all"
      ? null
      : isBlogLanguage(langParam)
        ? langParam
        : "en";

  // Perf fix (2026-07-22): instead of fetching all 4,700+ posts (6 MB, 7-13s),
  // we now make two small targeted requests:
  //   1. blogPostsCounts — tiny aggregation (~200 bytes) for tab chip counts
  //   2. blogPostsByLanguage — posts for the active language only (~50-200 KB)
  // Both are CDN-cached for 5 min (s-maxage=300) so repeat visitors get <100ms.
  let posts: BlogPostSummary[] = [];
  const counts: Partial<Record<BlogLanguage, number>> = {};
  try {
    const [langCounts, langPosts] = await Promise.all([
      api.blogPostsCounts(),
      activeLang
        ? api.blogPostsByLanguage({ language: activeLang })
        : api.blogPostsList().then(p => p.filter(post => post.published)),
    ]);
    // Build counts map from the aggregation result
    for (const row of langCounts) {
      if (row.language) counts[row.language as BlogLanguage] = row.count;
    }
    posts = langPosts;
  } catch {
    // API unavailable — render empty state, do NOT crash.
    posts = [];
  }

  // Newest-first ordering by intended publish date when present, falling
  // back to createdAt for posts without a schedule.
  const sorted = posts.slice().sort((a, b) => {
    const aT = new Date(a.scheduledPublishAt ?? a.createdAt).getTime();
    const bT = new Date(b.scheduledPublishAt ?? b.createdAt).getTime();
    return bT - aT;
  });

  const [featured, ...rest] = sorted;
  const featuredDate = featured ? blogDisplayDate(featured) : null;

  return (
    <main className="relative pb-12 md:pb-20">
      {/* JSON-LD: CollectionPage structured data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: BLOG_OG_TITLE,
            description: BLOG_OG_DESC,
            url: "https://www.turboloop.tech/blog",
            image: BLOG_OG_IMAGE,
            publisher: {
              "@type": "Organization",
              name: "TurboLoop",
              url: "https://www.turboloop.tech",
              logo: {
                "@type": "ImageObject",
                url: "https://www.turboloop.tech/icon.png",
              },
            },
          }),
        }}
      />
      <section className="pt-12 pb-8 md:pt-20 md:pb-12">
        <Container width="default">
          <div className="text-center max-w-2xl mx-auto">
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-3 inline-block"
            >
              Editorial
            </Heading>
            <Heading tier="display" className="mb-4">
              Read{" "}
              <span className="text-brand-wide">deeper.</span>
            </Heading>
            <p className="text-lg text-[var(--c-text-muted)] leading-relaxed">
              {sorted.length} long-form articles on DeFi, yield, security,
              and the math behind the protocol.
            </p>
          </div>
        </Container>
      </section>

      <Container width="wide">
        <BlogLanguageTabs
          active={activeLang}
          counts={counts}
          total={Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0)}
        />

        {/* Featured (most recent) */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group block rounded-[var(--r-2xl)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-lg)] hover:shadow-[var(--s-xl)] transition mb-10 md:mb-14 active:scale-[0.99]"
          >
            <div className="md:flex md:items-stretch">
              <div
                className="relative md:flex-1 md:max-w-[55%] bg-[var(--c-bg)]"
                style={{ aspectRatio: "16 / 10" }}
              >
                <Image
                  src={blogCoverUrl(featured)}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                  unoptimized={!featured.coverImage}
                />
              </div>
              <div className="p-6 md:p-10 md:flex-1 md:flex md:flex-col md:justify-center">
                <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-brand-cyan)] mb-3">
                  Featured{featuredDate ? ` · ${formatDate(featuredDate)}` : ""}
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-[var(--c-text)] leading-tight tracking-tight mb-3">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-base md:text-lg text-[var(--c-text-muted)] leading-relaxed mb-4 line-clamp-3">
                    {featured.excerpt}
                  </p>
                )}
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--c-brand-cyan)]">
                  Read article →
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Rest of posts as a grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {rest.map(post => {
            const displayDate = blogDisplayDate(post);
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block rounded-[var(--r-xl)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-md)] hover:shadow-[var(--s-xl)] hover:-translate-y-1 transition-[transform,box-shadow] duration-[var(--m-smooth)] ease-[var(--m-standard)] active:scale-[0.99]"
              >
                <div
                  className="relative w-full bg-[var(--c-bg)]"
                  style={{ aspectRatio: "16 / 10" }}
                >
                  <Image
                    src={blogCoverUrl(post)}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    unoptimized={!post.coverImage}
                  />
                </div>
                <div className="p-5">
                  {(displayDate || post.readingTime) && (
                    <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
                      {displayDate ? formatDate(displayDate) : null}
                      {displayDate && post.readingTime ? " · " : ""}
                      {post.readingTime ? `${post.readingTime} min read` : ""}
                    </div>
                  )}
                  <h3 className="text-base font-bold text-[var(--c-text)] leading-snug mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-[var(--c-text-muted)] leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <div
            className="rounded-[var(--r-xl)] p-10 text-center text-[var(--c-text-muted)] border border-[var(--c-border)] bg-[var(--c-surface)]"
          >
            No articles published yet.
          </div>
        )}
      </Container>
    </main>
  );
}
