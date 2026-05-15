// Google Analytics 4 loader for the App Router.
//
// The hard part of GA on the App Router is two things:
//
//   1. Consent Mode v2 (GDPR / "Do they have the right to track me?"):
//      The consent defaults MUST be set BEFORE gtag.js loads. We can't
//      use a client component for that — by the time React hydrates,
//      gtag.js is already running. So the defaults live in an inline
//      <script> in app/layout.tsx's <head>. This file is responsible
//      only for loading gtag.js + sending page_view on route changes.
//
//   2. Manual pageview tracking: GA4's default page_view event fires
//      once per full page load. App Router uses soft-navigation, so
//      the SPA-style route transitions never re-trigger it. We listen
//      to pathname + search-param changes via usePathname /
//      useSearchParams and fire page_view ourselves.
//
// If NEXT_PUBLIC_GA_MEASUREMENT_ID is unset (e.g. local dev), the entire
// component renders null — no script tags, no pageview hits, no banner.

"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || typeof window === "undefined" || !window.gtag) return;
    const search = searchParams?.toString();
    const url = pathname + (search ? `?${search}` : "");
    window.gtag("event", "page_view", {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GA_ID,
    });
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            anonymize_ip: true,
            // We send page_view manually on every soft-navigation
            // (see PageviewTracker). Disable the default behavior so
            // initial load doesn't double-count.
            send_page_view: false,
          });
          // Initial pageview for the document load — soft-navs are
          // handled by PageviewTracker.
          gtag('event', 'page_view', {
            page_path: window.location.pathname + window.location.search,
            page_location: window.location.href,
            page_title: document.title,
            send_to: '${GA_ID}',
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
    </>
  );
}

/** Send a custom event to GA4. No-op if gtag never loaded (consent
 *  denied, GA_ID unset, or script blocked). Safe to call from any
 *  client component. */
export function trackEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params ?? {});
}

/** Programmatically grant/revoke consent. ConsentBanner calls this on
 *  the user's decision; settings UIs can call it later to let users
 *  change their mind. */
export function setAnalyticsConsent(decision: "granted" | "denied"): void {
  try {
    localStorage.setItem("turboloop_consent", decision);
  } catch {
    // Private mode / storage blocked — still update gtag for this session.
  }
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("consent", "update", {
    ad_storage: decision,
    ad_user_data: decision,
    ad_personalization: decision,
    analytics_storage: decision,
  });
}
