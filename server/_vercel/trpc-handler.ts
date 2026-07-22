import type { IncomingMessage, ServerResponse } from "node:http";
import express, { type Express } from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "../_core/context";

// Origins allowed to call this API (tRPC mutations from forms etc.).
// www.turboloop.tech is the production Next.js host; the apex (turboloop.tech)
// 307s to www but include both so a direct apex fetch still works. localhost
// covers the Next dev server on :3001.
const CORS_ALLOWED_ORIGINS = [
  "https://www.turboloop.tech",
  "https://turboloop.tech",
  "http://localhost:3001",
];

// Procedures that are safe to cache at the CDN edge — they're public reads
// of content that rarely changes minute-to-minute. blogs/videos/events/etc.
// Cached for 60s at the edge with a 10-min stale-while-revalidate window
// so the next visitor still gets an instant response while we refresh in
// the background. This is the single biggest perf win — turns a ~2s
// cold-start tRPC call into a sub-50ms edge cache hit.
const CACHEABLE_QUERY_PATHS = new Set([
  "content.blogPosts",
  "content.blogPost",
  // Listing endpoints — added 2026-07-22 to enable CDN caching.
  // These were missing from the set, causing every blog page request
  // to hit the Lambda + Neon even though the data changes at most
  // every 5 minutes. With CDN caching (s-maxage=300), the Lambda is
  // only invoked once per 5 minutes per cache region.
  "content.blogPostsList",
  "content.blogPostsByLanguage",
  "content.blogPostsCounts",
  "content.blogPostsHomepage",
  "content.videos",
  "content.events",
  "content.leaderboard",
  "content.promotions",
  "content.roadmap",
  "content.presentations",
  "content.setting",
  "submissions.publicApproved",
]);

let cachedApp: Express | null = null;

function getApp(): Express {
  if (cachedApp) return cachedApp;
  const app = express();
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  app.use(
    cors({
      origin: CORS_ALLOWED_ORIGINS,
      credentials: true,
    })
  );
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      // Set Cache-Control on responses for read-only public content. The
      // CDN (Vercel/Cloudflare) caches the response by URL — different
      // batches with different inputs each get their own cache entry.
      responseMeta({ paths, type, errors }) {
        if (
          type === "query" &&
          errors.length === 0 &&
          paths !== undefined &&
          paths.every(p => CACHEABLE_QUERY_PATHS.has(p))
        ) {
          return {
            headers: {
              "Cache-Control":
                // 5-min CDN cache (matches Next.js revalidate=300).
                // stale-while-revalidate=600 means CDN serves stale for
                // up to 10 min while refreshing in background — users
                // never wait for a cold Lambda + Neon round-trip.
                "public, s-maxage=300, stale-while-revalidate=600",
            },
          };
        }
        return {};
      },
    })
  );
  cachedApp = app;
  return app;
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    return getApp()(req as any, res as any);
  } catch (err: any) {
    console.error("[trpc handler]", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: String(err?.message || err) }));
  }
}
