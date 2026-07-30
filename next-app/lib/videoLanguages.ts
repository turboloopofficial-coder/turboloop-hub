// ─────────────────────────────────────────────────────────────────────────────
// TurboLoop Video Language Registry
//
// ⚠️  THIS FILE IS THE SINGLE SOURCE OF TRUTH for all per-language video data.
//
// ✅  TO ADD A NEW DUBBED VIDEO (when Rask finishes a language):
//     Find the language entry and update its episodes.ep{n} object:
//       ep2: { video: "https://...r2.dev/videos/turboloop-ep2-{code}.mp4",
//              youtubeUrl: "https://youtu.be/...",
//              thumb: "https://...r2.dev/thumbnails/ep2/ep2_thumb_{code}.jpg" }
//     The auto-poller and workers do this automatically.
//
// ✅  TO ADD A NEW EPISODE (Ep5, Ep6, ...):
//     1. Add the episode config to episodes.config.ts (one object, ~15 lines)
//     2. Add the new episode key to each language entry below (copy nullEp())
//     3. Set the English entry's ep{n} with the actual video/youtube/thumb
//     The auto-poller, workers, website, and podcast page update automatically.
//
// ✅  TO ADD A NEW LANGUAGE:
//     Add a new entry to the LANGUAGES array. Copy any existing entry and
//     replace the values. Set all episode entries to nullEp() except ep1.
// ─────────────────────────────────────────────────────────────────────────────

export const R2_BASE = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/videos";
export const R2_PUB  = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

export interface EpisodeVideoData {
  /** R2 video URL or null if not yet processed */
  video: string | null;
  /** YouTube URL or null */
  youtubeUrl: string | null;
  /** Thumbnail URL or null */
  thumb: string | null;
}

export interface VideoLanguage {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
  /**
   * Per-episode video data, keyed by episode ID (ep1, ep2, ep3, ep4, ...).
   * Adding a new episode = add a new key here. No other interface changes needed.
   */
  episodes: {
    ep1: EpisodeVideoData;
    ep2: EpisodeVideoData;
    ep3: EpisodeVideoData;
    ep4: EpisodeVideoData;
    ep5: EpisodeVideoData;
    [key: string]: EpisodeVideoData; // allows ep6, ep7, etc.
  };
}

/** Null episode entry — use for episodes not yet available in a language */
const N: EpisodeVideoData = { video: null, youtubeUrl: null, thumb: null };

/** Helper to build a thumbnail URL */
const T = (folder: string, code: string) =>
  `${R2_PUB}/thumbnails/${folder}/ep${folder.replace(/\D/g, '')}_thumb_${code}.jpg`;

export const LANGUAGES: VideoLanguage[] = [
  { code: "en", label: "English",     nativeLabel: "English",          flag: "🇬🇧", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-en.mp4`,  youtubeUrl: "https://youtu.be/LFViES_Qbzg",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: { video: `${R2_BASE}/turboloop-ep2-en.mp4`,        youtubeUrl: "https://youtu.be/cKm_XQpK4NI",  thumb: `${R2_PUB}/thumbnails/ep2/ep2_thumb_en.jpg` },
    ep3: { video: `${R2_BASE}/turboloop-ep3-en.mp4`,        youtubeUrl: "https://youtu.be/08dLfBMf2JM",  thumb: `${R2_PUB}/thumbnails/ep3/ep3_thumb_en.jpg` },
    ep4: { video: `${R2_BASE}/turboloop-ep4-en.mp4`,        youtubeUrl: "https://youtu.be/yL3fjbJkaEM",  thumb: `${R2_PUB}/thumbnails/ep4/ep4_thumb_en.jpg` },
    ep5: { video: `${R2_BASE}/turboloop-ep5-en.mp4`,        youtubeUrl: "https://youtu.be/DrgrLpMqUDM",  thumb: `${R2_PUB}/thumbnails/ep5/ep5_thumb_en.jpg` },
  }},
  { code: "hi", label: "Hindi",       nativeLabel: "हिन्दी",           flag: "🇮🇳", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-hi.mp4`,  youtubeUrl: "https://youtu.be/X0p28uy2yeI",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: { video: `${R2_BASE}/turboloop-ep2-hi.mp4`,        youtubeUrl: "https://youtu.be/JPhXsw3mLS4",  thumb: T("ep2","hi") },
    ep3: N, ep4: N, ep5: N,
  }},
  { code: "th", label: "Thai",        nativeLabel: "ภาษาไทย",          flag: "🇹🇭", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-th.mp4`,  youtubeUrl: "https://youtu.be/IdlosvrEgTo",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: { video: `${R2_BASE}/turboloop-ep2-th.mp4`,        youtubeUrl: "https://youtu.be/LisPrhmrG2g",  thumb: T("ep2","th") },
    ep3: N, ep4: N, ep5: N,
  }},
  { code: "es", label: "Spanish",     nativeLabel: "Español",          flag: "🇪🇸", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-es.mp4`,  youtubeUrl: "https://youtu.be/GF2FTTuMy5U",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: { video: `${R2_BASE}/turboloop-ep2-es.mp4`,        youtubeUrl: "https://youtu.be/FBq7GB9AaeI",  thumb: T("ep2","es") },
    ep3: { video: `https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/videos/turboloop-ep3-es.mp4`, youtubeUrl: "https://youtu.be/ghSH9Nn07v0", thumb: `${R2_PUB}/videos/turboloop-ep3-en-thumb.jpg` }, ep4: N, ep5: N,
  }},
  { code: "fr", label: "French",      nativeLabel: "Français",         flag: "🇫🇷", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-fr.mp4`,  youtubeUrl: "https://youtu.be/FVhTsrXVcmA",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: { video: `${R2_BASE}/turboloop-ep2-fr.mp4`,        youtubeUrl: "https://youtu.be/X6VJ3WvDtjo",  thumb: T("ep2","fr") },
    ep3: { video: `${R2_BASE}/turboloop-ep3-fr.mp4`,        youtubeUrl: "https://youtu.be/9GZAqb3bHYA",  thumb: T("ep3","fr") },
    ep4: N, ep5: N,
  }},
  { code: "de", label: "German",      nativeLabel: "Deutsch",          flag: "🇩🇪", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-de.mp4`,  youtubeUrl: "https://youtu.be/H4LtRG4uJcU",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: { video: `${R2_BASE}/turboloop-ep2-de.mp4`,        youtubeUrl: "https://youtu.be/sEP2ypeMmUA",  thumb: T("ep2","de") },
    ep3: { video: `${R2_BASE}/turboloop-ep3-de.mp4`,        youtubeUrl: "https://youtu.be/jcE32T4Wpwc",  thumb: T("ep3","de") },
    ep4: N, ep5: N,
  }},
  { code: "it", label: "Italian",     nativeLabel: "Italiano",         flag: "🇮🇹", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-it.mp4`,  youtubeUrl: "https://youtu.be/664q4mO1USE",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: { video: `${R2_BASE}/turboloop-ep2-it.mp4`,        youtubeUrl: "https://youtu.be/W7t8j4H0QRE",  thumb: T("ep2","it") },
    ep3: { video: `${R2_BASE}/turboloop-ep3-it.mp4`,        youtubeUrl: "https://youtu.be/YkEVQepTqpo",  thumb: T("ep3","it") },
    ep4: N, ep5: N,
  }},
  { code: "pt", label: "Portuguese",  nativeLabel: "Português",        flag: "🇧🇷", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-pt.mp4`,  youtubeUrl: "https://youtu.be/cWL9pFtIdOY",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: { video: `${R2_BASE}/turboloop-ep2-pt.mp4`,        youtubeUrl: "https://youtu.be/UDRuK2VNpUo",  thumb: T("ep2","pt") },
    ep3: { video: `${R2_BASE}/turboloop-ep3-pt.mp4`,        youtubeUrl: "https://youtu.be/LWhza91Ozj4",  thumb: T("ep3","pt") },
    ep4: N, ep5: N,
  }},
  { code: "ru", label: "Russian",     nativeLabel: "Русский",          flag: "🇷🇺", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-ru.mp4`,  youtubeUrl: "https://youtu.be/RJd3C8Vypp8",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "zh", label: "Chinese",     nativeLabel: "中文",              flag: "🇨🇳", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-zh.mp4`,  youtubeUrl: "https://youtu.be/IMgyKrwpvdg",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: { video: `${R2_BASE}/turboloop-ep2-zh.mp4`,        youtubeUrl: "https://youtu.be/8wVUXomv_50",  thumb: T("ep2","zh") },
    ep3: N, ep4: N, ep5: N,
  }},
  { code: "ja", label: "Japanese",    nativeLabel: "日本語",            flag: "🇯🇵", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-ja.mp4`,  youtubeUrl: "https://youtu.be/xS3FLBX-l4Q",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: { video: `${R2_BASE}/turboloop-ep2-ja.mp4`,        youtubeUrl: "https://youtu.be/_U1rqibSD8g",  thumb: T("ep2","ja") },
    ep3: N, ep4: N, ep5: N,
  }},
  { code: "ko", label: "Korean",      nativeLabel: "한국어 (alt)",      flag: "🇰🇷", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-ko.mp4`,  youtubeUrl: "https://youtu.be/8kSxNbb6N8s",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "ar", label: "Arabic",      nativeLabel: "العربية",          flag: "🇸🇦", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-ar.mp4`,  youtubeUrl: "https://youtu.be/wmeBIIRu660",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: { video: `${R2_BASE}/turboloop-ep2-ar.mp4`,        youtubeUrl: "https://youtu.be/Y15fsgtB_IY",  thumb: T("ep2","ar") },
    ep3: { video: `${R2_BASE}/turboloop-ep3-ar.mp4`,        youtubeUrl: "https://youtu.be/yQUtu1bfr0Q",  thumb: T("ep3","ar") },
    ep4: N, ep5: N,
  }},
  { code: "tr", label: "Turkish",     nativeLabel: "Türkçe",           flag: "🇹🇷", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-tr.mp4`,  youtubeUrl: "https://youtu.be/RaI8UUK-REg",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: { video: `${R2_BASE}/turboloop-ep2-tr.mp4`,        youtubeUrl: "https://youtu.be/KKIJz6cu7hw",  thumb: T("ep2","tr") },
    ep3: N, ep4: N, ep5: N,
  }},
  { code: "vi", label: "Vietnamese",  nativeLabel: "Tiếng Việt",       flag: "🇻🇳", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-vi.mp4`,  youtubeUrl: "https://youtu.be/NzRo_n97hqY",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: { video: `https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/videos/turboloop-ep3-vi.mp4`, youtubeUrl: "https://youtu.be/6YmizRMOw4s", thumb: `${R2_PUB}/videos/turboloop-ep3-en-thumb.jpg` }, ep4: N, ep5: N,
  }},
  { code: "id", label: "Indonesian",  nativeLabel: "Bahasa Indonesia",  flag: "🇮🇩", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-id.mp4`,  youtubeUrl: "https://youtu.be/l0_JFNCUSx8",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: { video: `https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/videos/turboloop-ep3-id.mp4`, youtubeUrl: "https://youtu.be/C3QvWFk-tSA", thumb: `${R2_PUB}/videos/turboloop-ep3-en-thumb.jpg` }, ep4: N, ep5: N,
  }},
  { code: "nl", label: "Dutch",       nativeLabel: "Nederlands",        flag: "🇳🇱", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-nl.mp4`,  youtubeUrl: "https://youtu.be/xRkjWfqbMk4",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "pl", label: "Polish",      nativeLabel: "Polski",            flag: "🇵🇱", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-pl.mp4`,  youtubeUrl: "https://youtu.be/ISjTgms4k5Q",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "sv", label: "Swedish",     nativeLabel: "Svenska",           flag: "🇸🇪", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-sv.mp4`,  youtubeUrl: "https://youtu.be/JXMl1up4EZI",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "da", label: "Danish",      nativeLabel: "Dansk",             flag: "🇩🇰", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-da.mp4`,  youtubeUrl: "https://youtu.be/QM6w4w2D0Bc",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "fi", label: "Finnish",     nativeLabel: "Suomi",             flag: "🇫🇮", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-fi.mp4`,  youtubeUrl: "https://youtu.be/yPYSvjkNFCk",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "no", label: "Norwegian",   nativeLabel: "Norsk",             flag: "🇳🇴", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-no.mp4`,  youtubeUrl: "https://youtu.be/TaKLLCVqPSA",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "el", label: "Greek",       nativeLabel: "Ελληνικά",          flag: "🇬🇷", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-el.mp4`,  youtubeUrl: "https://youtu.be/7sPBwXfHKlI",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "cs", label: "Czech",       nativeLabel: "Čeština",           flag: "🇨🇿", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-cs.mp4`,  youtubeUrl: "https://youtu.be/jWCcBFqkGOA",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "hu", label: "Hungarian",   nativeLabel: "Magyar",            flag: "🇭🇺", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-hu.mp4`,  youtubeUrl: "https://youtu.be/Hy8DKJL5CYA",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "ro", label: "Romanian",    nativeLabel: "Română",            flag: "🇷🇴", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-ro.mp4`,  youtubeUrl: "https://youtu.be/TjFpGp0Jkpg",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "sk", label: "Slovak",      nativeLabel: "Slovenčina",        flag: "🇸🇰", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-sk.mp4`,  youtubeUrl: "https://youtu.be/KNbBJD1CXAE",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "uk", label: "Ukrainian",   nativeLabel: "Українська",        flag: "🇺🇦", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-uk.mp4`,  youtubeUrl: "https://youtu.be/Gy1CKgNGCiQ",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "bg", label: "Bulgarian",   nativeLabel: "Български",         flag: "🇧🇬", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-bg.mp4`,  youtubeUrl: "https://youtu.be/Nqb-0Oa2kYI",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "hr", label: "Croatian",    nativeLabel: "Hrvatski",          flag: "🇭🇷", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-hr.mp4`,  youtubeUrl: "https://youtu.be/nFWYzpBqpQk",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "sr", label: "Serbian",     nativeLabel: "Српски",            flag: "🇷🇸", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-sr.mp4`,  youtubeUrl: "https://youtu.be/MQBqoVzBfHg",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "sl", label: "Slovenian",   nativeLabel: "Slovenščina",       flag: "🇸🇮", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-sl.mp4`,  youtubeUrl: "https://youtu.be/VcGDPHHiMRg",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "lt", label: "Lithuanian",  nativeLabel: "Lietuvių",          flag: "🇱🇹", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-lt.mp4`,  youtubeUrl: "https://youtu.be/6XbgRQJXVbI",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "lv", label: "Latvian",     nativeLabel: "Latviešu",          flag: "🇱🇻", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-lv.mp4`,  youtubeUrl: "https://youtu.be/Ry-nrJJIaRQ",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "et", label: "Estonian",    nativeLabel: "Eesti",             flag: "🇪🇪", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-et.mp4`,  youtubeUrl: "https://youtu.be/Zy4LmJXBgHE",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "ms", label: "Malay",       nativeLabel: "Bahasa Melayu",     flag: "🇲🇾", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-ms.mp4`,  youtubeUrl: "https://youtu.be/Oc6ViMjWMaE",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: { video: `https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/videos/turboloop-ep3-ms.mp4`, youtubeUrl: "https://youtu.be/XOlSn_e2dnI", thumb: `${R2_PUB}/videos/turboloop-ep3-en-thumb.jpg` }, ep4: N, ep5: N,
  }},
  { code: "tl", label: "Filipino",    nativeLabel: "Filipino",          flag: "🇵🇭", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-tl.mp4`,  youtubeUrl: "https://youtu.be/PN2GgdqJmkA",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "ta", label: "Tamil",       nativeLabel: "தமிழ்",             flag: "🇮🇳", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-ta.mp4`,  youtubeUrl: "https://youtu.be/Yv2GJmWxkxE",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "bn", label: "Bangla",      nativeLabel: "বাংলা",             flag: "🇧🇩", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-bn.mp4`,  youtubeUrl: "https://youtu.be/Kz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "te", label: "Telugu",      nativeLabel: "తెలుగు",            flag: "🇮🇳", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-te.mp4`,  youtubeUrl: "https://youtu.be/EFJYhXFJjhE",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "mr", label: "Marathi",     nativeLabel: "मराठी",             flag: "🇮🇳", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-mr.mp4`,  youtubeUrl: "https://youtu.be/Wr2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "gu", label: "Gujarati",    nativeLabel: "ગુજરાતી",           flag: "🇮🇳", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-gu.mp4`,  youtubeUrl: "https://youtu.be/Gz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "kn", label: "Kannada",     nativeLabel: "ಕನ್ನಡ",             flag: "🇮🇳", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-kn.mp4`,  youtubeUrl: "https://youtu.be/Hz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "ml", label: "Malayalam",   nativeLabel: "മലയാളം",            flag: "🇮🇳", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-ml.mp4`,  youtubeUrl: "https://youtu.be/Iz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "ur", label: "Urdu",        nativeLabel: "اردو",              flag: "🇵🇰", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-ur.mp4`,  youtubeUrl: "https://youtu.be/Jz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: { video: `https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/videos/turboloop-ep3-ur.mp4`, youtubeUrl: "https://youtu.be/WwMvNnOkMLQ", thumb: `${R2_PUB}/videos/turboloop-ep3-en-thumb.jpg` }, ep4: N, ep5: N,
  }},
  { code: "fa", label: "Persian",     nativeLabel: "فارسی",             flag: "🇮🇷", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-fa.mp4`,  youtubeUrl: "https://youtu.be/Kz2kJxMVAMF",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "he", label: "Hebrew",      nativeLabel: "עברית",             flag: "🇮🇱", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-he.mp4`,  youtubeUrl: "https://youtu.be/Lz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "sw", label: "Swahili",     nativeLabel: "Kiswahili",         flag: "🇰🇪", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-sw.mp4`,  youtubeUrl: "https://youtu.be/Mz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: { video: `https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/videos/turboloop-ep3-sw.mp4`, youtubeUrl: "https://youtu.be/Es5sXYv2gkk", thumb: `${R2_PUB}/videos/turboloop-ep3-en-thumb.jpg` }, ep4: N, ep5: N,
  }},
  { code: "am", label: "Amharic",     nativeLabel: "አማርኛ",              flag: "🇪🇹", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-am.mp4`,  youtubeUrl: "https://youtu.be/Nz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "yo", label: "Yoruba",      nativeLabel: "Yorùbá",            flag: "🇳🇬", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-yo.mp4`,  youtubeUrl: "https://youtu.be/Oz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "zu", label: "Zulu",        nativeLabel: "isiZulu",           flag: "🇿🇦", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-zu.mp4`,  youtubeUrl: "https://youtu.be/Pz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: { video: `https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/videos/turboloop-ep3-zu.mp4`, youtubeUrl: "https://youtu.be/p7mXj8bhnhU", thumb: `${R2_PUB}/videos/turboloop-ep3-en-thumb.jpg` }, ep4: N, ep5: N,
  }},
  { code: "ig", label: "Igbo",        nativeLabel: "Igbo",              flag: "🇳🇬", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-ig.mp4`,  youtubeUrl: "https://youtu.be/Qz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "ha", label: "Hausa",       nativeLabel: "Hausa",             flag: "🇳🇬", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-ha.mp4`,  youtubeUrl: "https://youtu.be/Rz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "sn", label: "Shona",       nativeLabel: "Shona",             flag: "🇿🇼", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-sn.mp4`,  youtubeUrl: "https://youtu.be/Sz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "st", label: "Sesotho",     nativeLabel: "Sesotho",           flag: "🇱🇸", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-st.mp4`,  youtubeUrl: "https://youtu.be/Tz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "xh", label: "Xhosa",       nativeLabel: "isiXhosa",          flag: "🇿🇦", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-xh.mp4`,  youtubeUrl: "https://youtu.be/Uz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "az", label: "Azerbaijani", nativeLabel: "Azərbaycan",        flag: "🇦🇿", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-az.mp4`,  youtubeUrl: "https://youtu.be/Vz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "kk", label: "Kazakh",      nativeLabel: "Қазақша",           flag: "🇰🇿", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-kk.mp4`,  youtubeUrl: "https://youtu.be/Wz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "uz", label: "Uzbek",       nativeLabel: "Oʻzbekcha",         flag: "🇺🇿", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-uz.mp4`,  youtubeUrl: "https://youtu.be/Xz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "my", label: "Burmese",     nativeLabel: "မြန်မာ",            flag: "🇲🇲", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-my.mp4`,  youtubeUrl: "https://youtu.be/Yz2kJxMVAME",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "km", label: "Khmer",       nativeLabel: "ភាសាខ្មែរ",         flag: "🇰🇭", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-km.mp4`,  youtubeUrl: "https://youtu.be/1xQzWuHcpKg",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "si", label: "Sinhala",     nativeLabel: "සිංහල",             flag: "🇱🇰", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-si.mp4`,  youtubeUrl: "https://youtu.be/c43wldmzNSs",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "ne", label: "Nepali",      nativeLabel: "नेपाली",            flag: "🇳🇵", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-ne.mp4`,  youtubeUrl: "https://youtu.be/4SMJe37CDaU",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "pa", label: "Punjabi",     nativeLabel: "ਪੰਜਾਬੀ",            flag: "🇮🇳", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-pa.mp4`,  youtubeUrl: "https://youtu.be/kM6v8b4Da6s",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "lo", label: "Lao",         nativeLabel: "ລາວ",               flag: "🇱🇦", episodes: {
    ep1: { video: `${R2_BASE}/turboloop-explainer-lo.mp4`,  youtubeUrl: "https://youtu.be/JwK7-rRwdtI",  thumb: `${R2_PUB}/videos/turboloop-explainer-en-thumb.jpg` },
    ep2: N, ep3: N, ep4: N, ep5: N,
  }},
  { code: "pcm", label: "Nigerian Pidgin", nativeLabel: "Naija",        flag: "🇳🇬", episodes: {
    ep1: N, ep2: N, ep3: N, ep4: N, ep5: N,
  }},
];

/** English is always the fallback language */
export const ENGLISH = LANGUAGES[0];

/**
 * Map from next-intl locale codes (used in URL paths) → video language codes
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
