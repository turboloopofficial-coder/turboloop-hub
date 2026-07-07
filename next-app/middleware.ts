// Middleware — two responsibilities:
//
// 1. next-intl locale routing: detect the user's preferred language from
//    Accept-Language header and redirect to the correct locale prefix
//    (e.g. /th/, /ko/, /lo/). English is the default and gets no prefix.
//    IMPORTANT: Only applies to the 5 localized pages. All other existing
//    routes (blog, films, social-wall, etc.) are excluded so they
//    never get a locale prefix and never 404.
//
// 2. Cache nuclear option: users who installed the legacy SPA's PWA, or
//    whose Brave is using aggressive cache, continue to see the OLD
//    Vite-built SPA HTML even after the Next.js cutover.
//    FIX: when a request arrives without our "I've been cleaned" cookie,
//    we respond with the HTTP `Clear-Site-Data` header.

import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./lib/i18n/routing";

const intlMiddleware = createMiddleware(routing);
const CLEAN_COOKIE = "tl_clean_v2";

// All existing top-level app routes — these must NEVER be intercepted by
// the locale middleware, even if their name matches a locale code (e.g. /id).
// When a user visits /blog, /films etc. they always get the root-level page.
const EXISTING_ROUTES = new Set([
  "blog",
  "films",
  "reels",
  "library",
  "learn",
  "community",
  "social-wall",
  "events",
  "promotions",
  "careers",
  "creatives",
  "ecosystem",
  "security",
  "privacy",
  "terms",
  "roadmap",
  "submit",
  "my-submissions",
  "reset",
  "vs",
  "feed",
  "sitemap.xml",
  "robots.txt",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, static assets, the SW file itself, and /reset
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/sw.js" ||
    pathname.startsWith("/reset") ||
    /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|js|css|woff2?|ttf|xml|txt|json|webmanifest)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Extract the first path segment (e.g. "blog" from "/blog/some-post")
  const firstSegment = pathname.split("/")[1] ?? "";

  // If this is an existing root-level route, skip locale routing entirely.
  // This prevents /blog, /films, /social-wall etc. from being intercepted
  // and redirected to /th/blog etc. (which would 404).
  if (EXISTING_ROUTES.has(firstSegment)) {
    return applyCacheClear(request, NextResponse.next());
  }

  // Run next-intl locale routing for the localized pages
  // (homepage /, /calculator, /faq, /apply, /token and their locale variants)
  const response = intlMiddleware(request);
  return applyCacheClear(request, response);
}

function applyCacheClear(request: NextRequest, response: NextResponse): NextResponse {
  const cleaned = request.cookies.get(CLEAN_COOKIE);
  if (!cleaned) {
    response.headers.set(
      "Clear-Site-Data",
      '"cache", "storage", "executionContexts"'
    );
    response.cookies.set(CLEAN_COOKIE, "1", {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|js|css|woff2?|ttf|xml|txt|json|webmanifest)).*)",
  ],
};
