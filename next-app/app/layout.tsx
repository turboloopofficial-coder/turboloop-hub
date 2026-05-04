// Root layout — wraps every page in the app.
//
// Mobile-first by design:
//   - viewport-fit=cover so safe-area insets work on phones with notches
//   - dark mode auto-applies based on system preference (CSS handles it)
//   - Geist font preloaded so the brand mark never flashes serif fallback
//   - apple-mobile-web-app meta tags for the PWA standalone install
//   - theme-color tracks the current scheme (status bar tint on Android)
//
// No client-side providers here yet — the homepage is purely static.
// When we add the tRPC client (for /apply, /submit, /admin), it gets
// wired into a "client boundary" wrapper inside the interactive routes.

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@components/layout/Navbar";
import { Footer } from "@components/layout/Footer";
import { MobileBottomCTA } from "@components/layout/MobileBottomCTA";

export const metadata: Metadata = {
  metadataBase: new URL("https://turboloop.tech"),
  title: {
    default:
      "Turbo Loop — The Complete DeFi Ecosystem on Binance Smart Chain",
    template: "%s · Turbo Loop",
  },
  description:
    "Sustainable yield farming, decentralized swaps, and fiat-to-crypto — all on one audited, renounced smart contract. Join a global community across 6+ continents.",
  applicationName: "TurboLoop",
  authors: [{ name: "Turbo Loop" }],
  keywords: [
    "Turbo Loop",
    "DeFi",
    "BSC",
    "Binance Smart Chain",
    "yield farming",
    "crypto",
    "decentralized finance",
  ],
  openGraph: {
    type: "website",
    siteName: "Turbo Loop",
    url: "https://turboloop.tech",
    title: "TurboLoop.tech — the hub is live",
    description:
      "Audited, renounced, 100% LP-locked yield farming on Binance Smart Chain. The complete TurboLoop hub.",
    images: [
      {
        url: "/api/og-banner?type=launch",
        width: 1200,
        height: 630,
        alt: "TurboLoop.tech — the hub is live.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@TurboLoop_io",
    title: "TurboLoop.tech — the hub is live",
    description:
      "Audited, renounced, 100% LP-locked yield farming on Binance Smart Chain.",
    images: ["/api/og-banner?type=launch"],
  },
  // PWA wiring — manifest + iOS standalone tags. Lives in /public.
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TurboLoop",
  },
  icons: {
    icon: "/pwa/icon-192.png",
    apple: "/pwa/apple-touch-icon.png",
  },
  alternates: {
    canonical: "https://turboloop.tech/",
    types: {
      "application/rss+xml": "https://turboloop.tech/rss.xml",
    },
  },
};

export const viewport: Viewport = {
  // Mobile viewport that respects the iPhone notch / Android bezels and
  // never zooms accidentally on input focus (an Android Chrome quirk).
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Tracks the theme — status bar on Android matches the page bg.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0891B2" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Geist font — only the 4 weights we actually use. Preloaded so
            the hero never flashes the system fallback. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* R2 CDN preconnect — saves ~150 ms on the first below-fold image. */}
        <link
          rel="preconnect"
          href="https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-[var(--c-bg)] text-[var(--c-text)] antialiased">
        <Navbar />
        {children}
        <Footer />
        <MobileBottomCTA />
      </body>
    </html>
  );
}
