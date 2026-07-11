// DB-driven films data layer.
//
// Replaces the static FILMS array in cinematicUniverse.ts (which is kept
// in the repo for rollback safety for ~1 week). All films — original 20
// Cinematic Universe + 79 Sovereign Series Season 2 — are now fetched
// from the videos table via this helper.
//
// Sort key everywhere: ORDER BY COALESCE(pinned_at, created_at) DESC, id DESC
// — newest first by default; manual pin via pinned_at when needed.
//
// Two "sections" the films page renders:
//   • Sovereign Series — Season 2: canonical_slug LIKE 'v%' (V01-V20)
//   • Cinematic Universe (S1): everything else, grouped by season 1-4
//
// LIB lives outside any route so the same data shape is reusable in
// /films, /films/[slug], image-sitemap, sitemap, etc.

import { neon } from "@neondatabase/serverless";

const NEON_URL_ENV = "DATABASE_URL";

export interface DbFilm {
  id: number;
  canonicalSlug: string;
  slug: string;
  language: string; // "English" | "German" | "Hindi" | "Indonesian"
  languageFlag: string;
  title: string;
  description: string;
  headline: string;
  tagline: string;
  directUrl: string;
  posterUrl: string | null;
  season: number | null;
  episode: number | null;
  sortOrder: number;
  pinnedAt: string | null;
  pinnedNewUntil: string | null;
  createdAt: string;
}

/** Map "English" → "en", "German" → "de", etc. — needed because the
 *  videos table stores full language labels while the frontend uses
 *  ISO codes in URLs and tabs. */
export const LANG_LABEL_TO_CODE: Record<string, "en" | "de" | "hi" | "id" | "th" | "ko" | "ar" | "zh" | "ta" | "it" | "ur" | "fr" | "es" | "lo" | "pcm"> = {
  English: "en",
  German: "de",
  Hindi: "hi",
  Indonesian: "id",
  Thai: "th",
  Korean: "ko",
  Arabic: "ar",
  Chinese: "zh",
  Tamil: "ta",
  Italian: "it",
  Urdu: "ur",
  French: "fr",
  Spanish: "es",
  Lao: "lo",
  "Nigerian Pidgin": "pcm",
  Bangla: "bn",
};

export const LANG_CODE_TO_LABEL: Record<"en" | "de" | "hi" | "id" | "th" | "ko" | "ar" | "zh" | "ta" | "it" | "ur" | "fr" | "es" | "lo" | "pcm" | "bn", string> = {
  en: "English",
  de: "German",
  hi: "Hindi",
  id: "Indonesian",
  th: "Thai",
  ko: "Korean",
  ar: "Arabic",
  zh: "Chinese",
  ta: "Tamil",
  it: "Italian",
  ur: "Urdu",
  fr: "French",
  es: "Spanish",
  lo: "Lao",
  pcm: "Nigerian Pidgin",
  bn: "Bangla",
};

export type FilmLang = keyof typeof LANG_CODE_TO_LABEL;

/** True if the row's canonical_slug matches the Sovereign Series S2
 *  convention (v01-…, v02-…, etc.). Used to split the films-page
 *  rendering into two sections. */
export function isSovereignSeriesS2(film: { canonicalSlug: string }): boolean {
  return /^v\d+-/.test(film.canonicalSlug);
}

/** Days since the row's created_at. Used by the NEW-badge calculator. */
function daysSince(iso: string): number {
  const t = new Date(iso).getTime();
  return (Date.now() - t) / (1000 * 60 * 60 * 24);
}

/** Returns true if this film should show the NEW badge:
 *    - pinned_new_until > now() (manual override), OR
 *    - created_at + 30 days > now() (auto, default decay)
 */
export function shouldShowNewBadge(film: {
  createdAt: string;
  pinnedNewUntil: string | null;
}): boolean {
  if (film.pinnedNewUntil) {
    if (new Date(film.pinnedNewUntil).getTime() > Date.now()) return true;
  }
  return daysSince(film.createdAt) < 30;
}

/** Convert a snake_case DB row to the camelCase DbFilm shape. */
function rowToFilm(r: Record<string, unknown>): DbFilm {
  return {
    id: r.id as number,
    canonicalSlug: r.canonical_slug as string,
    slug: r.slug as string,
    language: r.language as string,
    languageFlag: r.language_flag as string,
    title: r.title as string,
    description: (r.description as string | null) ?? "",
    headline: (r.headline as string | null) ?? (r.title as string),
    tagline: (r.tagline as string | null) ?? "",
    directUrl: r.direct_url as string,
    posterUrl: (r.poster_url as string | null) ?? null,
    season: (r.season as number | null) ?? null,
    episode: (r.episode as number | null) ?? null,
    sortOrder: (r.sort_order as number) ?? 0,
    pinnedAt: (r.pinned_at as string | null) ?? null,
    pinnedNewUntil: (r.pinned_new_until as string | null) ?? null,
    createdAt: r.created_at as string,
  };
}

/** Fetch all published cinematic films for one language.
 *
 *  Sort key: COALESCE(pinned_at, created_at) DESC, id DESC
 *  — newest first, manual pin via pinned_at when set.
 *
 *  Returns empty array on DB error rather than throwing — callers can
 *  render an empty state and the page still ships. */
export async function fetchFilmsByLanguage(langCode: FilmLang): Promise<DbFilm[]> {
  const url = process.env[NEON_URL_ENV];
  if (!url) return [];
  const langLabel = LANG_CODE_TO_LABEL[langCode];
  try {
    const sql = neon(url);
    const rows = (await sql`
      SELECT
        id, canonical_slug, slug, language, language_flag,
        title, description, headline, tagline,
        direct_url, poster_url,
        season, episode, sort_order,
        pinned_at, pinned_new_until, created_at
      FROM videos
      WHERE category = 'cinematic'
        AND language = ${langLabel}
        AND published = true
      ORDER BY COALESCE(pinned_at, created_at) DESC, id DESC
    `) as Array<Record<string, unknown>>;
    return rows.map(rowToFilm);
  } catch (err) {
    console.error("[fetchFilmsByLanguage] DB error:", err);
    return [];
  }
}

/** Fetch a single film by canonical_slug + language. Used by the
 *  /films/[slug] detail page. Returns null if not found. */
export async function fetchFilmBySlug(
  canonicalSlug: string,
  langCode: FilmLang
): Promise<DbFilm | null> {
  const url = process.env[NEON_URL_ENV];
  if (!url) return null;
  const langLabel = LANG_CODE_TO_LABEL[langCode];
  try {
    const sql = neon(url);
    const rows = (await sql`
      SELECT
        id, canonical_slug, slug, language, language_flag,
        title, description, headline, tagline,
        direct_url, poster_url,
        season, episode, sort_order,
        pinned_at, pinned_new_until, created_at
      FROM videos
      WHERE category = 'cinematic'
        AND canonical_slug = ${canonicalSlug}
        AND language = ${langLabel}
        AND published = true
      LIMIT 1
    `) as Array<Record<string, unknown>>;
    if (rows.length === 0) return null;
    return rowToFilm(rows[0]);
  } catch (err) {
    console.error("[fetchFilmBySlug] DB error:", err);
    return null;
  }
}

/** Fetch ALL language variants of a canonical film. Used by the detail
 *  page's language switcher to know which languages are available. */
export async function fetchFilmTranslations(canonicalSlug: string): Promise<DbFilm[]> {
  const url = process.env[NEON_URL_ENV];
  if (!url) return [];
  try {
    const sql = neon(url);
    const rows = (await sql`
      SELECT
        id, canonical_slug, slug, language, language_flag,
        title, description, headline, tagline,
        direct_url, poster_url,
        season, episode, sort_order,
        pinned_at, pinned_new_until, created_at
      FROM videos
      WHERE category = 'cinematic'
        AND canonical_slug = ${canonicalSlug}
        AND published = true
      ORDER BY
        CASE language
          WHEN 'English' THEN 1
          WHEN 'German' THEN 2
          WHEN 'Hindi' THEN 3
          WHEN 'Indonesian' THEN 4
          ELSE 5
        END
    `) as Array<Record<string, unknown>>;
    return rows.map(rowToFilm);
  } catch {
    return [];
  }
}

/** Fetch every published cinematic film slug — used by
 *  generateStaticParams on the detail route. Returns the canonical
 *  slugs (deduplicated across languages, since the route is
 *  /films/[canonical-slug]?lang=…). */
export async function fetchAllFilmSlugs(): Promise<string[]> {
  const url = process.env[NEON_URL_ENV];
  if (!url) return [];
  try {
    const sql = neon(url);
    const rows = (await sql`
      SELECT DISTINCT canonical_slug
      FROM videos
      WHERE category = 'cinematic'
        AND canonical_slug IS NOT NULL
        AND published = true
    `) as Array<{ canonical_slug: string }>;
    return rows.map(r => r.canonical_slug);
  } catch {
    return [];
  }
}

/** Section grouping for the films listing page. Sovereign Series S2
 *  goes first (it's the newest content); original Cinematic Universe
 *  groups by season 1-4 below. */
export function groupFilmsForListing(films: DbFilm[]): {
  sovereignSeries: DbFilm[];
  cinematicUniverse: Record<number, DbFilm[]>;
} {
  const sovereignSeries: DbFilm[] = [];
  const cinematicUniverse: Record<number, DbFilm[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const film of films) {
    if (isSovereignSeriesS2(film)) {
      sovereignSeries.push(film);
    } else if (film.season && film.season >= 1 && film.season <= 4) {
      cinematicUniverse[film.season].push(film);
    }
    // Films without a season + not S2 are dropped from the grouped
    // rendering — they shouldn't exist in production but the defensive
    // skip prevents undefined-season rows from breaking the page.
  }
  // Sort sovereign series by V01..V20 order (sort_order = video number)
  sovereignSeries.sort((a, b) => a.sortOrder - b.sortOrder);
  return { sovereignSeries, cinematicUniverse };
}
