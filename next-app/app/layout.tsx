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
import { ToastProvider } from "@components/Toast";
import { CommandPalette } from "@components/CommandPalette";

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
  // No manifest yet on the new app — the PWA from the legacy SPA caused
  // service-worker conflicts; we'll re-introduce a fresh manifest after
  // launch is stable. Favicon = the real R2 brand mark.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TurboLoop",
  },
  icons: {
    icon: [
      {
        url: "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png",
        type: "image/png",
      },
    ],
    apple:
      "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/branding/turboloop-logo.png",
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
        {/* SERVICE WORKER KILL — runs on EVERY page load, not gated by
            localStorage. The legacy Vite SPA's Workbox SW aggressively
            cached HTML and is the reason "the site looks broken on
            Brave but works on Chrome." Combined with the self-killing
            /sw.js shipped at the same path, this removes the SW for any
            user who lands here. Once cleared (no SW found), this is
            essentially a no-op — cheap to run on every visit. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  if (!('serviceWorker' in navigator)) return;
                  navigator.serviceWorker.getRegistrations().then(function (regs) {
                    if (!regs.length) return;
                    var did = false;
                    regs.forEach(function (r) {
                      r.unregister();
                      did = true;
                    });
                    if (window.caches && caches.keys) {
                      caches.keys().then(function (keys) {
                        keys.forEach(function (k) { caches.delete(k); });
                      });
                    }
                    if (did) {
                      var KEY = 'tl_sw_reloaded_at';
                      var last = Number(sessionStorage.getItem(KEY) || 0);
                      if (Date.now() - last > 30000) {
                        sessionStorage.setItem(KEY, String(Date.now()));
                        window.location.reload();
                      }
                    }
                  }).catch(function () {});
                } catch (e) {}
              })();
            `.trim(),
          }}
        />
        {/* Apply the user's saved theme synchronously, before any paint,
            so dark-mode users never see a flash of light theme. The
            script is tiny + inlined; it reads localStorage and adds the
            .dark or .light class to <html> before React hydrates. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem('turboloop_theme');
                  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = stored || (prefersDark ? 'dark' : 'light');
                  document.documentElement.classList.add(theme);
                } catch (e) {}
              })();
            `.trim(),
          }}
        />
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
        <ToastProvider>
          <Navbar />
          {children}
          <Footer />
          <MobileBottomCTA />
          <CommandPalette />
        </ToastProvider>
      </body>
    </html>
  );
}
