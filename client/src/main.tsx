import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";
import { captureReferralFromUrl } from "./lib/referral";

// Sentry — only initializes if VITE_SENTRY_DSN is set in Vercel env.
// Without a DSN, this is a no-op. Sign up at sentry.io (free tier covers
// up to 5k errors/month), copy the DSN, add as VITE_SENTRY_DSN in Vercel.
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (SENTRY_DSN && import.meta.env.PROD) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    // Sample 10% of transactions in production for performance monitoring
    tracesSampleRate: 0.1,
    // Capture replays for 10% of sessions, 100% of sessions with errors
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,
    // Filter out the noise we already handle ourselves
    ignoreErrors: [
      // Stale-chunk reload handles these — don't double-report
      /Loading chunk \S+ failed/i,
      /Failed to fetch dynamically imported module/i,
      /Importing a module script failed/i,
      // Browser extensions & third-party noise
      /ResizeObserver loop/i,
      /Non-Error promise rejection captured/i,
    ],
  });
}

// Capture ?ref= URL param on load (persists to localStorage)
captureReferralFromUrl();

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
