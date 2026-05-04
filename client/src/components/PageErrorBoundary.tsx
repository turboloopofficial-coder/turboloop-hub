// Per-route error boundary — catches render errors INSIDE a single page
// without blanking the whole app. Wraps each lazy route so a broken
// page shows a friendly recovery UI while the rest of the app stays usable.
//
// The global ErrorBoundary in App.tsx remains as the outer catch-all.

import { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Optional human-readable name of the page — shown in the error message */
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class PageErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Stale-chunk recovery: when we deploy, the JS chunk filenames change
    // (Vite content-hashes them). Anyone with the old HTML still in their
    // tab will fail to load the new chunk and see a blank page. Detect that
    // specific error and reload — the user just sees a brief flash, then the
    // page renders cleanly with the new bundle.
    const msg = error?.message || "";
    const isStaleChunk =
      /Loading chunk \S+ failed/i.test(msg) ||
      /Failed to fetch dynamically imported module/i.test(msg) ||
      /Importing a module script failed/i.test(msg) ||
      /error loading dynamically imported module/i.test(msg);

    if (isStaleChunk && typeof window !== "undefined") {
      // Guard against an infinite reload loop in case the error happens for
      // a reason other than a stale deploy (e.g. CSP misconfig). Only auto-
      // reload once per session — after that, surface the error UI normally.
      const KEY = "turboloop_stale_chunk_reload_at";
      const last = Number(sessionStorage.getItem(KEY) || 0);
      const TEN_MIN = 10 * 60 * 1000;
      if (Date.now() - last > TEN_MIN) {
        sessionStorage.setItem(KEY, String(Date.now()));
        window.location.reload();
        return;
      }
    }

    console.error("[PageErrorBoundary] Caught render error:", error, info);

    // Forward to Sentry. SDK is lazy-loaded; if it isn't ready yet, the
    // window-level error listener in main.tsx queues it for replay.
    import("@sentry/react")
      .then(Sentry => {
        Sentry.captureException(error, {
          tags: { boundary: "page", page: this.props.pageName ?? "unknown" },
          contexts: { react: { componentStack: info.componentStack } },
        });
      })
      .catch(() => {});
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error } = this.state;
    const { pageName } = this.props;

    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "#F7F8FC" }}
      >
        <div className="max-w-md w-full text-center">
          <div
            className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}
          >
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-2xl font-bold text-slate-900 mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Something broke on this page
          </h1>
          <p className="text-sm text-slate-600 mb-1">
            {pageName ? `The ${pageName} page` : "This page"} hit an error and
            couldn't render. The rest of the site still works.
          </p>
          {error?.message && (
            <p className="text-[11px] text-slate-400 font-mono mt-3 mb-5 px-4 py-2 rounded-lg bg-white inline-block max-w-full break-all">
              {error.message.slice(0, 200)}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <button
              onClick={this.reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                color: "white",
                boxShadow: "0 8px 22px -6px rgba(8,145,178,0.4)",
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 transition"
              style={{
                background: "white",
                border: "1px solid rgba(15,23,42,0.08)",
              }}
            >
              <Home className="w-4 h-4" />
              Home
            </a>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 transition"
              style={{
                background: "white",
                border: "1px solid rgba(15,23,42,0.08)",
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }
}
