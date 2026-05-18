// Public Zoom-config reader for the marketing site's Events page.
//
// Mirrors what server/zoom-config.ts does for the legacy cron, but
// served from next-app so the client-side EventsSection.tsx can fetch
// it without going through the cross-project tRPC handler at
// api.turboloop.tech (which would add a network hop + CORS overhead).
//
// Returns { en: { link, passcode }, hi: { link, passcode } } when
// admin overrides are present + valid; omits any lang whose override
// is missing or fails URL validation. EventsSection.tsx merges this
// over hardcoded ZoomSession defaults, so a missing field cleanly
// falls back to the shipped default (the same pattern as the cron).
//
// The cron-side validator (ZOOM_URL_PATTERN, exported from
// shared/zoomEvents.ts) is the single source of truth — same regex
// applied here so a typo'd URL doesn't leak to the public site even if
// it somehow landed in site_settings.

import { neon } from "@neondatabase/serverless";
import { ZOOM_URL_PATTERN } from "@shared/zoomEvents";

export const runtime = "edge";

// Brief in-memory cache via Vercel CDN headers — every 60s the route
// fetches fresh from Neon. The DB read is two indexed SELECTs against
// the `site_settings` table, but Cf's edge cache absorbs the bulk of
// traffic so Neon doesn't see one query per page view.
const CACHE_HEADER =
  "public, max-age=60, s-maxage=60, stale-while-revalidate=300";

interface ZoomOverride {
  link?: string;
  passcode?: string;
}

interface Response_ {
  en: ZoomOverride;
  hi: ZoomOverride;
}

function emptyResponse(): Response_ {
  return { en: {}, hi: {} };
}

export async function GET(): Promise<Response> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // No DB configured (local dev without .env.local) — return empty
    // overrides so the client falls back to its hardcoded defaults.
    return Response.json(emptyResponse(), {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }

  try {
    const sql = neon(url);
    // One indexed query covering both langs — cheaper than 4 round
    // trips. setting_key is the primary key on site_settings so this
    // is an index-only lookup.
    const rows = await sql`
      SELECT setting_key, setting_value
      FROM site_settings
      WHERE setting_key IN (
        'zoom_en_link', 'zoom_en_passcode',
        'zoom_hi_link', 'zoom_hi_passcode'
      )
    `;

    const result = emptyResponse();
    for (const row of rows as Array<{
      setting_key: string;
      setting_value: string;
    }>) {
      const value = (row.setting_value ?? "").trim();
      if (value.length === 0) continue;
      switch (row.setting_key) {
        case "zoom_en_link":
          if (ZOOM_URL_PATTERN.test(value)) result.en.link = value;
          break;
        case "zoom_en_passcode":
          result.en.passcode = value;
          break;
        case "zoom_hi_link":
          if (ZOOM_URL_PATTERN.test(value)) result.hi.link = value;
          break;
        case "zoom_hi_passcode":
          result.hi.passcode = value;
          break;
      }
    }

    return Response.json(result, {
      headers: { "Cache-Control": CACHE_HEADER },
    });
  } catch (err) {
    // Neon outage → empty overrides → client uses defaults. We log to
    // the lambda console but don't surface a 500 — the page must keep
    // working with the shipped defaults.
    console.error("[/api/zoom-config] DB read failed:", err);
    return Response.json(emptyResponse(), {
      headers: { "Cache-Control": "public, max-age=10" },
    });
  }
}
