// /feed.de.xml — German RSS 2.0 feed.
// Filtered to language='de' posts only; channel title + description in
// German. Shared builder lives in @lib/rssFeed.

import { buildRssFeed, RSS_CACHE_HEADER } from "@lib/rssFeed";

export const revalidate = 600;

export async function GET() {
  const xml = await buildRssFeed("de");
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": RSS_CACHE_HEADER,
    },
  });
}
