import { defineRouting } from "next-intl/routing";

export const LOCALES = [
  "en", "th", "ko", "lo", "hi", "de", "id", "ta",
  "ar", "zh", "it", "ur", "fr", "es", "pcm",
] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, { label: string; flag: string; native: string }> = {
  en: { label: "English",           flag: "🇬🇧", native: "English" },
  th: { label: "Thai",              flag: "🇹🇭", native: "ภาษาไทย" },
  ko: { label: "Korean",            flag: "🇰🇷", native: "한국어" },
  lo: { label: "Lao",               flag: "🇱🇦", native: "ພາສາລາວ" },
  hi: { label: "Hindi",             flag: "🇮🇳", native: "हिंदी" },
  de: { label: "German",            flag: "🇩🇪", native: "Deutsch" },
  id: { label: "Indonesian",        flag: "🇮🇩", native: "Bahasa Indonesia" },
  ta:  { label: "Tamil",                 flag: "🇮🇳", native: "தமிழ்" },
  ar:  { label: "Arabic",                flag: "🇸🇦", native: "العربية" },
  zh:  { label: "Chinese",               flag: "🇨🇳", native: "中文" },
  it:  { label: "Italian",               flag: "🇮🇹", native: "Italiano" },
  ur:  { label: "Urdu",                  flag: "🇵🇰", native: "اردو" },
  fr:  { label: "French",                flag: "🇫🇷", native: "Français" },
  es:  { label: "Spanish",               flag: "🇪🇸", native: "Español" },
  pcm: { label: "Nigerian Pidgin",       flag: "🇳🇬", native: "Naija" },
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
