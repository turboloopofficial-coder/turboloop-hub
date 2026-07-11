// Shared RSS 2.0 feed builder.
//
// Used by all four /feed.*.xml routes:
//   /feed.xml      — English (default + back-compat with existing
//                    feedreader subscriptions that point at this URL)
//   /feed.de.xml   — German
//   /feed.hi.xml   — Hindi
//   /feed.id.xml   — Indonesian
//
// The English feed is the primary subscription point — splitting by
// language exists so DE/HI/ID-speaking readers can subscribe to a
// single-language feed without mixed-language clutter, and so Google
// Reader equivalents (Feedly, Inoreader, NetNewsWire) can apply the
// correct language hint for spell-check, TTS, and read-aloud.

import { api, BLOG_LANGUAGES, type BlogLanguage, type BlogPost } from "./api";
import { LANGUAGES } from "./languages";

const SITE = "https://www.turboloop.tech";

// ⚡ RSS_LANG and CHANNEL_META derived from languages.ts — no manual updates needed
const RSS_LANG: Record<BlogLanguage, string> = Object.fromEntries(
  Object.values(LANGUAGES).map(l => [l.code, l.bcp47])
) as Record<BlogLanguage, string>;

// ⚡ CHANNEL_META derived from languages.ts — no manual updates needed when adding a language
const CHANNEL_META: Record<BlogLanguage, { title: string; description: string }> =
  Object.fromEntries(
    Object.values(LANGUAGES).map(l => [
      l.code,
      { title: l.rssTitle, description: l.rssDescription }
    ])
  ) as Record<BlogLanguage, { title: string; description: string }>;

function escape(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function selfHrefFor(lang: BlogLanguage): string {
  return lang === "en" ? `${SITE}/feed.xml` : `${SITE}/feed.${lang}.xml`;
}

/** Build an RSS 2.0 XML body for a single-language feed. Filters the
 *  shared post catalogue to the requested language, sorts newest-first
 *  by published date (scheduledPublishAt when set, createdAt fallback),
 *  and caps at 50 items (typical RSS reader display budget).
 *
 *  On API failure, returns a valid feed with zero items rather than
 *  500ing — feedreaders treat an empty channel as "no new items" and
 *  retry on their next poll, which is the right behaviour. */
export async function buildRssFeed(lang: BlogLanguage): Promise<string> {
  let posts: BlogPost[] = [];
  try {
    posts = await api.blogPosts();
  } catch {
    posts = [];
  }

  const items = posts
    .filter(p => p.published && p.language === lang)
    .sort((a, b) => {
      const aT = new Date(a.scheduledPublishAt ?? a.createdAt).getTime();
      const bT = new Date(b.scheduledPublishAt ?? b.createdAt).getTime();
      return bT - aT;
    })
    .slice(0, 50)
    .map(p => {
      const url = `${SITE}/blog/${p.slug}`;
      const date = new Date(
        p.scheduledPublishAt ?? p.createdAt
      ).toUTCString();
      return `
    <item>
      <title>${escape(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${escape(p.excerpt ?? "")}</description>
    </item>`;
    })
    .join("");

  const meta = CHANNEL_META[lang];
  const rssLang = RSS_LANG[lang];
  const selfHref = selfHrefFor(lang);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(meta.title)}</title>
    <link>${SITE}/blog</link>
    <description>${escape(meta.description)}</description>
    <language>${rssLang}</language>
    <atom:link href="${selfHref}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}

export const RSS_CACHE_HEADER =
  "public, s-maxage=600, stale-while-revalidate=86400";

// Re-export the language list so callers can iterate it for routing.
export { BLOG_LANGUAGES };
export type { BlogLanguage };
