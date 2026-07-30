/**
 * Enhanced Analytics Tracker — extends the basic page_view tracker with:
 * 1. Scroll depth tracking (25%, 50%, 75%, 100%)
 * 2. Time on page milestones (30s, 60s, 120s, 300s)
 * 3. Outbound link click tracking (all external links)
 * 4. "Launch App" CTA click tracking
 * 5. UTM parameter persistence (stores in sessionStorage for cross-page attribution)
 *
 * Drop-in replacement for AnalyticsTracker — includes the original page_view logic.
 */
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  initScrollDepthTracking,
  initTimeOnPageTracking,
  trackLaunchApp,
  trackOutboundClick,
} from "@/lib/analytics-events";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const GA_ID = "G-7CBRVBSG8H";

export default function AnalyticsTrackerEnhanced() {
  const [location] = useLocation();
  const initializedRef = useRef(false);

  // ─── Page view tracking (original behavior) ─────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !window.gtag) return;
    const path = location || "/";
    const url = window.location.origin + path + window.location.search;
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: url,
      page_title: document.title,
      send_to: GA_ID,
    });
  }, [location]);

  // ─── One-time initializations ───────────────────────────────────────────────
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 1. Scroll depth
    const cleanupScroll = initScrollDepthTracking();

    // 2. Time on page
    const cleanupTime = initTimeOnPageTracking();

    // 3. UTM persistence — store UTM params in sessionStorage so they persist
    //    across SPA navigations and can be attached to conversion events.
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    for (const key of utmKeys) {
      const val = params.get(key);
      if (val) sessionStorage.setItem(`tl_${key}`, val);
    }

    // 4. Outbound link tracking — intercept all clicks on external links
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!target) return;
      const href = target.href;
      if (!href || href.startsWith("javascript:")) return;

      try {
        const url = new URL(href);
        const isExternal = url.hostname !== window.location.hostname;

        // Track "Launch App" clicks specifically
        if (href.includes("turboloop.io") || target.textContent?.toLowerCase().includes("launch app")) {
          trackLaunchApp(window.location.pathname);
        } else if (isExternal) {
          trackOutboundClick(href, target.textContent?.slice(0, 50) || href);
        }
      } catch {
        // Invalid URL, ignore
      }
    };
    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      cleanupScroll?.();
      cleanupTime?.();
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  return null;
}
