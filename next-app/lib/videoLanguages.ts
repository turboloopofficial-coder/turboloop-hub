// ─────────────────────────────────────────────────────────────────────────────
// TurboLoop Video Language Registry
//
// ⚠️  THIS FILE IS THE SINGLE SOURCE OF TRUTH for all video language data.
//     It is intentionally separate from VideoExplainerSection.tsx so that
//     component rewrites can never accidentally delete episode data.
//
// HOW TO ADD A NEW LANGUAGE:
//   Add a new entry to the LANGUAGES array below with:
//     video: `${R2_BASE}/turboloop-explainer-{langcode}.mp4`  (or null if not yet uploaded)
//     ep2video: `${R2_BASE}/turboloop-ep2-{langcode}.mp4`     (or null if not yet uploaded)
//     youtubeUrl: "https://youtu.be/..."                       (or null)
//     ep2youtubeUrl: "https://youtu.be/..."                    (or null)
//
// HOW TO ADD A NEW EP2 DUBBED VIDEO:
//   Set ep2video to `${R2_BASE}/turboloop-ep2-{langcode}.mp4` for that language.
//
// HOW TO ADD A NEW YOUTUBE LINK:
//   Set youtubeUrl or ep2youtubeUrl for that language entry.
//
// DO NOT remove the ep2video or ep2youtubeUrl fields — Episode 2 is a
// permanent feature of the homepage. It has been accidentally deleted
// multiple times by sessions that rewrote VideoExplainerSection.tsx.
// ─────────────────────────────────────────────────────────────────────────────

export const R2_BASE = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/videos";

export interface VideoLanguage {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
  /** Episode 1 R2 URL — null if not yet uploaded */
  video: string | null;
  /** Episode 2 R2 URL — null if not yet uploaded */
  ep2video: string | null;
  /** Thumbnail URL */
  thumb: string | null;
  /** Episode 1 YouTube link */
  youtubeUrl: string | null;
  /** Episode 2 YouTube link */
  ep2youtubeUrl: string | null;
}

export const LANGUAGES: VideoLanguage[] = [
  { code: "en", label: "English",    nativeLabel: "English",     flag: "🇬🇧", video: `${R2_BASE}/turboloop-explainer-en.mp4`,  ep2video: `${R2_BASE}/turboloop-ep2-en.mp4`,  thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`,  youtubeUrl: "https://youtu.be/LFViES_Qbzg", ep2youtubeUrl: "https://youtu.be/F4wk9Zfi2mI" },
  { code: "hi", label: "Hindi",      nativeLabel: "हिन्दी",      flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-hi.mp4`,  ep2video: null,  thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`,  youtubeUrl: "https://youtu.be/X0p28uy2yeI", ep2youtubeUrl: null },
  { code: "th", label: "Thai",       nativeLabel: "ภาษาไทย",     flag: "🇹🇭", video: `${R2_BASE}/turboloop-explainer-th.mp4`,  ep2video: null,  thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`,  youtubeUrl: "https://youtu.be/IdlosvrEgTo", ep2youtubeUrl: null },
  { code: "es", label: "Spanish",    nativeLabel: "Español",     flag: "🇪🇸", video: `${R2_BASE}/turboloop-explainer-es.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/GF2FTTuMy5U", ep2youtubeUrl: null },
  { code: "fr", label: "French",     nativeLabel: "Français",    flag: "🇫🇷", video: `${R2_BASE}/turboloop-explainer-fr.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/FVhTsrXVcmA", ep2youtubeUrl: null },
  { code: "de", label: "German",     nativeLabel: "Deutsch",     flag: "🇩🇪", video: `${R2_BASE}/turboloop-explainer-de.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/H4LtRG4uJcU", ep2youtubeUrl: null },
  { code: "it", label: "Italian",    nativeLabel: "Italiano",    flag: "🇮🇹", video: `${R2_BASE}/turboloop-explainer-it.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/664q4mO1USE", ep2youtubeUrl: null },
  { code: "pt", label: "Portuguese", nativeLabel: "Português",   flag: "🇧🇷", video: `${R2_BASE}/turboloop-explainer-pt.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/cWL9pFtIdOY", ep2youtubeUrl: null },
  { code: "ru", label: "Russian",    nativeLabel: "Русский",     flag: "🇷🇺", video: `${R2_BASE}/turboloop-explainer-ru.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/RJd3C8Vypp8", ep2youtubeUrl: null },
  { code: "zh", label: "Chinese",    nativeLabel: "中文",         flag: "🇨🇳", video: `${R2_BASE}/turboloop-explainer-zh.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/IMgyKrwpvdg", ep2youtubeUrl: null },
  { code: "ja", label: "Japanese",   nativeLabel: "日本語",       flag: "🇯🇵", video: `${R2_BASE}/turboloop-explainer-ja.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/xS3FLBX-l4Q", ep2youtubeUrl: null },
  { code: "ko", label: "Korean",     nativeLabel: "한국어",       flag: "🇰🇷", video: `${R2_BASE}/turboloop-explainer-ko.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/8kSxNbb6N8s", ep2youtubeUrl: null },
  { code: "ar", label: "Arabic",     nativeLabel: "العربية",     flag: "🇸🇦", video: `${R2_BASE}/turboloop-explainer-ar.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/wmeBIIRu660", ep2youtubeUrl: "https://youtu.be/lrlCjXPlf8c" },
  { code: "tr", label: "Turkish",    nativeLabel: "Türkçe",      flag: "🇹🇷", video: `${R2_BASE}/turboloop-explainer-tr.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/RaI8UUK-REg", ep2youtubeUrl: null },
  { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt",  flag: "🇻🇳", video: `${R2_BASE}/turboloop-explainer-vi.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/NzRo_n97hqY", ep2youtubeUrl: null },
  { code: "id", label: "Indonesian", nativeLabel: "Bahasa Indonesia", flag: "🇮🇩", video: `${R2_BASE}/turboloop-explainer-id.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/l0_JFNCUSx8", ep2youtubeUrl: null },
  { code: "nl", label: "Dutch",      nativeLabel: "Nederlands",  flag: "🇳🇱", video: `${R2_BASE}/turboloop-explainer-nl.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/xRkjWfqbMk4", ep2youtubeUrl: null },
  { code: "pl", label: "Polish",     nativeLabel: "Polski",      flag: "🇵🇱", video: `${R2_BASE}/turboloop-explainer-pl.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/ISjTgms4k5Q", ep2youtubeUrl: null },
  { code: "sv", label: "Swedish",    nativeLabel: "Svenska",     flag: "🇸🇪", video: `${R2_BASE}/turboloop-explainer-sv.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/JXMl1up4EZI", ep2youtubeUrl: null },
  { code: "da", label: "Danish",     nativeLabel: "Dansk",       flag: "🇩🇰", video: `${R2_BASE}/turboloop-explainer-da.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/QM6w4w2D0Bc", ep2youtubeUrl: null },
  { code: "fi", label: "Finnish",    nativeLabel: "Suomi",       flag: "🇫🇮", video: `${R2_BASE}/turboloop-explainer-fi.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/f6wE6U7aaBU", ep2youtubeUrl: null },
  { code: "no", label: "Norwegian",  nativeLabel: "Norsk",       flag: "🇳🇴", video: `${R2_BASE}/turboloop-explainer-no.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/7l22-r-QRPQ", ep2youtubeUrl: null },
  { code: "el", label: "Greek",      nativeLabel: "Ελληνικά",    flag: "🇬🇷", video: `${R2_BASE}/turboloop-explainer-el.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/YEU6w6KGLHk", ep2youtubeUrl: null },
  { code: "cs", label: "Czech",      nativeLabel: "Čeština",     flag: "🇨🇿", video: `${R2_BASE}/turboloop-explainer-cs.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/c-x4cz0xtNY", ep2youtubeUrl: null },
  { code: "hu", label: "Hungarian",  nativeLabel: "Magyar",      flag: "🇭🇺", video: `${R2_BASE}/turboloop-explainer-hu.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/BYsAnRvdFO8", ep2youtubeUrl: null },
  { code: "ro", label: "Romanian",   nativeLabel: "Română",      flag: "🇷🇴", video: `${R2_BASE}/turboloop-explainer-ro.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/s9xcxGsCq3k", ep2youtubeUrl: null },
  { code: "sk", label: "Slovak",     nativeLabel: "Slovenčina",  flag: "🇸🇰", video: `${R2_BASE}/turboloop-explainer-sk.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/BNrPkTVNoOk", ep2youtubeUrl: null },
  { code: "uk", label: "Ukrainian",  nativeLabel: "Українська",  flag: "🇺🇦", video: `${R2_BASE}/turboloop-explainer-uk.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/IK7ME7HlCF8", ep2youtubeUrl: null },
  { code: "bg", label: "Bulgarian",  nativeLabel: "Български",   flag: "🇧🇬", video: `${R2_BASE}/turboloop-explainer-bg.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/eeaBDI6mimM", ep2youtubeUrl: null },
  { code: "hr", label: "Croatian",   nativeLabel: "Hrvatski",    flag: "🇭🇷", video: `${R2_BASE}/turboloop-explainer-hr.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/-bwJmtH4ma8", ep2youtubeUrl: null },
  { code: "sr", label: "Serbian",    nativeLabel: "Српски",      flag: "🇷🇸", video: `${R2_BASE}/turboloop-explainer-sr.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/-ChmY8iT_6s", ep2youtubeUrl: null },
  { code: "sl", label: "Slovenian",  nativeLabel: "Slovenščina", flag: "🇸🇮", video: `${R2_BASE}/turboloop-explainer-sl.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/q-2hGcI29eM", ep2youtubeUrl: null },
  { code: "lt", label: "Lithuanian", nativeLabel: "Lietuvių",    flag: "🇱🇹", video: `${R2_BASE}/turboloop-explainer-lt.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/uh-qClc3A7g", ep2youtubeUrl: null },
  { code: "lv", label: "Latvian",    nativeLabel: "Latviešu",    flag: "🇱🇻", video: `${R2_BASE}/turboloop-explainer-lv.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/-1Ctmy43gHE", ep2youtubeUrl: null },
  { code: "et", label: "Estonian",   nativeLabel: "Eesti",       flag: "🇪🇪", video: `${R2_BASE}/turboloop-explainer-et.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/GiHONYbtrIw", ep2youtubeUrl: null },
  { code: "ms", label: "Malay",      nativeLabel: "Bahasa Melayu", flag: "🇲🇾", video: `${R2_BASE}/turboloop-explainer-ms.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/jOlIx0piPwE", ep2youtubeUrl: null },
  { code: "tl", label: "Filipino",   nativeLabel: "Filipino",    flag: "🇵🇭", video: `${R2_BASE}/turboloop-explainer-tl.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/hVgtYRVMSYo", ep2youtubeUrl: null },
  { code: "ta", label: "Tamil",      nativeLabel: "தமிழ்",       flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-ta.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/jk-56qXOSDc", ep2youtubeUrl: null },
  { code: "bn", label: "Bengali",    nativeLabel: "বাংলা",       flag: "🇧🇩", video: `${R2_BASE}/turboloop-explainer-bn.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/hf558S_88z0", ep2youtubeUrl: null },
  { code: "te", label: "Telugu",     nativeLabel: "తెలుగు",      flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-te.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/NT9VQ5xSVPA", ep2youtubeUrl: null },
  { code: "mr", label: "Marathi",    nativeLabel: "मराठी",       flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-mr.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/1qxrYD-FNmo", ep2youtubeUrl: null },
  { code: "gu", label: "Gujarati",   nativeLabel: "ગુજરાતી",    flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-gu.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/ubKnk_KiHbE", ep2youtubeUrl: null },
  { code: "kn", label: "Kannada",    nativeLabel: "ಕನ್ನಡ",      flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-kn.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/9MeB1weV1Ug", ep2youtubeUrl: null },
  { code: "ml", label: "Malayalam",  nativeLabel: "മലയാളം",    flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-ml.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/_g_5AKLPqzs", ep2youtubeUrl: null },
  { code: "ur", label: "Urdu",       nativeLabel: "اردو",        flag: "🇵🇰", video: `${R2_BASE}/turboloop-explainer-ur.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/VN_R65mgyyU", ep2youtubeUrl: null },
  { code: "fa", label: "Persian",    nativeLabel: "فارسی",       flag: "🇮🇷", video: `${R2_BASE}/turboloop-explainer-fa.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/ikS5FO7D1eU", ep2youtubeUrl: null },
  { code: "he", label: "Hebrew",     nativeLabel: "עברית",       flag: "🇮🇱", video: `${R2_BASE}/turboloop-explainer-he.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/QD5Ctj5yPLE", ep2youtubeUrl: null },
  { code: "sw", label: "Swahili",    nativeLabel: "Kiswahili",   flag: "🇰🇪", video: `${R2_BASE}/turboloop-explainer-sw.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/lferGVzrDgY", ep2youtubeUrl: null },
  { code: "am", label: "Amharic",    nativeLabel: "አማርኛ",        flag: "🇪🇹", video: `${R2_BASE}/turboloop-explainer-am.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/85jxzJR00Hs", ep2youtubeUrl: null },
  { code: "yo", label: "Yoruba",     nativeLabel: "Yorùbá",      flag: "🇳🇬", video: null, ep2video: null, thumb: null, youtubeUrl: null, ep2youtubeUrl: null },
  { code: "zu", label: "Zulu",       nativeLabel: "isiZulu",     flag: "🇿🇦", video: `${R2_BASE}/turboloop-explainer-zu.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null, ep2youtubeUrl: null },
  { code: "ig", label: "Igbo",       nativeLabel: "Igbo",        flag: "🇳🇬", video: null, ep2video: null, thumb: null, youtubeUrl: null, ep2youtubeUrl: null },
  { code: "ha", label: "Hausa",      nativeLabel: "Hausa",       flag: "🇳🇬", video: null, ep2video: null, thumb: null, youtubeUrl: null, ep2youtubeUrl: null },
  { code: "sn", label: "Shona",      nativeLabel: "chiShona",    flag: "🇿🇼", video: null, ep2video: null, thumb: null, youtubeUrl: null, ep2youtubeUrl: null },
  { code: "st", label: "Sesotho",    nativeLabel: "Sesotho",     flag: "🇿🇦", video: null, ep2video: null, thumb: null, youtubeUrl: null, ep2youtubeUrl: null },
  { code: "xh", label: "Xhosa",      nativeLabel: "isiXhosa",    flag: "🇿🇦", video: null, ep2video: null, thumb: null, youtubeUrl: null, ep2youtubeUrl: null },
  { code: "az", label: "Azerbaijani", nativeLabel: "Azərbaycan",  flag: "🇦🇿", video: `${R2_BASE}/turboloop-explainer-az.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null, ep2youtubeUrl: null },
  { code: "kk", label: "Kazakh",      nativeLabel: "Қазақша",     flag: "🇰🇿", video: `${R2_BASE}/turboloop-explainer-kk.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null, ep2youtubeUrl: null },
  { code: "uz", label: "Uzbek",       nativeLabel: "O'zbek",      flag: "🇺🇿", video: `${R2_BASE}/turboloop-explainer-uz.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null, ep2youtubeUrl: null },
  { code: "my", label: "Burmese",     nativeLabel: "မြန်မာဘာသာ",  flag: "🇲🇲", video: `${R2_BASE}/turboloop-explainer-my.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null, ep2youtubeUrl: null },
  { code: "km", label: "Khmer",       nativeLabel: "ភាសាខ្មែរ",   flag: "🇰🇭", video: `${R2_BASE}/turboloop-explainer-km.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null, ep2youtubeUrl: null },
  { code: "si", label: "Sinhala",     nativeLabel: "සිංහල",       flag: "🇱🇰", video: `${R2_BASE}/turboloop-explainer-si.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null, ep2youtubeUrl: null },
  { code: "ne", label: "Nepali",      nativeLabel: "नेपाली",      flag: "🇳🇵", video: `${R2_BASE}/turboloop-explainer-ne.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null, ep2youtubeUrl: null },
  { code: "pa", label: "Punjabi",     nativeLabel: "ਪੰਜਾਬੀ",      flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-pa.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null, ep2youtubeUrl: null },
  { code: "lo", label: "Lao",         nativeLabel: "ລາວ",         flag: "🇱🇦", video: `${R2_BASE}/turboloop-explainer-lo.mp4`, ep2video: null, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null, ep2youtubeUrl: null },
];

/** English is always the fallback language */
export const ENGLISH = LANGUAGES[0];

/**
 * Map from next-intl locale codes (used in URL paths) → video language codes
 * in the LANGUAGES array above.
 *
 * Most locales match 1:1 (e.g. "hi" → "hi"). Special cases:
 *  - "zh"  → "zh"   (Chinese; DB code is "cn" but video code is "zh")
 *  - "ar"  → "ar"   (Arabic; DB code is "sa")
 *  - "ur"  → "ur"   (Urdu; DB code is "pk")
 *  - "ko"  → "ko"   (Korean; DB codes are "ko"/"kr", video code is "ko")
 *  - "lo"  → "lo"   (Lao; DB codes are "lo"/"la", video code is "lo")
 *  - "pcm" → null   (Nigerian Pidgin — no video, falls back to English)
 */
export const LOCALE_TO_VIDEO_CODE: Record<string, string | null> = {
  en: "en", hi: "hi", th: "th", de: "de", fr: "fr", es: "es",
  it: "it", pt: "pt", ru: "ru", zh: "zh", ja: "ja", ko: "ko",
  ar: "ar", tr: "tr", vi: "vi", id: "id", nl: "nl", pl: "pl",
  sv: "sv", da: "da", fi: "fi", no: "no", el: "el", cs: "cs",
  hu: "hu", ro: "ro", sk: "sk", uk: "uk", bg: "bg", hr: "hr",
  sr: "sr", sl: "sl", lt: "lt", lv: "lv", et: "et", ms: "ms",
  tl: "tl", ta: "ta", bn: "bn", te: "te", mr: "mr", gu: "gu",
  kn: "kn", ml: "ml", ur: "ur", fa: "fa", he: "he", sw: "sw",
  am: "am", yo: "yo", zu: "zu", ig: "ig", ha: "ha", sn: "sn",
  st: "st", xh: "xh", az: "az", kk: "kk", uz: "uz", my: "my",
  km: "km", si: "si", ne: "ne", pa: "pa", lo: "lo",
  pcm: null,
};
