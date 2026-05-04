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
  // The legacy SPA at / (Vite build) is being migrated. While we're
  // building the new app under /next-app, keep both alive: Vercel can
  // route specific paths to this Next.js app via rewrites once we're
  // ready to cut over. For now, this app deploys to a separate Vercel
  // project so production is never disturbed.
  poweredByHeader: false,
  reactStrictMode: true,
};

export default config;
