// sitemap-blog.xml — blog posts only (~5000 URLs).
//
// Part of the sitemap index split. Separated from static pages so that
// Google can fetch static pages instantly without waiting for the blog
// API. The blog API call (~6 MB response) is the bottleneck that caused
// the original sitemap.xml to time out during Google's crawl.
//
// Reference: https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps

import {
  api,
  blogTranslationGroup,
  HREFLANG_BY_LANG,
  type BlogPostSummary,
} from "@lib/api";

const BASE = "https://www.turboloop.tech";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function xmlEscape(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const now = new Date().toISOString().split("T")[0];
  const entries: string[] = [];

  try {
    const posts = await api.blogPostsList();
    const publishedById = new Map(
      posts.filter((p) => p.published).map((p) => [p.id, p])
    );

    for (const p of posts.filter((p) => p.published)) {
      const group = blogTranslationGroup(
        p,
        posts as ReadonlyArray<BlogPostSummary & { content: string }>
      );
      const languages: Record<string, string> = {};
      for (const sib of group) {
        if (!publishedById.has(sib.id)) continue;
        const hl = HREFLANG_BY_LANG[sib.language] ?? sib.language;
        languages[hl] = `${BASE}/blog/${sib.slug}`;
      }
      const en = group.find(
        (g) => g.language === "en" && publishedById.has(g.id)
      );
      if (en) languages["x-default"] = `${BASE}/blog/${en.slug}`;

      const lastmod = p.updatedAt
        ? new Date(p.updatedAt).toISOString().split("T")[0]
        : now;

      const hasAlternates = Object.keys(languages).length > 1;
      const langLinks = hasAlternates
        ? Object.entries(languages)
            .map(
              ([hl, href]) =>
                `    <xhtml:link rel="alternate" hreflang="${hl}" href="${xmlEscape(href)}"/>`
            )
            .join("\n")
        : "";

      entries.push(`  <url>
    <loc>${xmlEscape(`${BASE}/blog/${p.slug}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>${hasAlternates ? "\n" + langLinks : ""}
  </url>`);
    }
  } catch (e) {
    // If the blog API fails, return an empty but valid sitemap
    console.error("sitemap-blog.xml: blog API failed", e);
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
