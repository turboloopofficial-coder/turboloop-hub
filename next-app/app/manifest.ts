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
      "The complete DeFi ecosystem on Binance Smart Chain — sustainable yield, transparent by design.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#0F172A",
    orientation: "portrait",
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
      // Second entry of the same file as maskable — Android home-screen
      // launchers crop to a circle/rounded-square. Our apple-icon.png
      // has a solid brand-dark background so it survives the mask.
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
