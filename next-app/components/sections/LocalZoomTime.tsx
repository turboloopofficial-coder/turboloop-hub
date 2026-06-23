"use client";

// LocalZoomTime — detects the user's local timezone via Intl API and
// renders the call time in their local clock.
//
// Strategy:
//  1. On mount, read Intl.DateTimeFormat().resolvedOptions().timeZone
//  2. Compute the next call occurrence as a Date (UTC)
//  3. Format it using the user's local timezone via Intl.DateTimeFormat
//  4. Display "Today at HH:MM AM/PM (TZ)" with a highlighted pill
//
// Falls back to showing the UTC time if the Intl API is unavailable.
// Renders nothing on the server (SSR) to avoid timezone mismatch flicker.

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

interface Props {
  /** Daily start time in minutes since UTC 00:00. */
  startUtcMin: number;
}

function getLocalCallTime(startUtcMin: number): {
  timeStr: string;
  tzName: string;
  tzAbbr: string;
} {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    // Build today's UTC call start as a Date
    const todayUTC = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    );
    let callStart = new Date(todayUTC + startUtcMin * 60_000);
    // If the call has already ended today (past start + 2h), show tomorrow
    if (now.getTime() > callStart.getTime() + 2 * 60 * 60_000) {
      callStart = new Date(callStart.getTime() + 24 * 60 * 60_000);
    }

    // Format the time in the user's local timezone
    const timeStr = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(callStart);

    // Get the timezone abbreviation (e.g. "IST", "EST", "CET")
    const tzAbbr = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    })
      .formatToParts(callStart)
      .find((p) => p.type === "timeZoneName")?.value ?? tz;

    // Get a human-readable timezone name (e.g. "India Standard Time")
    const tzName = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "long",
    })
      .formatToParts(callStart)
      .find((p) => p.type === "timeZoneName")?.value ?? tz;

    return { timeStr, tzName, tzAbbr };
  } catch {
    // Fallback: show UTC time
    const h = Math.floor(startUtcMin / 60);
    const m = startUtcMin % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    const timeStr = `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
    return { timeStr, tzName: "Coordinated Universal Time", tzAbbr: "UTC" };
  }
}

export function LocalZoomTime({ startUtcMin }: Props) {
  const [local, setLocal] = useState<{
    timeStr: string;
    tzName: string;
    tzAbbr: string;
  } | null>(null);

  useEffect(() => {
    setLocal(getLocalCallTime(startUtcMin));
  }, [startUtcMin]);

  // Don't render on server — wait for client hydration to avoid TZ mismatch
  if (!local) return null;

  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--r-md)] text-sm font-bold"
      style={{
        background: "color-mix(in oklab, var(--c-brand-cyan) 10%, var(--c-bg))",
        border: "1px solid color-mix(in oklab, var(--c-brand-cyan) 30%, transparent)",
        color: "var(--c-brand-cyan)",
      }}
    >
      <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
      <span>
        Your time:{" "}
        <span className="tabular-nums">{local.timeStr}</span>
        {" "}
        <span
          className="text-[0.6875rem] font-bold tracking-[0.12em] uppercase opacity-80"
        >
          {local.tzAbbr}
        </span>
      </span>
    </div>
  );
}
