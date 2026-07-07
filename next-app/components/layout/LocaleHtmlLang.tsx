"use client";
// Sets the <html lang="..."> attribute dynamically based on the current URL locale.
// The root layout hardcodes lang="en" but this component overrides it client-side
// after hydration, ensuring screen readers and browser language detection work correctly.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@lib/i18n/routing";

export function LocaleHtmlLang() {
  const pathname = usePathname();
  useEffect(() => {
    const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
    const locale: Locale = LOCALES.includes(firstSegment as Locale)
      ? (firstSegment as Locale)
      : "en";
    document.documentElement.lang = locale;
  }, [pathname]);
  return null;
}
