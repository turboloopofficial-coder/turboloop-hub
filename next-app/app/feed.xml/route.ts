// /feed.xml — English RSS 2.0 feed (canonical / back-compat).
//
// Existing feedreader subscriptions point at this URL — keeping the
// English feed at the unqualified path means we don't break any
// reader who subscribed before the multilingual split. New per-
// language feeds live at /feed.de.xml, /feed.hi.xml, /feed.id.xml.
//
// All four routes share the same builder in @lib/rssFeed so a change
// to the channel shape (e.g. adding atom:link variants, GUID format)
// flows to every language at once.

import { buildRssFeed, RSS_CACHE_HEADER } from "@lib/rssFeed";

export const revalidate = 600;

export async function GET() {
  const xml = await buildRssFeed("en");
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": RSS_CACHE_HEADER,
    },
  });
}
