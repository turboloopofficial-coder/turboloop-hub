// IndexNow — open protocol for instant URL submission to Bing, Yandex,
// Naver, Seznam, and (via Bing's federation) eventually Google. Free,
// no auth, no SDK. Submit a URL → search engines crawl it within
// minutes instead of waiting for the next sitemap poll.
//
// Why this over the Google Indexing API: the official Indexing API
// ToS restricts it to JobPosting + BroadcastEvent schemas. Using it
// for blog/landing content works until enforcement, at which point
// the project key gets suspended. IndexNow is officially open for
// any URL, no restrictions.
//
// Verification: the search engines GET
//   https://www.turboloop.tech/<KEY>.txt
// expecting the file body to equal the key string exactly. We ship
// that file in next-app/public/.
//
// Submission: POST https://api.indexnow.org/IndexNow with JSON
//   { host, key, keyLocation, urlList }
// `keyLocation` lets us host the key file at a non-root path if
// needed; we keep it root-level so it stays simple.

const INDEXNOW_KEY = "7f3a9c2e1b8d4f6a5e0c3b9d2f7a1e8c";
const HOST = "www.turboloop.tech";
const ENDPOINT = "https://api.indexnow.org/IndexNow";
// IndexNow caps at 10,000 URLs per request. We won't hit that on a
// per-cron-tick basis, but the constant exists for safety.
const MAX_URLS_PER_REQUEST = 10000;

export interface IndexNowResult {
  ok: boolean;
  status: number;
  submitted: number;
  message?: string;
}

/** Submit one or more URLs to IndexNow. Returns the HTTP status from
 *  api.indexnow.org. Treats any 2xx as success; 422 means the URL list
 *  was rejected (commonly: URLs not on the declared host). Never
 *  throws — failure modes are visible in the returned object so the
 *  caller can log without try/catch noise. */
export async function pingIndexNow(
  urls: string[]
): Promise<IndexNowResult> {
  // Filter to host-matching URLs only — IndexNow rejects the whole
  // batch if any URL is off-host. Defensive against accidental
  // localhost / staging URLs in cron output.
  const filtered = urls.filter(u => {
    try {
      const h = new URL(u).host;
      return h === HOST;
    } catch {
      return false;
    }
  });

  if (filtered.length === 0) {
    return { ok: true, status: 0, submitted: 0, message: "no urls" };
  }

  const batch = filtered.slice(0, MAX_URLS_PER_REQUEST);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: batch,
      }),
    });

    return {
      ok: res.ok,
      status: res.status,
      submitted: batch.length,
      message: res.ok ? undefined : await res.text().catch(() => undefined),
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      submitted: 0,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Convenience: ping a single blog post URL. */
export async function pingBlogPost(slug: string): Promise<IndexNowResult> {
  return pingIndexNow([`https://${HOST}/blog/${slug}`]);
}

/** Convenience: ping a reel detail URL. */
export async function pingReel(slug: string): Promise<IndexNowResult> {
  return pingIndexNow([`https://${HOST}/reels/${slug}`]);
}

/** Convenience: ping a film detail URL. */
export async function pingFilm(slug: string): Promise<IndexNowResult> {
  return pingIndexNow([`https://${HOST}/films/${slug}`]);
}
