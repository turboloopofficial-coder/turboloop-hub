"use client";
// FooterWrapper — client component that reads the current locale from the URL
// and renders Footer with the correct locale prop.
//
// This is used in the root app/layout.tsx so that the Footer automatically
// adapts to any locale without needing locale params in the root layout.
// The [locale]/layout.tsx no longer renders Footer — this wrapper handles it.

import { useCurrentLocale } from "@lib/i18n/useLocaleHref";
import { Footer } from "./Footer";

export function FooterWrapper() {
  const locale = useCurrentLocale();
  return <Footer locale={locale} />;
}
