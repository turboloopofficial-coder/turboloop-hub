// DB-driven reels data layer. Parallel to lib/filmsApi.ts but for the
// `presentation` category rows that carry `direct_url`.
//
// Sort: ORDER BY COALESCE(pinned_at, created_at) DESC, id DESC — newest
// reels first, manual pin override available.
//
// Note: reels have always been DB-driven (no static FILMS-array
// equivalent), but the previous code path sorted by sort_order ASC
// which buried the newer S2 reels behind the older S1 set. Switching
// to created_at DESC is the actual fix.

import { neon } from "@neondatabase/serverless";

export interface DbReel {
  id: number;
  slug: string;
  title: string;
  description: string;
  tagline: string;
  directUrl: string;
  thumbUrl: string;
  language: string;
  languageFlag: string;
  pinnedAt: string | null;
  pinnedNewUntil: string | null;
  createdAt: string;
}

const NEON_URL_ENV = "DATABASE_URL";

/** Derive the reel's slug from its direct_url, matching the convention
 *  used by HomeReelsSection's thumbForReel(). The R2 path follows
 *  `/reels/<slug>.mp4`. */
function slugFromUrl(videoUrl: string | null): string | null {
  if (!videoUrl) return null;
  try {
    const u = new URL(videoUrl);
    const m = u.pathname.match(/\/reels\/([a-z0-9-]+)\.mp4$/i);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/** Derive the thumbnail URL from a video URL. Mirrors the path
 *  convention used by the original HomeReelsSection helper. */
function thumbFromUrl(videoUrl: string): string {
  try {
    const u = new URL(videoUrl);
    u.pathname = u.pathname
      .replace(/^\/reels\//, "/reel-thumbs/")
      .replace(/\.mp4$/i, ".jpg");
    return u.toString();
  } catch {
    return "";
  }
}

function rowToReel(r: Record<string, unknown>): DbReel | null {
  const directUrl = r.direct_url as string | null;
  if (!directUrl) return null;
  const slug = slugFromUrl(directUrl);
  if (!slug) return null;
  return {
    id: r.id as number,
    slug,
    title: r.title as string,
    description: (r.description as string | null) ?? "",
    // The seed script populates `tagline` from the writeup's
    // **CTA:** or **Hook:** field. Falls back to the first paragraph
    // of description so cards always have something to show.
    tagline:
      (r.tagline as string | null) ||
      ((r.description as string | null) ?? "").split(/\n\n|\. /)[0] ||
      "",
    directUrl,
    thumbUrl: thumbFromUrl(directUrl),
    language: (r.language as string) ?? "English",
    languageFlag: (r.language_flag as string) ?? "🇬🇧",
    pinnedAt: (r.pinned_at as string | null) ?? null,
    pinnedNewUntil: (r.pinned_new_until as string | null) ?? null,
    createdAt: r.created_at as string,
  };
}

/** Fetch all published reels (videos with direct_url, category=presentation).
 *  Sorted newest first; manual pin overrides via pinned_at. */
export async function fetchAllReels(): Promise<DbReel[]> {
  const url = process.env[NEON_URL_ENV];
  if (!url) return [];
  try {
    const sql = neon(url);
    const rows = (await sql`
      SELECT
        id, title, description, tagline,
        direct_url, language, language_flag,
        pinned_at, pinned_new_until, created_at
      FROM videos
      WHERE category = 'presentation'
        AND direct_url IS NOT NULL
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
