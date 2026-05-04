import type { IncomingMessage, ServerResponse } from "node:http";
import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "../_core/context";

// Procedures that are safe to cache at the CDN edge — they're public reads
// of content that rarely changes minute-to-minute. blogs/videos/events/etc.
// Cached for 60s at the edge with a 10-min stale-while-revalidate window
// so the next visitor still gets an instant response while we refresh in
// the background. This is the single biggest perf win — turns a ~2s
// cold-start tRPC call into a sub-50ms edge cache hit.
const CACHEABLE_QUERY_PATHS = new Set([
  "content.blogPosts",
  "content.blogPost",
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
                "public, s-maxage=60, stale-while-revalidate=600",
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
