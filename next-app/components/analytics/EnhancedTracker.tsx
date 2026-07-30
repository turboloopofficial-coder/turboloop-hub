"use client";

// EnhancedTracker — advanced GA4 event tracking for growth insights.
//
// Tracks:
//   - Scroll depth milestones (25%, 50%, 75%, 100%)
//   - Time on page (30s, 60s, 120s, 300s)
//   - CTA clicks (Launch App, Explore Hub, etc.)
//   - UTM parameter persistence across SPA navigation
//   - Exit intent detection (desktop only)
//
// All events fire via window.gtag() — requires GoogleAnalytics component to be loaded.

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Scroll depth milestones to track
const SCROLL_MILESTONES = [25, 50, 75, 100];

// Time milestones in seconds
const TIME_MILESTONES = [30, 60, 120, 300];

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

function EnhancedTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollMilestonesHit = useRef<Set<number>>(new Set());
  const timeMilestonesHit = useRef<Set<number>>(new Set());
  const pageLoadTime = useRef<number>(Date.now());

  // Persist UTM params from URL to sessionStorage
  useEffect(() => {
    if (!searchParams) return;
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    const utmData: Record<string, string> = {};
    let hasUtm = false;
    utmKeys.forEach(key => {
      const val = searchParams.get(key);
      if (val) {
        utmData[key] = val;
        hasUtm = true;
      }
    });
    if (hasUtm) {
      try {
        sessionStorage.setItem("turboloop_utm", JSON.stringify(utmData));
      } catch {}
    }
  }, [searchParams]);

  // Reset milestones on page change
  useEffect(() => {
    scrollMilestonesHit.current = new Set();
    timeMilestonesHit.current = new Set();
    pageLoadTime.current = Date.now();
  }, [pathname]);

  // Scroll depth tracking
  useEffect(() => {
    if (!GA_ID) return;
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((scrollTop / docHeight) * 100);

      for (const milestone of SCROLL_MILESTONES) {
        if (pct >= milestone && !scrollMilestonesHit.current.has(milestone)) {
          scrollMilestonesHit.current.add(milestone);
          gtag("event", `scroll_depth_${milestone}`, {
            page_path: pathname,
            scroll_depth: milestone,
          });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Time on page tracking
  useEffect(() => {
    if (!GA_ID) return;
    const intervals: ReturnType<typeof setInterval>[] = [];

    const checkTime = () => {
      const elapsed = Math.floor((Date.now() - pageLoadTime.current) / 1000);
      for (const milestone of TIME_MILESTONES) {
        if (elapsed >= milestone && !timeMilestonesHit.current.has(milestone)) {
          timeMilestonesHit.current.add(milestone);
          gtag("event", "time_on_page", {
            page_path: pathname,
            seconds: milestone,
          });
        }
      }
    };

    const interval = setInterval(checkTime, 5000);
    intervals.push(interval);

    return () => intervals.forEach(clearInterval);
  }, [pathname]);

  // CTA click tracking via event delegation
  useEffect(() => {
    if (!GA_ID) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute("href") || "";
      const text = link.textContent?.trim() || "";

      // Track Launch App clicks
      if (href.includes("turboloop.io") || text.toLowerCase().includes("launch app")) {
        gtag("event", "launch_app_clicked", {
          page_path: pathname,
          link_text: text.slice(0, 50),
          link_url: href,
        });
      }

      // Track external link clicks
      if (href.startsWith("http") && !href.includes("turboloop.tech")) {
        gtag("event", "outbound_click", {
          page_path: pathname,
          link_text: text.slice(0, 50),
          link_url: href,
        });
      }
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  // Exit intent detection (desktop only)
  useEffect(() => {
    if (!GA_ID) return;
    if (typeof window === "undefined") return;
    // Only on desktop (no reliable exit intent on mobile)
    if (window.innerWidth < 768) return;

    let fired = false;
    const handleMouseLeave = (e: MouseEvent) => {
      if (fired) return;
      if (e.clientY <= 5) {
        fired = true;
        gtag("event", "exit_intent", {
          page_path: pathname,
          time_on_page: Math.floor((Date.now() - pageLoadTime.current) / 1000),
        });
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [pathname]);

  return null;
}

export function EnhancedTracker() {
  return (
    <Suspense fallback={null}>
      <EnhancedTrackerInner />
    </Suspense>
  );
}
