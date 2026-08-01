// sitemap-index.xml — sitemap index pointing to all sub-sitemaps.
//
// The original sitemap.xml was 10 MB and timing out when Google's
// crawler tried to fetch it. This index splits the work into:
//   /sitemap-static.xml — static + SSG pages (~100 URLs, instant)
//   /sitemap-blog.xml   — blog posts (~5000 URLs, API-fetched)
//   /image-sitemap.xml  — image sitemap (already working)
//
// Submit THIS URL to Google Search Console instead of /sitemap.xml.
//
// Reference: https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps

export const dynamic = "force-static";
export const revalidate = 86400; // 24 hours — index rarely changes

const BASE = "https://www.turboloop.tech";

export async function GET() {
  const now = new Date().toISOString().split("T")[0];

  const sitemaps = [
    { loc: `${BASE}/sitemap-static.xml`, lastmod: now },
    { loc: `${BASE}/sitemap-blog.xml`, lastmod: now },
    { loc: `${BASE}/image-sitemap.xml`, lastmod: now },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (s) => `  <sitemap>
    <loc>${s.loc}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
