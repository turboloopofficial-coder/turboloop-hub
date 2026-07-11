import { defineRouting } from "next-intl/routing";
// ⚡ LANGUAGE SOURCE OF TRUTH: lib/languages.ts
// LOCALES and LOCALE_LABELS are derived from that config.
// To add a new language, edit ONLY lib/languages.ts.
import { LANGUAGES, LANGUAGE_ORDER } from "../languages";

// Deduplicate locales (some DB codes share a locale, e.g. kr/ko both use "ko")
const uniqueLocales = [...new Set(LANGUAGE_ORDER.map(code => LANGUAGES[code].locale))];

export const LOCALES = uniqueLocales as unknown as readonly string[];
export type Locale = typeof LOCALES[number];

export const LOCALE_LABELS: Record<string, { label: string; flag: string; native: string }> =
  Object.fromEntries(
    uniqueLocales.map(locale => {
      // Find the first language config that uses this locale
      const lang = Object.values(LANGUAGES).find(l => l.locale === locale)!;
      return [locale, { label: lang.name, flag: lang.flag, native: lang.nativeName }];
    })
  );

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: LOCALES as unknown as [string, ...string[]],

  // Used when no locale matches — English is the default (no prefix)
  defaultLocale: "en",

  // English gets no prefix: turboloop.tech/ (not turboloop.tech/en/)
  // All other locales get a prefix: turboloop.tech/th/, turboloop.tech/ko/, etc.
  localePrefix: "as-needed",
});
