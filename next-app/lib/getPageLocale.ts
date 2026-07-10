/**
 * getPageLocale — reads the active locale for root-level pages (those that
 * live under app/ rather than app/[locale]/).
 *
 * Two access patterns are supported:
 *
 * 1. Middleware rewrite (EXISTING_ROUTES): When a user visits e.g. /ar/blog,
 *    our custom middleware rewrites the URL to /blog and injects an "x-locale"
 *    request header. This utility reads that header so root pages can call
 *    getTranslations() with the correct locale.
 *
 * 2. next-intl routing ([locale] wrappers): When a user visits /th/community,
 *    next-intl's own middleware handles the request and sets the
 *    "X-NEXT-INTL-LOCALE" header. The [locale]/community/page.tsx wrapper
 *    renders the root community page as a child — we read this header as a
 *    fallback so the root page picks up the correct locale.
 *
 * Falls back to "en" when neither header is present (direct /blog visit).
 */
import { headers } from "next/headers";

export async function getPageLocale(): Promise<string> {
  const h = await headers();
  // Our custom middleware sets x-locale for EXISTING_ROUTES rewrites.
  // next-intl middleware sets x-next-intl-locale for [locale] wrapper routes.
  return (
    h.get("x-locale") ??
    h.get("x-next-intl-locale") ??
    "en"
  );
}
