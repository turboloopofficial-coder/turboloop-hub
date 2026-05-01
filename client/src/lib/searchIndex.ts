// Cross-content search index — aggregates everything searchable on the hub
// into a single typed list. Used by GlobalSearch component (Cmd+K modal).
//
// Static content (films, lessons, pillars, comparisons, creatives) is bundled
// into the JS at build time. Dynamic content (blog posts, reels) is fetched
// via tRPC and merged in at runtime.

import { FILMS } from "./cinematicUniverse";
import { LESSONS } from "./defi101";
import { ECOSYSTEM_PILLARS } from "./ecosystemPillars";
import { COMPARISONS } from "./comparisons";
import { ALL_CREATIVES as CREATIVES } from "./creativesData";

export type SearchResultType =
  | "film"
  | "lesson"
  | "pillar"
  | "comparison"
  | "page"
  | "creative"
  | "blog"
  | "reel";

export interface SearchResult {
  /** Stable ID for keying — typically `${type}:${slug}` */
  id: string;
  type: SearchResultType;
  title: string;
  /** 1-line description shown in the result */
  description: string;
  /** Where to navigate on click */
  href: string;
  /** Optional emoji shown next to result */
  emoji?: string;
  /** All searchable text concatenated — used for the actual matching */
  searchBlob: string;
}

// Top-level pages — show up when user searches "ecosystem", "security", etc.
const STATIC_PAGES: SearchResult[] = [
  { id: "page:home",        type: "page", title: "Home",         description: "TurboLoop hub homepage",                                       href: "/",            emoji: "🏠", searchBlob: "home homepage main turboloop hub" },
  { id: "page:security",    type: "page", title: "Security",     description: "Audited. Renounced. Locked. The 5 pillars of trustless DeFi.", href: "/security",    emoji: "🛡", searchBlob: "security audit renounced locked trustless code" },
  { id: "page:community",   type: "page", title: "Community",    description: "21+ countries · 6 continents · 48 languages",                  href: "/community",   emoji: "🌍", searchBlob: "community country language leaderboard global" },
  { id: "page:roadmap",     type: "page", title: "Roadmap",      description: "Phases past, present, and future",                             href: "/roadmap",     emoji: "🚀", searchBlob: "roadmap phase future timeline plans" },
  { id: "page:promotions",  type: "page", title: "Promotions",   description: "$100K bounty + creator and presenter programs",                href: "/promotions",  emoji: "🎁", searchBlob: "promotions bounty 100k creator presenter rewards programs" },
  { id: "page:library",     type: "page", title: "Library",      description: "All videos + presentations in 48 languages",                   href: "/library",     emoji: "📂", searchBlob: "library videos presentations pdf languages download" },
  { id: "page:films",       type: "page", title: "Films",        description: "20-film cinematic universe across 4 seasons",                  href: "/films",       emoji: "🎬", searchBlob: "films cinematic universe seasons episodes movies" },
  { id: "page:learn",       type: "page", title: "Learn (DeFi 101)", description: "Plain-English explainers for crypto beginners",            href: "/learn",       emoji: "📚", searchBlob: "learn defi 101 beginner tutorial explainer education" },
  { id: "page:creatives",   type: "page", title: "Creatives",    description: "141 ready-to-share branded posts in 48 languages",             href: "/creatives",   emoji: "🎨", searchBlob: "creatives banners posts share design 141 captions" },
  { id: "page:feed",        type: "page", title: "Editorial",    description: "Long-form blog updated weekly",                                href: "/feed",        emoji: "📖", searchBlob: "editorial blog feed articles posts content" },
  { id: "page:ecosystem",   type: "page", title: "Ecosystem",    description: "Six pillars. One self-sustaining engine.",                     href: "/ecosystem",   emoji: "⚙",  searchBlob: "ecosystem pillars six engine flywheel" },
  { id: "page:faq",         type: "page", title: "FAQ",          description: "Common questions answered",                                    href: "/faq",         emoji: "❓", searchBlob: "faq questions help support" },
  { id: "page:submit",      type: "page", title: "Submit Your Story", description: "Share testimonials, photos, videos, stories",             href: "/submit",      emoji: "✍️", searchBlob: "submit story testimonial photo video share contribute" },
];

const FILM_RESULTS: SearchResult[] = FILMS.map((f) => ({
  id: `film:${f.slug}`,
  type: "film",
  title: f.title,
  description: `S${f.season} · E${f.episode} — ${f.tagline}`,
  href: `/films/${f.slug}`,
  emoji: "🎬",
  searchBlob: `${f.title} ${f.tagline} ${f.headline} ${f.description} season ${f.season} episode ${f.episode}`.toLowerCase(),
}));

const LESSON_RESULTS: SearchResult[] = LESSONS.map((l) => ({
  id: `lesson:${l.slug}`,
  type: "lesson",
  title: l.title,
  description: l.summary,
  href: `/learn/${l.slug}`,
  emoji: l.emoji,
  searchBlob: `${l.title} ${l.summary} ${l.content}`.toLowerCase(),
}));

const PILLAR_RESULTS: SearchResult[] = ECOSYSTEM_PILLARS.map((p) => ({
  id: `pillar:${p.slug}`,
  type: "pillar",
  title: p.title,
  description: p.tagline,
  href: `/ecosystem/${p.slug}`,
  emoji: p.emoji,
  searchBlob: `${p.title} ${p.subtitle} ${p.tagline} ${p.facts.join(" ")} ${p.sections.map(s => s.heading + " " + s.body).join(" ")}`.toLowerCase(),
}));

const COMPARISON_RESULTS: SearchResult[] = COMPARISONS.map((c) => ({
  id: `comparison:${c.slug}`,
  type: "comparison",
  title: `TurboLoop vs ${c.competitor}`,
  description: c.competitorTagline,
  href: `/vs/${c.slug}`,
  emoji: c.competitorLogoEmoji,
  searchBlob: `turboloop vs ${c.competitor} ${c.competitorTagline} ${c.intro} ${c.conclusion}`.toLowerCase(),
}));

const CREATIVE_RESULTS: SearchResult[] = CREATIVES.map((c) => ({
  id: `creative:${c.slug}`,
  type: "creative",
  title: c.headline || c.original || c.slug,
  description: c.caption ? c.caption.slice(0, 140) : `${c.categoryLabel} banner`,
  href: `/creatives?focus=${c.slug}`,
  emoji: c.emoji,
  searchBlob: `${c.headline || ""} ${c.caption || ""} ${c.fact || ""} ${(c.hashtags || []).join(" ")} ${c.categoryLabel}`.toLowerCase(),
}));

/** Static index — filmscapes, lessons, pillars, comparisons, pages, creatives.
 *  Doesn't include blog posts or reels (those need tRPC fetch). */
export const STATIC_SEARCH_INDEX: SearchResult[] = [
  ...STATIC_PAGES,
  ...FILM_RESULTS,
  ...LESSON_RESULTS,
  ...PILLAR_RESULTS,
  ...COMPARISON_RESULTS,
  ...CREATIVE_RESULTS,
];

/** Score a result against a query. Higher = better match.
 *  Title hit > description hit > body hit. Multi-word queries require all words. */
export function scoreResult(result: SearchResult, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const words = q.split(/\s+/).filter(Boolean);
  const titleLower = result.title.toLowerCase();
  const descLower = result.description.toLowerCase();

  // Every search word must appear somewhere in the searchBlob
  for (const w of words) {
    if (!result.searchBlob.includes(w)) return 0;
  }

  let score = 0;
  for (const w of words) {
    if (titleLower.includes(w)) score += 10;
    if (descLower.includes(w)) score += 3;
    score += 1; // base: word found in body
  }
  // Bonus for exact title match
  if (titleLower === q) score += 50;
  // Bonus for title starts with query
  if (titleLower.startsWith(q)) score += 20;
  return score;
}

/** Run a search across the given index, returning top N matches sorted by relevance. */
export function searchAll(index: SearchResult[], query: string, limit = 30): SearchResult[] {
  const q = query.trim();
  if (!q) return [];
  return index
    .map((r) => ({ r, s: scoreResult(r, q) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ r }) => r);
}

/** Group search results by type for the UI. Returns ordered groups with priority. */
export const TYPE_LABELS: Record<SearchResultType, { label: string; order: number }> = {
  page:       { label: "Pages",         order: 1 },
  film:       { label: "Films",         order: 2 },
  blog:       { label: "Blog posts",    order: 3 },
  lesson:     { label: "DeFi 101",      order: 4 },
  pillar:     { label: "Ecosystem",     order: 5 },
  comparison: { label: "Comparisons",   order: 6 },
  reel:       { label: "Reels",         order: 7 },
  creative:   { label: "Creatives",     order: 8 },
};

export function groupResults(results: SearchResult[]): Array<{ type: SearchResultType; label: string; items: SearchResult[] }> {
  const byType: Record<string, SearchResult[]> = {};
  for (const r of results) {
    if (!byType[r.type]) byType[r.type] = [];
    byType[r.type].push(r);
  }
  return Object.entries(byType)
    .map(([type, items]) => ({ type: type as SearchResultType, label: TYPE_LABELS[type as SearchResultType].label, items }))
    .sort((a, b) => TYPE_LABELS[a.type].order - TYPE_LABELS[b.type].order);
}
