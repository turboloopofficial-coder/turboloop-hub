// DB-driven reels data layer. Covers the `presentation`,
// `how-to-join`, and `withdraw-compound` video categories — anything
// non-cinematic (i.e., NOT in /films).
//
// Sort: ORDER BY COALESCE(pinned_at, created_at) DESC, id DESC — newest
// reels first, manual pin override available.
//
// Reels can be backed by EITHER an R2-hosted mp4 (`direct_url`) OR a
// YouTube embed (`youtube_url`). The newer how-to-join + withdraw-
// compound multi-lang sets are YouTube-only; the older S2 reels live
// on R2. The detail page picks the right player.

import { neon } from "@neondatabase/serverless";

export interface DbReel {
  id: number;
  /** Canonical slug — from the `slug` column in the DB. Populated for
   *  every row by the Batch 1 slug-fix migration. */
  slug: string;
  title: string;
  description: string;
  tagline: string;
  /** R2-hosted mp4. Null for YouTube-only reels. */
  directUrl: string | null;
  /** Full YouTube URL (e.g. https://youtu.be/abc or https://www.youtube.com/watch?v=abc).
   *  Null for R2-only reels. At least one of directUrl or youtubeUrl is
   *  guaranteed to be non-null. */
  youtubeUrl: string | null;
  /** Derived 11-char YouTube ID for embed src, or null. */
  youtubeId: string | null;
  thumbUrl: string;
  /** What category the row came from. Lets the listing page group + the
   *  detail page render appropriate breadcrumb labels. */
  category: "presentation" | "how-to-join" | "withdraw-compound" | string;
  language: string;
  languageFlag: string;
  pinnedAt: string | null;
  pinnedNewUntil: string | null;
  createdAt: string;
}

const NEON_URL_ENV = "DATABASE_URL";

/** Parse a YouTube URL into its 11-char video ID. Handles youtu.be
 *  short links, watch?v= long links, and /embed/ paths. */
function youtubeIdFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (/youtube\.com$/.test(u.hostname.replace(/^www\./, ""))) {
      // watch?v= form
      const v = u.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      // /embed/<id>, /shorts/<id> forms
      const m = u.pathname.match(/\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[1];
    }
  } catch {}
  return null;
}

/** Derive the thumbnail URL. For R2-hosted reels use the convention
 *  /reels/<slug>.mp4 → /reel-thumbs/<slug>.jpg. For YouTube videos,
 *  fall back to the standard `hqdefault.jpg` thumbnail. Defaults to
 *  empty string if nothing usable can be derived. */
function thumbForRow(
  posterUrl: string | null,
  directUrl: string | null,
  youtubeId: string | null
): string {
  if (posterUrl) return posterUrl;
  if (directUrl) {
    try {
      const u = new URL(directUrl);
      u.pathname = u.pathname
        .replace(/^\/reels\//, "/reel-thumbs/")
        .replace(/\.mp4$/i, ".jpg");
      return u.toString();
    } catch {}
  }
  if (youtubeId) {
    return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  }
  return "";
}

function rowToReel(r: Record<string, unknown>): DbReel | null {
  const slug = (r.slug as string | null) ?? null;
  if (!slug) return null;
  const directUrl = (r.direct_url as string | null) ?? null;
  const youtubeUrl = (r.youtube_url as string | null) ?? null;
  if (!directUrl && !youtubeUrl) return null; // unplayable
  const youtubeId = youtubeIdFromUrl(youtubeUrl);
  const posterUrl = (r.poster_url as string | null) ?? null;
  return {
    id: r.id as number,
    slug,
    title: r.title as string,
    description: (r.description as string | null) ?? "",
    tagline:
      (r.tagline as string | null) ||
      ((r.description as string | null) ?? "").split(/\n\n|\. /)[0] ||
      "",
    directUrl,
    youtubeUrl,
    youtubeId,
    thumbUrl: thumbForRow(posterUrl, directUrl, youtubeId),
    category: (r.category as string) ?? "presentation",
    language: (r.language as string) ?? "English",
    languageFlag: (r.language_flag as string) ?? "🇬🇧",
    pinnedAt: (r.pinned_at as string | null) ?? null,
    pinnedNewUntil: (r.pinned_new_until as string | null) ?? null,
    createdAt: r.created_at as string,
  };
}

/** Fetch all published reels (anything non-cinematic with at least one
 *  playable source). Sorted newest first; manual pin overrides via
 *  pinned_at. Filters rows missing a slug — those are unrouteable. */
export async function fetchAllReels(): Promise<DbReel[]> {
  const url = process.env[NEON_URL_ENV];
  if (!url) return [];
  try {
    const sql = neon(url);
    const rows = (await sql`
      SELECT
        id, title, description, tagline,
        slug, category,
        direct_url, youtube_url, poster_url,
        language, language_flag,
        pinned_at, pinned_new_until, created_at
      FROM videos
      WHERE category IN ('presentation', 'how-to-join', 'withdraw-compound')
        AND slug IS NOT NULL
        AND slug != ''
        AND (direct_url IS NOT NULL OR youtube_url IS NOT NULL)
        AND published = true
      ORDER BY COALESCE(pinned_at, created_at) DESC, id DESC
    `) as Array<Record<string, unknown>>;
    return rows
      .map(rowToReel)
      .filter((r): r is DbReel => r !== null);
  } catch (err) {
    console.error("[fetchAllReels] DB error:", err);
    return [];
  }
}

/** Re-export shouldShowNewBadge from filmsApi so reel cards can use
 *  the same computation. The logic is identical: pinned_new_until
 *  override or 30-day created_at decay. */
export { shouldShowNewBadge } from "./filmsApi";
