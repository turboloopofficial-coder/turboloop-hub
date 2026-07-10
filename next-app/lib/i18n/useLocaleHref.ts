"use client";
// useLocaleHref — returns a function that prepends the current locale prefix
// to any internal href, ensuring language persists across page navigation.
//
// Usage:
//   const localizeHref = useLocaleHref();
//   <Link href={localizeHref("/blog")} />
//   // If user is on /ar/, returns "/ar/blog"
//   // If user is on /en or /, returns "/blog"

import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "./routing";

/**
 * Extract the current locale from the URL pathname.
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
export function localizeHref(href: string, locale: Locale): string {
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

/**
 * React hook that returns a localizeHref function bound to the current locale.
 * Reads locale from the current URL pathname.
 */
export function useLocaleHref(): (href: string) => string {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  return (href: string) => localizeHref(href, locale);
}

/**
 * React hook that returns just the current locale from the URL path.
 */
export function useCurrentLocale(): Locale {
  const pathname = usePathname();
  return getLocaleFromPath(pathname);
}
