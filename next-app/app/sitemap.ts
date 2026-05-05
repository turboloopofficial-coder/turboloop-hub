// sitemap.xml — generated at build time. Lists every static + SSG route
// so search engines + LLM crawlers can discover the full surface area.

import type { MetadataRoute } from "next";
import { FILMS } from "@lib/cinematicUniverse";
import { ECOSYSTEM_PILLARS } from "@lib/ecosystemPillars";
import { LESSONS } from "@lib/defi101";
import { api } from "@lib/api";

const BASE = "https://turboloop.tech";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Top-level static routes
  const top: MetadataRoute.Sitemap = [
    "",
    "/films",
    "/blog",
    "/community",
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
    "/privacy",
    "/terms",
    "/my-submissions",
  ].map(path => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency:
      path === "" ? "daily" : path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1.0 : path === "/blog" ? 0.9 : 0.7,
  }));

  // Films (20 paths)
  const films: MetadataRoute.Sitemap = FILMS.map(f => ({
    url: `${BASE}/films/${f.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

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

  // Blog posts (build-time fetch from legacy API; if it fails, just skip)
  let blog: MetadataRoute.Sitemap = [];
  try {
    const posts = await api.blogPosts();
    blog = posts
      .filter(p => p.published)
      .map(p => ({
        url: `${BASE}/blog/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: "monthly",
        priority: 0.7,
      }));
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

  return [...top, ...films, ...pillars, ...lessons, ...comparisons, ...blog, ...reels];
}
