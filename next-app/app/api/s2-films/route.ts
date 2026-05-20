// /api/s2-films — public read API for the Sovereign Series Season 2 films.
//
// Returns the 20-film catalogue for one language at a time. Mirrors the
// /api/zoom-config pattern (direct Neon HTTP, no tRPC hop) so the
// /films page can stay statically prerendered while still pulling
// fresh DB content via client-side fetch.
//
// Query params:
//   ?lang=en|de|hi|id   — language filter. Defaults to 'en'.
//
// Response shape (200 OK):
//   {
//     lang: "en",
//     films: [
//       { canonicalSlug, title, headline, tagline, description,
//         directUrl, posterUrl, videoNum }, ...
//     ]
//   }
//
// Empty arrays are valid (e.g. a language has no films yet) — never
// returns 404 for a missing language so the frontend can render an
// empty-state UI without error handling.

import { neon } from "@neondatabase/serverless";

export const runtime = "edge";

const LANG_MAP: Record<string, string> = {
  en: "English",
  de: "German",
  hi: "Hindi",
  id: "Indonesian",
};

const CACHE_HEADER =
  "public, max-age=60, s-maxage=60, stale-while-revalidate=300";

interface S2Film {
  canonicalSlug: string;
  title: string;
  headline: string;
  tagline: string;
  description: string;
  directUrl: string;
  posterUrl: string | null;
  videoNum: number;
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const langCode = (url.searchParams.get("lang") || "en").toLowerCase();
  const langLabel = LANG_MAP[langCode];

  if (!langLabel) {
    return Response.json(
      { error: `Unknown lang code: ${langCode}. Supported: en, de, hi, id.` },
      { status: 400 }
    );
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return Response.json(
      { lang: langCode, films: [] },
      { headers: { "Cache-Control": "public, max-age=10" } }
    );
  }

  try {
    const sql = neon(dbUrl);
    // The S2 films are distinguished by canonical_slug starting with 'v'
    // followed by a 2-digit number — the EN seed enforces that convention
    // (e.g. v01-2500-families-80-countries). The 20 original Cinematic
    // Universe films use other slug shapes ("the-001-percent-lie" etc.)
    // so this LIKE pattern picks up only the S2 catalogue.
    const rows = await sql`
      SELECT
        canonical_slug,
        title,
        headline,
        tagline,
        description,
        direct_url,
        poster_url,
        sort_order AS video_num
      FROM videos
      WHERE category = 'cinematic'
        AND language = ${langLabel}
        AND canonical_slug LIKE 'v%'
        AND published = true
      ORDER BY sort_order ASC
    `;

    const films: S2Film[] = (
      rows as Array<{
        canonical_slug: string;
        title: string;
        headline: string | null;
        tagline: string | null;
        description: string | null;
        direct_url: string;
        poster_url: string | null;
        video_num: number;
      }>
    ).map(r => ({
      canonicalSlug: r.canonical_slug,
      title: r.title,
      headline: r.headline ?? r.title,
      tagline: r.tagline ?? "",
      description: r.description ?? "",
      directUrl: r.direct_url,
      posterUrl: r.poster_url,
      videoNum: r.video_num,
    }));

    return Response.json(
      { lang: langCode, films },
      { headers: { "Cache-Control": CACHE_HEADER } }
    );
  } catch (err) {
    console.error("[/api/s2-films] DB read failed:", err);
    return Response.json(
      { lang: langCode, films: [] },
      { headers: { "Cache-Control": "public, max-age=10" } }
    );
  }
}
