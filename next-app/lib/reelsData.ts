// Multi-language "Shorts / Reels" data shown on /films.
// Three logical reels × three languages = 9 total. Each language pool
// links to its own R2-hosted MP4 + PNG thumbnail.
//
// Lives separately from scripts/reels-manifest.json (which is the
// existing production-quality reels feed for the homepage carousel)
// because the source material here is shorter, localized tutorials —
// different intent, different layout treatment.

export type ReelLang = "en" | "de" | "id";

export interface MultiLangReel {
  /** Reel identity, stable across languages */
  id: string;
  title: string;
  description: string;
  /** Friendly language label for the chip — already includes flag */
  lang: ReelLang;
}

export interface ReelTrack extends MultiLangReel {
  videoUrl: string;
  thumbUrl: string;
}

const R2 = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

const LANG_META: Record<ReelLang, { label: string; flag: string; dir: string }> = {
  en: { label: "English", flag: "🇬🇧", dir: "en" },
  de: { label: "Deutsch", flag: "🇩🇪", dir: "de" },
  id: { label: "Bahasa Indonesia", flag: "🇮🇩", dir: "id" },
};

/** Logical reels — title + description appear in every language. */
const REEL_BASE: MultiLangReel[] = [
  {
    id: "v1-withdrawal",
    title: "How to withdraw your yield",
    description:
      "Step-by-step tutorial — initiate a withdrawal in the dApp, confirm on BscScan, and receive USDT in your wallet.",
    lang: "en", // placeholder, overridden when fanned out
  },
  {
    id: "v2-investment",
    title: "How investments work",
    description:
      "What happens to your USDT after deposit — from the smart contract to PancakeSwap V3 LPs to your daily yield.",
    lang: "en",
  },
  {
    id: "v3-lp-check",
    title: "Verify the LP lock yourself",
    description:
      "Two-minute walkthrough of the public Unicrypt lock page — see exactly how much liquidity is locked, and until when.",
    lang: "en",
  },
];

function buildLangReels(lang: ReelLang): ReelTrack[] {
  return REEL_BASE.map(base => ({
    ...base,
    lang,
    videoUrl: `${R2}/reels/${LANG_META[lang].dir}/${base.id}.mp4`,
    thumbUrl: `${R2}/reels/${LANG_META[lang].dir}/${base.id}.png`,
  }));
}

/** Grouped by language so the UI can render language sub-sections or
 *  language-filter chips without flattening. */
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

/** Flat list of all 9 reels in display order: EN block, DE block,
 *  ID block. Used by the films page when language filtering isn't
 *  active. */
export const ALL_REELS: ReelTrack[] = [
  ...MULTI_LANG_REELS.en,
  ...MULTI_LANG_REELS.de,
  ...MULTI_LANG_REELS.id,
];
