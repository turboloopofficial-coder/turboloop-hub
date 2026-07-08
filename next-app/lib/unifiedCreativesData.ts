// ── unifiedCreativesData.ts ────────────────────────────────────────────────
// Single source of truth for ALL 1,134+ creatives across three libraries:
//   1. Legacy branded library (175 images)
//   2. Language Education Kit (455 images × 7 languages)
//   3. Campaign Suite (504 images × 12 categories)
//
// Every image is normalised to the same `UnifiedCreative` type so the
// /creatives page and sub-pages can render them with a single component.

import legacyManifest from "./creatives-manifest.json";
import langKitManifest from "./creatives-language-kit-manifest.json";
import campaignManifest from "./campaigns-manifest.json";
import campaignCaptionsRaw from "./campaign-captions.json";

// ── Types ──────────────────────────────────────────────────────────────────

export type CreativeLanguage = "en" | "hi" | "id" | "fr" | "ar" | "es" | "de" | "zh" | "it" | "ur" | "pcm" | "th" | "ko" | "lo" | "ta";

export type UnifiedCreative = {
  /** Globally unique identifier */
  id: string;
  /** Full R2 URL */
  url: string;
  /** Alt text for SEO + accessibility */
  alt: string;
  /** Short human-readable title */
  title: string;
  /** Category slug — used for filtering */
  categoryId: string;
  /** Display label for the category badge */
  categoryLabel: string;
  /** Category emoji */
  emoji: string;
  /** Accent gradient colours for the card */
  accent: { from: string; to: string };
  /** Language code — "en" for campaign/legacy images */
  language: CreativeLanguage;
  /** Library source */
  source: "legacy" | "lang-kit" | "campaign";
  /** Unique share text for the Share button */
  shareText: string;
  /** CTA label + URL for the share modal */
  cta: { label: string; url: string };
  /** Full Telegram caption (campaign images only) */
  telegramCaption?: string;
};

// ── Category registry ──────────────────────────────────────────────────────

export type UnifiedCategoryDef = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  accent: { from: string; to: string };
  count: number;
  source: "legacy" | "lang-kit" | "campaign" | "mixed";
  /** True for language-specific categories — hidden from the category tab row */
  isLanguageCategory?: boolean;
};

// Campaign category accent map
const CAMPAIGN_ACCENTS: Record<string, { from: string; to: string }> = {
  lifestyle:          { from: "#06B6D4", to: "#7C3AED" },
  token:              { from: "#F59E0B", to: "#EF4444" },
  referral:           { from: "#10B981", to: "#06B6D4" },
  "objection-handler":{ from: "#8B5CF6", to: "#EC4899" },
  "hindi-new":        { from: "#F97316", to: "#EF4444" },
  nigerian:           { from: "#22C55E", to: "#16A34A" },
  "success-story":    { from: "#F59E0B", to: "#10B981" },
  "education-defi":   { from: "#3B82F6", to: "#8B5CF6" },
  urgency:            { from: "#EF4444", to: "#F97316" },
  buyback:            { from: "#EC4899", to: "#8B5CF6" },
  comparison:         { from: "#0EA5E9", to: "#6366F1" },
  community:          { from: "#14B8A6", to: "#06B6D4" },
  spanish:            { from: "#F59E0B", to: "#DC2626" },
  indonesian:         { from: "#EF4444", to: "#DC2626" },
  chinese:            { from: "#DC2626", to: "#F59E0B" },
  italian:            { from: "#22C55E", to: "#3B82F6" },
  arabic:             { from: "#8B5CF6", to: "#F59E0B" },
  urdu:               { from: "#06B6D4", to: "#8B5CF6" },
  german:             { from: "#3B82F6", to: "#1D4ED8" },
  ko:                 { from: "#EF4444", to: "#1D4ED8" },
  la:                 { from: "#CE1126", to: "#002868" },
};

const CAMPAIGN_LABELS: Record<string, { label: string; emoji: string; description: string }> = {
  lifestyle:           { label: "Passive Income Lifestyle", emoji: "🌴", description: "Aspirational banners showing the freedom that passive income creates." },
  token:               { label: "$TURBO Token", emoji: "🪙", description: "Token launch, supply mechanics, vesting, and on-chain transparency." },
  referral:            { label: "Referral & Affiliate", emoji: "🤝", description: "20-level referral system, affiliate income, and network building." },
  "objection-handler": { label: "Objection Handlers", emoji: "🛡️", description: "FUD-busting banners that answer every sceptic's question." },
  "hindi-new":         { label: "Hindi Market", emoji: "🇮🇳", description: "Hindi-language banners for the Indian market." },
  nigerian:            { label: "Nigerian Market", emoji: "🇳🇬", description: "Banners tailored for the Nigerian DeFi community." },
  "success-story":     { label: "Success Stories", emoji: "🏆", description: "First withdrawals, debt payoffs, and real member milestones." },
  "education-defi":    { label: "DeFi Education", emoji: "📚", description: "Smart contracts, blockchain basics, and DeFi 101 explained visually." },
  urgency:             { label: "Urgency & FOMO", emoji: "⏰", description: "Every-day-counts and start-today banners for high-intent audiences." },
  buyback:             { label: "Buyback & Burn", emoji: "🔥", description: "Daily buyback proof, scarcity engine, and deflationary mechanics." },
  comparison:          { label: "TurboLoop vs Banks", emoji: "⚖️", description: "Side-by-side comparisons against banks, stocks, and traditional crypto." },
  community:           { label: "Community", emoji: "🌍", description: "Global family, Telegram growth, and community milestones." },
  spanish:             { label: "Spanish / LATAM", emoji: "🇪🇸", description: "Spanish-language banners for Latin America and Spain." },
  indonesian:          { label: "Indonesian Market", emoji: "🇮🇩", description: "Bahasa Indonesia banners for the Indonesian DeFi community." },
  chinese:             { label: "Chinese Market", emoji: "🇨🇳", description: "Simplified Chinese banners for the Chinese-speaking DeFi community." },
  italian:             { label: "Italian Market", emoji: "🇮🇹", description: "Italian-language banners for the Italian DeFi community." },
  arabic:              { label: "Arabic Market", emoji: "🇸🇦", description: "Arabic-language banners for the Arab DeFi community." },
  urdu:                { label: "Urdu Market", emoji: "🇵🇰", description: "Urdu-language banners for the Pakistani DeFi community." },
  german:              { label: "German Market", emoji: "🇩🇪", description: "German-language banners for the DACH DeFi community." },
  thai:                { label: "Thai Market", emoji: "🇹🇭", description: "Thai-language banners for the Thai DeFi community." },
  ko:                  { label: "Korean Market", emoji: "🇰🇷", description: "Korean-language banners for the Korean DeFi community." },
  la:                  { label: "Lao Market", emoji: "🇱🇦", description: "Lao-language banners for the Lao DeFi community." },
};

// Legacy category accent map (from manifest palette.from/to)
function paletteToAccent(p: { from: string; via?: string; to: string }) {
  return { from: p.from, to: p.to };
}

// ── CTA map per category ───────────────────────────────────────────────────

const CTA_MAP: Record<string, { label: string; url: string }> = {
  lifestyle:           { label: "Start Earning Today", url: "https://turboloop.tech/apply" },
  token:               { label: "View $TURBO Token", url: "https://turboloop.tech/token" },
  referral:            { label: "Join & Earn Referrals", url: "https://turboloop.tech/apply" },
  "objection-handler": { label: "See the Proof", url: "https://turboloop.tech/token" },
  "hindi-new":         { label: "अभी शुरू करें", url: "https://turboloop.tech/apply" },
  nigerian:            { label: "Start Earning", url: "https://turboloop.tech/apply" },
  "success-story":     { label: "Join the Community", url: "https://turboloop.tech/community" },
  "education-defi":    { label: "Learn More", url: "https://turboloop.tech/learn" },
  urgency:             { label: "Don't Wait — Start Now", url: "https://turboloop.tech/apply" },
  buyback:             { label: "View Buyback Proof", url: "https://turboloop.tech/token" },
  comparison:          { label: "Compare & Decide", url: "https://turboloop.tech/calculator" },
  community:           { label: "Join the Community", url: "https://turboloop.tech/community" },
  spanish:             { label: "Empieza a Ganar", url: "https://turboloop.tech/apply" },
  indonesian:          { label: "Mulai Sekarang", url: "https://turboloop.tech/apply" },
  chinese:             { label: "立即开始", url: "https://turboloop.tech/apply" },
  italian:             { label: "Inizia Adesso", url: "https://turboloop.tech/apply" },
  arabic:              { label: "ابدأ الآن", url: "https://turboloop.tech/apply" },
  urdu:                { label: "ابھی شروع کریں", url: "https://turboloop.tech/apply" },
  german:              { label: "Jetzt Starten", url: "https://turboloop.tech/apply" },
  thai:                { label: "เริ่มต้นวันนี้", url: "https://turboloop.tech/apply" },
  ko:                  { label: "지금 시작하기", url: "https://turboloop.tech/apply" },
  la:                  { label: "ເລີ່ມຕົ້ນວັນນີ້", url: "https://turboloop.tech/apply" },
  mythbuster:          { label: "See the Proof", url: "https://turboloop.tech/token" },
  "product-bible":     { label: "Read the Docs", url: "https://turboloop.tech/learn" },
  "monthly-projections":{ label: "Run Your Numbers", url: "https://turboloop.tech/calculator" },
  "lang-kit":          { label: "Learn TurboLoop", url: "https://turboloop.tech/learn" },
  default:             { label: "Explore TurboLoop", url: "https://turboloop.tech" },
};

function getCta(categoryId: string): { label: string; url: string } {
  return CTA_MAP[categoryId] ?? CTA_MAP["default"];
}

// ── Caption lookup for campaign images ────────────────────────────────────

const campaignCaptions = campaignCaptionsRaw as Record<string, { caption: string; shareText: string }>;

function getCampaignShareText(category: string, filename: string): string {
  const key = `${category}/${filename}`;
  return campaignCaptions[key]?.shareText ?? `Download this ${category} banner from TurboLoop — turboloop.tech/creatives`;
}

function getCampaignTelegramCaption(category: string, filename: string): string | undefined {
  const key = `${category}/${filename}`;
  return campaignCaptions[key]?.caption;
}

// ── Legacy share text generator ────────────────────────────────────────────

function getLegacyShareText(headline: string | undefined, categoryLabel: string, url: string): string {
  if (headline) {
    const clean = headline.replace(/\*\*/g, "").replace(/🔷|🔹|⭐|✅|🛡|🔥/g, "").trim();
    return `${clean} — turboloop.tech/creatives`;
  }
  return `${categoryLabel} banner from TurboLoop — turboloop.tech/creatives`;
}

// ── Merge all three libraries ──────────────────────────────────────────────

type RawLegacyBanner = {
  slug: string;
  url: string;
  categoryId: string;
  categoryLabel: string;
  emoji: string;
  palette: { from: string; via: string; to: string };
  original: string;
  headline?: string;
  caption?: string;
  fact?: string | null;
  hashtags?: string[];
  visualNumber?: number | null;
  language?: CreativeLanguage;
};

type RawCampaignItem = {
  category: string;
  filename: string;
  url: string;
  alt: string;
  title: string;
  description: string;
  keywords: string[];
};

// 1. Legacy banners
const legacyItems: UnifiedCreative[] = (legacyManifest.items as RawLegacyBanner[]).map((b) => ({
  id: `legacy-${b.slug}`,
  url: b.url,
  alt: b.headline ?? `${b.categoryLabel} banner`,
  title: b.headline ?? `${b.categoryLabel} banner`,
  categoryId: b.categoryId,
  categoryLabel: b.categoryLabel,
  emoji: b.emoji,
  accent: paletteToAccent(b.palette),
  language: b.language ?? "en",
  source: "legacy" as const,
  shareText: getLegacyShareText(b.headline, b.categoryLabel, b.url),
  cta: getCta(b.categoryId),
  telegramCaption: b.caption,
}));

// 2. Language-kit banners
const langKitItems: UnifiedCreative[] = (langKitManifest.items as RawLegacyBanner[]).map((b) => ({
  id: `langkit-${b.slug}`,
  url: b.url,
  alt: b.headline ?? `TurboLoop Educational Kit — ${b.language ?? "en"}`,
  title: b.headline ?? `TurboLoop Educational Kit`,
  categoryId: "lang-kit",
  categoryLabel: "Educational Kit",
  emoji: "📚",
  accent: paletteToAccent(b.palette),
  language: b.language ?? "en",
  source: "lang-kit" as const,
  shareText: getLegacyShareText(b.headline, "TurboLoop Educational Kit", b.url),
  cta: getCta("lang-kit"),
  telegramCaption: b.caption,
}));

// 3. Campaign banners
const campaignItems: UnifiedCreative[] = (campaignManifest as RawCampaignItem[]).map((b) => {
  const meta = CAMPAIGN_LABELS[b.category];
  const accent = CAMPAIGN_ACCENTS[b.category] ?? { from: "#06B6D4", to: "#7C3AED" };
  // Hindi and Nigerian banners keep their language tag
  const language: CreativeLanguage =
    b.category === "hindi-new" ? "hi" :
    b.category === "nigerian" ? "pcm" :
    b.category === "spanish" ? "es" :
    b.category === "indonesian" ? "id" :
    b.category === "chinese" ? "zh" :
    b.category === "italian" ? "it" :
    b.category === "arabic" ? "ar" :
    b.category === "urdu" ? "ur" :
    b.category === "german" ? "de" :
    b.category === "thai" ? "th" :
    b.category === "ko" ? "ko" :
    b.category === "tamil" ? "ta" :
    b.category === "la" ? "lo" : "en";
  return {
    id: `campaign-${b.category}-${b.filename}`,
    url: b.url,
    alt: b.alt,
    title: b.title,
    categoryId: b.category,
    categoryLabel: meta?.label ?? b.category,
    emoji: meta?.emoji ?? "🎨",
    accent,
    language,
    source: "campaign" as const,
    shareText: getCampaignShareText(b.category, b.filename),
    cta: getCta(b.category),
    telegramCaption: getCampaignTelegramCaption(b.category, b.filename),
  };
});

// ── Unified pool ───────────────────────────────────────────────────────────

export const ALL_UNIFIED_CREATIVES: UnifiedCreative[] = [
  ...campaignItems,
  ...legacyItems,
  ...langKitItems,
];

// ── Category definitions (for filter tabs) ────────────────────────────────

function buildCategories(): UnifiedCategoryDef[] {
  const counts: Record<string, number> = {};
  for (const c of ALL_UNIFIED_CREATIVES) {
    counts[c.categoryId] = (counts[c.categoryId] ?? 0) + 1;
  }

  // Language-specific category IDs — these are shown in the language filter, not the category filter
  const LANGUAGE_CATEGORY_IDS = new Set([
    "hindi-new", "nigerian", "spanish", "indonesian", "chinese", "italian",
    "arabic", "urdu", "german", "thai", "ko", "la", "tamil", "lang-kit",
  ]);
  // Campaign categories
  const campaignCats: UnifiedCategoryDef[] = Object.entries(CAMPAIGN_LABELS).map(([id, meta]) => ({
    id,
    label: meta.label,
    emoji: meta.emoji,
    description: meta.description,
    accent: CAMPAIGN_ACCENTS[id] ?? { from: "#06B6D4", to: "#7C3AED" },
    count: counts[id] ?? 0,
    source: "campaign" as const,
    isLanguageCategory: LANGUAGE_CATEGORY_IDS.has(id),
  }));

  // Legacy categories (derive from manifest)
  const legacyCatMap: Record<string, UnifiedCategoryDef> = {};
  for (const b of legacyManifest.items as RawLegacyBanner[]) {
    if (!legacyCatMap[b.categoryId]) {
      legacyCatMap[b.categoryId] = {
        id: b.categoryId,
        label: b.categoryLabel,
        emoji: b.emoji,
        description: `${b.categoryLabel} banners from the TurboLoop branded library.`,
        accent: paletteToAccent(b.palette),
        count: counts[b.categoryId] ?? 0,
        source: "legacy" as const,
      };
    }
  }

  // Lang-kit category
  const langKitCat: UnifiedCategoryDef = {
    id: "lang-kit",
    label: "Educational Kit",
    emoji: "📚",
    description: "TurboLoop educational banners in 7 languages — EN, HI, DE, ID, FR, AR, ES.",
    accent: { from: "#0891B2", to: "#7C3AED" },
    count: counts["lang-kit"] ?? 0,
    source: "lang-kit" as const,
    isLanguageCategory: true,
  };

  return [...campaignCats, ...Object.values(legacyCatMap), langKitCat].filter(c => c.count > 0);
}

export const UNIFIED_CATEGORIES: UnifiedCategoryDef[] = buildCategories();

// ── Language list ──────────────────────────────────────────────────────────

export const UNIFIED_LANGUAGES: ReadonlyArray<{ code: CreativeLanguage; label: string; flag: string }> = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "id", label: "Bahasa", flag: "🇮🇩" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ur", label: "اردو", flag: "🇵🇰" },
  { code: "pcm", label: "Naija", flag: "🇳🇬" },
  { code: "th", label: "ภาษาไทย", flag: "🇹🇭" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "lo", label: "ພາສາລາວ", flag: "🇱🇦" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
];

// ── Totals ─────────────────────────────────────────────────────────────────

export const TOTAL_CREATIVES = ALL_UNIFIED_CREATIVES.length;
export const TOTAL_CATEGORIES = UNIFIED_CATEGORIES.length;
