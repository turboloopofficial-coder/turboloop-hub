// /films/[slug] — the unified film detail page.
//
// Replaces the old static-FILMS-array lookup with a DB-backed query.
// Handles BOTH legacy slugs (S1 Cinematic Universe) and new slugs (S2
// Sovereign Series) under one route.
//
// URL shape:
//   /films/the-001-percent-lie               → S1 EN film (legacy slug)
//   /films/v01-2500-families-80-countries-…  → S2 EN film
//   /films/v01-2500-families-…?lang=de       → S2 DE film
//
// Lookup resolution:
//   - canonical_slug + language (from ?lang= or default 'en')
//   - If no row found at requested language, fall back to English so
//     non-English URLs without a matching translation degrade gracefully
//     instead of 404'ing.
//   - If no English row either, return Next.js notFound().
//
// generateStaticParams returns every canonical_slug at build time so
// most-requested pages prerender. dynamicParams=true lets new films
// render on first request (ISR cache miss → DB query → cache).
//
// Forced dark mode — consistent with /films page.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { Breadcrumbs } from "@components/Breadcrumbs";
import { FilmCard } from "@components/films/FilmCard";
import { FilmActionBar } from "@components/films/FilmActionBar";
import { NewBadge } from "@components/ui/NewBadge";
import { VideoObjectJsonLd } from "@components/seo/StructuredData";
import {
  fetchAllFilmSlugs,
  fetchFilmBySlug,
  fetchFilmTranslations,
  fetchFilmsByLanguage,
  isSovereignSeriesS2,
  shouldShowNewBadge,
  LANG_CODE_TO_LABEL,
  type DbFilm,
  type FilmLang,
} from "@lib/filmsApi";
import { SEASONS } from "@lib/cinematicUniverse";

export const revalidate = 300;
export const dynamicParams = true;

const CANONICAL_HOST = "https://www.turboloop.tech";

const LANG_TAB_LABELS: Record<FilmLang, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  de: { label: "Deutsch", flag: "🇩🇪" },
  hi: { label: "हिंदी", flag: "🇮🇳" },
  id: { label: "Bahasa", flag: "🇮🇩" },
};

function isLang(v: string | undefined): v is FilmLang {
  return v === "en" || v === "de" || v === "hi" || v === "id";
}

export async function generateStaticParams() {
  const slugs = await fetchAllFilmSlugs();
  return slugs.map(slug => ({ slug }));
}

async function getFilmOr404(
  slug: string,
  lang: FilmLang
): Promise<{ film: DbFilm; allLangs: DbFilm[] }> {
  let film = await fetchFilmBySlug(slug, lang);
  if (!film && lang !== "en") {
    film = await fetchFilmBySlug(slug, "en");
  }
  if (!film) notFound();
  const allLangs = await fetchFilmTranslations(slug);
  return { film, allLangs };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const activeLang: FilmLang = isLang(lang) ? lang : "en";
  let film: DbFilm | null = null;
  try {
    film = await fetchFilmBySlug(slug, activeLang);
    if (!film && activeLang !== "en") {
      film = await fetchFilmBySlug(slug, "en");
    }
  } catch {
    film = null;
  }
  if (!film) {
    return {
      title: "Film not found — TurboLoop",
      description: "This film doesn't exist in our catalogue.",
      robots: { index: false, follow: false },
    };
  }

  const url =
    activeLang === "en"
      ? `${CANONICAL_HOST}/films/${film.canonicalSlug}`
      : `${CANONICAL_HOST}/films/${film.canonicalSlug}?lang=${activeLang}`;

  return {
    title: `${film.title} — TurboLoop Cinematic Universe`,
    description: film.tagline || film.headline || film.title,
    alternates: { canonical: url },
    openGraph: {
      title: film.title,
      description: film.tagline || film.headline || film.title,
      url,
      type: "video.movie",
      videos: [
        { url: film.directUrl, width: 1920, height: 1080, type: "video/mp4" },
      ],
      images: film.posterUrl
        ? [{ url: film.posterUrl, width: 1280, height: 720, alt: film.title }]
        : undefined,
    },
    twitter: {
      card: "player",
      title: film.title,
      description: film.tagline || film.headline || film.title,
      images: film.posterUrl ? [film.posterUrl] : undefined,
    },
  };
}

export default async function FilmDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const requestedLang: FilmLang = isLang(lang) ? lang : "en";
  const { film, allLangs } = await getFilmOr404(slug, requestedLang);

  // Resolve the language the row actually rendered in (in case the
  // requested language wasn't available and we fell back to EN).
  const renderedLang: FilmLang =
    (Object.entries(LANG_CODE_TO_LABEL).find(
      ([, label]) => label === film.language
    )?.[0] as FilmLang | undefined) ?? "en";

  // Available languages from the translations query
  const availableLangCodes = new Set<FilmLang>(
    allLangs
      .map(f => {
        const code = Object.entries(LANG_CODE_TO_LABEL).find(
          ([, label]) => label === f.language
        )?.[0];
        return code as FilmLang | undefined;
      })
      .filter((c): c is FilmLang => Boolean(c))
  );

  // Related films: same section + same language
  let related: DbFilm[] = [];
  try {
    const allInLang = await fetchFilmsByLanguage(renderedLang);
    const isS2 = isSovereignSeriesS2(film);
    if (isS2) {
      const blockStart = Math.floor((film.sortOrder - 1) / 5) * 5 + 1;
      const blockEnd = blockStart + 4;
      related = allInLang
        .filter(
          f =>
            isSovereignSeriesS2(f) &&
            f.sortOrder >= blockStart &&
            f.sortOrder <= blockEnd &&
            f.canonicalSlug !== film.canonicalSlug
        )
        .slice(0, 4);
    } else if (film.season) {
      related = allInLang
        .filter(
          f =>
            !isSovereignSeriesS2(f) &&
            f.season === film.season &&
            f.canonicalSlug !== film.canonicalSlug
        )
        .slice(0, 4);
    }
  } catch {
    related = [];
  }

  // Other language variants of THIS film (up to 3)
  const otherLangs = allLangs.filter(f => f.id !== film.id).slice(0, 3);

  const detailUrl =
    renderedLang === "en"
      ? `${CANONICAL_HOST}/films/${film.canonicalSlug}`
      : `${CANONICAL_HOST}/films/${film.canonicalSlug}?lang=${renderedLang}`;

  // Accent for visual grouping
  const accent = isSovereignSeriesS2(film)
    ? (() => {
        const blockStart = Math.floor((film.sortOrder - 1) / 5) * 5 + 1;
        if (blockStart === 1) return "#0891B2";
        if (blockStart === 6) return "#7C3AED";
        if (blockStart === 11) return "#F59E0B";
        return "#10B981";
      })()
    : film.season
      ? SEASONS[film.season as 1 | 2 | 3 | 4]?.accent ?? "#0891B2"
      : "#0891B2";

  const showNew = shouldShowNewBadge(film);

  // Compute the OG thumbnail — prefer the explicit posterUrl when
  // present, otherwise fall back to the dynamic og-banner. Used both
  // for OG meta (above) and the VideoObject schema below.
  const thumbnailUrl =
    film.posterUrl ||
    `${CANONICAL_HOST}/api/og-banner?type=film&slug=${encodeURIComponent(
      film.canonicalSlug
    )}`;

  return (
    <main className="dark relative pb-12 md:pb-20 bg-[var(--c-bg)] text-[var(--c-text)]">
      {/* VideoObject JSON-LD — feeds Google Video Search and unlocks
          the "video" rich-result format in regular search. */}
      <VideoObjectJsonLd
        name={film.title}
        description={film.tagline || film.title}
        thumbnailUrl={thumbnailUrl}
        uploadDate={film.createdAt}
        contentUrl={film.directUrl}
      />

      <Container width="narrow" className="pt-6 md:pt-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Films", href: "/films" },
            { label: film.title },
          ]}
        />
        <Link
          href="/films"
          className="inline-flex items-center gap-2 text-sm text-[var(--c-text-muted)] hover:text-[var(--c-text)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All films
        </Link>
      </Container>

      {/* Video player */}
      <Container width="wide" className="mb-8 md:mb-10">
        <div
          className="relative w-full rounded-[var(--r-2xl)] overflow-hidden shadow-[var(--s-lg)] bg-black"
          style={{ aspectRatio: "16 / 9" }}
        >
          <video
            src={film.directUrl}
            poster={film.posterUrl ?? undefined}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-contain bg-black"
          >
            Your browser does not support the video tag.{" "}
            <a href={film.directUrl}>Download the MP4</a> instead.
          </video>
          <NewBadge show={showNew} size="md" className="absolute top-4 right-4 z-10" />
        </div>
      </Container>

      {/* Title + tagline + actions */}
      <Container width="narrow" className="mb-10 md:mb-14">
        {film.headline && film.headline !== film.title && (
          <div
            className="text-[0.6875rem] font-bold tracking-[0.22em] uppercase mb-3"
            style={{ color: accent }}
          >
            {film.headline}
          </div>
        )}
        <Heading tier="h1" className="mb-4">
          {film.title}
        </Heading>
        {film.tagline && (
          <p className="text-lg md:text-xl text-[var(--c-text-muted)] leading-relaxed mb-6 md:mb-8">
            {film.tagline}
          </p>
        )}

        <FilmActionBar
          url={detailUrl}
          title={film.title}
          shareContext={film.tagline || film.headline}
          downloadUrl={film.directUrl}
          downloadFilename={film.canonicalSlug}
        />
      </Container>

      {/* Language switcher */}
      {availableLangCodes.size > 1 && (
        <Container width="narrow" className="mb-10 md:mb-14">
          <div className="rounded-[var(--r-xl)] p-5 md:p-6 bg-[var(--c-surface)] border border-[var(--c-border)]">
            <div className="flex items-center gap-2 mb-3 text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-muted)]">
              <Globe className="w-3.5 h-3.5" aria-hidden="true" />
              Watch in another language
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(LANG_TAB_LABELS) as FilmLang[]).map(code => {
                if (!availableLangCodes.has(code)) return null;
                const tab = LANG_TAB_LABELS[code];
                const isActive = code === renderedLang;
                const href =
                  code === "en"
                    ? `/films/${film.canonicalSlug}`
                    : `/films/${film.canonicalSlug}?lang=${code}`;
                return (
                  <Link
                    key={code}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex items-center gap-2 px-4 h-10 rounded-full text-sm font-bold transition active:scale-[0.985] ${
                      isActive
                        ? "bg-brand text-white shadow-[var(--s-brand)]"
                        : "bg-[var(--c-bg)] text-[var(--c-text)] border border-[var(--c-border)] hover:border-[var(--c-brand-cyan)]"
                    }`}
                  >
                    <span className="text-base leading-none" aria-hidden="true">
                      {tab.flag}
                    </span>
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </Container>
      )}

      {/* Description */}
      {film.description && film.description !== film.tagline && (
        <Container width="narrow" className="mb-12 md:mb-16">
          <article className="prose-blog text-[var(--c-text)]">
            {film.description.split(/\n\n+/).map((para, i) => (
              <p key={i} className="leading-relaxed text-[var(--c-text-muted)] mb-4">
                {para}
              </p>
            ))}
          </article>
        </Container>
      )}

      {/* Related films */}
      {related.length > 0 && (
        <Container width="wide" className="mb-12 md:mb-16">
          <div className="mb-5 md:mb-7">
            <div
              className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-2"
              style={{ color: accent }}
            >
              More from this {isSovereignSeriesS2(film) ? "block" : "season"}
            </div>
            <Heading tier="title" as="h2">
              Keep watching
            </Heading>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {related.map(r => (
              <FilmCard
                key={r.id}
                film={r}
                activeLang={renderedLang}
                accent={accent}
                showEpisodeBadge
                episodeLabel={
                  isSovereignSeriesS2(r)
                    ? `V${String(r.sortOrder).padStart(2, "0")}`
                    : r.season && r.episode
                      ? `S${r.season}·E${r.episode}`
                      : undefined
                }
              />
            ))}
          </div>
        </Container>
      )}

      {/* Watch in other languages */}
      {otherLangs.length > 0 && (
        <Container width="wide">
          <div className="mb-5 md:mb-7">
            <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-2 text-[var(--c-text-muted)]">
              Same film, your language
            </div>
            <Heading tier="title" as="h2">
              Watch in other languages
            </Heading>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {otherLangs.map(r => {
              const code = Object.entries(LANG_CODE_TO_LABEL).find(
                ([, label]) => label === r.language
              )?.[0] as FilmLang | undefined;
              if (!code) return null;
              return (
                <FilmCard
                  key={r.id}
                  film={r}
                  activeLang={code}
                  accent={accent}
                  showEpisodeBadge
                  episodeLabel={LANG_TAB_LABELS[code].label}
                />
              );
            })}
          </div>
        </Container>
      )}
    </main>
  );
}
