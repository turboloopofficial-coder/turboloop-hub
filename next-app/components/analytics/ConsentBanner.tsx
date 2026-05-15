// Bottom-corner cookie consent banner. GDPR-compliant pairing with
// Consent Mode v2 (see GoogleAnalytics.tsx).
//
// Behaviour:
//   - First visit: localStorage has no value → banner appears
//   - Accept → consent stored as "granted" + gtag updates → banner hides
//   - Decline → consent stored as "denied"  + gtag stays denied → banner hides
//   - Returning visitors: decision is restored by the inline consent
//     script in app/layout.tsx; this banner stays hidden
//
// If NEXT_PUBLIC_GA_MEASUREMENT_ID is unset, the banner renders nothing —
// there's no point asking permission to load analytics that aren't there.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { setAnalyticsConsent } from "./GoogleAnalytics";

const STORAGE_KEY = "turboloop_consent";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // Storage blocked (private mode etc.) — don't badger the user.
    }
  }, []);

  function decide(value: "granted" | "denied") {
    setAnalyticsConsent(value);
    setVisible(false);
  }

  if (!GA_ID || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-40 rounded-[var(--r-xl)] border border-[var(--c-border-strong)] bg-[var(--c-surface)] shadow-[var(--s-xl)] p-5"
    >
      <button
        type="button"
        onClick={() => decide("denied")}
        className="absolute top-3 right-3 text-[var(--c-text-subtle)] hover:text-[var(--c-text)] p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-brand-cyan)]"
        aria-label="Decline cookies"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-brand-cyan)] mb-2">
        Privacy
      </div>
      <h2 className="text-base font-bold text-[var(--c-text)] mb-2">
        We use cookies for analytics.
      </h2>
      <p className="text-sm text-[var(--c-text-muted)] leading-relaxed mb-4">
        Helps us learn which content is useful — never sold, never shared
        with advertisers. You can change your mind any time.{" "}
        <Link
          href="/privacy"
          className="font-bold text-[var(--c-brand-cyan)] hover:underline"
        >
          Details
        </Link>
        .
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => decide("granted")}
          className="flex-1 inline-flex items-center justify-center px-4 h-10 rounded-[var(--r-md)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => decide("denied")}
          className="flex-1 inline-flex items-center justify-center px-4 h-10 rounded-[var(--r-md)] text-sm font-bold bg-[var(--c-bg)] text-[var(--c-text)] border border-[var(--c-border)] transition active:scale-[0.985]"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
