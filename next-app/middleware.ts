// Cache nuclear option middleware.
//
// THE PROBLEM: users who installed the legacy SPA's PWA, or whose Brave
// is using aggressive cache, continue to see the OLD Vite-built SPA HTML
// even after the Next.js cutover. The old service worker intercepts
// network requests and serves stale shell HTML before the browser ever
// reaches the new code.
//
// THE FIX: when a request arrives without our "I've been cleaned" cookie,
// we respond with the HTTP `Clear-Site-Data` header. The browser
// IMMEDIATELY purges:
//   - HTTP cache for this origin
//   - All cache-storage entries (which is where service-worker caches
//     live — Workbox precache, runtime cache, everything)
//   - All registered service workers
//
// On the SAME response we set a long-lived cookie marking this device
// as cleaned, so subsequent visits don't trigger the (mildly expensive)
// cache wipe.
//
// Net effect: any user who lands on turboloop.tech with the old SW
// active gets one auto-clean visit, then forever-after sees the real
// Next.js build.

import { NextRequest, NextResponse } from "next/server";

const CLEAN_COOKIE = "tl_clean_v2";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only run on actual page navigations. Skip API routes, static
  // assets, the SW file itself, and the /reset utility (which has its
  // own dedicated headers).
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/sw.js" ||
    pathname.startsWith("/reset") ||
    /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|js|css|woff2?|ttf|xml|txt)$/i.test(
      pathname
    )
  ) {
    return response;
  }

  // First-visit detection — does the cleaned cookie exist?
  const cleaned = request.cookies.get(CLEAN_COOKIE);
  if (!cleaned) {
    // Clear caches + storage (DOES NOT clear cookies, so the cookie we
    // set on this same response survives). After this header, the
    // browser nukes its HTTP cache + cache-storage entries for this
    // origin, which kills the legacy Workbox SW caches.
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
  // Run on every page-like request. Static asset filtering happens
  // inside the function (above) so we keep the matcher simple.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
