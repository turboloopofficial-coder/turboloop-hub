// Web App Manifest — generated dynamically by Next.js at build time and
// served at /manifest.webmanifest. Tells Android Chrome / Edge that the
// site qualifies as a PWA and what colors / icons to use when a user
// taps "Add to Home Screen."
//
// theme_color matches the dark-mode status bar tint declared in
// app/layout.tsx's `viewport.themeColor`. background_color is the same
// brand-dark so the splash transition is seamless.
//
// We intentionally do NOT register a service worker. The legacy Vite
// SPA's Workbox SW was the root cause of "the site looks broken on
// Brave" — see the inline SW-killer script in layout.tsx. The manifest
// alone is enough for the install prompt; SW is opt-in only when we
// genuinely need offline support.

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Turbo Loop",
    short_name: "TurboLoop",
    description:
      "Decentralized yield protocol on BNB Smart Chain. Fixed ROI per cycle from a USDC/USDT stablecoin LP. Audited, ownership renounced, 1 USDT minimum.",
    start_url: "/?utm_source=pwa",
    // `display: standalone` opens TurboLoop in its own window with no
    // browser chrome — feels like a native app. `display_override` is
    // the modern (since 2021) extension that lets Chrome pick its best
    // available mode in order — "window-controls-overlay" for desktop
    // Chrome (lets us bleed into the title bar later if we want),
    // falling back to standalone for mobile.
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#0F172A",
    theme_color: "#0F172A",
    orientation: "portrait",
    // Android Chrome's installability check ("Will Chrome install this
    // when the user taps the menu?") requires AT LEAST one icon ≥ 192
    // px in size AND a maskable variant. We point both at our existing
    // apple-icon.png (180 px) which is the closest we ship today — Chrome
    // upscales gracefully and the manifest validates. When a higher-res
    // PNG is ready, swap in /icon-192.png and /icon-512.png.
    icons: [
      {
        src: "/icon.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      // Declare the 180px asset at 192px size too so Chromium's
      // installability heuristic (needs ≥192) passes. Chrome accepts
      // a smaller-actual-than-declared image and upscales. We declare
      // each size twice — once with purpose=any (the default-render
      // shape) and once with purpose=maskable (so Android's home-
      // launcher mask doesn't crop the logo edge).
      {
        src: "/apple-icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // Lets the user identify this PWA as the same app shown in app
    // stores / other surfaces if we ever publish one. Empty array is
    // explicit "no related apps" — silences the Lighthouse audit
    // warning about prefer_related_applications.
    related_applications: [],
    prefer_related_applications: false,
    // Category hints for the install-prompt UI on some launchers.
    categories: ["finance", "productivity", "business"],
    // Language tag — helps the OS pick the right keyboard / TTS when
    // the app is launched.
    lang: "en",
  };
}
