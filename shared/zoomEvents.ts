// Single source of truth for the recurring Zoom sessions.
//
// Read by:
//   - server/_vercel/cron-master.ts — daily T-30 reminder broadcasts
//   - next-app/components/sections/EventsSection.tsx — live countdown timer
//
// startUtcMin is "minutes since 00:00 UTC" — easier to compute the next
// occurrence than parsing 12-hour strings with timezones at runtime.
// Keep ZOOM_EN.startUtcMin == 17:00 UTC and ZOOM_HI.startUtcMin == 15:30 UTC
// in sync with the cron T-30 windows (`isInWindow(16, 30)` and
// `isInWindow(15, 0)`).

export interface ZoomSession {
  /** "en" | "hi" — used for banner palette + cron de-dup keys */
  lang: "en" | "hi";
  /** Marketing title for the countdown card */
  title: string;
  /** One-line tease shown under the title */
  description: string;
  /** Permanent Zoom join URL */
  link: string;
  /** Meeting passcode shown in the card and message body */
  passcode: string;
  /** Display label like "5:00 PM UTC daily" — what the user sees */
  timeLabel: string;
  /** Daily start time in minutes since UTC 00:00 (e.g. 17 * 60 = 1020) */
  startUtcMin: number;
  /** Call duration in minutes — used to detect "Live now" window */
  durationMin: number;
}

export const ZOOM_EN: ZoomSession = {
  lang: "en",
  title: "Daily English Community Call",
  description:
    "Every day. Bring your questions. Real people, real answers — no pitch, no pressure.",
  link: "https://us06web.zoom.us/j/8347511147?pwd=g6wTqhrngaUDNbMasv9LE8iJQOSJua.1",
  passcode: "669529",
  timeLabel: "5:00 PM UTC daily",
  startUtcMin: 17 * 60, // 17:00 UTC
  durationMin: 120,
};

export const ZOOM_HI: ZoomSession = {
  lang: "hi",
  title: "Daily Hindi / Urdu Call",
  description:
    "हर दिन. अपने सवाल लाइए. असली लोग, असली जवाब — कोई दबाव नहीं.",
  link: "https://us06web.zoom.us/j/4455663232?pwd=vHG9ahPKpl238DfyE0LpoRGUj91ULB.1",
  passcode: "1234",
  timeLabel: "9:00 PM IST daily",
  startUtcMin: 15 * 60 + 30, // 15:30 UTC = 9:00 PM IST
  durationMin: 120,
};

export const ZOOM_SESSIONS: ZoomSession[] = [ZOOM_EN, ZOOM_HI];

/**
 * Next occurrence of a Zoom session as a Date in the user's local time.
 * If the session has started but is still within `durationMin`, returns the
 * start time of the in-progress session (so the UI can render an "Ends in"
 * countdown). Otherwise returns the next future start.
 */
export function nextZoomOccurrence(
  session: ZoomSession,
  now: Date = new Date()
): Date {
  const ms = now.getTime();
  const todayStart = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const todayCallStart = todayStart + session.startUtcMin * 60_000;
  const todayCallEnd = todayCallStart + session.durationMin * 60_000;

  // In-progress today
  if (ms >= todayCallStart && ms < todayCallEnd) {
    return new Date(todayCallStart);
  }
  // Already ended today → tomorrow
  if (ms >= todayCallEnd) {
    return new Date(todayCallStart + 24 * 60 * 60_000);
  }
  // Still upcoming today
  return new Date(todayCallStart);
}
