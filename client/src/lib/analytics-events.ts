/**
 * GA4 Custom Event Tracking — fires structured events for all key CTAs.
 *
 * Events tracked:
 * - click_launch_app: User clicks "Launch App" anywhere on the hub
 * - click_share_link: User copies/shares a referral link
 * - newsletter_signup: User subscribes to newsletter
 * - click_blog_post: User opens a blog article
 * - click_reel: User plays a reel/video
 * - click_creative_download: User downloads a banner/creative
 * - scroll_depth: User reaches 25%, 50%, 75%, 100% of page
 * - utm_link_generated: User generates a trackable link
 * - time_on_page: User spends 30s, 60s, 120s, 300s on page
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

function track(eventName: string, params?: EventParams) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, {
    ...params,
    send_to: "G-7CBRVBSG8H",
  });
}

// ─── CTA Events ───────────────────────────────────────────────────────────────

export function trackLaunchApp(source: string) {
  track("click_launch_app", {
    event_category: "conversion",
    event_label: source,
    value: 1,
  });
}

export function trackShareLink(platform: string, url: string) {
  track("click_share_link", {
    event_category: "engagement",
    event_label: platform,
    link_url: url,
  });
}

export function trackNewsletterSignup(source: string) {
  track("newsletter_signup", {
    event_category: "conversion",
    event_label: source,
    value: 1,
  });
}

export function trackBlogClick(slug: string, title: string) {
  track("click_blog_post", {
    event_category: "engagement",
    event_label: title,
    content_id: slug,
  });
}

export function trackReelPlay(slug: string, language: string) {
  track("click_reel", {
    event_category: "engagement",
    event_label: slug,
    language,
  });
}

export function trackCreativeDownload(bannerId: string, language: string) {
  track("click_creative_download", {
    event_category: "engagement",
    event_label: bannerId,
    language,
  });
}

export function trackUTMLinkGenerated(campaign: string) {
  track("utm_link_generated", {
    event_category: "engagement",
    event_label: campaign,
  });
}

// ─── Scroll Depth Tracking ────────────────────────────────────────────────────

const scrollMilestones = new Set<number>();

export function initScrollDepthTracking() {
  if (typeof window === "undefined") return;

  const checkScroll = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    const milestones = [25, 50, 75, 100];
    for (const m of milestones) {
      if (scrollPercent >= m && !scrollMilestones.has(m)) {
        scrollMilestones.add(m);
        track("scroll_depth", {
          event_category: "engagement",
          event_label: `${m}%`,
          value: m,
          page_path: window.location.pathname,
        });
      }
    }
  };

  window.addEventListener("scroll", checkScroll, { passive: true });
  return () => window.removeEventListener("scroll", checkScroll);
}

// ─── Time on Page Tracking ────────────────────────────────────────────────────

export function initTimeOnPageTracking() {
  if (typeof window === "undefined") return;

  const milestones = [30, 60, 120, 300]; // seconds
  const fired = new Set<number>();

  const interval = setInterval(() => {
    const elapsed = Math.floor(performance.now() / 1000);
    for (const m of milestones) {
      if (elapsed >= m && !fired.has(m)) {
        fired.add(m);
        track("time_on_page", {
          event_category: "engagement",
          event_label: `${m}s`,
          value: m,
          page_path: window.location.pathname,
        });
      }
    }
    if (fired.size === milestones.length) clearInterval(interval);
  }, 5000);

  return () => clearInterval(interval);
}

// ─── Outbound Link Tracking ───────────────────────────────────────────────────

export function trackOutboundClick(url: string, label: string) {
  track("outbound_click", {
    event_category: "outbound",
    event_label: label,
    link_url: url,
    transport_type: "beacon",
  });
}
