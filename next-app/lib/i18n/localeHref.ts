// localeHref.ts — pure server-safe utilities for locale-aware hrefs.
// No "use client" — safe to import in both server and client components.
// Hooks (useLocaleHref, useCurrentLocale) remain in useLocaleHref.ts.
import { LOCALES, type Locale } from "./routing";
export type { Locale };

/**
 * Extract the current locale from a URL pathname.
 * Returns "en" if no locale prefix is found.
 */
export function getLocaleFromPath(pathname: string): Locale {
  const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
  if (firstSegment !== "en" && LOCALES.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  return "en";
}

/**
 * Prepend the locale prefix to a bare href.
 * English gets no prefix (stays as "/blog").
 * Other locales get prefix (e.g. "/ar/blog").
 * External URLs and anchors are returned unchanged.
 */
export function localizeHref(href: string, locale: Locale | string): string {
  // Don't modify external URLs, anchors, or already-prefixed paths
  if (
    href.startsWith("http") ||
    href.startsWith("//") ||
    href.startsWith("#")
  ) {
    return href;
  }
  // English = no prefix
  if (locale === "en") return href;
  // Already has locale prefix? Don't double-prefix
  const segments = href.split("/").filter(Boolean);
  if (LOCALES.includes(segments[0] as Locale)) {
    return href;
  }
  // Prepend locale
  return `/${locale}${href === "/" ? "" : href}`;
}
