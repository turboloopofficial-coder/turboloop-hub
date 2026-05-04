// Shown when the user navigates to a route the service worker hasn't
// cached AND there's no network. The SW's navigateFallback already
// catches most cases by serving /index.html (SPA shell) — this page is
// the inner content rendered when the user keeps clicking around offline.

import { Wifi, RefreshCw, Home } from "lucide-react";
import { Link } from "wouter";

export default function Offline() {
  return (
    <div
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
          <Wifi className="w-10 h-10 text-cyan-300 opacity-60" />
        </div>
        <h1
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          You&rsquo;re offline
        </h1>
        <p className="text-white/60 leading-relaxed mb-7">
          No internet right now. The pages you&rsquo;ve already opened still
          work from cache. Check your connection and try again.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #0891B2, #7C3AED)",
              color: "white",
              boxShadow: "0 8px 22px -6px rgba(8,145,178,0.5)",
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
          <Link href="/">
            <button
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
