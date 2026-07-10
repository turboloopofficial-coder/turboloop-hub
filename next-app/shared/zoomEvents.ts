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
  /** "en" | "hi" | "af" | "th" — used for banner palette + cron de-dup keys */
  lang: "en" | "hi" | "af" | "th";
  /** Marketing title for the countdown card */
  title: string;
  /** One-line tease shown under the title */
  description: string;
  /** Permanent join URL (Zoom or Google Meet) */
  link: string;
  /** Meeting passcode shown in the card and message body. Empty string for Google Meet sessions. */
  passcode: string;
  /** "zoom" | "meet" — determines button label and icon in UI + TG alerts */
  platform?: "zoom" | "meet";
  /** Display label like "5:00 PM UTC daily" — what the user sees */
  timeLabel: string;
  /** Daily start time in minutes since UTC 00:00 (e.g. 17 * 60 = 1020) */
  startUtcMin: number;
  /** Call duration in minutes — used to detect "Live now" window */
  durationMin: number;
  /**
   * Optional: which UTC days-of-week this session runs.
   * Uses JS getUTCDay() convention: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat.
   * If omitted, the session runs every day.
   */
  daysOfWeek?: number[];
}

export const ZOOM_EN: ZoomSession = {
  lang: "en",
  title: "Daily English Community Call",
  description:
    "Every day. Bring your questions. Real people, real answers — no pitch, no pressure.",
  link: "https://us06web.zoom.us/j/83982689908?pwd=anMZaPJ8GXRPoJbGabeVQy4fkIq4tc.1",
  passcode: "552740",
  // Time label and startUtcMin are date-driven: 4pm UTC on 2026-06-12, else 5pm UTC.
  // Auto-reverts the next day — no manual cleanup needed.
  timeLabel: (() => {
    const isEarlyDay = new Date().toISOString().slice(0, 10) === "2026-06-12";
    return isEarlyDay
      ? "🕓 4:00 PM UTC\n" +
        "🇮🇳 9:30 PM IST · 🇵🇰 9:00 PM PKT · 🇧🇩 10:00 PM BST · 🇳🇵 9:45 PM NPT\n" +
        "🇦🇪 8:00 PM GST · 🇸🇦 7:00 PM AST · 🇹🇷 7:00 PM TRT · 🇷🇺 7:00 PM MSK\n" +
        "🇳🇬 5:00 PM WAT · 🇬🇭 4:00 PM GMT · 🇿🇦 6:00 PM SAST · 🇰🇪 7:00 PM EAT\n" +
        "🇬🇧 4:00 PM BST · 🇩🇪 6:00 PM CEST · 🇫🇷 6:00 PM CEST\n" +
        "🇺🇸 12:00 PM EDT · 🇺🇸 9:00 AM PDT · 🇧🇷 1:00 PM BRT · 🇦🇺 2:00 AM AEST+1"
      : "🕔 5:00 PM UTC\n" +
        "🇮🇳 10:30 PM IST · 🇵🇰 10:00 PM PKT · 🇧🇩 11:00 PM BST · 🇳🇵 10:45 PM NPT\n" +
        "🇦🇪 9:00 PM GST · 🇸🇦 8:00 PM AST · 🇹🇷 8:00 PM TRT · 🇷🇺 8:00 PM MSK\n" +
        "🇳🇬 6:00 PM WAT · 🇬🇭 5:00 PM GMT · 🇿🇦 7:00 PM SAST · 🇰🇪 8:00 PM EAT\n" +
        "🇬🇧 5:00 PM BST · 🇩🇪 7:00 PM CEST · 🇫🇷 7:00 PM CEST\n" +
        "🇺🇸 1:00 PM EDT · 🇺🇸 10:00 AM PDT · 🇧🇷 2:00 PM BRT · 🇦🇺 3:00 AM AEST+1";
  })(),
  startUtcMin: new Date().toISOString().slice(0, 10) === "2026-06-12" ? 16 * 60 : 17 * 60, // auto-reverts
  durationMin: 120,
  // No daysOfWeek → runs every day
};

export const ZOOM_HI: ZoomSession = {
  lang: "hi",
  title: "Daily Hindi / Urdu Call",
  description:
    "हर दिन. अपने सवाल लाइए. असली लोग, असली जवाब — कोई दबाव नहीं. India 🇮🇳 · Pakistan 🇵🇰 · Bangladesh 🇧🇩 · Nepal 🇳🇵 · Dubai 🇦🇪",
  link: "https://us06web.zoom.us/j/4455663232?pwd=vHG9ahPKpl238DfyE0LpoRGUj91ULB.1",
  passcode: "1234",
  // 15:30 UTC mapped per region — same moment in time, different
  // local clocks. The flag prefixes let mobile readers scan their
  // own row at a glance without reading the whole line.
  timeLabel:
    "🇮🇳 9:00 PM IST · 🇵🇰 8:30 PM PKT · 🇧🇩 9:30 PM BST · 🇳🇵 9:15 PM NPT · 🇦🇪 7:30 PM GST",
  startUtcMin: 15 * 60 + 30, // 15:30 UTC = 9:00 PM IST
  durationMin: 120,
  // No daysOfWeek → runs every day
};

// ── African Community Zoom ────────────────────────────────────────────────
// Mon, Wed, Sat · 8 PM WAT = 19:00 UTC
// Hosts: Sammywealth, Eloho, Amb. Eddie
export const ZOOM_AF: ZoomSession = {
  lang: "af",
  title: "African Community Call",
  description:
    "Mon · Wed · Sat. Overview, security, transparency and opportunities. Hosts: Sammywealth, Eloho & Amb. Eddie.",
  link: "https://us06web.zoom.us/j/84609583422?pwd=YvicUhZIUO41DgSugs9aAbcxI3vZyb.1",
  passcode: "H97KJx",
  timeLabel:
    "🇳🇬 8:00 PM WAT · 🇬🇭 7:00 PM GMT · 🇿🇦 9:00 PM SAST · 🇰🇪 10:00 PM EAT\n" +
    "🇬🇧 7:00 PM BST · 🇩🇪 9:00 PM CEST · 🇦🇪 11:00 PM GST\n" +
    "Mon · Wed · Sat only",
  startUtcMin: 19 * 60, // 19:00 UTC = 8 PM WAT
  durationMin: 120,
  daysOfWeek: [1, 3, 6], // Mon, Wed, Sat (JS getUTCDay: 0=Sun…6=Sat)
};

// ── Thai Saturday Morning Google Meet ────────────────────────────────────
// Saturday only · 9:00 AM ICT = 02:00 UTC
export const ZOOM_TH_AM: ZoomSession = {
  lang: "th",
  platform: "meet",
  title: "Thai Saturday Morning Call",
  description: "วันเสาร์. นำคำถามของคุณมา. คนจริง คำตอบจริง — ไม่มีแรงกดดัน.",
  link: "https://meet.google.com/nmh-hhkr-uzd",
  passcode: "",
  timeLabel: "🇹🇭 9:00 AM ICT · วันเสาร์ (Saturday only)",
  startUtcMin: 2 * 60, // 02:00 UTC = 9:00 AM ICT
  durationMin: 90,
  daysOfWeek: [6], // Saturday only (JS getUTCDay: 6=Sat)
};

// ── Thai Evening Google Meet ──────────────────────────────────────────────
// Sun, Tue, Thu · 8:00 PM ICT = 13:00 UTC
export const ZOOM_TH: ZoomSession = {
  lang: "th",
  platform: "meet",
  title: "Thai Evening Community Call",
  description: "อาทิตย์ · อังคาร · พฤหัสบดี. นำคำถามของคุณมา. คนจริง คำตอบจริง — ไม่มีแรงกดดัน.",
  link: "https://meet.google.com/nmh-hhkr-uzd",
  passcode: "",
  timeLabel: "🇹🇭 8:00 PM ICT · อาทิตย์ · อังคาร · พฤหัสบดี (Sun · Tue · Thu)",
  startUtcMin: 13 * 60, // 13:00 UTC = 8:00 PM ICT
  durationMin: 90,
  daysOfWeek: [0, 2, 4], // Sun, Tue, Thu (JS getUTCDay: 0=Sun, 2=Tue, 4=Thu)
};

export const ZOOM_SESSIONS: ZoomSession[] = [ZOOM_EN, ZOOM_HI, ZOOM_AF, ZOOM_TH_AM, ZOOM_TH];

/** URL shape that the admin-editable Zoom override (Task C) accepts.
 *  Exposed here so both the admin form validator and the server-side
 *  config reader can reference one regex. */
export const ZOOM_URL_PATTERN = /^https:\/\/([a-z0-9.-]+\.zoom\.us\/j\/\d+|meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3})/i;

/**
 * Next occurrence of a Zoom session as a UTC Date.
 *
 * Respects `session.daysOfWeek` — if the session only runs on certain days,
 * the function skips forward until the next valid day.
 *
 * If the session is currently in progress, returns the start time of the
 * current occurrence (so the UI can render an "Ends in" countdown).
 * Otherwise returns the next future start.
 */
export function nextZoomOccurrence(
  session: ZoomSession,
  now: Date = new Date()
): Date {
  const days = session.daysOfWeek; // undefined → runs every day

  // Helper: is a given UTC day-of-week a valid session day?
  const isValidDay = (utcDay: number) =>
    !days || days.includes(utcDay);

  const ms = now.getTime();

  // Walk forward up to 7 days to find the next valid occurrence
  for (let offset = 0; offset <= 7; offset++) {
    const candidateStart =
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + offset
      ) +
      session.startUtcMin * 60_000;

    const candidateDay = new Date(candidateStart).getUTCDay();

    if (!isValidDay(candidateDay)) continue;

    const candidateEnd = candidateStart + session.durationMin * 60_000;

    if (offset === 0) {
      // Today's slot
      if (ms >= candidateStart && ms < candidateEnd) {
        // Currently live — return start so UI shows "Ends in"
        return new Date(candidateStart);
      }
      if (ms < candidateStart) {
        // Still upcoming today
        return new Date(candidateStart);
      }
      // Already ended today — continue to next valid day
      continue;
    }

    // Future day — always valid
    return new Date(candidateStart);
  }

  // Fallback (should never reach here for well-formed daysOfWeek)
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) +
      session.startUtcMin * 60_000
  );
}
