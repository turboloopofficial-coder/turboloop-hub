// /blog/[slug] — individual blog post.
//
// Build-time strategy:
//   - generateStaticParams pre-builds every published post at deploy time
//   - dynamicParams: true → posts created after deploy still render
//     (fetched + cached on first hit) instead of 404'ing
//   - revalidate: 5 min so edits to published posts surface within minutes
//     without a redeploy (Next.js ISR). Manual bust via
//     /api/revalidate-blog?slug=<slug>&secret=$REVALIDATE_SECRET
//
// Markdown is parsed at build time via `marked`, sanitized via DOMPurify,
// and rendered with dangerouslySetInnerHTML. The result is plain HTML —
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
import DOMPurify from "isomorphic-dompurify";
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
  type BlogPost,
} from "@lib/api";

export const revalidate = 300;
export const dynamicParams = true; // allow new posts without redeploy

export async function generateStaticParams() {
  const posts = await api.blogPosts();
  return posts.filter(p => p.published).map(p => ({ slug: p.slug }));
}

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostOr404(slug);
  const url = `https://turboloop.tech/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt ?? `${post.title} — TurboLoop Editorial.`,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? "",
      url,
      type: "article",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt ?? undefined,
      images: [
        {
          url: blogCoverUrl(post),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? "",
      images: [blogCoverUrl(post)],
    },
  };
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
  // article), and if marked OR DOMPurify throw on weird input we fall
  // back to a plain-text version so the page still loads. The previous
  // unguarded version crashed the whole route on a single bad post,
  // which is what triggered the cached 500 on
  // /blog/bsc-vs-ethereum-fees-explained.
  let cleanHtml = "";
  if (post.content && post.content.trim().length > 0) {
    try {
      const rawHtml = await marked.parse(post.content, { breaks: true });
      cleanHtml = DOMPurify.sanitize(rawHtml as string);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        `[blog/[slug]] markdown render failed for slug="${post.slug}":`,
        msg
      );
      // Plain-text fallback: still sanitized, just unformatted.
      cleanHtml = `<pre style="white-space:pre-wrap;font-family:inherit">${DOMPurify.sanitize(post.content)}</pre>`;
    }
  }

  const displayDate = blogDisplayDate(post);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? "",
    image: blogCoverUrl(post),
    datePublished: displayDate ?? post.createdAt,
    dateModified: post.updatedAt ?? post.createdAt,
    mainEntityOfPage: `https://turboloop.tech/blog/${post.slug}`,
    publisher: {
      "@type": "Organization",
      name: "Turbo Loop",
      logo: {
        "@type": "ImageObject",
        url: "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png",
      },
    },
  };

  return (
    <main className="relative pb-12 md:pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
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
