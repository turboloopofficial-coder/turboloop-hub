"use client";

// Interactive language picker for the homepage blog section.
// Receives all posts pre-fetched by the server component (HomeBlogSection)
// and filters them client-side — zero extra API calls, instant tab switching.

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Card } from "@components/ui/Card";
import {
  BLOG_LANGUAGES,
  blogCoverUrl,
  blogDisplayDate,
  type BlogLanguage,
  type BlogPostSummary,
} from "@lib/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  /** All published posts across all languages — pre-fetched by the server. */
  allPosts: BlogPostSummary[];
}

export function HomeBlogLanguagePicker({ allPosts }: Props) {
  const [activeLang, setActiveLang] = useState<BlogLanguage>("en");

  // Count per language for the tab chips
  const counts: Partial<Record<BlogLanguage, number>> = {};
  for (const lang of BLOG_LANGUAGES) {
    counts[lang.code] = allPosts.filter(p => p.language === lang.code).length;
  }

  // 3 most-recent posts for the active language
  const posts = allPosts
    .filter(p => p.language === activeLang)
    .sort((a, b) => {
      const aT = new Date(a.scheduledPublishAt ?? a.createdAt).getTime();
      const bT = new Date(b.scheduledPublishAt ?? b.createdAt).getTime();
      return bT - aT;
    })
    .slice(0, 3);

  return (
    <>
      {/* Language tabs */}
      <nav
        aria-label="Filter editorial by language"
        className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1 md:flex-wrap"
      >
        {BLOG_LANGUAGES.map(lang => {
          const isActive = activeLang === lang.code;
          const count = counts[lang.code];
          return (
            <button
              key={lang.code}
              onClick={() => setActiveLang(lang.code)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-2 px-4 min-h-[40px] min-w-max flex-shrink-0 rounded-full text-sm font-bold transition active:scale-[0.985] cursor-pointer ${
                isActive
                  ? "bg-brand text-white shadow-[var(--s-brand)]"
                  : "bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] hover:border-[var(--c-brand-cyan)]"
              }`}
            >
              <span className="text-base leading-none" aria-hidden="true">
                {lang.flag}
              </span>
              <span>{lang.label}</span>
              {typeof count === "number" && count > 0 && (
                <span
                  className={`text-[0.6875rem] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
                    isActive
                      ? "bg-white/22 text-white"
                      : "bg-[var(--c-bg)] text-[var(--c-text-muted)]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Post grid */}
      {posts.length === 0 ? (
        <p className="text-sm text-[var(--c-text-muted)] text-center py-8">
          No articles yet in this language.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map(post => {
            const displayDate = blogDisplayDate(post);
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <Card
                  elevation="raised"
                  padding="none"
                  interactive
                  className="h-full overflow-hidden flex flex-col"
                >
                  <div
                    className="relative w-full bg-[var(--c-bg)]"
                    style={{ aspectRatio: "16 / 10" }}
                  >
                    <Image
                      src={blogCoverUrl(post)}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      unoptimized={!post.coverImage}
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
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
                      <p className="text-sm text-[var(--c-text-muted)] leading-relaxed line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* "All articles" CTA — links to the active language on /blog */}
      <div className="mt-8 flex justify-center">
        <Link
          href={`/blog?lang=${activeLang}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--c-brand-cyan)] hover:underline"
        >
          All {BLOG_LANGUAGES.find(l => l.code === activeLang)?.label ?? ""} articles
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  );
}
