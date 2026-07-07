// Middleware — two responsibilities:
//
// 1. next-intl locale routing: detect the user's preferred language from
//    Accept-Language header and redirect to the correct locale prefix
//    (e.g. /th/, /ko/, /lo/). English is the default and gets no prefix.
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, static assets, the SW file itself, and /reset
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/sw.js" ||
    pathname.startsWith("/reset") ||
    /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|js|css|woff2?|ttf|xml|txt)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Run next-intl locale routing first
  const response = intlMiddleware(request);

  // Apply cache-clear on first visit (legacy PWA / SW cleanup)
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|js|css|woff2?|ttf|xml|txt)).*)",
  ],
};
