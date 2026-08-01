// sitemap-static.xml — static pages only (no API calls, instant response).
//
// Part of the sitemap index split. The full sitemap.xml was 10 MB and
// timing out when Google's crawler tried to fetch it. Splitting into:
//   /sitemap-index.xml  — index pointing to sub-sitemaps
//   /sitemap-static.xml — this file: all static + SSG pages (~100 URLs, <5 KB)
//   /sitemap-blog.xml   — blog posts only (~5000 URLs, fetched from API)
//
// Reference: https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps

import { fetchAllFilmSlugs } from "@lib/filmsApi";
import { ECOSYSTEM_PILLARS } from "@lib/ecosystemPillars";
import { LESSONS } from "@lib/defi101";
import { CAMPAIGN_CATEGORIES } from "@lib/campaignData";
import { COMPARISONS } from "@lib/comparisons";
import { LOCALES } from "@lib/i18n/routing";

const BASE = "https://www.turboloop.tech";
const NON_EN_LOCALES = LOCALES.filter((l: string) => l !== "en");
const LOCALIZED_PAGES = ["", "/calculator", "/faq", "/apply", "/token"];

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function xmlEscape(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function urlEntry(url: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${xmlEscape(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export async function GET() {
  const now = new Date().toISOString().split("T")[0];

  const STABLE_PAGE_DATES: Record<string, string> = {
    "/privacy": "2025-01-01",
    "/terms": "2025-01-01",
    "/faq": "2026-01-01",
    "/security": "2026-01-01",
    "/roadmap": "2026-01-01",
  };

  const entries: string[] = [];

  // Localized pages with hreflang
  for (const path of LOCALIZED_PAGES) {
    const langs = [
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(`${BASE}${path || "/"}`)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(`${BASE}${path || "/"}`)}"/>`,
      ...NON_EN_LOCALES.map((locale: string) =>
        `    <xhtml:link rel="alternate" hreflang="${locale}" href="${xmlEscape(`${BASE}/${locale}${path || "/"}`)}"/>`
      ),
    ].join("\n");
    const prio = path === "" ? "1.0" : "0.8";
    const freq = path === "" ? "daily" : "monthly";
    entries.push(`  <url>
    <loc>${xmlEscape(`${BASE}${path || "/"}`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${prio}</priority>
${langs}
  </url>`);
    for (const locale of NON_EN_LOCALES) {
      entries.push(`  <url>
    <loc>${xmlEscape(`${BASE}/${locale}${path || "/"}`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${path === "" ? "0.9" : "0.75"}</priority>
${langs}
  </url>`);
    }
  }

  // Top-level static routes (not localized)
  const staticPaths = [
    "/blog", "/films", "/community", "/events", "/security", "/promotions",
    "/submit", "/library", "/creatives", "/learn", "/ecosystem", "/reels",
    "/podcast", "/privacy", "/terms", "/my-submissions", "/careers", "/social-wall",
  ];
  for (const path of staticPaths) {
    const lastmod = STABLE_PAGE_DATES[path] ?? now;
    const prio = path === "/blog" ? "0.9" : path === "/podcast" ? "0.85" : "0.7";
    const freq = path === "/blog" || path === "/podcast" ? "weekly" : "monthly";
    entries.push(urlEntry(`${BASE}${path}`, lastmod, freq, prio));
  }

  // Earn programmatic SEO pages
  const earnPaths = [
    "/earn/automated-crypto-earnings",
    "/earn/best-defi-yield-2026",
    "/earn/crypto-income-without-trading",
    "/earn/defi-passive-income-beginners",
    "/earn/pancakeswap-v3-yield-optimization",
    "/earn/passive-income-with-bnb",
    "/earn/turboloop-vs-pancakeswap",
    "/earn/usdt-yield-bsc",
  ];
  for (const path of earnPaths) {
    entries.push(urlEntry(`${BASE}${path}`, now, "weekly", "0.8"));
  }

  // Films
  try {
    const slugs = await fetchAllFilmSlugs();
    for (const slug of slugs) {
      entries.push(urlEntry(`${BASE}/films/${slug}`, now, "monthly", "0.8"));
    }
  } catch {}

  // Ecosystem pillars
  for (const p of ECOSYSTEM_PILLARS) {
    entries.push(urlEntry(`${BASE}/ecosystem/${p.slug}`, now, "monthly", "0.7"));
  }

  // DeFi 101 lessons
  for (const l of LESSONS) {
    entries.push(urlEntry(`${BASE}/learn/${l.slug}`, now, "monthly", "0.6"));
  }

  // Comparison pages
  entries.push(urlEntry(`${BASE}/vs`, now, "monthly", "0.7"));
  for (const c of COMPARISONS) {
    entries.push(urlEntry(`${BASE}/vs/${c.slug}`, now, "monthly", "0.7"));
  }

  // Campaign suite pages
  for (const cat of CAMPAIGN_CATEGORIES) {
    entries.push(urlEntry(`${BASE}/creatives/${cat.id}`, now, "weekly", "0.8"));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
