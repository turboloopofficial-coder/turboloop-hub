// /blog/[slug] — individual blog post.
//
// Build-time strategy:
//   - generateStaticParams pre-builds every published post at deploy time
//   - dynamicParams: true → posts created after deploy still render
//     (fetched + cached on first hit) instead of 404'ing.
//
//     Briefly flipped to false on 2026-05-15 after isomorphic-dompurify
//     crashed the lambda for dynamically-rendered slugs (transitive
//     ESM/CJS interop bug in @exodus/bytes via html-encoding-sniffer).
//     Restored to true on 2026-05-16 after swapping the sanitizer to
//     sanitize-html (pure-node, no JSDOM dependency, no interop issue).
//   - revalidate: 5 min so edits to published posts surface within minutes
//     without a redeploy (Next.js ISR). Manual bust via
//     /api/revalidate-blog?slug=<slug>&secret=$REVALIDATE_SECRET
//
// Markdown is parsed via `marked`, sanitized via lib/sanitize.ts, and
// rendered with dangerouslySetInnerHTML. The result is plain HTML —
// no client-side markdown library shipped, no hydration cost.
//
// Failure handling: getPostOr404 narrowly distinguishes "post missing"
// (→ 404) from "everything else" (→ error.tsx). Markdown rendering is
// wrapped in try/catch with a plain-text fallback so a single bad post
// can't take down the route.

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { marked } from "marked";
import { sanitize } from "@lib/sanitize";
import { injectInternalLinks } from "@lib/internal-links";
import { RelatedPosts } from "@components/blog/RelatedPosts";
import { preprocessMarkdown } from "@lib/markdownPrep";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { ShareButton } from "@components/ShareButton";
import { ReadingProgress } from "@components/ReadingProgress";
import { Breadcrumbs } from "@components/Breadcrumbs";
import {
  api,
  blogCoverUrl,
  blogDisplayDate,
  blogOgBannerUrl,
  HREFLANG_BY_LANG,
  type BlogPost,
} from "@lib/api";
import { LANGUAGES } from "@lib/languages";

export const revalidate = 300;
// ISR: blog posts are cached for 5 minutes at the CDN edge.
// force-dynamic was previously set because api.turboloop.tech was unreliable at
// build time — but that caused every blog post request to bypass CDN and hit a
// cold serverless function. With revalidate=300 and error handling in
// getPostOr404, ISR failures are isolated to the revalidation cycle and don't
// affect cached responses. Use /api/revalidate-blog for instant cache busting.
// Cost saving: ~$50+/month in edge function execution units.
export const dynamicParams = true; // posts created after deploy still render on first hit

// Canonical URLs use www. — the apex (turboloop.tech) issues a Vercel
// platform 307 to www.turboloop.tech BEFORE Next.js middleware runs.
// Pointing `canonical` at the actual 200-OK host avoids passing crawler
// link-equity through a redirect hop on every blog URL.
const CANONICAL_HOST = "https://www.turboloop.tech";

async function getPostOr404(slug: string): Promise<BlogPost> {
  // Fetch + classify failures. The previous version had a blanket
  // `catch { notFound() }` that masked real outages (tRPC down, malformed
  // response, etc.) as 404s. Worse, it didn't help when the post DID
  // exist but rendering downstream failed — those threw uncaught and
  // were cached by ISR as 500s for the full revalidate window. We now
  // only swallow 404-shaped failures; everything else logs to Vercel and
  // falls through to error.tsx so the issue is visible.
  let post: BlogPost | null = null;
  try {
    post = await api.blogPost(slug);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/HTTP 404|NOT_FOUND|not found/i.test(msg)) {
      notFound();
    }
    console.error(`[blog/[slug]] api.blogPost("${slug}") failed:`, msg);
    throw err;
  }
  if (!post || !post.published) notFound();
  return post;
}

/** Build the `alternates.languages` map for `Metadata` from the
 *  translation siblings returned by the new blogPostSiblings endpoint.
 *  Each entry maps a hreflang code to its absolute URL.
 *  Returns an empty object when the post has no siblings (monolingual). */
function buildLanguageAlternates(
  siblings: { id: number; slug: string; language: string; translationOf: number | null; published: boolean }[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const sibling of siblings) {
    if (!sibling.published) continue;
    const hreflang = HREFLANG_BY_LANG[sibling.language as keyof typeof HREFLANG_BY_LANG] ?? sibling.language;
    out[hreflang] = `${CANONICAL_HOST}/blog/${sibling.slug}`;
  }
  // x-default → the English original (the canonical entry point for any
  // visitor whose locale isn't explicitly served). Falls back to the
  // post itself if no EN sibling exists.
  const en = siblings.find(g => g.language === "en" && g.published);
  if (en) out["x-default"] = `${CANONICAL_HOST}/blog/${en.slug}`;
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostOr404(slug);
  const url = `${CANONICAL_HOST}/blog/${post.slug}`;

  // Pull translation siblings so we can emit hreflang alternates. One
  // fetch covers every post — cheaper than a per-translation lookup.
  // Use blogPostsList() (no content field, ~6 MB) instead of blogPosts()
  // (52 MB) to stay under Next.js's 2 MB data-cache limit. BlogPostSummary
  // is BlogPost without `content`, so it has all fields needed for hreflang.
  // Use the new blogPostSiblings endpoint instead of fetching all 4,700 posts.
  // This returns only the ~1-60 siblings for this post's translation group (~10 KB vs 6 MB).
  // The rootId is either the post's own ID (if it's the EN original) or translationOf.
  const rootId = post.translationOf ?? post.id;
  let siblings: { id: number; slug: string; language: string; translationOf: number | null; published: boolean }[] = [];
  try {
    siblings = await api.blogPostSiblings(rootId);
  } catch {
    // Fallback: no hreflang alternates if the siblings endpoint fails.
    siblings = [];
  }
  const languages = buildLanguageAlternates(siblings);

  // SEO title/description fall back to the editorial title/excerpt when
  // no override is set. The hard cap keeps the `<title>` tag under
  // Google's ~580-pixel display budget (~60 chars).
  const seoTitle = post.seoTitle ?? post.title;
  const seoDescription =
    post.seoDescription ?? post.excerpt ?? `${post.title} — TurboLoop Editorial.`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: url,
      // languages map gets rendered as <link rel="alternate" hreflang="..."/>.
      // Skipping when empty avoids a meaningless empty-key entry.
      languages: Object.keys(languages).length > 0 ? languages : undefined,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url,
      type: "article",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt ?? undefined,
      // OG locale uses the BCP-47 territory-augmented form. We keep it
      // simple here (en_US / de_DE / hi_IN / id_ID) so Telegram and
      // Twitter cards render with the right language hint.
      locale: ogLocaleFor(post.language),
      images: [
        {
          url: blogCoverUrl(post),
          width: 1200,
          height: 630,
          alt: seoTitle,
        },
      ],
    },
    keywords: post.tags && post.tags.length > 0
      ? post.tags.join(", ")
      : undefined,
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [blogCoverUrl(post)],
    },
  };
}
/** Map language code → BCP-47 OG locale (e.g. "hi" → "hi_IN").
 *  Derived from languages.ts so it covers all 50+ supported languages. */
function ogLocaleFor(lang: string): string {
  // Look up the bcp47 field from languages.ts and convert to OG format (en-US → en_US)
  const config = Object.values(LANGUAGES).find(l => l.code === lang);
  if (config?.bcp47) return config.bcp47.replace("-", "_");
  return "en_US";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostOr404(slug);

  // Render markdown → sanitized HTML at build time.
  //
  // Defensive: empty body shouldn't crash the page (renders as a stub
  // article), and if marked OR sanitize throw on weird input we fall
  // back to a plain-text version so the page still loads. The previous
  // unguarded version crashed the whole route on a single bad post,
  // which is what triggered the cached 500 on
  // /blog/bsc-vs-ethereum-fees-explained.
  let cleanHtml = "";
  if (post.content && post.content.trim().length > 0) {
    try {
      // Pre-process for GFM alerts (> [!KEY]/[!TIP]/etc.) and recover
      // any literal-\n data corruption before passing to marked.
      const prepared = preprocessMarkdown(post.content);
      const rawHtml = await marked.parse(prepared, { breaks: true, gfm: true });
      cleanHtml = sanitize(rawHtml as string);
      // Inject contextual internal links (max 3 per post)
      cleanHtml = injectInternalLinks(cleanHtml, 3);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        `[blog/[slug]] markdown render failed for slug="${post.slug}":`,
        msg
      );
      // Plain-text fallback: still sanitized, just unformatted.
      cleanHtml = `<pre style="white-space:pre-wrap;font-family:inherit">${sanitize(post.content)}</pre>`;
    }
  }

  const displayDate = blogDisplayDate(post);

  // Estimate word count from the rendered HTML's text content. Cheap —
  // strip tags + count whitespace-separated tokens. Used only as a
  // signal for the Article JSON-LD; we don't render this number to
  // users (readingTime is the user-facing field).
  const wordCount = post.content
    ? post.content.replace(/<[^>]+>/g, "").trim().split(/\s+/).length
    : 0;

  // Pick the first tag (if any) as articleSection. Falls back to
  // "Editorial" so the field is never empty.
  const articleSection = post.tags && post.tags.length > 0
    ? post.tags[0]
    : "Editorial";

  // Author defaults to the editorial org byline when not set. Authors
  // get their own Person entity if we have a URL to point at;
  // otherwise it's a plain string (still valid per schema.org).
  // SECURITY: Strip any HTML/script tags from author fields to prevent
  // stored XSS via JSON-LD script tag breakout.
  const safeAuthorName = post.authorName
    ? post.authorName.replace(/<[^>]*>/g, "").replace(/[\x00-\x1f]/g, "").trim().slice(0, 100) || "Turbo Loop Editorial"
    : null;
  const safeAuthorUrl = post.authorUrl
    ? (post.authorUrl.startsWith("https://") ? post.authorUrl : null)
    : null;
  const authorEntity = safeAuthorName
    ? safeAuthorUrl
      ? {
          "@type": "Person",
          name: safeAuthorName,
          url: safeAuthorUrl,
        }
      : { "@type": "Person", name: safeAuthorName }
    : {
        "@type": "Organization",
        name: "Turbo Loop Editorial",
        url: "https://www.turboloop.tech/about",
      };

  const articleUrl = `${CANONICAL_HOST}/blog/${post.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? "",
    image: blogCoverUrl(post),
    datePublished: displayDate ?? post.createdAt,
    dateModified: post.updatedAt ?? post.createdAt,
    // BCP-47 language tag. Distinguishes EN / DE / HI / ID variants for
    // both Google and LLM crawlers (notably ChatGPT's search index,
    // which respects `inLanguage` for retrieval routing).
    inLanguage: HREFLANG_BY_LANG[post.language] ?? "en",
    // Word count + section both feed Google's "in-depth article" /
    // long-form ranking signals and Discover's article scoring.
    wordCount,
    articleSection,
    mainEntityOfPage: articleUrl,
    author: authorEntity,
    publisher: {
      "@type": "Organization",
      name: "Turbo Loop",
      logo: {
        "@type": "ImageObject",
        url: "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png",
      },
    },
  };

  // BreadcrumbList — distinct from the visual Breadcrumbs component.
  // Google uses this for the search-result trail ("turboloop.tech ›
  // Blog › <Article>") and it's a required ingredient for "Article"
  // rich-result eligibility on long-form posts.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${CANONICAL_HOST}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${CANONICAL_HOST}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <main className="relative pb-12 md:pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Reading progress bar — pinned to top, fills as user scrolls */}
      <ReadingProgress />

      {/* Hero (cover image + title) */}
      <article>
        <Container width="narrow" className="pt-6 md:pt-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
          />
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-[var(--c-text-muted)] hover:text-[var(--c-text)] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All articles
          </Link>

          {(displayDate || post.readingTime) && (
            <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-brand-cyan)] mb-3">
              {displayDate ? formatDate(displayDate) : null}
              {displayDate && post.readingTime ? " · " : ""}
              {post.readingTime ? `${post.readingTime} min read` : ""}
            </div>
          )}

          <Heading tier="h1" className="mb-5">
            {post.title}
          </Heading>

          {post.excerpt && (
            <p className="text-lg md:text-xl text-[var(--c-text-muted)] leading-relaxed mb-8">
              {post.excerpt}
            </p>
          )}
        </Container>

        <Container width="wide" className="mb-10 md:mb-14">
          <div
            className="relative w-full rounded-[var(--r-2xl)] overflow-hidden shadow-[var(--s-lg)] bg-[var(--c-bg)]"
            style={{ aspectRatio: "16 / 9" }}
          >
            <Image
              src={blogCoverUrl(post)}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 1280px"
              className="object-cover"
              priority
              unoptimized={!post.coverImage}
            />
          </div>
        </Container>

        {/* Body */}
        <Container width="narrow">
          <div
            className="prose-blog text-[var(--c-text)]"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />

          {/* Related posts — internal linking for SEO */}
          <RelatedPosts title={post.title} content={post.content || ""} />

          {/* End-of-article share strip — encourages onward sharing */}
          <div className="mt-12 pt-8 border-t border-[var(--c-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-1">
                Found this useful?
              </div>
              <div className="text-base font-bold text-[var(--c-text)]">
                Pass it along.
              </div>
            </div>
            <ShareButton
              path={`/blog/${post.slug}`}
              message={`📖 ${post.title}${post.excerpt ? ` — ${post.excerpt}` : ""}`}
              variant="primary"
              label="Share article"
            />
          </div>
        </Container>
      </article>
    </main>
  );
}
