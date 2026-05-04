import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Service worker + PWA wiring. We hand-wrote client/public/manifest.json
    // so the plugin only generates the SW; manifest stays under our control.
    // Strategy:
    //  - precache the app shell (HTML + critical chunks) on install
    //  - cacheFirst with 30-day expiry for R2 images
    //  - networkOnly (pass-through) for tRPC — data freshness matters
    //  - offline fallback to / (the SPA shell renders an Offline page if the
    //    user navigates somewhere not in cache)
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false, // we register manually in main.tsx
      manifest: false, // use our hand-written client/public/manifest.json
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        globIgnores: [
          "**/mermaid-*.js",
          "**/syntax-highlight-*.js",
          "**/markdown-*.js",
        ],
        // Don't precache the giant blog-only chunks; they only load on /blog/*
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//, /^\/admin/],
        runtimeCaching: [
          {
            // R2-hosted images (logos, posters, reel thumbs, flags)
            urlPattern:
              /^https:\/\/pub-1d13f4e7ccfa4575bc04b75045f1b1b1\.r2\.dev\/.*\.(?:png|jpg|jpeg|webp|svg|gif)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "r2-images",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts CSS
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            // Google Fonts files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-files",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // tRPC + sentry tunnel + everything under /api/ — never cache.
            // Stale data here means stale leaderboards, broken Sentry, etc.
            urlPattern: /\/api\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
      devOptions: {
        // Enable the SW in `npm run dev` so we can verify locally without
        // doing a full prod build cycle.
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 800,
    // Exclude heavy code-only-on-blog chunks from <link rel="modulepreload">.
    // Without this, Vite emits a preload tag for EVERY chunk on the home
    // page → browser eagerly downloads mermaid (2.7 MB) + syntax-highlight
    // (9.5 MB) on a route that never uses them. With this, those chunks
    // only load when streamdown actually executes mermaid/shiki — i.e.
    // when a blog post with a fenced code block or mermaid diagram renders.
    modulePreload: {
      resolveDependencies: (_filename, deps) => {
        return deps.filter(
          d =>
            !d.includes("/mermaid-") &&
            !d.includes("/syntax-highlight-") &&
            !d.includes("/markdown-") &&
            !d.includes("/code-block-") &&
            !d.includes("/wardley-")
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "react-vendor";
          }
          // Animation library (used in many sections)
          if (id.includes("node_modules/framer-motion") || id.includes("node_modules/motion-")) {
            return "motion";
          }
          // Heavy markdown / syntax highlighting (only used on blog post pages)
          if (
            id.includes("node_modules/shiki") ||
            id.includes("node_modules/@shikijs") ||
            id.includes("node_modules/react-syntax-highlighter") ||
            id.includes("node_modules/refractor") ||
            id.includes("node_modules/prismjs") ||
            id.includes("node_modules/highlight.js")
          ) {
            return "syntax-highlight";
          }
          // Mermaid + diagram rendering (also blog only)
          if (
            id.includes("node_modules/mermaid") ||
            id.includes("node_modules/cytoscape") ||
            id.includes("node_modules/dagre") ||
            id.includes("node_modules/khroma") ||
            id.includes("node_modules/d3-")
          ) {
            return "mermaid";
          }
          // Markdown processing
          if (
            id.includes("node_modules/react-markdown") ||
            id.includes("node_modules/remark-") ||
            id.includes("node_modules/rehype-") ||
            id.includes("node_modules/micromark") ||
            id.includes("node_modules/mdast-") ||
            id.includes("node_modules/hast-") ||
            id.includes("node_modules/unified") ||
            id.includes("node_modules/unist-")
          ) {
            return "markdown";
          }
          // Radix UI primitives
          if (id.includes("node_modules/@radix-ui")) {
            return "radix";
          }
          // Lucide icons
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }
          // tRPC + react-query
          if (
            id.includes("node_modules/@trpc") ||
            id.includes("node_modules/@tanstack") ||
            id.includes("node_modules/superjson")
          ) {
            return "trpc";
          }
          return undefined;
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
