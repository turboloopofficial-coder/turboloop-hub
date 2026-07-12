// /feed.fr.xml — RSS 2.0 feed for language 'fr'.
// Shared builder lives in @lib/rssFeed.

import { buildRssFeed, RSS_CACHE_HEADER } from "@lib/rssFeed";

export const dynamic = "force-dynamic";
export const revalidate = 600;

export async function GET() {
  const xml = await buildRssFeed("fr");
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": RSS_CACHE_HEADER,
    },
  });
}
