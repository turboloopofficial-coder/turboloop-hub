// Middleware — three responsibilities:
//
// 1. next-intl locale routing: detect the user's preferred language from
//    Accept-Language header and redirect to the correct locale prefix
//    (e.g. /th/, /ko/, /lo/). English is the default and gets no prefix.
//
// 2. Locale-prefixed existing routes: when a user navigates to e.g.
//    /ar/blog or /zh/films/what-is-turboloop, rewrite the URL to the
//    base path (/blog, /films/what-is-turboloop) while setting the
//    NEXT_LOCALE cookie so the page renders with the correct locale context.
//    This allows the language picker to stay on the current page when
//    switching language, even for pages that don't have a [locale] variant.
//
// 3. Cache nuclear option: users who installed the legacy SPA's PWA, or
//    whose Brave is using aggressive cache, continue to see the OLD
//    Vite-built SPA HTML even after the Next.js cutover.
//    FIX: when a request arrives without our "I've been cleaned" cookie,
//    we respond with the HTTP `Clear-Site-Data` header.

import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing, LOCALES, type Locale } from "./lib/i18n/routing";

// Maps next-intl locale codes → DB blog language codes.
// Used to inject ?lang= when rewriting locale-prefixed blog URLs.
const LOCALE_TO_BLOG_LANG: Record<string, string> = {
  en: "en",
  th: "th",
  ko: "kr",   // next-intl "ko" → DB "kr"
  lo: "la",   // next-intl "lo" → DB "la"
  hi: "hi",
  de: "de",
  id: "id",
  ta: "ta",
  ar: "sa",   // next-intl "ar" → DB "sa"
  zh: "cn",   // next-intl "zh" → DB "cn"
  it: "it",
  ur: "pk",   // next-intl "ur" → DB "pk"
  fr: "fr",
  es: "es",
  pcm: "ng",  // next-intl "pcm" → DB "ng"
};

const intlMiddleware = createMiddleware(routing);
const CLEAN_COOKIE = "tl_clean_v2";

// All existing top-level app routes — these are served from the root app dir
// (not from app/[locale]/). When accessed without a locale prefix they render
// normally. When accessed WITH a locale prefix (e.g. /ar/blog) we rewrite
// to the base path and set the locale cookie so the page knows the active locale.
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

  // Extract the first path segment (e.g. "ar" from "/ar/blog/some-post")
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0] ?? "";

  // Check if the first segment is a known non-English locale prefix
  const isLocalePrefix = firstSegment !== "en" && LOCALES.includes(firstSegment as Locale);

  if (isLocalePrefix) {
    const locale = firstSegment as Locale;
    // Strip the locale prefix to get the bare path
    // e.g. "/ar/blog/some-post" → "/blog/some-post"
    //      "/ar"                → "/"
    const barePath = pathname.slice(locale.length + 1) || "/";
    const bareFirstSegment = barePath.split("/").filter(Boolean)[0] ?? "";

    // If the bare path is an existing root-level route, rewrite to it
    // while preserving the locale via cookie.
    if (EXISTING_ROUTES.has(bareFirstSegment)) {
      const url = request.nextUrl.clone();
      url.pathname = barePath;

      // For the blog route: inject ?lang=<db_code> so the blog page
      // server component pre-selects the correct language tab.
      if (bareFirstSegment === "blog" && !url.searchParams.has("lang")) {
        const dbLang = LOCALE_TO_BLOG_LANG[locale];
        if (dbLang && dbLang !== "en") {
          url.searchParams.set("lang", dbLang);
        }
      }

      // Pass locale as a request header so server components can read it
      // via headers() without needing a prop — Next.js page components
      // cannot accept arbitrary props beyond params/searchParams.
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-locale", locale);

      const response = NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
      });
      // Set locale cookie so the page and its components know the active locale
      response.cookies.set("NEXT_LOCALE", locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
      return applyCacheClear(request, response);
    }

    // Otherwise let next-intl handle it (localized pages: /, /calculator, etc.)
    const response = intlMiddleware(request);
    return applyCacheClear(request, response);
  }

  // If this is an existing root-level route (no locale prefix), skip locale routing.
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
