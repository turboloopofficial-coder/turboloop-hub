// sitemap.xml — lists every static + SSG route so search engines + LLM
// crawlers can discover the full surface area.
//
// Uses www. canonical host throughout — apex (turboloop.tech) issues a
// platform 307 to www.turboloop.tech before Next.js sees the request,
// so pointing crawlers at www directly saves the redirect hop.
//
// ISR cadence: the sitemap depends on api.blogPosts() which itself has
// a 5-min revalidate. We mirror that here with an explicit revalidate
// export so the sitemap refreshes whenever a new post lands or a
// translation gets added — without this, sitemap.ts would be baked at
// build time and only update on the next deploy.

import type { MetadataRoute } from "next";
import { fetchAllFilmSlugs } from "@lib/filmsApi";
import { ECOSYSTEM_PILLARS } from "@lib/ecosystemPillars";
import { LESSONS } from "@lib/defi101";
import { CAMPAIGN_CATEGORIES } from "@lib/campaignData";
import {
  api,
  blogTranslationGroup,
  HREFLANG_BY_LANG,
  type BlogPost,
} from "@lib/api";

const BASE = "https://www.turboloop.tech";

export const revalidate = 300; // 5 min, matches api.blogPosts() ISR

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Stable-page lastModified — pages whose copy rarely changes get a
  // hardcoded date rather than `now`. This stops crawlers re-fetching
  // them on every sitemap refresh (the sitemap itself revalidates every
  // 5 min because of the blog post fetch upstream). Bump these dates
  // intentionally when the underlying content actually changes.
  const STABLE_PAGE_DATES: Record<string, string> = {
    "/privacy": "2025-01-01",
    "/terms": "2025-01-01",
    "/faq": "2026-01-01",
    "/security": "2026-01-01",
    "/roadmap": "2026-01-01",
  };

  // Top-level static routes
  const top: MetadataRoute.Sitemap = [
    "",
    "/token",
    "/films",
    "/blog",
    "/community",
    "/events",
    "/security",
    "/promotions",
    "/apply",
    "/submit",
    "/library",
    "/creatives",
    "/learn",
    "/ecosystem",
    "/faq",
    "/roadmap",
    "/calculator",
    "/reels",
    "/privacy",
    "/terms",
    "/my-submissions",
    "/careers",
    "/social-wall",
  ].map(path => ({
    url: `${BASE}${path}`,
    lastModified: STABLE_PAGE_DATES[path]
      ? new Date(STABLE_PAGE_DATES[path])
      : now,
    changeFrequency:
      path === "" ? "daily" : path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1.0 : path === "/blog" ? 0.9 : 0.7,
  }));

  // Films — all cinematic videos from DB (original Cinematic Universe
  // + Sovereign Series S2 + any future uploads). Canonical slugs only;
  // each one renders at /films/[slug] (with optional ?lang= for the
  // multilingual variants of the same film).
  let films: MetadataRoute.Sitemap = [];
  try {
    const slugs = await fetchAllFilmSlugs();
    films = slugs.map(slug => ({
      url: `${BASE}/films/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {}

  // Ecosystem pillars (6 paths)
  const pillars: MetadataRoute.Sitemap = ECOSYSTEM_PILLARS.map(p => ({
    url: `${BASE}/ecosystem/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // DeFi 101 lessons
  const lessons: MetadataRoute.Sitemap = LESSONS.map(l => ({
    url: `${BASE}/learn/${l.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Comparison pages
  const comparisons: MetadataRoute.Sitemap = ["banks", "defi", "inflation"].map(
    slug => ({
      url: `${BASE}/vs/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  // /creatives/[category] — 12 pre-rendered sub-pages, one per
  // CAMPAIGN_CATEGORIES entry. Higher priority than blog leaf pages
  // because each surfaces 30-50 downloadable brand assets.
  const campaignPages: MetadataRoute.Sitemap = CAMPAIGN_CATEGORIES.map(cat => ({
    url: `${BASE}/creatives/${cat.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Blog posts (build-time fetch from legacy API; if it fails, just skip).
  //
  // Hreflang annotations: each entry's `alternates.languages` map lists
  // every translation in the same editorial group, keyed by hreflang
  // code. Next.js renders this as `<xhtml:link rel="alternate" hreflang="...">`
  // entries inside the `<url>` block — the W3C standard way to tell
  // Google "these N URLs are the same article in N languages".
  //
  // Without this, Google treats the EN parent and its DE/HI/ID siblings
  // as four unrelated pages competing with each other. With it,
  // Google serves the user's locale-matched version directly from the
  // SERP and consolidates link signals across the group.
  let blog: MetadataRoute.Sitemap = [];
  try {
    const posts = await api.blogPosts();
    const publishedById = new Map(
      posts.filter(p => p.published).map(p => [p.id, p])
    );
    blog = posts
      .filter(p => p.published)
      .map(p => {
        const group = blogTranslationGroup(p, posts);
        const languages: Record<string, string> = {};
        for (const sib of group) {
          if (!publishedById.has(sib.id)) continue;
          const hl = HREFLANG_BY_LANG[sib.language] ?? sib.language;
          languages[hl] = `${BASE}/blog/${sib.slug}`;
        }
        // x-default → the EN original. Falls back to self if no EN
        // parent exists for this group.
        const en = group.find(g => g.language === "en" && publishedById.has(g.id));
        if (en) languages["x-default"] = `${BASE}/blog/${en.slug}`;
        return {
          url: `${BASE}/blog/${p.slug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
          changeFrequency: "monthly" as const,
          priority: 0.7,
          // Only emit the alternates block when the group has more than
          // one entry — for monolingual originals it's unnecessary noise.
          alternates: Object.keys(languages).length > 1 ? { languages } : undefined,
        };
      });
  } catch {}

  // Reels (slugs derived from videos.directUrl)
  let reels: MetadataRoute.Sitemap = [];
  try {
    const videos = await api.videos();
    reels = videos
      .filter(v => v.directUrl)
      .map(v => {
        const slug = (v.directUrl as string).match(
          /\/reels\/([a-z0-9-]+)\.mp4$/i
        )?.[1];
        return slug
          ? {
              url: `${BASE}/reels/${slug}`,
              lastModified: now,
              changeFrequency: "monthly" as const,
              priority: 0.6,
            }
          : null;
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  } catch {}

  // Campaign Suite sub-pages — 12 category pages, each with 30-50 images
  const campaignPages: MetadataRoute.Sitemap = CAMPAIGN_CATEGORIES.map(cat => ({
    url: `${BASE}/creatives/${cat.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...top, ...films, ...pillars, ...lessons, ...comparisons, ...blog, ...reels, ...campaignPages];
}
