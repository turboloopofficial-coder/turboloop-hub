import type { NextConfig } from "next";

const config: NextConfig = {
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
    // from these libraries instead of the whole bundle.
    optimizePackageImports: ["lucide-react", "framer-motion"],
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
    ];
  },
};

export default config;
