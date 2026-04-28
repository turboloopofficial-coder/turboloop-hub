// Google Analytics 4 SPA route tracker.
// gtag is loaded in index.html with send_page_view: false, so we manually
// fire page_view events on every Wouter route change.

import { useEffect } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const GA_ID = "G-7CBRVBSG8H";

export default function AnalyticsTracker() {
  const [location] = useLocation();

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

  return null;
}
