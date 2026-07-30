/**
 * Growth Automation Configuration — central config for all automated traffic strategies.
 *
 * This file defines the rules and schedules for:
 * 1. Auto blog publishing (SEO content engine)
 * 2. Social sharing automation
 * 3. Re-engagement triggers
 * 4. A/B test configurations
 */

export const GROWTH_CONFIG = {
  // ─── Blog Auto-Publishing ───────────────────────────────────────────────────
  blog: {
    /** How many articles to publish per week */
    articlesPerWeek: 3,
    /** Best days to publish (based on analytics — highest engagement) */
    publishDays: ["monday", "wednesday", "friday"],
    /** Publish time (UTC) — 4 AM aligns with India morning traffic */
    publishTimeUTC: "04:00",
    /** Minimum word count for SEO (Google prefers 1500+ for informational queries) */
    minWordCount: 1500,
    /** Maximum word count (keep articles focused) */
    maxWordCount: 3000,
    /** Auto-generate internal links in new posts */
    autoInternalLinks: true,
    /** Number of internal links per article */
    internalLinksPerArticle: 5,
    /** Auto-add FAQ schema to articles with Q&A content */
    autoFaqSchema: true,
  },

  // ─── Social Sharing Automation ──────────────────────────────────────────────
  social: {
    /** Auto-post new blog articles to these channels */
    autoPostChannels: ["telegram", "twitter"],
    /** Delay after publishing before social post (minutes) */
    postDelayMinutes: 15,
    /** Include UTM parameters in all shared links */
    forceUTM: true,
    /** Default UTM source for automated posts */
    defaultUTMSource: "auto_social",
  },

  // ─── Re-engagement Triggers ─────────────────────────────────────────────────
  reengagement: {
    /** Show push notification prompt after N page views */
    pushPromptAfterViews: 3,
    /** Show newsletter signup after scrolling N% of page */
    newsletterScrollTrigger: 60,
    /** Exit-intent popup (desktop only) */
    exitIntentEnabled: true,
    /** Days before showing dismissed prompts again */
    dismissCooldownDays: {
      push: 30,
      newsletter: 14,
      locale: 7,
    },
  },

  // ─── SEO Optimization Rules ─────────────────────────────────────────────────
  seo: {
    /** Target keywords to track rankings for */
    primaryKeywords: [
      "TurboLoop",
      "turboloop.tech",
      "DeFi yield farming BSC",
      "USDT staking",
      "fixed yield crypto",
      "passive income DeFi",
      "BSC yield farming",
      "audited DeFi protocol",
      "LP locked DeFi",
    ],
    /** Minimum internal links per page */
    minInternalLinksPerPage: 3,
    /** Auto-add alt text to images */
    autoAltText: true,
    /** Structured data types to include */
    structuredDataTypes: [
      "Organization",
      "WebSite",
      "FAQPage",
      "Article",
      "BreadcrumbList",
      "SoftwareApplication",
    ],
  },

  // ─── Performance Budgets ────────────────────────────────────────────────────
  performance: {
    /** Max LCP (Largest Contentful Paint) in ms */
    maxLCP: 2500,
    /** Max FID (First Input Delay) in ms */
    maxFID: 100,
    /** Max CLS (Cumulative Layout Shift) */
    maxCLS: 0.1,
    /** Max bundle size (KB) for initial load */
    maxInitialBundleKB: 200,
    /** Lazy load images below the fold */
    lazyLoadBelowFold: true,
  },
} as const;

export type GrowthConfig = typeof GROWTH_CONFIG;
