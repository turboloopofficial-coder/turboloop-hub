"use client";

import { useState, useRef } from "react";
import { Play, Globe } from "lucide-react";

const R2_BASE = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/videos";

// Language registry — add a `video` URL once a dubbed version is ready on R2.
// If `video` is null the player falls back to the English source.
const LANGUAGES: {
  code: string;
  label: string;
  nativeLabel: string;
  video: string | null;
  thumb: string | null;
}[] = [
  { code: "en", label: "English",    nativeLabel: "English",     video: `${R2_BASE}/turboloop-explainer-en.mp4`,  thumb: `${R2_BASE}/turboloop-explainer-en-thumb.jpg`  },
  { code: "es", label: "Spanish",    nativeLabel: "Español",     video: null, thumb: null },
  { code: "fr", label: "French",     nativeLabel: "Français",    video: null, thumb: null },
  { code: "de", label: "German",     nativeLabel: "Deutsch",     video: null, thumb: null },
  { code: "it", label: "Italian",    nativeLabel: "Italiano",    video: null, thumb: null },
  { code: "pt", label: "Portuguese", nativeLabel: "Português",   video: null, thumb: null },
  { code: "ru", label: "Russian",    nativeLabel: "Русский",     video: null, thumb: null },
  { code: "zh", label: "Chinese",    nativeLabel: "中文",         video: null, thumb: null },
  { code: "ja", label: "Japanese",   nativeLabel: "日本語",       video: null, thumb: null },
  { code: "ko", label: "Korean",     nativeLabel: "한국어",       video: null, thumb: null },
  { code: "ar", label: "Arabic",     nativeLabel: "العربية",     video: null, thumb: null },
  { code: "hi", label: "Hindi",      nativeLabel: "हिन्दी",      video: null, thumb: null },
  { code: "tr", label: "Turkish",    nativeLabel: "Türkçe",      video: null, thumb: null },
  { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt",  video: null, thumb: null },
  { code: "id", label: "Indonesian", nativeLabel: "Bahasa Indonesia", video: null, thumb: null },
  { code: "nl", label: "Dutch",      nativeLabel: "Nederlands",  video: null, thumb: null },
  { code: "pl", label: "Polish",     nativeLabel: "Polski",      video: null, thumb: null },
  { code: "sv", label: "Swedish",    nativeLabel: "Svenska",     video: null, thumb: null },
  { code: "da", label: "Danish",     nativeLabel: "Dansk",       video: null, thumb: null },
  { code: "fi", label: "Finnish",    nativeLabel: "Suomi",       video: null, thumb: null },
  { code: "no", label: "Norwegian",  nativeLabel: "Norsk",       video: null, thumb: null },
  { code: "el", label: "Greek",      nativeLabel: "Ελληνικά",    video: null, thumb: null },
  { code: "cs", label: "Czech",      nativeLabel: "Čeština",     video: null, thumb: null },
  { code: "hu", label: "Hungarian",  nativeLabel: "Magyar",      video: null, thumb: null },
  { code: "ro", label: "Romanian",   nativeLabel: "Română",      video: null, thumb: null },
  { code: "sk", label: "Slovak",     nativeLabel: "Slovenčina",  video: null, thumb: null },
  { code: "uk", label: "Ukrainian",  nativeLabel: "Українська",  video: null, thumb: null },
  { code: "bg", label: "Bulgarian",  nativeLabel: "Български",   video: null, thumb: null },
  { code: "hr", label: "Croatian",   nativeLabel: "Hrvatski",    video: null, thumb: null },
  { code: "sr", label: "Serbian",    nativeLabel: "Српски",      video: null, thumb: null },
  { code: "sl", label: "Slovenian",  nativeLabel: "Slovenščina", video: null, thumb: null },
  { code: "lt", label: "Lithuanian", nativeLabel: "Lietuvių",    video: null, thumb: null },
  { code: "lv", label: "Latvian",    nativeLabel: "Latviešu",    video: null, thumb: null },
  { code: "et", label: "Estonian",   nativeLabel: "Eesti",       video: null, thumb: null },
  { code: "ms", label: "Malay",      nativeLabel: "Bahasa Melayu", video: null, thumb: null },
  { code: "tl", label: "Filipino",   nativeLabel: "Filipino",    video: null, thumb: null },
  { code: "ta", label: "Tamil",      nativeLabel: "தமிழ்",       video: null, thumb: null },
  { code: "bn", label: "Bengali",    nativeLabel: "বাংলা",       video: null, thumb: null },
  { code: "ur", label: "Urdu",       nativeLabel: "اردو",        video: null, thumb: null },
  { code: "fa", label: "Persian",    nativeLabel: "فارسی",       video: null, thumb: null },
  { code: "he", label: "Hebrew",     nativeLabel: "עברית",       video: null, thumb: null },
  { code: "sw", label: "Swahili",    nativeLabel: "Kiswahili",   video: null, thumb: null },
  { code: "am", label: "Amharic",    nativeLabel: "አማርኛ",        video: null, thumb: null },
  { code: "yo", label: "Yoruba",     nativeLabel: "Yorùbá",      video: null, thumb: null },
  { code: "zu", label: "Zulu",       nativeLabel: "isiZulu",     video: null, thumb: null },
  { code: "ig", label: "Igbo",       nativeLabel: "Igbo",        video: null, thumb: null },
  { code: "ha", label: "Hausa",      nativeLabel: "Hausa",       video: null, thumb: null },
  { code: "sn", label: "Shona",      nativeLabel: "chiShona",    video: null, thumb: null },
  { code: "st", label: "Sesotho",    nativeLabel: "Sesotho",     video: null, thumb: null },
  { code: "xh", label: "Xhosa",      nativeLabel: "isiXhosa",    video: null, thumb: null },
];

const ENGLISH = LANGUAGES[0];

export function VideoExplainerSection() {
  const [started, setStarted] = useState(false);
  const [selectedLang, setSelectedLang] = useState(ENGLISH);
  const [showPicker, setShowPicker] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeVideo = selectedLang.video ?? ENGLISH.video!;
  const activeThumb = selectedLang.thumb ?? ENGLISH.thumb!;
  const isAvailable = (lang: typeof LANGUAGES[0]) => lang.video !== null;

  const handleLangSelect = (lang: typeof LANGUAGES[0]) => {
    setSelectedLang(lang);
    setShowPicker(false);
    setStarted(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
  };

  const handlePlay = () => {
    if (!videoRef.current) return;
    videoRef.current.play();
    videoRef.current.muted = false;
    setStarted(true);
  };

  const availableCount = LANGUAGES.filter(isAvailable).length;

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial from-cyan-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
            Deep Dive
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            See How TurboLoop Works
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A 20-minute breakdown covering security audits, smart contract architecture,
            and how your USDT earns fixed returns on BNB Smart Chain.
          </p>
        </div>

        {/* Video Player */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/10 bg-black/50 backdrop-blur-sm">
          {/* Aspect ratio container */}
          <div className="relative aspect-video">
            <video
              ref={videoRef}
              key={activeVideo}
              className="absolute inset-0 w-full h-full object-cover"
              poster={activeThumb}
              preload="none"
              muted
              playsInline
              controls={started}
              controlsList="nodownload"
            >
              <source src={activeVideo} type="video/mp4" />
            </video>

            {/* Play overlay */}
            {!started && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30 transition-all hover:bg-black/20"
                onClick={handlePlay}
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-cyan-500/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-transform hover:scale-110">
                  <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="white" />
                </div>
              </div>
            )}

            {/* Language badge (top-right corner of video) */}
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => { setShowPicker((v) => !v); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/20 text-xs text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedLang.nativeLabel}</span>
                {!isAvailable(selectedLang) && (
                  <span className="ml-1 text-gray-500 text-[10px]">(EN)</span>
                )}
              </button>

              {/* Language picker dropdown */}
              {showPicker && (
                <div className="absolute top-full right-0 mt-2 w-56 max-h-72 overflow-y-auto rounded-xl bg-gray-900/95 border border-white/10 shadow-2xl backdrop-blur-sm z-20">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                      {availableCount} of {LANGUAGES.length} languages available
                    </p>
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangSelect(lang)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-white/5 ${
                        selectedLang.code === lang.code ? "text-cyan-400 bg-cyan-500/10" : "text-gray-300"
                      }`}
                    >
                      <span>{lang.nativeLabel}</span>
                      <span className="text-xs text-gray-500">{lang.label}</span>
                      {!isAvailable(lang) && (
                        <span className="ml-auto text-[10px] text-gray-600 italic">soon</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom info bar */}
          <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-400">20 min • Full HD</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">SolidityScan 99.99</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">HazeCrypto Audited</span>
            </div>
          </div>
        </div>

        {/* Language availability note */}
        <p className="text-center text-xs text-gray-600 mt-4">
          Dubbed versions in {LANGUAGES.length - 1} languages coming soon via AI voice localisation.
        </p>
      </div>
    </section>
  );
}
