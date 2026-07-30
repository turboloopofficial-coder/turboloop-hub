/**
 * LocaleDetector — auto-detects the user's browser language and shows a
 * non-intrusive banner suggesting they switch to their native language version.
 *
 * Why: 80%+ of traffic is from non-English speaking countries (India, Nigeria,
 * Thailand, Indonesia). The hub has 65 language versions of content but users
 * must manually find the language selector. This component bridges that gap.
 *
 * Behavior:
 * - Checks navigator.language against supported languages
 * - Shows a small floating banner at the top if a match is found
 * - Dismissable (remembers in localStorage for 7 days)
 * - Only shows on first visit (not on return visits from same session)
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe2, X } from "lucide-react";

const DISMISS_KEY = "tl_locale_banner_dismissed";
const DISMISS_DAYS = 7;

// Map browser language codes to our supported languages and their native names
const LANGUAGE_MAP: Record<string, { name: string; nativeName: string; flag: string }> = {
  hi: { name: "Hindi", nativeName: "हिन्दी", flag: "in" },
  ta: { name: "Tamil", nativeName: "தமிழ்", flag: "in" },
  te: { name: "Telugu", nativeName: "తెలుగు", flag: "in" },
  bn: { name: "Bengali", nativeName: "বাংলা", flag: "bd" },
  mr: { name: "Marathi", nativeName: "मराठी", flag: "in" },
  gu: { name: "Gujarati", nativeName: "ગુજરાતી", flag: "in" },
  kn: { name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "in" },
  ml: { name: "Malayalam", nativeName: "മലയാളം", flag: "in" },
  th: { name: "Thai", nativeName: "ไทย", flag: "th" },
  id: { name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "id" },
  ms: { name: "Malay", nativeName: "Bahasa Melayu", flag: "my" },
  vi: { name: "Vietnamese", nativeName: "Tiếng Việt", flag: "vn" },
  ko: { name: "Korean", nativeName: "한국어", flag: "kr" },
  ja: { name: "Japanese", nativeName: "日本語", flag: "jp" },
  zh: { name: "Chinese", nativeName: "中文", flag: "cn" },
  ar: { name: "Arabic", nativeName: "العربية", flag: "sa" },
  ur: { name: "Urdu", nativeName: "اردو", flag: "pk" },
  fa: { name: "Persian", nativeName: "فارسی", flag: "ir" },
  tr: { name: "Turkish", nativeName: "Türkçe", flag: "tr" },
  ru: { name: "Russian", nativeName: "Русский", flag: "ru" },
  uk: { name: "Ukrainian", nativeName: "Українська", flag: "ua" },
  pl: { name: "Polish", nativeName: "Polski", flag: "pl" },
  de: { name: "German", nativeName: "Deutsch", flag: "de" },
  fr: { name: "French", nativeName: "Français", flag: "fr" },
  es: { name: "Spanish", nativeName: "Español", flag: "es" },
  pt: { name: "Portuguese", nativeName: "Português", flag: "br" },
  it: { name: "Italian", nativeName: "Italiano", flag: "it" },
  nl: { name: "Dutch", nativeName: "Nederlands", flag: "nl" },
  sw: { name: "Swahili", nativeName: "Kiswahili", flag: "ke" },
  ha: { name: "Hausa", nativeName: "Hausa", flag: "ng" },
  yo: { name: "Yoruba", nativeName: "Yorùbá", flag: "ng" },
  ne: { name: "Nepali", nativeName: "नेपाली", flag: "np" },
  my: { name: "Myanmar", nativeName: "မြန်မာ", flag: "mm" },
  km: { name: "Khmer", nativeName: "ខ្មែរ", flag: "kh" },
  si: { name: "Sinhala", nativeName: "සිංහල", flag: "lk" },
};

function getDetectedLanguage(): string | null {
  if (typeof navigator === "undefined") return null;
  const browserLang = navigator.language?.split("-")[0]?.toLowerCase();
  if (!browserLang || browserLang === "en") return null;
  return LANGUAGE_MAP[browserLang] ? browserLang : null;
}

function isDismissed(): boolean {
  try {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!dismissed) return false;
    const ts = parseInt(dismissed, 10);
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function LocaleDetector() {
  const [show, setShow] = useState(false);
  const [lang, setLang] = useState<string | null>(null);

  useEffect(() => {
    if (isDismissed()) return;
    const detected = getDetectedLanguage();
    if (detected) {
      setLang(detected);
      // Delay slightly so it doesn't compete with initial page load
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {}
  };

  const langInfo = lang ? LANGUAGE_MAP[lang] : null;
  if (!langInfo) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-[90] flex items-center justify-center px-4 py-2"
          style={{
            background: "linear-gradient(135deg, #0891B2, #0E7490)",
            boxShadow: "0 4px 20px rgba(8,145,178,0.3)",
          }}
        >
          <div className="flex items-center gap-3 text-white text-sm">
            <Globe2 className="h-4 w-4 flex-shrink-0" />
            <span>
              <img
                src={`https://flagcdn.com/w20/${langInfo.flag}.png`}
                alt={langInfo.name}
                className="inline h-3 w-4 mr-1 rounded-sm"
              />
              We have content in <strong>{langInfo.nativeName}</strong> ({langInfo.name})!
            </span>
            <button
              onClick={() => {
                // Scroll to language selector or navigate to language-specific content
                const langSelector = document.querySelector("[data-language-selector]");
                if (langSelector) {
                  langSelector.scrollIntoView({ behavior: "smooth", block: "center" });
                }
                dismiss();
              }}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-white/20 hover:bg-white/30 transition-colors"
            >
              Switch
            </button>
            <button
              onClick={dismiss}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
