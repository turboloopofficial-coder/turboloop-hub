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
// Pure utilities (server-safe) — re-exported for backward compatibility
export { localizeHref, getLocaleFromPath } from "./localeHref";
import { getLocaleFromPath, localizeHref } from "./localeHref";
import type { Locale } from "./routing";

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
