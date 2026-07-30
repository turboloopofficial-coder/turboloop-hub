"use client";

// LocaleDetector — non-intrusive banner that suggests the user's native language.
//
// Logic:
//   1. Reads navigator.language (e.g. "th", "ko-KR", "hi-IN")
//   2. Checks if the current page locale matches
//   3. If not, shows a small bottom banner: "This page is available in ภาษาไทย"
//   4. Dismisses permanently (localStorage) after user closes or clicks
//
// Mobile-first: fixed bottom bar, above MobileBottomCTA z-index.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Globe, X } from "lucide-react";

const STORAGE_KEY = "turboloop_locale_dismissed";

// Map of supported locale codes to display names and paths
const LOCALE_MAP: Record<string, { name: string; nativeName: string; path: string }> = {
  hi: { name: "Hindi", nativeName: "हिन्दी", path: "/hi" },
  th: { name: "Thai", nativeName: "ภาษาไทย", path: "/th" },
  ko: { name: "Korean", nativeName: "한국어", path: "/ko" },
  lo: { name: "Lao", nativeName: "ພາສາລາວ", path: "/lo" },
  de: { name: "German", nativeName: "Deutsch", path: "/de" },
  fr: { name: "French", nativeName: "Français", path: "/fr" },
  es: { name: "Spanish", nativeName: "Español", path: "/es" },
  pt: { name: "Portuguese", nativeName: "Português", path: "/pt" },
  it: { name: "Italian", nativeName: "Italiano", path: "/it" },
  id: { name: "Indonesian", nativeName: "Bahasa Indonesia", path: "/id" },
  ar: { name: "Arabic", nativeName: "العربية", path: "/ar" },
  zh: { name: "Chinese", nativeName: "中文", path: "/zh" },
  bn: { name: "Bengali", nativeName: "বাংলা", path: "/bn" },
  ta: { name: "Tamil", nativeName: "தமிழ்", path: "/ta" },
  tr: { name: "Turkish", nativeName: "Türkçe", path: "/tr" },
  ur: { name: "Urdu", nativeName: "اردو", path: "/ur" },
  ja: { name: "Japanese", nativeName: "日本語", path: "/ja" },
  vi: { name: "Vietnamese", nativeName: "Tiếng Việt", path: "/vi" },
  ru: { name: "Russian", nativeName: "Русский", path: "/ru" },
  sw: { name: "Swahili", nativeName: "Kiswahili", path: "/sw" },
  ha: { name: "Hausa", nativeName: "Hausa", path: "/ha" },
  yo: { name: "Yoruba", nativeName: "Yorùbá", path: "/yo" },
  ne: { name: "Nepali", nativeName: "नेपाली", path: "/ne" },
  ms: { name: "Malay", nativeName: "Bahasa Melayu", path: "/ms" },
  tl: { name: "Tagalog", nativeName: "Tagalog", path: "/tl" },
};

export function LocaleDetector() {
  const pathname = usePathname();
  const [suggestion, setSuggestion] = useState<{ nativeName: string; path: string } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {}

    // Detect browser language
    const browserLang = navigator.language?.split("-")[0]?.toLowerCase();
    if (!browserLang || browserLang === "en") return;

    // Check if we have this locale
    const locale = LOCALE_MAP[browserLang];
    if (!locale) return;

    // Check if user is already on a localized page
    if (pathname?.startsWith(locale.path)) return;

    // Show suggestion after a short delay
    const timer = setTimeout(() => {
      setSuggestion(locale);
      setVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  const handleSwitch = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    // Navigate to the localized version of current page
    const localePath = suggestion?.path || "/";
    window.location.href = localePath + (pathname === "/" ? "" : pathname);
  };

  if (!visible || !suggestion) return null;

  return (
    <div
      className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[90] animate-in slide-in-from-bottom-4"
      style={{ animation: "tl-locale-slide 300ms ease-out" }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border"
        style={{
          background: "var(--c-surface, #ffffff)",
          borderColor: "var(--c-border, rgba(15,23,42,0.08))",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        <Globe className="w-5 h-5 text-[var(--c-brand-cyan)] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium" style={{ color: "var(--c-text-muted, #64748B)" }}>
            This page is available in
          </p>
          <button
            onClick={handleSwitch}
            className="text-sm font-bold hover:underline"
            style={{ color: "var(--c-brand-cyan)" }}
          >
            {suggestion.nativeName} →
          </button>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss language suggestion"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(15,23,42,0.06)] transition flex-shrink-0"
        >
          <X className="w-4 h-4" style={{ color: "var(--c-text-muted, #64748B)" }} />
        </button>
      </div>
      <style>{`
        @keyframes tl-locale-slide {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
