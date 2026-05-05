// /reset — manual cache nuclear utility.
//
// The HTTP response carries `Clear-Site-Data: "*"` (configured in
// next.config.ts headers()), which tells the browser to wipe EVERYTHING
// for this origin: HTTP cache, CacheStorage, all SW registrations,
// cookies, localStorage. Then the inline client script unregisters any
// stragglers and redirects home.
//
// Use this URL as the worst-case fallback when middleware-driven
// cleanup somehow fails. Just type turboloop.tech/reset in Brave on
// your phone.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refreshing site data…",
  robots: { index: false, follow: false },
};

export default function ResetPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
      }}
    >
      <div className="max-w-md w-full text-center text-white">
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(8,145,178,0.25), rgba(124,58,237,0.25))",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-cyan-300 animate-spin"
            style={{ animationDuration: "1.5s" }}
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </div>
        <h1
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Refreshing site data…
        </h1>
        <p className="text-white/60 leading-relaxed mb-7">
          We&rsquo;re wiping any cached version of TurboLoop on this device
          so you see the latest. Takes ~2 seconds.
        </p>
        <p className="text-xs text-white/40">
          If this page doesn&rsquo;t redirect on its own, tap Home below.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #0891B2, #7C3AED)",
              color: "white",
              boxShadow: "0 8px 22px -6px rgba(8,145,178,0.5)",
            }}
          >
            Home
          </a>
        </div>
      </div>

      {/* Client cleanup + auto-redirect. Runs after the Clear-Site-Data
          response header has already wiped the origin. We also belt-and-
          suspenders manually unregister any SWs the response missed (some
          browsers process Clear-Site-Data on the NEXT navigation, not
          this one). */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              try {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function (regs) {
                    regs.forEach(function (r) { r.unregister(); });
                  }).catch(function () {});
                }
                if (window.caches && caches.keys) {
                  caches.keys().then(function (keys) {
                    keys.forEach(function (k) { caches.delete(k); });
                  });
                }
                try { localStorage.clear(); } catch (e) {}
                try { sessionStorage.clear(); } catch (e) {}
              } catch (e) {}
              setTimeout(function () {
                window.location.replace('/');
              }, 1500);
            })();
          `.trim(),
        }}
      />
    </main>
  );
}
