// robots.txt — controls what crawlers access. Allows everything except
// admin (which lives at api.turboloop.tech) and the cache-clear utility.
//
// Registers TWO sitemaps:
//   1. /sitemap.xml          — URL sitemap with lastmod for every page
//   2. /image-sitemap.xml    — image sitemap with title + caption per
//                              image, used by Google to associate
//                              images with the right entity (helps
//                              disambiguate from unrelated brands
//                              that have been outranking "turboloop"
//                              in Google Images)
//
// Both are first-class Next.js routes — /sitemap.xml lives at
// app/sitemap.ts (MetadataRoute.Sitemap convention), the image one at
// app/image-sitemap.xml/route.ts (custom GET handler — the image
// sitemap format isn't covered by Next's metadata conventions).

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
      "https://turboloop.tech/sitemap.xml",
      "https://turboloop.tech/image-sitemap.xml",
    ],
    host: "https://turboloop.tech",
  };
}
