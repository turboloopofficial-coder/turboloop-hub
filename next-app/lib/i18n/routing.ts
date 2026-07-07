import { defineRouting } from "next-intl/routing";

export const LOCALES = ["en", "th", "ko", "lo", "hi", "de", "id", "ta"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, { label: string; flag: string; native: string }> = {
  en: { label: "English",           flag: "🇬🇧", native: "English" },
  th: { label: "Thai",              flag: "🇹🇭", native: "ภาษาไทย" },
  ko: { label: "Korean",            flag: "🇰🇷", native: "한국어" },
  lo: { label: "Lao",               flag: "🇱🇦", native: "ພາສາລາວ" },
  hi: { label: "Hindi",             flag: "🇮🇳", native: "हिंदी" },
  de: { label: "German",            flag: "🇩🇪", native: "Deutsch" },
  id: { label: "Indonesian",        flag: "🇮🇩", native: "Bahasa Indonesia" },
  ta: { label: "Tamil",             flag: "🇮🇳", native: "தமிழ்" },
};

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: LOCALES,

  // Used when no locale matches — English is the default (no prefix)
  defaultLocale: "en",

  // English gets no prefix: turboloop.tech/ (not turboloop.tech/en/)
  // All other locales get a prefix: turboloop.tech/th/, turboloop.tech/ko/, etc.
  localePrefix: "as-needed",
});
