// robots.txt — controls what crawlers access. Allows everything except
// admin (which lives at api.turboloop.tech) and the cache-clear utility.
//
// Registers THREE sitemaps:
//   1. /sitemap-index.xml    — sitemap index (primary; points to sub-sitemaps)
//   2. /sitemap.xml          — legacy full sitemap (kept for backward compat)
//   3. /image-sitemap.xml    — image sitemap with title + caption per
//                              image, used by Google to associate
//                              images with the right entity (helps
//                              disambiguate from unrelated brands
//                              that have been outranking "turboloop"
//                              in Google Images)
//
// The sitemap-index.xml was added because the original sitemap.xml was
// 10 MB and timing out when Google's crawler tried to fetch it. The
// index splits it into /sitemap-static.xml (fast, no API calls) and
// /sitemap-blog.xml (blog posts only, API-fetched separately).
//
// Routes: app/sitemap-index.xml/route.ts, app/sitemap-static.xml/route.ts,
//         app/sitemap-blog.xml/route.ts, app/image-sitemap.xml/route.ts

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: [
      "https://www.turboloop.tech/sitemap-index.xml",
      "https://www.turboloop.tech/sitemap.xml",
      "https://www.turboloop.tech/image-sitemap.xml",
    ],
    host: "https://www.turboloop.tech",
  };
}
