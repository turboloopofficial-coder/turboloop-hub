"use client";

// Interactive language picker for the homepage blog section.
// Receives all posts pre-fetched by the server component (HomeBlogSection)
// and filters them client-side — zero extra API calls, instant tab switching.
//
// Language default priority:
//   1. initialLocale prop (from [locale] route, e.g. /hi → "hi")
//   2. NEXT_LOCALE cookie (set by the global language picker)
//   3. "en" fallback
//
// Reading the cookie client-side (useEffect) keeps the homepage statically
// rendered (no cookies() call in the server component = ISR caching preserved).
// There may be a brief flash of English before switching to the user's language
// on first paint, but this is imperceptible in practice.
//
// realCounts: map of { lang → total posts in DB } fetched by the server via
// blogPostsCounts(). Used to show real totals (e.g. "Hindi 177") instead
// of the preview count (always ≤5 since we only pre-fetch 5 per language).

import { useState, useEffect } from "react";
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

// Map from next-intl locale codes → BlogLanguage (DB) codes.
// next-intl uses BCP-47/ISO codes (ar, zh, ur, pcm) while the DB uses
// legacy 2-letter codes (sa, cn, pk, ng). Both sets are mapped here.
const LOCALE_TO_BLOG_LANG: Record<string, BlogLanguage> = {
  // next-intl locale codes (from routing.ts)
  en: "en",
  th: "th",
  ko: "kr",   // next-intl "ko" → DB "kr"
  lo: "la",   // next-intl "lo" → DB "la"
  hi: "hi",
  de: "de",
  id: "id",
  ta: "ta",
  ar: "sa",   // next-intl "ar" → DB "sa"
  zh: "cn",   // next-intl "zh" → DB "cn"
  it: "it",
  ur: "pk",   // next-intl "ur" → DB "pk"
  fr: "fr",
  es: "es",
  pcm: "ng",  // next-intl "pcm" → DB "ng"
  bn: "bn",   // Bangla
  tr: "tr",   // Turkish
  // Legacy / DB codes (fallback for any direct usage)
  la: "la",
  cn: "cn",
  ng: "ng",
  sa: "sa",
  kr: "kr",
  pk: "pk",
};

/** Read the NEXT_LOCALE cookie from document.cookie */
function getLocaleCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Resolve a locale string to a BlogLanguage DB code */
function localeToBlogLang(locale: string | null | undefined): BlogLanguage | null {
  if (!locale) return null;
  return LOCALE_TO_BLOG_LANG[locale] ?? null;
}

interface Props {
  /** All published posts across all languages — pre-fetched by the server. */
  allPosts: BlogPostSummary[];
  /**
   * Locale from the current route (e.g. "th", "ko", "en").
   * Used to pre-select the matching language tab on first render.
   * The component should be remounted (via key prop on the parent)
   * when the locale route changes so the initial selection resets.
   */
  initialLocale?: string;
  /**
   * Real post counts per language from the DB (blogPostsCounts endpoint).
   * Keys are DB language codes (e.g. "hi", "kr", "sa").
   * Used to show real totals (e.g. "Hindi 177") in the tab chips instead
   * of the preview count (always ≤5 since we only pre-fetch 5 per language).
   */
  realCounts?: Record<string, number>;
}

export function HomeBlogLanguagePicker({ allPosts, initialLocale, realCounts = {} }: Props) {
  // Derive the initial language from the locale prop, falling back to "en".
  // This is the SSR/static value — cookie is applied client-side in useEffect.
  const initialLang: BlogLanguage =
    localeToBlogLang(initialLocale) ?? "en";

  const [activeLang, setActiveLang] = useState<BlogLanguage>(initialLang);

  // On mount: if no explicit locale was passed (root / page), read the
  // NEXT_LOCALE cookie so the blog section matches the user's selected language.
  useEffect(() => {
    if (initialLocale) return; // locale route already handled by the prop
    const cookieLang = localeToBlogLang(getLocaleCookie());
    if (cookieLang && cookieLang !== activeLang) {
      setActiveLang(cookieLang);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          // Use real DB count if available, else fall back to preview count
          const count = realCounts[lang.code] ?? allPosts.filter(p => p.language === lang.code).length;
          return (
            <button
              key={lang.code}
              type="button"
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
