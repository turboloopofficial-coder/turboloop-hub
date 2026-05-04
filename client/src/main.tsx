import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";
import { captureReferralFromUrl } from "./lib/referral";

// Sentry — DEFERRED loading. Setup if VITE_SENTRY_DSN is set in Vercel env.
// We dynamic-import the SDK after page interactive so Sentry's ~80 KB doesn't
// block first paint. Errors thrown BEFORE Sentry loads are captured by a
// pre-init queue and replayed once the SDK is ready, so nothing is lost.
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const PRE_INIT_QUEUE: Array<{ event: ErrorEvent | PromiseRejectionEvent }> = [];

if (SENTRY_DSN && import.meta.env.PROD) {
  // Capture errors thrown before Sentry SDK is loaded
  const onError = (e: ErrorEvent) => PRE_INIT_QUEUE.push({ event: e });
  const onRejection = (e: PromiseRejectionEvent) =>
    PRE_INIT_QUEUE.push({ event: e });
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  const initSentry = async () => {
    try {
      const Sentry = await import("@sentry/react");
      Sentry.init({
        dsn: SENTRY_DSN,
        environment: import.meta.env.MODE,
        // Tunnel through our origin so Brave Shields / uBlock can't drop
        // events. The proxy at /api/monitor (server/_vercel/sentry-tunnel.ts)
        // forwards envelopes to ingest.us.sentry.io.
        tunnel: "/api/monitor",
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0.0,
        replaysOnErrorSampleRate: 1.0,
        ignoreErrors: [
          // Stale-chunk reload handles these — don't double-report.
          // Anchored patterns so we don't accidentally match any
          // unrelated "...failed" error.
          /^Loading chunk \d+ failed/i,
          /^Failed to fetch dynamically imported module/i,
          /^Importing a module script failed/i,
          /^ResizeObserver loop (?:limit exceeded|completed with undelivered notifications)/i,
        ],
      });
      // Replay any errors that fired before Sentry was ready
      for (const { event } of PRE_INIT_QUEUE) {
        if (event instanceof ErrorEvent && event.error) {
          Sentry.captureException(event.error);
        } else if (event instanceof PromiseRejectionEvent) {
          Sentry.captureException(event.reason);
        }
      }
      PRE_INIT_QUEUE.length = 0;
      // The window listeners we added are now redundant — Sentry installs
      // its own. Remove ours to avoid double-reporting.
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    } catch (err) {
      // Sentry SDK failed to load (rare; CDN issue?). App keeps working.
      console.warn("[Sentry] SDK lazy-load failed:", err);
    }
  };

  const ric = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => void)
    | undefined;
  if (typeof ric === "function") {
    ric(initSentry, { timeout: 4000 });
  } else {
    window.addEventListener("load", () => setTimeout(initSentry, 1500));
  }
}

// Capture ?ref= URL param on load (persists to localStorage)
captureReferralFromUrl();

// Service worker registration — only in PROD. In dev the SW is disabled in
// vite.config.ts to avoid stale-asset confusion. The plugin auto-generates
// /sw.js + /registerSW.js at build time. We register manually (rather than
// using injectRegister: "auto") so we can control timing — register AFTER
// hydration so SW install doesn't compete with first paint for CPU.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(err => console.warn("[SW] register failed:", err));
    }, 1500);
  });
}

// Native view transitions for SPA route changes (Chrome/Edge 111+).
// Wouter calls history.pushState on Link clicks; we wrap it so each
// navigation runs inside a startViewTransition() call — the browser
// captures the BEFORE frame, runs our callback (which dispatches the
// React re-render), captures AFTER, and animates the diff. The CSS
// fallback in index.css customizes the default cross-fade timing.
if (
  typeof document !== "undefined" &&
  typeof (document as any).startViewTransition === "function"
) {
  const origPushState = history.pushState.bind(history);
  history.pushState = function (...args: Parameters<History["pushState"]>) {
    try {
      (document as any).startViewTransition(() => {
        origPushState(...args);
        // Wait one frame so React commits the new route inside the
        // transition's "after" snapshot.
        return new Promise<void>(resolve =>
          requestAnimationFrame(() => resolve())
        );
      });
    } catch {
      origPushState(...args);
    }
  };
}

// React Query defaults — aggressive caching because the content tRPC
// queries (blogs, videos, events, leaderboard, promotions, roadmap)
// rarely change. With staleTime=5min, navigating between pages reuses
// the cached data instead of refetching — feels instant. gcTime=30min
// keeps the data in memory across short-lived tab closes.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

const redirectToAdminLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;
  if (error.data?.code !== "UNAUTHORIZED") return;

  const path = window.location.pathname;
  if (!path.startsWith("/admin") || path === "/admin/login") return;

  window.location.href = "/admin/login";
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToAdminLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToAdminLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
