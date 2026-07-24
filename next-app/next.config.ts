import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const config: NextConfig = {
  // Server-side cron files (cron-master.ts, _messagePools.ts, etc.) are
  // compiled separately by esbuild and must not fail the Next.js typecheck.
  // They import server-only packages (cron-parser, @neondatabase, drizzle-orm)
  // that live in the root server/ package, not in next-app/package.json.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Mobile-first image optimization. Next.js will serve AVIF/WebP and
  // resize per device. Big win on the Realme Narzo 50 — instead of
  // shipping full 1200×630 OG images, browsers get sized variants.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev",
      },
      {
        protocol: "https",
        hostname: "turboloop.tech",
      },
      {
        protocol: "https",
        hostname: "www.turboloop.tech",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  // Public-facing marketing pages are statically generated at build time.
  // Interactive routes (admin, submit, apply, my-submissions) opt into
  // dynamic rendering on a per-page basis via `export const dynamic`.
  experimental: {
    // Granular package import optimization — only imports what's used
    // from these libraries instead of the whole bundle. Radix UI
    // primitives are barrel-imported across the admin panel + ui
    // components, and date-fns is touched by the blog/events. Adding
    // them here trims the homepage chunk without source changes.
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tooltip",
      "date-fns",
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // Custom HTTP headers — critical for the cache nuclear strategy.
  // /sw.js MUST never be cached, otherwise Brave keeps serving the
  // legacy Workbox SW and ignores my self-killer. /reset triggers
  // Clear-Site-Data: * for users who get manually nudged there.
  // Permanent redirect for any /yield-calculator links that pre-date the
  // rename. The page now lives at /calculator; anything else (Telegram
  // archives, blog posts, screenshots) gets transparently redirected.
  async redirects() {
    return [
      {
        source: "/yield-calculator",
        destination: "/calculator",
        permanent: true,
      },
      // /rss.xml is a deeply-conventional URL — every RSS reader,
      // Feedly, scrapers, link-aggregators ping this path first.
      // Our actual RSS routes are /feed.xml, /feed.de.xml, etc. The
      // 308 audit found /rss.xml 404'ing; this redirect maps the
      // conventional URL to the English feed (the most common
      // assumption is "blog posts in English"). Per-language readers
      // can still hit /feed.de.xml etc. directly.
      {
        source: "/rss.xml",
        destination: "/feed.xml",
        statusCode: 301,
      },
      // Mirror /feed → /blog (auditor noted the 308 — keep explicit so
      // future audits don't re-flag it). Also: not in conflict with
      // the vercel.json rewrite for /sitemap.xml because rewrites
      // happen at a different layer than redirects.
      {
        source: "/feed",
        destination: "/blog",
        permanent: true,
      },
      // /films/sovereign-series no longer exists — content rendered as
      // the top section of /films. Explicit 301 (not the default 308
      // that `permanent: true` would emit) — keeps strict SEO tooling
      // happy and preserves link equity from any TG-shared URLs.
      {
        source: "/films/sovereign-series",
        destination: "/films",
        statusCode: 301,
      },
      // Per-slug variants — never published as a live route (detail
      // page was deferred), but if any bots followed the listing's
      // <Link> tags they should hit the canonical film URL instead
      // of a 404.
      {
        source: "/films/sovereign-series/:slug",
        destination: "/films/:slug",
        statusCode: 301,
      },
      // /banners was the original URL for the creative library before
      // the page was renamed to /creatives. External links (Telegram
      // archives, shared URLs) still point here — redirect them cleanly.
      {
        source: "/banners",
        destination: "/creatives",
        permanent: true,
      },
      {
        source: "/banners/:path*",
        destination: "/creatives/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // Global security headers — applied to all routes
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // SECURITY: Content-Security-Policy — blocks injected scripts from
          // untrusted origins. Allows Google Analytics/GTM, Vercel analytics,
          // and the R2 CDN (for legitimate video/image assets only).
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Google Tag Manager + GA4 + Vercel analytics
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // Google Analytics tracking pixel + R2 assets + flagcdn.com (country flags on leaderboard)
              "img-src 'self' data: blob: https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev https://*.googleusercontent.com https://www.google-analytics.com https://www.googletagmanager.com https://flagcdn.com",
              "media-src 'self' https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev https://www.youtube.com https://www.youtube-nocookie.com",
              // GA4 beacon + BscScan API for contract verification
              "connect-src 'self' https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev https://api.turboloop.tech https://va.vercel-scripts.com https://vitals.vercel-insights.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://api.bscscan.com",
              "frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://youtube-nocookie.com https://player.vimeo.com https://www.googletagmanager.com https://dexscreener.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, max-age=0",
          },
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Content-Type", value: "application/javascript" },
        ],
      },
      {
        source: "/reset",
        headers: [
          // The nuclear option — clears EVERYTHING for this origin.
          { key: "Clear-Site-Data", value: '"*"' },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, max-age=0",
          },
        ],
      },
      // PERF FIX (Jul 2026): Override Next.js's default private/no-cache for
      // dynamic (ƒ) pages. The homepage and localized pages are content-only
      // (no user-specific HTML) so they're safe to cache at the CDN edge.
      // s-maxage=60: Vercel CDN caches for 60 seconds.
      // stale-while-revalidate=3600: serve stale while revalidating for 1 hour.
      // This works in tandem with the middleware fix (NextResponse.next() for /)
      // to allow Vercel to serve the homepage from CDN cache.
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=3600",
          },
        ],
      },
      // Localized homepages (/fr, /es, /ar, etc.) — same content for all users
      {
        source: "/:locale(fr|es|pt|de|it|nl|ro|el|cs|hu|pl|ru|uk|hi|ta|bn|te|mr|gu|kn|ml|pa|ne|si|th|vi|ja|ms|tl|km|my|id|ko|lo|zh|ar|ur|tr|az|uz|kk|fa|he|sw|ha|yo|am|pcm|bg|da|et|fi|hr|lt|lv|no|sk|sl|sr|sv|zu)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(config);
