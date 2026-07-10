/**
 * getPageLocale — reads the active locale for root-level pages (those that
 * live under app/ rather than app/[locale]/).
 *
 * When a user visits e.g. /ar/blog, the middleware rewrites the URL to /blog
 * and injects an "x-locale" request header. This utility reads that header so
 * root pages can call getTranslations() with the correct locale without needing
 * a prop (which Next.js doesn't allow for page components beyond params/searchParams).
 *
 * Falls back to "en" when no header is present (direct /blog visit).
 */
import { headers } from "next/headers";

export async function getPageLocale(): Promise<string> {
  const h = await headers();
  return h.get("x-locale") ?? "en";
}
