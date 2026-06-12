// Multi-language "Shorts / Reels" data — driven by curated
// translations + captions from the TurboLoop_Complete content bundle.
// Three logical reels × three languages = 9 total, each pointing at
// its own R2-hosted MP4 + PNG thumbnail and carrying language-native
// title + tease.
//
// Lives separately from scripts/reels-manifest.json (the existing
// homepage carousel data, all-English) so the multi-lingual reels can
// evolve independently.

export type ReelLang = "en" | "de" | "id";

type LocalizedString = Record<ReelLang, string>;

interface ReelDef {
  /** Stable slug, identical across languages — used in the R2 key */
  id: string;
  titles: LocalizedString;
  /** Twitter-X-length tease (one or two sentences) — what shows up
   *  below the thumbnail and inside the share-sheet text body. */
  descriptions: LocalizedString;
  /** Hashtag stack per language — appended to the share text. */
  hashtags: LocalizedString;
}

const REEL_DEFS: ReelDef[] = [
  {
    id: "v1-withdrawal",
    titles: {
      en: "How to Withdraw via Smart Contract on BSC",
      de: "Wie man über Smart Contract auf BSC abhebt",
      id: "Cara Menarik Dana via Smart Contract di BSC",
    },
    descriptions: {
      en: "Your funds. Your control. Always on-chain. Withdraw from TurboLoop directly through the BSC smart contract — no website needed.",
      de: "Ihre Gelder. Ihre Kontrolle. Immer on-chain. Heben Sie direkt über den BSC Smart Contract ab — keine Website nötig.",
      id: "Dana Anda. Kendali Anda. Selalu on-chain. Tarik dana langsung melalui smart contract BSC — tanpa perlu website.",
    },
    hashtags: {
      en: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      de: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
      id: "#TurboLoop #DeFi #BSC #Web3 #SmartContract",
    },
  },
  {
    id: "v2-investment",
    titles: {
      en: "Investment Returns — 30-Day Loop Completed",
      de: "Investitionsrenditen — 30-Tage-Loop abgeschlossen",
      id: "Hasil Investasi — Loop 30 Hari Selesai",
    },
    descriptions: {
      en: "30-Day Loop COMPLETED. The returns are in. Full breakdown: daily returns, compounding strategy, and how to claim your rewards.",
      de: "30-Tage-Loop ABGESCHLOSSEN. Die Renditen sind da. Vollständige Analyse: tägliche Renditen, Compounding-Strategie und Belohnungen einfordern.",
      id: "Loop 30 Hari SELESAI. Hasilnya sudah masuk. Analisis lengkap: pengembalian harian, strategi compounding, dan cara klaim hadiah.",
    },
    hashtags: {
      en: "#TurboLoop #CryptoReturns #DeFi #Automation #ROI",
      de: "#TurboLoop #KryptoRenditen #DeFi #Automatisierung #ROI",
      id: "#TurboLoop #HasilKripto #DeFi #Otomatisasi #ROI",
    },
  },
  {
    id: "v3-lp-check",
    titles: {
      en: "LP Lock Check — $34.7M Liquidity Verified",
      de: "LP Lock Prüfung — $34.7M Liquidität verifiziert",
      id: "Cek LP Lock — $34.7M Likuiditas Terverifikasi",
    },
    descriptions: {
      en: "$34.7M Liquidity. 100% Locked. Fully Verified. Learn how to check TurboLoop's LP lock yourself on BscScan and PancakeSwap.",
      de: "$34.7M Liquidität. 100% gesperrt. Vollständig verifiziert. Prüfen Sie TurboLoops LP-Lock selbst auf BscScan und PancakeSwap.",
      id: "$34.7M Likuiditas. 100% Terkunci. Sepenuhnya Terverifikasi. Periksa LP lock TurboLoop sendiri di BscScan dan PancakeSwap.",
    },
    hashtags: {
      en: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      de: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
      id: "#TurboLoop #LiquidityLock #DYOR #BSC #PancakeSwap",
    },
  },
];

export interface ReelTrack {
  id: string;
  lang: ReelLang;
  title: string;
  description: string;
  hashtags: string;
  videoUrl: string;
  thumbUrl: string;
}

const R2 = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

const LANG_META: Record<ReelLang, { label: string; flag: string; dir: string }> = {
  en: { label: "English", flag: "🇬🇧", dir: "en" },
  de: { label: "Deutsch", flag: "🇩🇪", dir: "de" },
  id: { label: "Bahasa Indonesia", flag: "🇮🇩", dir: "id" },
};

function buildLangReels(lang: ReelLang): ReelTrack[] {
  return REEL_DEFS.map(def => ({
    id: def.id,
    lang,
    title: def.titles[lang],
    description: def.descriptions[lang],
    hashtags: def.hashtags[lang],
    videoUrl: `${R2}/reels/${LANG_META[lang].dir}/${def.id}.mp4`,
    // Custom-designed thumbnails live under reel-thumbs/<lang>/<id>.png
    // (different path from the legacy screen-recording stills under
    // reels/<lang>/). The `?v=` query suffix was removed so Next.js
    // image optimisation can serve WebP/AVIF instead of raw PNG — the
    // Cache-Control: immutable header on R2 already handles cache
    // invalidation when a thumbnail is re-uploaded. To bust, change the
    // R2 key (e.g. R02-v2.png) rather than re-introducing a query string.
    thumbUrl: `${R2}/reel-thumbs/${LANG_META[lang].dir}/${def.id}.png`,
  }));
}

/** Grouped by language so the UI can render language sub-sections or
 *  language-filter tabs without flattening. */
export const MULTI_LANG_REELS: Record<ReelLang, ReelTrack[]> = {
  en: buildLangReels("en"),
  de: buildLangReels("de"),
  id: buildLangReels("id"),
};

export const REEL_LANGUAGES: Array<{
  code: ReelLang;
  label: string;
  flag: string;
}> = (Object.keys(LANG_META) as ReelLang[]).map(code => ({
  code,
  label: LANG_META[code].label,
  flag: LANG_META[code].flag,
}));

/** Flat list of all 9 reels in display order: EN block → DE → ID. */
export const ALL_REELS: ReelTrack[] = [
  ...MULTI_LANG_REELS.en,
  ...MULTI_LANG_REELS.de,
  ...MULTI_LANG_REELS.id,
];
