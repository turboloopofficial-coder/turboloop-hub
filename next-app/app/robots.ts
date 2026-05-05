// robots.txt — controls what crawlers access. Allows everything except
// admin (which lives at api.turboloop.tech) and the cache-clear utility.

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
    sitemap: "https://turboloop.tech/sitemap.xml",
    host: "https://turboloop.tech",
  };
}
