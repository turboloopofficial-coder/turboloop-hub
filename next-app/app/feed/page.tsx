// /feed → /blog redirect.
// Legacy URL from the SPA. Keep it working so existing shares + bookmarks
// don't 404. Permanent redirect (308) so search engines update the index.

import { permanentRedirect } from "next/navigation";

export default function FeedRedirect() {
  permanentRedirect("/blog");
}
