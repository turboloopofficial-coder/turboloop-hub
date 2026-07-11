/**
 * TURBOLOOP MASTER LANGUAGE CONFIGURATION
 * 
 * This is the single source of truth for all language-related properties across the codebase.
 * Adding a new language requires editing ONLY this file and adding the translation JSON.
 */

export type LanguageCode = 
  | "en" | "de" | "hi" | "id" | "th" | "ko" | "lo" | "fr" 
  | "ta" | "la" | "cn" | "es" | "ng" | "it" | "sa" | "kr" 
  | "pk" | "bn" | "tr";

export interface LanguageConfig {
  /** The 2-letter DB code used internally (e.g., "en", "hi", "kr") */
  code: LanguageCode;
  /** The next-intl locale code used in URLs (e.g., "en", "hi", "ko") */
  locale: string;
  /** English name of the language */
  name: string;
  /** Native name of the language */
  nativeName: string;
  /** Emoji flag */
  flag: string;
  /** BCP-47 code for hreflang and RSS (e.g., "en-us", "zh-cn") */
  bcp47: string;
  /** Slug suffix for translated blog posts (e.g., "-hi") */
  slugSuffix: string;
  /** RSS feed title */
  rssTitle: string;
  /** RSS feed description */
  rssDescription: string;
  /** Telegram channel identifier (e.g., "telegram_hi"). Null if no dedicated channel. */
  telegramChannel: string | null;
}

export const LANGUAGES: Record<LanguageCode, LanguageConfig> = {
  en: {
    code: "en", locale: "en", name: "English", nativeName: "English", flag: "🇬🇧",
    bcp47: "en-us", slugSuffix: "", telegramChannel: "telegram_en",
    rssTitle: "Turbo Loop — Editorial",
    rssDescription: "Long-form articles on DeFi, yield, security, and the math behind TurboLoop."
  },
  de: {
    code: "de", locale: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪",
    bcp47: "de-de", slugSuffix: "-de", telegramChannel: "telegram_de",
    rssTitle: "Turbo Loop — Redaktion",
    rssDescription: "Langform-Artikel über DeFi, Renditen, Sicherheit und die Mathematik hinter TurboLoop."
  },
  hi: {
    code: "hi", locale: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳",
    bcp47: "hi-in", slugSuffix: "-hi", telegramChannel: "telegram_hi",
    rssTitle: "Turbo Loop — संपादकीय",
    rssDescription: "DeFi, यील्ड, सुरक्षा और TurboLoop के पीछे के गणित पर विस्तृत लेख।"
  },
  id: {
    code: "id", locale: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩",
    bcp47: "id-id", slugSuffix: "-id", telegramChannel: "telegram_id",
    rssTitle: "Turbo Loop — Editorial",
    rssDescription: "Artikel mendalam tentang DeFi, yield, keamanan, dan matematika di balik TurboLoop."
  },
  th: {
    code: "th", locale: "th", name: "Thai", nativeName: "ภาษาไทย", flag: "🇹🇭",
    bcp47: "th-th", slugSuffix: "-th", telegramChannel: null,
    rssTitle: "Turbo Loop — บทบรรณาธิการ",
    rssDescription: "บทความเชิงลึกเกี่ยวกับ DeFi, ผลตอบแทน, ความปลอดภัย และคณิตศาสตร์เบื้องหลัง TurboLoop."
  },
  ko: {
    code: "ko", locale: "ko", name: "Korean (alt)", nativeName: "한국어 (alt)", flag: "🇰🇷",
    bcp47: "ko-kr", slugSuffix: "-ko", telegramChannel: null,
    rssTitle: "Turbo Loop — 에디토리얼",
    rssDescription: "DeFi, 수익, 보안 및 TurboLoop의 수학에 관한 심층 기사."
  },
  kr: {
    code: "kr", locale: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷",
    bcp47: "ko-kr", slugSuffix: "-kr", telegramChannel: null,
    rssTitle: "Turbo Loop — 에디토리얼",
    rssDescription: "DeFi, 수익, 보안 및 TurboLoop의 수학에 관한 심층 기사."
  },
  lo: {
    code: "lo", locale: "lo", name: "Lao (alt)", nativeName: "ພາສາລາວ (alt)", flag: "🇱🇦",
    bcp47: "lo-la", slugSuffix: "-lo", telegramChannel: null,
    rssTitle: "Turbo Loop — ບົດບັນນາທິການ",
    rssDescription: "ບົດຄວາມລະອຽດກ່ຽວກັບ DeFi, ຜົນຕອບແທນ, ຄວາມປອດໄພ ແລະ ຄະນິດສາດທີ່ຢູ່ເບື້ອງຼັງ TurboLoop."
  },
  la: {
    code: "la", locale: "lo", name: "Lao", nativeName: "ພາສາລາວ", flag: "🇱🇦",
    bcp47: "lo-la", slugSuffix: "-la", telegramChannel: null,
    rssTitle: "Turbo Loop — ບົດບັນນາທິການ",
    rssDescription: "ບົດຄວາມລະອຽດກ່ຽວກັບ DeFi, ຜົນຕອບແທນ, ຄວາມປອດໄພ ແລະ ຄະນິດສາດທີ່ຢູ່ເບື້ອງຼັງ TurboLoop."
  },
  fr: {
    code: "fr", locale: "fr", name: "French", nativeName: "Français", flag: "🇫🇷",
    bcp47: "fr-fr", slugSuffix: "-fr", telegramChannel: null,
    rssTitle: "Turbo Loop — Éditorial",
    rssDescription: "Articles approfondis sur la DeFi, le rendement, la sécurité et les mathématiques derrière TurboLoop."
  },
  ta: {
    code: "ta", locale: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳",
    bcp47: "ta-in", slugSuffix: "-ta", telegramChannel: null,
    rssTitle: "Turbo Loop — தலையங்கம்",
    rssDescription: "DeFi, வருமானம், பாதுகாப்பு மற்றும் TurboLoop பின்னணியிலுள்ள கணிதம் பற்றிய ஆழமான கட்டுரைகள்."
  },
  cn: {
    code: "cn", locale: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳",
    bcp47: "zh-cn", slugSuffix: "-cn", telegramChannel: null,
    rssTitle: "Turbo Loop — 社论",
    rssDescription: "关于DeFi、收益、安全以及TurboLoop背后数学的深度文章。"
  },
  es: {
    code: "es", locale: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸",
    bcp47: "es-es", slugSuffix: "-es", telegramChannel: null,
    rssTitle: "Turbo Loop — Editorial",
    rssDescription: "Artículos en profundidad sobre DeFi, rendimiento, seguridad y las matemáticas detrás de TurboLoop."
  },
  ng: {
    code: "ng", locale: "pcm", name: "Nigerian Pidgin", nativeName: "Naija", flag: "🇳🇬",
    bcp47: "en-ng", slugSuffix: "-ng", telegramChannel: null,
    rssTitle: "Turbo Loop — Editorial",
    rssDescription: "Long articles about DeFi, yield, security, and the math wey dey behind TurboLoop."
  },
  it: {
    code: "it", locale: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹",
    bcp47: "it-it", slugSuffix: "-it", telegramChannel: null,
    rssTitle: "Turbo Loop — Editoriale",
    rssDescription: "Articoli approfonditi su DeFi, rendimento, sicurezza e la matematica dietro TurboLoop."
  },
  sa: {
    code: "sa", locale: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦",
    bcp47: "ar-sa", slugSuffix: "-sa", telegramChannel: null,
    rssTitle: "Turbo Loop — افتتاحية",
    rssDescription: "مقالات متعمقة حول التمويل اللامركزي والعائد والأمان والرياضيات وراء TurboLoop."
  },
  pk: {
    code: "pk", locale: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰",
    bcp47: "ur-pk", slugSuffix: "-pk", telegramChannel: null,
    rssTitle: "Turbo Loop — اداریہ",
    rssDescription: "DeFi، منافع، سیکیورٹی اور TurboLoop کے پیچھے ریاضی پر گہرائی سے مضامین۔"
  },
  bn: {
    code: "bn", locale: "bn", name: "Bangla", nativeName: "বাংলা", flag: "🇧🇩",
    bcp47: "bn-bd", slugSuffix: "-bn", telegramChannel: "telegram_bn",
    rssTitle: "Turbo Loop — সম্পাদকীয়",
    rssDescription: "DeFi, ইল্ড, নিরাপত্তা এবং TurboLoop এর পেছনের গণিত নিয়ে বিস্তারিত প্রবন্ধ।"
  },
  tr: {
    code: "tr", locale: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷",
    bcp47: "tr-tr", slugSuffix: "-tr", telegramChannel: null,
    rssTitle: "Turbo Loop — Editoryal",
    rssDescription: "DeFi, getiri, güvenlik ve TurboLoop'un arkasındaki matematik hakkında derinlemesine makaleler."
  }
};

/** Ordered list of languages for UI rendering (English first, then alphabetical or priority) */
export const LANGUAGE_ORDER: LanguageCode[] = [
  "en", "fr", "es", "hi", "ta", "th", "kr", "ko", "la", "lo", 
  "cn", "sa", "it", "pk", "ng", "de", "id", "bn", "tr"
];

/** Helper to get the base hreflang (e.g., "en-us" -> "en") */
export function getHreflang(code: LanguageCode): string {
  return LANGUAGES[code].bcp47.split("-")[0];
}
