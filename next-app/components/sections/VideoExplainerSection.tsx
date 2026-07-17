"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { Play, Globe, ChevronDown, Download, Youtube } from "lucide-react";
import Image from "next/image";

const R2_BASE = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/videos";

// Language registry — add a `video` URL once a dubbed version is ready on R2.
// If `video` is null the player falls back to the English source.
// `youtubeUrl` links to the same-language sped-up version on YouTube.
const LANGUAGES: {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
  video: string | null;
  thumb: string | null;
  youtubeUrl: string | null;
}[] = [
  { code: "en", label: "English",    nativeLabel: "English",     flag: "🇬🇧", video: `${R2_BASE}/turboloop-explainer-en.mp4`,  thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`,  youtubeUrl: "https://youtu.be/LFViES_Qbzg" },
  { code: "hi", label: "Hindi",      nativeLabel: "हिन्दी",      flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-hi.mp4`,  thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`,  youtubeUrl: "https://youtu.be/X0p28uy2yeI" },
  { code: "th", label: "Thai",       nativeLabel: "ภาษาไทย",     flag: "🇹🇭", video: `${R2_BASE}/turboloop-explainer-th.mp4`,  thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`,  youtubeUrl: "https://youtu.be/IdlosvrEgTo" },
  { code: "es", label: "Spanish",    nativeLabel: "Español",     flag: "🇪🇸", video: `${R2_BASE}/turboloop-explainer-es.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/GF2FTTuMy5U" },
  { code: "fr", label: "French",     nativeLabel: "Français",    flag: "🇫🇷", video: `${R2_BASE}/turboloop-explainer-fr.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/FVhTsrXVcmA" },
  { code: "de", label: "German",     nativeLabel: "Deutsch",     flag: "🇩🇪", video: `${R2_BASE}/turboloop-explainer-de.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/H4LtRG4uJcU" },
  { code: "it", label: "Italian",    nativeLabel: "Italiano",    flag: "🇮🇹", video: `${R2_BASE}/turboloop-explainer-it.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/664q4mO1USE" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português",   flag: "🇧🇷", video: `${R2_BASE}/turboloop-explainer-pt.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/cWL9pFtIdOY" },
  { code: "ru", label: "Russian",    nativeLabel: "Русский",     flag: "🇷🇺", video: `${R2_BASE}/videos/turboloop-explainer-ru.mp4`, thumb: null, youtubeUrl: null },
  { code: "zh", label: "Chinese",    nativeLabel: "中文",         flag: "🇨🇳", video: `${R2_BASE}/turboloop-explainer-zh.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "ja", label: "Japanese",   nativeLabel: "日本語",       flag: "🇯🇵", video: `${R2_BASE}/turboloop-explainer-ja.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "ko", label: "Korean",     nativeLabel: "한국어",       flag: "🇰🇷", video: `${R2_BASE}/videos/turboloop-explainer-ko.mp4`, thumb: null, youtubeUrl: null },
  { code: "ar", label: "Arabic",     nativeLabel: "العربية",     flag: "🇸🇦", video: `${R2_BASE}/turboloop-explainer-ar.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "tr", label: "Turkish",    nativeLabel: "Türkçe",      flag: "🇹🇷", video: `${R2_BASE}/turboloop-explainer-tr.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/RaI8UUK-REg" },
  { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt",  flag: "🇻🇳", video: `${R2_BASE}/turboloop-explainer-vi.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "id", label: "Indonesian", nativeLabel: "Bahasa Indonesia", flag: "🇮🇩", video: `${R2_BASE}/turboloop-explainer-id.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "nl", label: "Dutch",      nativeLabel: "Nederlands",  flag: "🇳🇱", video: `${R2_BASE}/turboloop-explainer-nl.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/xRkjWfqbMk4" },
  { code: "pl", label: "Polish",     nativeLabel: "Polski",      flag: "🇵🇱", video: `${R2_BASE}/turboloop-explainer-pl.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/ISjTgms4k5Q" },
  { code: "sv", label: "Swedish",    nativeLabel: "Svenska",     flag: "🇸🇪", video: `${R2_BASE}/videos/turboloop-explainer-sv.mp4`, thumb: null, youtubeUrl: null },
  { code: "da", label: "Danish",     nativeLabel: "Dansk",       flag: "🇩🇰", video: `${R2_BASE}/videos/turboloop-explainer-da.mp4`, thumb: null, youtubeUrl: null },
  { code: "fi", label: "Finnish",    nativeLabel: "Suomi",       flag: "🇫🇮", video: `${R2_BASE}/videos/turboloop-explainer-fi.mp4`, thumb: null, youtubeUrl: null },
  { code: "no", label: "Norwegian",  nativeLabel: "Norsk",       flag: "🇳🇴", video: `${R2_BASE}/videos/turboloop-explainer-no.mp4`, thumb: null, youtubeUrl: null },
  { code: "el", label: "Greek",      nativeLabel: "Ελληνικά",    flag: "🇬🇷", video: `${R2_BASE}/turboloop-explainer-el.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/YEU6w6KGLHk" },
  { code: "cs", label: "Czech",      nativeLabel: "Čeština",     flag: "🇨🇿", video: `${R2_BASE}/turboloop-explainer-cs.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/c-x4cz0xtNY" },
  { code: "hu", label: "Hungarian",  nativeLabel: "Magyar",      flag: "🇭🇺", video: `${R2_BASE}/turboloop-explainer-hu.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/BYsAnRvdFO8" },
  { code: "ro", label: "Romanian",   nativeLabel: "Română",      flag: "🇷🇴", video: `${R2_BASE}/turboloop-explainer-ro.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/s9xcxGsCq3k" },
  { code: "sk", label: "Slovak",     nativeLabel: "Slovenčina",  flag: "🇸🇰", video: `${R2_BASE}/videos/turboloop-explainer-sk.mp4`, thumb: null, youtubeUrl: null },
  { code: "uk", label: "Ukrainian",  nativeLabel: "Українська",  flag: "🇺🇦", video: `${R2_BASE}/turboloop-explainer-uk.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/IK7ME7HlCF8" },
  { code: "bg", label: "Bulgarian",  nativeLabel: "Български",   flag: "🇧🇬", video: `${R2_BASE}/videos/turboloop-explainer-bg.mp4`, thumb: null, youtubeUrl: null },
  { code: "hr", label: "Croatian",   nativeLabel: "Hrvatski",    flag: "🇭🇷", video: `${R2_BASE}/videos/turboloop-explainer-hr.mp4`, thumb: null, youtubeUrl: null },
  { code: "sr", label: "Serbian",    nativeLabel: "Српски",      flag: "🇷🇸", video: `${R2_BASE}/videos/turboloop-explainer-sr.mp4`, thumb: null, youtubeUrl: null },
  { code: "sl", label: "Slovenian",  nativeLabel: "Slovenščina", flag: "🇸🇮", video: `${R2_BASE}/videos/turboloop-explainer-sl.mp4`, thumb: null, youtubeUrl: null },
  { code: "lt", label: "Lithuanian", nativeLabel: "Lietuvių",    flag: "🇱🇹", video: `${R2_BASE}/videos/turboloop-explainer-lt.mp4`, thumb: null, youtubeUrl: null },
  { code: "lv", label: "Latvian",    nativeLabel: "Latviešu",    flag: "🇱🇻", video: `${R2_BASE}/videos/turboloop-explainer-lv.mp4`, thumb: null, youtubeUrl: null },
  { code: "et", label: "Estonian",   nativeLabel: "Eesti",       flag: "🇪🇪", video: `${R2_BASE}/videos/turboloop-explainer-et.mp4`, thumb: null, youtubeUrl: null },
  { code: "ms", label: "Malay",      nativeLabel: "Bahasa Melayu", flag: "🇲🇾", video: `${R2_BASE}/turboloop-explainer-ms.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "tl", label: "Filipino",   nativeLabel: "Filipino",    flag: "🇵🇭", video: `${R2_BASE}/turboloop-explainer-tl.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "ta", label: "Tamil",      nativeLabel: "தமிழ்",       flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-ta.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: "https://youtu.be/jk-56qXOSDc" },
  { code: "bn", label: "Bengali",    nativeLabel: "বাংলা",       flag: "🇧🇩", video: `${R2_BASE}/turboloop-explainer-bn.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "te", label: "Telugu",     nativeLabel: "తెలుగు",      flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-te.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "mr", label: "Marathi",    nativeLabel: "मराठी",       flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-mr.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "gu", label: "Gujarati",  nativeLabel: "ગુજરાતી",    flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-gu.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "kn", label: "Kannada",  nativeLabel: "ಕನ್ನಡ",      flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-kn.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം",    flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-ml.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "ur", label: "Urdu",       nativeLabel: "اردو",        flag: "🇵🇰", video: `${R2_BASE}/turboloop-explainer-ur.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "fa", label: "Persian",    nativeLabel: "فارسی",       flag: "🇮🇷", video: `${R2_BASE}/turboloop-explainer-fa.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "he", label: "Hebrew",     nativeLabel: "עברית",       flag: "🇮🇱", video: `${R2_BASE}/turboloop-explainer-he.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "sw", label: "Swahili",    nativeLabel: "Kiswahili",   flag: "🇰🇪", video: `${R2_BASE}/turboloop-explainer-sw.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "am", label: "Amharic",    nativeLabel: "አማርኛ",        flag: "🇪🇹", video: `${R2_BASE}/videos/turboloop-explainer-am.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "yo", label: "Yoruba",     nativeLabel: "Yorùbá",      flag: "🇳🇬", video: null, thumb: null, youtubeUrl: null },
  { code: "zu", label: "Zulu",       nativeLabel: "isiZulu",     flag: "🇿🇦", video: `${R2_BASE}/videos/turboloop-explainer-zu.mp4`, thumb: null, youtubeUrl: null },
  { code: "ig", label: "Igbo",       nativeLabel: "Igbo",        flag: "🇳🇬", video: null, thumb: null, youtubeUrl: null },
  { code: "ha", label: "Hausa",      nativeLabel: "Hausa",       flag: "🇳🇬", video: null, thumb: null, youtubeUrl: null },
  { code: "sn", label: "Shona",      nativeLabel: "chiShona",    flag: "🇿🇼", video: null, thumb: null, youtubeUrl: null },
  { code: "st", label: "Sesotho",    nativeLabel: "Sesotho",     flag: "🇿🇦", video: null, thumb: null, youtubeUrl: null },
  { code: "xh", label: "Xhosa",      nativeLabel: "isiXhosa",    flag: "🇿🇦", video: null, thumb: null, youtubeUrl: null },
  { code: "az", label: "Azerbaijani", nativeLabel: "Azərbaycan",  flag: "🇦🇿", video: `${R2_BASE}/turboloop-explainer-az.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "kk", label: "Kazakh",      nativeLabel: "Қазақша",     flag: "🇰🇿", video: `${R2_BASE}/turboloop-explainer-kk.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "uz", label: "Uzbek",       nativeLabel: "O'zbek",      flag: "🇺🇿", video: `${R2_BASE}/turboloop-explainer-uz.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "my", label: "Burmese",     nativeLabel: "မြန်မာဘာသာ",  flag: "🇲🇲", video: `${R2_BASE}/turboloop-explainer-my.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "km", label: "Khmer",       nativeLabel: "ភាសាខ្មែរ",   flag: "🇰🇭", video: `${R2_BASE}/turboloop-explainer-km.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "si", label: "Sinhala",     nativeLabel: "සිංහල",       flag: "🇱🇰", video: `${R2_BASE}/turboloop-explainer-si.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "ne", label: "Nepali",      nativeLabel: "नेपाली",      flag: "🇳🇵", video: `${R2_BASE}/turboloop-explainer-ne.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "pa", label: "Punjabi",     nativeLabel: "ਪੰਜਾਬੀ",      flag: "🇮🇳", video: `${R2_BASE}/turboloop-explainer-pa.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
  { code: "lo", label: "Lao",         nativeLabel: "ລາວ",         flag: "🇱🇦", video: `${R2_BASE}/turboloop-explainer-lo.mp4`, thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`, youtubeUrl: null },
];

const ENGLISH = LANGUAGES[0];

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
const LOCALE_TO_VIDEO_CODE: Record<string, string | null> = {
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
  // Special cases
  pcm: null, // Nigerian Pidgin — no video yet
};

/**
 * Resolve the initial language entry from a next-intl locale string.
 * Returns the matching LANGUAGES entry if it has a video, otherwise ENGLISH.
 */
function resolveInitialLang(locale?: string): typeof LANGUAGES[0] {
  if (!locale || locale === "en") return ENGLISH;
  const videoCode = LOCALE_TO_VIDEO_CODE[locale] ?? null;
  if (!videoCode) return ENGLISH;
  const match = LANGUAGES.find(l => l.code === videoCode && l.video !== null);
  return match ?? ENGLISH;
}

export function VideoExplainerSection({ defaultLocale }: { defaultLocale?: string } = {}) {
  const [started, setStarted] = useState(false);
  const [selectedLang, setSelectedLang] = useState(() => resolveInitialLang(defaultLocale));
  const [showPicker, setShowPicker] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeVideo = selectedLang.video ?? ENGLISH.video!;
  const activeThumb = selectedLang.thumb ?? ENGLISH.thumb!;
  const activeYoutubeUrl = selectedLang.youtubeUrl ?? ENGLISH.youtubeUrl;
  const isAvailable = (lang: typeof LANGUAGES[0]) => lang.video !== null;
  const availableCount = LANGUAGES.filter(isAvailable).length;

  const handleLangSelect = (lang: typeof LANGUAGES[0]) => {
    if (!isAvailable(lang)) return; // ignore clicks on unavailable languages
    setSelectedLang(lang);
    setShowPicker(false);
    setStarted(false);
  };

  const handlePlay = useCallback(async () => {
    const vid = videoRef.current;
    if (!vid) return;
    try {
      // Ensure the current source is loaded before playing
      vid.load();
      // Start muted (required by autoplay policy), then unmute once playing
      vid.muted = true;
      await vid.play();
      vid.muted = false;
      setStarted(true);
    } catch {
      // Fallback: show native controls so user can interact directly
      setStarted(true);
    }
  }, [activeVideo]);

  return (
    <section className="relative py-16 md:py-24 bg-[#080c14] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Heading ─────────────────────────────────────────────── */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
            Deep Dive
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
            See How TurboLoop Works
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            A 20-minute breakdown covering security audits, smart contract architecture,
            and how your USDT earns fixed returns on BNB Smart Chain.
          </p>
        </div>

        {/* ── Video Card ──────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/60 bg-[#0d1220]">

          {/* Video area — 16:9 aspect ratio wrapper */}
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>

            {/* Thumbnail shown before play */}
            {!started && (
              <div className="absolute inset-0 w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeThumb}
                  alt={`${selectedLang.label} explainer thumbnail`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Native video element — always in DOM so src loads */}
            <video
              ref={videoRef}
              key={activeVideo}
              src={activeVideo}
              className={`absolute inset-0 w-full h-full object-cover bg-black ${started ? "opacity-100" : "opacity-0"}`}
              preload="metadata"
              playsInline
              controls={started}
              controlsList="nodownload"
              onEnded={() => setStarted(false)}
            />

            {/* Play overlay — shown when not started */}
            {!started && (
              <button
                onClick={handlePlay}
                aria-label="Play video"
                className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors group"
              >
                <span className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-cyan-500 shadow-xl shadow-cyan-500/40 group-hover:scale-105 transition-transform">
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white ml-1" fill="white" />
                </span>
              </button>
            )}

            {/* Language selector — top right of video */}
            <div className="absolute top-3 right-3 z-20">
              <button
                onClick={() => setShowPicker((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/70 border border-white/15 text-xs text-white backdrop-blur-md hover:bg-black/90 transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="max-w-[80px] truncate">{selectedLang.flag} {selectedLang.nativeLabel}</span>
                <ChevronDown className={`w-3 h-3 text-gray-400 shrink-0 transition-transform ${showPicker ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
              {showPicker && (
                <div className="absolute top-full right-0 mt-2 w-60 max-h-72 overflow-y-auto rounded-xl bg-[#0d1220] border border-white/10 shadow-2xl z-30">
                  <div className="sticky top-0 px-3 py-2 bg-[#0d1220] border-b border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                      {availableCount} of {LANGUAGES.length} available · more coming soon
                    </p>
                  </div>
                  {LANGUAGES.map((lang) => {
                    const available = isAvailable(lang);
                    const active = selectedLang.code === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleLangSelect(lang)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left
                          ${active ? "bg-cyan-500/10 text-cyan-400" : "text-gray-300 hover:bg-white/5"}
                          ${!available ? "opacity-50 cursor-default" : ""}
                        `}
                        disabled={!available}
                      >
                        <span className="text-base leading-none">{lang.flag}</span>
                        <span className="flex-1 truncate">{lang.nativeLabel}</span>
                        {!available && (
                          <span className="text-[10px] text-gray-600 italic shrink-0">soon</span>
                        )}
                        {active && available && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Bottom info bar ──────────────────────────────────── */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white/[0.03] border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
              <span className="text-sm text-gray-400">
                {selectedLang.label} · 20 min · Full HD
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08]">SolidityScan 99.99</span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08]">HazeCrypto Audited</span>
              {activeYoutubeUrl && (
                <a
                  href={activeYoutubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                  title={`Watch ${selectedLang.label} version on YouTube`}
                >
                  <Youtube className="w-3 h-3" />
                  <span>YouTube</span>
                </a>
              )}
              <a
                href={activeVideo}
                download={`TurboLoop-Explainer-${selectedLang.label}.mp4`}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                title={`Download ${selectedLang.label} version`}
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>

        {/* ── Footnote ────────────────────────────────────────────── */}
        <p className="text-center text-xs text-gray-600 mt-4">
          AI-dubbed versions in {LANGUAGES.length - 1} languages — rolling out now.
        </p>
      </div>
    </section>
  );
}
