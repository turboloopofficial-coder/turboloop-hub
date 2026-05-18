// Server-only Zoom config resolver (Task C — admin-editable Zoom links).
//
// Why this lives in `server/` and not `shared/`:
//   `shared/zoomEvents.ts` is imported by next-app's EventsSection
//   (a server component on the marketing site). Pulling `server/db.ts`
//   into that bundle would drag Neon + Drizzle into the next-app build
//   for no reason — EventsSection only uses the static constants +
//   timing helpers from shared/. Keeping the DB-aware getter here
//   means only cron-master + future admin code imports it.
//
// Admin overrides live in the existing `site_settings` table under:
//   zoom_en_link, zoom_en_passcode
//   zoom_hi_link, zoom_hi_passcode
//
// Time-of-day fields (`startUtcMin`, `durationMin`, `timeLabel`) are
// intentionally NOT admin-editable — they're load-bearing for the cron
// reminder windows (`isInWindow(15, 0)` / `isInWindow(16, 30)`), and an
// accidental edit could schedule a reminder for a call that already
// ended.

import { getSetting } from "./db";
import {
  ZOOM_EN,
  ZOOM_HI,
  ZOOM_URL_PATTERN,
  type ZoomSession,
} from "../shared/zoomEvents";

const DEFAULTS: Record<"en" | "hi", ZoomSession> = {
  en: ZOOM_EN,
  hi: ZOOM_HI,
};

/** Reads admin overrides for a Zoom session and merges them over the
 *  hardcoded defaults. Each cron tick calls this once per lang — the
 *  DB lookup is two SELECTs against an indexed key, ~20 ms total. We
 *  don't cache across calls because Vercel lambdas are stateless and
 *  the values are read at most twice per cron tick.
 *
 *  Validation:
 *   - `link` must match ZOOM_URL_PATTERN; invalid → fall back to default
 *   - `passcode` must be a non-empty string after trim
 *   - DB error → log + return default (never skip a reminder over a
 *     transient Neon hiccup) */
export async function getZoomConfig(
  lang: "en" | "hi"
): Promise<ZoomSession> {
  const base = DEFAULTS[lang];
  try {
    const [link, passcode] = await Promise.all([
      getSetting(`zoom_${lang}_link`),
      getSetting(`zoom_${lang}_passcode`),
    ]);
    return {
      ...base,
      link: link && ZOOM_URL_PATTERN.test(link) ? link : base.link,
      passcode:
        passcode && passcode.trim().length > 0
          ? passcode.trim()
          : base.passcode,
    };
  } catch (err) {
    console.error(
      `[zoom-config] getZoomConfig(${lang}) failed; using defaults:`,
      err instanceof Error ? err.message : String(err)
    );
    return base;
  }
}
